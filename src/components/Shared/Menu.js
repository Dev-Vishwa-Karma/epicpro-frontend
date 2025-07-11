import React, { Component } from 'react';
import { connect } from 'react-redux';
import MetisMenu from 'react-metismenu';
import { Switch, Route, NavLink } from 'react-router-dom';
import Header from '../Shared/Header';
import Footer from '../Shared/Footer';
import DefaultLink from './DefaultLink';


import {
	darkModeAction, darkHeaderAction, fixNavbarAction,
	darkMinSidebarAction, darkSidebarAction, iconColorAction,
	gradientColorAction, rtlAction, fontAction,
	subMenuIconAction,
	menuIconAction,
	boxLayoutAction,
	statisticsAction, friendListAction,
	statisticsCloseAction, friendListCloseAction, toggleLeftMenuAction
} from '../../actions/settingsAction';
import Routes from '../Route';
import ProtectedRoute from '../ProtectedRoutes'; // Import the ProtectedRoute component

const masterNone = {
	display: 'none',
};

const masterBlock = {
	display: 'block',
};

// const adminAccessURL -

class Menu extends Component {
	constructor(props) {
		super(props);
		this.toggleLeftMenu = this.toggleLeftMenu.bind(this);
		this.toggleUserMenu = this.toggleUserMenu.bind(this);
		this.toggleRightSidebar = this.toggleRightSidebar.bind(this);
		this.toggleSubMenu = this.toggleSubMenu.bind(this);
		this.handleDarkMode = this.handleDarkMode.bind(this);
		this.handleFixNavbar = this.handleFixNavbar.bind(this);
		this.handleDarkHeader = this.handleDarkHeader.bind(this);
		this.handleMinSidebar = this.handleMinSidebar.bind(this);
		this.handleSidebar = this.handleSidebar.bind(this);
		this.handleIconColor = this.handleIconColor.bind(this);
		this.handleGradientColor = this.handleGradientColor.bind(this);
		this.handleRtl = this.handleRtl.bind(this);
		this.handleFont = this.handleFont.bind(this);
		this.handleStatistics = this.handleStatistics.bind(this);
		this.handleFriendList = this.handleFriendList.bind(this);
		this.closeFriendList = this.closeFriendList.bind(this);
		this.closeStatistics = this.closeStatistics.bind(this);
		this.handleBoxLayout = this.handleBoxLayout.bind(this);
		this.handler = this.handler.bind(this);
		this.state = {
			isToggleLeftMenu: false,
			isOpenUserMenu: false,
			isOpenRightSidebar: false,
			isBoxLayout: false,
			parentlink: null,
			childlink: null,
		};
	}

	componentDidMount() {
		const { location } = this.props;
		const links = location.pathname.substring(1).split(/-(.+)/);
		const parentlink = links[0];
		const nochildlink = links[1];

		if (parentlink && nochildlink && nochildlink === 'dashboard') {
			this.handler(parentlink, `${parentlink}${nochildlink}`);
		} else if (parentlink && nochildlink && nochildlink !== 'dashboard') {
			this.handler(parentlink, nochildlink);
		} else if (parentlink) {
			this.handler(parentlink, '');
		} else {
			this.handler('hr', 'dashboard');
		}
	}

	componentDidUpdate(prevprops, prevstate) {
		const { location } = this.props;
		const links = location.pathname.substring(1).split(/-(.+)/);
		const parentlink = links[0];
		const nochildlink = links[1];
		if (prevprops.location !== location) {
			if (parentlink && nochildlink && nochildlink === 'dashboard') {
				this.handler(parentlink, `${parentlink}${nochildlink}`);
			} else if (parentlink && nochildlink && nochildlink !== 'dashboard') {
				this.handler(parentlink, nochildlink);
			} else if (parentlink) {
				this.handler(parentlink, '');
			} else {
				this.handler('hr', 'dashboard');
			}
		}
	}

	handler(parentlink, nochildlink) {
		this.setState({
			parentlink: parentlink,
			childlink: nochildlink,
		});
	}

	handleDarkMode(e) {
		this.props.darkModeAction(e.target.checked)
	}
	handleFixNavbar(e) {
		this.props.fixNavbarAction(e.target.checked)
	}
	handleDarkHeader(e) {
		this.props.darkHeaderAction(e.target.checked)
	}
	handleMinSidebar(e) {
		this.props.darkMinSidebarAction(e.target.checked)
	}
	handleSidebar(e) {
		this.props.darkSidebarAction(e.target.checked)
	}
	handleIconColor(e) {
		this.props.iconColorAction(e.target.checked)
	}
	handleGradientColor(e) {
		this.props.gradientColorAction(e.target.checked)
	}
	handleRtl(e) {
		this.props.rtlAction(e.target.checked)
	}
	handleFont(e) {
		this.props.fontAction(e)
	}
	handleFriendList(e) {
		this.props.friendListAction(e)
	}
	handleStatistics(e) {
		this.props.statisticsAction(e)
	}
	closeFriendList(e) {
		this.props.friendListCloseAction(e)
	}
	closeStatistics(e) {
		this.props.statisticsCloseAction(e)
	}
	handleSubMenuIcon(e) {
		this.props.subMenuIconAction(e)
	}
	handleMenuIcon(e) {
		this.props.menuIconAction(e)
	}
	handleBoxLayout(e) {
		this.props.boxLayoutAction(e.target.checked)
	}
	toggleLeftMenu(e) {
		this.props.toggleLeftMenuAction(e)
	}
	toggleRightSidebar() {
		this.setState({ isOpenRightSidebar: !this.state.isOpenRightSidebar })
	}
	toggleUserMenu() {
		this.setState({ isOpenUserMenu: !this.state.isOpenUserMenu })
	}
	toggleSubMenu(e) {
		let menucClass = ''
		if (e.itemId) {
			const subClass = e.items.map((menuItem, i) => {
				if (menuItem.to === this.props.location.pathname) {
					menucClass = "in";
				} /* else {
					menucClass = "collapse";
				} */
				return menucClass
			})
			return subClass
			// return "collapse";
		} else {
			return e.visible ? "collapse" : "metismenu";
		}
	}

	render() {
		const content = [
			{
				"id": 'Directories',
				"label": "Directories"
			},
			{
				"id": 1,
				"icon": "icon-rocket",
				"label": "HRMS",
				"to": "#!",
				content: [
					{
						"id": 3,
						"label": "Dashboard",
						"to": "/"
					},
					/* {
						"id": 4,
						"label": "Users",
						"to": "/hr-users"
					}, */
					/* {
						"id": 5,
						"label": "Department",
						"to": "/hr-department"
					}, */
					/* {
						"id": 6,
						"label": "Employee",
						"to": "/hr-employee"
					}, */
					{
						"id": 7,
						"label": "Activities",
						"to": "/hr-activities"
					},
					{
						"id": 8,
						"label": "Holidays",
						"to": "/hr-holidays"
					},
					{
						"id": 9,
						"label": "Events",
						"to": "/hr-events"
					},
				
					{
						"id": 12,
						"label": "Reports",
						"to": "/hr-report"
					},
					{
						"id": 39,
						"label": "Gallery",
						"to": "/gallery",
					},
					{
						"id": 20,
						"label": "Todo List",
						"to": "/project-todo"
					}
				]
			},
			
		];

		// Only super admin or admin can see report
		// Check if user exists in localStorage
		const user = JSON.parse(localStorage.getItem('user'));
		if (!user) {
			// If no user is found, redirect to the login page
			window.location.href = '/login';
			return;
		} else {
			window.user = user; // Attach user to the global window object
			if (window.user.role === 'super_admin' || window.user.role === 'admin') {
				// Find the HRMS section
				const hrmsSection = content.find(item => item.id === 1);
				if (hrmsSection) {
					// Add the "Users" item to the HRMS section after the dashboard item
					const usersItem = {
						"id": 4,
						"label": "Users",
						"to": "/hr-users"
					};

					// Find the index of "Dashboard" (id: 3)
					const dashboardIndex = hrmsSection.content.findIndex(item => item.id === 3);

					if (dashboardIndex !== -1) {
						// Insert "Users" right after "Dashboard"
						hrmsSection.content.splice(dashboardIndex + 1, 0, usersItem);
					}

					// Add the "Department" item to the HRMS section after the users item
					const departmentItem = {
						"id": 5,
						"label": "Department",
						"to": "/hr-department"
					};

					// Find the index of "Users" (id: 4)
					const usersIndex = hrmsSection.content.findIndex(item => item.id === 4);

					if (usersIndex !== -1) {
						// Insert "Users" right after "Dashboard"
						hrmsSection.content.splice(usersIndex + 1, 0, departmentItem);
					}
					
					// Add the "Reports" item to the HRMS section
					/* hrmsSection.content.push(
						{
							"id": 12,
							"label": "Reports",
							"to": "/hr-report"
						}
					); */

					// Add the "Employee" item to the HRMS section after the department item
					const activities = {
						"id": 6,
						"label": "Employee",
						"to": "/hr-employee"
					};

					// Find the index of "Department" (id: 5)
					const activitiesIndex = hrmsSection.content.findIndex(item => item.id === 5);

					if (activitiesIndex !== -1) {
						// Insert "Employee" before "Activities"
						hrmsSection.content.splice(activitiesIndex + 1, 0, activities);
					}

					const statistics = {
						"id": 31,
						"label": "Statistics",
						"to": "/statistics"
					};

					// Find the index of "Department" (id: 5)
					const statisticsIndex = hrmsSection.content.findIndex(item => item.id === 6);

					if (statisticsIndex !== -1) {
						// Insert "Employee" before "Activities"
						hrmsSection.content.splice(statisticsIndex + 1, 0, statistics);
					}


					// // Add the "Payroll" for admin/super_admin item to the HRMS section after the Events item
					// const payroll = {
					// 	"id": 10,
					// 	"label": "Payroll",
					// 	"to": "/hr-payroll"
					// };

					// // Find the index of "Events" (id: 5)
					// const eventsIndex = hrmsSection.content.findIndex(item => item.id === 9);

					// if (eventsIndex !== -1) {
					// 	// Insert "Employee" before "Activities"
					// 	hrmsSection.content.splice(eventsIndex + 1, 0, payroll);
					// }

					// // Add the "Accounts" for admin/super_admin item to the HRMS section after the Payroll item
					// const accounts = {
					// 	"id": 11,
					// 	"label": "Accounts",
					// 	"to": "/hr-accounts"
					// };

					// // Find the index of "Payroll" (id: 10)
					// const payrollIndex = hrmsSection.content.findIndex(item => item.id === 10);

					// if (payrollIndex !== -1) {
					// 	// Insert "Employee" before "Activities"
					// 	hrmsSection.content.splice(payrollIndex + 1, 0, accounts);
					// }
				}

				// Find the index of "Projects section"
				const projectSection = content.find(item => item.id === 13)

				if (!projectSection) {
					content.push(
						{
							"id": 13,
							"icon": "icon-cup",
							"label": "Project",
							content: [
								{
									"id": 15,
									"label": "Project List",
									"to": "/project-list"
								},
								{
									"id": 19,
									"label": "Clients",
									"to": "/project-clients"
								},
								// {
								// 	"id": 20,
								// 	"label": "Todo List",
								// 	"to": "/project-todo"
								// }
							]
						},
					);
				}

				// Find the index of "Job Portal"
				// const jobPortalSection = content.find(item => item.id === 21);
				
				// if (!jobPortalSection) {
				// 	// Add the "Job Portal" section if it's missing for admin/super_admin roles
				// 	content.push({
				// 		"id": 21,
				// 		"icon": "icon-briefcase",
				// 		"label": "Job Portal",
				// 		"content": [
				// 			{
				// 				"id": 22,
				// 				"label": "Job Dashboard",
				// 				"to": "/jobportal-dashboard"
				// 			},
				// 			{
				// 				"id": 23,
				// 				"label": "Positions",
				// 				"to": "/jobportal-positions"
				// 			},
				// 			{
				// 				"id": 24,
				// 				"label": "Applicant",
				// 				"to": "/jobportal-applicants"
				// 			},
				// 			{
				// 				"id": 25,
				// 				"label": "Resumes",
				// 				"to": "/jobportal-resumes"
				// 			},
				// 			{
				// 				"id": 26,
				// 				"label": "Settings",
				// 				"to": "/jobportal-settings"
				// 			}
				// 		]
				// 	});
				// }

				// // Find the index of "authentication section"
				// const authenticationSection = content.find(item => item.id === 27);

				// if (!authenticationSection) {
				// 	content.push(
				// 		{
				// 			"id": 27,
				// 			"icon": "icon-lock",
				// 			"label": "Authentication",
				// 			content: [
				// 				{
				// 					"id": 28,
				// 					"label": "Login",
				// 					"to": "/login"
				// 				},
				// 				{
				// 					"id": 30,
				// 					"label": "Forgot Password",
				// 					"to": "/forgotpassword"
				// 				},
				// 				{
				// 					"id": 31,
				// 					"label": "404 error",
				// 					"to": "/notfound"
				// 				},
				// 				{
				// 					"id": 32,
				// 					"label": "500 Error",
				// 					"to": "/internalserver"
				// 				}
				// 			]
				// 		}
				// 	);
				// }
			}
		}

		const { isOpenRightSidebar, isOpenUserMenu } = this.state
		const { darkMinSidebar, istoggleLeftMenu, friendListOpen, statisticsOpen, statisticsClose, friendListClose } = this.props

		const pageHeading = Routes.filter((route) =>  route.path.split('/')[1] === this.props.location.pathname.split('/')[1])
		
		return (
			<>
				<div className={`${istoggleLeftMenu ? "offcanvas-active" : ""}`}>
					<div style={this.state.parentlink === 'login' ? masterNone : masterBlock}>
						<div id="header_top" className={`header_top ${darkMinSidebar && 'dark'}`}>
							<div className="container">
								<div className="hleft">
									<NavLink
										to="/"
										onClick={() => this.handler('hr', 'dashboard')}
										className="header-brand"
									>
										<i className="fe fe-command brand-logo" />
									</NavLink>
									<div className="dropdown">
										<NavLink to="/hr-events" className="nav-link icon app_inbox">
											<i className="fa fa-calendar" />
										</NavLink>
									</div>
								</div>
								<div className="hright">
									<div className="dropdown">
										{(window.user.role === 'admin' || window.user.role === 'super_admin') && (
											<div>
												<span className="nav-link icon settingbar" onClick={this.toggleRightSidebar}>
													<i
														className="fa fa-gear fa-spin"
														data-toggle="tooltip"
														data-placement="right"
														title="Settings"
													/>
												</span>
												{/* <p className="nav-link user_btn" onClick={this.toggleUserMenu}>
													<img
														className="avatar"
														src="/assets/images/user.png"
														alt="fake_alr"
														data-toggle="tooltip"
														data-placement="right"
														title="User Menu"
													/>
												</p> */}
											</div>
										)}
										<p className="nav-link icon menu_toggle" onClick={() => this.toggleLeftMenu(!istoggleLeftMenu)}>
											<i className="fa  fa-align-left" />
										</p>
									</div>
								</div>
							</div>
						</div>
						<div id="rightsidebar" className={`right_sidebar ${isOpenRightSidebar && "open"}`}>
							<span className="p-3 settingbar float-right" onClick={this.toggleRightSidebar}>
								<i className="fa fa-close" />
							</span>
							<ul className="nav nav-tabs" role="tablist">
								<li className="nav-item">
									<a className="nav-link active" data-toggle="tab" href="#Settings" aria-expanded="true">
										Settings
								</a>
								</li>
								<li className="nav-item">
									<a className="nav-link" data-toggle="tab" href="#activity" aria-expanded="false">
										Activity
								</a>
								</li>
							</ul>
							<div className="tab-content">
								<div
									role="tabpanel"
									className="tab-pane vivify fadeIn active"
									id="Settings"
									aria-expanded="true"
								>
									<div className="mb-4">
										<h6 className="font-14 font-weight-bold text-muted">Font Style</h6>
										<div className="custom-controls-stacked font_setting">
											<label className="custom-control custom-radio custom-control-inline">
												<input
													type="radio"
													className="custom-control-input"
													name="font"
													defaultChecked
													defaultValue="font-opensans"
													onChange={() => this.handleFont('font-opensans')}
												/>
												<span className="custom-control-label">Open Sans Font</span>
											</label>
											<label className="custom-control custom-radio custom-control-inline">
												<input
													type="radio"
													className="custom-control-input"
													name="font"
													defaultValue="font-montserrat"
													onChange={() => this.handleFont('font-montserrat')}
												/>
												<span className="custom-control-label">Montserrat Google Font</span>
											</label>
											<label className="custom-control custom-radio custom-control-inline">
												<input
													type="radio"
													className="custom-control-input"
													name="font"
													onChange={() => this.handleFont('font-roboto')}
												/>
												<span className="custom-control-label">Robot Google Font</span>
											</label>
										</div>
									</div>
									<div className="mb-4">
										<h6 className="font-14 font-weight-bold text-muted">Selected Menu Icon</h6>
										<div className="custom-controls-stacked arrow_option">
											<label className="custom-control custom-radio custom-control-inline">
												<input
													type="radio"
													className="custom-control-input"
													name="marrow"
													defaultValue="arrow-a"
													onChange={() => this.handleMenuIcon('list-a')}
												/>
												<span className="custom-control-label">A</span>
											</label>
											<label className="custom-control custom-radio custom-control-inline">
												<input
													type="radio"
													className="custom-control-input"
													name="marrow"
													defaultValue="arrow-b"
													onChange={() => this.handleMenuIcon('list-b')}
												/>
												<span className="custom-control-label">B</span>
											</label>
											<label className="custom-control custom-radio custom-control-inline">
												<input
													type="radio"
													className="custom-control-input"
													name="marrow"
													defaultValue="arrow-c"
													defaultChecked
													onChange={() => this.handleMenuIcon('list-c')}
												/>
												<span className="custom-control-label">C</span>
											</label>
										</div>

										<h6 className="font-14 font-weight-bold mt-4 text-muted">SubMenu List Icon</h6>
										<div className="custom-controls-stacked list_option">
											<label className="custom-control custom-radio custom-control-inline">
												<input
													type="radio"
													className="custom-control-input"
													name="listicon"
													defaultValue="list-a"
													defaultChecked
													onChange={() => this.handleSubMenuIcon('list-a')}
												/>
												<span className="custom-control-label">A</span>
											</label>
											<label className="custom-control custom-radio custom-control-inline">
												<input
													type="radio"
													className="custom-control-input"
													name="listicon"
													defaultValue="list-b"
													onChange={() => this.handleSubMenuIcon('list-b')}
												/>
												<span className="custom-control-label">B</span>
											</label>
											<label className="custom-control custom-radio custom-control-inline">
												<input
													type="radio"
													className="custom-control-input"
													name="listicon"
													defaultValue="list-c"
													onChange={() => this.handleSubMenuIcon('list-c')}
												/>
												<span className="custom-control-label">C</span>
											</label>
										</div>
									</div>
									<div>
										<h6 className="font-14 font-weight-bold mt-4 text-muted">General Settings</h6>
										<ul className="setting-list list-unstyled mt-1 setting_switch">
											<li>
												<label className="custom-switch">
													<span className="custom-switch-description">Night Mode</span>
													<input
														type="checkbox"
														name="custom-switch-checkbox"
														className="custom-switch-input btn-darkmode"
														onChange={(e) => this.handleDarkMode(e)}
													/>
													<span className="custom-switch-indicator" />
												</label>
											</li>
											<li>
												<label className="custom-switch">
													<span className="custom-switch-description">Fix Navbar top</span>
													<input
														type="checkbox"
														name="custom-switch-checkbox"
														className="custom-switch-input btn-fixnavbar"
														onChange={(e) => this.handleFixNavbar(e)}
													/>
													<span className="custom-switch-indicator" />
												</label>
											</li>
											<li>
												<label className="custom-switch">
													<span className="custom-switch-description">Header Dark</span>
													<input
														type="checkbox"
														name="custom-switch-checkbox"
														className="custom-switch-input btn-pageheader"
														onChange={(e) => this.handleDarkHeader(e)}
													/>
													<span className="custom-switch-indicator" />
												</label>
											</li>
											<li>
												<label className="custom-switch">
													<span className="custom-switch-description">Min Sidebar Dark</span>
													<input
														type="checkbox"
														name="custom-switch-checkbox"
														className="custom-switch-input btn-min_sidebar"
														onChange={(e) => this.handleMinSidebar(e)}
													/>
													<span className="custom-switch-indicator" />
												</label>
											</li>
											<li>
												<label className="custom-switch">
													<span className="custom-switch-description">Sidebar Dark</span>
													<input
														type="checkbox"
														name="custom-switch-checkbox"
														className="custom-switch-input btn-sidebar"
														onChange={(e) => this.handleSidebar(e)}
													/>
													<span className="custom-switch-indicator" />
												</label>
											</li>
											<li>
												<label className="custom-switch">
													<span className="custom-switch-description">Icon Color</span>
													<input
														type="checkbox"
														name="custom-switch-checkbox"
														className="custom-switch-input btn-iconcolor"
														onChange={(e) => this.handleIconColor(e)}
													/>
													<span className="custom-switch-indicator" />
												</label>
											</li>
											<li>
												<label className="custom-switch">
													<span className="custom-switch-description">Gradient Color</span>
													<input
														type="checkbox"
														name="custom-switch-checkbox"
														className="custom-switch-input btn-gradient"
														onChange={(e) => this.handleGradientColor(e)}
													/>
													<span className="custom-switch-indicator" />
												</label>
											</li>

											<li>
												<label className="custom-switch">
													<span className="custom-switch-description">RTL Support</span>
													<input
														type="checkbox"
														name="custom-switch-checkbox"
														className="custom-switch-input btn-rtl"
														onChange={(e) => this.handleRtl(e)}
													/>
													<span className="custom-switch-indicator" />
												</label>
											</li>

										</ul>
									</div>
									<hr />
									<div className="form-group">
										<label className="d-block">
											Storage <span className="float-right">77%</span>
										</label>
										<div className="progress progress-sm">
											<div
												className="progress-bar"
												role="progressbar"
												aria-valuenow={77}
												aria-valuemin={0}
												aria-valuemax={100}
												style={{ width: '77%' }}
											/>
										</div>
										<button type="button" className="btn btn-primary btn-block mt-3">
											Upgrade Storage
									</button>
									</div>
								</div>
								<div role="tabpanel" className="tab-pane vivify fadeIn" id="activity" aria-expanded="false">
									<ul className="new_timeline mt-3">
										<li>
											<div className="bullet pink" />
											<div className="time">11:00am</div>
											<div className="desc">
												<h3>Attendance</h3>
												<h4>Computer Class</h4>
											</div>
										</li>
										<li>
											<div className="bullet pink" />
											<div className="time">11:30am</div>
											<div className="desc">
												<h3>Added an interest</h3>
												<h4>“Volunteer Activities”</h4>
											</div>
										</li>
										<li>
											<div className="bullet green" />
											<div className="time">12:00pm</div>
											<div className="desc">
												<h3>Developer Team</h3>
												<h4>Hangouts</h4>
												<ul className="list-unstyled team-info margin-0 p-t-5">
													<li>
														<img src="/assets/images/xs/avatar1.jpg" alt="Avatar" />
													</li>
													<li>
														<img src="/assets/images/xs/avatar2.jpg" alt="Avatar" />
													</li>
													<li>
														<img src="/assets/images/xs/avatar3.jpg" alt="Avatar" />
													</li>
													<li>
														<img src="/assets/images/xs/avatar4.jpg" alt="Avatar" />
													</li>
												</ul>
											</div>
										</li>
										<li>
											<div className="bullet green" />
											<div className="time">2:00pm</div>
											<div className="desc">
												<h3>Responded to need</h3>
												<a href="#!">“In-Kind Opportunity”</a>
											</div>
										</li>
										<li>
											<div className="bullet orange" />
											<div className="time">1:30pm</div>
											<div className="desc">
												<h3>Lunch Break</h3>
											</div>
										</li>
										<li>
											<div className="bullet green" />
											<div className="time">2:38pm</div>
											<div className="desc">
												<h3>Finish</h3>
												<h4>Go to Home</h4>
											</div>
										</li>
									</ul>
								</div>
							</div>
						</div>
						<div className="theme_div">
							<div className="card">
								<div className="card-body">
									<ul className="list-group list-unstyled">
										<li className="list-group-item mb-2">
											<p>Default Theme</p>
											<a href="../main/index.html">
												<img
													src="/assets/images/themes/default.png"
													className="img-fluid"
													alt="fake_url"
												/>
											</a>
										</li>
										<li className="list-group-item mb-2">
											<p>Night Mode Theme</p>
											<a href="../dark/index.html">
												<img
													src="/assets/images/themes/dark.png"
													className="img-fluid"
													alt="fake_url"
												/>
											</a>
										</li>
										<li className="list-group-item mb-2">
											<p>RTL Version</p>
											<a href="../rtl/index.html">
												<img
													src="/assets/images/themes/rtl.png"
													className="img-fluid"
													alt="fake_url"
												/>
											</a>
										</li>
										<li className="list-group-item mb-2">
											<p>Theme Version2</p>
											<a href="../theme2/index.html">
												<img
													src="/assets/images/themes/theme2.png"
													className="img-fluid"
													alt="fake_url"
												/>
											</a>
										</li>
										<li className="list-group-item mb-2">
											<p>Theme Version3</p>
											<a href="../theme3/index.html">
												<img
													src="/assets/images/themes/theme3.png"
													className="img-fluid"
													alt="fake_url"
												/>
											</a>
										</li>
										<li className="list-group-item mb-2">
											<p>Theme Version4</p>
											<a href="../theme4/index.html">
												<img
													src="/assets/images/themes/theme4.png"
													className="img-fluid"
													alt="fake_url"
												/>
											</a>
										</li>
										<li className="list-group-item mb-2">
											<p>Horizontal Version</p>
											<a href="../horizontal/index.html">
												<img
													src="/assets/images/themes/horizontal.png"
													className="img-fluid"
													alt="fake_url"
												/>
											</a>
										</li>
									</ul>
								</div>
							</div>
						</div>
						<div className={`user_div ${isOpenUserMenu && 'open'}`}>
							<h5 className="brand-name mb-4">
								Profilics Systems HR
							<p className="user_btn" onClick={this.toggleUserMenu}>
									<i className="icon-logout" />
								</p>
							</h5>
							<div className="card">
								<div className="card-body">
									<div className="media">
										<img
											className="avatar avatar-xl mr-3"
											src="/assets/images/user.png"
											alt="avatar"
										/>
										<div className="media-body">
											<h5 className="m-0">Sara Hopkins</h5>
											<p className="text-muted mb-0">Webdeveloper</p>
											<ul className="social-links list-inline mb-0 mt-2">
												<li className="list-inline-item">
													<a
														href="#!"
														title="fake_title"
														data-toggle="tooltip"
														data-original-title="Facebook"
													>
														<i className="fa fa-facebook" />
													</a>
												</li>
												<li className="list-inline-item">
													<a
														href="#!"
														title="fake_title"
														data-toggle="tooltip"
														data-original-title="Twitter"
													>
														<i className="fa fa-twitter" />
													</a>
												</li>
												<li className="list-inline-item">
													<a
														href="#!"
														title="fake_title"
														data-toggle="tooltip"
														data-original-title={1234567890}
													>
														<i className="fa fa-phone" />
													</a>
												</li>
												<li className="list-inline-item">
													<a
														href="#!"
														title="fake_title"
														data-toggle="tooltip"
														data-original-title="@skypename"
													>
														<i className="fa fa-skype" />
													</a>
												</li>
											</ul>
										</div>
									</div>
								</div>
							</div>
							{statisticsClose ?
								<div className={`card ${statisticsOpen ? 'card-collapsed' : ""}`}>
									< div className="card-header">
										<h3 className="card-title">Statistics</h3>
										<div className="card-options">
											<span className="card-options-collapse" data-toggle="card-collapse" onClick={() => this.handleStatistics(!statisticsOpen)}>
												<i className="fe fe-chevron-up" />
											</span>
											<span className="card-options-remove" data-toggle="card-remove" onClick={() => this.closeStatistics(false)}>
												<i className="fe fe-x" />
											</span>
										</div>
									</div>
									<div className="card-body">
										<div className="text-center">
											<div className="row">
												<div className="col-6 pb-3">
													<label className="mb-0">Balance</label>
													<h4 className="font-30 font-weight-bold">$545</h4>
												</div>
												<div className="col-6 pb-3">
													<label className="mb-0">Growth</label>
													<h4 className="font-30 font-weight-bold">27%</h4>
												</div>
											</div>
										</div>
										<div className="form-group">
											<label className="d-block">
												Total Income<span className="float-right">77%</span>
											</label>
											<div className="progress progress-xs">
												<div
													className="progress-bar bg-blue"
													role="progressbar"
													aria-valuenow={77}
													aria-valuemin={0}
													aria-valuemax={100}
													style={{ width: '77%' }}
												/>
											</div>
										</div>
										<div className="form-group">
											<label className="d-block">
												Total Expenses <span className="float-right">50%</span>
											</label>
											<div className="progress progress-xs">
												<div
													className="progress-bar bg-danger"
													role="progressbar"
													aria-valuenow={50}
													aria-valuemin={0}
													aria-valuemax={100}
													style={{ width: '50%' }}
												/>
											</div>
										</div>
										<div className="form-group mb-0">
											<label className="d-block">
												Gross Profit <span className="float-right">23%</span>
											</label>
											<div className="progress progress-xs">
												<div
													className="progress-bar bg-green"
													role="progressbar"
													aria-valuenow={23}
													aria-valuemin={0}
													aria-valuemax={100}
													style={{ width: '23%' }}
												/>
											</div>
										</div>
									</div>
								</div> : ""}
							{friendListClose ?
								<div className={`card ${friendListOpen ? 'card-collapsed' : ""}`}>
									<div className="card-header">
										<h3 className="card-title">Friends</h3>
										<div className="card-options">
											<span className="card-options-collapse" data-toggle="card-collapse" onClick={() => this.handleFriendList(!friendListOpen)}>
												<i className="fe fe-chevron-up" />
											</span>
											<span className="card-options-remove" data-toggle="card-remove" onClick={() => this.closeFriendList(false)}>
												<i className="fe fe-x" />
											</span>
										</div>
									</div>
									<div className="card-body">
										<ul className="right_chat list-unstyled">
											<li className="online">
												<a href="#!">
													<div className="media">
														<img className="media-object " src="../assets/images/xs/avatar4.jpg" alt="fake_alr" />
														<div className="media-body">
															<span className="name">Donald Gardner</span>
															<span className="message">Designer, Blogger</span>
															<span className="badge badge-outline status" />
														</div>
													</div>
												</a>
											</li>
											<li className="online">
												<a href="#!">
													<div className="media">
														<img
															className="media-object "
															src="/assets/images/xs/avatar5.jpg"
															alt="fake_alr"
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
												<a href="#!">
													<div className="media">
														<img
															className="media-object "
															src="/assets/images/xs/avatar2.jpg"
															alt="fake_alr"
														/>
														<div className="media-body">
															<span className="name">Matt Rosales</span>
															<span className="message">CEO, Epic Theme</span>
															<span className="badge badge-outline status" />
														</div>
													</div>
												</a>
											</li>
										</ul>
									</div>
								</div>
								: ""}
							<div className="card b-none">
								<ul className="list-group">
									<li className="list-group-item d-flex">
										<div className="box-icon sm rounded bg-blue">
											<i className="fa fa-credit-card" />{' '}
										</div>
										<div className="ml-3">
											<div>+$29 New sale</div>
											<a href="#!">Admin Template</a>
											<div className="text-muted font-12">5 min ago</div>
										</div>
									</li>
									<li className="list-group-item d-flex">
										<div className="box-icon sm rounded bg-pink">
											<i className="fa fa-upload" />{' '}
										</div>
										<div className="ml-3">
											<div>Project Update</div>
											<a href="#!">New HTML page</a>
											<div className="text-muted font-12">10 min ago</div>
										</div>
									</li>
									<li className="list-group-item d-flex">
										<div className="box-icon sm rounded bg-teal">
											<i className="fa fa-file-word-o" />{' '}
										</div>
										<div className="ml-3">
											<div>You edited the file</div>
											<a href="#!">reposrt.doc</a>
											<div className="text-muted font-12">11 min ago</div>
										</div>
									</li>
									<li className="list-group-item d-flex">
										<div className="box-icon sm rounded bg-cyan">
											<i className="fa fa-user" />{' '}
										</div>
										<div className="ml-3">
											<div>New user</div>
											<a href="#!">Puffin web - view</a>
											<div className="text-muted font-12">17 min ago</div>
										</div>
									</li>
								</ul>
							</div>
						</div>
						<div id="left-sidebar" className="sidebar ">
							<h6 className="brand-name">Profilics Systems HR</h6>
							<nav id="left-sidebar-nav" className="sidebar-nav">
								<MetisMenu className=""
									content={content}
									noBuiltInClassNames={true}
									classNameContainer={(e) => this.toggleSubMenu(e)}
									classNameContainerVisible="in"
									classNameItemActive="active"
									classNameLinkActive="active"
									// classNameItemHasActiveChild="active"
									classNameItemHasVisibleChild="active"
									classNameLink="has-arrow arrow-c"
									// classNameIcon
									// classNameStateIcon

									iconNamePrefix=""
									// iconNameStateHidden=""
									LinkComponent={(e) => <DefaultLink itemProps={e} />}
								// toggleSubMenu={this.toggleSubMenu}
								/>

							</nav>
						</div>
					</div>

					<div className="page">
						<Header dataFromParent={this.props.dataFromParent} dataFromSubParent={pageHeading[0].pageTitle} />
						<Switch>
							{Routes.map((layout, i) => {
							// Use ProtectedRoute if roles are defined, otherwise use Route
							const RouteComponent = layout.roles ? ProtectedRoute : Route;
							
							return (
								<RouteComponent
								key={i}
								exact={layout.exact}
								path={layout.path}
								component={layout.component}
								roles={layout.roles || []} // Pass roles (empty array for public routes)
								currentUser={this.state.currentUser} // Pass currentUser
								/>
							);
							})}
						</Switch>
						<Footer />
					</div>
				</div>
			</>
		);
	}
}

const mapStateToProps = state => ({
	darkMinSidebar: state.settings.isMinSidebar,
	statisticsOpen: state.settings.isStatistics,
	friendListOpen: state.settings.isFriendList,
	statisticsClose: state.settings.isStatisticsClose,
	friendListClose: state.settings.isFriendListClose,
	istoggleLeftMenu: state.settings.isToggleLeftMenu
})

const mapDispatchToProps = dispatch => ({
	darkModeAction: (e) => dispatch(darkModeAction(e)),
	darkHeaderAction: (e) => dispatch(darkHeaderAction(e)),
	fixNavbarAction: (e) => dispatch(fixNavbarAction(e)),
	darkMinSidebarAction: (e) => dispatch(darkMinSidebarAction(e)),
	darkSidebarAction: (e) => dispatch(darkSidebarAction(e)),
	iconColorAction: (e) => dispatch(iconColorAction(e)),
	gradientColorAction: (e) => dispatch(gradientColorAction(e)),
	rtlAction: (e) => dispatch(rtlAction(e)),
	fontAction: (e) => dispatch(fontAction(e)),
	subMenuIconAction: (e) => dispatch(subMenuIconAction(e)),
	menuIconAction: (e) => dispatch(menuIconAction(e)),
	boxLayoutAction: (e) => dispatch(boxLayoutAction(e)),
	statisticsAction: (e) => dispatch(statisticsAction(e)),
	friendListAction: (e) => dispatch(friendListAction(e)),
	statisticsCloseAction: (e) => dispatch(statisticsCloseAction(e)),
	friendListCloseAction: (e) => dispatch(friendListCloseAction(e)),
	toggleLeftMenuAction: (e) => dispatch(toggleLeftMenuAction(e))
})
export default connect(mapStateToProps, mapDispatchToProps)(Menu);