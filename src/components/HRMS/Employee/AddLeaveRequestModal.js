import React from 'react';

const AddLeaveRequestModal = ({
  showModal,
  employeeData,
  logged_in_employee_role,
  handleInputChangeForAddLeaves,
  handleLeaveStatus,
  addLeaveErrors,
  halfDayCheckbox,
  addLeave,
  closeModal,
  ButtonLoading,
  from_date,
  to_date,
  reason,
  employee_id,
  status,
}) => {
  return (
    showModal && (
      <div
        className="modal fade show d-block"
        id="addLeaveRequestModal"
        tabIndex="-1"
        role="dialog"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add Leave Request</h5>
              <button type="button" className="close" onClick={closeModal}>
                <span>&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="row clearfix">
                <input
                  type="hidden"
                  className="form-control"
                  placeholder="employeeId"
                  name="employeeId"
                  value={employee_id}
                  onChange={handleInputChangeForAddLeaves}
                />
                {addLeaveErrors.employeeId && (
                  <div className="small mt-1" style={{ color: 'red' }}>
                    {addLeaveErrors.employeeId}
                  </div>
                )}

                {['admin', 'super_admin'].includes(logged_in_employee_role) && (
                  <div className="col-md-12">
                    <div className="form-group">
                      <label className="form-label">Select Employee</label>
                      <select
                        name="employee_id"
                        className={`form-control${
                          addLeaveErrors && addLeaveErrors.employee_id ? ' is-invalid' : ''
                        }`}
                        onChange={handleInputChangeForAddLeaves}
                        value={employee_id}
                      >
                        <option value="">Select Employee</option>
                        {employeeData.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.first_name} {emp.last_name}
                          </option>
                        ))}
                      </select>
                      {addLeaveErrors && addLeaveErrors.employee_id && (
                        <div className="invalid-feedback d-block">{addLeaveErrors.employee_id}</div>
                      )}
                    </div>
                  </div>
                )}

                <div className="col-md-6">
                  <div className="form-group">
                    <label className="form-label">From Date</label>
                    <input
                      type="date"
                      className={`form-control${
                        addLeaveErrors && addLeaveErrors.from_date ? ' is-invalid' : ''
                      }`}
                      name="from_date"
                      value={from_date}
                      onChange={handleInputChangeForAddLeaves}
                    />
                    {addLeaveErrors.from_date && (
                      <div className="invalid-feedback d-block" style={{ color: 'red' }}>
                        {addLeaveErrors.from_date}
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="form-group">
                    <label className="form-label">To Date</label>
                    <input
                      type="date"
                      className={`form-control${
                        addLeaveErrors && addLeaveErrors.to_date ? ' is-invalid' : ''
                      }`}
                      name="to_date"
                      value={to_date}
                      onChange={handleInputChangeForAddLeaves}
                      min={from_date || new Date().toISOString().split('T')[0]}
                    />
                    {addLeaveErrors.to_date && (
                      <div className="invalid-feedback d-block" style={{ color: 'red' }}>
                        {addLeaveErrors.to_date}
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-md-12">
                  <div className="form-group">
                    <label className="form-label">Reason</label>
                    <input
                      type="text"
                      className={`form-control${
                        addLeaveErrors && addLeaveErrors.reason ? ' is-invalid' : ''
                      }`}
                      name="reason"
                      placeholder="Reason"
                      value={reason}
                      onChange={handleInputChangeForAddLeaves}
                    />
                    {addLeaveErrors.reason && (
                      <div className="invalid-feedback d-block" style={{ color: 'red' }}>
                        {addLeaveErrors.reason}
                      </div>
                    )}
                  </div>
                </div>

                {['admin', 'super_admin'].includes(logged_in_employee_role) && (
                  <div className="col-sm-6 col-md-6">
                    <div className="form-group">
                      <label className="form-label">Status</label>
                      <select
                        name="status"
                        className={`form-control${
                          addLeaveErrors && addLeaveErrors.status ? ' is-invalid' : ''
                        }`}
                        id="status"
                        onChange={handleLeaveStatus}
                        value={status}
                      >
                        <option value="pending">Pending</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                      {addLeaveErrors.status && (
                        <div className="invalid-feedback d-block" style={{ color: 'red' }}>
                          {addLeaveErrors.status}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="col-md-12">
                  <div className="form-group form-check">
                    <input
                      name="halfDayCheckbox"
                      className="form-check-input"
                      type="checkbox"
                      id="halfDayCheckbox"
                      checked={halfDayCheckbox === 1}
                      onChange={handleInputChangeForAddLeaves}
                    />
                    <label className="form-label" htmlFor="halfDayCheckbox">
                      Half day
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={closeModal}>
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={addLeave}
                disabled={ButtonLoading}
              >
                {ButtonLoading && (
                  <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                )}
                Add Leave
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default AddLeaveRequestModal;
