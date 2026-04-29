import React, { Component, useEffect } from 'react'
import { connect } from 'react-redux';
import ConnectListView from './elements/ConnectListView'
import { getService } from '../../../services/getService';
import AddConnectModal from './elements/AddConnectModal';
import Pagination from '../../common/Pagination';
import TableSkeleton from '../../common/skeletons/TableSkeleton';
import { formatDate, getToday } from '../../../utils';
import DateFilterForm from '../../common/DateFilterForm';
import Button from '../../common/formInputs/Button';
import DeleteModal from '../../common/DeleteModal';
import InputField from '../../common/formInputs/InputField';
import ViewConnectModel from './elements/ViewConnectModel'
import ConnectSetting from './elements/ConnectSetting';
import ConnectCardsView from './elements/ConnectCardView';


class Connect extends Component {
    constructor(props) {
        super(props);
        this.state = {
            connectData: [],
            employeeData: [],
            filterFromDate: getToday(),
            filterToDate: getToday(),
            filterEmployeeId: "",
            loading: true,
            connectsToHide: null,
            successMessage: "",
            errorMessage: "",
            showSuccess: false,
            showError: false,
            ButtonLoading: false,
            showModal: false,
            viewConnectModal: false,
            connectSettingModal: false,
            viewFilter: 'list',
            search: '',
            defaultConnectEmployee: {
                kye: "",
                value: [],
            },
            defaultSelectedEmployee:[],
            selectedConnect: {
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
        this.connectDetail(map[hash] || 'receive');
    }

    getNotifications = () => {
        const { filterFromDate, filterToDate, connectData, filterNotification, currentTab, search } = this.state;
        const filter = currentTab === 'sent' || currentTab === 'draft' ? currentTab : filterNotification;
        let requestData = {
            action: 'get_connects',
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

        getService.getCall('connect.php', requestData)
            .then(data => {
                if (data.status === 'success') {
                    this.setState({ connectData: data.data, message: data.message, loading: false });
                } else {
                    this.setState({ connectData: [], message: data.message, loading: false });
                }
            })
            .catch(err => {
                this.setState({ message: 'Failed to fetch data', loading: false });
                console.error(err);
            });
    }

    getUserDefaultSetting = () => {
        getService.getCall('connect_setting.php', {
            action: 'view',
            user_ids: window.user.id
        })
            .then(data => {
                if (data.status === 'success') {
                    const setting = data.data;
                    const selectedEmployee = JSON.parse(setting.value).map(Number) || [];
                    this.setState({
                        defaultConnectEmployee: {
                            key: setting.key,
                            value: selectedEmployee
                        },
                        defaultSelectedEmployee:selectedEmployee,
                    });
                } else {
                    this.setState({ defaultConnectEmployee: {key : "", value: []} });
                }
            })
            .catch(err => {
                this.setState({ defaultConnectEmployee: {key : "", value: []} });
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
            selectedConnect: {
                title: "",
                body: "",
                type: "",
                priority: "",
                attach: [],
                status: "",
                selectedEmployee: this.state.defaultConnectEmployee.value
            },
            errors: {}
        });
    }

    onCloseNotificationModal = () => {
        this.setState({
            showModal: false,
            selectedConnect: {
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
        const { selectedConnect, currentTab } = this.state;
        if (selectedConnect == null) {
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

        const { title, body, attach, type, priority, selectedEmployee } = selectedConnect;
        const { isValid, errors } = this.validateNotificationForm(title, body, attach, type, priority, selectedEmployee);
        if (!isValid) {
            this.setState({ errors });
            return;
        }
        this.setState({ ButtonLoading: true });
        const { id, email } = window.user;
        const formData = new FormData();
        Object.entries({
            ...selectedConnect,
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
        getService.addCall('connect.php', 'add', formData
        )
            .then((data) => {
                if (data.success) {
                    // Update the Notification list
                    const newNotification = data.newNotification;
                    this.setState((prevState) => {

                        let updatedData = prevState.connectData || [];

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
                            connectData: updatedData,
                            selectedConnect: {
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

    handleEditconnect = (notification) => {
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
            selectedConnect: {
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
            selectedConnect: {
                ...prevState.selectedConnect,
                [name]: value,
            },
            errors: {
                ...prevState.errors,
                [name]: "",
            }
        }));
    };

    handleEmployeeChange = (event) => {
        this.setState({ selectedConnect: { ...this.state.selectedConnect, selectedEmployee: event.target.value } });
    };

    openRemoveModal = (notification) => {
        this.setState({
            selectedConnect: notification,
            connectsToHide: notification.id
        });
    };

    onCloseRemoveModal = () => {
        this.setState({ connectsToHide: null });
    }

    confirmRemove = () => {
        const { connectsToHide, selectedConnect, currentPage, connectData, dataPerPage } = this.state;
        if (!connectsToHide) return;
        this.setState({ ButtonLoading: true });

        getService.getCall("connect.php", {
            action: 'is_removed',
            id: selectedConnect.id,
            hidden: 1,
            employee_id: selectedConnect.employee_id
        }).then((data) => {
            if (data.success) {

                let newPage = currentPage;
                const updatedRecord = connectData?.filter((d) => d.id !== connectsToHide);
                const totalPages = Math.ceil(updatedRecord.length / dataPerPage);
                if (newPage >= 1 && newPage <= totalPages) {
                    this.setState({ currentPage: newPage });
                }

                this.setState((prevState) => ({
                    connectData: updatedRecord,
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
            viewConnectModal: true,
            selectedConnect: selected,
            errors: {},
            ButtonLoading: false
        })
    };

    onCloseViewConnectModel = () => {
        this.setState({
            viewConnectModal: false,
            selectedConnect: {
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
        const { selectedConnect } = this.state;

        const formData = new FormData();
        formData.append('id', selectedConnect.id);
        formData.append('status', value);
        formData.append('sender', selectedConnect.sender);
        formData.append('user', JSON.stringify({
            id: window.user.id,
            name: `${window.user.first_name} ${window.user.last_name}`
        }));

        getService.addCall("connect.php", 'update_status',formData).then((data) => {
            if (data.status === "success") {
                this.setState((prevState) => ({
                    selectedConnect: {
                        ...prevState.selectedConnect,
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

    connectDetail = (tab) => {
        const event = tab === 'sent' ? 'sent' : tab === 'draft' ? 'draft' : 'all';
        this.setState(
            {
                filterNotification: event,
                connectData: [],
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
        const { dataPerPage, currentTab, connectData, filterNotification } = this.state;
        const totalPages = Math.ceil(connectData.length / dataPerPage);
        if (newPage >= 1 && newPage <= totalPages) {
            this.setState({ currentPage: newPage });
        }
    };

    handleDefaultUsers = () => {
        const formData = new FormData();
        formData.append('key', 'user_ids');
        formData.append('value', JSON.stringify(this.state.defaultSelectedEmployee));
        formData.append('created_by', window.user.id);

        getService.addCall('connect_setting.php', 'update', formData)
            .then((data) => {

                if (data.status === "success") {
                    this.setState((prevState) => ({
                        connectSettingModal: false,
                        defaultConnectEmployee: {
                            ...prevState.defaultConnectEmployee,
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

    changeDefaultConnectEmployee = (e) => {
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
        const { connectData, message, loading, showSuccess, successMessage, showError, errorMessage, col, selectedConnect, showModal, employeeData, currentPage, dataPerPage, currentTab, filterNotification, viewConnectModal, connectSettingModal, defaultConnectEmployee, viewFilter, defaultSelectedEmployee } = this.state;

        const indexOfLastNotification = currentPage * dataPerPage;
        const indexOfFirstNotification = indexOfLastNotification - dataPerPage;

        const currentConnect = connectData.slice(
            indexOfFirstNotification,
            indexOfLastNotification
        );
        const totalPages = Math.ceil(connectData.length / dataPerPage);

        return (
            <>
                <div className={`section-body ${fixNavbar ? "marginTop" : ""} `}>
                    <div className="container-fluid">
                        <div className="d-flex justify-content-between align-items-center">
                            <ul className="nav nav-tabs page-header-tab">
                                <li className="nav-item">
                                    <a className={`nav-link ${currentTab === "receive" ? "active" : ""}`} href="#received" onClick={() => this.connectDetail("receive")}> Received </a>
                                </li>
                                <li className="nav-item">
                                    <a className={`nav-link ${currentTab === "sent" ? "active" : ""}`} href="#sent" onClick={() => this.connectDetail("sent")}> Sent </a>
                                </li>
                                <li className="nav-item">
                                    <a className={`nav-link ${currentTab === "draft" ? "active" : ""}`} href="#draft" onClick={() => this.connectDetail("draft")}> Draft </a>
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
                                    onClick={() => this.setState({ connectSettingModal: true })}
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
                                                    <TableSkeleton columns={6} rows={currentConnect.length} />
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                {
                                                    viewFilter === 'list' ? (

                                                        <ConnectListView
                                                            connectData={currentConnect}
                                                            message={message}
                                                            currentTab={currentTab}
                                                            filterNotification={filterNotification}
                                                            onRecordClick={this.onOpenViewNotificationModel}
                                                            onRemoveClick={this.openRemoveModal}
                                                            userRole={window.user.role}
                                                            handleEditconnect={this.handleEditconnect}
                                                        />
                                                    ) : (

                                                        <ConnectCardsView
                                                            connectData={currentConnect}
                                                            message={message}
                                                            currentTab={currentTab}
                                                            filterNotification={filterNotification}
                                                            onRecordClick={this.onOpenViewNotificationModel}
                                                            onRemoveClick={this.openRemoveModal}
                                                            userRole={window.user.role}
                                                            handleEditconnect={this.handleEditconnect}
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

                <AddConnectModal
                    show={showModal}
                    onClose={this.onCloseNotificationModal}
                    onSubmit={this.handleSubmit}
                    onChange={this.handleInputChange}
                    formData={selectedConnect}
                    errors={this.state.errors}
                    loading={this.state.ButtonLoading}
                    employeeData={employeeData}
                    handleEmployeeChange={this.handleEmployeeChange}

                />

                <DeleteModal
                    show={!!this.state.connectsToHide}
                    onConfirm={this.confirmRemove}
                    isLoading={this.state.ButtonLoading}
                    deleteBody='Are you sure you want to hide the Notification?'
                    modalId="deleteNotificationModal"
                    onClose={this.onCloseRemoveModal}
                    label='Hide'
                />
                <ViewConnectModel
                    show={viewConnectModal}
                    isLoading={false}
                    onClose={this.onCloseViewConnectModel}
                    errors={this.state.errors}
                    loading={this.state.ButtonLoading}
                    employeeData={employeeData}
                    selectedEmployee={selectedConnect.selectedEmployee}
                    selectedConnect={selectedConnect}
                    onChange={this.handleStatusChange}
                    currentTab={currentTab}

                />
                <ConnectSetting
                    show={connectSettingModal}
                    onClose={() => this.setState({ connectSettingModal: false })}
                    onSubmit={this.handleDefaultUsers}
                    formData={defaultSelectedEmployee ? defaultSelectedEmployee : []}
                    onChange={this.changeDefaultConnectEmployee}
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
export default connect(mapStateToProps, mapDispatchToProps)(Connect);



