import React, { useState, useRef, useEffect } from 'react';
import InputField from '../../../common/formInputs/InputField';
import Button from '../../../common/formInputs/Button';
import AlertMessages from '../../../common/AlertMessages';


const ConnectSetting = ({
    show = false,
    onClose = () => { },
    onSubmit = () => { },
    formData = {},
    onChange = () => { },
    errors = {},
    loading = false,
    employeeData = {},
}) => {
    if (!show) return null;
    const defaultSelectedEmployee = formData;
    const mappedOptions = employeeData
    .filter(emp => emp.id !== window.user.id)
    .map(emp => ({
        label: `${emp.first_name} ${emp.last_name}`,
        value: emp.id
      }));

    return (
        <>
            {show && (
                <div className="modal fade show d-block" id={1} tabIndex={-1} role="dialog" aria-modal="true">
                    <div className="modal-dialog modal-dialog-scrollable" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Set Users(Default)</h5>
                                <button type="button" className="close" onClick={onClose}><span aria-hidden="true">×</span></button>
                            </div>
                            <div className="modal-body">

                                <InputField
                                    label="Users"
                                    name="defaultSelectedEmployee"
                                    type='select'
                                    options={mappedOptions}
                                    multiple={true}
                                    value={defaultSelectedEmployee}
                                    onChange={onChange}
                                    error={errors.defaultSelectedEmployee}
                                />
                            </div>
                            <div className="modal-footer">
                                <Button
                                    label="Close"
                                    onClick={onClose}
                                    className="btn-secondary  mr-"
                                />
                                <Button
                                    label="Save"
                                    onClick={onSubmit}
                                    className="btn-primary ml-1"
                                />
                            </div>

                        </div>
                    </div>
                </div>)}
            {show && <div className="modal-backdrop fade show" />}
        </>
    );
};

export default ConnectSetting;