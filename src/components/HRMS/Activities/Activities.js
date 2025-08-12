import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getService } from '../../../services/getService';
import AlertMessages from '../../common/AlertMessages';
import { breakInAction, breakDurationCalAction } from '../../../actions/settingsAction';
import { validateFields } from '../../common/validations';
import DateFilterForm from '../../common/DateFilterForm';
import ActivitiesTime from './elements/ActivitiesTime';
import AddBreakModal from './elements/AddBreakModal';
import BreakReasonModal from './elements/BreakReasonModal';
import { appendDataToFormData, getToday } from '../../../utils';
class Activities extends Component {
  constructor(props) {
    super(props);
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
      filterFromDate: getToday(),
      filterToDate: getToday(),
      onHandleApply: false,
      colbutton: (window.user.role === "admin" || window.user.role === "super_admin") ? 4 : 6,
      col: (window.user.role === "admin" || window.user.role === "super_admin") ? 2 : 2,
      errors: {},
      breakReasonErrors: {}
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
    getService.getCall('get_employees.php', {
      action: 'view',
      role: 'employee',

    })
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
    getService.getCall('activities.php', {
      action: 'get_break_status',
      user_id: window.user.id,
    })
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
    window.addEventListener('refreshActivities', this.handleApplyFilter);
  }

  componentWillUnmount() {
    window.removeEventListener('refreshActivities', this.handleApplyFilter);
  }
  
  componentDidUpdate(prevProps) {
    if (prevProps.selectedEmployeeId !== this.props.selectedEmployeeId) {
      if (this.props.selectedEmployeeId) {
        this.handleApplyFilter();
      }
    }
  }

    handleDateChange = (date, type) => {
              const formatDate = (date) => {
          if (!date) return '';
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0'); 
          const day = String(date.getDate()).padStart(2, '0'); 
          return `${year}-${month}-${day}`; 
      };
      if (date) {
          const newDate = formatDate(new Date(date));
          if (type === 'fromDate') {
              this.setState({ filterFromDate: newDate });
              
          } else if (type === 'toDate') {
              this.setState({ filterToDate: newDate });
          }
        
      } else {
          this.setState({ [type]: null });
      }
  };


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

    this.setState({ 
      breakReasonModal: true,
      breakReasonErrors: {}
    });
  };

  closeModal = () => {
    this.setState({ 
      breakReasonModal: false,
      breakReasonErrors: {}
    });
  };

  handleBreakOut = () => {
    const formData = new FormData();

    const data = {
      employee_id: window.user.id,
      activity_type: 'Break',
      description: null,
      status: 'completed',
    }
    appendDataToFormData(formData, data)

    getService.addCall('activities.php', 'add-by-user', formData)
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
    getService.getCall('activities.php', {
      action: 'break_calculation',
      user_id: window.user.id,
    })
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
    const { breakReason } = this.state;
    this.setState({ ButtonLoading: true });

    // Apply validation
    const validationSchema = [
      { name: 'breakReason', value: breakReason, required: true, messageName: 'Break reason' }
    ];

    const errors = validateFields(validationSchema);

    if (Object.keys(errors).length > 0) {
      this.setState({ 
        breakReasonErrors: errors, 
        ButtonLoading: false 
      });
      return;
    } else {
      this.setState({ breakReasonErrors: {} });
    }

    const formData = new FormData();

    const data = {
      employee_id: window.user.id,
      activity_type: 'Break',
      description: this.state.breakReason,
      status: 'active'
    }
    appendDataToFormData(formData, data)

    getService.addCall('activities.php', 'add-by-user', formData)
      .then((data) => {
        if (data.status === "success") {
          console.log( data.message, )
          this.setState({
            isBreakedIn: false,
            breakReason: '',
            successMessage: data.message,
            showError: false,
            showSuccess: true,
            ButtonLoading: false,
            breakReasonModal: false,
            breakReasonErrors: {}
          });
          setTimeout(this.dismissMessages, 3000);
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

  handleEmployeeChange1 = (event) => {
    this.setState({ filterEmployeeId: event.target.value });
    console.log(this.state.filterEmployeeId)
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

    // Apply validation
    const validationSchema = [
      { name: 'selectedEmployee', value: selectedEmployee, required: true, messageName: 'Employee selection' },
      { name: 'selectedStatus', value: selectedStatus, required: true, messageName: 'Status' },
      { name: 'breakReason', value: breakReason, required: selectedStatus === 'active', messageName: 'Break reason' }
    ];

    const errors = validateFields(validationSchema);

    if (Object.keys(errors).length > 0) {
      this.setState({ 
        errors, 
        ButtonLoading: false, 
        showError: false, 
        showSuccess: false 
      });
      return;
    } else {
      this.setState({ errors: {} });
    }

    this.setState({ loading: true });
    const formData = new FormData();

    const data = {
      employee_id: selectedEmployee,
      activity_type: 'Break',
      description: breakReason,
      status: selectedStatus,
      created_by: window.user.id,
      updated_by: window.user.id
    }
    appendDataToFormData(formData, data)
    getService.addCall('activities.php', 'add-by-admin', formData)
      .then((data) => {
        this.setState({ loading: false, ButtonLoading: false });

        if (data.status === "success") {
          this.setState({
            successMessage: data.message,
            showError: false,
            showSuccess: true,
            selectedEmployee: "",
            selectedStatus: "",
            breakReason: ""
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

  openAddBreakModal = () => {
    this.setState({
      selectedEmployee: "",
      selectedStatus: "",
      breakReason: "",
      errors: {}
    });
  };

  handleApplyFilter = async () => {
    this.setState({ loading: true });
    const { filterFromDate, filterToDate, filterEmployeeId } = this.state;
    let user_id = '';
    if (this.props.selectedEmployeeId) {
      user_id = this.props.selectedEmployeeId;
    } else if (window.user.role === 'employee') {
      user_id = window.user.id;
    } else {
      if (filterEmployeeId) {
        user_id = filterEmployeeId;
      }
    }
    //folderName, action, userId, logged_in_employee_id, role, from_date, to_date, is_timeline
    getService.getCall('activities.php', {
      action: 'view',
      user_id: user_id,
      from_date: filterFromDate,
      to_date: filterToDate,
      is_timeline: true
    })
      .then((data) => {
        if (data.status === "success") {
          this.setState({ activities: data.data, loading: false });
        } else {
          this.setState({ activities: [], loading: false, error: data.message });
        }
      })
      .catch((err) => {
        console.error(err);
      });

  };

  render() {
    const { activities, employeeData, selectedStatus, selectedEmployee, breakReason, loading, showSuccess, successMessage, showError, errorMessage, col, colbutton, breakReasonErrors } = this.state;
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
                      <DateFilterForm
                          fromDate={this.state.filterFromDate}
                          toDate={this.state.filterToDate}
                          selectedEmployee={this.state.filterEmployeeId}
                          allEmployeesData={this.state.employeeData}
                          ButtonLoading={this.state.ButtonLoading}
                          handleDateChange={this.handleDateChange}
                          handleEmployeeChange={this.handleEmployeeChange1}
                          handleApplyFilters={this.handleApplyFilter}
                          col={col}
                      />
                    <div className={`col-md-${colbutton}`}>
                      {window.user.role !== 'employee' && (
                        <button style={{ float: "right", marginTop: 24 }} type="button" className="btn btn-primary" data-toggle="modal" data-target="#addBreakModal" onClick={this.openAddBreakModal}>
                          <i className="fe fe-plus mr-2" />Add
                        </button>
                      )}
                      {window.user.role === 'employee' && (
                        <button
                          style={{ float: "right", marginTop: 22 }}
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
                      activities={activities}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>

        {/* Add Break Modal */}
        {this.state.role !== 'employee' && (
          <AddBreakModal
            loading={loading}
            employeeData={employeeData}
            selectedEmployee={selectedEmployee}
            selectedStatus={selectedStatus}
            breakReason={breakReason}
            handleEmployeeChange={this.handleEmployeeChange}
            handleStatusChange={this.handleStatusChange}
            handleReasonChange={this.handleReasonChange}
            addActivityForEmployee={this.addActivityForEmployee}
            buttonLoading={this.state.ButtonLoading}
            errors={this.state.errors}
          />
        )}

        {/* Add Break reason Modal for loggedin employee */}
        <BreakReasonModal
          showModal={this.state.breakReasonModal}
          breakReason={breakReason}
          handleReasonChange={this.handleReasonChange}
          handleSaveBreakIn={this.handleSaveBreakIn}
          closeModal={this.closeModal}
          ButtonLoading={this.state.ButtonLoading}
          errors={breakReasonErrors}
        />
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