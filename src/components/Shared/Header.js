import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter, NavLink } from "react-router-dom";
import authService from "../Authentication/authService";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isPunchedIn: false,
      showModal: false,
      reports: [],
      report: "",
      start_time: "",
      end_time: "",
      todays_working_hours: "",
      break_duration_in_minutes: 0,
      todays_total_hours: "",
      error: {
        report: "",
        start_time: "",
        end_time: "",
        break_duration_in_minutes: "",
      },
      user: null,
      userId: null,
      userRole: null,
      punchErrorModel: null,
      timer: null,
      punchInTime: null,
      elapsedTime: 0,
      activities: [],
      totalBreakInMinutes: 0,
      isBreakedIn: false,
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
    // Check if user exists in localStorage
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      window.user = user; // Attach user to the global window object
      const { id, role } = window.user;
      this.setState({
        user: user,
        userId: id,
        userRole: role,
      });
     
    }

    // Proceed with the punch-in status check
    this.startTimerInterval();
    this.getPunchInStatus();
  //  this.getActivities();
    this.getBreakInStatus();
  }

  componentWillUnmount() {
    clearInterval(this.state.timer); // Stop the timer when component unmounts
  }

  startTimerInterval = (punchInTime) => {
    if (!punchInTime) {
      this.setState({
        elapsedTime: 0,
        elapsedFormatted: "00:00:00",
      });
      return;
    }

    const timer = setInterval(() => {
      const currentTime = new Date();
      const elapsed = Math.floor((currentTime - punchInTime) / 1000); // Elapsed time in seconds

      // Calculate hours, minutes, and seconds from elapsed time
      const hours = Math.floor(elapsed / 3600);
      const minutes = Math.floor((elapsed % 3600) / 60);
      const seconds = elapsed % 60;
      const elapsedFormatted = `${hours}:${minutes < 10 ? "0" : ""}${minutes}:${
        seconds < 10 ? "0" : ""
      }${seconds}`;

      // Update state with the newly calculated elapsed time
      this.setState({
        elapsedTime: elapsed, // Store the raw elapsed time in seconds
        elapsedFormatted: elapsedFormatted, // Store the formatted time (e.g., "1:02:34")
      });
    }, 1000); // Update every second

    // Store timer ID to clear it later if needed
    this.setState({ timer });
  };

  getPunchInStatus = () => {
    fetch(
      `${process.env.REACT_APP_API_URL}/activities.php?action=get_punch_status&user_id=${window.user.id}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          const inTime = new Date(data.data[0].in_time);
          // Store the fetched punchInTime in the state
          this.setState({
            isPunchedIn: true,
            punchInTime: inTime,
            start_time: inTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
          });
          this.startTimerInterval(inTime);
        } else {
          this.setState({ isPunchedIn: false });
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

    this.fetchReports();
  };

  getBreakInStatus = () => {
    fetch(
      `${process.env.REACT_APP_API_URL}/activities.php?action=get_break_status&user_id=${window.user.id}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          this.setState({ isBreakedIn: true });
        } else {
          this.setState({ isBreakedIn: false });
        }
      })
      .catch((err) => {
        this.setState({
          errorMessage: "Failed to fetch data",
          showError: true,
          showSuccess: false,
        });
        setTimeout(this.dismissMessages, 3000);
      });
  };

  handleChange = (field, value) => {
    this.setState({
      [field]: value,
      error: {
        ...this.state.error,
        [field]: value ? "" : "This field is required.", // Example validation logic
      },
    });
  };

  getActivities = () => {
    fetch(
      `${process.env.REACT_APP_API_URL}/activities.php?user_id=${window.user.id}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          const completedBreaks = data.data.filter(
            (activity) =>
              activity.activity_type === "Break" &&
              activity.status === "completed"
          );

          const totalDurationInMinutes = completedBreaks.reduce(
            (total, activity) => {
              const duration = activity.duration || "";
              const durationParts = duration.split(" ");

              if (durationParts.length === 2) {
                const timeValue = parseInt(durationParts[0]);
                const timeUnit = durationParts[1].toLowerCase();

                if (timeUnit.includes("sec")) {
                  return total + timeValue / 60;
                } else if (timeUnit.includes("min")) {
                  return total + timeValue;
                }
              }
              return total;
            },
            0
          );

          const totalBreakInMinutes = Math.round(totalDurationInMinutes);

          this.setState({
            activities: data.data,
            loading: false,
            break_duration_in_minutes: totalBreakInMinutes,
          });
        } else {
          this.setState({
            errorMessage: data.message,
            showError: true,
            showSuccess: false,
            loading: false,
          });
          setTimeout(this.dismissMessages, 3000);
        }
      })
      .catch((err) => {
        this.setState({
          errorMessage: "Failed to fetch data",
          showError: true,
          showSuccess: false,
        });
        setTimeout(this.dismissMessages, 3000);
        console.error(err);
      });
  };

  fetchReports = (callback) => {
    fetch(
      `${process.env.REACT_APP_API_URL}/reports.php?user_id=${window.user.id}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          this.setState({ reports: data.data }, () => {
            if (typeof callback === "function") {
              callback(data.data); // Always pass the data
            }
          });
        } else {
          console.warn("API returned non-success:", data);
          this.setState({ reports: [] }, () => {
            if (typeof callback === "function") {
              callback([]); // Still run callback even if no success
            }
          });
        }
      })
      .catch((err) => {
        console.error("Failed to fetch reports:", err);
        this.setState({ reports: [] }, () => {
          if (typeof callback === "function") {
            callback([]);
          }
        });
      });
  };

  handlePunchIn = () => {
    const formData = new FormData();
    formData.append("employee_id", window.user.id);
    formData.append("activity_type", "Punch");
    formData.append("description", null);
    formData.append("status", "active");

    // Proceed with punch-in API call
    fetch(
      `${process.env.REACT_APP_API_URL}/activities.php?action=add-by-user`,
      {
        method: "POST",
        body: formData,
      }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          const punchInTime = new Date(); // Current time when user punches in

          this.setState(
            {
              punchInTime, // Store punchInTime directly in state
              isPunchedIn: true,
              elapsedTime: 0, // Start with 0 seconds for new punch-in
              start_time: punchInTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              }),
            },
            () => {
              // After state is updated, start the timer
              this.startTimerInterval(punchInTime); // Pass punchInTime to the timer function
            }
          );
          this.setState({
            successMessage: data.message,
            showError: false,
            showSuccess: true,
          });
          setTimeout(this.dismissMessages, 3000);
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

  handlePunchOut = () => {
    this.getActivities();
    this.getBreakInStatus();
    const { start_time, break_duration_in_minutes } = this.state;
    const currentTime = new Date();
    const endTimeFormatted = currentTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    this.setState({ end_time: endTimeFormatted });

    const start = start_time;
    const end = endTimeFormatted;
    const breakMinutes = break_duration_in_minutes;
    console.log(start, end, breakMinutes);
    // Working duration (after break)
    this.calculateWorkingHours(start, end, breakMinutes);
    // Show modal when punching out
    this.setState({ showModal: true });
  };

  convertToDateTime(timeString) {
    const date = new Date();
    const [hour, minute] = timeString.split(":");
    const [time, period] = minute.split(" "); // AM/PM

    // Adjust the hours based on AM/PM
    let hour24 = parseInt(hour);
    if (period.toUpperCase() === "PM" && hour24 !== 12) {
      hour24 += 12;
    } else if (period.toUpperCase() === "AM" && hour24 === 12) {
      hour24 = 0;
    }

    date.setHours(hour24);
    date.setMinutes(parseInt(time));
    return date;
  }

  calculateWorkingHours(start, end, breakMinutes) {
    // Convert the start and end times to Date objects (assuming the convertToDateTime method works correctly)
    const startDate = this.convertToDateTime(start);
    const endDate = this.convertToDateTime(end);

    // Check if breakMinutes is a string and extract numeric value if so
    const breakMinutesInNumber =
      typeof breakMinutes === "string"
        ? parseInt(breakMinutes.replace(/\D/g, ""))
        : breakMinutes;

    // Total working time without break in minutes
    const totalDuration = (endDate - startDate) / (1000 * 60); // Convert milliseconds to minutes

    // Working time after break
    const workingTimeWithBreak = totalDuration - breakMinutesInNumber;

    // Convert minutes to 24-hour format (hh:mm)
    const convertToFormattedTime = (minutes) => {
      const hours24 = Math.floor(minutes / 60); // Get the number of hours (24-hour format)
      const remainingMinutes = minutes % 60; // Get the remaining minutes

      // Format as hh:mm (24-hour format)
      return `${hours24.toString().padStart(2, "0")}:${remainingMinutes
        .toString()
        .padStart(2, "0")}`;
    };

    const withoutBreak = convertToFormattedTime(totalDuration);
    const withBreak = convertToFormattedTime(workingTimeWithBreak);

    this.setState({
      todays_working_hours: withBreak,
      todays_total_hours: withoutBreak,
    });

    return {
      withoutBreak, // Total working time without break
      withBreak, // Working time after break
    };
  }

  closeModal = () => {
    this.setState({ showModal: false });
  };

  formatToMySQLDateTime(timeString) {
    const date = new Date();
    const [time, modifier] = timeString.split(" ");

    let [hours, minutes] = time.split(":").map((num) => parseInt(num, 10));

    if (modifier === "PM" && hours < 12) {
      hours += 12;
    } else if (modifier === "AM" && hours === 12) {
      hours = 0;
    }

    date.setHours(hours, minutes, 0, 0);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const formattedTime = `${year}-${month}-${day} ${String(hours).padStart(
      2,
      "0"
    )}:${String(minutes).padStart(2, "0")}:00`;

    return formattedTime;
  }

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
      let start =
        typeof start_time === "string" ? new Date(start_time) : start_time;
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
    if (this.state.isBreakedIn) {
      this.setState({
        errorMessage: "You need to Break Out first",
        showError: true,
        showSuccess: false,
      });

      setTimeout(this.dismissMessages, 3000);
      return;
    }

    if (!this.validateReportForm()) {
      return;
    }

    this.afterPunchOut();
    this.setState({ isReportSubmitting: true });
    const {
      report,
      start_time,
      break_duration_in_minutes,
      end_time,
      todays_working_hours,
      todays_total_hours,
    } = this.state;
    const formData = new FormData();
    formData.append("employee_id", window.user.id);
    formData.append("report", report);
    formData.append("start_time", this.formatToMySQLDateTime(start_time));
    formData.append("break_duration_in_minutes", break_duration_in_minutes);
    formData.append("end_time", this.formatToMySQLDateTime(end_time));
    formData.append(
      "todays_working_hours",
      this.formatToMySQLDateTime(todays_working_hours)
    );
    formData.append(
      "todays_total_hours",
      this.formatToMySQLDateTime(todays_total_hours)
    );

    // API call to save the report and punch-out
    fetch(
      `${process.env.REACT_APP_API_URL}/reports.php?action=add-report-by-user`,
      {
        method: "POST",
        body: formData,
      }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          const newReport = data.data; // assume API returns the new report

          // Dispatch the custom event with new report
          window.dispatchEvent(
            new CustomEvent("reportMessage", {
              detail: { report: newReport },
            })
          );

          this.setState({
            successMessage: data.message,
            showError: false,
            showSuccess: true,
          });

          this.setState({
            successMessage: data.message,
            showError: false,
            showSuccess: true,
            isPunchedIn: false,
            showModal: false,
            report: "",
            isReportSubmitting: false,
            isReportSubmitted: true, //disable after submit
          });

          //document.querySelector("#addReportModal .close").click();

          setTimeout(this.dismissMessages, 3000);
        } else {
          this.setState({
            errorMessage: data.message,
            showError: true,
            showSuccess: false,
            isReportSubmitting: false,
          });
          //window.location.href = '/hr-report';
          setTimeout(this.dismissMessages, 3000);
        }
      })
      .catch((error) => {
        this.setState({
          errorMessage: "Something went wrong. Please try again.",
          showError: true,
          showSuccess: false,
          isReportSubmitting: false,
        });
        setTimeout(this.dismissMessages, 3000);
      });
  };

  afterPunchOut = () => {
    const formData = new FormData();
    formData.append("employee_id", window.user.id);
    formData.append("activity_type", "Punch");
    formData.append("description", null);
    formData.append("status", "completed");

    // API call to add break
    fetch(
      `${process.env.REACT_APP_API_URL}/activities.php?action=add-by-user`,
      {
        method: "POST",
        body: formData,
      }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          this.setState({
            successMessage: data.message,
            showError: false,
            showSuccess: true,
          });
          setTimeout(this.dismissMessages, 3000);
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
          errorMessage: error.message,
          showError: true,
          showSuccess: false,
        });
        setTimeout(this.dismissMessages, 3000);
      });
  };

  // Handle logout functionality
  handleLogout = () => {
    authService.logout();

    // Clear the user data from localStorage
    localStorage.removeItem("user");

    // Redirect to the login page
    window.location.href = "/login";
  };

  // Render function for Bootstrap toast messages
  renderAlertMessages = () => {
    return (
      <>
        {/* Add the alert for success messages */}
        <div
          className={`alert alert-success alert-dismissible fade show ${
            this.state.showSuccess ? "d-block" : "d-none"
          }`}
          role="alert"
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 1050,
            minWidth: "250px",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <i className="fa-solid fa-circle-check me-2"></i>
          {this.state.successMessage}
          <button
            type="button"
            className="close"
            aria-label="Close"
            onClick={() => this.setState({ showSuccess: false })}
          ></button>
        </div>

        {/* Add the alert for error messages */}
        <div
          className={`alert alert-danger alert-dismissible fade show ${
            this.state.showError ? "d-block" : "d-none"
          }`}
          role="alert"
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 1050,
            minWidth: "250px",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <i className="fa-solid fa-triangle-exclamation me-2"></i>
          {this.state.errorMessage}
          <button
            type="button"
            className="close"
            aria-label="Close"
            onClick={() => this.setState({ showError: false })}
          ></button>
        </div>
      </>
    );
  };

  render() {
    const { fixNavbar, darkHeader } = this.props;
    const {
      isPunchedIn,
      userRole,
      report,
      punchErrorModel,
      userId,
      user,
      start_time,
      end_time,
      todays_working_hours,
      break_duration_in_minutes,
      todays_total_hours,
      elapsedFormatted,
    } = this.state;
    const currentTab = this.props.location?.state?.tab;

    return (
      <div>
        {this.renderAlertMessages()}
        <div
          id="page_top"
          // className={isFixNavbar ? "sticky-top" : "" + this.props.dataFromParent === 'dark' ? 'section-body top_dark' : 'section-body'}
          className={`section-body ${fixNavbar ? "sticky-top" : ""} ${
            darkHeader ? "top_dark" : ""
          }`}
        >
          <div className="container-fluid">
            <div className="page-header">
              <div className="left">
                <h1 className="page-title">{this.props.dataFromSubParent}</h1>
              </div>
              <div className="right">
                {window.user && (window.user.role === 'employee') && (
                  <button
                    className="btn btn-primary"
                    onClick={
                      isPunchedIn ? this.handlePunchOut : this.handlePunchIn
                    }
                  >
                    {isPunchedIn ? `Punch Out : ${elapsedFormatted}` : "Punch In"}
                  </button>
                )}
                <div className="notification d-flex">
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
                          state: {
                            employee: user,
                            employeeId: userId,
                            tab: "profile",
                          },
                        }}
                        className={`dropdown-item ${
                          currentTab === "profile" ? "active" : ""
                        }`}
                        isActive={(match, location) =>
                          location?.state?.tab === "profile"
                        }
                      >
                        <i className="dropdown-icon fe fe-user" /> Profile
                      </NavLink>

                      <NavLink
                        to={{
                          pathname: "/view-employee",
                          state: {
                            employee: user,
                            employeeId: userId,
                            tab: "calendar",
                          },
                        }}
                        className={`dropdown-item ${
                          currentTab === "calendar" ? "active" : ""
                        }`}
                        isActive={(match, location) =>
                          location?.state?.tab === "calendar"
                        }
                      >
                        <i className="dropdown-icon fe fe-calendar" /> Calendar
                      </NavLink>

                      <NavLink
                        to={{
                          pathname: "/view-employee",
                          state: {
                            employee: user,
                            employeeId: userId,
                            tab: "timeline",
                          },
                        }}
                        className={`dropdown-item ${
                          currentTab === "timeline" ? "active" : ""
                        }`}
                        isActive={(match, location) =>
                          location?.state?.tab === "timeline"
                        }
                      >
                        <i className="dropdown-icon fe fe-activity" /> Timeline
                      </NavLink>

                      <NavLink
                        to={{
                          pathname: "/saturday-settings",
                          state: {
                            employee: user,
                            employeeId: userId,
                            tab: "saturday-settings",
                          },
                        }}
                        className={`dropdown-item ${
                          currentTab === "saturday-settings" ? "active" : ""
                        }`}
                        isActive={(match, location) =>
                          location?.state?.tab === "saturday-settings"
                        }
                      >
                        <i className="dropdown-icon fe fe-sun" /> Saturday
                        Settings
                      </NavLink>
                      <div className="dropdown-divider" />
                      <a className="dropdown-item">
                        <i className="dropdown-icon fe fe-help-circle" /> Need
                        help?
                      </a>
                      <NavLink
                        to="/login"
                        className="dropdown-item"
                        onClick={this.handleLogout}
                      >
                        <i className="dropdown-icon fe fe-log-out" /> Sign out
                      </NavLink>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal for Add Report */}
        {this.state.showModal && (
          <div
            className="modal fade show d-block"
            id="addReportModal"
            tabIndex="-1"
            role="dialog"
          >
            <div className="modal-dialog modal-xl" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="addReportModalLabel">
                    Daily Report
                  </h5>
                  <button
                    type="button"
                    className="close"
                    onClick={this.closeModal}
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </div>
                <div className="modal-body">
                  {/* Display error message inside the modal */}
                  {punchErrorModel && (
                    <div className="alert alert-danger mb-2">
                      {punchErrorModel}
                    </div>
                  )}

                  <div className="row">
                    {/* Left side: Report TextArea */}
                    <div className="col-md-6">
                      <div className="form-group">
                        <textarea
                          className={`form-control ${
                            this.state.error.report ? "is-invalid" : ""
                          }`}
                          placeholder="Please provide the report."
                          value={report}
                          onChange={(e) =>
                            this.handleChange("report", e.target.value)
                          }
                          rows="15"
                        />
                        {this.state.error.report && (
                          <div className="invalid-feedback">
                            {this.state.error.report}
                          </div>
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
                            <input
                              type="text"
                              className="form-control"
                              value={
                                this.state.start_time
                                  ? this.state.start_time
                                  : ""
                              }
                              disabled
                            />
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">
                              Break duration (minutes)
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              value={
                                this.state.break_duration_in_minutes
                                  ? this.state.break_duration_in_minutes
                                  : "00"
                              }
                              disabled
                            />
                            {this.state.error.break_duration_in_minutes && (
                              <div className="invalid-feedback">
                                {this.state.error.break_duration_in_minutes}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* End Time */}
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">End time</label>
                            <input
                              type="text"
                              className="form-control"
                              value={
                                this.state.end_time ? this.state.end_time : ""
                              }
                              disabled
                            />
                          </div>
                        </div>

                        {/* Today's Working Hours */}
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">
                              Today's working hours
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              value={todays_working_hours}
                              disabled
                            />
                          </div>
                        </div>

                        {/* Today's Total Hours */}
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">
                              Today's total hours
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              value={todays_total_hours}
                              disabled
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={this.handleAddReport}
                    disabled={
                      this.state.isReportSubmitting ||
                      this.state.isReportSubmitted
                    }
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}
const mapStateToProps = (state) => ({
  fixNavbar: state.settings.isFixNavbar,
  darkHeader: state.settings.isDarkHeader,
});

const mapDispatchToProps = (dispatch) => ({});
// export default connect(mapStateToProps, mapDispatchToProps)(Header);
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Header));
