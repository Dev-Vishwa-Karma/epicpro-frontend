import React from 'react';

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
                <div className="form-group">
                  <label htmlFor="title">Title</label>
                  <input
                    id="title"
                    type="text"
                    name="title"
                    value={title}
                    onChange={onChange}
                    className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                    placeholder="Enter title"
                  />
                  {errors.title && <small className="invalid-feedback">{errors.title}</small>}
                </div>

                <div className="form-group">
                  <label htmlFor="body">Body</label>
                  <textarea
                    id="body"
                    name="body"
                    value={body}
                    onChange={onChange}
                    className={`form-control ${errors.body ? 'is-invalid' : ''}`}
                    placeholder="Enter body"
                  />
                  {errors.body && <small className="invalid-feedback">{errors.body}</small>}
                </div>

                <div className="form-group">
                  <label htmlFor="type">Type</label>
                  <select
                    id="type"
                    name="type"
                    value={type}
                    onChange={onChange}
                    className={`form-control ${errors.type ? 'is-invalid' : ''}`}
                  >
                    <option value="">Select Type</option>
                    <option value="event_added">Add New Event</option>
                    <option value="Birthday">Birthday</option>
                    <option value="task_added">Task Add</option>
                    <option value="task_updated">Task Update</option>
                    <option value="task_completed">Task Complete</option>
                    <option value="task_due">Task Due</option>
                    <option value="report_note">Report Note</option>
                  </select>
                  {errors.type && <small className="invalid-feedback">{errors.type}</small>}
                </div>

                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="read"
                    name="read"
                    value={read}
                    onChange={onChange}
                    className={`form-control ${errors.read ? 'is-invalid' : ''}`}
                  >
                    <option value="">Select Status</option>
                    <option value="1">Read</option>
                    <option value="0">Unread</option>
                  </select>
                  {errors.read && <small className="invalid-feedback">{errors.read}</small>}
                </div>

                {/* Employee Select Dropdown */}
                <div className="form-group">
                  <label className="form-label">Select Employee</label>
                  <select 
                    className="form-control" 
                    value={selectedEmployee} 
                    onChange={handleEmployeeChange}
                  >
                    <option value="" disabled>Select Employees</option>
                    {employeeData
                      .filter(employee => {
                        const role = (employee.role || '').toLowerCase();
                        return role !== 'admin' && role !== 'super_admin';
                      })
                      .map(employee => (
                        <option key={employee.id} value={employee.id}>
                          {employee.first_name} {employee.last_name}
                        </option>
                      ))}
                  </select>
                </div>
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
