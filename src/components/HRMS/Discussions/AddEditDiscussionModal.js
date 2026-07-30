import React, { Component } from 'react';
import Select from 'react-select';
import Button from '../../common/formInputs/Button';

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
            let rawParts = discussion.participants || [];
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
                .map(p => Number(typeof p === 'object' && p !== null ? p.id || p.value : p))
                .filter(Boolean);

            const selectedParts = empList
                .filter(emp => numericParts.includes(Number(emp.id)))
                .map(emp => ({
                    value: emp.id,
                    label: `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || emp.email || `User #${emp.id}`
                }));

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
            errors: { ...this.state.errors, [name]: '' }
        });
    };

    handleParticipantChange = (selectedOptions) => {
        this.setState({
            selectedParticipants: selectedOptions || [],
            errors: { ...this.state.errors, participants: '' }
        });
    };

    validate = () => {
        const errors = {};
        if (!this.state.title.trim()) {
            errors.title = 'Title is required';
        }
        // if (!this.state.description.trim()) {
        //     errors.description = 'Description is required';
        // }
        this.setState({ errors });
        return Object.keys(errors).length === 0;
    };

    handleSubmit = (e) => {
        e.preventDefault();
        if (!this.validate()) return;

        const participantIds = this.state.selectedParticipants.map(item => Number(item.value));

        const payload = {
            id: this.state.id,
            title: this.state.title.trim(),
            description: this.state.description.trim(),
            conclusion: this.state.conclusion.trim(),
            participants: participantIds,
        };

        this.props.onSubmit(payload);
    };

    render() {
        const { show, onClose, isEditing, isLoading, employees = [] } = this.props;
        const { title, description, conclusion, selectedParticipants, errors } = this.state;

        if (!show) return null;

        const empList = Array.isArray(employees) ? employees : [];
        const participantOptions = empList.map(emp => ({
            value: emp.id,
            label: `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || emp.email || `User #${emp.id}`
        }));

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
                                            className="basic-multi-select"
                                            classNamePrefix="select"
                                        />
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
                                <div className="modal-footer bg-light">
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
