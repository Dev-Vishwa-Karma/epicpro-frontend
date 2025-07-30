import React, { Component } from 'react'
import { connect } from 'react-redux';
import EventList from './EventList';
import EventCalendar from './EventCalendar';
import ReportModal from '../Report/ReportModal';
import DeleteModal from '../../common/DeleteModal';
import { getService } from '../../../services/getService';
import AlertMessages from '../../common/AlertMessages';

class Events extends Component {
	constructor(props) {
    super(props);
    const userRole = window.user?.role;
    this.state = {
      events: [],
      workingHoursReports: [],
      selectedYear: new Date().getFullYear(),
	  leaveViewEmployeeId: "",
      employee_id: null,
      errors: {
		event_name: '',
		event_date: '',
      },
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
						this.fetchEvents();
					});
				} else {
					this.setState({ error: data.message, loading: false });
				}
			})
			.catch(err => {
				this.setState({ error: 'Failed to fetch employees data' });
			});
	}

	fetchTodos = (employeeId) => {
		if (!employeeId) {
			this.setState({ todos: [] });
			return;
		}
	
		this.setState({ loading: true });
	
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

	handleYearChange = (year) => {
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
		
		this.fetchEvents();
		this.fetchWorkingHoursReports();
		this.getMissingReportEvents();
		this.fetchLeaveData(localStorage.getItem('empId'), newDate, newEndDate);
	};

	handleEmployeeChange = (empId) => {
		this.setState({ 
			leaveViewEmployeeId: empId,
			calendarView: empId ? 'employeeSelected' : 'event'
		});
		
		const start_date = `${this.state.selectedYear}-01-01`;
		const end_date = `${this.state.selectedYear}-12-31`;
		this.fetchLeaveData(empId, start_date, end_date);
		
		if (empId) {
			localStorage.setItem('empId', empId);
		} else {
			localStorage.removeItem('empId');
		}
		
		this.fetchWorkingHoursReports(empId);
	};

	handleViewChange = (view) => {
		this.setState({ calendarView: view });
	};

	handleClose = (messageType) => {
		if (messageType === 'success') {
		  this.setState({ showSuccess: false, successMessage: '' });
		} else if (messageType === 'error') {
		  this.setState({ showError: false, errorMessage: '' });
		}
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

	handleDeleteEvent = () => {
		const eventId = this.state.eventIdToDelete;
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
					showDeleteModal: false
				}));
				this.closeDeleteModal();
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

	openDeleteModal = (eventId) => {
		this.setState({ showDeleteModal: true, eventIdToDelete: eventId });
	};

	closeDeleteModal = () => {
		this.setState({ showDeleteModal: false, eventIdToDelete: null });
	};

	handleEventAdded = () => {
		this.fetchEvents();
	};

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

	closeReportModal = () => {
		this.setState({
			showReportModal: false,
			selectedReport: null
		});
	};

	fetchEvents = () => {
		let startDate = localStorage.getItem('eventStartDate');
		let endDate = localStorage.getItem('eventEndDate');
		if (!startDate || !endDate) {
			const now = new Date();
			const firstDay = new Date(now.getFullYear(),1, 1);
			const lastDay = new Date(now.getFullYear(), 11, 32);
			const formatDate = (date) =>
			date.toISOString().split('T')[0];
			startDate = formatDate(firstDay);
			endDate = formatDate(lastDay);
		}
		const birthdayEvents = this.state.employees.map(employee => {
			if (!employee.dob) {
				return null;
			}
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
		}).filter(event => event !== null);

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
			console.error('Error fetching events:', err);
			this.setState({ message: 'Failed to fetch data', loading: false });
		});
	};

	formatDate = (date) => {
		const d = new Date(date);
		const year = d.getFullYear();
		const month = (`0${d.getMonth() + 1}`).slice(-2);
		const day = (`0${d.getDate()}`).slice(-2);
		return `${year}-${month}-${day}`;
	};

    render() {
        const { fixNavbar} = this.props;
		const {
			events, 
			selectedYear, 
			loading, 
			employees, 
			logged_in_employee_role, 
			workingHoursReports, 
			calendarView, 
			showSuccess, 
			successMessage, 
			showError, 
			errorMessage,
			leaveData,
			alternateSatudays,
			showReportModal,
			selectedReport,
			showDeleteModal,
			ButtonLoading
		} = this.state;

		const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
		this.state.defaultDate = localStorage.getItem('startDate') ??
			`${selectedYear}-${String(currentMonth).padStart(2, '0')}-01`;

        const startYear = currentYear - 1;
        const endYear = currentYear + 10;
        const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

        return (
            <>
				<div>
					<AlertMessages
						showSuccess={showSuccess}
						successMessage={successMessage}
						showError={showError && !!errorMessage}
						errorMessage={errorMessage}
						setShowSuccess={(val) => this.setState({ showSuccess: val })}
						setShowError={(val) => this.setState({ showError: val })}
					/>
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
													onChange={(e) => this.handleYearChange(Number(e.target.value))}>
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
									<EventList
										events={events}
										loading={loading}
										logged_in_employee_role={logged_in_employee_role}
										employees={employees}
										selectedYear={selectedYear}
										logged_in_employee_id={this.state.logged_in_employee_id}
										onDeleteEvent={this.openDeleteModal}
										onEventAdded={this.handleEventAdded}
									/>
								</div>
								<div className="col-lg-8 col-md-12">
									<EventCalendar
										events={events}
										workingHoursReports={workingHoursReports}
										leaveData={leaveData}
										alternateSatudays={alternateSatudays}
										employees={employees}
										logged_in_employee_role={logged_in_employee_role}
										selectedYear={selectedYear}
										onReportClick={this.handleReportClick}
										onAction={this.fetchWorkingHoursReports}
										callEventAPI={this.fetchEvents}
										onYearChange={this.handleYearChange}
										onEmployeeChange={this.handleEmployeeChange}
										onViewChange={this.handleViewChange}
									/>
								</div>
							</div>
                        </div>
                    </div>
                </div>

				{this.state.showReportModal && this.state.selectedReport && (
					<ReportModal
						show={this.state.showReportModal}
						report={this.state.selectedReport}
						onClose={this.closeReportModal}
						userRole={this.state.logged_in_employee_role}
					/>
				)}

				<DeleteModal
					show={this.state.showDeleteModal}
					onConfirm={this.handleDeleteEvent}
					onClose={this.closeDeleteModal}
					isLoading={this.state.ButtonLoading}
					deleteBody='Are you sure you want to delete this event?'
					modalId="deleteEventModal"
				/>
            </>
        )
    }
}

const mapStateToProps = state => ({
    fixNavbar: state.settings.isFixNavbar
})

const mapDispatchToProps = dispatch => ({})

export default connect(mapStateToProps, mapDispatchToProps)(Events);