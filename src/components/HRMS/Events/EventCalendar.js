import React, { Component } from 'react';
import Fullcalender from '../../common/fullcalender';

class EventCalendar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedYear: new Date().getFullYear(),
            calendarView: (window.user?.role === "admin" || window.user?.role === "super_admin") ? "event" : "report",
            leaveViewEmployeeId: "",
            defaultDate: new Date(),
        };
    }

    componentDidMount() {
        // Initialize default date from localStorage or current date
        const defaultDate = localStorage.getItem('startDate') ?? 
            `${this.state.selectedYear}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`;
        this.setState({ defaultDate });
    }

    handleYearChange = (event) => {
        const year = Number(event.target.value);
        const newDate = `${year}-01-01`;
        const eventStartDate = `${year}-01-01`;
        const newEndDate = `${year}-01-31`;
        const eventEndDate = `${year}-12-31`;
        
        this.setState(prevState => ({
            selectedYear: year,
        }));
        
        localStorage.setItem('startDate', newDate);
        localStorage.setItem('eventStartDate', eventStartDate);
        localStorage.setItem('eventEndDate', eventEndDate);
        
        // Notify parent component about year change
        if (this.props.onYearChange) {
            this.props.onYearChange(year);
        }
    };

    handleEmployeeChange = (empId) => {
        this.setState({ 
            leaveViewEmployeeId: empId,
            calendarView: empId ? 'employeeSelected' : 'event'
        });
        
        if (empId) {
            localStorage.setItem('empId', empId);
        } else {
            localStorage.removeItem('empId');
        }
        
        // Notify parent component about employee change
        if (this.props.onEmployeeChange) {
            this.props.onEmployeeChange(empId);
        }
    };

    handleCalendarViewChange = (view) => {
        this.setState({ calendarView: view });
        
        // Notify parent component about view change
        if (this.props.onViewChange) {
            this.props.onViewChange(view);
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
            workingHoursReports,
            leaveData,
            alternateSatudays,
            employees,
            logged_in_employee_role,
            selectedYear,
            onReportClick,
            onAction,
            callEventAPI
        } = this.props;

        const {
            calendarView,
            leaveViewEmployeeId,
            defaultDate
        } = this.state;

        // Dynamic generation of years (last 50 years to next 10 years)
        const currentYear = new Date().getFullYear();
        const startYear = currentYear - 1;
        const endYear = currentYear + 10;
        const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

        // Format events for calendar
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

        // Format events for calendar display
        const formattedEvents = uniqueFilteredEvents.map(event => {
            if (event.event_type === 'event') {
                const eventDate = new Date(event.event_date);
                const formattedEventForAllYears = [];

                for (let year = startYear; year <= endYear; year++) {
                    const newEventDate = new Date(eventDate);
                    newEventDate.setFullYear(year);
                    formattedEventForAllYears.push({
                        title: event.event_name.length > 6 ? event.event_name.substring(0, 6).concat('...') : event.event_name,
                        toottip: event.event_name,
                        start: newEventDate.toISOString().split('T')[0],
                        className: 'green-event'
                    });
                }

                return formattedEventForAllYears;
            }

            if (event.event_type === 'holiday') {
                return {
                    title: event.event_name.length > 6 ? event.event_name.substring(0,6).concat('....') : event.event_name,
                    toottip: event.event_name,
                    start: event.event_date,
                    className: 'red-event'
                };
            }

            if (event.event_type === 'birthday') {
                return {
                    title: event.event_name.length > 6 ? event.event_name.substring(0,6).concat('....') : event.event_name,
                    toottip: event.event_name,
                    start: event.event_date,
                    className: 'blue-event'
                };
            }
        }).flat();

        // Format working hours events
        const workingHoursEvents = workingHoursReports.map((report) => {
            const hoursStr = report.todays_working_hours?.slice(0, 5);
            const hours = parseFloat(hoursStr);

            let className = "daily-report";
            if (hours < 4) className = "red-event";
            else if (hours >= 4 && hours < 8) className = "half-day-leave-event";

            const event = {
                id: report.id,
                title: `${hoursStr}`,
                start: report.created_at?.split(" ")[0],
                display: "background",
                allDay: true,
                className: className
            };
            return event;
        });

        // Format leave events
        const formatLeaveEvents = (leaveData) => {
            if (!Array.isArray(leaveData)) return [];
            const events = [];
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            leaveData.forEach((leave) => {
                const start = new Date(leave.from_date);
                const end = new Date(leave.to_date);
                if (end >= today) {
                    const loopStart = start < today ? new Date(today) : new Date(start);
                    for (let d = new Date(loopStart); d <= end; d.setDate(d.getDate() + 1)) {
                        if (d >= today) {
                            if (leave.is_half_day === "1") {
                                events.push({
                                    title: '',
                                    start: this.formatDate(d),
                                    className: "half-day-leave-event",
                                    allDay: true,
                                });
                            } else {
                                events.push({
                                    title: '',
                                    start: this.formatDate(d),
                                    className: "leave-event",
                                    allDay: true,
                                });
                            }
                        }
                    }
                }
            });
            return events;
        };

        // Get missing report events
        const getMissingReportEvents = (workingHoursReports, selectedYear) => {
            const missingReportEvents = [];
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const startDate = new Date(selectedYear, 0, 1);
            const endDate = new Date(selectedYear, 11, 31);
            let currentDate = new Date(startDate);

            const hasReportForDate = (dateStr, reports) => {
                return reports.some((report) => report.created_at?.split(" ")[0] === dateStr);
            };

            while (currentDate < today && currentDate <= endDate) {
                const dateStr = this.formatDate(currentDate);
                const hasReport = hasReportForDate(dateStr, workingHoursReports);
                
                if (!hasReport) {
                    missingReportEvents.push({
                        start: dateStr,
                        display: 'background',
                        color: '#fff',
                        allDay: true,
                        className: 'missing-report-day'
                    });
                }
                
                currentDate.setDate(currentDate.getDate() + 1);
            }

            return missingReportEvents;
        };

        const leaveEvents = formatLeaveEvents(leaveData);
        const missingReportEvents = getMissingReportEvents(workingHoursReports, selectedYear);

        // Determine which events to show based on calendar view
        let allEvents = [];
        if (calendarView === "any") {
            allEvents = [];
        } else if (calendarView === "report") {
            allEvents = [
                ...workingHoursEvents,
                ...missingReportEvents,
                ...leaveEvents,
            ];
        } else if (calendarView === "event") {
            allEvents = [
                ...formattedEvents,
            ];
        } else if (calendarView === "employeeSelected") {
            allEvents = [
                ...workingHoursEvents,
                ...missingReportEvents,
                ...leaveEvents,
            ];
        }

        const defaultView = localStorage.getItem('defaultView') ?? 'month';

        return (
            <>
                <div className="card">
                    <div className="card-header bline">
                        <h3 className="card-title">Event Calendar</h3>
                        <div className="card-options">
                            {logged_in_employee_role === "employee" && (
                                <select
                                    className="form-control custom-select"
                                    value={calendarView}
                                    onChange={(e) => this.handleCalendarViewChange(e.target.value)}
                                    style={{ width: "150px", marginRight: "10px" }}
                                >
                                    <option value="event">Events</option>
                                    <option value="report">Reports</option>
                                </select>
                            )}
                            {(logged_in_employee_role === "admin" || logged_in_employee_role === "super_admin") && (
                                <>
                                    <select
                                        id="leave-employee-selector"
                                        className="custom-select"
                                        style={{width: "200px"}}
                                        value={leaveViewEmployeeId}
                                        onChange={e => this.handleEmployeeChange(e.target.value)}
                                    >
                                        <option value="">All Events</option>
                                        {employees
                                            .filter(emp => emp.role !== 'admin' && emp.role !== 'super_admin')
                                            .map(emp => (
                                                <option key={emp.id} value={emp.id}>
                                                    {emp.first_name} {emp.last_name}
                                                </option>
                                            ))
                                        }
                                    </select>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="card-body">
                        <Fullcalender 
                            events={allEvents} 
                            defaultDate={defaultDate}
                            alternateSatudays={alternateSatudays}
                            defaultView={defaultView}
                            onAction={onAction}
                            callEventAPI={callEventAPI}
                            eventClick={(info) => {
                                const eventData = info;
                                const report = workingHoursReports.find(r => 
                                    r.id === eventData.id || 
                                    r.created_at?.split(" ")[0] === eventData.start?.format('YYYY-MM-DD')
                                );
                                if (report && calendarView !== 'event') {
                                    onReportClick && onReportClick(report);
                                } 
                            }}
                        />
                    </div>
                </div>
            </>
        );
    }
}

export default EventCalendar;