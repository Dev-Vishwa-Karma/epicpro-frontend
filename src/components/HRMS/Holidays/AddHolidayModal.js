import React from 'react';
import InputField from '../../common/formInputs/InputField';

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
                    <InputField
                      label="Holiday Name"
                      name="event_name"
                      type="text"
                      value={event_name}
                      onChange={handleInputChangeForAddHoliday}
                      error={errors.event_name}
                      placeholder="Enter holiday name"
                    />
                  </div>
                  <div className="col-md-12">
                    <InputField
                      label="Holiday Date"
                      name="event_date"
                      type="date"
                      value={event_date}
                      onChange={handleInputChangeForAddHoliday}
                      error={errors.event_date}
                      placeholder="Select date"
                    />
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
