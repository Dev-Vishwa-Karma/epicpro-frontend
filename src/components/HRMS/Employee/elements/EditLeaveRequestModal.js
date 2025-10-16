import React from 'react';
import InputField from '../../../common/formInputs/InputField';
import Button from '../../../common/formInputs/Button';
import { getSortedEmployees } from '../../../../utils';

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
   <>
    {showModal && (
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
                        <InputField
                          style={{ minWidth: '300px' }}
                          inputClassName="custom-select w-auto"
                          label="Select Employee"
                          name="employee_id"
                          type="select"
                          value={selectedEmployeeLeave?.employee_id || ""}
                          onChange={handleInputChangeForEditEmployeeLeave}
                          error={addLeaveErrors && addLeaveErrors.employee_id}
                          options={[
                            { value: "", label: "Select Employee" },
                            ...getSortedEmployees(employeeData).map((emp) => ({
                              value: emp.id,
                              label: `${emp.first_name} ${emp.last_name}`
                            }))
                          ]}
                        />
                      </div>
                    )}

                    <div className="col-md-6">
                      <InputField
                        label="From Date"
                        name="from_date"
                        type="date"
                        value={selectedEmployeeLeave?.from_date || ""}
                        onChange={handleInputChangeForEditEmployeeLeave}
                        error={addLeaveErrors && addLeaveErrors.from_date}
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>

                    <div className="col-md-6">
                      <InputField
                        label="To Date"
                        name="to_date"
                        type="date"
                        value={selectedEmployeeLeave?.to_date || ""}
                        onChange={handleInputChangeForEditEmployeeLeave}
                        error={addLeaveErrors && addLeaveErrors.to_date}
                        min={selectedEmployeeLeave?.from_date || new Date().toISOString().split("T")[0]}
                      />
                    </div>

                    <div className="col-md-12">
                      <InputField
                        label="Reason"
                        name="reason"
                        type="text"
                        value={selectedEmployeeLeave?.reason || ""}
                        onChange={handleInputChangeForEditEmployeeLeave}
                        error={addLeaveErrors && addLeaveErrors.reason}
                      />
                    </div>

                    <div className="col-sm-6 col-md-6">
                      <InputField
                        label="Status"
                        name="status"
                        type="select"
                        value={selectedEmployeeLeave?.status || ""}
                        onChange={handleInputChangeForEditEmployeeLeave}
                        error={addLeaveErrors && addLeaveErrors.status}
                        options={[
                          { value: selectedEmployeeLeave?.status, label: selectedEmployeeLeave?.status.charAt(0).toUpperCase() + selectedEmployeeLeave?.status.slice(1) },
                          ...(['admin', 'super_admin'].includes(logged_in_employee_role) ? [
                            ...(selectedEmployeeLeave?.status !== "approved" ? [{ value: "approved", label: "Approved" }] : []),
                            ...(selectedEmployeeLeave?.status !== "pending" ? [{ value: "pending", label: "Pending" }] : []),
                            ...(selectedEmployeeLeave?.status !== "rejected" ? [{ value: "rejected", label: "Rejected" }] : [])
                          ] : (
                            logged_in_employee_role === "employee" && selectedEmployeeLeave?.status === "pending" ? [
                              { value: "cancelled", label: "Cancelled" }
                            ] : []
                          ))
                        ]}
                      />
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
                <Button
                  label="Close"
                  onClick={closeModal}
                  className="btn-secondary"
                  dataDismiss="modal"
                />
                <Button
                  label="Save"
                  onClick={updateEmployeeLeave}
                  loading={ButtonLoading}
                  disabled={ButtonLoading}
                  className="btn-primary"
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    )}
    {showModal && <div className="modal-backdrop fade show" />}
    </>
  );
};

export default EditLeaveRequestModal;
