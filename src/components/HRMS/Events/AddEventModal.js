import React, { Component } from 'react';
import InputField from '../../common/formInputs/InputField';

class AddEventModal extends Component {
  render() {
    const { showAddEventModal, closeAddEventModal, addEvent, handleInputChangeForAddEvent, errors, event_name, event_date, ButtonLoading } = this.props;
    
    return (
      showAddEventModal && (
        <div className="modal fade show d-block" id="addEventModal" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Event</h5>
                <button type="button" className="close" onClick={closeAddEventModal}>
                  <span>&times;</span>
                </button>
              </div>
              <form onSubmit={addEvent}>
                <div className="modal-body">
                  <div className="row clearfix">
                  <div className="col-md-12">
                    <InputField
                      label="Event Name"
                      name="event_name"
                      type="text"
                      value={event_name}
                      onChange={handleInputChangeForAddEvent}
                      error={errors.event_name}
                      placeholder="Enter event name"
                    />
                  </div>

                  <div className="col-md-12">
                    <InputField
                      label="Event Date"
                      name="event_date"
                      type="date"
                      value={event_date}
                      onChange={handleInputChangeForAddEvent}
                      error={errors.event_date}
                      min={new Date().toISOString().split('T')[0]} 
                    />
                  </div>

                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeAddEventModal}>
                    Close
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={ButtonLoading}
                  >
                    {ButtonLoading ? (
                      <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                    ) : null}
                    Add Event
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )
    );
  }
}

export default AddEventModal;
