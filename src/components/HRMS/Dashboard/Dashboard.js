import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import authService from "../../Authentication/authService";
import BirthdayBannerModal from '../../Shared/modals/BirthdayBannerModal';

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
		};
	}

	componentDidMount() {
		var loggedInUser = authService.getUser();
		const todayMD = new Date().toISOString().slice(5, 10);
		const dob = loggedInUser.dob?.slice(5, 10);

		if (localStorage.getItem("isBirthdayBannerVisible") !== 'false' && dob === todayMD) {
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
		this.setState({
			showBirthdayBannerModal: false,
		});
    };

	handleCheckboxChange = (e) => {
		this.setState({ dontShowAgain: e.target.checked });
	};

	renderStatCards() {
		const user = authService.getUser();
		if (!(user.role === 'admin' || user.role === 'super_admin')) return null;

		const items = [
			{ label: 'Users', class_color: 'green', count: this.state.totalUsers, icon: 'users', link: '/hr-users' },
			{ label: 'Employees', class_color: 'pink', count: this.state.totalEmployees, icon: 'users', link: '/hr-employee' },
			{ label: 'Holidays', class_color: 'info', count: this.state.totalHolidays, icon: 'like', link: '/hr-holidays' },
			{ label: 'Events', class_color: 'orange', count: this.state.totalEvents, icon: 'calendar', link: '/hr-events' },
			{ label: 'Report', class_color: null, count: null, icon: 'pie-chart', link: '/hr-report' },
		];

		return (
			<div className="row clearfix justify-content-start">
				{items.map(({ label, class_color, count, icon, link }) => (
					<div className="col-6 col-md-4 col-xl-1_7" key={label}>
						<div className="card">
							<div className="card-body ribbon">
							{count !== null && <div className={`ribbon-box ${class_color}`}>{count}</div>}
							<Link to={link} className="my_sort_cut text-muted">
								<i className={`icon-${icon}`} />
								<span>{label}</span>
							</Link>
							</div>
						</div>
					</div>
				))}
			</div>
		);
	}
	render() {
		const { fixNavbar } = this.props;
		const { user, projects, message, loading, showBirthdayBannerModal} = this.state;
		return (
			<>
				<div>
					<div className={`section-body ${fixNavbar ? "marginTop" : ""} mt-3`}>
						<div className="container-fluid">
							<div className="row clearfix">
								<div className="col-lg-12">
									<div className={`section-body ${fixNavbar ? "mb-4 mt-3" : "mb-4"}`}>
										<h4>Welcome {`${window.user.first_name} ${window.user.last_name}`}!</h4>
									</div>
								</div>
							</div>
							{(user.role === "admin" || user.role === "super_admin") && (
					            this.renderStatCards()
							)}
						</div>
					</div>
					<div className="section-body">
						<div className="container-fluid">
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
																					<li key={index} data-toggle="tooltip" data-placement="top" 
																						title={`${member.first_name} ${member.last_name}`}
																						style={{ marginLeft: "3px" }}
																					>
																						{member.profile ? (
																							<img 
																								src={`${process.env.REACT_APP_API_URL}/${member.profile}`} 
																								alt={`${member.first_name} ${member.last_name}`}
																								className="avatar avatar-blue add-space"
																								style={{
																									width: '35px',
																									height: '35px',
																									objectFit: 'cover',
																									borderRadius: '50%'
																								}}
																								onError={(e) => {
																									e.target.onerror = null;
																									e.target.style.display = 'none';
																									// This will display default avatar
																									e.target.parentNode.innerHTML = `
																										<span class="avatar avatar-blue add-space">
																											${member.first_name.charAt(0).toUpperCase()}${member.last_name.charAt(0).toUpperCase()}
																										</span>
																									`;
																								}}
																							/>
																						) : (
																							<span className="avatar avatar-blue add-space">
																								{member.first_name.charAt(0).toUpperCase()}{member.last_name.charAt(0).toUpperCase()}
																							</span>
																						)}
																					</li>
																				))}
																			</ul>
																		</td>
																		<td>{project.project_name}</td>
																		<td>{project.project_technology}</td>
																	</tr>
																))
															): (
																!message && <tr><td colSpan={5} className="text-center">Projects not available</td></tr>
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
					<BirthdayBannerModal 
						visible={showBirthdayBannerModal}
						user={user}
						onClose={this.closeBirthdayBannerModal}
					/>
				)}
			</>
		);
	}
}
const mapStateToProps = s => ({ fixNavbar: s.settings.isFixNavbar})
export default connect(mapStateToProps)(Dashboard);