import React from 'react';

const ConfirmModal = ({ 
    show, 
    onConfirm, 
    onCancel, 
    title = "", 
    message, 
    confirmText = "Confirm", 
    cancelText = "Cancel",
    confirmButtonClass = "btn-primary",
    isLoading = false 
}) => {
    if (!show) return null;
  
    return (
        <>
            <div
                className="modal fade show"
                style={{ display: 'block' }}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
            >
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{title}</h5>
                            <button
                                type="button"
                                className="close"
                                aria-label="Close"
                                onClick={onCancel}
                            >
                                <span aria-hidden="true">×</span>
                            </button>
                        </div>

                        <div className="modal-body">
                            <p>{message}</p>
                        </div>

                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onCancel}
                                disabled={isLoading}
                            >
                                {cancelText}
                            </button>
                            <button
                                type="button"
                                onClick={onConfirm}
                                className={`btn ${confirmButtonClass}`}
                                disabled={isLoading}
                            >
                                {isLoading && (
                                    <span
                                        className="spinner-border spinner-border-sm mr-2"
                                        role="status"
                                        aria-hidden="true"
                                    ></span>
                                )}
                                {confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop fade show" />
        </>
    );
};

export default ConfirmModal; 