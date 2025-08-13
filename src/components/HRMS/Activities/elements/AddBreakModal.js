import React from 'react';
import EmployeeSelector from '../../../common/EmployeeSelector';
import InputField from '../../../common/formInputs/InputField';
import Button from '../../../common/formInputs/Button';

const AddBreakModal = ({
  loading,
  employeeData,
  selectedEmployee,
  selectedStatus,
  breakReason,
  handleEmployeeChange,
  handleStatusChange,
  handleReasonChange,
  addActivityForEmployee,
  buttonLoading,
  errors = {}
}) => {
  return (
    <div className="modal fade" id="addBreakModal" tabIndex={-1} role="dialog" aria-labelledby="addBreakModalLabel" aria-hidden="true" data-backdrop="static" data-keyboard="false">
      <div className="modal-dialog" role="dialog">
        <div className={`modal-content ${loading ? 'dimmer active' : 'dimmer'}`}>
          <div className="modal-header">
            <h5 className="modal-title" id="addBreakModalLabel">Add Activity for Employee</h5>
            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">×</span>
            </button>
            {loading && <div className="loader"></div>}
          </div>
          <div className="dimmer-content">
            <div className="modal-body">
              <div className="row clearfix">
                <div className="col-md-12">
                  <div className="form-group">
                    <EmployeeSelector
                        allEmployeesData={employeeData}
                        selectedEmployee={selectedEmployee}
                        handleEmployeeChange={handleEmployeeChange}
                        showAllInOption={false}
                    />
                    {errors.selectedEmployee && (
                      <div className="invalid-feedback d-block">{errors.selectedEmployee}</div>
                    )}
                  </div>
                </div>
                <div className="col-md-12">
                  <InputField
                    label="Select Status"
                    name="selectedStatus"
                    type="select"
                    value={selectedStatus}
                    onChange={handleStatusChange}
                    error={errors.selectedStatus}
                    options={[
                      { value: 'active', label: 'Break In' },
                      { value: 'completed', label: 'Break Out' },
                    ]}
                  />
                </div>
                {selectedStatus === "active" && (
                  <div className="col-md-12">
                    <InputField
                      label="Break Reason"
                      name="breakReason"
                      type="textarea"
                      value={breakReason}
                      onChange={handleReasonChange}
                      error={errors.breakReason}
                      placeholder="Please provide the reason for your break"
                      rows={10}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <Button
                label={buttonLoading ? "Saving..." : "Save changes"}
                onClick={addActivityForEmployee}
                disabled={buttonLoading}
                className="btn-primary"
                loading={buttonLoading}
                icon={buttonLoading ? "" : "fa fa-save"}
                iconStyle={{ marginRight: '8px' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBreakModal;
