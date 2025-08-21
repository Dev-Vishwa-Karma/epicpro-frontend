import React, { Component } from 'react';
import { connect } from 'react-redux';
import MetisMenu from 'react-metismenu';
import { Switch, Route } from 'react-router-dom';
import Header from '../Header';
import Footer from '../Footer';
import DefaultLink from '../DefaultLink';
import {
	darkModeAction, darkHeaderAction, fixNavbarAction,
	darkMinSidebarAction, darkSidebarAction, iconColorAction,
	gradientColorAction, rtlAction, fontAction,
	subMenuIconAction,
	menuIconAction,
	boxLayoutAction,
	statisticsAction, friendListAction,
	statisticsCloseAction, friendListCloseAction, toggleLeftMenuAction
} from '../../../actions/settingsAction';
import Routes from '../../Route';
import ProtectedRoute from '../../ProtectedRoutes';
import HeaderTop from './elements/HeaderTop';
import RightSidebar from './elements/RightSidebar';

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
		this.handleSubMenuIcon = this.handleSubMenuIcon.bind(this);
		this.handleMenuIcon = this.handleMenuIcon.bind(this);
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
					},
					{
						"id": 41,
						"label": "Notifications",
						"to": "/notifications"
					},
					{
						"id": 44,
						"label": "Referral",
						"to": "/job-application"
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
			// Show "Referral" menu only for employees
			const hrmsSection = content.find(item => item.id === 1);
			if (hrmsSection && window.user.role !== 'employee') {
				hrmsSection.content = hrmsSection.content.filter(item => item.id !== 44);
			}
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

					// Add the "Link" item to the HRMS section after the Todo List item (id: 20)
					const linkItem = {
						"id": 40,
						"label": "Link",
						"to": "/Link"
					};
					// Find the index of "Todo List" (id: 20)
					const todoListIndex = hrmsSection.content.findIndex(item => item.id === 20);
					if (todoListIndex !== -1) {
						hrmsSection.content.splice(todoListIndex + 1, 0, linkItem);
					} else {
						// If Todo List is not found, add Link at the end
						hrmsSection.content.push(linkItem);
					}

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
							]
						},
					);
				}


				const jobPortalSection = content.find(item => item.id === 42)

				if (!jobPortalSection) {
					content.push(
						{
							"id": 42,
							"icon": "icon-briefcase",
							"label": "Job Board",
							content: [
								{
									"id": 43,
									"label": "Applicants",
									"to": "/applicant"
								},
								// {
								// 	"id": 44,
								// 	"label": "Job Application",
								// 	"to": "/job-application"
								// }
							]
						},
					);
				}
				
			}
		}

		const { isOpenRightSidebar } = this.state
		const { darkMinSidebar, istoggleLeftMenu} = this.props

		const pageHeading = Routes.filter((route) =>  route.path.split('/')[1] === this.props.location.pathname.split('/')[1])
		
		return (
			<>
				<div className={`${istoggleLeftMenu ? "offcanvas-active" : ""}`}>
					<div style={this.state.parentlink === 'login' ? masterNone : masterBlock}>
					<HeaderTop
						darkMinSidebar={darkMinSidebar}
						user={user}
						toggleLeftMenu={this.toggleLeftMenu}
						toggleRightSidebar={this.toggleRightSidebar}
						istoggleLeftMenu={istoggleLeftMenu}
						handler={this.handler}
					/>
					<RightSidebar 
						isOpenRightSidebar={isOpenRightSidebar}
						toggleRightSidebar={this.toggleRightSidebar}
						handleFont={this.handleFont}
						handleMenuIcon={this.handleMenuIcon}
						handleSubMenuIcon={this.handleSubMenuIcon}
						handleDarkMode={this.handleDarkMode}
						handleFixNavbar={this.handleFixNavbar}
						handleDarkHeader={this.handleDarkHeader}
						handleMinSidebar={this.handleMinSidebar}
						handleSidebar={this.handleSidebar}
						handleIconColor={this.handleIconColor}
						handleGradientColor={this.handleGradientColor}
						handleRtl={this.handleRtl}
					/>

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