import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import authService from "../../Authentication/authService";
import BirthdayBannerModal from '../../Shared/modals/BirthdayBannerModal';
import { getService } from '../../../services/getService';
import DashboardTable from './elements/DashboardTable';
import DashboardTodo from './elements/DashboardTodo';
import DashboardAdminTodo from './elements/DashboardAdminTodo';

class Dashboard extends Component {
	constructor(props) {
		super(props);
		this.state = {
			totalUsers: 0,
			totalEmployees: 0,
			totalEvents: 0,
			totalHolidays: 0,
			totalPendingTodos: 0,
			user: authService.getUser(),
			projects: [],
			loading: true,
			showBirthdayBannerModal: false,
			user_show_todo: true,
			user_show_project: true,
			global_show_todo: true,
			global_show_project: true
		};
	}

	componentDidMount() {
		var loggedInUser = authService.getUser();
		const todayMD = new Date().toISOString().slice(5, 10);
		const dob = loggedInUser.dob?.slice(5, 10);

		if (localStorage.getItem("isBirthdayBannerVisible") !== 'false' && dob === todayMD) {
			this.openBirthdayBannerModel();
		}

		this.getDashboardPreferences();
		this.fetchDashboardData();
		this.fetchProjectsData();

		// Reference changes from RightSidebar
		window.addEventListener('globalDashboardPrefsChanged', this.handlePrefsChange);
		window.addEventListener('dashboardPrefsChanged', this.handlePrefsChange);
	}

	componentWillUnmount() {
		window.removeEventListener('globalDashboardPrefsChanged', this.handlePrefsChange);
		window.removeEventListener('dashboardPrefsChanged', this.handlePrefsChange);
	}

	handlePrefsChange = (e) => {
		if (e.type === 'dashboardPrefsChanged') {
			this.setState({
				user_show_todo: e.detail.show_todo,
				user_show_project: e.detail.show_project
			});
		} else if (e.type === 'globalDashboardPrefsChanged') {
			this.setState({
				global_show_todo: e.detail.show_todo,
				global_show_project: e.detail.show_project
			});
		}
	};

	getDashboardPreferences = () => {
	  // Fetch user preferences for current user
	  getService.getCall('Settings.php', {
	    action: 'get-dashboard-preferences',
	    user_id: window.user.id
	  })
	  .then((data) => {
	    if (data.status === "success") {
	      this.setState({
	        user_show_todo: data.data.show_todo,
	        user_show_project: data.data.show_project
	      });
	    }
	  })
	  .catch((err) => {
	    console.error('Failed to fetch user preferences:', err);
	  });

	  // Fetch global preferences
	  getService.getCall('Settings.php', {
	    action: 'get-global-dashboard-preferences'
	  })
	  .then((data) => {
	    if (data.status === "success") {
	      this.setState({
	        global_show_todo: data.data.show_todo,
	        global_show_project: data.data.show_project
	      });
	    }
	  })
	  .catch((err) => {
	    console.error('Failed to fetch global preferences:', err);
	  });
	};

	fetchDashboardData = () => {
		getService.getCall('dashboard.php', {
			action: 'view'
		})
		.then(data => {
			if (data.status === 'success') {
				let totalUsers = data.data[0].total_users;
				let totalEmployees = data.data[0].total_employees;
				const totalHolidays = data.data[0].total_holidays;
				const totalEvents = data.data[0].total_events;
				const totalPendingTodos = data.data[0].total_pending_todos;

				// Check user role
				const loggedInUser = authService.getUser();
				if (loggedInUser && loggedInUser.role === "employee") {
					totalUsers = 0;
					totalEmployees = 1;
				}

				this.setState(
					{ totalUsers: totalUsers, totalEmployees: totalEmployees, totalHolidays: totalHolidays, totalEvents: totalEvents, totalPendingTodos: totalPendingTodos}
				);
			} else {
				this.setState({ message: data.message });
			}
		})
		.catch(err => {
			this.setState({ message: 'Failed to fetch data' });
			console.error(err);
		});
	};

	fetchProjectsData = () => {
		// Get projects data
		getService.getCall('projects.php', {
			action: 'view',
			logged_in_employee_id:window.user.id,
			role:window.user.role
		})
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
	};

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
			{ label: 'Todos', class_color: 'indigo', count: this.state.totalPendingTodos, icon: 'fa-tasks', link: '/project-todo', isFa: true },
			{ label: 'Users', class_color: 'green', count: this.state.totalUsers, icon: 'users', link: '/hr-users' },
			{ label: 'Employees', class_color: 'pink', count: this.state.totalEmployees, icon: 'users', link: '/hr-employee' },
			{ label: 'Holidays', class_color: 'info', count: this.state.totalHolidays, icon: 'like', link: '/hr-holidays' },
			{ label: 'Events', class_color: 'orange', count: this.state.totalEvents, icon: 'calendar', link: '/hr-events' },
		];

		return (
			<div className="row clearfix justify-content-start">
				{items.map(({ label, class_color, count, icon, link, isFa }) => (
					<div className="col-6 col-md-4 col-xl-1_7" key={label}>
						<div className="card">
							<div className="card-body ribbon">
							{count !== null && <div className={`ribbon-box ${class_color}`}>{count}</div>}
							<Link to={link} className="my_sort_cut text-muted">
								{isFa ? (
									<i className={`fa ${icon}`} />
								) : (
									<i className={`icon-${icon}`} />
								)}
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
		const { user, projects, loading, showBirthdayBannerModal, user_show_todo, user_show_project, global_show_todo, global_show_project } = this.state;
		const show_todo = global_show_todo && user_show_todo;
		const show_project = global_show_project && user_show_project;
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
								{/* Admin see all task and Employee see their task */}
								{show_todo && user.role === 'employee' && (
									<div className="col-12 col-sm-12">
										<DashboardTodo />
									</div>
								)}
								{show_todo && (user.role === 'admin' || user.role === 'super_admin') &&  (
									<div className="col-12 col-sm-12">
										<DashboardAdminTodo />
									</div>
								)}
								{show_project && (
									<div className="col-12 col-sm-12">
										<div className="card">
											<div className="card-header">
												<h3 className="card-title">Project Summary</h3>
											</div>
											<DashboardTable projects={projects} loading={loading}/>
										</div>
									</div>
								)}
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