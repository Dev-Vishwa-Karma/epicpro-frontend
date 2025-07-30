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
  buttonLoading
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
                  <EmployeeSelector
                      allEmployeesData={employeeData}
                      selectedEmployee={selectedEmployee}
                      handleEmployeeChange={handleEmployeeChange}
                      showAllInOption={false}
                  />
                </div>
                <div className="col-md-12">
                  <div className="form-group">
                    <select className="form-control" value={selectedStatus} onChange={handleStatusChange}>
                      <option value="">Select Status</option>
                      <option value="active">Break In</option>
                      <option value="completed">Break Out</option>
                    </select>
                  </div>
                </div>
                {selectedStatus === "active" && (
                  <div className="col-md-12">
                    <div className="form-group">
                      <textarea
                        className="form-control"
                        placeholder="Please provide the reason for your break"
                        value={breakReason}
                        onChange={handleReasonChange}
                        rows="10"
                        cols="50"
                      />
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
