import React, { Component } from 'react';
import AlertMessages from '../../common/AlertMessages';
import TodoList from './TodoList';

class EventList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showAddEventModal: false,
            event_name: "",
            event_date: "",
            errors: {
                event_name: '',
                event_date: '',
            },
            successMessage: "",
            errorMessage: "",
            showSuccess: false,
            showError: false,
            ButtonLoading: false
        };
    }

    openAddEventModel = () => {
        this.setState({
            event_name: '',
            event_date: '',
            errors: {},
            showAddEventModal: true,
        });
    };

    closeAddEventModal = () => {
        this.setState({
            showAddEventModal: false,
            event_name: '',
            event_date: '',
            errors: {},
        });
    };

    handleInputChangeForAddEvent = (event) => {
        const { name, value } = event.target;
        this.setState({
            [name]: value,
            errors: { ...this.state.errors, [name]: "" }
        });
    };

    validateForm = (e) => {
        e.preventDefault();
        let isValid = true;

        const { event_name, event_date } = this.state;

        const validationSchema = [
            { name: 'event_name', value: event_name, type: 'name', required: true, messageName: 'Event name' },
            { name: 'event_date', value: event_date, type: 'date', required: true, messageName: 'Event date' }
        ];

        const { validateFields } = require('../../common/validations');
        const errors = validateFields(validationSchema);

        if (Object.keys(errors).length > 0) {
            this.setState({ errors });
            isValid = false;
        } else {
            this.setState({ errors: {} });
            isValid = true;
        }

        return isValid;
    };

    addEvent = (e) => {
        e.preventDefault();
        this.setState({ ButtonLoading: true });

        if (this.validateForm(e)) {
            const { event_name, event_date } = this.state;
            const { logged_in_employee_id } = this.props;

            const addEventData = new FormData();
            addEventData.append('employee_id', logged_in_employee_id);
            addEventData.append('event_name', event_name);
            addEventData.append('event_date', event_date);
            addEventData.append('event_type', 'event');
            addEventData.append('created_by', logged_in_employee_id);

            const { getService } = require('../../../services/getService');
            getService.addCall('events.php', 'add', addEventData)
                .then((data) => {
                    if (data.status === "success") {
                        this.setState({
                            event_name: "",
                            event_date: "",
                            showAddEventModal: false,
                            successMessage: data.message,
                            showSuccess: true,
                            errors: {},
                            ButtonLoading: false,
                        });

                        // Refresh events list
                        if (this.props.onEventAdded) {
                            this.props.onEventAdded();
                        }

                        setTimeout(() => {
                            this.setState({
                                showSuccess: false,
                                successMessage: ''
                            });
                        }, 3000);
                    } else {
                        this.setState({
                            errorMessage: "Failed to add event",
                            showError: true,
                            ButtonLoading: false,
                        });

                        setTimeout(() => {
                            this.setState({
                                errorMessage: '',
                                showError: false
                            });
                        }, 3000);
                    }
                })
                .catch((error) => {
                    console.error("Error:", error);
                    this.setState({
                        ButtonLoading: false,
                    });
                });
        }
    };

    handleClose = (messageType) => {
        if (messageType === 'success') {
            this.setState({ showSuccess: false, successMessage: '' });
        } else if (messageType === 'error') {
            this.setState({ showError: false, errorMessage: '' });
        }
    };

    formatDate = (date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = (`0${d.getMonth() + 1}`).slice(-2);
        const day = (`0${d.getDate()}`).slice(-2);
        return `${year}-${month}-${day}`;
    };

    render() {
        const {
            events,
            loading,
            logged_in_employee_role,
            employees,
            selectedYear,
            onDeleteEvent
        } = this.props;

        const {
            showAddEventModal,
            event_name,
            event_date,
            errors,
            successMessage,
            errorMessage,
            showSuccess,
            showError,
            ButtonLoading
        } = this.state;

        // Filter events for the selected year
        const filteredEvents = events?.map((event) => {
            let eventDate = new Date(event.event_date);
            let eventYear = eventDate.getFullYear();

            if (event.event_type === "birthday") {
                const month = eventDate.getMonth();
                const day = eventDate.getDate();
                eventDate = new Date(selectedYear, month, day);
            } else if (event.event_type === "event" && eventYear < selectedYear) {
                eventDate.setFullYear(selectedYear);
            }

            return {
                ...event,
                event_date: this.formatDate(eventDate),
            };
        })
        .filter((event) => {
            const eventDate = new Date(event.event_date);
            const eventYear = eventDate.getFullYear();

            if (event.event_type === 'birthday') {
                return eventYear === selectedYear;
            }

            if (event.event_type === 'holiday') {
                return eventYear === selectedYear;
            }

            if (event.event_type === 'event') {
                return eventYear === selectedYear;
            }

            return false;
        })
        .sort((a, b) => {
            const dateA = new Date(a.event_date);
            const dateB = new Date(b.event_date);
            
            if (dateA.getTime() === dateB.getTime()) {
                const typeOrder = { birthday: 0, holiday: 1, event: 2 };
                return typeOrder[a.event_type] - typeOrder[b.event_type];
            }
            
            return dateA - dateB;
        });

        // Remove duplicates
        const uniqueEventsMap = new Map();
        if (filteredEvents && filteredEvents.length > 0) {
            filteredEvents.forEach(event => {
                if (event.event_type === 'event') {
                    const key = event.event_name + '_' + event.event_date;
                    if (!uniqueEventsMap.has(key)) {
                        uniqueEventsMap.set(key, event);
                    }
                } else if (event.event_type === 'birthday') {
                    const key = `birthday_${event.id}`;
                    uniqueEventsMap.set(key, event);
                } else if (event.event_type === 'holiday') {
                    const key = `holiday_${event.id}`;
                    uniqueEventsMap.set(key, event);
                }
            });
        }

        const uniqueFilteredEvents = Array.from(uniqueEventsMap.values());

        return (
            <>
                <AlertMessages
                    showSuccess={showSuccess}
                    successMessage={successMessage}
                    showError={showError && !!errorMessage}
                    errorMessage={errorMessage}
                    setShowSuccess={(val) => this.setState({ showSuccess: val })}
                    setShowError={(val) => this.setState({ showError: val })}
                />
                
                <div className="card">
                    <div className="card-header bline d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Events Lists</h3>
                        {(logged_in_employee_role === 'admin' || logged_in_employee_role === 'super_admin') && (
                            <div className="header-action">
                                <button
                                    onClick={() => this.openAddEventModel()}
                                    type="button"
                                    className="btn btn-primary"
                                >
                                    <i className="fe fe-plus mr-2" />Add Event
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="card-body">
                        {loading ? (
                            <div className="dimmer active mb-4 p-3 px-3">
                                <div className="loader" />
                            </div>
                        ) : (
                            <div id="event-list" className="fc event_list" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                {uniqueFilteredEvents.length > 0 ? (
                                    uniqueFilteredEvents.map((event) => {
                                        let key = '';
                                        if (event.event_type === 'event') {
                                            key = event.event_name + '_' + event.event_date;
                                        } else if (event.event_type === 'birthday') {
                                            key = 'birthday_' + event.id;
                                        } else if (event.event_type === 'holiday') {
                                            key = 'holiday_' + event.id;
                                        } else {
                                            key = event.id || event.event_name || Math.random();
                                        }
                                        
                                        return (
                                            this.formatDate(event.event_date) >= this.formatDate(new Date()) ?
                                                <div key={key} className="event-card card mb-0">
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div
                                                            className={`fc-event ${
                                                                event.event_type === 'holiday'
                                                                    ? 'holiday-event'
                                                                    : event.event_type === 'event'
                                                                    ? 'regular-event'
                                                                    : event.event_type === 'birthday'
                                                                    ? 'birthday-event'
                                                                    : 'other-event'
                                                                }`}
                                                            data-class={
                                                                event.event_type === 'holiday'
                                                                    ? 'bg-danger'
                                                                    : event.event_type === 'event'
                                                                    ? 'bg-info'
                                                                    : event.event_type === 'birthday'
                                                                    ? 'bg-success'
                                                                    : 'bg-primary'
                                                                }
                                                            style={{ flex: 1 }}
                                                        >
                                                            {event.event_type === 'event' &&
                                                                (logged_in_employee_role === 'admin' || logged_in_employee_role === 'super_admin') && (
                                                                <button
                                                                    className="btn btn-link text-danger position-absolute"
                                                                    title="Delete Event"
                                                                    onClick={() => onDeleteEvent && onDeleteEvent(event.id)}
                                                                    style={{
                                                                        top: '2px',
                                                                        right: '2px',
                                                                        padding: '2px 6px',
                                                                        fontSize: '0.75rem',
                                                                        lineHeight: 1,
                                                                    }}
                                                                >
                                                                    <i className="fa fa-trash" aria-hidden="true" style={{color:"red"}}></i>
                                                                </button>
                                                            )}

                                                            <strong className="d-block">
                                                                {event.event_name}
                                                            </strong>
                                                            <small>
                                                                {event.event_date
                                                                    ? new Date(event.event_date).toLocaleDateString('en-US', {
                                                                        year: 'numeric',
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                    })
                                                                    : 'No Date'}
                                                            </small>
                                                        </div>
                                                    </div>
                                                </div> :
                                                null
                                        );
                                    })
                                ) : (
                                    <div className="fc-event bg-info" data-class="bg-info">
                                        No events found for this year.
                                    </div>
                                )}
                            </div>
                        )}

                        {(logged_in_employee_role === "admin" || logged_in_employee_role === "super_admin") && (
                            <div className="todo_list mt-4">
                                <TodoList employees={employees} logged_in_employee_role={logged_in_employee_role} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal for Add Event */}
                {showAddEventModal && (
                    <div className="modal fade show d-block" id="addEventModal" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                        <div className="modal-dialog" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Add Event</h5>
                                    <button type="button" className="close" onClick={this.closeAddEventModal}>
                                        <span>&times;</span>
                                    </button>
                                </div>
                                <form onSubmit={this.addEvent}>
                                    <div className="modal-body">
                                        <div className="row clearfix">
                                            <div className="col-md-12">
                                                <div className="form-group">
                                                    <label className="form-label" htmlFor="event_name">Event Name</label>
                                                    <input
                                                        type="text"
                                                        className={`form-control ${errors.event_name ? "is-invalid" : ""}`}
                                                        name='event_name'
                                                        id='event_name'
                                                        value={event_name}
                                                        onChange={this.handleInputChangeForAddEvent}
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
                                                        name='event_date'
                                                        id='event_date'
                                                        value={event_date}
                                                        onChange={this.handleInputChangeForAddEvent}
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
                                        <button type="button" className="btn btn-secondary" onClick={this.closeAddEventModal}>
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
                )}
            </>
        );
    }
}

export default EventList;