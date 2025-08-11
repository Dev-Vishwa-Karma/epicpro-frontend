import React from 'react';
import InputField from '../../../common/formInputs/InputField';

const NotificationModal = ({
  isEdit = false,
  show,
  onClose,
  onSubmit,
  onChange,
  formData = {},
  errors = {},
  loading = false,
  modalId,
  employeeData = [],
  selectedEmployee,
  handleEmployeeChange,
}) => {
  const { 
    title = '',
    body = '',
    type = '',
    read = ''
  } = formData;

  return (
    <>
      {show && (
        <div className="modal fade show d-block" id={modalId} tabIndex={-1} role="dialog" aria-modal="true">
          <div className="modal-dialog" role="document">
            <div className="modal-content">

              <div className="modal-header">
                <h5 className="modal-title">{isEdit ? 'Edit Notification' : 'Add Notification'}</h5>
                <button type="button" className="close" onClick={onClose}><span aria-hidden="true">×</span></button>
              </div>

              <div className="modal-body">
                <InputField
                  label="Title"
                  name="title"
                  type="text"
                  value={title}
                  onChange={onChange}
                  placeholder="Enter title"
                  error={errors.title}
                />

                <InputField
                  label="Body"
                  name="body"
                  type="textarea"
                  value={body}
                  onChange={onChange}
                  placeholder="Enter body"
                  error={errors.body}
                />

                <InputField
                  label="Type"
                  name="type"
                  type="select"
                  value={type}
                  onChange={onChange}
                  error={errors.type}
                  options={[
                    { value: 'event_added', label: 'Add New Event' },
                    { value: 'Birthday', label: 'Birthday' },
                    { value: 'task_added', label: 'Task Add' },
                    { value: 'task_updated', label: 'Task Update' },
                    { value: 'task_completed', label: 'Task Complete' },
                    { value: 'task_due', label: 'Task Due' },
                    { value: 'report_note', label: 'Report Note' },
                  ]}
                />

                <InputField
                  label="Status"
                  name="read"
                  type="select"
                  value={read}
                  onChange={onChange}
                  error={errors.read}
                  options={[
                    { value: '1', label: 'Read' },
                    { value: '0', label: 'Unread' },
                  ]}
                />

                <InputField
                  label="Select Employee"
                  name="selectedEmployee"
                  type="select"
                  value={selectedEmployee}
                  onChange={handleEmployeeChange}
                  error={errors.selectedEmployee}
                  options={[
                    ...employeeData
                      .filter(emp => {
                        const role = (emp.role || '').toLowerCase();
                        return role !== 'admin' && role !== 'super_admin';
                      })
                      .map(emp => ({
                        value: emp.id,
                        label: `${emp.first_name} ${emp.last_name}`,
                      })),
                  ]}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
                <button type="button" className="btn btn-primary" onClick={onSubmit} disabled={loading}>
                  {loading && <span className="spinner-border spinner-border-sm mr-2" />}
                  Save changes
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
      {show && <div className="modal-backdrop fade show" />}
    </>
  );
};

export default NotificationModal;
