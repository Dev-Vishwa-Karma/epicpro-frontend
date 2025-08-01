import React from 'react';
import EmployeeSelector from '../../common/EmployeeSelector';

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
                  <div className="form-group">
                    <label className="form-label">Select Status</label>
                    <select 
                      className={`form-control${errors.selectedStatus ? ' is-invalid' : ''}`} 
                      value={selectedStatus} 
                      onChange={handleStatusChange}
                    >
                      <option value="">Select Status</option>
                      <option value="active">Break In</option>
                      <option value="completed">Break Out</option>
                    </select>
                    {errors.selectedStatus && (
                      <div className="invalid-feedback d-block">{errors.selectedStatus}</div>
                    )}
                  </div>
                </div>
                {selectedStatus === "active" && (
                  <div className="col-md-12">
                    <div className="form-group">
                      <label className="form-label">Break Reason</label>
                      <textarea
                        className={`form-control${errors.breakReason ? ' is-invalid' : ''}`}
                        placeholder="Please provide the reason for your break"
                        value={breakReason}
                        onChange={handleReasonChange}
                        rows="10"
                        cols="50"
                      />
                      {errors.breakReason && (
                        <div className="invalid-feedback d-block">{errors.breakReason}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                onClick={addActivityForEmployee}
                disabled={buttonLoading}
              >
                {buttonLoading ? <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span> : null}
                Save changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBreakModal;
