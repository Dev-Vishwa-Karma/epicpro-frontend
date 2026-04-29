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
import DefaultUsersSetting from './elements/DefaultUsersSetting';
import NotifyUserCards from './elements/NotifyUserCards';


class NotifyUsers extends Component {
    constructor(props) {
        super(props);
        this.state = {
            notificationData: [],
            employeeData: [],
            filterFromDate: getToday(),
            filterToDate: getToday(),
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
            DefaultUsersSettingModal: false,
            viewFilter: 'list',
            search: '',
            defaultEmployeeSetting: {
                kye: "",
                value: [],
            },
            defaultSelectedEmployee:[],
            selectedNotification: {
                title: "",
                body: "",
                type: "",
                priority: "",
                attach: [],
                status: "",
                selectedEmployee: []
            },
            filterNotification: 'all',
            col: (window.user.role === "admin" || window.user.role === "super_admin") ? 2 : 2,
            currentPage: 1,
            dataPerPage: 10,
            currentTab: "receive"
        };
    }

    componentDidMount() {
        this.getNotifications()
        this.getEmployees()
        this.getUserDefaultSetting();
        const hash = window.location.hash;
        const map = { '#sent': 'sent', '#draft': 'draft' };
        this.notificationDetail(map[hash] || 'receive');

        //event to update the status when notification has mark as read
        emitter.on("notificationUpdated", () => {
            if (window.location.pathname === "/connect") {
                this.getNotifications();
            }
        });
    }

    getNotifications = () => {
        const { filterFromDate, filterToDate, notificationData, filterNotification, currentTab, search } = this.state;
        const filter = currentTab === 'sent' || currentTab === 'draft' ? currentTab : filterNotification;
        let requestData = {
            action: 'get_push_notification',
            filter: filter,
            search: JSON.stringify(search)
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

    getUserDefaultSetting = () => {
        getService.getCall('notification_setting.php', {
            action: 'view',
            user_ids: window.user.id
        })
            .then(data => {
                if (data.status === 'success') {
                    const setting = data.data;
                    const selectedEmployee = JSON.parse(setting.value).map(Number) || [];
                    this.setState({
                        defaultEmployeeSetting: {
                            key: setting.key,
                            value: selectedEmployee
                        },
                        defaultSelectedEmployee:selectedEmployee,
                    });
                } else {
                    this.setState({ defaultEmployeeSetting: {key : "", value: []} });
                }
            })
            .catch(err => {
                this.setState({ defaultEmployeeSetting: {key : "", value: []} });
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

                    const employees = data.data.filter(data => data.status === 1);
                    this.setState({ employeeData: employees });
                } else {
                    this.setState({ error: data.message });
                }
            })
            .catch(err => {
                this.setState({ error: 'Failed to fetch data' });
                console.error(err);
            });
    }

    handleAddClick = () => {
        this.setState({
            showModal: true,
            selectedNotification: {
                title: "",
                body: "",
                type: "",
                priority: "",
                attach: [],
                status: "",
                selectedEmployee: this.state.defaultEmployeeSetting.value
            },
            errors: {}
        });
    }

    onCloseNotificationModal = () => {
        this.setState({
            showModal: false,
            selectedNotification: {
                title: "",
                body: "",
                type: "",
                priority: "",
                attach: [],
                status:[],
                selectedEmployee: []
            },
            errors: {},
            ButtonLoading: false
        })
    }

    validateNotificationForm = (title, body, attach, type, priority, selectedEmployee) => {

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
            errors.type = "Notification Type is required.";
            isValid = false;
        }
        if (!priority.trim()) {
            errors.priority = "Priority is required.";
            isValid = false;
        }
        if (!selectedEmployee || selectedEmployee.length === 0) {
            errors.selectedEmployee = "SelectedEmployee is required.";
            isValid = false;
        }

        return { isValid, errors };
    };

    handleSubmit = (event) => {
        const { selectedNotification, currentTab } = this.state;
        if (selectedNotification == null) {
            const errors = {
                title: "Title is required.",
                body: "Body is required.",
                type: " Notification Type is required",
                priority: "Priority is required",
                selectedEmployee: "SelectedEmployee is required."
            };
            this.setState({ errors });
            return
        }

        const { title, body, attach, type, priority, selectedEmployee } = selectedNotification;
        const { isValid, errors } = this.validateNotificationForm(title, body, attach, type, priority, selectedEmployee);
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
            email: email,
            status:event,
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
                    const newNotification = data.newNotification;
                    this.setState((prevState) => {

                        let updatedData = prevState.notificationData || [];

                        if(currentTab === 'draft' && event === 'sent'){
                            updatedData = updatedData.filter(
                                item => item.id !== newNotification.id
                            );
                        }else if (currentTab === 'sent' && event === 'sent' || currentTab === 'draft' && event === 'draft') {
                            updatedData = [
                                newNotification,
                                ...updatedData
                            ];
                        }

                        return {
                            notificationData: updatedData,
                            selectedNotification: {
                                title: "",
                                body: "",
                                type: "",
                                priority: "",
                                attach: [],
                                status:[],
                                selectedEmployee: []
                            },
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

    handleEditNotification = (notification) => {
        const safeParse = (data, mapFn) => {
            try {
                return data ? JSON.parse(data).map(mapFn) : [];
            } catch {
                return [];
            }
        };
        const attachments = safeParse(notification.filePath, p => p.split('/').pop());
        const employees = safeParse(notification.receiver, r => r.employee_id);

        this.setState({
            showModal: true,
            selectedNotification: {
                id: notification.id,
                title: notification.title || "",
                body: notification.body ||  "",
                type: notification.type || "",
                attach: attachments,
                priority: notification.priority || "",
                status: notification.status || "",
                selectedEmployee: employees
            },
            errors: {}
        });
    }

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
        this.setState({ selectedNotification: { ...this.state.selectedNotification, selectedEmployee: event.target.value } });
    };

    openRemoveModal = (notification) => {
        this.setState({
            selectedNotification: notification,
            notificationToHide: notification.id
        });
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

    handleDateApplyFilter = async () => {
        this.getNotifications();
    };

    onOpenViewNotificationModel = (selected) => {
        const { employeeData } = this.state;
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
                priority: "",
                type: "",
                status: "",
                selectedEmployee: []
            },
            errors: {},
            ButtonLoading: false
        })
        this.getNotifications();
    }

    handleStatusChange = (e) => {
        const value = e.target.value;
        const { selectedNotification } = this.state;

        const formData = new FormData();
        formData.append('id', selectedNotification.id);
        formData.append('status', value);
        formData.append('sender', selectedNotification.sender);
        formData.append('user', JSON.stringify({
            id: window.user.id,
            name: `${window.user.first_name} ${window.user.last_name}`
        }));

        getService.addCall("push_notification.php", 'update_status',formData).then((data) => {
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

    notificationDetail = (tab) => {
        const event = tab === 'sent' ? 'sent' : tab === 'draft' ? 'draft' : 'all';
        this.setState(
            {
                filterNotification: event,
                notificationData: [],
                currentPage: 1,
                filterFromDate: getToday(),
                filterToDate: getToday(),
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

    handleDefaultUsers = () => {
        const formData = new FormData();
        formData.append('key', 'user_ids');
        formData.append('value', JSON.stringify(this.state.defaultSelectedEmployee));
        formData.append('created_by', window.user.id);

        getService.addCall('notification_setting.php', 'update', formData)
            .then((data) => {

                if (data.status === "success") {
                    this.setState((prevState) => ({
                        DefaultUsersSettingModal: false,
                        defaultEmployeeSetting: {
                            ...prevState.defaultEmployeeSetting,
                            value: this.state.defaultSelectedEmployee
                        },
                        successMessage: "Default users setting saved successfully!",
                        showSuccess: true,
                        errorMessage: "",
                        showError: false,
                    }));
                    setTimeout(this.dismissMessages, 3000);
                } else {
                    this.setState({
                        errorMessage: "Failed to save default users setting. Please try again.",
                        showError: true,
                        successMessage: "",
                        showSuccess: false,
                    });
                    setTimeout(this.dismissMessages, 3000);
                }
            })
            .catch((error) => {
                console.error("Error:", error);
                this.setState({
                    errorMessage: "An error occurred while saving default users setting.",
                    showError: true,
                    successMessage: "",
                    showSuccess: false,
                });
                setTimeout(this.dismissMessages, 3000);
            });
    }

    changeDefaultEmployeeSetting = (e) => {
        const { name } = e.target;
        let { value } = e.target;
        const { defaultSelectedEmployee } = this.state;
        this.setState({
            defaultSelectedEmployee: value
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

    handleViewFilterChange = (e) => {
        const event = e.target.value;
        this.setState({ viewFilter: event });
    }

    handleRecordFilterChange = (e,filter) => {
        const value = e.target.value;
         this.setState((prevState) => ({
                search: {
                    // [filter]: value
                    type: filter === 'type' ? value : '',
                    status: filter === 'status' ? value : ''
                }
            }), () => {
                this.getNotifications();
        });

    }

    render() {
        const { fixNavbar } = this.props;
        const { notificationData, message, loading, showSuccess, successMessage, showError, errorMessage, col, selectedNotification, showModal, employeeData, currentPage, dataPerPage, currentTab, filterNotification, viewNotificationModal, DefaultUsersSettingModal, defaultEmployeeSetting, viewFilter, defaultSelectedEmployee } = this.state;

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
                                <li className="nav-item">
                                    <a className={`nav-link ${currentTab === "draft" ? "active" : ""}`} href="#draft" onClick={() => this.notificationDetail("draft")}> Draft </a>
                                </li>
                            </ul>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <Button
                                        label="Connect"
                                        onClick={() => this.handleAddClick()}
                                        className="btn-primary small-btn"
                                        style={{ float: "right", marginRight: 4 }}
                                        icon="fe fe-plus"
                                        iconStyle={{ marginRight: '8px' }}
                                    />
                                </div>
                                <div>
                                    <select
                                        id="employeeFilter"
                                        className="form-control custom-select"
                                        value={viewFilter}
                                        onChange={this.handleViewFilterChange}
                                    >
                                        <option value="list">List View</option>
                                        <option value="card">Card View</option>
                                    </select>
                                </div>

                                <div
                                    onClick={() => this.setState({ DefaultUsersSettingModal: true })}
                                    style={{ cursor: 'pointer', marginLeft:'4px' }}
                                    title="Default Users Setting"
                                >
                                    <i className="fa fa-gear"></i>
                                </div>
                            </div>
                        </div>
                        <div className="card">
                            <div className="card-body">
                                <div className="row">
                                    <DateFilterForm
                                        fromDate={this.state.filterFromDate}
                                        toDate={this.state.filterToDate}
                                        ButtonLoading={this.state.ButtonLoading}
                                        handleDateChange={this.handleDateChange}
                                        handleApplyFilters={this.handleDateApplyFilter}
                                        col={col}
                                    />
                                    <div className={`col-md-${col}`}>
                                        {/* <Button
                                            label="Connect"
                                            onClick={() => this.handleAddClick()}
                                            className="btn-primary"
                                            style={{ float: "right", marginTop: 26 }}
                                            icon="fe fe-plus"
                                            iconStyle={{ marginRight: '8px' }}
                                        // dataToggle="modal"
                                        // dataTarget="#addBreakModal"
                                        /> */}
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
                                    <div className="">
                                        <div className="d-flex justify-content-between align-items-center p-20">
                                            <h3 className="card-title">Notification List</h3>

                                            {currentTab === 'receive' &&(<div className="d-flex justify-content-between align-items-center">
                                                <select
                                                    id="employeeFilter"
                                                    className="form-control custom-select ml-2"
                                                    value={this.state.search.type ?? ''}
                                                    onChange={(event) => this.handleRecordFilterChange(event,'type')}
                                                >
                                                    <option value="">Filter Type</option>
                                                    <option value="todo">Todo</option>
                                                    <option value="need_discussion">Need Discussion</option>
                                                    <option value="information">Information</option>
                                                </select>
                                                <select
                                                    id="employeeFilter"
                                                    className="form-control custom-select ml-2"
                                                    value={this.state.search.status ?? ''}
                                                    onChange={(event) => this.handleRecordFilterChange(event,'status')}
                                                >
                                                    <option value="">Filter Status</option>
                                                    <option value="unread">Unread</option>
                                                    <option value="read">Read</option>
                                                    <option value="ready_to_discuss">Ready To Discussion</option>
                                                    <option value="completed">Completed</option>
                                                </select>
                                            </div>)}
                                        </div>
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
                                                {
                                                    viewFilter === 'list' ? (

                                                        <NotifyUsersTable
                                                            notificationData={currentNotifications}
                                                            message={message}
                                                            currentTab={currentTab}
                                                            filterNotification={filterNotification}
                                                            onRecordClick={this.onOpenViewNotificationModel}
                                                            onRemoveClick={this.openRemoveModal}
                                                            userRole={window.user.role}
                                                            handleEditNotification={this.handleEditNotification}
                                                        />
                                                    ) : (

                                                        <NotifyUserCards
                                                            notificationData={currentNotifications}
                                                            message={message}
                                                            currentTab={currentTab}
                                                            filterNotification={filterNotification}
                                                            onRecordClick={this.onOpenViewNotificationModel}
                                                            onRemoveClick={this.openRemoveModal}
                                                            userRole={window.user.role}
                                                            handleEditNotification={this.handleEditNotification}
                                                        />
                                                    )
                                                }
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
                    formData={selectedNotification}
                    errors={this.state.errors}
                    loading={this.state.ButtonLoading}
                    employeeData={employeeData}
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
                    selectedEmployee={selectedNotification.selectedEmployee}
                    selectedNotification={selectedNotification}
                    onChange={this.handleStatusChange}
                    currentTab={currentTab}

                />
                <DefaultUsersSetting
                    show={DefaultUsersSettingModal}
                    onClose={() => this.setState({ DefaultUsersSettingModal: false })}
                    onSubmit={this.handleDefaultUsers}
                    formData={defaultSelectedEmployee ? defaultSelectedEmployee : []}
                    onChange={this.changeDefaultEmployeeSetting}
                    // errors={{}}
                    loading={this.state.ButtonLoading}
                    employeeData={employeeData}
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



