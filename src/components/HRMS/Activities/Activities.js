import React, { Component } from 'react';
import { connect } from 'react-redux';
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
			isPunchIn: false,
			breakReasonModal: false,

			successMessage: "",
            showSuccess: false,
            errorMessage: "",
            showError: false,
		};
	}

	    // Function to dismiss messages
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
			apiUrl = `${process.env.REACT_APP_API_URL}/activities.php`;
		}
		else {
			apiUrl = `${process.env.REACT_APP_API_URL}/activities.php?user_id=${window.user.id}`;
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
				} else {
					this.setState({ isBreakedIn: false });
				}
			})
			.catch(err => {
				this.setState({ error: 'Failed to fetch data' });
				console.error(err);
			});

			this.getPunchInStatus()
	}

	getPunchInStatus = async () => {
		try {
			const response = await fetch(`${process.env.REACT_APP_API_URL}/activities.php?action=get_punch_status&user_id=${window.user.id}`);
			const data = await response.json();
			if (data.status === 'success') {
			this.setState({ isPunchIn: true });
			} else {
			this.setState({ isPunchIn: false });
			}
		} catch (err) {
			this.setState({ error: 'Failed to fetch data' });
			console.error(err);
		}
	}

	openbreakReasonModal = () => {
		this.getPunchInStatus()
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
		if (this.state.isPunchIn === false) {
			this.setState({
				errorMessage: "You need to Punch In first",
				showError: true,
				showSuccess: false,
			});
			setTimeout(this.dismissMessages, 3000);
			return;
		}

		if (!this.state.breakReason) {
			this.setState({ activityError: 'Please provide the reason for your break' });
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
					});
					setTimeout(this.dismissMessages, 3000);
					document.querySelector("#addBreakReasonModal .close").click();
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

		// Validate form inputs
		if (!selectedEmployee && !selectedStatus) {
			this.setState({
				errorMessage: "Please select an employee and status",
				showError: true,
				showSuccess: false,
			});
			return;
		}

		if (!selectedEmployee) {
			this.setState({
				errorMessage: "Please select an employee",
				showError: true,
				showSuccess: false,
			});
			setTimeout(this.dismissMessages, 3000);
			return;
		}

		if (!selectedStatus) {
			this.setState({
				errorMessage: "Please select a status",
				showError: true,
				showSuccess: false,
			});
			setTimeout(this.dismissMessages, 3000);
			return;
		}

		if (selectedStatus === 'active' && !breakReason) {
			this.setState({
				errorMessage: "Please enter the reason for break",
				showError: true,
				showSuccess: false,
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
				this.setState({ loading: false });

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
				this.setState({ loading: false });
				this.setState({
					errorMessage: "Something went wrong. Please try again.",
					showError: true,
					showSuccess: false,
				});
				setTimeout(this.dismissMessages, 3000);
				console.error("Error:", error);
			});
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
		const { activities, error, employeeData, selectedStatus, selectedEmployee, breakReason, loading, isBreakedIn } = this.state;
		return (
			<>
			 {this.renderAlertMessages()}
				{/* <link rel="stylesheet" href="../assets/plugins/summernote/dist/summernote.css" /> */}
				<div>
					<div className={`section-body ${fixNavbar ? "marginTop" : ""} mt-3`}>
						<div className="container-fluid">
							<div className="row clearfix">
								<div className="col-md-12">
									<div className="card">
										<div className="card-header bline d-flex justify-content-between align-items-center">
											<h3 className="card-title">Timeline Activity</h3>
											<div className="d-flex align-items-center">
												{(window.user.role === 'admin' || window.user.role === 'super_admin') && (
													<select
														className="form-control mr-2"
														style={{ minWidth: 200 }}
														value={this.state.filterEmployeeId}
														onChange={async (e) => {
															const employeeId = e.target.value;
															this.setState({ filterEmployeeId: employeeId, loading: true });
															let apiUrl = `${process.env.REACT_APP_API_URL}/activities.php`;
															if (employeeId) {
																apiUrl += `?user_id=${employeeId}`;
															}
															const res = await fetch(apiUrl);
															const data = await res.json();
															if (data.status === 'success') {
																this.setState({ activities: data.data, loading: false });
															} else {
																this.setState({ activities: [], loading: false });
															}
														}}
													>
														<option value="">All Employees</option>
														{this.state.employeeData.map(emp => (
															<option key={emp.id} value={emp.id}>
																{emp.first_name} {emp.last_name}
															</option>
														))}
													</select>
												)}
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
													activities.map((activity, index) => (
														<>
															{/* In Time Entry */}
															{activity.activity_type === 'Break' && (
																<div className="timeline_item ">
																	<img
																		className="tl_avatar"
																		src="../assets/images/xs/avatar1.jpg"
																		alt="fake_url"
																	/>
																	<span>
																		<a href={() => false}>{activity.first_name} {activity.last_name}</a> {/* {activity.location} */}
																		<small className="float-right text-right">
																			{activity.in_time}
																		</small>
																	</span>
																	<h6 className="font600">
																		(Break In) {activity.description}
																	</h6>

																	<div className="msg">
																		{activity.created_by && (
																			<a href={() => false} class="mr-20 text-muted"><i class="fa fa-user text-pink"></i> Created by System Admin</a>
																		)}
																	</div>
																</div>
															)}
															{/* Out Time Entry */}
															{activity.activity_type === 'Break' && activity.out_time && (
																<>
																	<div className="duration text-center">
																		------ {activity.duration} ------
																	</div>
																	<div className="timeline_item ">
																		<img
																			className="tl_avatar"
																			src="../assets/images/xs/avatar1.jpg"
																			alt="fake_url"
																		/>
																		<span>
																			<a href={() => false}>{activity.first_name} {activity.last_name}</a> {/* {activity.location} */}
																			<small className="float-right text-right">
																				{activity.out_time}
																			</small>
																		</span>
																		<h6 className="font600">
																			Break out
																		</h6>
																		<div className="msg">
																			{activity.updated_by && (
																				<a href={() => false} class="mr-20 text-muted"><i class="fa fa-user text-pink"></i> Edited by System Admin</a>
																			)}
																		</div>
																	</div>
																</>
															)}

															{/* In Time Entry Punch */}
															{activity.activity_type === 'Punch' && (
																<div className="timeline_item ">
																	<img
																		className="tl_avatar"
																		src="../assets/images/xs/avatar1.jpg"
																		alt="fake_url"
																	/>
																	<span>
																		<a href={() => false}>{activity.first_name} {activity.last_name}</a> {/* {activity.location} */}
																		<small className="float-right text-right">
																			{activity.in_time}
																		</small>
																	</span>
																	<h6 className="font600">
																		has started his day
																	</h6>

																	<div className="msg">
																		{activity.created_by && (
																			<a href={() => false} class="mr-20 text-muted"><i class="fa fa-user text-pink"></i> Created by System Admin</a>
																		)}
																	</div>
																</div>
															)}
															{/* Out Time Entry */}
															{activity.activity_type === 'Punch' && activity.out_time && (
																<>
																	<div className="duration text-center">
																		------ {activity.duration} ------
																	</div>
																	<div className="timeline_item ">
																		<img
																			className="tl_avatar"
																			src="../assets/images/xs/avatar1.jpg"
																			alt="fake_url"
																		/>
																		<span>
																			<a href={() => false}>{activity.first_name} {activity.last_name}</a> {/* {activity.location} */}
																			<small className="float-right text-right">
																				{activity.out_time}
																			</small>
																		</span>
																		<h6 className="font600">
																			has ended his day
																		</h6>
																		<div className="msg">
																			{activity.updated_by && (
																				<a href={() => false} class="mr-20 text-muted"><i class="fa fa-user text-pink"></i> Edited by System Admin</a>
																			)}
																		</div>
																	</div>
																</>
															)}
														</>
													))
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
										<button type="button" className="btn btn-primary" onClick={this.addActivityForEmployee}>Save changes</button>
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
										<button type="button" className="btn btn-primary" onClick={this.handleSaveBreakIn}>Save changes</button>
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
	fixNavbar: state.settings.isFixNavbar
})

const mapDispatchToProps = dispatch => ({})
export default connect(mapStateToProps, mapDispatchToProps)(Activities);