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

                        const isDateInRange = (dStr) => {
                            const d = formatDate(dStr);
                            return d >= startDate && d <= endDate;
                        };

                        const hasEvent = (cls) => {
                            if (!events || events.length === 0) return false;
                            return events.some(ev => ev.className === cls && ev.start === dateStr && isDateInRange(dateStr));
                        };

                        const hasFullDayLeave = hasEvent('leave-event');
                        const hasHalfDayLeave = hasEvent('half-day-leave-event');
                        const hasDailyReport = hasEvent('daily-report');
                        const hasLowHoursRed = hasEvent('red-event');

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

                        // Base highlights
                        const isSunday = cell.hasClass && cell.hasClass('fc-sun');

                        // If Sunday or Alternate Saturday and there is a leave, show leave color in background
                        if ((isSunday || isAlternateSaturday)) {
                            if (hasHalfDayLeave) {
                                cell.css('background-color', '#87ceeb');
                                cell.css('color', 'white');
                            } else if (hasFullDayLeave) {
                                cell.css('background-color', 'red');
                                cell.css('color', 'white');
                            } else {
                                // Fallback highlight for Sundays or alternate Saturdays when no leave
                                cell.css('background-color', '#FFE599'); // fff2cc
                            }
                        }

                        // Normal weekdays or non-alternate Saturdays: color by events
                        if (events && events.length > 0) {
                            events.forEach((event) => {
                                if (
                                    event.className === 'green-event' &&
                                    event.start === dateStr &&
                                    isDateInRange(dateStr)
                                ) {
                                    // Do not override leave colors already applied for Sundays/alternate Saturdays
                                    if (!(isSunday || isAlternateSaturday)) {
                                        cell.css('background-color', '#4FA845');
                                        cell.css('color', 'white');
                                    }
                                } else if (
                                    event.className === 'blue-event' &&
                                    event.start === dateStr &&
                                    isDateInRange(dateStr)
                                ) {
                                    if (!(isSunday || isAlternateSaturday)) {
                                        cell.css('background-color', '#0879FA');
                                        cell.css('color', 'white');
                                    }
                                } else if (
                                    (event.className === 'red-event' ||
                                        event.className === 'leave-event' ||
                                        event.className === 'missing-report-day') &&
                                    event.start === dateStr &&
                                    isDateInRange(dateStr)
                                ) {
                                    // If already handled Sunday/Alternate Saturday leaves above, skip here
                                    if (!(isSunday || isAlternateSaturday)) {
                                        cell.css('background-color', 'red');
                                        cell.css('color', 'white');
                                    }
                                } else if (
                                    event.className === 'daily-report' &&
                                    event.start === dateStr &&
                                    isDateInRange(dateStr)
                                ) {
                                    if (!(isSunday || isAlternateSaturday)) {
                                        cell.css('background-color', '#4FA845');
                                        cell.css('color', 'white');
                                    }
                                } else if (
                                    event.className === 'half-day-leave-event' &&
                                    event.start === dateStr &&
                                    isDateInRange(dateStr)
                                ) {
                                    if (!(isSunday || isAlternateSaturday)) {
                                        cell.css('background-color', '#87ceeb');
                                        cell.css('color', 'white');
                                    }
                                }


                            });
                        }

                        // Finally, highlight current date with light pink only if no report/leave color is applied
                        const hasReportColorToday = hasDailyReport || hasLowHoursRed || hasHalfDayLeave || hasFullDayLeave;
                        if (cell.hasClass && cell.hasClass('fc-today') && !hasReportColorToday) {
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
