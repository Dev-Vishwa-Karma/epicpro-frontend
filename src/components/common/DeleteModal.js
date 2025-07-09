import React from 'react';

const DeleteModal = ({ show, onConfirm, isLoading, onClose, deleteBody, modalId }) => {
    if (!show) return null;
  
    return (
        <div
            className="modal fade show"
            style={{ display: 'block' }}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
        >
            <div className="modal-dialog" role="document">
                <div className="modal-content">
                    {/* Header (optional hidden) */}
                    <div className="modal-header" style={{ display: 'none' }}>
                        <button
                            type="button"
                            className="close"
                            aria-label="Close"
                            onClick={onClose}
                        >
                            <span aria-hidden="true">×</span>
                        </button>
                    </div>

                    {/* Modal Body */}
                    <div className="modal-body">
                        <div className="row clearfix">
                            <p>{deleteBody}</p>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            className="btn btn-danger"
                            disabled={isLoading}
                        >
                            {isLoading && (
                                <span
                                    className="spinner-border spinner-border-sm mr-2"
                                    role="status"
                                    aria-hidden="true"
                                ></span>
                            )}
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteModal;
