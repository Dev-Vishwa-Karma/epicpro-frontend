import React from 'react';
import InputField from '../../../common/formInputs/InputField';
import Button from '../../../common/formInputs/Button';

const ProgressModal = ({
    modalId,
    closeModal,
    ButtonLoading,
    SubmitButtonLoading,
    handleSaveProgress,
    handleChange,
    min_date,
    progress_date,
    current_progress,
    working_hours,
    showError,
    errorMessage,
    errors,
}) => {
    return (
        <>
            <div className="modal fade show d-block" id={modalId} tabIndex={-1} role="dialog" aria-modal="true">
                <div className="modal-dialog modal-dialog-scrollable" role="document">
                    <div className="modal-content">

                        <div className="modal-header">
                            <h5 className="modal-title">Progress Modal</h5>
                            <button type="button" className="close" onClick={closeModal} aria-label="Close">
                                <span aria-hidden="true">×</span>
                            </button>
                        </div>
                        <div className="dimmer-content">
                            <div className="modal-body">
                                {showError && (
                                    <div className="alert alert-danger" role="alert">
                                        {errorMessage}
                                    </div>
                                )}
                                <div className="row clearfix">
                                    <div className="col-md-12">
                                        <InputField
                                            label="Date"
                                            name="progress_date"
                                            type="date"
                                            value={progress_date}
                                            onChange={handleChange}
                                            min={min_date.split(' ')[0]}
                                            max={new Date().toISOString().split('T')[0]}
                                            error={errors.progress_date}
                                        />
                                    </div>
                                    <div className="col-md-12">
                                        <InputField
                                            label="Working Hours"
                                            name="working_hours"
                                            type="number"
                                            value={working_hours}
                                            onChange={handleChange}
                                            className="btn-primary"
                                            min={0}
                                            max={8}
                                            placeholder={0}
                                            error={errors.working_hours}
                                        />
                                    </div>
                                    <div className="col-md-12">
                                        <InputField
                                            label="Progress"
                                            name="current_progress"
                                            type="number"
                                            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                                            value={current_progress}
                                            onChange={handleChange}
                                            min={current_progress}
                                            max={100}
                                            error={errors.current_progress}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <Button
                                label="Close"
                                onClick={closeModal}
                                className="btn-secondary"
                            />

                            <Button
                                label={SubmitButtonLoading ? "Saving..." : "Save changes"}
                                onClick={handleSaveProgress}
                                disabled={SubmitButtonLoading}
                                className="btn-primary"
                                loading={SubmitButtonLoading}
                                icon={SubmitButtonLoading ? "" : "fa fa-save"}
                                iconStyle={{ marginRight: '8px' }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ProgressModal;