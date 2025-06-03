import React, { Component } from 'react';
import FullCalendar from 'fullcalendar-reactwrapper';
import "fullcalendar-reactwrapper/dist/css/fullcalendar.min.css"

class Fullcalender extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    render() {
        const {events, defaultDate, leaveDatesSet} = this.props;
        return (
            
            <div id="example-component">
                {/* FullCalendar Component */}
                <FullCalendar
                    id="your-custom-ID"
                    header={{
                        left: 'prev,next today myCustomButton',
                        center: 'title',
                        right: 'month,basicWeek,basicDay'
                    }}
                    defaultDate={defaultDate}
                    navLinks={true} // can click day/week names to navigate views
                    editable={true}
                    eventLimit={true}
                    events={events}
                    eventClick={this.props.eventClick}
                    // HERE: highlight leave days
                    dayRender={(date, cell) => {
                        const dateStr = date.format('YYYY-MM-DD');
                        if (leaveDatesSet && leaveDatesSet.has(dateStr)) {
                            cell.css('background-color', 'red');
                            cell.css('color', 'white');
                        }
                    }}
                />
            </div>
        );
    }
}

export default Fullcalender;
