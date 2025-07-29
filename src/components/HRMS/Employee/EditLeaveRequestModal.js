import React from 'react';

const EditLeaveRequestModal = ({
  showModal,
  selectedEmployeeLeave,
  employeeData,
  logged_in_employee_role,
  handleInputChangeForEditEmployeeLeave,
  addLeaveErrors,
  updateEmployeeLeave,
  ButtonLoading,
  closeModal
}) => {
  return (
    showModal && (
      <div
        className="modal fade show d-block"
        id="editLeaveRequestModal"
        tabIndex={-1}
        role="dialog"
        aria-labelledby="editLeaveRequestModalLabel"
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="editLeaveRequestModalLabel">
                Edit Leave Request
              </h5>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close"  onClick={closeModal}>
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <form>
              <div className="modal-body">
                {selectedEmployeeLeave ? (
                  <div className="row clearfix">
                    <input
                      type="hidden"
                      className="form-control"
                      value={selectedEmployeeLeave?.employee_id || ""}
                      onChange={handleInputChangeForEditEmployeeLeave}
                      name="employee_id"
                    />

                    {['admin', 'super_admin'].includes(logged_in_employee_role) && (
                      <div className="col-md-12">
                        <div className="form-group">
                          <label className="form-label">Select Employee</label>
                          <select
                            name="employee_id"
                            className={`form-control${addLeaveErrors && addLeaveErrors.employee_id ? ' is-invalid' : ''}`}
                            onChange={handleInputChangeForEditEmployeeLeave}
                            value={selectedEmployeeLeave?.employee_id || ""}
                          >
                            <option value="">Select Employee</option>
                            {employeeData.map((emp) => (
                              <option key={emp.id} value={emp.id}>
                                {emp.first_name} {emp.last_name}
                              </option>
                            ))}
                          </select>
                          {addLeaveErrors && addLeaveErrors.employee_id && (
                            <div className="invalid-feedback d-block" style={{ color: "red" }}>
                              {addLeaveErrors.employee_id}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">From Date</label>
                        <input
                          type="date"
                          className={`form-control${addLeaveErrors && addLeaveErrors.from_date ? ' is-invalid' : ''}`}
                          value={selectedEmployeeLeave?.from_date || ""}
                          onChange={handleInputChangeForEditEmployeeLeave}
                          name="from_date"
                          min={new Date().toISOString().split("T")[0]}
                        />
                        {addLeaveErrors && addLeaveErrors.from_date && (
                          <div className="invalid-feedback d-block" style={{ color: "red" }}>
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
                          className={`form-control${addLeaveErrors && addLeaveErrors.to_date ? ' is-invalid' : ''}`}
                          value={selectedEmployeeLeave?.to_date || ""}
                          onChange={handleInputChangeForEditEmployeeLeave}
                          name="to_date"
                          min={selectedEmployeeLeave?.from_date || new Date().toISOString().split("T")[0]}
                        />
                        {addLeaveErrors && addLeaveErrors.to_date && (
                          <div className="invalid-feedback d-block" style={{ color: "red" }}>
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
                          className={`form-control${addLeaveErrors && addLeaveErrors.reason ? ' is-invalid' : ''}`}
                          value={selectedEmployeeLeave?.reason || ""}
                          onChange={handleInputChangeForEditEmployeeLeave}
                          name="reason"
                        />
                        {addLeaveErrors && addLeaveErrors.reason && (
                          <div className="invalid-feedback d-block" style={{ color: "red" }}>
                            {addLeaveErrors.reason}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-sm-6 col-md-6">
                      <div className="form-group">
                        <label className="form-label">Status</label>
                        <select
                          name="status"
                          className={`form-control${addLeaveErrors && addLeaveErrors.status ? ' is-invalid' : ''}`}
                          id="status"
                          value={selectedEmployeeLeave?.status || ""}
                          onChange={handleInputChangeForEditEmployeeLeave}
                        >
                          <option value={selectedEmployeeLeave?.status}>
                            {selectedEmployeeLeave?.status.charAt(0).toUpperCase() + selectedEmployeeLeave?.status.slice(1)}
                          </option>

                          {['admin', 'super_admin'].includes(logged_in_employee_role) ? (
                            <>
                              {selectedEmployeeLeave?.status !== "approved" && <option value="approved">Approved</option>}
                              {selectedEmployeeLeave?.status !== "pending" && <option value="pending">Pending</option>}
                              {selectedEmployeeLeave?.status !== "rejected" && <option value="rejected">Rejected</option>}
                            </>
                          ) : (
                            logged_in_employee_role === "employee" && selectedEmployeeLeave?.status === "pending" && (
                              <option value="cancelled">Cancelled</option>
                            )
                          )}
                        </select>
                        {addLeaveErrors && addLeaveErrors.status && (
                          <div className="invalid-feedback d-block" style={{ color: "red" }}>
                            {addLeaveErrors.status}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-12">
                      <div className="form-group form-check">
                        <input
                          name="is_half_day"
                          className="form-check-input"
                          type="checkbox"
                          id="halfDayCheckbox"
                          checked={selectedEmployeeLeave?.is_half_day === "1"}
                          onChange={handleInputChangeForEditEmployeeLeave}
                        />
                        <label className="form-label" htmlFor="halfDayCheckbox">
                          Half day
                        </label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p>Loading employee leave data...</p>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-dismiss="modal"  onClick={closeModal}>
                  Close
                </button>
                <button
                  type="button"
                  onClick={updateEmployeeLeave}
                  className="btn btn-primary"
                  disabled={ButtonLoading}
                >
                  {ButtonLoading && (
                    <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                  )}
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  );
};

export default EditLeaveRequestModal;
