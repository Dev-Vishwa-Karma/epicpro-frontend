import React, { Component, useEffect } from 'react'
import { connect } from 'react-redux';
import NotifyUsersTable from '../NotifyUsers/elements/NotifyUsersTable'
import { getService } from '../../../services/getService';
import NotifyUserModal from './elements/NotifyUserModel';
import Pagination from '../../common/Pagination';
import TableSkeleton from '../../common/skeletons/TableSkeleton';
import { formatDate, getToday } from '../../../utils';
import DateFilterForm from '../../common/DateFilterForm';
import Button from '../../common/formInputs/Button';
import DeleteModal from '../../common/DeleteModal';
import emitter from "../../../emitter";
import InputField from '../../common/formInputs/InputField';
import ViewNotificationModel from './elements/ViewNotificationModel'


class NotifyUsers extends Component {
    constructor(props) {
        super(props);
        this.state = {
            notificationData: [],
            employeeData: [],
            filterFromDate: '',
            filterToDate: '',
            filterEmployeeId: "",
            loading: true,
            notificationToHide: null,
            successMessage: "",
            errorMessage: "",
            showSuccess: false,
            showError: false,
            ButtonLoading: false,
            showModal: false,
            viewNotificationModal: false,
            selectedNotification: {
                title: "",
                body: "",
                attach: [],
                selectedEmployee: []
            },
            title: "",
            body: "",
            type: "",
            read: 0,
            filterNotification: 'all',
            attach: [],
            selectedEmployee: [],
            col: (window.user.role === "admin" || window.user.role === "super_admin") ? 2 : 2,
            currentPage: 1,
            dataPerPage: 10,
            currentTab: "receive"
        };
    }

    componentDidMount() {
        this.getNotifications()
        this.getEmployees()

        //event to update the status when notification has mark as read
        emitter.on("notificationUpdated", () => {
            if (window.location.pathname === "/notify-user") {
                this.getNotifications();
            }
        });
    }

    getNotifications = () => {
        const { filterFromDate, filterToDate, notificationData, filterNotification, currentTab } = this.state;
        const filter = currentTab === 'sent' ? currentTab : filterNotification;
        let requestData = {
            action: 'get_push_notification',
            filter: filter,
        };

        if (filterFromDate) {
            requestData.start_date = filterFromDate;
        }

        if (filterToDate) {
            requestData.end_date = filterToDate;
        }

        if (window.user.id) {
            requestData.user_id = window.user.id;
        }

        getService.getCall('push_notification.php', requestData)
            .then(data => {
                if (data.status === 'success') {
                    this.setState({ notificationData: data.data, message: data.message, loading: false });
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
            // role:'employee',

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

    openModal = (notification) => {
        this.setState({
            selectedNotification: notification,
            notificationToHide: notification.id
        });
    };

    onCloseNotificationModal = () => {
        this.setState({
            showModal: false,
            selectedNotification: {
                title: "",
                body: "",
                attach: [],
                selectedEmployee: []
            },
            selectedEmployee: [],
            errors: {},
            ButtonLoading: false
        })
    }

    notificationDetail = (tab) => {
        const event = tab === 'sent' ? 'sent' : 'all';
        this.setState(
            {
                filterNotification: event,
                currentPage: 1,
                filterFromDate: '',
                filterToDate: '',
                currentTab: tab
            },
            () => {
                this.getNotifications();
            });
    }

    handlePageChange = (newPage) => {
        const { dataPerPage, currentTab, notificationData, filterNotification } = this.state;
        const totalPages = Math.ceil(notificationData.length / dataPerPage);
        if (newPage >= 1 && newPage <= totalPages) {
            this.setState({ currentPage: newPage });
        }
    };

    onCloseRemoveModal = () => {
        this.setState({ notificationToHide: null });
    }

    confirmRemove = () => {
        const { notificationToHide, selectedNotification, currentPage, notificationData, dataPerPage } = this.state;
        if (!notificationToHide) return;
        this.setState({ ButtonLoading: true });

        getService.getCall("push_notification.php", {
            action: 'is_removed',
            id: selectedNotification.id,
            hidden: 1,
            employee_id: selectedNotification.employee_id
        }).then((data) => {
            if (data.success) {

                let newPage = currentPage;
                const updatedRecord = notificationData?.filter((d) => d.id !== notificationToHide);
                const totalPages = Math.ceil(updatedRecord.length / dataPerPage);
                if (newPage >= 1 && newPage <= totalPages) {
                    this.setState({ currentPage: newPage });
                }

                this.setState((prevState) => ({
                    notificationData: updatedRecord,
                    currentPage: newPage,
                    successMessage: "Notification hide successfully",
                    showSuccess: true,
                    errorMessage: '',
                    showError: false,
                    ButtonLoading: false,
                }));

                this.onCloseRemoveModal();
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
        }).catch((error) => {
            console.error("Error:", error);
            this.setState({
                ButtonLoading: false,
            });
        });

    };

    handleAddClick = () => {
        this.setState({
            showModal: true,
            selectedNotification: {
                title: "",
                body: "",
                attach: [],
                selectedEmployee: []
            },
            errors: {}
        });
    }

    getFormData = () => {
        const { selectedNotification } = this.state;
        if (selectedNotification) {
            return selectedNotification;
        } else {
            return {
                title: this.state.title,
                body: this.state.body,
                type: this.state.type,
                read: this.state.read,
                attach: this.state.attach,
                selectedEmployee: this.state.selectedEmployee
            };
        }
    };

    onFileSelected = (e) => {
        const { name } = e.target;
        let files = [];
        if (name === 'attach') {
            files = Array.from(e.target.files);
            return files;
        }
        return null
    }

    handleInputChange = (e) => {
        const { name } = e.target;
        let { value } = e.target;
        if (name === 'attach') {
            value = this.onFileSelected(e);
        }
        this.setState((prevState) => ({
            selectedNotification: {
                ...prevState.selectedNotification,
                [name]: value,
            },
            errors: {
                ...prevState.errors,
                [name]: "",
            }
        }));
    };

    handleEmployeeChange = (event) => {
        this.setState({ selectedEmployee: event.target.value });
    };

    handleDateChange = (date, type) => {
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
        const { filterFromDate, filterToDate } = this.state;
    };

    handleApplyFilter = async () => {
        this.getNotifications();
    };

    handleNotificationFilter = async (event) => {
        const { currentTab, filterNotification } = this.state;
        const selectedTab = event === 'sent' ? 'sent' : currentTab;
        const selectFilter = event !== 'sent' ? event : filterNotification;

        this.setState(
            {
                filterNotification: selectFilter,
                currentTab: selectedTab,
                currentPage: 1,
                filterFromDate: '',
                filterToDate: ''
            },
            () => {
                this.getNotifications();
            });
    }

    onOpenViewNotificationModel = (selected) => {
        const { employeeData, selectedEmployee } = this.state;
        let empId= 0;
        if(selected.employee_id){
            empId = selected.employee_id;
        }else{
            empId = window.user.id;
        }
        const selectedEmploy = employeeData.find(
            data => data.id == empId
        );
        this.setState({
            viewNotificationModal: true,
            selectedNotification: selected,
            selectedEmployee: selectedEmploy ?? [],
            errors: {},
            ButtonLoading: false
        })
    };

    onCloseViewNotificationModel = () => {
        this.setState({
            viewNotificationModal: false,
            selectedNotification: {
                title: "",
                body: "",
                attach: [],
                selectedEmployee: []
            },
            selectedEmployee: [],
            errors: {},
            ButtonLoading: false
        })
    }

    validateNotificationForm = (title, body, attach, type, selectedEmployee) => {

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
        if (!attach || attach.length === 0) {
            errors.attach = "Attach is required.";
            isValid = false;
        }
        if (!type.trim()) {
            errors.type = "Notification Type is required.";
            isValid = false;
        }
        if (!selectedEmployee || selectedEmployee.length === 0) {
            errors.selectedEmployee = "SelectedEmployee is required.";
            isValid = false;
        }

        return { isValid, errors };
    };

    handleSubmit = (e) => {
        const { selectedNotification } = this.state;
        if (selectedNotification == null) {
            const errors = {
                title: "Title is required.",
                body: "Body is required.",
                attach: "File is required.",
                type: " Notification Type is required",
                selectedEmployee: "SelectedEmployee is required."
            };
            this.setState({ errors });
            return
        }

        const { title, body, attach, type, selectedEmployee, currentTab } = selectedNotification;
        const { isValid, errors } = this.validateNotificationForm(title, body, attach, type, selectedEmployee);
        if (!isValid) {
            this.setState({ errors });
            return;
        }
        this.setState({ ButtonLoading: true });
        const { id, email } = window.user;
        const formData = new FormData();
        Object.entries({
            ...selectedNotification,
            createdBy: id,
            email: email
        }).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach(v => formData.append(`${key}[]`, v));
            } else {
                formData.append(key, value);
            }
        });

        // API call to add Notification
        getService.addCall('push_notification.php', 'add', formData
        )
            .then((data) => {
                if (data.success) {
                    // Update the Notification list
                    const newNotification = data.data
                    this.setState((prevState) => {

                        let updatedData = prevState.notificationData || [];

                        if (currentTab === 'sent') {
                            updatedData = [
                                newNotification,
                                ...updatedData
                            ];
                        }
                        return {
                            notificationData: updatedData,
                            title: "",
                            body: "",
                            read: 0,
                            type: "",
                            selectedEmployee: [],
                            attach: [],
                            successMessage: "Notification added successfully!",
                            showSuccess: true,
                            ButtonLoading: false,
                        };
                    });
                    this.onCloseNotificationModal();
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

    handleStatusChange = (e) => {
        const value = e.target.value;
        const { selectedNotification } = this.state;
        getService.getCall("push_notification.php", {
            action: "update_status",
            notification_id: selectedNotification.notification,
            status: value
        }).then((data) => {
            if (data.status === "success") {
                this.setState((prevState) => ({
                    selectedNotification: {
                        ...prevState.selectedNotification,
                        read: value
                    },
                    status: value,
                }));

            } else {
                console.error("Error marking notification as read");
            }
        })
            .catch((err) => {
                console.error("Error marking notification as read", err);
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
        const { notificationData, message, loading, showSuccess, successMessage, showError, errorMessage, col, selectedNotification, showModal, selectedEmployee, employeeData, currentPage, dataPerPage, currentTab, filterNotification, viewNotificationModal } = this.state;

        const indexOfLastNotification = currentPage * dataPerPage;
        const indexOfFirstNotification = indexOfLastNotification - dataPerPage;

        const currentNotifications = notificationData.slice(
            indexOfFirstNotification,
            indexOfLastNotification
        );
        const totalPages = Math.ceil(notificationData.length / dataPerPage);

        return (
            <>
                <div className={`section-body ${fixNavbar ? "marginTop" : ""} `}>
                    <div className="container-fluid">
                        <div className="d-flex justify-content-between align-items-center">
                            <ul className="nav nav-tabs page-header-tab">
                                <li className="nav-item">
                                    <a className={`nav-link ${currentTab === "receive" ? "active" : ""}`} href="#received" onClick={() => this.notificationDetail("receive")}> Received </a>
                                </li>
                                <li className="nav-item">
                                    <a className={`nav-link ${currentTab === "sent" ? "active" : ""}`} href="#sent" onClick={() => this.notificationDetail("sent")}> Sent </a>
                                </li>
                            </ul>
                        </div>
                        <div className="card">
                            <div className="card-body">
                                <div className="row">
                                    <DateFilterForm
                                        fromDate={this.state.filterFromDate}
                                        toDate={this.state.filterToDate}
                                        ButtonLoading={this.state.ButtonLoading}
                                        handleDateChange={this.handleDateChange}
                                        handleApplyFilters={this.handleApplyFilter}
                                        col={col}
                                    />
                                    <div className={`col-md-${col}`}>
                                        <Button
                                            label="Notify Users"
                                            onClick={() => this.handleAddClick()}
                                            className="btn-primary"
                                            style={{ float: "right", marginTop: 26 }}
                                            icon="fe fe-plus"
                                            iconStyle={{ marginRight: '8px' }}
                                        // dataToggle="modal"
                                        // dataTarget="#addBreakModal"
                                        />
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
                                        {currentTab === "receive" && notificationData && (<div className="card-options" >
                                            <InputField
                                                label="Filter"
                                                name="filter"
                                                type="select"
                                                value={filterNotification}
                                                onChange={(e) => this.handleNotificationFilter(e.target.value)}
                                                options={[
                                                    { value: "manual", label: "Manual" },
                                                    { value: "all", label: "All" },
                                                    { value: "automated", label: "Automated" },
                                                ]}
                                            />
                                        </div>)}
                                    </div>
                                    <div className="card-body">
                                        {loading ? (
                                            <div className="card-body">
                                                <div className="dimmer active">
                                                    <TableSkeleton columns={6} rows={currentNotifications.length} />
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <NotifyUsersTable
                                                    notificationData={currentNotifications}
                                                    message={message}
                                                    currentTab={currentTab}
                                                    filterNotification={filterNotification}
                                                    onRecordClick={this.onOpenViewNotificationModel}
                                                    onRemoveClick={this.openModal}
                                                    userRole={window.user.role}
                                                />
                                                {/* Pagination inside card body */}
                                                {totalPages > 1 && (
                                                    <div className="d-flex justify-content-end mt-3">
                                                        <Pagination
                                                            currentPage={currentPage}
                                                            totalPages={totalPages}
                                                            onPageChange={this.handlePageChange}
                                                        />
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <NotifyUserModal
                    show={showModal}
                    onClose={this.onCloseNotificationModal}
                    onSubmit={this.handleSubmit}
                    onChange={this.handleInputChange}
                    formData={this.getFormData()}
                    errors={this.state.errors}
                    loading={this.state.ButtonLoading}
                    employeeData={employeeData}
                    selectedEmployee={selectedEmployee}
                    handleEmployeeChange={this.handleEmployeeChange}

                />

                <DeleteModal
                    show={!!this.state.notificationToHide}
                    onConfirm={this.confirmRemove}
                    isLoading={this.state.ButtonLoading}
                    deleteBody='Are you sure you want to hide the Notification?'
                    modalId="deleteNotificationModal"
                    onClose={this.onCloseRemoveModal}
                    label='Hide'
                />
                <ViewNotificationModel
                    show={viewNotificationModal}
                    isLoading={false}
                    onClose={this.onCloseViewNotificationModel}
                    errors={this.state.errors}
                    loading={this.state.ButtonLoading}
                    employeeData={employeeData}
                    selectedEmployee={selectedEmployee}
                    selectedNotification={selectedNotification}
                    onChange={this.handleStatusChange}
                    currentTab={currentTab}

                />



            </>
        )
    }
}
const mapStateToProps = state => ({
    fixNavbar: state.settings.isFixNavbar
})

const mapDispatchToProps = dispatch => ({})
export default connect(mapStateToProps, mapDispatchToProps)(NotifyUsers);



