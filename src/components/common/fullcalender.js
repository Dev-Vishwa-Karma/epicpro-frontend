import React, { Component } from 'react';
import FullCalendar from 'fullcalendar-reactwrapper';
import "fullcalendar-reactwrapper/dist/css/fullcalendar.min.css"
import { formatDate } from '../../utils';

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
                        const startDate = formatDate(localStorage.getItem('startDate'));
                        const endDate = formatDate(localStorage.getItem('endDate'));

                        // Detect if this cell is an Alternate Saturday date
                        const isAlternateSaturday = (() => {
                            if (!(cell.hasClass && cell.hasClass('fc-sat'))) return false;
                            if (!alternateSatudays || alternateSatudays.length === 0) return false;
                            try {
                                for (const alternateSatuday of alternateSatudays) {
                                    const saturdayArr = JSON.parse(alternateSatuday.date);
                                    for (const element of saturdayArr) {
                                        if (formatDate(date) === formatDate(element)) {
                                            return true;
                                        }
                                    }
                                }
                            } catch (e) {
                                // Ignore JSON parse issues and treat as not alternate
                            }
                            return false;
                        })();

                        // Highlight all Sundays
                        if (cell.hasClass && cell.hasClass('fc-sun')) {
                            cell.css('background-color', '#FFE599');
                        }

                        // Highlight configured Alternate Saturdays with fixed color
                        if (isAlternateSaturday) {
                            cell.css('background-color', '#FFE599');
                        }

                        if (events && events.length > 0 && !isAlternateSaturday) {
                            events.forEach((event) => {
                                if (
                                    event.className === 'green-event' &&
                                    event.start === dateStr &&
                                    formatDate(dateStr) >= startDate &&
                                    formatDate(dateStr) <= endDate
                                ) {
                                    cell.css('background-color', '#4FA845');
                                    cell.css('color', 'white');
                                } else if (
                                    event.className === 'blue-event' &&
                                    event.start === dateStr &&
                                    formatDate(dateStr) >= startDate &&
                                    formatDate(dateStr) <= endDate
                                ) {
                                    cell.css('background-color', '#0879FA');
                                    cell.css('color', 'white');
                                } else if (
                                    (event.className === 'red-event' ||
                                        event.className === 'leave-event' ||
                                        event.className === 'missing-report-day') &&
                                    event.start === dateStr &&
                                    formatDate(dateStr) >= startDate &&
                                    formatDate(dateStr) <= endDate
                                ) {
                                    cell.css('background-color', 'red');
                                    cell.css('color', 'white');
                                } else if (
                                    event.className === 'daily-report' &&
                                    event.start === dateStr &&
                                    formatDate(dateStr) >= startDate &&
                                    formatDate(dateStr) <= endDate
                                ) {
                                    cell.css('background-color', '#4FA845');
                                    cell.css('color', 'white');
                                } else if (
                                    event.className === 'half-day-leave-event' &&
                                    event.start === dateStr &&
                                    formatDate(dateStr) >= startDate &&
                                    formatDate(dateStr) <= endDate
                                ) {
                                    cell.css('background-color', '#87ceeb');
                                    cell.css('color', 'white');
                                }

                                // Special handling for Saturdays when not alternate
                                if (cell.hasClass && cell.hasClass('fc-sat')) {
                                    if (alternateSatudays && alternateSatudays.length > 0) {
                                        alternateSatudays.forEach((alternateSatuday) => {
                                            try {
                                                const saturday = JSON.parse(alternateSatuday.date);
                                                saturday.forEach((element) => {
                                                    if (
                                                        formatDate(date) === formatDate(element) &&
                                                       ( event.className === 'missing-report-day' || 
                                                        event.className === 'leave-event')
                                                    ) {
                                                       
                                                        
                                                        cell.css('background-color', '#FFE599');
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
                                    formatDate(date) === formatDate(event.start) &&
                                    (event.className === 'leave-event' || event.className === 'missing-report-day')
                                ) {
                                    cell.css('background-color', '#FFE599');
                                }
                            });
                        }

                        // Finally, highlight current date with light pink (unless alternate Saturday)
                        if (cell.hasClass && cell.hasClass('fc-today') && !isAlternateSaturday) {
                            cell.css('background-color', '#FFEAF3');
                            cell.css('color', 'inherit');
                        }
                    }}
                    viewRender={(view, element) => {
                        const type = view.name;
                        const defaultStartDate = formatDate(view.intervalStart); // Use 
                        const endDate = new Date(view.intervalEnd);
                        endDate.setDate(endDate.getDate() - 1); // Adjust end date
                        const defaultEndDate = formatDate(endDate);

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
