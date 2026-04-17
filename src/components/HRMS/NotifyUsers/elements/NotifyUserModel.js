import React, { useState, useRef, useEffect  } from 'react';
import InputField from '../../../common/formInputs/InputField';
import Button from '../../../common/formInputs/Button';
import AlertMessages from '../../../common/AlertMessages';

const NotifyUserModal = ({
  show = false,
  onClose = () => { },
  onSubmit = () => { },
  formData = {},
  onChange = () => { },
  errors = {},
  loading = false,
  employeeData = {},


}) => {
  const { title = '', body = '', attach = [], selectedEmployee = [], type = '' } = formData;
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
                <h5 className="modal-title">Send Notification</h5>
                <button type="button" className="close" onClick={onClose}><span aria-hidden="true">×</span></button>
              </div>
              <AlertMessages {...errors} />
              <div className="modal-body">

                <InputField
                  label="Title"
                  name="title"
                  value={title}
                  onChange={onChange}
                  placeholder="title"
                  error={errors.title}
                />
                <InputField
                  label="Body"
                  name="body"
                  type="textarea"
                  value={body}
                  onChange={onChange}
                  rows={4}
                  placeholder="body"
                  error={errors.body}
                />

                <InputField
                  label="Notification Type"
                  name="type"
                  type="select"
                  value={type}
                  onChange={onChange}
                  options={[
                    { value: "todo", label: "Todo" },
                    { value: "information", label: "Information" },
                    { value: "need_discussion", label: "Need Discussion" },
                  ]}
                />

                {/* File Attachment */}
                <InputField
                  label="Attached Files"
                  name="attach"
                  type="file"
                  multiple={true}
                  value={attach}
                  onChange={onChange}
                  error={errors.attach}
                />
                <InputField
                  label="Users"
                  name="selectedEmployee"
                  type='select'
                  options={mappedOptions}
                  multiple={true}
                  value={selectedEmployee}
                  onChange={onChange}
                  error={errors.selectedEmployee}

                />

              </div>

              <div className="modal-footer">
                <Button
                  label="Close"
                  onClick={onClose}
                  className="btn-secondary"
                />
                <Button
                  label="Send"
                  onClick={onSubmit}
                  loading={loading}
                  disabled={loading}
                  className="btn-primary"
                />
              </div>

            </div>
          </div>
        </div>
      )}
      {show && <div className="modal-backdrop fade show" />}
    </>
  );
};

export default NotifyUserModal;