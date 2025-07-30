import React, { Component } from 'react';

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
                      <div className="form-group">
                        <label className="form-label" htmlFor="event_name">Event Name</label>
                        <input
                          type="text"
                          className={`form-control ${errors.event_name ? "is-invalid" : ""}`}
                          name="event_name"
                          id="event_name"
                          value={event_name}
                          onChange={handleInputChangeForAddEvent}
                        />
                        {errors.event_name && (
                          <div className="invalid-feedback">{errors.event_name}</div>
                        )}
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="form-group">
                        <label className="form-label" htmlFor="event_date">Event Date</label>
                        <input
                          type="date"
                          className={`form-control ${errors.event_date ? "is-invalid" : ""}`}
                          name="event_date"
                          id="event_date"
                          value={event_date}
                          onChange={handleInputChangeForAddEvent}
                          min={new Date().toISOString().split('T')[0]}
                        />
                        {errors.event_date && (
                          <div className="invalid-feedback">{errors.event_date}</div>
                        )}
                      </div>
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
