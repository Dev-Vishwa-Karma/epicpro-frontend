import React, { Component } from 'react';
import InputField from '../../../common/formInputs/InputField';

class EditHolidayModal extends Component {
  render() {
    const { selectedHoliday, handleInputChangeForEditHoliday, updateHoliday, errors, ButtonLoading } = this.props;

    return (
      <div className="modal fade" id="editHolidayModal" tabIndex={-1} role="dialog" aria-labelledby="editHolidayModalLabel">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Update Holiday</h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            {selectedHoliday && (
              <form onSubmit={updateHoliday}>
                <div className="modal-body">
                  <div className="row clearfix">
                    <input
                      type="hidden"
                      className="form-control"
                      placeholder="employeeId"
                      name="employee_id"
                      value={selectedHoliday?.employee_id || ""}
                      onChange={handleInputChangeForEditHoliday}
                    />
                    <div className="col-md-12">
                      <InputField
                        label="Holiday Name"
                        name="event_name"
                        type="text"
                        value={selectedHoliday?.event_name || ""}
                        onChange={handleInputChangeForEditHoliday}
                        error={errors.event_name}
                        placeholder="Enter holiday name"
                      />
                    </div>
                    <div className="col-md-12">
                      <InputField
                        label="Holiday Date"
                        name="event_date"
                        type="date"
                        value={selectedHoliday?.event_date || ""}
                        onChange={handleInputChangeForEditHoliday}
                        error={errors.event_date}
                        placeholder="Select date"
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={ButtonLoading}
                  >
                    {ButtonLoading && (
                      <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                    )}
                    Update Holiday
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default EditHolidayModal;
