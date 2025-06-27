import React, { Component } from 'react';
import { connect } from 'react-redux';
import { breakInAction, breakDurationCalAction } from '../../../actions/settingsAction';
class Activities extends Component {
	constructor(props) {
		super(props);
		this.state = {
			activities: [],
			error: null,
			employeeData: [],
			selectedStatus: "",
			selectedEmployee: "",
			breakReason: "",
			loading: true,
			isBreakedIn: false,
			filterEmployeeId: "",
			breakReasonModal: false,
			successMessage: "",
            showSuccess: false,
            errorMessage: "",
            showError: false,
			ButtonLoading: false,
			filterFromDate: "",
			filterToDate: "",
		};
	}

    dismissMessages = () => {
        this.setState({
            showSuccess: false,
            successMessage: "",
            showError: false,
            errorMessage: "",
        });
    };

	componentDidMount() {
		let apiUrl = '';

		if (window.user.role === 'super_admin' || window.user.role === 'admin') {
			apiUrl = `${process.env.REACT_APP_API_URL}/activities.php?is_timeline=true`;
		}
		else {
			apiUrl = `${process.env.REACT_APP_API_URL}/activities.php?user_id=${window.user.id}&is_timeline=true`;
		}

		fetch(apiUrl, {
			method: "GET",
		})
			.then(response => response.json())
			.then(data => {
				if (data.status === 'success') {
					this.setState({ activities: data.data, loading: false });
				} else {
					this.setState({ error: data.message, loading: false });
				}
			})
			.catch(err => {
				this.setState({ error: 'Failed to fetch data' });
				console.error(err);
			});

		/** Get employees list */
		fetch(`${process.env.REACT_APP_API_URL}/get_employees.php`, {
			method: "GET",
		})
			.then(response => response.json())
			.then(data => {
				if (data.status === 'success') {
					this.setState({ employeeData: data.data });
				} else {
					this.setState({ error: data.message });
				}
			})
			.catch(err => {
				this.setState({ error: 'Failed to fetch data' });
				console.error(err);
			});

		/** Get employees list */
		fetch(`${process.env.REACT_APP_API_URL}/activities.php?action=get_break_status&user_id=${window.user.id}`)
			.then(response => response.json())
			.then(data => {
				if (data.status === 'success') {
					this.setState({ isBreakedIn: true });
					this.props.breakInAction(true);
				} else {
					this.setState({ isBreakedIn: false });
					this.props.breakInAction(false);
				}
			})
			.catch(err => {
				this.setState({ error: 'Failed to fetch data' });
				console.error(err);
			});
	}

	openbreakReasonModal = () => {
		if (!this.props.punchIn) {
			this.setState({
				errorMessage: "You need to Punch In first",
				showError: true,
				showSuccess: false,
			});
			setTimeout(this.dismissMessages, 3000);
			return;
		}

		this.setState({ breakReasonModal: true });
  	};
	
	closebreakReasonModal = () => {
		this.setState({ breakReasonModal: false });
	};

	handleBreakOut = () => {
		const formData = new FormData();
		formData.append('employee_id', window.user.id);
		formData.append('activity_type', 'Break');
		formData.append('description', null);
		formData.append('status', 'completed');

		// API call to add break
		fetch(`${process.env.REACT_APP_API_URL}/activities.php?action=add-by-user`, {
			method: "POST",
			body: formData,
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.status === "success") {
					this.setState({
						isBreakedIn: true,
						successMessage: data.message,
						showError: false,
						showSuccess: true,
					});
					const breakDuration = this.props.breakDuration || 0;
					this.props.breakDurationCalAction(breakDuration + data.data.break_duration);
					setTimeout(this.dismissMessages, 3000);
					this.componentDidMount();
				} else {
					this.setState({
						errorMessage: data.message,
						showError: true,
						showSuccess: false,
					});
					setTimeout(this.dismissMessages, 3000);
				}
			})
			.catch((error) => {
					this.setState({
						errorMessage: "Something went wrong. Please try again.",
						showError: true,
						showSuccess: false,
					});
					setTimeout(this.dismissMessages, 3000);
			});
	};

	handleSaveBreakIn = () => {
		this.setState({ ButtonLoading: true });
		if (!this.state.breakReason) {
			this.setState({ activityError: 'Please provide the reason for your break', ButtonLoading: false });
			// Hide the error message after 5 seconds
			setTimeout(() => {
				this.setState({ activityError: null });
			}, 5000)
			return;
		}

		const formData = new FormData();
		formData.append('employee_id', window.user.id);
		formData.append('activity_type', 'Break');
		formData.append('description', this.state.breakReason);
		formData.append('status', 'active');

		// API call to save the report and punch-out
		fetch(`${process.env.REACT_APP_API_URL}/activities.php?action=add-by-user`, {
			method: "POST",
			body: formData,
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.status === "success") {
					this.setState({
						isBreakedIn: false,
						breakReason: '',
						successMessage : data.message,
						showError: false,
						showSuccess: true,
						ButtonLoading: false
					});
					setTimeout(this.dismissMessages, 3000);
					document.querySelector("#addBreakReasonModal .close").click();
					this.componentDidMount();
				} else {
					this.setState({
						errorMessage: data.message,
						showError: true,
						showSuccess: false,
						ButtonLoading: false
					});
					setTimeout(this.dismissMessages, 3000);
				}
			})
			.catch((error) => {
					this.setState({
						errorMessage: "Something went wrong. Please try again.",
						showError: true,
						showSuccess: false,
						ButtonLoading: false
					});
					setTimeout(this.dismissMessages, 3000);
			});
	};


	// Handle dropdown change for employee
	handleEmployeeChange = (event) => {
		this.setState({ selectedEmployee: event.target.value });
	};

	// Handle dropdown change
	handleStatusChange = (event) => {
		this.setState({ selectedStatus: event.target.value });
	};

	// Handle textarea input change
	handleReasonChange = (event) => {
		this.setState({ breakReason: event.target.value });
	};

	addActivityForEmployee = () => {
		const { selectedEmployee, selectedStatus, breakReason } = this.state;
		this.setState({ ButtonLoading: true });
		// Validate form inputs
		if (!selectedEmployee && !selectedStatus) {
			this.setState({
				errorMessage: "Please select an employee and status",
				showError: true,
				showSuccess: false,
				ButtonLoading: false
			});
			return;
		}

		if (!selectedEmployee) {
			this.setState({
				errorMessage: "Please select an employee",
				showError: true,
				showSuccess: false,
				ButtonLoading: false
			});
			setTimeout(this.dismissMessages, 3000);
			return;
		}

		if (!selectedStatus) {
			this.setState({
				errorMessage: "Please select a status",
				showError: true,
				showSuccess: false,
				ButtonLoading: false
			});
			setTimeout(this.dismissMessages, 3000);
			return;
		}

		if (selectedStatus === 'active' && !breakReason) {
			this.setState({
				errorMessage: "Please enter the reason for break",
				showError: true,
				showSuccess: false,
				ButtonLoading: false
			});
			setTimeout(this.dismissMessages, 3000);
			return;
		}

		// Start loader when the login process begins
		this.setState({ loading: true });
		const formData = new FormData();
		formData.append('employee_id', selectedEmployee);
		formData.append('activity_type', 'Break');
		formData.append('description', breakReason);
		formData.append('status', selectedStatus);
		formData.append('created_by', window.user.id); //created by admin
		formData.append('updated_by', window.user.id); //updated by admin

		// API call to add break
		fetch(`${process.env.REACT_APP_API_URL}/activities.php?action=add-by-admin`, {
			method: "POST",
			body: formData,
		})
			.then((response) => response.json())
			.then((data) => {
				// Stop loader when API response is received
				this.setState({ loading: false, ButtonLoading: false });

				if (data.status === "success") {
					this.setState({
						successMessage : data.message,
						showError: false,
						showSuccess: true,
					});
					setTimeout(this.dismissMessages, 3000);
					// Close the modal
					document.querySelector("#addBreakModal .close").click();
					this.componentDidMount();
				} else {
					this.setState({
						errorMessage: data.message,
						showError: true,
						showSuccess: false,
					});
					setTimeout(this.dismissMessages, 3000);
				}
			})
			.catch((error) => {
				this.setState({ loading: false, ButtonLoading: false });
				this.setState({
					errorMessage: "Something went wrong. Please try again.",
					showError: true,
					showSuccess: false,
				});
				setTimeout(this.dismissMessages, 3000);
				console.error("Error:", error);
			});
	};

	// Add filter handler
	handleApplyFilter = async () => {
		this.setState({ loading: true });
		const { filterFromDate, filterToDate, filterEmployeeId } = this.state;
		let apiUrl = `${process.env.REACT_APP_API_URL}/activities.php?action=view&is_timeline=true`;

		if (filterEmployeeId) {
			apiUrl += `&user_id=${filterEmployeeId}`;
		}
		if (filterFromDate) {
			apiUrl += `&from_date=${filterFromDate}`;
		}
		if (filterToDate) {
			apiUrl += `&to_date=${filterToDate}`;
		}

		try {
			const response = await fetch(apiUrl);
			const data = await response.json();
			if (data.status === "success") {
				this.setState({ activities: data.data, loading: false });
			} else {
				this.setState({ activities: [], loading: false, error: data.message });
			}
		} catch (err) {
			this.setState({ activities: [], loading: false, error: "Failed to fetch data" });
		}
	};

	// Render function for Bootstrap toast messages
    renderAlertMessages = () => {
        return (
            
            <>
			
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
            </>
        );
    };

	render() {
		const { fixNavbar } = this.props;
		const { activities, employeeData, selectedStatus, selectedEmployee, breakReason, loading } = this.state;
		return (
			<>
			 {this.renderAlertMessages()}
				{/* <link rel="stylesheet" href="../assets/plugins/summernote/dist/summernote.css" /> */}
				<div>
					<div className={`section-body ${fixNavbar ? "marginTop" : ""} mt-3`}>

						{/* Filter Section */}
						<div className='container'>
							<div className="card mb-3">
								<div className="card-body">
									<div className="row">
										<div className="col-md-3">
											<label>From Date</label>
											<input
											type="date"
											className="form-control"
											value={this.state.filterFromDate}
											onChange={(e) => this.setState({ filterFromDate: e.target.value })}
											/>
										</div>
										<div className="col-md-3">
											<label>To Date</label>
											<input
											type="date"
											className="form-control"
											value={this.state.filterToDate}
											onChange={(e) => this.setState({ filterToDate: e.target.value })}
											/>
										</div>
										{(window.user.role === "admin" || window.user.role === "super_admin") && (
											<div className="col-md-3">
											<label>Employee</label>
											<select
												className="form-control"
												value={this.state.filterEmployeeId}
												onChange={(e) =>
												this.setState({ filterEmployeeId: e.target.value })
												}
											>
												<option value="">All Employees</option>
												{this.state.employeeData.map((emp) => (
												<option key={emp.id} value={emp.id}>
													{emp.first_name} {emp.last_name}
												</option>
												))}
											</select>
											</div>
										)}
										<div
											className={
											window.user.role === "admin" || window.user.role === "super_admin"
												? "col-md-3"
												: "col-md-4"
											}
										>
											<button
											className="btn btn-primary"
											style={{ marginTop: 34 }}
											onClick={this.handleApplyFilter}
											>
											Apply
											</button>
										</div>
									</div>
								</div>
							</div>
						</div>

												
						<div className="container-fluid">
							<div className="row clearfix">
								<div className="col-md-12">
									<div className="card">
										<div className="card-header bline d-flex justify-content-between align-items-center">
											<h3 className="card-title">Timeline Activity</h3>
											<div className="d-flex align-items-center">					
												{/* End Filter Section */}
												{/* Existing Add button */}
												{window.user.role !== 'employee' && (
													<button style={{ float: "right" }} type="button" className="btn btn-primary" data-toggle="modal" data-target="#addBreakModal">
														<i className="fe fe-plus mr-2" />Add
													</button>
												)}
												{window.user.role === 'employee' && (
													<button style={{ float: "right" }} className="btn btn-primary" onClick={this.state.isBreakedIn ? this.handleBreakOut : this.openbreakReasonModal} 
													
													//data-toggle={this.state.isBreakedIn ? "" : "modal"} 
													/*data-target={this.state.isBreakedIn ? "" : "#addBreakReasonModal"} */>
														{this.state.isBreakedIn ? 'Break Out' : 'Break In'}
													</button>
												)}
											</div>
										</div>
										{loading ? (
											<div className="dimmer active p-5">
												<div className="loader" />
											</div>
										) : (
											<div className="card-body">
												<div className="summernote"></div>
												{activities.length > 0 ? (
													activities.map((activity, index) => {
														const profilePic = activity.profile
															? `${process.env.REACT_APP_API_URL}/${activity.profile}`
															: "../assets/images/xs/avatar1.jpg";
														// Date Seperation
														let showSeparator = false;
														function getDateStr(activity) {
															const dateTime = activity.complete_in_time || activity.complete_out_time;
															if (!dateTime) return 'Unknown Date';
															return dateTime.split(' ')[0];
														}
														function getDisplayDateLabel(dateStr, isFirst) {
															if (!dateStr || dateStr === 'Unknown Date') {
																return isFirst ? '' : '';
															}
															const date = new Date(dateStr);
															if (isNaN(date.getTime())) {
																return isFirst ? '' : '';
															}
															const today = new Date();
															const yesterday = new Date();
															yesterday.setDate(today.getDate() - 1);
															function stripTime(d) {
																return new Date(d.getFullYear(), d.getMonth(), d.getDate());
															}
															const dateNoTime = stripTime(date);
															const todayNoTime = stripTime(today);
															const yesterdayNoTime = stripTime(yesterday);
															if (dateNoTime.getTime() === todayNoTime.getTime()) return '';
															if (dateNoTime.getTime() === yesterdayNoTime.getTime()) return 'Yesterday';
															return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
														}
														const currentDateStr = getDateStr(activity);
														let displayDate = '';
														if (index > 0) {
															const prevDateStr = getDateStr(activities[index - 1]);
															if (currentDateStr !== prevDateStr) {
																showSeparator = true;
																displayDate = getDisplayDateLabel(currentDateStr, false);
															}
														} else {
															showSeparator = true;
															displayDate = getDisplayDateLabel(currentDateStr, true);
														}
														return (
															<>
																{showSeparator && displayDate && (
																	<div style={{
																		display: 'flex',
																		alignItems: 'center',
																		margin: '32px 0',
																		width: '100%',
																	}}>
																		<div style={{ flex: 1, borderBottom: '1px solid #e5e7eb' }} />
																		<div style={{
																		margin: '0 12px',
																		padding: '6px 12px',
																		border: '1px solid #e5e7eb',
																		borderRadius: '999px',
																		background: '#fff',
																		color: '#4b5563',
																		fontSize: '0.9rem',
																		fontWeight: 500
																		}}>
																		<i className="fa fa-calendar-alt" style={{ marginRight: 6, color: '#9ca3af' }}></i>
																		{displayDate}
																		</div>
																		<div style={{ flex: 1, borderBottom: '1px solid #e5e7eb' }} />
																	</div>
																	)}

																{/* In Time Entry */}
																{activity.type === 'Break_in' && (
																	<div className="timeline_item ">
																		<img
																			className="tl_avatar"
																			src={profilePic}
																			alt={`${activity.first_name} ${activity.last_name}`}
																		/>
																		<span>
																			<a href="#" style={{fontWeight:"800"}}>{activity.first_name} {activity.last_name}</a>
																			<span className="mx-2">|</span>
																			<span className="text-secondary">Break In</span>
																			<small className="float-right text-right">
																				{activity.in_time}
																			</small>
																		</span>
																		<h6 className="text-secondary">
																			{activity.description}
																		</h6>
																		<div className="msg" style={{marginTop:"-8px"}}>
																				{activity.created_by && (
																					<a href={() => false} className="mr-20 text-muted"><i className="fa fa-user text-pink"></i> Created by System Admin</a>
																				)}
																		</div>
																	</div>
																)}
																{/* Out Time Entry */}
																{activity.type === 'Break_out' && (
																	<>
																		<div className="timeline_item ">
																			<img
																				className="tl_avatar"
																				src={profilePic}
																				alt={`${activity.first_name} ${activity.last_name}`}
																			/>
																			<span>
																				<a style={{fontWeight:"800"}} href="#">{activity.first_name} {activity.last_name}</a>
																				<span className="mx-2">|</span>
																				<span className="text-secondary">Break Out</span>
																				<small className="float-right text-right">
																					{activity.out_time}
																				</small>
																			</span>
																			<div className="msg" style={{marginTop:"-1px"}}>
																				{activity.updated_by && (
																					<a href={() => false} className="mr-20 text-muted"><i className="fa fa-user text-pink"></i> Edited by System Admin</a>
																				)}
																			</div>
																		</div>
																	</>
																)}

																{/* In Time Entry Punch */}
																{activity.type === 'Punch_in' && (
																	<div className="timeline_item ">
																		<img
																			className="tl_avatar"
																			src={profilePic}
																			alt={`${activity.first_name} ${activity.last_name}`}
																		/>
																		<span>
																			<a href="#" style={{fontWeight:"800"}}>{activity.first_name} {activity.last_name}</a>
																			<span className="mx-2">|</span>
																			<span className="text-secondary">Punch In</span>
																			<small className="float-right text-right">
																				{activity.in_time}
																			</small>
																		</span>
																		<div className="msg" style={{marginTop:"-8px"}}>
																				{activity.created_by && (
																					<a href={() => false} className="mr-20 text-muted"><i className="fa fa-user text-pink"></i> Created by System Admin</a>
																				)}
																		</div>
																	</div>
																)}
																{/* Out Time Entry */}
																{activity.type === 'Punch_out' && (
																	<div className="timeline_item ">
																		<img
																			className="tl_avatar"
																			src={profilePic}
																			alt={`${activity.first_name} ${activity.last_name}`}
																		/>
																		<span>
																			<a href="#" style={{fontWeight:"800"}}>{activity.first_name} {activity.last_name}</a>
																			<span className="mx-2">|</span>
																			<span className="text-secondary">Punch Out</span>
																			<small className="float-right text-right">
																				{activity.out_time}
																			</small>
																		</span>
																		<div className="msg" style={{marginTop:"-5px"}}>
																				{activity.updated_by && (
																					<a href={() => false} className="mr-20 text-muted"><i className="fa fa-user text-pink"></i> Edited by System Admin</a>
																				)}
																		</div>
																	</div>
																)}
															</>
															
														);
													})
												) : (
													<div className="text-center text-muted py-4">activities not found</div>
												)}
											</div>
										)}
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Add Break Modal */}
					<div className="modal fade" id="addBreakModal" tabIndex={-1} role="dialog" aria-labelledby="addBreakModalLabel" aria-hidden="true" data-backdrop="static" data-keyboard="false">
						<div className="modal-dialog" role="dialog">
							<div className={`modal-content ${loading ? 'dimmer active' : 'dimmer'}`}>
								<div className="modal-header">
									<h5 className="modal-title" id="addBreakModalLabel">Add Activity for Employee</h5>
									<button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>
									{loading && <div className="loader"></div>}
								</div>
								<div className="dimmer-content">
									<div className="modal-body">
										<div className="row clearfix">
											<div className="col-md-12">
												<div className="form-group">
													<select className="form-control" value={selectedEmployee} onChange={this.handleEmployeeChange}>
														<option value="">Select Employee</option>
														{employeeData.length > 0 ? (
															employeeData.map((employee, index) => (
																<option key={index} value={employee.id}>
																	{`${employee.first_name} ${employee.last_name}`}
																</option>
															))
														) : (
															<option value="">No Employees Available</option>
														)}
													</select>
												</div>
											</div>
											<div className="col-md-12">
												<div className="form-group">
													<select className="form-control" value={selectedStatus} onChange={this.handleStatusChange}>
														<option value="">Select Status</option>
														<option value="active">Break In</option>
														<option value="completed">Break Out</option>
													</select>
												</div>
											</div>
											{selectedStatus === "active" && (
												<div className="col-md-12">
													<div className="form-group">
														<textarea
															className="form-control"
															placeholder="Please provide the reason for your break"
															value={breakReason}
															onChange={this.handleReasonChange}
															rows="10"
															cols="50"
														/>
													</div>
												</div>
											)}
										</div>
									</div>
									<div className="modal-footer">
										<button type="button" className="btn btn-primary" onClick={this.addActivityForEmployee} disabled={this.state.ButtonLoading}>
											{this.state.ButtonLoading ? <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span> : null}
											Save changes
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>

		{/* Add Break reason Modal for loggedin employee */}
		{this.state.breakReasonModal && (
          <div
            className="modal fade show d-block"
            id="addBreakReasonModal"
            tabIndex="-1"
            role="dialog"
          >
					
						<div className="modal-dialog" role="dialog">
							<div className="modal-content">
								<div className="modal-header">
									<h5 className="modal-title" id="addBreakReasonModalLabel">Break Reason</h5>
									<button type="button" className="close" onClick={this.closebreakReasonModal}aria-label="Close"><span aria-hidden="true">×</span></button>
								</div>
								<div className="dimmer-content">
									<div className="modal-body">
										<div className="row clearfix">
											<div className="col-md-12">
												<div className="form-group">
													<textarea
														className="form-control"
														placeholder="Please provide the reason for your break"
														value={breakReason}
														onChange={this.handleReasonChange}
														rows="10"
														cols="50"
													/>
												</div>
											</div>
										</div>
									</div>
									<div className="modal-footer">
										<button type="button" className="btn btn-primary" onClick={this.handleSaveBreakIn} disabled={this.state.ButtonLoading}>
											{this.state.ButtonLoading ? <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span> : null}
											Save changes
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
 )}
				</div>
				
			</>
		);
	}
}
const mapStateToProps = state => ({
	fixNavbar: state.settings.isFixNavbar,
	punchIn: state.settings.isPunchIn,
	breakDuration: state.settings.breakDurationCalculation,
})

const mapDispatchToProps = dispatch => ({
	breakInAction: (e) => dispatch(breakInAction(e)),
	breakDurationCalAction: (e) => dispatch(breakDurationCalAction(e)),
})
export default connect(mapStateToProps, mapDispatchToProps)(Activities);