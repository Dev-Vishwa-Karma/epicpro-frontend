import React, { Component } from "react";
import { connect } from 'react-redux';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import Button from '../../common/formInputs/Button';
import { getService } from '../../../services/getService';
import {
    boxAction, box2Action, box3Action, boxCloseAction, box2CloseAction, box3CloseAction
} from '../../../actions/settingsAction';
import TicketListTable from "./elements/TicketListTable";
import DeleteModal from "../../common/DeleteModal";
import Pagination from "../../common/Pagination";

class Ticket extends Component {
    constructor(props) {
        super(props);
        this.state = {
            employeeData: [],
            ticketListData: [],
            selectedTicketDetails: [],
            InProgressTicketCount: 0,
            TodoTicketCount: 0,
            CompletedTicketCount: 0,
            title: "",
            description: '',
            priority: '',
            assigned_to: '',
            loading: true,
            assigned_by: '',
            progress: '',
            due_date: '',
            completed_at: '',
            selectedTicket: null,
            showModal: false,
            selectedEmployee: "",
            searchQuery: "",
            logged_in_employee_id: '',
            logged_in_employee_role: '',
            deleteTicket: null,
            currentPage: 1,
            dataPerPage: 10,
        };
        this.handleSearchChange = this.handleSearchChange.bind(this);
    }

    handlePageChange = (newPage) => {
        const totalPages = Math.ceil(this.state.ticketListData.length / this.state.dataPerPage);
        if (newPage >= 1 && newPage <= totalPages) {
            this.setState({ currentPage: newPage });
        }
    };

    getTicket = (searchQuery) => {
        const { id, role } = window.user;

        getService.getCall('tickets.php', {
            action: 'view',
            role: role === "admin" || role === "super_admin" ? null : id,
            searchQuery: searchQuery,
        })
            .then((ticketListData) => {
                let ticketsArray = Array.isArray(ticketListData.data) ? ticketListData.data : [ticketListData.data];

                const inProgressTickets = ticketsArray.filter(ticket => ticket.status === 'in-progress').length ?? 0;
                const toDoTicket = ticketsArray.filter(ticket => ticket.status === 'to-do').length ?? 0;
                const completedTickets = ticketsArray.filter(ticket => ticket.status === 'completed').length ?? 0;

                this.setState({
                    ticketListData: ticketsArray,
                    InProgressTicketCount: inProgressTickets,
                    TodoTicketCount: toDoTicket,
                    CompletedTicketCount: completedTickets,
                    loading: false
                });
            })
            .catch(err => {
                this.setState({ message: "Failed to fetch data", loading: false });
                console.error(err);
            })
    }

    getEmployee = () => {
        getService.getCall('get_employees.php', {
            action: 'view',
            role: 'employee',
        })
            .then((employeesData) => {
                let employeesArray = Array.isArray(employeesData.data) ? employeesData.data : [employeesData.data];

                this.setState({
                    employeeData: employeesArray,
                })
            })
    }

    fetchData = (searchQuery = '') => {
        try {
            this.getEmployee();
            this.getTicket(searchQuery);
            this.setState({ loading: false });
        } catch (err) {
            this.setState({ message: "Failed to fetch data", loading: false });
            console.error(err);
        }
    }

    handleSearchChange(event) {
        const searchQuery = event.target.value;

        this.setState({ searchQuery }, () => {
            this.fetchData(searchQuery);
        });
    }

    componentDidMount() {
        const { id, role } = window.user;
        this.setState({
            employee_id: id || null,
            logged_in_employee_role: role || null,
        });

        this.fetchData()
    }

    openDeleteModal = (ticketId) => {
        this.setState({
            deleteTicket: ticketId,
        });
    };

    onCloseDeleteTicketModal = () => {
        this.setState({ deleteTicket: null });
    };

    handleEmployeeChange = (event) => {
        this.setState({ selectedEmployee: event.target.value });
    };

    handleAddClick = () => {
        this.props.history.push("/add-ticket");
    }

    goToEditTicket = (ticket, ticketId) => {
        if (ticketId) {
            this.props.history.push({
                pathname: `/edit-ticket`,
                state: { ticket, ticketId }
            });
        }
    }

    goToViewTicket = (ticket, ticketId) => {
        if (ticket.ticket_id) {
            getService.getCall('tickets.php', {
                action: 'get',
                ticket_id: ticketId
            })
                .then((ticketDetails) => {
                    if (ticketDetails.data) {
                        this.props.history.push({
                            pathname: `/view-ticket`,
                            state: { ticketId: ticket.ticket_id }
                        });
                    } else {
                        console.warn("No ticket found.");
                        this.props.history.push({
                            pathname: `/ticket`,
                            state: { ticket, selectedTicket: [], ticketId }
                        });
                    }
                })
                .catch((err) => {
                    console.error("Failed to fetch ticket details", err);
                });
        }
    }

    confirmDelete = () => {
        const { deleteTicket, ticketListData } = this.state;
        if (!deleteTicket) return;

        this.setState({ ButtonLoading: true });

        getService.deleteCall('tickets.php', 'delete', deleteTicket)
            .then((response) => {
                if (response.status === 'success') {
                    const updatedTickets = ticketListData.filter(ticket => ticket.ticket_id !== deleteTicket);

                    this.setState({
                        ticketListData: updatedTickets,
                        deleteTicket: null,
                        ButtonLoading: false
                    });
                } else {
                    console.error("Failed to delete the ticket.");
                    this.setState({ ButtonLoading: false });
                }
            })
            .catch((err) => {
                console.error("Error deleting the ticket", err);
                this.setState({ ButtonLoading: false });
            });
    }

    render() {
        const { fixNavbar, boxOpen, box2Open, box3Open, boxClose, box2Close, box3Close } = this.props;
        const { ticketListData, message, loading, searchQuery, InProgressTicketCount, TodoTicketCount, CompletedTicketCount, dataPerPage, currentPage } = this.state;

        const indexOfLastTicket = currentPage * dataPerPage;
        const indexOfFirstTicket = indexOfLastTicket - dataPerPage;
        const currentTickets = ticketListData.slice(indexOfFirstTicket, indexOfLastTicket);
        const totalPages = Math.ceil(ticketListData.length / dataPerPage);

        return (
            <>
                <div className={`section-body ${fixNavbar ? "marginTop" : ""}`}>
                    <div className="container-fluid">
                        <div className="d-md-flex justify-content-between align-items-center">
                            <ul className="nav nav-tabs page-header-tab">
                                {/* <li className="nav-item"><a className="nav-link active" id="TaskBoard-tab" data-toggle="tab" href="#TaskBoard-list">List View</a></li> */}
                                {/* <li className="nav-item"><a className="nav-link" id="TaskBoard-tab" data-toggle="tab" href="#TaskBoard-grid">Grid View</a></li> */}
                            </ul>
                            <div className="header-action d-flex">
                                <div className="input-group">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={this.handleSearchChange}
                                    />
                                </div>
                                {this.state.logged_in_employee_role != 'employee' && (
                                    <Button
                                        label="Add"
                                        onClick={this.handleAddClick}
                                        className="btn-primary ml-4"
                                        icon="fe fe-plus mr-2"
                                    />
                                )}
                            </div>
                        </div>
                        <div className="row clearfix mt-2">
                            <div className="col-lg-4 col-md-6">
                                <div className="card">
                                    <div className="card-body text-center">
                                        <h6>To-do</h6>
                                        <div style={{ width: '50%', margin: 'auto' }} >
                                            <CircularProgressbar value={TodoTicketCount} text={`${TodoTicketCount}`} strokeWidth={5} styles={buildStyles({ pathColor: `rgb(110, 118, 135)` })} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-4 col-md-6">
                                <div className="card">
                                    <div className="card-body text-center">
                                        <h6>In progress</h6>
                                        <div style={{ width: '50%', margin: 'auto' }} >
                                            <CircularProgressbar value={InProgressTicketCount} text={`${InProgressTicketCount}`} strokeWidth={5} styles={buildStyles({ pathColor: `rgb(110, 118, 135)` })} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-4 col-md-6">
                                <div className="card">
                                    <div className="card-body text-center">
                                        <h6>Completed</h6>
                                        <div style={{ width: '50%', margin: 'auto' }} >
                                            <CircularProgressbar value={CompletedTicketCount} text={`${CompletedTicketCount}`} strokeWidth={5} styles={buildStyles({ pathColor: `rgb(110, 118, 135)` })} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="section-body">
                    <div className="container-fluid">
                        <div className="tab-content taskboard">
                            <div className="tab-pane fade show active" id="TaskBoard-list" role="tabpanel">
                                <TicketListTable
                                    loading={loading}
                                    logged_in_employee_role={this.state.logged_in_employee_role}
                                    ticketListData={currentTickets}
                                    goToViewTicket={this.goToViewTicket}
                                    message={message}
                                    goToEditTicket={this.goToEditTicket}
                                    openDeleteModal={this.openDeleteModal}
                                />
                            </div>
                            {totalPages > 1 && (
                                <div className="d-flex justify-content-end mt-2 mb-3">
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={this.handlePageChange}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <DeleteModal
                    show={!!this.state.deleteTicket}
                    onConfirm={this.confirmDelete}
                    isLoading={this.state.ButtonLoading}
                    deleteBody='Are you sure you want to delete the ticket and associated comments?'
                    modalId="deleteTicketModal"
                    onClose={this.onCloseDeleteTicketModal}
                />
            </>
        )
    }
}
const mapStateToProps = state => ({
    fixNavbar: state.settings.isFixNavbar,
})

export default connect(mapStateToProps)(Ticket);