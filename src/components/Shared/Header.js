import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter, NavLink } from 'react-router-dom';
import authService from '../Authentication/authService';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

class Header extends Component {

	constructor(props) {
		super(props);
		this.state = {
			isPunchedIn: false,
			showModal: false,
			reports: [],
			report: '',
			start_time: '',
			end_time: '',
			todays_working_hours: '',
			break_duration_in_minutes: 0,
			todays_total_hours: '',
			error: {
				report: '',
				start_time: '',
				end_time: '',
				break_duration_in_minutes: ''
			},
			user: null,
			userId: null,
			userRole: null,
			punchError: null,
			punchSuccess: null,
			punchErrorModel: null,
		};
	}

	componentDidMount() {

		// Check if user exists in localStorage
		const user = JSON.parse(localStorage.getItem('user'));
		if (user) {
			window.user = user; // Attach user to the global window object
			const {id, role} = window.user;
			this.setState({
				user: user,
				userId: id,
				userRole: role
			})
		}

		/** Get employees list */
		fetch(`${process.env.REACT_APP_API_URL}/reports.php?action=get_punch_status&user_id=${window.user.id}`, {
			method: "GET",
		})
		fetch(`${process.env.REACT_APP_API_URL}/activities.php?action=get_punch_status&user_id=${window.user.id}`)
			.then(response => response.json())
			.then(data => {
				if (data.status === 'success') {
					this.setState({ isPunchedIn: true });
				} else {
					this.setState({ isPunchedIn: false });
				}
			})
			.catch((error) => {
				this.setState({ punchError: 'Something went wrong. Please try again.' });
				setTimeout(() => {
					this.setState({ punchError: null });
				}, 5000);
			});

		this.fetchReports();
	}

	fetchReports = (callback) => {
		fetch(`${process.env.REACT_APP_API_URL}/reports.php?user_id=${window.user.id}`)
			.then(response => response.json())
			.then(data => {
				if (data.status === 'success') {
					this.setState({ reports: data.data }, () => {
						if (typeof callback === 'function') {
							callback(data.data); // Always pass the data
						}
					});
				} else {
					console.warn("API returned non-success:", data);
					this.setState({ reports: [] }, () => {
						if (typeof callback === 'function') {
							callback([]); // Still run callback even if no success
						}
					});
				}
			})
			.catch(err => {
				console.error("Failed to fetch reports:", err);
				this.setState({ reports: [] }, () => {
					if (typeof callback === 'function') {
						callback([]);
					}
				});
			});
	};		

	handlePunchIn = () => {

		const formData = new FormData();
		formData.append('employee_id', window.user.id);
		formData.append('activity_type', 'Punch');
		formData.append('description', null);
		formData.append('status', 'active');

		// API call to punch-in
		// API call to add break
		fetch(`${process.env.REACT_APP_API_URL}/activities.php?action=add-by-user`, {
			method: "POST",
			body: formData,
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.status === "success") {
					this.setState({ punchSuccess: data.message, isPunchedIn: true });
					setTimeout(() => {
						this.setState({ punchSuccess: null });
					}, 5000);
				} else {
					this.setState({ punchError: data.message });
					// Hide the error message after 5 seconds
					setTimeout(() => {
						this.setState({ punchError: null });
					}, 5000);
				}
			})
			.catch((error) => {
				this.setState({ punchError: 'Something went wrong. Please try again.' });
				setTimeout(() => {
					this.setState({ punchError: null });
				}, 5000);
			});
	};

	/* handlePunchOut = () => {
		// Show modal when punching out
		//this.setState({ showModal: true });
	}; */

	handleReportChange = (e) => {
		this.setState({ report: e.target.value });
	};

	handleSaveReport = () => {

		const formData = new FormData();
		formData.append('employee_id', window.user.id);
		formData.append('activity_type', 'Punch');
		formData.append('description', this.state.report);
		formData.append('status', 'completed');

		if (!this.state.report) {
			this.setState({ punchErrorModel: 'Please provide the punch-out report.' });
			// Hide the error message after 5 seconds
			setTimeout(() => {
				this.setState({ punchErrorModel: null });
			}, 5000)
			return;
		}

		// API call to save the report and punch-out
		fetch(`${process.env.REACT_APP_API_URL}/activities.php?action=add-by-user`, {
			method: "POST",
			body: formData,
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.status === "success") {
					this.setState({ punchSuccess: data.message, isPunchedIn: false, showModal: false, report: '' });
					//window.location.href = '/hr-report';
					document.querySelector("#punchOutReportModal .close").click();
					setTimeout(() => {
						this.setState({ punchSuccess: null });
					}, 5000);
				} else {
					this.setState({ punchError: data.message });
					//window.location.href = '/hr-report';
					setTimeout(() => {
						this.setState({ punchError: null });
					}, 5000);
				}
			})
			.catch((error) => {
				this.setState({ punchError: 'Something went wrong. Please try again.' });
				setTimeout(() => {
					this.setState({ punchError: null });
				}, 5000);
			});
	};

	handleChange = (field, value) => {
		const updatedState = {
			[field]: value,
			error: { ...this.state.error, [field]: "" },
		};
	
		// Recalculate working hours when needed
		const { start_time, end_time } = this.state;
		const start = field === 'start_time' ? value : start_time;
		const end = field === 'end_time' ? value : end_time;
		const breakMinutes = field === 'break_duration_in_minutes' ? parseInt(value || 0, 10) : this.state.break_duration_in_minutes;

		if (start instanceof Date && end instanceof Date) {
			// Working duration (after break)
			const workingDuration = this.calculateWorkingHours(start, end, breakMinutes);
			const [wHours, wMinutes] = workingDuration.split(':');
			const workingHours = parseInt(wHours, 10);
			const workingMinutes = parseInt(wMinutes, 10);
			const workingDate = new Date(1970, 0, 1);
			workingDate.setHours(workingHours);
			workingDate.setMinutes(workingMinutes);
			workingDate.setSeconds(0);
			updatedState.todays_working_hours = workingDate;

			// Total hours (without break)
			const totalDuration = this.calculateWorkingHours(start, end, 0); // no break subtracted
			const [tHours, tMinutes] = totalDuration.split(':').map(str => parseInt(str, 10));
			const totalDate = new Date(1970, 0, 1, tHours, tMinutes, 0);
			updatedState.todays_total_hours = totalDate;
		}
	
		this.setState(updatedState);
	};
	
	calculateWorkingHours = (start, end, breakMinutes) => {
		try {
			if (!(start instanceof Date) || isNaN(start)) return "00:00";
			if (!(end instanceof Date) || isNaN(end)) return "00:00";
	
			breakMinutes = parseInt(breakMinutes || 0);
			if (isNaN(breakMinutes)) breakMinutes = 0;
	
			// Remove seconds/milliseconds for cleaner diff
			start.setSeconds(0, 0);
			end.setSeconds(0, 0);
	
			let diff = (end.getTime() - start.getTime()) / (1000 * 60); // in minutes
	
			if (diff < 0) diff += 1440;
			diff -= breakMinutes;
			if (diff < 0) diff = 0;
	
			const hours = Math.floor(diff / 60);
			const minutes = Math.round(diff % 60);
	
			return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
		} catch (err) {
			console.error('Error in calculateWorkingHours:', err);
			return "00:00";
		}
	};

	// Change the ISA time for storing the tables
	formatToMySQLDateTime = (date) => {
		if (!(date instanceof Date) || isNaN(date)) return null;
		const pad = (n) => n.toString().padStart(2, '0');
	
		return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
			   `${pad(date.getHours())}:${pad(date.getMinutes())}`;
	};

	// Handle add report button click
	handleReportClick = () => {
		this.fetchReports((reports) => {
	
			const today = new Date().toISOString().split("T")[0];
			const todayReportExists = reports.some(report => {
				const reportDate = new Date(report.created_at).toISOString().split("T")[0];
				return reportDate === today;
			});
	
			if (todayReportExists) {
				const messagePayload = {
					detail: { message: "You have already submitted today's report." }
				};

				if (this.props.location.pathname === "/hr-report") {
					window.dispatchEvent(new CustomEvent("reportMessage", messagePayload));
				} else {
					this.props.history.push({
						pathname: "/hr-report",
						state: { message: messagePayload.detail.message }
					});
				}
			} else {
				// Open modal
				const modalEl = document.getElementById('addReportModal');
				this.setState({
					error: {},
				});
				if (modalEl) {
					const modal = new window.bootstrap.Modal(modalEl);
					modal.show();
				} else {
					console.warn("Modal element not found.");
				}
			}
		});
	};

	validateReportForm = () => {
		const { report, start_time, end_time } = this.state;
		let error = {};
		let isValid = true;

		if (!report || report.trim() === "") {
			error.report = "Report is required.";
			isValid = false;
		}

		if (!start_time) {
			error.start_time = "Start time is required.";
			isValid = false;
		}

		if (!end_time) {
			error.end_time = "End time is required.";
			isValid = false;
		}

		if (start_time && end_time) {
			let start = typeof start_time === "string" ? new Date(start_time) : start_time;
			let end = typeof end_time === "string" ? new Date(end_time) : end_time;
		
			if (start.getTime() === end.getTime()) {
				error.start_time = "Start and end time cannot be the same.";
				error.end_time = "Start and end time cannot be the same.";
				isValid = false;
			} else if (start > end) {
				error.start_time = "Start time must be before end time.";
				error.end_time = "End time must be after start time.";
				isValid = false;
			}
		}			
	
		this.setState({ error });
		return isValid;
	};

	handleAddReport = () => {
		if (!this.validateReportForm()) {
			return;
		}

		const { report, start_time, break_duration_in_minutes, end_time, todays_working_hours, todays_total_hours } = this.state;

		const formData = new FormData();
		formData.append('employee_id', window.user.id);
		formData.append('report', report);
		formData.append('start_time', this.formatToMySQLDateTime(start_time));
		formData.append('break_duration_in_minutes', break_duration_in_minutes);
		formData.append('end_time', this.formatToMySQLDateTime(end_time));
		formData.append('todays_working_hours', this.formatToMySQLDateTime(todays_working_hours));
		formData.append('todays_total_hours', this.formatToMySQLDateTime(todays_total_hours));

		// API call to save the report and punch-out
		fetch(`${process.env.REACT_APP_API_URL}/reports.php?action=add-report-by-user`, {
			method: "POST",
			body: formData,
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.status === "success") {
					const newReport = data.data; // assume API returns the new report

					// Dispatch the custom event with new report
					window.dispatchEvent(new CustomEvent("reportMessage", {
						detail: { report: newReport }
					}));

					this.setState({
						punchSuccess: data.message,
						isPunchedIn: false,
						showModal: false,
						report: ''
					});

					document.querySelector("#addReportModal .close").click();

					setTimeout(() => {
						this.setState({ punchSuccess: null });
					}, 5000);
				} else {
					this.setState({ punchError: data.message });
					//window.location.href = '/hr-report';
					setTimeout(() => {
						this.setState({ punchError: null });
					}, 5000);
				}
			})
			.catch((error) => {
				this.setState({ punchError: 'Something went wrong. Please try again.' });
				setTimeout(() => {
					this.setState({ punchError: null });
				}, 5000);
			});
	};

	// Handle logout functionality
	handleLogout = () => {
		authService.logout(); 
		
		// Clear the user data from localStorage
		localStorage.removeItem('user');

		// Redirect to the login page
		window.location.href = '/login';
	};

	render() {
		const { fixNavbar, darkHeader } = this.props;
		const { /* isPunchedIn, */userRole, report, punchError, punchSuccess, punchErrorModel, userId, user, start_time, end_time, todays_working_hours, break_duration_in_minutes, todays_total_hours } = this.state;
		const currentTab = this.props.location?.state?.tab;
		return (
			<div>
				<div
					id="page_top"
					// className={isFixNavbar ? "sticky-top" : "" + this.props.dataFromParent === 'dark' ? 'section-body top_dark' : 'section-body'}
					className={`section-body ${fixNavbar ? "sticky-top" : ""} ${darkHeader ? "top_dark" : ""}`}
				>
					<div className="container-fluid">
						{/* Display activity success message */}
						{punchSuccess && (
							<div className="alert alert-success mb-0">{punchSuccess}</div>
						)}
						{/* Display error message */}
						{punchError && <div className="alert alert-danger mb-0">{punchError}</div>}
						<div className="page-header">
							<div className="left">
								<h1 className="page-title">{this.props.dataFromSubParent}</h1>
								{/* <select className="custom-select">
									<option>Year</option>
									<option>Month</option>
									<option>Week</option>
								</select>
								<div className="input-group xs-hide">
									<input type="text" className="form-control" placeholder="Search..." />
								</div> */}
							</div>
							<div className="right">
								{(userRole === 'employee') && (
									<button
										className="btn btn-primary"
										onClick={this.handleReportClick}
									>
										Report
									</button>
								)}
								{/* <button
									className="btn btn-primary"
									onClick={isPunchedIn ? this.handlePunchOut : this.handlePunchIn}
									data-toggle={isPunchedIn ? "modal" : ""} 
									data-target={isPunchedIn ? "#punchOutReportModal" : ""}
								>
									{isPunchedIn ? 'Punch Out' : 'Punch In'}
								</button> */}
								{/* <ul className="nav nav-pills">
									<li className="nav-item dropdown">
										<a
											className="nav-link dropdown-toggle"
											data-toggle="dropdown"

											role="button"
											aria-haspopup="true"
											aria-expanded="false"
										>
											Reports
										</a>
										<div className="dropdown-menu">
											<a className="dropdown-item" >
												<i className="dropdown-icon fa fa-file-excel-o" /> MS Excel
											</a>
											<a className="dropdown-item" >
												<i className="dropdown-icon fa fa-file-word-o" /> MS Word
											</a>
											<a className="dropdown-item" >
												<i className="dropdown-icon fa fa-file-pdf-o" /> PDF
											</a>
										</div>
									</li>
									<li className="nav-item dropdown">
										<a
											className="nav-link dropdown-toggle"
											data-toggle="dropdown"

											role="button"
											aria-haspopup="true"
											aria-expanded="false"
										>
											Project
										</a>
										<div className="dropdown-menu">
											<a className="dropdown-item" >
												Graphics Design
											</a>
											<a className="dropdown-item" >
												Angular Admin
											</a>
											<a className="dropdown-item" >
												PSD to HTML
											</a>
											<a className="dropdown-item" >
												iOs App Development
											</a>
											<div className="dropdown-divider" />
											<a className="dropdown-item" >
												Home Development
											</a>
											<a className="dropdown-item" >
												New Blog post
											</a>
										</div>
									</li>
								</ul> */}
								<div className="notification d-flex">
									{/* <div className="dropdown d-flex">
										<a
											href="/#"
											className="nav-link icon d-none d-md-flex btn btn-default btn-icon ml-1"
											data-toggle="dropdown"
										>
											<i className="fa fa-envelope" />
											<span className="badge badge-success nav-unread" />
										</a>
										<div className="dropdown-menu dropdown-menu-right dropdown-menu-arrow">
											<ul className="right_chat list-unstyled w250 p-0">
												<li className="online">
													<a href="fake_url">
														<div className="media">
															<img
																className="media-object "
																src="../assets/images/xs/avatar4.jpg"
																alt="fake_url"
															/>
															<div className="media-body">
																<span className="name">Donald Gardner</span>
																<span className="message">Designer, Blogger</span>
																<span className="badge badge-outline status" />
															</div>
														</div>
													</a>
												</li>
												<li className="online">
													<a href="fake_url">
														<div className="media">
															<img
																className="media-object "
																src="../assets/images/xs/avatar5.jpg"
																alt="fake_url"
															/>
															<div className="media-body">
																<span className="name">Wendy Keen</span>
																<span className="message">Java Developer</span>
																<span className="badge badge-outline status" />
															</div>
														</div>
													</a>
												</li>
												<li className="offline">
													<a href="fake_url">
														<div className="media">
															<img
																className="media-object "
																src="../assets/images/xs/avatar2.jpg"
																alt="fake_url"
															/>
															<div className="media-body">
																<span className="name">Matt Rosales</span>
																<span className="message">CEO, Epic Theme</span>
																<span className="badge badge-outline status" />
															</div>
														</div>
													</a>
												</li>
												<li className="online">
													<a href="fake_url">
														<div className="media">
															<img
																className="media-object "
																src="../assets/images/xs/avatar3.jpg"
																alt="fake_url"
															/>
															<div className="media-body">
																<span className="name">Phillip Smith</span>
																<span className="message">Writter, Mag Editor</span>
																<span className="badge badge-outline status" />
															</div>
														</div>
													</a>
												</li>
											</ul>
											<div className="dropdown-divider" />
											<a

												className="dropdown-item text-center text-muted-dark readall"
											>
												Mark all as read
											</a>
										</div>
									</div> */}
									{/* <div className="dropdown d-flex">
										<a
											href="/#"
											className="nav-link icon d-none d-md-flex btn btn-default btn-icon ml-1"
											data-toggle="dropdown"
										>
											<i className="fa fa-bell" />
											<span className="badge badge-primary nav-unread" />
										</a>
										<div className="dropdown-menu dropdown-menu-right dropdown-menu-arrow">
											<ul className="list-unstyled feeds_widget">
												<li>
													<div className="feeds-left">
														<i className="fa fa-check" />
													</div>
													<div className="feeds-body">
														<h4 className="title text-danger">
															Issue Fixed{' '}
															<small className="float-right text-muted">11:05</small>
														</h4>
														<small>WE have fix all Design bug with Responsive</small>
													</div>
												</li>
												<li>
													<div className="feeds-left">
														<i className="fa fa-user" />
													</div>
													<div className="feeds-body">
														<h4 className="title">
															New User{' '}
															<small className="float-right text-muted">10:45</small>
														</h4>
														<small>I feel great! Thanks team</small>
													</div>
												</li>
												<li>
													<div className="feeds-left">
														<i className="fa fa-thumbs-o-up" />
													</div>
													<div className="feeds-body">
														<h4 className="title">
															7 New Feedback{' '}
															<small className="float-right text-muted">Today</small>
														</h4>
														<small>It will give a smart finishing to your site</small>
													</div>
												</li>
												<li>
													<div className="feeds-left">
														<i className="fa fa-question-circle" />
													</div>
													<div className="feeds-body">
														<h4 className="title text-warning">
															Server Warning{' '}
															<small className="float-right text-muted">10:50</small>
														</h4>
														<small>Your connection is not private</small>
													</div>
												</li>
												<li>
													<div className="feeds-left">
														<i className="fa fa-shopping-cart" />
													</div>
													<div className="feeds-body">
														<h4 className="title">
															7 New Orders{' '}
															<small className="float-right text-muted">11:35</small>
														</h4>
														<small>You received a new oder from Tina.</small>
													</div>
												</li>
											</ul>
											<div className="dropdown-divider" />
											<a
												href="fake_url"
												className="dropdown-item text-center text-muted-dark readall"
											>
												Mark all as read
											</a>
										</div>
									</div> */}
									<div className="dropdown d-flex">
										<a
											href="/#"
											className="nav-link icon d-none d-md-flex btn btn-default btn-icon ml-1"
											data-toggle="dropdown"
										>
											<i className="fa fa-user" />
										</a>
										<div className="dropdown-menu dropdown-menu-right dropdown-menu-arrow">
											<NavLink 
												to={{
													pathname: "/view-employee",
													state: { employee: user, employeeId: userId, tab: "profile" }
												}}
												className={`dropdown-item ${currentTab === "profile" ? "active" : ""}`}
												isActive={(match, location) => location?.state?.tab === "profile"}
											>
												<i className="dropdown-icon fe fe-user" /> Profile
											</NavLink>

											<NavLink 
												to={{ 
													pathname: "/view-employee",
													state: { employee: user, employeeId: userId, tab: "calendar" }
												}}
												className={`dropdown-item ${currentTab === "calendar" ? "active" : ""}`}
												isActive={(match, location) => location?.state?.tab === "calendar"}
											>
												<i className="dropdown-icon fe fe-calendar" /> Calendar
											</NavLink>

											<NavLink
												to={{
													pathname: "/view-employee",
													state: { employee: user, employeeId: userId, tab: "timeline" }
												}}
												className={`dropdown-item ${currentTab === "timeline" ? "active" : ""}`}
												isActive={(match, location) => location?.state?.tab === "timeline"}
											>
												<i className="dropdown-icon fe fe-activity" /> Timeline
											</NavLink>
											{/* <a className="dropdown-item" >
												<i className="dropdown-icon fe fe-settings" /> Settings
											</a>
											<a className="dropdown-item">
												<span className="float-right">
													<span className="badge badge-primary">6</span>
												</span>
												<i className="dropdown-icon fe fe-mail" /> Inbox
											</a>
											<a className="dropdown-item" >
												<i className="dropdown-icon fe fe-send" /> Message
											</a> */}
											<div className="dropdown-divider" />
											<a className="dropdown-item" >
												<i className="dropdown-icon fe fe-help-circle" /> Need help?
											</a>
											<NavLink to="/login" className="dropdown-item" onClick={this.handleLogout}>
												<i className="dropdown-icon fe fe-log-out" /> Sign out
											</NavLink>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Modal for Punch Out Report */}
				{/* <div className="modal fade" id="punchOutReportModal" tabIndex={-1} role="dialog" aria-labelledby="punchOutReportModalLabel" aria-hidden="true" data-backdrop="static" data-keyboard="false">
					<div className="modal-dialog" role="break">
						<div className="modal-content">
							<div className="modal-header">
								<h5 className="modal-title" id="punchOutReportModalLabel">Please provide the punch-out report</h5>
								<button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>
							</div>
							<div className="dimmer-content">
								<div className="modal-body">
									{punchErrorModel && <div className="alert alert-danger mb-0">{punchErrorModel}</div>}
									<div className="row clearfix">
										<div className="col-md-12">
											<div className="form-group">
												<textarea
													className="form-control"
													placeholder="Please provide the punch-out report."
													value={report}
													onChange={this.handleReportChange}
													rows="30"
													cols="50"
												/>
											</div>
										</div>
									</div>
								</div>
								<div className="modal-footer">
									<button type="button" className="btn btn-primary" onClick={this.handleSaveReport}>Save changes</button>
								</div>
							</div>
						</div>
					</div>
				</div> */}

				{/* Modal for Add Report */}
				<div className="modal fade" id="addReportModal" tabIndex={-1} role="dialog" aria-labelledby="addReportModalLabel" aria-hidden="true" data-backdrop="static" data-keyboard="false">
					<div className="modal-dialog modal-xl" role="document">
						<div className="modal-content">
							<div className="modal-header">
								<h5 className="modal-title" id="addReportModalLabel">Daily Report</h5>
								<button type="button" className="close" data-dismiss="modal" aria-label="Close">
								<span aria-hidden="true">×</span>
								</button>
							</div>
							<div className="modal-body">
								{/* Display error message inside the modal */}
								{punchErrorModel && <div className="alert alert-danger mb-2">{punchErrorModel}</div>}

								<div className="row">
									{/* Left side: Report TextArea */}
									<div className="col-md-6">
										<div className="form-group">
											<textarea
												className={`form-control ${this.state.error.report ? "is-invalid" : ""}`}
												placeholder="Please provide the report."
												value={report}
												onChange={(e) => this.handleChange('report', e.target.value)}
												rows="15"
											/>
											{this.state.error.report && (
												<div className="invalid-feedback">{this.state.error.report}</div>
											)}
										</div>
									</div>

									{/* Right side: Form Fields */}
									<div className="col-md-6">
										<div className="row">
										
											{/* Start Time and Break Duration - side by side */}
											<div className="col-md-6">
												<div className="form-group">
												<label className="form-label">Start time</label>
												<DatePicker
													selected={start_time}
													onChange={(time) => this.handleChange('start_time', time)}
													showTimeSelect
													showTimeSelectOnly
													timeIntervals={15}
													timeCaption="Start time"
													dateFormat="h:mm aa"
													placeholderText="Select time"
													className={`form-control ${this.state.error.start_time ? "is-invalid" : ""}`}
												/>
												{this.state.error.start_time && (
													<div className="invalid-feedback d-block">{this.state.error.start_time}</div>
												)}
												</div>
											</div>

											<div className="col-md-6">
												<div className="form-group">
												<label className="form-label">Break duration (minutes)</label>
												<input
													type="number"
													min="0"
													className={`form-control ${this.state.error.break_duration_in_minutes ? "is-invalid" : ""}`}
													name="break_duration_in_minutes"
													id="break_duration_in_minutes"
													placeholder="Enter break minutes"
													value={break_duration_in_minutes || 0}
													onChange={(e) => this.handleChange('break_duration_in_minutes', e.target.value)}
												/>
												{this.state.error.break_duration_in_minutes && (
													<div className="invalid-feedback">{this.state.error.break_duration_in_minutes}</div>
												)}
												</div>
											</div>

											{/* End Time */}
											<div className="col-md-6">
												<div className="form-group">
												<label className="form-label">End time</label>
												<DatePicker
													selected={end_time}
													onChange={(time) => this.handleChange('end_time', time)}
													showTimeSelect
													showTimeSelectOnly
													timeIntervals={15}
													timeCaption="End time"
													dateFormat="h:mm aa"
													placeholderText="Select End time"
													className={`form-control ${this.state.error.end_time ? "is-invalid" : ""}`}
												/>
												{this.state.error.end_time && (
													<div className="invalid-feedback d-block">{this.state.error.end_time}</div>
												)}
												</div>
											</div>

											{/* Today's Working Hours */}
											<div className="col-md-6">
												<div className="form-group">
												<label className="form-label">Today's working hours</label>
												<DatePicker
													selected={todays_working_hours}
													onChange={(time) => this.handleChange('todays_working_hours', time)}
													showTimeSelect
													showTimeSelectOnly
													timeIntervals={15}
													timeCaption="Working hours"
													dateFormat="h:mm"
													placeholderText="Select working hours"
													className="form-control"
													disabled
												/>
												</div>
											</div>

											{/* Today's Total Hours */}
											<div className="col-md-6">
												<div className="form-group">
													<label className="form-label">Today's total hours</label>
													<DatePicker
														selected={todays_total_hours}
														onChange={(time) => this.handleChange('todays_total_hours', time)}
														showTimeSelect
														showTimeSelectOnly
														timeIntervals={15}
														timeCaption="Total hours"
														dateFormat="h:mm"
														className="form-control"
														disabled
													/>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>

							<div className="modal-footer">
								<button type="button" className="btn btn-primary" onClick={this.handleAddReport}>Submit</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
const mapStateToProps = state => ({
	fixNavbar: state.settings.isFixNavbar,
	darkHeader: state.settings.isDarkHeader
})

const mapDispatchToProps = dispatch => ({})
// export default connect(mapStateToProps, mapDispatchToProps)(Header);
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Header));
