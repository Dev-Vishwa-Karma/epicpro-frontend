import React from 'react';

const AddHolidayModal = ({
  showAddHolidayModal,
  closeAddHolidayModal,
  handleInputChangeForAddHoliday,
  addHoliday,
  ButtonLoading,
  errors,
  employee_id,
  event_name,
  event_date,
}) => {
  return (
    showAddHolidayModal && (
      <div
        className="modal fade show d-block"
        id="addHolidayModal"
        tabIndex="-1"
        role="dialog"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add Holiday</h5>
              <button
                type="button"
                className="close"
                onClick={closeAddHolidayModal}
              >
                <span>&times;</span>
              </button>
            </div>
            <form onSubmit={addHoliday}>
              <div className="modal-body">
                <div className="row clearfix">
                  <input
                    type="hidden"
                    className="form-control"
                    placeholder="employeeId"
                    name="employeeId"
                    value={employee_id}
                    onChange={handleInputChangeForAddHoliday}
                  />
                  <div className="col-md-12">
                    <div className="form-group">
                      <label className="form-label" htmlFor="event_name">
                        Holiday Name
                      </label>
                      <input
                        type="text"
                        className={`form-control ${
                          errors.event_name ? 'is-invalid' : ''
                        }`}
                        name="event_name"
                        id="event_name"
                        value={event_name}
                        onChange={handleInputChangeForAddHoliday}
                      />
                      {errors.event_name && (
                        <div className="invalid-feedback">
                          {errors.event_name}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="form-group">
                      <label className="form-label" htmlFor="event_date">
                        Holiday Date
                      </label>
                      <input
                        type="date"
                        className={`form-control ${
                          errors.event_date ? 'is-invalid' : ''
                        }`}
                        name="event_date"
                        id="event_date"
                        value={event_date}
                        onChange={handleInputChangeForAddHoliday}
                      />
                      {errors.event_date && (
                        <div className="invalid-feedback">
                          {errors.event_date}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeAddHolidayModal}
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={ButtonLoading}
                >
                  {ButtonLoading ? (
                    <span
                      className="spinner-border spinner-border-sm mr-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                  ) : null}
                  Add Holiday
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  );
};

export default AddHolidayModal;
