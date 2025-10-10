import React from 'react';
import InputField from '../../../common/formInputs/InputField';
import Button from '../../../common/formInputs/Button';

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
               <Button
                label="Close"
                className="btn-secondary"
                onClick={closeAddHolidayModal}
              />

              <Button
                label={ButtonLoading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm mr-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Adding Holiday...
                  </>
                ) : 'Add Holiday'}
                className="btn-primary"
                type="submit"
                disabled={ButtonLoading}
              />
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  );
};

export default AddHolidayModal;
