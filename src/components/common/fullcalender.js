import React, { Component } from 'react';
import FullCalendar from 'fullcalendar-reactwrapper';
import "fullcalendar-reactwrapper/dist/css/fullcalendar.min.css"

class Fullcalender extends Component {
	constructor(props) {
		super(props);
    }
    
    shouldComponentUpdate(nextProps) {
        return (
            nextProps.events !== this.props.events ||
            nextProps.defaultDate !== this.props.defaultDate ||
            nextProps.defaultView !== this.props.defaultView
        );
    }

    formatDate = (date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = (`0${d.getMonth() + 1}`).slice(-2);
        const day = (`0${d.getDate()}`).slice(-2);
        return `${year}-${month}-${day}`;
    };

    render() {
        const { events, defaultDate, defaultView = 'month', alternateSatudays } = this.props;
        return (
            <div id="example-component">
                <FullCalendar
                    id="your-custom-ID"
                    header={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'month,basicWeek,basicDay'
                    }}
                    defaultDate={defaultDate}
                    navLinks={true}
                    editable={false}
                    eventLimit={true}
                    events={events}
                    defaultView={defaultView}
                    eventClick={this.props.eventClick}
                    eventRender={(event, element) => {
                        element.attr('title', event?.toottip);
                    }}
                    dayRender={(date, cell) => {
                        const dateStr = date.format('YYYY-MM-DD');
                        const startDate = this.formatDate(localStorage.getItem('startDate'));
                        const endDate = this.formatDate(localStorage.getItem('endDate'));

                        if (events && events.length > 0) {
                            events.forEach((event) => {
                                if (
                                    event.className === 'green-event' &&
                                    event.start === dateStr &&
                                    this.formatDate(dateStr) >= startDate &&
                                    this.formatDate(dateStr) <= endDate
                                ) {
                                    cell.css('background-color', '#4FA845');
                                    cell.css('color', 'white');
                                } else if (
                                    event.className === 'blue-event' &&
                                    event.start === dateStr &&
                                    this.formatDate(dateStr) >= startDate &&
                                    this.formatDate(dateStr) <= endDate
                                ) {
                                    cell.css('background-color', '#0879FA');
                                    cell.css('color', 'white');
                                } else if (
                                    (event.className === 'red-event' ||
                                        event.className === 'leave-event' ||
                                        event.className === 'missing-report-day') &&
                                    event.start === dateStr &&
                                    this.formatDate(dateStr) >= startDate &&
                                    this.formatDate(dateStr) <= endDate
                                ) {
                                    cell.css('background-color', 'red');
                                    cell.css('color', 'white');
                                } else if (
                                    event.className === 'daily-report' &&
                                    event.start === dateStr &&
                                    this.formatDate(dateStr) >= startDate &&
                                    this.formatDate(dateStr) <= endDate
                                ) {
                                    cell.css('background-color', '#4FA845');
                                    cell.css('color', 'white');
                                } else if (
                                    event.className === 'half-day-leave-event' &&
                                    event.start === dateStr &&
                                    this.formatDate(dateStr) >= startDate &&
                                    this.formatDate(dateStr) <= endDate
                                ) {
                                    cell.css('background-color', '#87ceeb');
                                    cell.css('color', 'white');
                                }

                                if (cell.hasClass && cell.hasClass('fc-sat')) {
                                    if (alternateSatudays && alternateSatudays.length > 0) {
                                        alternateSatudays.forEach((alternateSatuday) => {
                                            try {
                                                const saturday = JSON.parse(alternateSatuday.date);
                                                saturday.forEach((element) => {
                                                    if (
                                                        this.formatDate(date) === this.formatDate(element) &&
                                                       ( event.className === 'missing-report-day' || 
                                                        event.className === 'leave-event')
                                                    ) {
                                                       
                                                        
                                                        cell.css('background-color', 'white');
                                                    }
                                                });
                                            } catch (e) {
                                                console.error('Error parsing alternateSatuday.date:', e);
                                            }
                                        });
                                    }
                                }

                                if (
                                    cell.hasClass &&
                                    cell.hasClass('fc-sun') &&
                                    this.formatDate(date) === this.formatDate(event.start) &&
                                    (event.className === 'leave-event' || event.className === 'missing-report-day')
                                ) {
                                    cell.css('background-color', 'white');
                                }
                            });
                        }
                    }}
                    viewRender={(view, element) => {
                        const type = view.name;
                        const defaultStartDate = this.formatDate(view.intervalStart); // Use 
                        const endDate = new Date(view.intervalEnd);
                        endDate.setDate(endDate.getDate() - 1); // Adjust end date
                        const defaultEndDate = this.formatDate(endDate);

                        if (
                            defaultEndDate !== localStorage.getItem('endDate') ||
                            defaultStartDate !== localStorage.getItem('startDate') ||
                            type !== localStorage.getItem('defaultView')
                        ) {
                            localStorage.setItem('startDate', defaultStartDate);
                            localStorage.setItem('endDate', defaultEndDate);
                            localStorage.setItem('defaultView', type);

                            // Defer calls to avoid rendering conflicts
                            setTimeout(() => {
                                if (this.props?.onAction) {
                                    this.props.onAction();
                                }
                                if (this.props?.callEventAPI) {
                                    this.props.callEventAPI();
                                }
                            }, 200);
                        }
                    }}
                />
            </div>
        );
    }
}

export default Fullcalender;
