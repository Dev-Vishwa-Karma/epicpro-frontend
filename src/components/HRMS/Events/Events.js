import React, { Component } from 'react'
import { connect } from 'react-redux';
import Fullcalender from '../../common/fullcalender';
import ReportModal from '../Report/ReportModal';
import TodoList from './TodoList';
import { getService } from '../../../services/getService';
import { validateFields } from '../../common/validations';
class Events extends Component {
	constructor(props) {
    super(props);
    const userRole = window.user?.role;
    this.state = {
      events: [],
      workingHoursReports: [],
      selectedYear: new Date().getFullYear(),
	  // Add this for admin
	  leaveViewEmployeeId: "",
      showAddEventModal: false,
      employee_id: null,
      event_name: "",
      event_date: "",
      errors: {
		event_name: '',
		event_date: '',
      },
	  selectedEvent: '',
      successMessage: "",
      errorMessage: "",
      showSuccess: false,
      showError: false,
      loading: true,
      employees: [],
      todos: [],
      selectedEmployeeIdForTodo: '',
      selectedEmployeeIdForModal: '',
      logged_in_employee_id: '',
      logged_in_employee_role: '',
      calendarView: (userRole === "admin" || userRole === "super_admin") ? "event" : "report",
       showReportEditModal: false,
      selectedReportDate: null,
      editedWorkingHours: '',
      leaveData: [],
	  allEvents: [],
      showReportModal: false,
	  defaultDate: new Date(),
      selectedReport: null,
	  showDeleteModal: false,
	  eventIdToDelete: null,
	  alternateSatudays: [],
	  ButtonLoading: false
	};
	localStorage.removeItem('empId');
	localStorage.removeItem('startDate');
	localStorage.removeItem('eventStartDate');
	localStorage.removeItem('eventEndDate');
	localStorage.removeItem('endDate');
	localStorage.removeItem('defaultView');
  }

	componentDidMount() {
		const {role, id} = window.user;
		// Get the logged in user id
		this.setState(
			{
				employee_id: id,
				logged_in_employee_id: id,
				logged_in_employee_role: role,
				selectedEmployeeId: role === 'employee' ? id : ''
			},
			() => {
				if (role === 'employee') {
					this.setState(
						{ selectedEmployeeIdForTodo: id },
						() => this.fetchTodos(id)
					);
				}
			}
		);
		this.fetchEmployees();
		this.fetchWorkingHoursReports(null);
		const start_date = `${this.state.selectedYear}-01-01`;
		const end_date = `${this.state.selectedYear}-12-31`;     
		this.fetchLeaveData(id, start_date, end_date);
		this.getAlternateSaturday();
	}

	fetchWorkingHoursReports = () => {
	let employeeId = window.user?.role !== 'admin' ?
			this.state.calendarView === 'report' ? window.user.id: null : null;
	if (!employeeId && !localStorage.getItem('empId')) {
		return;
	}
	if (!employeeId) {
		employeeId = localStorage.getItem('empId');
	}

	let startDate = localStorage.getItem('startDate');
	let endDate = localStorage.getItem('endDate');

	if (!startDate || !endDate) {
		const now = new Date();
		const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
		const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
		const formatDate = (date) => date.toISOString().split('T')[0];
		startDate = formatDate(firstDay);
		endDate = formatDate(lastDay);
	}

	getService.getCall('reports.php', {
		action: 'view',
		from_date:startDate,
		to_date:endDate,
		user_id:employeeId
	})
		.then((data) => {
		// Defer state update
		setTimeout(() => {
			if (data.status === 'success') {
			if (employeeId === '') {
				this.setState({ workingHoursReports: [] });
			} else {
				this.setState({
				workingHoursReports: data.data,
				loading: false,
				});
			}
			} else {
			this.setState({
				workingHoursReports: [],
				error: data.message || 'Failed to load reports',
				loading: false,
			});
			}
		}, 0);
		})
		.catch((err) => {
		console.error('Error fetching working hours:', err);
		// Defer state update
		setTimeout(() => {
			this.setState({
			workingHoursReports: [],
			error: 'Failed to fetch working hours',
			loading: false,
			});
		}, 0);
		});
	};

	fetchEmployees = () => {
		getService.getCall('get_employees.php', {
			action: 'view',
		})
			.then(data => {
				if (data.status === 'success') {
		
					this.setState({
						employees: data.data,
						loading: false
					}, () => {
						// Fetch regular events after setting employees
						this.fetchEvents();
					});
				} else {
					this.setState({ error: data.message, loading: false });
				}
			})
			.catch(err => {
				//console.error('Error fetching employees:', err); // Debug log
				this.setState({ error: 'Failed to fetch employees data' });
			});
	}

	hasReportForDate = (dateStr, reports) => {
		return reports.some((report) => report.created_at?.split(" ")[0] === dateStr);
	};
	fetchTodos = (employeeId) => {
		if (!employeeId) {
			this.setState({ todos: [] }); // Ensure todos is always an array
			return;
		}
	
		this.setState({ loading: true });
	
		// fetch(`${process.env.REACT_APP_API_URL}/project_todo.php?action=view&employee_id=${employeeId}`, {
		// 	method: "GET",
		// })
		// .then((res) => res.json())
		getService.getCall('project_todo.php', {
					action: 'view',
					employee_id:employeeId
				})
		.then((data) => {
			if (data.status === 'success' && Array.isArray(data.data)) {
				this.setState({ todos: data.data, loading: false });
			} else {
				this.setState({ todos: [], loading: false });
			}
		})
		.catch((error) => {
			console.error("Error fetching todos:", error);
			this.setState({ todos: [], loading: false });
		});
	};


	fetchLeaveData = (employee_id, start_date, end_date) => {
		getService.getCall('employee_leaves.php', {
			action: 'view',
			start_date:start_date,
			end_date:end_date,
			employee_id:employee_id
		})
				.then((data) => {
					if (data.status === "success" && Array.isArray(data.data)) {
						if(employee_id === ''){
							this.setState({ leaveData: [] });
						}else{
							this.setState({ leaveData: data.data });
						}
					} else {
					this.setState({ leaveData: [] });
					}
				})
				.catch((err) => {
				console.error("Error fetching leave data:", err);
				this.setState({ leaveData: [] });
			});
	};

	// Handle year selection
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
	localStorage.setItem('startDate', newDate);
	
	localStorage.setItem('eventEndDate', eventEndDate);
	this.fetchEvents();
	this.fetchWorkingHoursReports();
	this.getMissingReportEvents();
	this.fetchLeaveData(localStorage.getItem('empId'), newDate, newEndDate);


};

	handleClose = (messageType) => {
		if (messageType === 'success') {
		  this.setState({ showSuccess: false, successMessage: '' });
		} else if (messageType === 'error') {
		  this.setState({ showError: false, errorMessage: '' });
		}
	};

	// Function for "Add" button based on active tab
    openAddEventModel = () => {
		this.setState({
			selectedEvent: null,
			selectedEmployeeIdForModal: '',
			event_name: '',
			event_date: '',
			errors: {},
			showAddEventModal: true,
		});
    };

	closeAddEventModal = () => {
        this.setState({
			showAddEventModal: false,
			selectedEmployeeIdForModal: '',
			event_name: '',
			event_date: '',
			errors: {},
		});
    };

	// Handle input changes for add event
	handleInputChangeForAddEvent = (event) => {
        const { name, value } = event.target;
        this.setState({
			[name]: value,
			errors: { ...this.state.errors, [name]: "" } // Clear error for this field
		});
    };

	// Validate form inputs
	validateForm = (e) => {
		e.preventDefault();
		let isValid = true;

		// Check if we're editing or adding an event
		const eventData = this.state.selectedEvent || this.state;
		const { event_name, event_date } = eventData;

		// Usage:
		const validationSchema = [
		  { name: 'event_name', value: event_name, type: 'name', required: true, messageName: 'Event name' },
		  { name: 'event_date', value: event_date, type: 'date', required: true, messageName: 'Event date' }
		];

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

	getAlternateSaturday = async () => {
		const now = localStorage.getItem('startDate') ? new Date(localStorage.getItem('startDate')) : new Date();
		try {
			const data = await getService.getCall('alternate_saturdays.php', {
				action: 'view',
				year:now.getFullYear()
			})

			this.setState({
				alternateSatudays: data?.data
			})
			
		 } catch (error) {
      console.error("Failed to fetch saved Saturdays:", error);
    }
	}

	addEvent = (e) => {
		// Prevent default form submission behavior
		e.preventDefault();
		this.setState({ ButtonLoading: false });
		// Reset selectedEvent before adding a new event
		if (this.state.selectedEvent) {
			this.setState({
				selectedEvent: null,
			});
		}

		if (this.validateForm(e)) {
			const { event_name, event_date, logged_in_employee_id } = this.state;

			const addEventData = new FormData();
			addEventData.append('employee_id', logged_in_employee_id); // Always use logged in user's ID
			addEventData.append('event_name', event_name);
			addEventData.append('event_date', event_date);
			addEventData.append('event_type', 'event');
			addEventData.append('created_by', logged_in_employee_id);

			// API call to add event
			getService.addCall('events.php','add', addEventData)
			.then((data) => {
				if (data.status === "success") {
					this.setState((prevState) => {
						const updatedEventData = [...(prevState.events || []), data.data];
						
						// Return the updated state
						return {
							events: updatedEventData,
							
							// Clear form fields after submission
							event_name: "",
							event_date: "",
							showAddEventModal: false,
							successMessage: data.message,
							showSuccess: true,
							errors: {}, // Clear errors
							ButtonLoading: false,
						};
					});

					// Auto-hide success message after 3 seconds
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

					// Auto-hide error message after 3 seconds
					setTimeout(() => {
						this.setState({
							errorMessage: '',
							showError: false
						});
					}, 3000);
				}
			})
			// .catch((error) => console.error("Error:", error));
			.catch((error) => {
				console.error("Error:", error);
				this.setState({
					ButtonLoading: false,
				});
			});
		}
    };

	// add handle events delete
	handleDeleteEvent = (eventId) => {
		this.setState({ ButtonLoading: true });
		const eventToDelete = this.state.events.find(ev => ev.id === eventId);
		if (!eventToDelete) {
			this.setState({
				errorMessage: 'Event not found',
				showError: true,
				loading: false,
				ButtonLoading: false,
			});
			return;
		}

		getService.deleteCall('events.php','delete', eventId, null, null, null)
		.then(data => {
			if (data.status === 'success') {
				this.setState(prevState => ({
					events: prevState.events.filter(ev => ev.id !== eventId),
					successMessage: 'Event deleted successfully!',
					showSuccess: true,
					loading: false,
					ButtonLoading: false,
					showDeleteModal:false
				}));
				this.closeDeleteModal(); // Close the modal after successful delete
				setTimeout(() => this.setState({ showSuccess: false }), 2000);
			} else {
				throw new Error(data.message || 'Failed to delete event');
			}
		})
		.catch(err => {
			this.setState({
				errorMessage: err.message || 'Failed to delete event',
				showError: true,
				loading: false,
				ButtonLoading: false
			});
			setTimeout(() => this.setState({ showError: false }), 2000);
		});
	}

	//Add new open delete modal
	openDeleteModal = (eventId) => {
		this.setState({ showDeleteModal: true, eventIdToDelete: eventId });
	};

	//Add new close delete modal
	closeDeleteModal = () => {
		this.setState({ showDeleteModal: false, eventIdToDelete: null });
	};

	formatLeaveEvents = (leaveData) => {
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
					// color: "#FFA500"
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


formatDate = (date) => {
	const d = new Date(date);
	const year = d.getFullYear();
	const month = (`0${d.getMonth() + 1}`).slice(-2);
	const day = (`0${d.getDate()}`).slice(-2);
	return `${year}-${month}-${day}`;
};
	
// Add this method to calculate missing reports for any employee
	getMissingReportEvents = (workingHoursReports, selectedYear) => {
	
    const missingReportEvents = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(selectedYear, 0, 1);
    const endDate = new Date(selectedYear, 11, 31);
    let currentDate = new Date(startDate);

	
	while (currentDate < today && currentDate <= endDate) {
		const dateStr = this.formatDate(currentDate);
		
		const hasReport = this.hasReportForDate(dateStr, workingHoursReports);
			// this.state.allEvents
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
}

fetchEvents = () => {
	let startDate = localStorage.getItem('eventStartDate');
	let endDate = localStorage.getItem('eventEndDate');
	if (!startDate || !endDate) {
		const now = new Date();
		const firstDay = new Date(now.getFullYear(),1, 1);
		const lastDay = new Date(now.getFullYear(), 11, 32); // December 31st of the current year
		const formatDate = (date) =>
		date.toISOString().split('T')[0];
		startDate = formatDate(firstDay);
		endDate = formatDate(lastDay);
	}
	const birthdayEvents = this.state.employees.map(employee => {
		if (!employee.dob) {
			return null;
		}
		// Create birthday event for the selected year
		const dob = new Date(employee.dob);
		const month = dob.getMonth();
		const day = dob.getDate();
		const selectedYear = this.state.selectedYear;
		const birthdayDate = new Date(selectedYear, month, day);
		return {
			id: `birthday_${employee.id}`,
			event_name: `${employee.first_name} ${employee.last_name}'s Birthday`,
			event_date: this.formatDate(birthdayDate),
			event_type: 'birthday',
			employee_id: employee.id
		};
	}).filter(event => event !== null); // Remove null entries

	getService.getCall('events.php', {
		action: 'view',
		from_date:startDate,
		to_date:endDate
	})
	.then(data => {
		if (data.status === 'success') {
			const eventsData = data.data;
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			
			// Combine regular events with birthday events
			if (eventsData && eventsData.length > 0) {
				const allEvents = [...eventsData, ...birthdayEvents];
				this.setState({
					events: allEvents,
					loading: false
				});
			} else {
				this.setState({
					events: birthdayEvents,
					loading: false
				});
			}
			

		} else {
			this.setState({ message: data.message, loading: false });
		}
	})
	.catch(err => {
		console.error('Error fetching events:', err); // Debug log
		this.setState({ message: 'Failed to fetch data', loading: false });
	});
};

// Add function to handle report click
handleReportClick = (report) => {
    if (!report || typeof report !== 'object') {
        console.error('Invalid report object:', report);
        this.setState({
            showReportModal: true,
            selectedReport: null,
            errorMessage: 'No report data available',
            showError: true
        });
		
        setTimeout(() => this.setState({ showError: false, errorMessage: '' }), 3000);
        return;
    }
    const safeReport = {
        id: report.id || '',
        employee_id: report.employee_id || '',
        full_name: report.full_name || 'N/A',
        report: report.report || 'No report content available',
        start_time: report.start_time || '',
        end_time: report.end_time || '',
        break_duration_in_minutes: report.break_duration_in_minutes || 0,
        todays_working_hours: report.todays_working_hours || '',
        todays_total_hours: report.todays_total_hours || '',
        created_at: report.created_at || '',
		note: report.note || ''
    };

    this.setState({
        showReportModal: true,
        selectedReport: safeReport
    });
};

// Add function to close report modal
closeReportModal = () => {
    this.setState({
        showReportModal: false,
        selectedReport: null
    });
};

// Add formatDateTimeAMPM function
formatDateTimeAMPM = (timeString) => {
    if (!timeString || typeof timeString !== 'string') return '';

    // If input is in format "YYYY-MM-DD HH:mm" or "YYYY-MM-DD HH:mm:ss"
    if (timeString.includes(' ')) {
        const parts = timeString.split(' ');
        timeString = parts[1]; // Extract the time part
    }

    const [hours, minutes, seconds = '00'] = timeString.split(':');
    const now = new Date();

    now.setHours(parseInt(hours, 10));
    now.setMinutes(parseInt(minutes, 10));
    now.setSeconds(parseInt(seconds, 10));
    now.setMilliseconds(0);

    if (isNaN(now.getTime())) {
        console.warn("Invalid time format:", timeString);
        return '';
    }

    return now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

    render() {
        const { fixNavbar} = this.props;
		const {events, selectedYear, showAddEventModal, loading, employees, logged_in_employee_role, workingHoursReports, calendarView } = this.state;

		// Dynamic generation of years (last 50 years to next 10 years)
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
		this.state.defaultDate = localStorage.getItem('startDate') ??
			`${selectedYear}-${String(currentMonth).padStart(2, '0')}-01`;
		const defaultView = localStorage.getItem('defaultView') ?? 'month';

        const startYear = currentYear - 1;
        const endYear = currentYear + 10;
		
        // Generate an array of years
    	const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
		const filteredEvents = events?.map((event) => {
			let eventDate = new Date(event.event_date);
			let eventYear = eventDate.getFullYear();

			// For birthday events, keep them in the current year
			if (event.event_type === "birthday") {
				// Extract month and day from the original date
				const month = eventDate.getMonth();
				const day = eventDate.getDate();
				// Create new date with selected year
				eventDate = new Date(selectedYear, month, day);
			}
			// For regular events, update year if from previous year
			else if (event.event_type === "event" && eventYear < selectedYear) {
				eventDate.setFullYear(selectedYear);
			}

			return {
				...event,
				event_date: this.formatDate(eventDate), // Convert back to YYYY-MM-DD format
			};
		})
		.filter((event) => {
			const eventDate = new Date(event.event_date);
			const eventYear = eventDate.getFullYear();
			const today = new Date();
			today.setHours(0, 0, 0, 0);

			// For birthday events, show them for the selected year
			if (event.event_type === 'birthday') {
				return eventYear === selectedYear;
			}

			// For holidays, show them for the selected year
			if (event.event_type === 'holiday') {
				return eventYear === selectedYear;
			}

			// For regular events, show only upcoming events
			if (event.event_type === 'event') {
				return eventYear === selectedYear;
			}

			return false;
		})
		.sort((a, b) => {
			// Sort by date
			const dateA = new Date(a.event_date);
			const dateB = new Date(b.event_date);
			
			// If dates are the same, sort by event type (birthday first, then holiday, then event)
			if (dateA.getTime() === dateB.getTime()) {
				const typeOrder = { birthday: 0, holiday: 1, event: 2 };
				return typeOrder[a.event_type] - typeOrder[b.event_type];
			}
			
			return dateA - dateB;
		});

		// Add new Event Filter for no multiple time rendering 
		const uniqueEventsMap = new Map();
		if (filteredEvents && filteredEvents.length > 0) {
			filteredEvents.forEach(event => {
				if (event.event_type === 'event') {
					const key = event.event_name + '_' + event.event_date;
					if (!uniqueEventsMap.has(key)) {
						uniqueEventsMap.set(key, event);
					}
				} else if (event.event_type === 'birthday') {
					// For birthday events, use a unique key that includes the employee ID
					const key = `birthday_${event.id}`;
					uniqueEventsMap.set(key, event);
				} else if (event.event_type === 'holiday') {
					// For holiday events, use a unique key
					const key = `holiday_${event.id}`;
					uniqueEventsMap.set(key, event);
				}
			});
		}

		const uniqueFilteredEvents = Array.from(uniqueEventsMap.values());

		// Format filtered events, ensuring 'event' type events show up for all years
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

		// Add new Event Filter for no multiple time rendering 
		const uniqueEventsMap2 = new Map();
		if (filteredEvents && filteredEvents.length > 0) {
			filteredEvents.forEach(event => {
				if (event.event_type === 'event') {
					const key = event.event_name + '_' + event.event_date;
					if (!uniqueEventsMap2.has(key)) {
						uniqueEventsMap2.set(key, event);
					}
				} else if (event.event_type === 'birthday') {
					// For birthday events, use a unique key that includes the employee ID
					const key = `birthday_${event.id}`;
					uniqueEventsMap2.set(key, event);
				} else if (event.event_type === 'holiday') {
					// For holiday events, use a unique key
					const key = `holiday_${event.id}`;
					uniqueEventsMap2.set(key, event);
				}
			});
		}
		const uniqueFilteredEvents2 = Array.from(uniqueEventsMap2.values());

		 //Add new changes and create new functions
         //add this function for calculate totalworking hour or coloring according to  workinh hours
        const workingHoursEvents = workingHoursReports.map((report) => {
            const hoursStr = report.todays_working_hours?.slice(0, 5);
			const hours = parseFloat(hoursStr);
			

            let className = "daily-report";
			if (hours < 4) className = "red-event";
			else if (hours >= 4  && hours < 8) className = "half-day-leave-event";
				
            // else if (hours < 8) backgroundColor = "#87ceeb";

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
		

		// Create events for days without reports
		const missingReportEvents = this.getMissingReportEvents(workingHoursReports, selectedYear);
		// Pass all events in fullcalendar
		const leaveEvents = this.formatLeaveEvents(this.state.leaveData);
		
			this.state.allEvents = [
				...workingHoursEvents,     
				...leaveEvents,
				...missingReportEvents,

			];
			if (calendarView === "any") {
			this.state.allEvents = [];
		}

		if (calendarView === "report") {
			this.state.allEvents = [
				...workingHoursEvents,
				...missingReportEvents,
				...leaveEvents,
			];
		}
		if (calendarView === "event") {
			this.state.allEvents = [
				...formattedEvents,
			];
		}

        return (
            <>
				<div>
					{/* Add the alert for success messages */}
					<div 
						className={`alert alert-success alert-dismissible fade show ${this.state.showSuccess ? "d-block" : "d-none"}`} 
						role="alert" 
						style={{ 
							position: "fixed", 
							top: "20px", 
							right: "20px", 
							zIndex: 1050, 
							minWidth: "250px", 
							boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" 
						}}
					>
						<i className="fa-solid fa-circle-check me-2"></i>
						{this.state.successMessage}
						<button
							type="button"
							className="close"
							aria-label="Close"
							onClick={() => this.setState({ showSuccess: false })}
						>
						</button>
					</div>

					{/* Add the alert for error messages */}
					<div 
						className={`alert alert-danger alert-dismissible fade show ${this.state.showError ? "d-block" : "d-none"}`} 
						role="alert" 
						style={{ 
							position: "fixed", 
							top: "20px", 
							right: "20px", 
							zIndex: 1050, 
							minWidth: "250px", 
							boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" 
						}}
					>
						<i className="fa-solid fa-triangle-exclamation me-2"></i>
						{this.state.errorMessage}
						<button
							type="button"
							className="close"
							aria-label="Close"
							onClick={() => this.setState({ showError: false })}
						>
						</button>
					</div>
                    <div className={`section-body ${fixNavbar ? "marginTop" : ""} mt-3`}>
                        <div className="container-fluid">
                            <div className="row clearfix row-deck">
							<div className="col-12">
                                <div className="card">
                                    <div className="card-body">
                                        <div className="row">
										<div className="col-lg-4 col-md-12 col-sm-12" style={{backgroundColor:"transparent"}}>
											<label htmlFor="year-selector" className='d-flex card-title mr-3 align-items-center'>
											Year:
											</label>
											<select id="year-selector" className='w-70 custom-select' value={selectedYear}
											onChange={this.handleYearChange}>
											{years.map(year => (
											<option key={year} value={year}>
												{year}
											</option>
											))}
											</select>
										</div>
										</div>
                                    </div>
                                </div>
                            </div>
								<div className="col-lg-4 col-md-12">
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
								{uniqueFilteredEvents2.length > 0 ? (
															uniqueFilteredEvents2.map((event) => {
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

																			{/* Show trash icon only for 'event' type and for admin/super_admin */}
																		{event.event_type === 'event' &&
																			(logged_in_employee_role === 'admin' || logged_in_employee_role === 'super_admin') && (
																			<button
																				className="btn btn-link text-danger position-absolute"
																				title="Delete Event"
																				onClick={() => this.openDeleteModal(event.id)}
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
																				{event.event_type === 'birthday'}
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

											{(logged_in_employee_role === 'admin' || logged_in_employee_role === 'super_admin') && (
                      						<TodoList employees={employees} logged_in_employee_role={logged_in_employee_role} />
                    						)}												
											</div>
											)}
										</div>
									</div>
								</div>
								<div className="col-lg-8 col-md-12">
									<div className="card">
										<div className="card-header bline">
											<h3 className="card-title">Event Calendar</h3>
											<div className="card-options">
											{logged_in_employee_role === "employee" && (
												<select
													className="form-control custom-select"
													value={calendarView}
													onChange={(e) => this.setState({ calendarView: e.target.value })}
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
												className=" custom-select" style={{width: "200px"}}
												value={this.state.leaveViewEmployeeId}
												onChange={e => {
													const empId = e.target.value;
													this.setState({ 
														leaveViewEmployeeId: empId,
														calendarView: empId ? 'employeeSelected' : 'event'
													});
													const start_date = `${selectedYear}-01-01`;
													const end_date = `${selectedYear}-12-31`;
													this.fetchLeaveData(empId, start_date, end_date);
													// empId ?
														localStorage.setItem('empId', empId) 
														// localStorage.removeItem('empId')
													this.fetchWorkingHoursReports(empId);
													// After fetching, update allEvents for the selected employee
													setTimeout(() => {
														const missingReportEvents = this.getMissingReportEvents(this.state.workingHoursReports, selectedYear);
														this.setState({
															allEvents: [
																...this.state.allEvents,
																...missingReportEvents,
															]
														});
													}, 500);
												}}
												>
										<option value="">All Events</option>
											{employees
												.filter(emp => emp.role !== 'admin' && emp.role !== 'super_admin') // Filter out admins
												.map(emp => (
												<option key={emp.id} value={emp.id}>
													{emp.first_name} {emp.last_name}
												</option>
												))
											}
										</select>
									</>
								)}									
                            				{/* Changes (END) */}
									</div>
							</div>
										<div className="card-body">
											{/* Pass the formatted events to the FullCalendar component */}
											<Fullcalender 
												events={this.state.allEvents} 
												defaultDate={this.state.defaultDate}
												alternateSatudays={this.state.alternateSatudays}
												defaultView={defaultView}
												onAction={this.fetchWorkingHoursReports}
												callEventAPI={this.fetchEvents}
												eventClick={(info) => {
													// The event data is directly in the info
													const eventData = info;
													// Try to find the corresponding report in workingHoursReports
													const report = this.state.workingHoursReports.find(r => 
														r.id === eventData.id || 
														r.created_at?.split(" ")[0] === eventData.start?.format('YYYY-MM-DD')
													);
													if (report && calendarView !== 'event') {
														this.handleReportClick(report);
													} 
												}}
											></Fullcalender>
										</div>
									</div>
								</div>
							</div>
                        </div>
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
											{/* Remove Employee Selection Section */}
											<div className="col-md-12">
												<div className="form-group">
													<label className="form-label" htmlFor="event_name">Event Name</label>
													<input
														type="text"
														className={`form-control ${this.state.errors.event_name ? "is-invalid" : ""}`}
														name='event_name'
														id='event_name'
														value={this.state.event_name}
														onChange={this.handleInputChangeForAddEvent}
													/>
													{this.state.errors.event_name && (
														<div className="invalid-feedback">{this.state.errors.event_name}</div>
													)}
												</div>
											</div>
											<div className="col-md-12">
												<div className="form-group">
													<label className="form-label" htmlFor="event_date">Event Date</label>
													<input
														type="date"
														className={`form-control ${this.state.errors.event_date ? "is-invalid" : ""}`}
														name='event_date'
														id='event_date'
														value={this.state.event_date}
														onChange={this.handleInputChangeForAddEvent}
														min={new Date().toISOString().split('T')[0]} 
													/>
													{this.state.errors.event_date && (
														<div className="invalid-feedback">{this.state.errors.event_date}</div>
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
											disabled={this.state.ButtonLoading}
										>
											{this.state.ButtonLoading ? (
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


				{this.state.showReportModal && this.state.selectedReport && (
					<ReportModal
						show={this.state.showReportModal}
						report={this.state.selectedReport}
						onClose={this.closeReportModal}
						userRole={this.state.logged_in_employee_role}
					/>
				)}

				{this.state.showDeleteModal && (
					// <DeleteModal
                    //     onConfirm={this.handleDeleteEvent(this.state.eventIdToDelete)}
                    //     isLoading={this.state.ButtonLoading}
                    //     deleteBody='Are you sure you want to delete this event?'
                    //     modalId=""
                    // />
					<div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
						<div className="modal-dialog" role="document">
							<div className="modal-content">
								<div className="modal-body">
									<p>Are you sure you want to delete this event?</p>
								</div>
								<div className="modal-footer">
									<button type="button" className="btn btn-secondary" onClick={this.closeDeleteModal}>
										Cancel
									</button>
									<button
										type="button"
										className="btn btn-danger"
										onClick={() => this.handleDeleteEvent(this.state.eventIdToDelete)}
										disabled={this.state.ButtonLoading}
									>
										{this.state.ButtonLoading && (
											<span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
										)}
										Delete
									</button>
								</div>
							</div>
						</div>
					</div>
				)}
            </>
        )
    }
}
const mapStateToProps = state => ({
    fixNavbar: state.settings.isFixNavbar
})

const mapDispatchToProps = dispatch => ({})
export default connect(mapStateToProps, mapDispatchToProps)(Events);