import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

class ActivitiesTimeline extends Component {
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
            loading: true,
            filterEmployeeId: "",
            filterFromDate: todayStr,
            filterToDate: todayStr,
            isBreakedIn: false,
            breakReason: '',
            breakReasonModal: false,
            ButtonLoading: false,
            successMessage: '',
            showSuccess: false,
            errorMessage: '',
            showError: false,
        };
    }

    static propTypes = {
        showEmployeeFilter: PropTypes.bool,
        showHeader: PropTypes.bool,
        showFilters: PropTypes.bool,
        fixNavbar: PropTypes.bool,
        employeeId: PropTypes.string,
        isAdmin: PropTypes.bool,
        onBreakIn: PropTypes.func,
        onBreakOut: PropTypes.func,
        showBreakReasonModal: PropTypes.bool,
        onCloseBreakReasonModal: PropTypes.func,
        onBreakReasonChange: PropTypes.func,
        onSaveBreakIn: PropTypes.func,
        onOpenAdminBreakModal: PropTypes.func,
        showAdminBreakModal: PropTypes.bool,
        onCloseAdminBreakModal: PropTypes.func,
        adminBreakProps: PropTypes.object,
    };

    static defaultProps = {
        showEmployeeFilter: false,
        showHeader: true,
        showFilters: true,
        fixNavbar: false,
    };

    dismissMessages = () => {
        this.setState({
            showSuccess: false,
            successMessage: '',
            showError: false,
            errorMessage: '',
        });
    };

    componentDidMount() {
        // Fetch employees list if needed
        if (this.props.showEmployeeFilter) {
            fetch(`${process.env.REACT_APP_API_URL}/get_employees.php`, {
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
                    this.setState({ error: 'Failed to fetch employee data' });
                    console.error(err);
                });
        }

        // Fetch break status for current user
        if (window.user && window.user.id) {
            fetch(`${process.env.REACT_APP_API_URL}/activities.php?action=get_break_status&user_id=${window.user.id}`)
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        this.setState({ isBreakedIn: true });
                    } else {
                        this.setState({ isBreakedIn: false });
                    }
                })
                .catch(err => {
                    this.setState({ error: 'Failed to fetch break status' });
                    console.error(err);
                });
        }

        // Fetch activities
        this.handleApplyFilter();
    }

    openbreakReasonModal = () => {
        this.setState({ breakReasonModal: true });
    };

    closebreakReasonModal = () => {
        this.setState({ 
            breakReasonModal: false,
            breakReason: '',
        });
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
                        isBreakedIn: false,
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

    handleSaveBreakIn = () => {
        this.setState({ ButtonLoading: true });
        if (!this.state.breakReason) {
            this.setState({ 
                errorMessage: 'Please provide the reason for your break', 
                showError: true,
                ButtonLoading: false 
            });
            setTimeout(this.dismissMessages, 3000);
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
                        isBreakedIn: true,
                        breakReason: '',
                        successMessage: data.message,
                        showError: false,
                        showSuccess: true,
                        ButtonLoading: false
                    });
                    setTimeout(this.dismissMessages, 3000);
                    this.closebreakReasonModal();
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

    handleBreakReasonChange = (e) => {
        this.setState({ breakReason: e.target.value });
    };

    handleApplyFilter = async () => {
        this.setState({ loading: true, error: null });
        const { filterFromDate, filterToDate, filterEmployeeId } = this.state;
        let apiUrl = `${process.env.REACT_APP_API_URL}/activities.php?action=view&is_timeline=true`;

        // Only allow employee to filter their own activities
        if (window.user.role === 'employee') {
            apiUrl += `&user_id=${window.user.id}`;
        } else if (this.props.employeeId) {
            apiUrl += `&user_id=${this.props.employeeId}`;
        } else if (filterEmployeeId) {
            apiUrl += `&user_id=${filterEmployeeId}`;
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
            this.setState({ 
                activities: [], 
                loading: false, 
                error: "Failed to fetch activities data" 
            });
        }
    };

    getDateStr = (activity) => {
        const dateTime = activity.complete_in_time || activity.complete_out_time;
        if (!dateTime) return 'Unknown Date';
        return dateTime.split(' ')[0];
    };

    getDisplayDateLabel = (dateStr, isFirst) => {
        if (!dateStr || dateStr === 'Unknown Date') {
            return isFirst ? '' : '';
        }
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
            return isFirst ? '' : '';
        }
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        
        const stripTime = (d) => {
            return new Date(d.getFullYear(), d.getMonth(), d.getDate());
        };
        
        const dateNoTime = stripTime(date);
        const todayNoTime = stripTime(today);
        const yesterdayNoTime = stripTime(yesterday);
        
        if (dateNoTime.getTime() === todayNoTime.getTime()) return '';
        if (dateNoTime.getTime() === yesterdayNoTime.getTime()) return 'Yesterday';
        
        return date.toLocaleDateString(undefined, { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            weekday: 'long' 
        });
    };

    render() {
        const { 
            activities, 
            loading, 
            employeeData, 
            filterEmployeeId, 
            filterFromDate, 
            filterToDate,
            isBreakedIn,
            breakReason,
            breakReasonModal,
            ButtonLoading,
            successMessage,
            showSuccess,
            errorMessage,
            showError,
            error
        } = this.state;
        
        const { 
            showHeader, 
            showFilters, 
            fixNavbar,
            isAdmin,
            onOpenAdminBreakModal, 
            showAdminBreakModal, 
            onCloseAdminBreakModal, 
            adminBreakProps 
        } = this.props;
        
        const isEmployee = window.user.role === 'employee';
        const isAdminRole = isAdmin !== undefined ? isAdmin : (window.user.role === 'admin' || window.user.role === 'super_admin');

        return (
            <>
                {showFilters && (
                    <div className='container-fluid'>
                        <div className="card mb-3">
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-3">
                                        <label>From Date</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={filterFromDate}
                                            onChange={(e) => this.setState({ filterFromDate: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label>To Date</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={filterToDate}
                                            onChange={(e) => this.setState({ filterToDate: e.target.value })}
                                        />
                                    </div>
                                    {(window.user.role === "admin" || window.user.role === "super_admin") && (
                                        <div className="col-md-3">
                                            <label>Employee</label>
                                            <select
                                                className="form-control"
                                                value={filterEmployeeId}
                                                onChange={(e) => this.setState({ filterEmployeeId: e.target.value })}
                                            >
                                                <option value="">All Employees</option>
                                                {employeeData.map((emp) => (
                                                    <option key={emp.id} value={emp.id}>
                                                        {emp.first_name} {emp.last_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                    <div className={window.user.role === "admin" || window.user.role === "super_admin" ? "col-md-3" : "col-md-4"}>
                                        <button
                                            className="btn btn-primary"
                                            style={{ marginTop: 34 }}
                                            onClick={this.handleApplyFilter}
                                        >
                                            Apply
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {(error || showError || showSuccess) && (
                    <div className="container-fluid">
                        {error && (
                            <div className="alert alert-danger">{error}</div>
                        )}
                        {showError && (
                            <div className="alert alert-danger">{errorMessage}</div>
                        )}
                        {showSuccess && (
                            <div className="alert alert-success">{successMessage}</div>
                        )}
                    </div>
                )}

                <div className="container-fluid">
                    <div className="row clearfix">
                        <div className="col-md-12">
                            <div className="card">
                                {showHeader && (
                                    <div className="card-header bline d-flex justify-content-between align-items-center">
                                        <h3 className="card-title">Timeline Activity</h3>
                                        <div className="d-flex align-items-center">
                                            {isAdminRole && onOpenAdminBreakModal && (
                                                <button 
                                                    style={{ float: "right" }} 
                                                    type="button" 
                                                    className="btn btn-primary" 
                                                    onClick={onOpenAdminBreakModal}
                                                >
                                                    <i className="fe fe-plus mr-2" />Add
                                                </button>
                                            )}
                                            {isEmployee && (
                                                <button 
                                                    style={{ float: "right" }} 
                                                    className="btn btn-primary" 
                                                    onClick={isBreakedIn ? this.handleBreakOut : this.openbreakReasonModal}
                                                >
                                                    {isBreakedIn ? 'Break Out' : 'Break In'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {loading ? (
                                    <div className="dimmer active p-5">
                                        <div className="loader" />
                                    </div>
                                ) : (
                                    <div className="card-body">
                                        {activities.length > 0 ? (
                                            activities.map((activity, index) => {
                                                const profilePic = activity.profile
                                                    ? `${process.env.REACT_APP_API_URL}/${activity.profile}`
                                                    : "../assets/images/xs/avatar1.jpg";
                                                
                                                const currentDateStr = this.getDateStr(activity);
                                                let showSeparator = false;
                                                let displayDate = '';
                                                
                                                if (index > 0) {
                                                    const prevDateStr = this.getDateStr(activities[index - 1]);
                                                    if (currentDateStr !== prevDateStr) {
                                                        showSeparator = true;
                                                        displayDate = this.getDisplayDateLabel(currentDateStr, false);
                                                    }
                                                } else {
                                                    showSeparator = true;
                                                    displayDate = this.getDisplayDateLabel(currentDateStr, true);
                                                }
                                                
                                                return (
                                                    <React.Fragment key={index}>
                                                        {showSeparator && displayDate && (
                                                            <div className="timeline-date-separator">
                                                                <div className="timeline-date-line" />
                                                                <div className="timeline-date-label">
                                                                    <i className="fa fa-calendar-alt timeline-date-icon"></i>
                                                                    {displayDate}
                                                                </div>
                                                                <div className="timeline-date-line" />
                                                            </div>
                                                        )}

                                                        {/* Activity Items */}
                                                        {activity.type === 'Break_in' && (
                                                            <div className="timeline_item">
                                                                <img className="tl_avatar" src={profilePic} alt={`${activity.first_name} ${activity.last_name}`}/>
                                                                <span>
                                                                    <a href="#" className="timeline-user-name">{activity.first_name} {activity.last_name}</a>
                                                                    <span className="mx-2">|</span>
                                                                    <span className="text-secondary">Break In</span>
                                                                    <small className="float-right text-right">{activity.in_time}</small>
                                                                </span>
                                                                <h6 className="text-secondary">{activity.description}</h6>
                                                                <div className="timeline-meta">
                                                                    {activity.created_by && activity.created_by !== activity.employee_id && (
                                                                        <a href="#" className="mr-20 text-muted">
                                                                            <i className="fa fa-user text-pink"></i> Created by System Admin
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                        
                                                        {activity.type === 'Break_out' && (
                                                            <div className="timeline_item">
                                                                <img className="tl_avatar" src={profilePic} alt={`${activity.first_name} ${activity.last_name}`}/>
                                                                <span>
                                                                    <a className="timeline-user-name" href="#">{activity.first_name} {activity.last_name}</a>
                                                                    <span className="mx-2">|</span>
                                                                    <span className="text-secondary">Break Out</span>
                                                                    <small className="float-right text-right">{activity.out_time}</small>
                                                                </span>
                                                                <div className="timeline-meta">
                                                                    {activity.updated_by && activity.updated_by !== activity.employee_id && (
                                                                        <a href="#" className="mr-20 text-muted">
                                                                            <i className="fa fa-user text-pink"></i> Edited by System Admin
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                        
                                                        {activity.type === 'Punch_in' && (
                                                            <div className="timeline_item">
                                                                <img className="tl_avatar" src={profilePic} alt={`${activity.first_name} ${activity.last_name}`}/>
                                                                <span>
                                                                    <a href="#" className="timeline-user-name">{activity.first_name} {activity.last_name}</a>
                                                                    <span className="mx-2">|</span>
                                                                    <span className="text-secondary">Punch In</span>
                                                                    <small className="float-right text-right">{activity.in_time}</small>
                                                                </span>
                                                                <div className="timeline-meta">
                                                                    {activity.created_by && activity.created_by !== activity.employee_id && (
                                                                        <a href="#" className="mr-20 text-muted">
                                                                            <i className="fa fa-user text-pink"></i> Created by System Admin
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                        
                                                        {activity.type === 'Punch_out' && (
                                                            <div className="timeline_item">
                                                                <img className="tl_avatar" src={profilePic} alt={`${activity.first_name} ${activity.last_name}`}/>
                                                                <span>
                                                                    <a href="#" className="timeline-user-name">{activity.first_name} {activity.last_name}</a>
                                                                    <span className="mx-2">|</span>
                                                                    <span className="text-secondary">Punch Out</span>
                                                                    <small className="float-right text-right">{activity.out_time}</small>
                                                                </span>
                                                                <div className="timeline-meta">
                                                                    {activity.updated_by && activity.updated_by !== activity.employee_id && (
                                                                        <a href="#" className="mr-20 text-muted">
                                                                            <i className="fa fa-user text-pink"></i> Edited by System Admin
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </React.Fragment>
                                                );
                                            })
                                        ) : (
                                            <div className="text-center text-muted py-4">No activities found</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Employee Break Reason Modal */}
                {breakReasonModal && (
                    <>
                        <div className="modal-backdrop fade show"></div>
                        <div className="modal fade show d-block" id="addBreakReasonModal" tabIndex="-1" role="dialog">
                            <div className="modal-dialog" role="dialog">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title" id="addBreakReasonModalLabel">Break Reason</h5>
                                        <button type="button" className="close" onClick={this.closebreakReasonModal} aria-label="Close">
                                            <span aria-hidden="true">×</span>
                                        </button>
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
                                                            onChange={this.handleBreakReasonChange}
                                                            rows="10"
                                                            cols="50"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="modal-footer">
                                            <button 
                                                type="button" 
                                                className="btn btn-primary" 
                                                onClick={this.handleSaveBreakIn} 
                                                disabled={ButtonLoading}
                                            >
                                                {ButtonLoading ? (
                                                    <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                                                ) : null}
                                                Save changes
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Admin Add Break Modal (if provided) */}
                {showAdminBreakModal && adminBreakProps && (
                    <>
                        <div className="modal-backdrop fade show"></div>
                        <div className="modal fade show d-block" id="addBreakModal" tabIndex="-1" role="dialog">
                            <div className="modal-dialog" role="dialog">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title" id="addBreakModalLabel">Add Activity for Employee</h5>
                                        <button type="button" className="close" onClick={onCloseAdminBreakModal} aria-label="Close">
                                            <span aria-hidden="true">×</span>
                                        </button>
                                    </div>
                                    <div className="dimmer-content">
                                        <div className="modal-body">
                                            {adminBreakProps.body}
                                        </div>
                                        <div className="modal-footer">
                                            {adminBreakProps.footer}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </>
        );
    }
}

const mapStateToProps = state => ({
    fixNavbar: state.settings.isFixNavbar,
});

export default connect(mapStateToProps)(ActivitiesTimeline);