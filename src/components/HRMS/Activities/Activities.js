import React, { Component } from 'react';
import { connect } from 'react-redux';
import { breakInAction, breakDurationCalAction } from '../../../actions/settingsAction';
import AlertMessages from '../../common/AlertMessages';
import ActivitiesTime from './ActivitiesTime';

class Activities extends Component {
    constructor(props) {
        super(props);
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const todayStr = `${yyyy}-${mm}-${dd}`;
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
          breakReasonModal: false,
          successMessage: "",
          showSuccess: false,
          errorMessage: "",
          showError: false,
          ButtonLoading: false,
          filterFromDate: todayStr,
          filterToDate: todayStr,
          onHandleApply: false,
          col: (window.user.role === "admin" || window.user.role === "super_admin") ? 3 : 4
        };
    }

    dismissMessages = () => {
        this.setState({
        showSuccess: false,
        successMessage: "",
        showError: false,
        errorMessage: "",
        });
    };

    componentDidMount() {
        // Fetch employees list
        fetch(`${process.env.REACT_APP_API_URL}/get_employees.php?action=view&role=employee`, {
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

        // Fetch break status if not in view mode
        fetch(`${process.env.REACT_APP_API_URL}/activities.php?action=get_break_status&user_id=${window.user.id}`)
            .then(response => response.json())
            .then(data => {
            if (data.status === 'success') {
                this.setState({ isBreakedIn: true });
                this.props.breakInAction(true);
            } else {
                this.setState({ isBreakedIn: false });
                this.props.breakInAction(false);
            }
            })
            .catch(err => {
            this.setState({ error: 'Failed to fetch data' });
            console.error(err);
            });

        // Fetch today's activities by default
        this.handleApplyFilter();
    }

    componentDidUpdate(prevProps)
    {
        if (prevProps.selectedEmployeeId !== this.props.selectedEmployeeId) {
            if (this.props.selectedEmployeeId) {
                this.handleApplyFilter();
            }
        }
    }

    openbreakReasonModal = () => {
        if (!this.props.punchIn) {
        this.setState({
            errorMessage: "You need to Punch In first",
            showError: true,
            showSuccess: false,
        });
        setTimeout(this.dismissMessages, 3000);
        return;
        }

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
            this.breakCalculation()
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

    breakCalculation = () => {
        fetch(
        `${process.env.REACT_APP_API_URL}/activities.php?action=break_calculation&user_id=${window.user.id}`
        )
        .then((response) => response.json())
        .then((data) => {
            if (data.status === "success") {
            this.props.breakDurationCalAction(data.data.break_duration);
            }
        })
        .catch((err) => {
            console.error(err);
        });
    }

    handleSaveBreakIn = () => {
        this.setState({ ButtonLoading: true });
        if (!this.state.breakReason) {
        this.setState({ activityError: 'Please provide the reason for your break', ButtonLoading: false });
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
                successMessage: data.message,
                showError: false,
                showSuccess: true,
                ButtonLoading: false
            });
            setTimeout(this.dismissMessages, 3000);
            document.querySelector("#addBreakReasonModal .close").click();
            this.componentDidMount();
            } else {
            this.setState({
                errorMessage: data.message,
                showError: true,
                showSuccess: false,
                ButtonLoading: false
            });
            setTimeout(this.dismissMessages, 3000);
            }
        })
        .catch((error) => {
            this.setState({
            errorMessage: "Something went wrong. Please try again.",
            showError: true,
            showSuccess: false,
            ButtonLoading: false
            });
            setTimeout(this.dismissMessages, 3000);
        });
    };

    handleEmployeeChange = (event) => {
        this.setState({ selectedEmployee: event.target.value });
    };

    handleStatusChange = (event) => {
        this.setState({ selectedStatus: event.target.value });
    };

    handleReasonChange = (event) => {
        this.setState({ breakReason: event.target.value });
    };

    addActivityForEmployee = () => {
        const { selectedEmployee, selectedStatus, breakReason } = this.state;
        this.setState({ ButtonLoading: true });
        
        if (!selectedEmployee && !selectedStatus) {
        this.setState({
            errorMessage: "Please select an employee and status",
            showError: true,
            showSuccess: false,
            ButtonLoading: false
        });
        return;
        }

        if (!selectedEmployee) {
        this.setState({
            errorMessage: "Please select an employee",
            showError: true,
            showSuccess: false,
            ButtonLoading: false
        });
        setTimeout(this.dismissMessages, 3000);
        return;
        }

        if (!selectedStatus) {
        this.setState({
            errorMessage: "Please select a status",
            showError: true,
            showSuccess: false,
            ButtonLoading: false
        });
        setTimeout(this.dismissMessages, 3000);
        return;
        }

        if (selectedStatus === 'active' && !breakReason) {
        this.setState({
            errorMessage: "Please enter the reason for break",
            showError: true,
            showSuccess: false,
            ButtonLoading: false
        });
        setTimeout(this.dismissMessages, 3000);
        return;
        }

        this.setState({ loading: true });
        const formData = new FormData();
        formData.append('employee_id', selectedEmployee);
        formData.append('activity_type', 'Break');
        formData.append('description', breakReason);
        formData.append('status', selectedStatus);
        formData.append('created_by', window.user.id);
        formData.append('updated_by', window.user.id);

        fetch(`${process.env.REACT_APP_API_URL}/activities.php?action=add-by-admin`, {
        method: "POST",
        body: formData,
        })
        .then((response) => response.json())
        .then((data) => {
            this.setState({ loading: false, ButtonLoading: false });

            if (data.status === "success") {
                this.setState({
                successMessage: data.message,
                showError: false,
                showSuccess: true,
            });
            setTimeout(this.dismissMessages, 3000);
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
            this.setState({ loading: false, ButtonLoading: false });
            this.setState({
            errorMessage: "Something went wrong. Please try again.",
            showError: true,
            showSuccess: false,
            });
            setTimeout(this.dismissMessages, 3000);
            console.error("Error:", error);
        });
    };

    handleApplyFilter = async () => {
        this.setState({ loading: true });
        const { filterFromDate, filterToDate, filterEmployeeId } = this.state;
        let apiUrl = `${process.env.REACT_APP_API_URL}/activities.php?action=view&is_timeline=true`;

        if (this.props.selectedEmployeeId) {
            apiUrl += `&user_id=${this.props.selectedEmployeeId}`;
        } else if (window.user.role === 'employee') {
            apiUrl += `&user_id=${window.user.id}`;
        } else {
        if (filterEmployeeId) {
            apiUrl += `&user_id=${filterEmployeeId}`;
        }
        }
        
        if (filterFromDate) {
          apiUrl += `&from_date=${filterFromDate}`;
        }
        if (filterToDate) {
          apiUrl += `&to_date=${filterToDate}`;
        }

        try {
          const response = await fetch(apiUrl);
          const data = await response.json();
          if (data.status === "success") {
              this.setState({ activities: data.data, loading: false });
          } else {
              this.setState({ activities: [], loading: false, error: data.message });
          }
        } catch (err) {
          this.setState({ activities: [], loading: false, error: "Failed to fetch data" });
        }
    };

    render() {
        const { activities, employeeData, selectedStatus, selectedEmployee, breakReason, loading, showSuccess,successMessage,showError, errorMessage, col } = this.state;
        return (
             <>
                <AlertMessages
                    showSuccess={showSuccess}
                    successMessage={successMessage}
                    showError={showError}
                    errorMessage={errorMessage}
                    setShowSuccess={(val) => this.setState({ showSuccess: val })}
                    setShowError={(val) => this.setState({ showError: val })}
                />
            <>
              <div className='container-fluid'>
                <div className="row clearfix">
                  <div className="card m-4">
                    <div className="card-body">
                      <div className="row">
                          <div className={`col-md-${col}`}>
                          <label>From Date</label>
                          <input
                              type="date"
                              className="form-control"
                              value={this.state.filterFromDate}
                              onChange={(e) => this.setState({ filterFromDate: e.target.value })}
                          />
                          </div>
                          <div className={`col-md-${col}`}>
                          <label>To Date</label>
                          <input
                              type="date"
                              className="form-control"
                              value={this.state.filterToDate}
                              onChange={(e) => this.setState({ filterToDate: e.target.value })}
                          />
                          </div>
                          {((window.user.role === "admin" || window.user.role === "super_admin")) && (
                          <div className={`col-md-${col}`}>
                              <label>Employee</label>
                              <select
                              className="form-control"
                              value={this.state.filterEmployeeId}
                              onChange={(e) =>
                                  this.setState({ filterEmployeeId: e.target.value })
                              }
                              >
                              <option value="">All Employees</option>
                              {this.state.employeeData.map((emp) => (
                                  <option key={emp.id} value={emp.id}>
                                  {emp.first_name} {emp.last_name}
                                  </option>
                              ))}
                              </select>
                          </div>
                          )}
                          <div className={`col-md-${col}`}>
                          <button
                              className="btn btn-primary"
                              style={{ marginTop: 34 }}
                              onClick={this.handleApplyFilter}
                          >
                              Apply
                          </button>
                          {window.user.role !== 'employee' && (
                            <button style={{ float: "right", marginTop: 34 }} type="button" className="btn btn-primary" data-toggle="modal" data-target="#addBreakModal">
                                <i className="fe fe-plus mr-2" />Add
                            </button>
                            )}
                            {window.user.role === 'employee' && (
                            <button 
                                style={{ float: "right", marginTop: 34 }} 
                                className="btn btn-primary" 
                                onClick={this.state.isBreakedIn ? this.handleBreakOut : this.openbreakReasonModal}
                            >
                                {this.state.isBreakedIn ? 'Break Out' : 'Break In'}
                            </button>
                            )}
                          </div>
                      </div>
                    </div>
                  </div>
                  <div className="card mx-4">
                    <div className="card-body">
                      <div className="row">
                        <ActivitiesTime 
                          activities = { activities }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>

            {/* Add Break Modal */}
            {window.user.role !== 'employee' && (
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
                        <button type="button" className="btn btn-primary" onClick={this.addActivityForEmployee} disabled={this.state.ButtonLoading}>
                        {this.state.ButtonLoading ? <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span> : null}
                        Save changes
                        </button>
                    </div>
                    </div>
                </div>
                </div>
            </div>
            )}

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
                      <button type="button" className="btn btn-primary" onClick={this.handleSaveBreakIn} disabled={this.state.ButtonLoading}>
                      {this.state.ButtonLoading ? <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span> : null}
                        Save changes
                      </button>
                    </div>
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
  fixNavbar: state.settings.isFixNavbar,
  punchIn: state.settings.isPunchIn,
  breakDuration: state.settings.breakDurationCalculation,
})

const mapDispatchToProps = dispatch => ({
  breakInAction: (e) => dispatch(breakInAction(e)),
  breakDurationCalAction: (e) => dispatch(breakDurationCalAction(e)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Activities);