import React from 'react';

const TodoModal = ({
  isEdit = false,
  show,
  onClose,
  onSubmit,
  onChange,
  formData = {},
  errors = {},
  loading = false,
  modalId,
  employees = [],
  loggedInEmployeeRole = '',
}) => {
  const { 
    title = '', 
    due_date = '', 
    priority = '', 
    selectedEmployeeId = '' 
  } = formData;

  return (
    <>
      {show && (
        <div className="modal fade show d-block" id={modalId} tabIndex={-1} role="dialog" aria-modal="true" data-backdrop="static" data-keyboard="false">
          <div className="modal-dialog modal-dialog-scrollable" role="document">
            <div className="modal-content">

              <div className="modal-header">
                <h5 className="modal-title" id={`${modalId}Label`}>{isEdit ? 'Edit Todo' : 'Add Todo'}</h5>
                <button type="button" className="close" onClick={onClose}><span aria-hidden="true">×</span></button>
              </div>

              <div className="modal-body">
                <div className="row clearfix">
                  <div className="col-md-12">
                    <div className="form-group">
                      <label className="form-label" htmlFor="title">Title</label>
                      <input
                        type="text"
                        className={`form-control ${errors.title ? "is-invalid" : ""}`}
                        placeholder="Todo title"
                        name="title"
                        value={title}
                        onChange={onChange}
                      />
                      {errors.title && (
                        <small className="invalid-feedback">{errors.title}</small>
                      )}
                    </div>
                  </div>
                  
                  <div className="col-md-12">
                    <div className="form-group">
                      <label className="form-label" htmlFor="due_date">Due Date</label>
                      <input
                        type="date"
                        className={`form-control ${errors.due_date ? "is-invalid" : ""}`}
                        name="due_date"
                        value={due_date}
                        onChange={onChange}
                      />
                      {errors.due_date && (
                        <small className="invalid-feedback">{errors.due_date}</small>
                      )}
                    </div>
                  </div>
                  
                  <div className="col-md-12 col-sm-12">
                    <div className="form-group">
                      <label className="form-label" htmlFor="priority">Priority</label>
                      <select
                        className={`form-control ${errors.priority ? "is-invalid" : ""}`}
                        value={priority}
                        onChange={onChange}
                        name="priority"
                      >
                        <option value="">Select Priority</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                      {errors.priority && (
                        <small className="invalid-feedback">{errors.priority}</small>
                      )}
                    </div>
                  </div>
                  

                  {/* Show dropdown only for admin */}
                  {/* Show dropdown only for admin and only when not in edit mode */}
                    {(loggedInEmployeeRole === "admin" || loggedInEmployeeRole === "super_admin") && !isEdit && (
                      <div className="col-md-12 col-sm-12">
                        <label htmlFor="selectedEmployeeId" className="form-label font-weight-bold">Select Employee</label>
                        <select
                          name="selectedEmployeeId"
                          id="selectedEmployeeId"
                          className={`form-control ${errors.selectedEmployeeId ? "is-invalid" : ""}`}
                          value={selectedEmployeeId}
                          onChange={onChange}
                        >
                          <option value="">Select an Employee</option>
                          <option value="all">All Employees</option>
                          {employees.map((employee) => (
                            <option key={employee.id} value={employee.id}>
                              {employee.first_name} {employee.last_name}
                            </option>
                          ))}
                        </select>
                        {errors.selectedEmployeeId && (
                          <small className="invalid-feedback">{errors.selectedEmployeeId}</small>
                        )}
                      </div>
                    )}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Close
                </button>
                <button type="button" onClick={onSubmit} className="btn btn-primary" disabled={loading}>
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

export default TodoModal;
