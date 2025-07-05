import React from 'react';

const DeleteModal = ({ onConfirm, isLoading, deleteBody, modalId }) => {
    const labelId = `${modalId}Label`;
    
    return (
        <div
            className="modal fade"
            id={modalId}
            tabIndex={-1}
            role="dialog"
            aria-labelledby={labelId}
        >
            <div className="modal-dialog" role="document">
                <div className="modal-content">
                    {/* Header (optional hidden) */}
                    <div className="modal-header" style={{ display: 'none' }}>
                        <button
                            type="button"
                            className="close"
                            data-dismiss="modal"
                            aria-label="Close"
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
                            data-dismiss="modal"
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
