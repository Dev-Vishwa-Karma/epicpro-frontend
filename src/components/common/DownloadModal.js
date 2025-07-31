import React from 'react';

const DownloadModal = ({ show, onConfirm, isLoading, onClose, deleteBody, modalId }) => {
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
                            <style>
                            {`
                                .btn-danger {
                                    background-color: rgb(8, 134, 14);
                                    color: #fff;
                                    border: none;
                                    border-radius: 5px;
                                    cursor: pointer;
                                    font-size: 16px;
                                    transition: all 0.3s ease;
                                }
                                .btn-danger:hover {
                                    background-color: rgb(8, 134, 14);
                                    color: #fff;
                                    opacity: 0.8;
                                }
                                .btn-danger:focus {
                                    background-color: rgb(8, 134, 14);
                                    color: #fff;
                                    box-shadow: 0 0 0 0.2rem rgba(8, 134, 14, 0.25);
                                }
                                .btn-danger:active {
                                    background-color: rgb(8, 134, 14);
                                    color: #fff;
                                    opacity: 0.9;
                                }
                            `}
                        </style>
                            Download
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DownloadModal; 