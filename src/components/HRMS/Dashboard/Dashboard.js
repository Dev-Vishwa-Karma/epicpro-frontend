import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import authService from "../../Authentication/authService";

class Dashboard extends Component {
	constructor(props) {
		super(props);
		this.state = {
			totalUsers: 0,
			totalEmployees: 0,
			totalEvents: 0,
			totalHolidays: 0,
			user: authService.getUser(),
			projects: [],
			loading: true,
			showBirthdayBannerModal: false,
			defaultProfileUrl: true,
			birthdayMessage: '',
			dontShowAgain: false
		};
	}

	componentDidMount() {
		var loggedInUser = JSON.parse(localStorage.getItem('user')); // Get logged-in user details

		const isMale = this.state.user.gender === 'male';
		this.setState({
			defaultProfileUrl : isMale ? '../../assets/images/sm/avatar2.jpg' : '../../assets/images/sm/avatar1.jpg',
		});

		const todayMD = new Date().toISOString().slice(5, 10);
		const dob = loggedInUser.dob?.slice(5, 10);

		if (localStorage.getItem("isBirthdayBannerVisible") !== 'false' && dob === todayMD) {
			const messages = [
				"Wishing you an incredible year filled with success, happiness, and health!",
				"May your day be as amazing as you are!",
				"Cheers to another year of greatness!",
				"Enjoy your special day to the fullest!",
				"May your birthday be filled with laughter and love!",
			];
			const randomMessage = messages[Math.floor(Math.random() * messages.length)];
		    this.setState({ birthdayMessage: randomMessage });

			this.openBirthdayBannerModel();
		}

		// Make the GET API call when the component is mounted
		fetch(`${process.env.REACT_APP_API_URL}/dashboard.php`, {
			method: "GET",
		})
		.then(response => response.json())
		.then(data => {
			if (data.status === 'success') {
				let totalUsers = data.data[0].total_users;
				let totalEmployees = data.data[0].total_employees;
				const totalHolidays = data.data[0].total_holidays;
				const totalEvents = data.data[0].total_events;

				// Check user role
                if (loggedInUser && loggedInUser.role === "employee") {
                    totalUsers = 0;
					totalEmployees = 1; // Only show their own count
                }

				this.setState(
					{ totalUsers: totalUsers, totalEmployees: totalEmployees, totalHolidays: totalHolidays, totalEvents: totalEvents}
				);
			} else {
			  	this.setState({ message: data.message });
			}
		})
		.catch(err => {
			this.setState({ message: 'Failed to fetch data' });
			console.error(err);
		});

		// Get projects data
        fetch(`${process.env.REACT_APP_API_URL}/projects.php?action=view&logged_in_employee_id=${window.user.id}&role=${window.user.role}`, {
            method: "GET",
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                this.setState({
                    projects: data.status === 'success' ? data.data : [],
                    loading: false
                });
            } else {
                this.setState({ error: data.message, loading: false });
            }
        })
        .catch(err => {
            this.setState({ error: 'Failed to fetch employees data' });
            console.error(err);
        });
	}

	openBirthdayBannerModel = () => {
		this.setState({
			showBirthdayBannerModal: true
		});
    };

	closeBirthdayBannerModal = () => {
		if (this.state.dontShowAgain) {
    		localStorage.setItem("isBirthdayBannerVisible", 'false');
  		}

		this.setState({
			showBirthdayBannerModal: false,
		});
    };

	handleCheckboxChange = (e) => {
		this.setState({ dontShowAgain: e.target.checked });
	};

	render() {
		const { fixNavbar } = this.props;
		const { totalUsers, totalEmployees, totalHolidays, totalEvents, user, projects, message, loading, showBirthdayBannerModal } = this.state;
		return (
			<>
				<div>
					<div className={`section-body ${fixNavbar ? "marginTop" : ""} mt-3`}>
						<div className="container-fluid">
							<div className="row clearfix">
								<div className="col-lg-12">
									<div className={`section-body ${fixNavbar ? "mb-4 mt-3" : "mb-4"}`}>
										<h4>Welcome {`${window.user.first_name} ${window.user.last_name}`}!</h4>
										{/* <small>
											Measure How Fast You’re Growing Monthly Recurring Revenue.{' '}
											<a href="fake_url">Learn More</a>
										</small> */}
									</div>
								</div>
							</div>
							{(user.role === "admin" || user.role === "super_admin") && (
								<div className="row clearfix justify-content-start">
									<div className="col-6 col-md-4 col-xl-1_7">
										<div className="card">
											<div className="card-body ribbon">
												<div className="ribbon-box green">{totalUsers}</div>
												{user.role === "admin" || user.role === "super_admin" ? (
													<Link to="/hr-users" className="my_sort_cut text-muted">
														<i className="icon-users" />
														<span>Users</span>
													</Link>
												) : (
													<div className="my_sort_cut text-muted">
														<i className="icon-users" />
														<span>Users</span>
													</div>
												)}
											</div>
										</div>
									</div>
									<div className="col-6 col-md-4 col-xl-1_7">
										<div className="card">
											<div className="card-body ribbon">
												<div className="ribbon-box pink">{totalEmployees}</div>
												<Link to="/hr-employee" className="my_sort_cut text-muted">
													<i className="icon-users" />
													<span>Employees</span>
												</Link>
											</div>
										</div>
									</div>
									<div className="col-6 col-md-4 col-xl-1_7">
										<div className="card">
											<div className="card-body ribbon">
											<div className="ribbon-box info">{totalHolidays}</div>
												<Link to="/hr-holidays" className="my_sort_cut text-muted">
													<i className="icon-like" />
													<span>Holidays</span>
												</Link>
											</div>
										</div>
									</div>
									<div className="col-6 col-md-4 col-xl-1_7">
										<div className="card">
											<div className="card-body ribbon">
												<div className="ribbon-box orange">{totalEvents}</div>
												<Link to="/hr-events" className="my_sort_cut text-muted">
													<i className="icon-calendar" />
													<span>Events</span>
												</Link>
											</div>
										</div>
									</div>
									<div className="col-6 col-md-4 col-xl-1_7">
										<div className="card">
											<div className="card-body">
												<Link to="/hr-report" className="my_sort_cut text-muted">
													<i className="icon-pie-chart" />
													<span>Report</span>
												</Link>
											</div>
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
					<div className="section-body">
						<div className="container-fluid">
							<div className="row clearfix row-deck">
								<div className="col-xl-12 col-lg-12 col-md-12">
									<div className="card">
										{/* <div className="card-header">
											<h3 className="card-title">Employee Structure</h3>
										</div>
										<div className="card-body text-center">
											<Columnchart></Columnchart>

										</div> */}

										{/* <div className="card-body text-center">
												<div className="row clearfix">
													<div className="col-6">
														<h6 className="mb-0">50</h6>
														<small className="text-muted">Male</small>
													</div>
													<div className="col-6">
														<h6 className="mb-0">17</h6>
														<small className="text-muted">Female</small>
													</div>
												</div>
											</div> */}
									</div>
								</div>
							</div>
							<div className="row clearfix">
								<div className="col-12 col-sm-12">
									<div className="card">
										<div className="card-header">
											<h3 className="card-title">Project Summary</h3>
										</div>
										<div className="card-body">
											{loading ? (
													<div className="dimmer active p-3">
														<div className="loader" />
													</div>
											) : (
												<div className="table-responsive">
													<table className="table table-hover table-striped text-nowrap table-vcenter mb-0">
														<thead>
															<tr>
																<th>#</th>
																<th>Client Name</th>
																<th>Team</th>
																<th>Project Name</th>
																<th>Technology</th>
															</tr>
														</thead>
														<tbody>
															{projects && projects.length > 0 ? (
																projects.map((project, index) => (
																	<tr key={project.id || index}>
																		<td>{(index + 1).toString().padStart(2, '0')}</td>
																		<td>{project.client_name}</td>
																		<td>
																			<ul className="list-unstyled team-info sm margin-0 w150">
																				{project.team_members.map((member, index) => (
																					<li key={index} data-toggle="tooltip" data-placement="top" title={`${member.first_name} ${member.last_name}`}
																					style={{
																						marginLeft:"3px"
																					}}
																					>
																						<span className="avatar avatar-blue add-space">
																							{member.first_name.charAt(0).toUpperCase()}{member.last_name.charAt(0).toUpperCase()}
																						</span>
																					</li>
																				))}
																			</ul>
																		</td>
																		<td>{project.project_name}</td>
																		<td>{project.project_technology}</td>
																	</tr>
																))
															): (
																!message && <tr><td>projects not available.</td></tr>
															)}
														</tbody>
													</table>
												</div>
											)}
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				{/* Modal for show birthday banner */}
				{showBirthdayBannerModal && (
				<div
					className="modal fade show d-block"
					id="birthdayBannerModal"
					tabIndex="-1"
					role="dialog"
					style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
					>
					<div className="modal-dialog modal-dialog-centered" role="document">
						<div className="modal-content text-center p-4" style={{ borderRadius: '15px', background: 'linear-gradient(to right, #ffecd2, #fcb69f)' }}>
						
							{/* Modal Header */}
							<div className="modal-header border-0">
								<h5 className="modal-title w-100 text-dark display-6 fw-bold">🎉 Happy Birthday! 🎂 </h5>
							</div>

							{/* Modal Body */}
							<div className="modal-body">
								<img
									src={this.state.user.profile || this.state.defaultProfileUrl}
									alt={this.state.user.first_name}
									className="rounded-circle shadow mb-3"
									width="130"
									height="130"
								/>
								<h3 className="fw-bold text-dark mb-2">{ this.state.user.first_name } {this.state.user.last_name}</h3>
								<p className="lead text-dark">
									{this.state.birthdayMessage}
								</p>
								<p className="text-muted small mt-3">
								— From all of us at <strong>Profilics Systems PVT. LTD.</strong>
								</p>
								<div className="form-check mt-4">
									<input
										className="form-check-input"
										type="checkbox"
										id="dontShowAgain"
										onChange={this.handleCheckboxChange}
										checked={this.state.dontShowAgain}
										/>
									<label className="form-check-label" htmlFor="dontShowAgain">
										Don’t show this again
									</label>
								</div>
							</div>

							{/* Modal Footer */}
							<div className="modal-footer border-0 justify-content-center">
								<button
								type="button"
								className="btn btn-outline-dark px-4"
								onClick={this.closeBirthdayBannerModal}
								>
								Thank You
								</button>
							</div>
						</div>
					</div>
				</div>

				)}
			</>
		);
	}
}
const mapStateToProps = state => ({
	fixNavbar: state.settings.isFixNavbar
})

const mapDispatchToProps = dispatch => ({})
export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);