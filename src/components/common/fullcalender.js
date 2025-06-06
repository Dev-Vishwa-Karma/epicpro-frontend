import React, { Component } from 'react';
import FullCalendar from 'fullcalendar-reactwrapper';
import "fullcalendar-reactwrapper/dist/css/fullcalendar.min.css"

class Fullcalender extends Component {
	constructor(props) {
		super(props);

	}

	formatDate = (date) => {
		const d = new Date(date);
		const year = d.getFullYear();
		const month = (`0${d.getMonth() + 1}`).slice(-2);
		const day = (`0${d.getDate()}`).slice(-2);
		return `${year}-${month}-${day}`;
    };
    
	render() {
		const { events, defaultDate, defaultView = 'month' } = this.props;

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
					editable={true}
					eventLimit={true}
					events={events}
					defaultView={defaultView}
					eventClick={this.props.eventClick}
					dayRender={(date, cell) => {
                        const dateStr = date.format('YYYY-MM-DD');
                        
                        events.map((event) => {
                            // console.log( "eee", event.className);
               
                            
                            if (event.className == 'green-event' && event.start == dateStr) {
                                cell.css('background-color', '#4FA845');

                                cell.css('color', 'white');
                            } else if (event.className == 'blue-event' && event.start == dateStr) {
                                cell.css('background-color', '#0879FA');

                                cell.css('color', 'white');
                            } else if ((event.className === 'red-event' ||  event.className == 'leave-event' || event.className == 'missing-report-day') && event.start == dateStr) {
                                cell.css('background-color', 'red');

                                cell.css('color', 'white');
                            }
                            else if (event.className == 'daily-report' && event.start == dateStr) {
                                cell.css('background-color', '#4FA845');

                                cell.css('color', 'white');
                            }

                            else if (event.className == 'half-day-leave-event' && event.start == dateStr) {
                                                            cell.css('background-color', '#87ceeb');

                                cell.css('color', 'white');
                            }
                        })
                    }}
                    viewRender={(view, element) => {
                        const type = view.name
                        const defaultStartDate = this.formatDate(view.currentRange.start);
                        const endDate = new Date(view.currentRange.end);
                        endDate.setDate(endDate.getDate() - 1)
                        const defaulEndtDate = this.formatDate(endDate);

                        if (defaulEndtDate !== localStorage.getItem('endDate') && defaultStartDate !== localStorage.getItem('startDate')  || type !== localStorage.getItem('defaultView')) {
                            localStorage.setItem('startDate', defaultStartDate);
                            localStorage.setItem('endDate', defaulEndtDate);
                            localStorage.setItem('defaultView', type);
                            this.props.onAction()

                        }


                    }}
			/>
			</div>
		);
	}
}

export default Fullcalender;
