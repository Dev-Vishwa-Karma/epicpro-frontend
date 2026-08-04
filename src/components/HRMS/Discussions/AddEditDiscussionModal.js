import React, { Component } from 'react';
import Select from 'react-select';
import Button from '../../common/formInputs/Button';
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

    unwrapFieldValue = (val) => {
        if (!val || typeof val !== 'string') return val || '';
        if (val.trim().startsWith('{')) {
            try {
                const parsed = JSON.parse(val);
                if (parsed && typeof parsed.data !== 'undefined') {
                    return parsed.data;
                }
            } catch (e) { }
        }
        return val;
    };

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

            const selectedParts = empList
                .filter(emp => numericParts.includes(Number(emp.id)) && Number(emp.id) !== Number(discussion.created_by))
                .map(emp => {
                    const hasKey = emp.public_key && emp.public_key.trim();
                    const fullName = `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || emp.email || `User #${emp.id}`;
                    return {
                        value: emp.id,
                        label: hasKey ? fullName : `${fullName} (No E2EE Key)`
                    };
                });

            const pendingNotice = this.checkPendingKeys(selectedParts);

            this.setState({
                id: discussion.id || null,
                title: this.unwrapFieldValue(discussion.title),
                description: this.unwrapFieldValue(discussion.description),
                conclusion: this.unwrapFieldValue(discussion.conclusion),
                selectedParticipants: selectedParts,
                pendingNotice: pendingNotice,
                errors: {},
            });
        } else {
            const pendingNotice = this.checkPendingKeys([]);
            this.setState({
                id: null,
                title: '',
                description: '',
                conclusion: '',
                selectedParticipants: [],
                pendingNotice: pendingNotice,
                errors: {},
            });
        }
    };

    checkPendingKeys = (selectedParticipantsList) => {
        const { employees = [] } = this.props;
        const currentUser = authService.getUser();

        const selected = selectedParticipantsList || [];
        const missingKeysParticipants = [];

        // 1. Check Creator Public Key (Non-blocking notice)
        let creatorHasPublicKey = true;
        if (currentUser) {
            const creatorEmp = employees.find(e => Number(e.id) === Number(currentUser.id));
            const creatorPublicKey = creatorEmp?.public_key || currentUser?.public_key;
            if (!creatorPublicKey || !creatorPublicKey.trim()) {
                creatorHasPublicKey = false;
            }
        }

        if (!creatorHasPublicKey) {
            return 'You (Creator) do not have an E2EE public key configured. This discussion will be stored in unencrypted format.';
        }

        // 2. Check Participants Public Keys (Non-blocking notice)
        selected.forEach(item => {
            const empId = Number(item.value);
            if (currentUser && Number(empId) === Number(currentUser.id)) return;
            const emp = employees.find(e => Number(e.id) === empId);
            if (!emp || !emp.public_key || !emp.public_key.trim()) {
                const name = item.label ? item.label.replace(/\s*\(No E2EE Key\)/i, '') : `User #${empId}`;
                missingKeysParticipants.push(name);
            }
        });

        if (missingKeysParticipants.length > 0) {
            return `The following users (${missingKeysParticipants.join(', ')}) have not set up E2EE encryption keys yet. Discussion will still be created/saved, and E2EE access will be granted automatically as soon as they set up E2EE keys and a keyholder views the discussion.`;
        }
        return '';
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
        const pendingNotice = this.checkPendingKeys(selected);
        this.setState({
            selectedParticipants: selected,
            pendingNotice: pendingNotice,
            errors: { ...this.state.errors, participants: '', general: '' }
        });
    };

    validate = () => {
        const errors = {};
        if (!this.state.title.trim()) {
            errors.title = 'Title is required';
        }

        const pendingNotice = this.checkPendingKeys(this.state.selectedParticipants);

        this.setState({ errors, pendingNotice });
        return Object.keys(errors).length === 0;
    };

    handleSubmit = async (e) => {
        e.preventDefault();
        if (!this.validate()) return;

        const { employees = [] } = this.props;
        const currentUser = authService.getUser();

        let creatorPublicKey = null;
        if (currentUser) {
            const creatorEmp = employees.find(e => Number(e.id) === Number(currentUser.id));
            creatorPublicKey = (creatorEmp?.public_key || currentUser?.public_key || '').trim();
        }

        const selected = this.state.selectedParticipants || [];
        const participantIds = selected.map(item => Number(item.value));
        if (currentUser && !participantIds.includes(Number(currentUser.id))) {
            participantIds.push(Number(currentUser.id));
        }

        // If creator does NOT have a public key, store discussion in unencrypted format as JSON formatted strings
        if (!creatorPublicKey) {
            const formatUnencryptedJSONField = (text) => {
                const trimmed = (text || '').trim();
                if (!trimmed) return undefined;
                return JSON.stringify({
                    data: trimmed,
                    iv: ''
                });
            };

            const participantsPayload = participantIds.map(pId => ({
                user_id: pId,
                role: (currentUser && Number(pId) === Number(currentUser.id)) ? 'creator' : 'participant',
                encrypted_key: null
            }));

            const payload = {
                id: this.state.id,
                title: formatUnencryptedJSONField(this.state.title),
                description: formatUnencryptedJSONField(this.state.description),
                conclusion: formatUnencryptedJSONField(this.state.conclusion),
                is_encrypted: 0,
                participants: participantsPayload,
            };

            this.props.onSubmit(payload);
            return;
        }

        // Build participants public key map (creator + participants)
        const participantsPublicKeysMap = {};
        participantsPublicKeysMap[currentUser.id] = creatorPublicKey;

        selected.forEach(item => {
            const empId = Number(item.value);
            const emp = employees.find(e => Number(e.id) === empId);
            if (emp && emp.public_key) {
                participantsPublicKeysMap[empId] = emp.public_key;
            }
        });

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
                role: (currentUser && Number(pId) === Number(currentUser.id)) ? 'creator' : 'participant',
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
        const { title, description, conclusion, selectedParticipants, errors, pendingNotice } = this.state;

        if (!show) return null;

        const currentUser = authService.getUser();
        const empList = Array.isArray(employees) ? employees : [];
        const participantOptions = empList.filter(emp => Number(emp.id) !== Number(currentUser.id)).map(emp => {
            const hasKey = emp.public_key && emp.public_key.trim();
            const fullName = `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || emp.email || `User #${emp.id}`;
            return {
                value: emp.id,
                label: hasKey ? fullName : `${fullName} (No E2EE Key)`
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

                                    <div className="form-group mb-3">
                                        <label className="form-label font-weight-bold">
                                            Title <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                                            name="title"
                                            placeholder="Enter discussion title..."
                                            value={title}
                                            onChange={this.handleInputChange}
                                        />
                                        {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                                    </div>

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
                                        {pendingNotice && (
                                            <div className="alert alert-info mb-0 mt-2 py-2 px-3 small" style={{ backgroundColor: '#e0f2fe', borderColor: '#bae6fd', color: '#0369a1' }}>
                                                <i className="fa fa-info-circle mr-2"></i>
                                                {pendingNotice}
                                            </div>
                                        )}
                                    </div>

                                    <div className="form-group mb-3">
                                        <label className="form-label font-weight-bold">
                                            Description (Optional)
                                        </label>
                                        <textarea
                                            className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                                            name="description"
                                            rows="5"
                                            placeholder="Enter discussion agenda or details..."
                                            value={description}
                                            onChange={this.handleInputChange}
                                        />
                                        {errors.description && <div className="invalid-feedback">{errors.description}</div>}
                                    </div>

                                    <div className="form-group mb-3">
                                        <label className="form-label font-weight-bold">
                                            Conclusion (Optional)
                                        </label>
                                        <textarea
                                            className="form-control"
                                            name="conclusion"
                                            rows="3"
                                            placeholder="Enter final decision or conclusion..."
                                            value={conclusion}
                                            onChange={this.handleInputChange}
                                        />
                                    </div>
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
