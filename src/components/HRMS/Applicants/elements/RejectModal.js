import React from 'react';
import Button from '../../../common/formInputs/Button';

const RejectModal = ({ 
    show, 
    rejectReason, 
    onReasonChange, 
    onConfirm, 
    onCancel, 
    isUpdating = false 
}) => {
    if (!show) return null;

    return (
        <>
            <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1} role="dialog" aria-modal="true">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Rejection Reason</h5>
                            <button 
                                type="button" 
                                className="close" 
                                aria-label="Close" 
                                onClick={onCancel}
                                disabled={isUpdating}
                            >
                                <span aria-hidden="true">×</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Please provide a reason for rejection</label>
                                <textarea 
                                    className="form-control" 
                                    rows={3} 
                                    value={rejectReason} 
                                    onChange={onReasonChange} 
                                    placeholder="Enter reason"
                                    disabled={isUpdating}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <Button
                                label="Cancel"
                                onClick={onCancel}
                                className="btn-secondary"
                                disabled={isUpdating}
                            />
                            <Button
                                label="Reject"
                                onClick={onConfirm}
                                className="btn-danger"
                                disabled={isUpdating || !rejectReason.trim()}
                                loading={isUpdating}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop fade show" />
        </>
    );
};

export default RejectModal; 