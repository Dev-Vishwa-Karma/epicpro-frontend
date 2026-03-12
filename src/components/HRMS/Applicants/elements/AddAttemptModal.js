import React, { useState, useEffect } from 'react';
import Button from '../../../common/formInputs/Button';
import InputField from '../../../common/formInputs/InputField';
import { getService } from '../../../../services/getService';
import { validateFields } from '../../../common/validations';

const AddAttemptModal = ({
    show,
    onClose,
    applicant,
    onSuccess,
    onAddAttempt,
    attempt,
    onUpdateAttempt
}) => {
    const [formData, setFormData] = useState({
        applied_date: '',
        contacted_date: '',
        interview_date: '',
        result: 'pending',
        comments: ''
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (show) {
            if (attempt) {
                setFormData({
                    applied_date: attempt.applied_date || '',
                    contacted_date: attempt.contacted_date || '',
                    interview_date: attempt.interview_date || '',
                    result: attempt.result || 'pending',
                    comments: attempt.comments || ''
                });
            } else {
                setFormData({
                    applied_date: '',
                    contacted_date: '',
                    interview_date: '',
                    result: 'pending',
                    comments: ''
                });
            }
            setErrors({});
            setError('');
        }
    }, [show, attempt]);

    if (!show || !applicant) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const validationSchema = [
            { name: 'applied_date', value: formData.applied_date, type: 'date', required: true, messageName: 'Applied On' },
        ];
        const formErrors = validateFields(validationSchema);
        setErrors(formErrors);
        return Object.keys(formErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setSubmitting(true);
        setError('');

        const payload = new FormData();
        if (attempt) {
            payload.append('id', attempt.id);
        }
        payload.append('applicant_id', applicant.id);
        payload.append('applied_date', formData.applied_date);
        payload.append('contacted_date', formData.contacted_date);
        payload.append('interview_date', formData.interview_date);
        payload.append('result', formData.result);
        payload.append('comments', formData.comments);

        const action = attempt ? (onUpdateAttempt || (() => getService.addCall('applicants.php', 'update_attempt', payload))) : onAddAttempt;

        if (action) {
            const promise = attempt && !onUpdateAttempt ? action() : action(payload);
            promise
                .then(response => {
                    onSuccess();
                    onClose();
                })
                .catch(err => {
                    setError(err.message || 'An error occurred');
                })
                .finally(() => {
                    setSubmitting(false);
                });
        } else {
            // Fallback for direct call
            const actionPath = attempt ? 'update_attempt' : 'add_attempt';
            getService.addCall('applicants.php', actionPath, payload)
                .then(response => {
                    if (response.status === 'success') {
                        onSuccess();
                        onClose();
                    } else {
                        setError(response.data?.message || 'Failed to save attempt');
                    }
                })
                .catch(err => {
                    setError(err.message || 'An error occurred');
                })
                .finally(() => {
                    setSubmitting(false);
                });
        }
    };

    return (
        <>
            <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1} role="dialog" aria-modal="true">
                <div className="modal-dialog modal-lg" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{attempt ? 'Edit' : 'Add'} Attempt for {applicant.fullname}</h5>
                            <button
                                type="button"
                                className="close"
                                aria-label="Close"
                                onClick={onClose}
                                disabled={submitting}
                            >
                                <span aria-hidden="true">×</span>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                {error && <div className="alert alert-danger">{error}</div>}
                                <div className="row">
                                    <div className="col-md-4">
                                        <InputField
                                            label={<span>Applied On <span className="text-danger">*</span></span>}
                                            name="applied_date"
                                            type="date"
                                            value={formData.applied_date}
                                            onChange={handleChange}
                                            error={errors.applied_date}
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <InputField
                                            label="Contacted On"
                                            name="contacted_date"
                                            type="date"
                                            value={formData.contacted_date}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <InputField
                                            label="Interviewed On"
                                            name="interview_date"
                                            type="date"
                                            value={formData.interview_date}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6">
                                        <InputField
                                            label="Result"
                                            name="result"
                                            type="select"
                                            value={formData.result}
                                            onChange={handleChange}
                                            options={[
                                                { value: 'hired', label: 'Hired' },
                                                { value: 'rejected', label: 'Rejected' },
                                                { value: 'blacklisted', label: 'Blacklisted' },
                                                { value: 'pending', label: 'Pending' },
                                                { value: 'reviewed', label: 'Reviewed' },
                                                { value: 'interviewed', label: 'Interviewed' },
                                                { value: 'noresponse', label: 'No Response' }
                                            ]}
                                            firstOption={false}
                                        />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12">
                                        <InputField
                                            label="Comments"
                                            name="comments"
                                            type="textarea"
                                            rows={3}
                                            value={formData.comments}
                                            onChange={handleChange}
                                            placeholder="Enter comments here..."
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <Button
                                    label="Cancel"
                                    onClick={onClose}
                                    className="btn-secondary"
                                    disabled={submitting}
                                />
                                <Button
                                    label={attempt ? "Update Attempt" : "Save Attempt"}
                                    type="submit"
                                    className="btn-primary"
                                    disabled={submitting}
                                    loading={submitting}
                                />
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop fade show" />
        </>
    );
};

export default AddAttemptModal;
