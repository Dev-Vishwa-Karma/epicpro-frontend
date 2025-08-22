import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter, NavLink } from "react-router-dom";
import authService from "../../Authentication/authService";
import "react-datepicker/dist/react-datepicker.css";
import {
  breakInAction,
  punchInAction,
  breakDurationCalAction,
} from "../../../actions/settingsAction";
import api from "../../../api/axios";
import AlertMessages from "../../common/AlertMessages";
import TextEditor from "../../common/TextEditor";
import DueTasksAlert from "../../common/DueTasksAlert";
import { getService } from "../../../services/getService";
import { validateFields } from "../../common/validations";
import TimeSkeleton from "../../common/skeletons/TimeSkeleton";
import Button from "../../common/formInputs/Button";
import NotificationDropdown from "./elements/NotificationDropdown";
import UserDropdown from "./elements/UserDropdown";
import DailyReportModal from "./elements/DailyReportModal";

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      report: "",
      start_time: "",
      end_time: "",
      todays_working_hours: "",
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
      totalBreakInMinutes: 0,
      isBreakedIn: false,
      successMessage: "",
      showSuccess: false,
      errorMessage: "",
      showError: false,
      notifications: [],
      loading: true,
      is_task_due_today: false,
      showDueAlert: true,
      dueTasks: [],
      disableButton: false,
      page: 1,
      hasMore: true,
      limit: 5,
      isTimeLoading: false,
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
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      this.setState(
        {
          user: user,
          userId: user.id,
          userRole: user.role,
        },
        () => {
          this.startTimerInterval();
          if (user.role === "employee") {
            this.getPunchInStatus();
            this.getActivities();
          }

          this.fetchNotifications();
          this.checkBirthdays();
          this.startNotificationInterval();
          this.checktodayDueDate();
        }
      );
    }
    window.addEventListener("refreshActivities", this.handleApplyFilter);
  }

  componentWillUnmount() {
    window.removeEventListener("refreshActivities", this.handleApplyFilter);
    clearInterval(this.state.timer);
  }

  startNotificationInterval() {
    this.notificationInterval = setInterval(() => {
      this.setState(
        {
          page: 1,
          notifications: [],
        },
        () => {
          this.fetchNotifications();
        }
      );
    }, 40000);
  }

  checktodayDueDate = () => {
    getService
      .getCall("project_todo.php", {
        action: "due_today_check",
        user_id: window.user.id,
      })
      .then((data) => {
        if (data.status === "success") {
          this.setState({
            is_task_due_today: data.data.has_due_today,
            dueTasks: data.data.tasks,
          });
        }
      })
      .catch((err) => {
        console.error("Error checking birthdays:", err);
      });
  };

  startTimerInterval = (punchInTime, isAutoClose = true) => {
    if (punchInTime) {
      const today = new Date();
      const todayDateOnly = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
      const punchInDateOnly = new Date(
        punchInTime.getFullYear(),
        punchInTime.getMonth(),
        punchInTime.getDate()
      );

      if (isAutoClose && punchInDateOnly < todayDateOnly) {
        this.autoCloseActivities(punchInTime);
      }
    }

    if (!punchInTime) {
      this.setState({
        elapsedTime: 0,
        elapsedFormatted: "00:00:00",
        isTimeLoading: false,
      });
      return;
    }

    // Set loading state when starting timer
    this.setState({
      isTimeLoading: true,
    });

    const timer = setInterval(() => {
      const currentTime = new Date();
      const elapsed = Math.floor((currentTime - punchInTime) / 1000);

      const hours = Math.floor(elapsed / 3600);
      const minutes = Math.floor((elapsed % 3600) / 60);
      const seconds = elapsed % 60;
      const elapsedFormatted = `${hours}:${minutes < 10 ? "0" : ""}${minutes}:${
        seconds < 10 ? "0" : ""
      }${seconds}`;

      this.setState({
        elapsedTime: elapsed,
        elapsedFormatted: elapsedFormatted,
        isTimeLoading: false,
      });
    }, 1000);

    this.setState({ timer });
  };

  autoCloseActivities = (punchInTime) => {
    this.setState({
      disableButton: true,
    });
    const punchInTimeDate = punchInTime.toISOString().split("T")[0];
    api
      .get(
        `${process.env.REACT_APP_API_URL}/auto_close_breaks.php?user_id=${window.user.id}&date=${punchInTimeDate}`
      )
      .then((response) => {
        let data = response.data;
        if (data.status === "success") {
          this.setState({
            punchInTime: null,
            disableButton: false,
          });
          clearInterval(this.state.timer);
          this.props.punchInAction(false);
          this.props.breakInAction(false);
          window.location.reload();
        } else {
          this.setState({
            errorMessage: data.message,
            showError: true,
            showSuccess: false,
            loading: false,
            disableButton: false,
          });
          setTimeout(this.dismissMessages, 3000);
        }
      })
      .catch((err) => {
        this.setState({
          errorMessage: "Failed to fetch data",
          showError: true,
          showSuccess: false,
          disableButton: false,
        });
        setTimeout(this.dismissMessages, 3000);
        console.error(err);
      });
  };

  getPunchInStatus = async () => {
    this.setState({ isTimeLoading: true });
    getService
      .getCall("activities.php", {
        action: "get_punch_status",
        user_id: this.state.userId,
      })
      .then((data) => {
        if (data.status === "success") {
          const inTime = new Date(data.data[0].in_time);
          this.props.punchInAction(true);
          this.setState({
            punchInTime: inTime,
            start_time: inTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
          });
          this.startTimerInterval(inTime);
        } else {
          this.props.punchInAction(false);
          this.setState({ isTimeLoading: false });
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

  handleChange = (field, value) => {
    this.setState((prevState) => ({
      [field]: value,
      error: {
        ...prevState.error,
        [field]: "",
      },
    }));
  };

  fetchNotifications = () => {
    const { page, notifications, limit } = this.state;

    this.setState({ loading: true });

    getService
      .getCall("notifications.php", {
        action: "get_notifications",
        user_id: window.user.id,
        page: page,
        limit: limit,
      })
      .then((data) => {
        if (data.status === "success") {
          const newNotifications = data.data;

          this.setState({
            notifications: [...notifications, ...newNotifications],
            hasMore: newNotifications.length === limit, // If less than limit, there's no more to load
            page: page + 1,
            loading: false,
          });
        } else {
          this.setState({ hasMore: false, loading: false });
        }
      })
      .catch((err) => {
        console.error(err);
        this.setState({ loading: false });
      });
  };

  checkBirthdays = () => {
    getService
      .getCall("notifications.php", {
        action: "birthday_notify",
      })
      .then((data) => {
        if (data.status === "success") {
          //this.fetchNotifications();
          this.setState(
            {
              page: 1,
              notifications: [],
            },
            () => {
              this.fetchNotifications();
            }
          );
        }
      })
      .catch((err) => {
        console.error("Error checking birthdays:", err);
      });
  };

  markAsRead = (notification_id) => {
    const apiCall = notification_id
      ? getService.getCall("notifications.php", {
          action: "mark_read",
          user_id: window.user.id,
          notification_id: notification_id,
        })
      : getService.getCall("notifications.php", {
          action: "mark_read",
          user_id: window.user.id,
        });

    apiCall
      .then((data) => {
        if (data.status === "success") {
          this.setState(
            {
              page: 1,
              notifications: [],
            },
            () => {
              this.fetchNotifications();
            }
          );
        } else {
          console.error("Error marking notification as read");
        }
      })
      .catch((err) => {
        console.error("Error marking notification as read", err);
      });
  };

  // Navigate to notifications page
  navigateToNotifications = () => {
    this.props.history.push("/notifications");
  };

  getActivities = () => {
    getService
      .getCall("activities.php", {
        action: "break_calculation",
        user_id: window.user.id,
      })
      .then((data) => {
        if (data.status === "success") {
          this.props.breakDurationCalAction(data.data.break_duration);
          this.setState({
            loading: false,
          });
        } else {
          this.setState({
            loading: false,
          });
          this.props.breakDurationCalAction(0);
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

  handlePunchIn = () => {
    this.setState({ isTimeLoading: true });
    const formData = new FormData();
    formData.append("employee_id", this.state.userId);
    formData.append("activity_type", "Punch");
    formData.append("description", null);
    formData.append("status", "active");

    this.props.punchInAction(true);
    getService
      .addCall("activities.php", "add-by-user", formData)
      .then((data) => {
        if (data.status === "success") {
          const currentTime = new Date();

          // trigger activities refresh
          window.dispatchEvent(new CustomEvent("refreshActivities"));

          this.setState({
            punchInTime: currentTime,
            start_time: currentTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
            successMessage: data.message,
            showError: false,
            showSuccess: true,
          });

          this.startTimerInterval(currentTime, false);
          setTimeout(this.dismissMessages, 3000);
        } else {
          this.setState({
            errorMessage: data.message,
            showError: true,
            showSuccess: false,
            isTimeLoading: false,
          });
          this.props.punchInAction(false);
          setTimeout(this.dismissMessages, 3000);
        }
      })
      .catch((error) => {
        this.setState({
          errorMessage: "Something went wrong. Please try again.",
          showError: true,
          showSuccess: false,
          isTimeLoading: false,
        });
        setTimeout(this.dismissMessages, 3000);
      });
  };

  handlePunchOut = () => {
    if (this.props.breakIn) {
      this.setState({
        errorMessage: "You need to Break Out first",
        showError: true,
        showSuccess: false,
      });

      setTimeout(this.dismissMessages, 3000);
      return;
    }

    const { start_time } = this.state;
    const currentTime = new Date();
    const endTimeFormatted = currentTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    // trigger activities refresh
    window.dispatchEvent(new CustomEvent("refreshActivities"));

    this.setState({ end_time: endTimeFormatted });

    const start = start_time;
    const end = endTimeFormatted;
    const breakMinutes = this.props.breakDuration;
    this.calculateWorkingHours(start, end, breakMinutes);
    this.setState({
      showModal: true,
      error: {
        report: "",
        start_time: "",
        end_time: "",
        break_duration_in_minutes: "",
      },
    });
  };

  convertToDateTime(timeString) {
    const date = new Date();
    const [hour, minute] = timeString.split(":");
    const [time, period] = minute.split(" ");

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
    const startDate = this.convertToDateTime(start);
    const endDate = this.convertToDateTime(end);

    const breakMinutesInNumber =
      typeof breakMinutes === "string"
        ? parseInt(breakMinutes.replace(/\D/g, ""))
        : breakMinutes;

    const totalDuration = (endDate - startDate) / (1000 * 60);
    const workingTimeWithBreak = totalDuration - breakMinutesInNumber;
    const convertToFormattedTime = (minutes) => {
      const hours24 = Math.floor(minutes / 60); // Get the number of hours (24-hour format)
      const remainingMinutes = Math.floor(minutes % 60); // Get the remaining minutes

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
    this.setState({
      showModal: false,
      error: {
        report: "",
        start_time: "",
        end_time: "",
        break_duration_in_minutes: "",
      },
    });
  };

  formatToYMD(dateStr) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  formatToMySQLDateTime(timeString) {
    const date = new Date();
    const [time, modifier] = timeString.split(" ");
    let [hours, minutes] = time.split(":").map((num) => parseInt(num, 10));

    if (["PM", "pm"].includes(modifier) && hours < 12) {
      hours += 12;
    } else if (["AM", "am"].includes(modifier) && hours === 12) {
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

    // Apply Validation component
    const validationSchema = [
      { name: "report", value: report, required: true, messageName: "Report" },
      {
        name: "start_time",
        value: start_time,
        required: true,
        messageName: "Start time",
      },
      {
        name: "end_time",
        value: end_time,
        required: true,
        messageName: "End time",
      },
    ];
    const errors = validateFields(validationSchema);

    this.setState({ error: errors });
    return Object.keys(errors).length === 0;
  };

  handleAddReport = () => {
    if (!this.validateReportForm()) {
      return;
    }

    this.afterPunchOut();
    this.setState({ isReportSubmitting: true });
    const {
      report,
      start_time,
      end_time,
      todays_working_hours,
      todays_total_hours,
    } = this.state;
    const formData = new FormData();
    formData.append("employee_id", this.state.userId);
    formData.append("report", report);
    formData.append("start_time", this.formatToMySQLDateTime(start_time));
    formData.append("break_duration_in_minutes", this.props.breakDuration);
    formData.append("end_time", this.formatToMySQLDateTime(end_time));
    formData.append(
      "todays_working_hours",
      this.formatToMySQLDateTime(todays_working_hours)
    );
    formData.append(
      "todays_total_hours",
      this.formatToMySQLDateTime(todays_total_hours)
    );

    getService
      .addCall("reports.php", "add-report-by-user", formData)
      .then((data) => {
        if (data.status === "success") {
          const newReport = data.data;

          // Dispatch the custom event with new report
          window.dispatchEvent(
            new CustomEvent("reportMessage", {
              detail: { report: newReport },
            })
          );

          // Add this line to trigger activities refresh
          window.dispatchEvent(new CustomEvent("refreshActivities"));

          this.closeModal();

          this.setState({
            successMessage: data.message,
            showError: false,
            showSuccess: true,
            showModal: false,
            report: "",
            isReportSubmitting: false,
            isReportSubmitted: true, //disable after submit
          });

          this.props.punchInAction(false);
          this.props.breakDurationCalAction(0);
          clearInterval(this.state.timer);
          setTimeout(this.dismissMessages, 3000);
        } else {
          this.setState({
            errorMessage: data.message,
            showError: true,
            showSuccess: false,
            isReportSubmitting: false,
          });

          this.props.punchInAction(true);
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
        this.props.punchInAction(false);
        setTimeout(this.dismissMessages, 3000);
      });
  };

  afterPunchOut = () => {
    const formData = new FormData();
    formData.append("employee_id", this.state.userId);
    formData.append("activity_type", "Punch");
    formData.append("description", null);
    formData.append("status", "completed");

    getService
      .addCall("activities.php", "add-by-user", formData)
      .then((response) => {
        if (response.status === "success") {
          this.setState({
            successMessage: response.message,
            showError: false,
            showSuccess: true,
          });
          window.dispatchEvent(new CustomEvent("refreshActivities"));
          setTimeout(this.dismissMessages, 3000);
        } else {
          this.setState({
            errorMessage: response.message,
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
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  render() {
    const { fixNavbar, darkHeader, isPunchedIn, breakDuration } = this.props;
    const {
      punchErrorModel,
      userId,
      user,
      todays_working_hours,
      todays_total_hours,
      elapsedFormatted,
      notifications,
      showSuccess,
      successMessage,
      showError,
      errorMessage,
      is_task_due_today,
      showDueAlert,
      dueTasks,
      disableButton,
    } = this.state;
    const currentTab = this.props.location?.state?.tab;

    return (
      <div>
        <AlertMessages
          showSuccess={showSuccess}
          successMessage={successMessage}
          showError={showError}
          errorMessage={errorMessage}
          setShowSuccess={(val) => this.setState({ showSuccess: val })}
          setShowError={(val) => this.setState({ showError: val })}
        />
        <div
          id="page_top"
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
                {window.user && window.user.role === "employee" && (
                  <Button
                    label={
                      isPunchedIn ? (
                        this.state.isTimeLoading ? (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            Punch Out : <TimeSkeleton height="14px" />
                          </span>
                        ) : (
                          `Punch Out : ${elapsedFormatted}`
                        )
                      ) : (
                        "Punch In"
                      )
                    }
                    onClick={
                      isPunchedIn ? this.handlePunchOut : this.handlePunchIn
                    }
                    disabled={disableButton}
                    className="btn-primary"
                    style={{ width: "190px", height: "35px", fontSize: "14px" }}
                  />
                )}
                <div className="notification d-flex">
                  <NotificationDropdown
                    notifications={this.state.notifications}
                    fetchNotifications={this.fetchNotifications}
                    markAsRead={this.markAsRead}
                    navigateToNotifications={this.navigateToNotifications}
                  />
                  <UserDropdown
                    userId={this.state.userId}
                    user={this.state.user}
                    currentTab={this.state.currentTab}
                    handleLogout={this.handleLogout}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal for Add Report */}
        <DailyReportModal
          show={this.state.showModal}
          onClose={this.closeModal}
          punchErrorModel={this.state.punchErrorModel}
          report={this.state.report}
          start_time={this.state.start_time}
          end_time={this.state.end_time}
          breakDuration={this.state.breakDuration}
          todays_working_hours={this.state.todays_working_hours}
          todays_total_hours={this.state.todays_total_hours}
          error={this.state.error}
          isReportSubmitting={this.state.isReportSubmitting}
          isReportSubmitted={this.state.isReportSubmitted}
          handleChange={this.handleChange}
          handleSubmit={this.handleAddReport}
        />

        {this.state.showModal && <div className="modal-backdrop fade show" />}
        {is_task_due_today && showDueAlert && dueTasks?.length > 0 && (
          <DueTasksAlert
            dueTasks={dueTasks}
            onClose={() => this.setState({ showDueAlert: false })}
          />
        )}
        <style>
          {`
            .notification-body {
                overflow: visible !important;
                display: block !important;
                white-space: normal !important;
                word-wrap: break-word !important;
                overflow-wrap: break-word !important;
                width: 350px !important;
                max-width: 350px !important;
            }
            
            @media (max-width: 768px) {
              .notification-body {
                max-width: none !important;
                width: 100% !important;
              }
            }
          `}
        </style>

        {["admin", "super_admin", "employee"].includes(window.user.role) && (
          <style>
            {`
            @media (max-width: 576px) {
              .notification {
                margin-top: ${
                  ["admin", "super_admin"].includes(window.user.role)
                    ? "-25px"
                    : "-45px"
                } !important;
              }
            }
          `}
          </style>
        )}
      </div>
    );
  }
}
const mapStateToProps = (state) => ({
  fixNavbar: state.settings.isFixNavbar,
  darkHeader: state.settings.isDarkHeader,
  breakIn: state.settings.isBreakIn,
  isPunchedIn: state.settings.isPunchIn,
  breakDuration: state.settings.breakDurationCalculation,
});

const mapDispatchToProps = (dispatch) => ({
  punchInAction: (e) => dispatch(punchInAction(e)),
  breakInAction: (e) => dispatch(breakInAction(e)),
  breakDurationCalAction: (e) => dispatch(breakDurationCalAction(e)),
});
// export default connect(mapStateToProps, mapDispatchToProps)(Header);
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Header));
