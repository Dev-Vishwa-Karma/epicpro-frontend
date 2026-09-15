import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import ChangePasswordModal from "../../modals/ChangePasswordModal";

class UserDropdown extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showChangePasswordModal: false,
    };
  }

  handleOpenChangePasswordModal = (e) => {
    e.preventDefault();
    this.setState({ showChangePasswordModal: true });
  };

  handleCloseChangePasswordModal = () => {
    this.setState({ showChangePasswordModal: false });
  };

  render() {
    const { userId, user, currentTab, handleLogout } = this.props;
    const role = window.user?.role || user?.role;

    return (
      <div className="dropdown d-flex">
        {/* User Icon */}
        <a
          href="/#"
          className="nav-link icon d-flex btn btn-default btn-icon ml-1"
          data-toggle="dropdown"
        >
          <i className="fa fa-user" />
        </a>

        {/* Dropdown Content */}
        <div className="dropdown-menu dropdown-menu-right dropdown-menu-arrow">
          {/* Profile link */}
          <NavLink
            to={{
              pathname:
                role === "employee"
                  ? `/view-employee/${userId}/profile`
                  : `/view-employee/${userId}`,
            }}
            className={`dropdown-item ${currentTab === "profile" ? "active" : ""
              }`}
            isActive={(match, location) => location?.state?.tab === "profile"}
          >
            <i className="dropdown-icon fe fe-user" /> Profile
          </NavLink>

          {/* Reset Password link after Profile */}
          <a
            href="/#"
            className="dropdown-item"
            onClick={this.handleOpenChangePasswordModal}
          >
            <i className="dropdown-icon fe fe-lock" /> Change Password
          </a>

          {role === "employee" && (
            <>
              <NavLink
                to={{ pathname: `/view-employee/${userId}/calendar` }}
                className={`dropdown-item ${currentTab === "calendar" ? "active" : ""
                  }`}
                isActive={(match, location) =>
                  location?.state?.tab === "calendar"
                }
              >
                <i className="dropdown-icon fe fe-calendar" /> Calendar
              </NavLink>

              <NavLink
                to={{ pathname: `/view-employee/${userId}/timeline` }}
                className={`dropdown-item ${currentTab === "timeline" ? "active" : ""
                  }`}
                isActive={(match, location) =>
                  location?.state?.tab === "timeline"
                }
              >
                <i className="dropdown-icon fe fe-activity" /> Timeline
              </NavLink>
            </>
          )}

          {/* Saturday Settings (only admin/super_admin) */}
          {(role === "admin" || role === "super_admin") && (
            <NavLink
              to={{
                pathname: "/saturday-settings",
                state: { employee: user, employeeId: userId, tab: "saturday-settings" },
              }}
              className={`dropdown-item ${currentTab === "saturday-settings" ? "active" : ""
                }`}
              isActive={(match, location) =>
                location?.state?.tab === "saturday-settings"
              }
            >
              <i className="dropdown-icon fe fe-sun" /> Saturday Settings
            </NavLink>
          )}

          <div className="dropdown-divider" />

          {/* Logout */}
          <NavLink
            to="/login"
            className="dropdown-item"
            onClick={handleLogout}
          >
            <i className="dropdown-icon fe fe-log-out" /> Sign out
          </NavLink>
        </div>

        {/* Modal for Reset Password */}
        <ChangePasswordModal
          show={this.state.showChangePasswordModal}
          onClose={this.handleCloseChangePasswordModal}
        />
      </div>
    );
  }
}

export default UserDropdown;
