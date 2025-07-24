import React, { Component } from 'react'
import { connect } from 'react-redux';
import AlertMessages from '../../common/AlertMessages';
import NotificationTable from './NotificationTable';
import { getService } from '../../../services/getService';
import dayjs from 'dayjs';
import DeleteModal from '../../common/DeleteModal';
import NotificationModal from './NotificationModal';

class Notifications extends Component {
    constructor(props) {
		super(props);
        let todayStr = dayjs().format('YYYY-MM-DD');
		this.state = {
            notificationData: [],
            employeeData:[],
            filterFromDate: todayStr,
            filterToDate: todayStr,
            filterEmployeeId:"",
            loading: true,
            notificationToDelete: null,
			successMessage: "",
            errorMessage: "",
            showSuccess: false, 
            showError: false,
            ButtonLoading: false,
            showModal:false,
            selectedNotification: null,
            title:"",
            body:"",
            type:"",
            read:0,
            col: (window.user.role === "admin" || window.user.role === "super_admin") ? 3 : 4,
            selectedEmployee: ''
		};
	}

    componentDidMount() {
        this.getNotifications()
        this.getEmployees()
    }

    getNotifications = () => {
        const { filterFromDate,filterToDate,filterEmployeeId } = this.state;
        let requestData = {
            action: 'get_notifications'
        };

        if (filterFromDate) {
            requestData.start_date = filterFromDate;
        }

        if (filterToDate) {
            requestData.end_date = filterToDate;
        }

        if (filterEmployeeId) {
            requestData.user_id = filterEmployeeId;
        }

        getService.getCall('notifications.php', requestData)
            .then(data => {
                if (data.status === 'success') {
                    this.setState({ notificationData: data.data, loading: false }); 
                } else {
                    this.setState({ notificationData: [], message: data.message, loading: false });
                }
            })
            .catch(err => {
                this.setState({ message: 'Failed to fetch data', loading: false });
                console.error(err);
        });
    }

    getEmployees = () => {
        getService.getCall('get_employees.php', {
            action: 'view',
            role:'employee',

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
    }

    handleApplyFilter = async () => {
        this.getNotifications()
    };

    openModal = (notificationId) => {
        this.setState({
            notificationToDelete: notificationId,
        });
    };

    onCloseDeleteModal = () => {
        this.setState({ notificationToDelete: null });
    }

    onCloseAddEdit = () => {
    this.setState({ showModal: false,
            selectedNotification: null, 
            selectedEmployee:'',
            errors: {},
            ButtonLoading: false
        })
    } 

    confirmDelete = () => {
        const { notificationToDelete } = this.state;
        if (!notificationToDelete) return;

        this.setState({ ButtonLoading: true });
        
        getService.deleteCall('notifications.php','delete', notificationToDelete )
        .then((data) => {
        if (data.success) {
            this.setState((prevState) => ({
                notificationData: prevState.notificationData.filter((d) => d.id !== notificationToDelete),
                successMessage: "Notification deleted successfully",
                showSuccess: true,
                errorMessage: '',
                showError: false,
                ButtonLoading: false,

            }));
            this.onCloseDeleteModal();
            setTimeout(this.dismissMessages, 3000);
        } else {
            this.setState({
                errorMessage: "Failed to delete notification",
                showError: true,
                successMessage: '',
                showSuccess: false,
                ButtonLoading: false,
            });
            setTimeout(this.dismissMessages, 3000);
        }
        })
        .catch((error) => {
            console.error("Error:", error);
            this.setState({
                ButtonLoading: false,
            });
        });
        
    };

    handleAddClick = () => {
        this.setState({ 
            showModal: true, 
            selectedNotification: null,
            errors: {} 
        });
    }

    handleEditClick = (notification) => {
        this.setState({
            selectedNotification: { ...notification },
            selectedEmployee: notification.employee_id,
            showModal: true,
            errors: {}
        });
    };

    getFormData = () => {
        const { selectedNotification } = this.state;
        if (selectedNotification) {
            return selectedNotification;
        } else {
            return {
                title: this.state.title,
                body: this.state.body,
                type: this.state.type,
                read: this.state.read
            };
        }
    };

    handleInputChangeForAddNotification = (event) => {
        const { name, value } = event.target;
        this.setState({ 
            [name]: value,
            errors: { ...this.state.errors, [name]: "" }
        });
    };

    handleInputChange = (e) => {
        const { name, value } = e.target;
        this.setState((prevState) => ({
            selectedNotification: {
                ...prevState.selectedNotification,
                [name]: value, // Dynamically update the field
            },
            errors: {
                ...prevState.errors,
                [name]: "", // Clear error when typing
            }
        }));
    };
    
    handleEmployeeChange = (event) => {
        this.setState({ selectedEmployee: event.target.value });
    };

    validateNotificationForm = (title, body, type) => {
        let errors = {};
        let isValid = true;

        if (!title.trim()) {
            errors.title = "Title is required.";
            isValid = false;
        }

        if (!body.trim()) {
            errors.body = "Body is required.";
            isValid = false;
        }

        if (!type.trim()) {
            errors.type = "Type is required.";
            isValid = false;
        }

        return { isValid, errors };
    };

    addNotification = () => {
        const { title, body, type, read, selectedEmployee} = this.state;

        const { isValid, errors } = this.validateNotificationForm(title, body, type);
        if (!isValid) {
            this.setState({ errors });
            return; 
        }

        this.setState({ ButtonLoading: true });
        const addNotificationFormData = new FormData();
         addNotificationFormData.append('title', title);
         addNotificationFormData.append('body', body);
         addNotificationFormData.append('type', type);
         addNotificationFormData.append('read', read);
         addNotificationFormData.append('employee_id', selectedEmployee);

        // API call to add Notification
        getService.addCall('notifications.php','add', addNotificationFormData)
        .then((data) => {
            if (data.success) {
                // Update the Notification list
                this.setState((prevState) => ({
                    notificationData: [...(prevState.notificationData || []), data.newNotification],
                    title: "",
                    body: "",
                    read:0,
                    type: "",
                    selectedEmployee:'',
                    successMessage: "Notification added successfully!",
                    showSuccess: true,
                    ButtonLoading: false
                }));

                this.onCloseAddEdit();
                setTimeout(this.dismissMessages, 3000);
            } else {
                this.setState({
                    errorMessage: "Failed to add Notification. Please try again.",
                    showError: true,
                    ButtonLoading: false
                });

                setTimeout(this.dismissMessages, 3000);
            }
        })
        .catch((error) => {
            console.error("Error:", error);
            this.setState({
                errorMessage: "An error occurred while adding the Notification.",
                showError: true,
                ButtonLoading: false
            });
            setTimeout(this.dismissMessages, 3000);
        });
    };

    editNotification = () => {
        const {title, body, type, selectedEmployee} = this.state;

        const { isValid, errors } = this.validateNotificationForm(title, body, type);
        if (!isValid) {
            this.setState({ errors });
            return; 
        }
        this.setState({ ButtonLoading: true });
        const { selectedNotification } = this.state;
        if (!selectedNotification) return;
        const editNotificationFormData = new FormData();
         editNotificationFormData.append('title', selectedNotification.title);
         editNotificationFormData.append('body', selectedNotification.body);
         editNotificationFormData.append('type', selectedNotification.type);
         editNotificationFormData.append('read', selectedNotification.read);
         editNotificationFormData.append('employee_id', selectedEmployee);
         editNotificationFormData.append('id', selectedNotification.id);
        
        getService.editCall('notifications.php','edit', editNotificationFormData)
        .then((data) => {
            if (data.status == 'success') {
               this.setState((prevState) => {
                    const updateNotificationData = prevState.notificationData.map((notification) =>
                        notification.id === selectedNotification.id ? { ...notification, ...data.updatedNotificationData } : notification
                    );
                    return {
                        notificationData: updateNotificationData,
                        successMessage: 'Notification updated successfully',
						showSuccess: true,
                        errorMessage: '',
					    showError: false,
                        ButtonLoading: false
                    };
                });
                setTimeout(this.dismissMessages, 3000);
                this.onCloseAddEdit()
            } else {
                this.setState({ 
                    errorMessage: "Failed to update notification",
                    showError: true,
                    successMessage: '',
                    showSuccess: false,
                    ButtonLoading: false
                });
                setTimeout(this.dismissMessages, 3000);
            }
        })
        .catch((error) => {
            console.error("Error:", error);
            this.setState({
                errorMessage: "Error updating notification:", error,
                showError: true,
                successMessage: '',
                showSuccess: false,
                ButtonLoading: false
            });
            setTimeout(this.dismissMessages, 3000);
        });
    };
    
    
    dismissMessages = () => {
        this.setState({
            showSuccess: false,
            successMessage: "",
            showError: false,
            errorMessage: "",
        });
    };

    render() {
        const { fixNavbar } = this.props;
        const { notificationData,message, loading,showSuccess,successMessage,showError,errorMessage,col,selectedNotification,showModal ,selectedEmployee, employeeData} = this.state;
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
                <div className={`section-body ${fixNavbar ? "marginTop" : ""} `}>
                    <div className="container-fluid">
                        <div className="card">
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
                                    
                                        <button style={{ float: "right", marginTop: 34 }} type="button" className="btn btn-primary" data-toggle="modal" data-target="#addBreakModal" onClick={() => this.handleAddClick()}>
                                            <i className="fe fe-plus mr-2" />Add
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="section-body mt-3">
                    <div className="container-fluid">
                        <div className="tab-content mt-3">
                            <div className="tab-pane fade show active" id="Notifications-list" role="tabpanel">
                                <div className="card">
                                    <div className="card-header">
                                        <h3 className="card-title">Notification List</h3>
                                        <div className="card-options">
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        {loading ? (
                                            <div className="card-body">
                                                <div className="dimmer active">
                                                    <div className="loader" />
                                                </div>
                                            </div>
                                        ) : (
                                            <NotificationTable 
                                                notificationData={notificationData} 
                                                message={message}
                                                onEditClick={this.handleEditClick} 
                                                onDeleteClick={this.openModal} 
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <NotificationModal
                    isEdit={!!selectedNotification}
                    show={showModal}
                    modalId="notificationModal"
                    onClose={this.onCloseAddEdit}
                    onSubmit={selectedNotification ? this.editNotification : this.addNotification}
                    onChange={selectedNotification ? this.handleInputChange : this.handleInputChangeForAddNotification}
                    formData={this.getFormData()}
                    errors={this.state.errors}
                    loading={this.state.ButtonLoading}
                    employeeData={employeeData}
                    selectedEmployee={selectedEmployee} 
                    handleEmployeeChange={this.handleEmployeeChange} 
                />
                <DeleteModal
                    show={!!this.state.notificationToDelete}
                    onConfirm={this.confirmDelete}
                    isLoading={this.state.ButtonLoading}
                    deleteBody='Are you sure you want to delete the Notification?'
                    modalId="deleteNotificationModal"
                    onClose={this.onCloseDeleteModal}
                />
            </>
        )
    }
}
const mapStateToProps = state => ({
    fixNavbar: state.settings.isFixNavbar
})

const mapDispatchToProps = dispatch => ({})
export default connect(mapStateToProps, mapDispatchToProps)(Notifications);