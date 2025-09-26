import React from 'react';
import InputField from '../../../common/formInputs/InputField';
import Button from '../../../common/formInputs/Button';
import { getSortedEmployees } from '../../../../utils'


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
                    <InputField
                      name="employee_id"
                      type="select"
                      value={employee_id}
                      onChange={handleInputChangeForAddLeaves}
                      error={addLeaveErrors && addLeaveErrors.employee_id}
                      options={[
                        { value: "", label: "Select Employee" },
                        ...getSortedEmployees(employeeData)
                        .filter(emp => emp.status === 1) 
                        .map((emp) => ({
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
                    value={from_date}
                    onChange={handleInputChangeForAddLeaves}
                    error={addLeaveErrors && addLeaveErrors.from_date}
                  />
                </div>

                <div className="col-md-6">
                  <InputField
                    label="To Date"
                    name="to_date"
                    type="date"
                    value={to_date}
                    onChange={handleInputChangeForAddLeaves}
                    error={addLeaveErrors && addLeaveErrors.to_date}
                    min={from_date || new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="col-md-12">
                  <InputField
                    label="Reason"
                    name="reason"
                    type="text"
                    placeholder="Reason"
                    value={reason}
                    onChange={handleInputChangeForAddLeaves}
                    error={addLeaveErrors && addLeaveErrors.reason}
                  />
                </div>

                {['admin', 'super_admin'].includes(logged_in_employee_role) && (
                  <div className="col-sm-6 col-md-6">
                    <InputField
                      label="Status"
                      name="status"
                      type="select"
                      value={status}
                      onChange={handleLeaveStatus}
                      error={addLeaveErrors && addLeaveErrors.status}
                      options={[
                        { value: "pending", label: "Pending" },
                        { value: "cancelled", label: "Cancelled" },
                        { value: "approved", label: "Approved" },
                        { value: "rejected", label: "Rejected" }
                      ]}
                    />
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
              <Button
                label="Close"
                onClick={closeModal}
                className="btn-secondary"
              />

              <Button
                label="Add Leave"
                onClick={addLeave}
                loading={ButtonLoading}
                disabled={ButtonLoading}
                className="btn-primary"
              />
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default AddLeaveRequestModal;
