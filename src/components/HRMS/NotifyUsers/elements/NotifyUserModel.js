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
    const { title = '', body = '', attach = [], selectedEmployee = [], type = '', priority = '', status = '' } = formData;
    const [actionLoading, setActionLoading] = useState(null);
    const mappedOptions = employeeData
      .filter(emp => emp.id !== window.user.id)
      .map(emp => ({
          label: `${emp.first_name} ${emp.last_name}`,
          value: emp.id
        }));

    let attachedFiles = [];

    if (status === 'draft' && Array.isArray(attach)) {
      attachedFiles = attach.filter(file => typeof file === "string");
    }

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

                  <InputField
                    label="Priority"
                    name="priority"
                    type="select"
                    value={priority}
                    onChange={onChange}
                    // error={errors.priority}
                    options={[
                      { value: 'low', label: 'Low' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'high', label: 'High' }
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

                  {attachedFiles && attachedFiles.length > 0 && (
                    <div className="existing-files form-group">
                      <label className="form-label">Existing Files:</label>
                      <div className="form-control">
                        {attachedFiles.map((file, i) => (
                          <div key={i}>{file}</div>
                        ))}
                      </div>
                    </div>
                  )}

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

                <div className="modal-footer d-flex justify-content-between">

                  <div>
                    {(status !== 'draft') && (
                    <Button
                      label="Draft"
                      onClick={() => {
                        setActionLoading('draft');
                        onSubmit('draft');
                      }}
                      loading={actionLoading === 'draft'}
                      className="btn-warning mr-2"
                    />
                    )}
                  </div>

                  <div className="d-flex">
                    <Button
                      label="Close"
                      onClick={onClose}
                      className="btn-secondary  mr-"
                    />
                    <Button
                      label="Send"
                      onClick={() => {
                        setActionLoading('sent');
                        onSubmit('sent');
                      }}
                      loading={actionLoading === 'sent'}
                      className="btn-primary ml-1"
                    />
                  </div>
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