import React, { Component } from 'react';

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
                      <div className="form-group">
                        <label className="form-label" htmlFor="event_name">Holiday Name</label>
                        <input
                          type="text"
                          className={`form-control ${errors.event_name ? "is-invalid" : ""}`}
                          name="event_name"
                          id="event_name"
                          value={selectedHoliday?.event_name || ""}
                          onChange={handleInputChangeForEditHoliday}
                        />
                        {errors.event_name && (
                          <div className="invalid-feedback">{errors.event_name}</div>
                        )}
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="form-group">
                        <label className="form-label" htmlFor="event_date">Holiday Date</label>
                        <input
                          type="date"
                          className={`form-control ${errors.event_date ? "is-invalid" : ""}`}
                          name="event_date"
                          id="event_date"
                          value={selectedHoliday?.event_date || ""}
                          onChange={handleInputChangeForEditHoliday}
                        />
                        {errors.event_date && (
                          <div className="invalid-feedback">{errors.event_date}</div>
                        )}
                      </div>
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
