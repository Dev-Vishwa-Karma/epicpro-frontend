import React, { Component } from 'react';
import Select from 'react-select';
import Button from '../../common/formInputs/Button';
import InputField from '../../common/formInputs/InputField';
import authService from '../../Authentication/authService';
import cryptoService from '../../../services/cryptoService';

class AddEditDiscussionModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: null,
            title: '',
            description: '',
            conclusion: '',
            selectedParticipants: [],
            errors: {},
        };
    }

    componentDidMount() {
        this.populateFormData();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.discussion !== this.props.discussion || prevProps.show !== this.props.show) {
            this.populateFormData();
        }
    }

    populateFormData = () => {
        const { discussion, employees = [] } = this.props;
        const empList = Array.isArray(employees) ? employees : [];

        if (discussion) {
            let rawParts = discussion.participant_details || discussion.participants || [];
            if (typeof rawParts === 'string') {
                try {
                    rawParts = JSON.parse(rawParts);
                } catch (e) {
                    rawParts = rawParts.split(',').map(v => v.trim());
                }
            }
            if (!Array.isArray(rawParts)) {
                rawParts = [rawParts];
            }
            const numericParts = rawParts
                .map(p => Number(typeof p === 'object' && p !== null ? p.user_id || p.id || p.value : p))
                .filter(Boolean);

            const creatorId = Number(discussion.created_by);
            const selectedParts = empList
                .filter(emp => numericParts.includes(Number(emp.id)) && Number(emp.id) !== creatorId)
                .map(emp => {
                    const hasKey = emp.public_key && emp.public_key.trim();
                    const fullName = `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || emp.email || `User #${emp.id}`;
                    return {
                        value: emp.id,
                        label: hasKey ? fullName : `${fullName} (No E2EE Key)`,
                        isDisabled: !hasKey
                    };
                });

            this.setState({
                id: discussion.id || null,
                title: discussion.title || '',
                description: discussion.description || '',
                conclusion: discussion.conclusion || '',
                selectedParticipants: selectedParts,
                errors: {},
            });
        } else {
            this.setState({
                id: null,
                title: '',
                description: '',
                conclusion: '',
                selectedParticipants: [],
                errors: {},
            });
        }
    };

    handleInputChange = (e) => {
        const { name, value } = e.target;
        this.setState({
            [name]: value,
            errors: { ...this.state.errors, [name]: '', general: '' }
        });
    };

    handleParticipantChange = (selectedOptions) => {
        const selected = selectedOptions || [];
        const { employees = [] } = this.props;
        const currentUser = authService.getUser();
        const missingKeys = [];

        selected.forEach(item => {
            const empId = Number(item.value);
            if (currentUser && Number(empId) === Number(currentUser.id)) return;
            const emp = employees.find(e => Number(e.id) === empId);
            if (!emp || !emp.public_key || !emp.public_key.trim()) {
                const name = item.label ? item.label.replace(/\s*\(No E2EE Key\)/i, '') : `User #${empId}`;
                missingKeys.push(name);
            }
        });

        const participantError = missingKeys.length > 0
            ? `User(s) without E2EE key cannot be added: ${missingKeys.join(', ')}`
            : '';

        this.setState({
            selectedParticipants: selected,
            errors: { ...this.state.errors, participants: participantError, general: '' }
        });
    };

    validate = () => {
        const errors = {};
        if (!this.state.title.trim()) {
            errors.title = 'Title is required';
        }

        const { employees = [] } = this.props;
        const currentUser = authService.getUser();
        const selected = this.state.selectedParticipants || [];
        const missingKeys = [];

        selected.forEach(item => {
            const empId = Number(item.value);
            if (currentUser && Number(empId) === Number(currentUser.id)) return;
            const emp = employees.find(e => Number(e.id) === empId);
            if (!emp || !emp.public_key || !emp.public_key.trim()) {
                const name = item.label ? item.label.replace(/\s*\(No E2EE Key\)/i, '') : `User #${empId}`;
                missingKeys.push(name);
            }
        });

        if (missingKeys.length > 0) {
            errors.participants = `Selected participant(s) (${missingKeys.join(', ')}) do not have an E2EE public key configured.`;
        }

        this.setState({ errors });
        return Object.keys(errors).length === 0;
    };

    handleSubmit = async (e) => {
        e.preventDefault();
        if (!this.validate()) return;

        const { employees = [], discussion } = this.props;
        const currentUser = authService.getUser();
        if (!currentUser || !currentUser.id) return;

        const currentUserId = Number(currentUser.id);
        const creatorId = discussion?.created_by ? Number(discussion.created_by) : currentUserId;

        const selected = this.state.selectedParticipants || [];
        const participantIdsSet = new Set(selected.map(item => Number(item.value)));
        participantIdsSet.add(creatorId);
        participantIdsSet.add(currentUserId);

        const participantIds = Array.from(participantIdsSet);

        // Build participants public key map (creator + editor + participants)
        const participantsPublicKeysMap = {};
        const missingKeys = [];

        participantIds.forEach(empId => {
            let pubKey = '';
            if (empId === currentUserId && currentUser.public_key) {
                pubKey = currentUser.public_key.trim();
            }
            if (!pubKey) {
                const emp = employees.find(e => Number(e.id) === empId);
                if (emp && emp.public_key && emp.public_key.trim()) {
                    pubKey = emp.public_key.trim();
                }
            }

            if (pubKey) {
                participantsPublicKeysMap[empId] = pubKey;
            } else {
                const emp = employees.find(e => Number(e.id) === empId);
                const name = emp ? `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || emp.email : `User #${empId}`;
                missingKeys.push(name);
            }
        });

        if (missingKeys.length > 0) {
            this.setState({
                errors: {
                    ...this.state.errors,
                    general: `Participant(s) without E2EE key configured: ${missingKeys.join(', ')}`
                }
            });
            return;
        }

        try {
            // Encrypt discussion details using hybrid AES-GCM + RSA-OAEP
            const encrypted = await cryptoService.encryptDiscussionDetails(
                {
                    title: this.state.title.trim(),
                    description: this.state.description.trim(),
                    conclusion: this.state.conclusion.trim(),
                },
                participantsPublicKeysMap
            );

            // Construct participant items containing their wrapped AES key
            const participantsPayload = participantIds.map(pId => ({
                user_id: pId,
                role: pId === creatorId ? 'creator' : 'participant',
                encrypted_key: encrypted.encryptedKeys[pId] || null
            }));

            const payload = {
                id: this.state.id,
                title: encrypted.title,
                description: encrypted.description,
                conclusion: encrypted.conclusion,
                is_encrypted: 1,
                participants: participantsPayload,
            };

            this.props.onSubmit(payload);
        } catch (err) {
            console.error('Discussion encryption failed:', err);
            this.setState({
                errors: {
                    ...this.state.errors,
                    general: 'Encryption failed. Please try again or re-initialize your E2EE keys.'
                }
            });
        }
    };

    render() {
        const { show, onClose, isEditing, isLoading, employees = [] } = this.props;
        const { title, description, conclusion, selectedParticipants, errors } = this.state;

        if (!show) return null;

        const currentUser = authService.getUser();
        const empList = Array.isArray(employees) ? employees : [];
        const participantOptions = empList.filter(emp => Number(emp.id) !== Number(currentUser.id)).map(emp => {
            const hasKey = emp.public_key && emp.public_key.trim();
            const fullName = `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || emp.email || `User #${emp.id}`;
            return {
                value: emp.id,
                label: hasKey ? fullName : `${fullName} (No E2EE Key)`,
                isDisabled: !hasKey
            };
        });

        return (
            <>
                <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1} role="dialog" aria-modal="true">
                    <div className="modal-dialog modal-lg" role="document">
                        <div className="modal-content" style={{ borderRadius: '8px' }}>
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title text-white">
                                    <i className={isEditing ? "fa fa-pencil mr-2" : "fa fa-plus-circle mr-2"}></i>
                                    {isEditing ? 'Edit Discussion' : 'Create New Discussion'}
                                </h5>
                                <button type="button" className="close text-white" onClick={onClose} aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <form onSubmit={this.handleSubmit}>
                                <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                                    {errors.general && (
                                        <div className="alert alert-danger mb-3 py-2 px-3 small">
                                            <i className="fa fa-exclamation-triangle mr-2"></i>
                                            {errors.general}
                                        </div>
                                    )}

                                    <InputField
                                        label="Title *"
                                        name="title"
                                        required
                                        placeholder="Enter discussion title..."
                                        value={title}
                                        onChange={this.handleInputChange}
                                        error={errors.title}
                                        containerClassName="mb-3"
                                    />

                                    <div className="form-group mb-3">
                                        <label className="form-label font-weight-bold">
                                            Participants (Multiselect)
                                        </label>
                                        <Select
                                            isMulti
                                            options={participantOptions}
                                            value={selectedParticipants}
                                            onChange={this.handleParticipantChange}
                                            placeholder="Select participants..."
                                            className={`basic-multi-select ${errors.participants ? 'is-invalid' : ''}`}
                                            classNamePrefix="select"
                                        />
                                        {errors.participants && (
                                            <div className="text-danger small mt-1">
                                                <i className="fa fa-shield mr-1"></i>
                                                {errors.participants}
                                            </div>
                                        )}
                                    </div>

                                    <InputField
                                        type="textarea"
                                        label="Description (Optional)"
                                        name="description"
                                        rows={5}
                                        placeholder="Enter discussion agenda or details..."
                                        value={description}
                                        onChange={this.handleInputChange}
                                        error={errors.description}
                                        containerClassName="mb-3"
                                    />

                                    <InputField
                                        type="textarea"
                                        label="Conclusion (Optional)"
                                        name="conclusion"
                                        rows={3}
                                        placeholder="Enter final decision or conclusion..."
                                        value={conclusion}
                                        onChange={this.handleInputChange}
                                        containerClassName="mb-3"
                                    />
                                </div>
                                <div className="modal-footer bg-white">
                                    <Button
                                        type="button"
                                        label="Cancel"
                                        onClick={onClose}
                                        className="btn-secondary"
                                    />
                                    <Button
                                        type="submit"
                                        label={isEditing ? "Save Changes" : "Create Discussion"}
                                        className="btn-primary"
                                        disabled={isLoading}
                                        loading={isLoading}
                                    />
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <div className="modal-backdrop fade show" />
            </>
        );
    }
}

export default AddEditDiscussionModal;
