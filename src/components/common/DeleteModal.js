import React from 'react';
import Button from './formInputs/Button';

const DeleteModal = ({ show, onConfirm, isLoading, onClose, deleteBody, modalId }) => {
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
                        <Button
                        label="Cancel"
                        onClick={onClose}
                        className="btn-secondary"
                        />

                        <Button
                        label="Delete"
                        onClick={onConfirm}
                        className="btn-danger"
                        disabled={isLoading}
                        loading={isLoading}
                        />
                    </div>
                </div>
            </div>
        </div>
        <div className="modal-backdrop fade show" />
        </>
    );
};

export default DeleteModal;
