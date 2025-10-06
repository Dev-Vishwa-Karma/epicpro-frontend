import React, { Component } from 'react';
import { connect } from 'react-redux';
import MetisMenu from 'react-metismenu';
import { Switch, Route } from 'react-router-dom';
import Header from '../Header/Header';
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
		// Add global click handler for closing sidebar on small screens
		document.addEventListener('mousedown', this.handleGlobalClick, true);
	}

	componentWillUnmount() {
		document.removeEventListener('mousedown', this.handleGlobalClick, true);
	}

	handleGlobalClick = (event) => {
		if (this.props.istoggleLeftMenu && window.innerWidth <= 991) {
			const sidebar = document.getElementById('left-sidebar');
			const menuBtn = document.querySelector('.menu_toggle');
			if (
				sidebar &&
				!sidebar.contains(event.target) &&
				menuBtn &&
				!menuBtn.contains(event.target)
			) {
				this.toggleLeftMenu(false);
			}
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
					"id": 1,
					"icon": "icon-rocket",
					"label": "HRMS",
					"to": "#!",
					"content": [
					{ "id": 2, "label": "Dashboard", "to": "/" },
					{ "id": 3, "label": "Activities", "to": "/hr-activities" },
					{ "id": 4, "label": "Holidays", "to": "/hr-holidays" },
					{ "id": 5, "label": "Events", "to": "/hr-events" },
					{ "id": 6, "label": "Reports", "to": "/hr-report" },
					{ "id": 7, "label": "Gallery", "to": "/gallery" },
					{ "id": 8, "label": "Todo List", "to": "/project-todo" },
					{ "id": 9, "label": "Notifications", "to": "/notifications" },
					{ "id": 10, "label": "Referral", "to": "/job-application" },
					{ "id": 21, "label": "Ticket", "to": "/ticket" },
					]
				}
			];

			// Check logged-in user
			const user = JSON.parse(localStorage.getItem("user"));
			if (!user) {
			window.location.href = "/login";
			return;
			} else {
			window.user = user;

			// Remove "Referral" if not employee
			const hrmsSection = content.find(item => item.id === 1);
			if (hrmsSection && window.user.role !== "employee") {
				hrmsSection.content = hrmsSection.content.filter(item => item.id !== 10);
			}

			if (["super_admin", "admin"].includes(window.user.role)) {
				const hrms = content.find(item => item.id === 1);

				if (hrms) {
				// Insert "Users" after Dashboard
				const usersItem = { id: 11, label: "Users", to: "/hr-users" };
				const dashboardIndex = hrms.content.findIndex(item => item.id === 2);
				if (dashboardIndex !== -1) hrms.content.splice(dashboardIndex + 1, 0, usersItem);

				// Insert "Department" after Users
				const deptItem = { id: 12, label: "Department", to: "/hr-department" };
				const usersIndex = hrms.content.findIndex(item => item.id === 11);
				if (usersIndex !== -1) hrms.content.splice(usersIndex + 1, 0, deptItem);

				// Insert "Employee" after Department
				const empItem = { id: 13, label: "Employee", to: "/hr-employee" };
				const deptIndex = hrms.content.findIndex(item => item.id === 12);
				if (deptIndex !== -1) hrms.content.splice(deptIndex + 1, 0, empItem);

				// Insert "Statistics" after Employee
				const statItem = { id: 14, label: "Statistics", to: "/statistics" };
				const empIndex = hrms.content.findIndex(item => item.id === 13);
				if (empIndex !== -1) hrms.content.splice(empIndex + 1, 0, statItem);

				// Insert "Link" after Todo
				const linkItem = { id: 15, label: "Link", to: "/link" };
				const todoIndex = hrms.content.findIndex(item => item.id === 8);
				if (todoIndex !== -1) hrms.content.splice(todoIndex + 1, 0, linkItem);
				else hrms.content.push(linkItem);

				const ticket = { id: 21, label: "Ticket", to: "/ticket" };
				const ticketIndex = hrms.content.findIndex(item => item.id === 22);
				if (ticketIndex !== -1) hrms.content.splice(ticketIndex + 1, 0, ticket);
				}

				// Add Project section if not exists
				if (!content.find(item => item.id === 16)) {
					content.push({
						id: 16,
						icon: "icon-cup",
						label: "Project",
						content: [
						{ id: 17, label: "Project List", to: "/project-list" },
						{ id: 18, label: "Clients", to: "/project-clients" }
						]
					});
				}

				// Add Job Board section if not exists
				if (!content.find(item => item.id === 19)) {
					content.push({
						id: 19,
						icon: "icon-briefcase",
						label: "Job Board",
						content: [
						{ id: 20, label: "Applicants", to: "/applicant" }
						]
					});
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