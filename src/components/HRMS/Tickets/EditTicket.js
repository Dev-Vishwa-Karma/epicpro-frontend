import React, { Component } from 'react';
import Button from "../../common/formInputs/Button";
import { getService } from "../../../services/getService";
import { validateFields } from "../../common/validations";
import { appendDataToFormData } from "../../../utils";
import InputField from "../../common/formInputs/InputField";
import EmployeeSelector from "../../common/EmployeeSelector";
import TextEditor from "../../common/TextEditor";
import { connect } from "react-redux";

class EditTicket extends Component {
    constructor(props) {
        super(props);
        this.state = {
            employeeData: [],
            ticket_id: '',
            title: '',
            description: '',
            assigned_to: '',
            due_date: '',
            progress: '0%',
            completed_at: '',
            priority: '',
            selectedEmployee: "",
            errors: {},
            ButtonLoading: false,
            isEdit: true,
        };

        this.fieldRefs = {
            title: React.createRef(),
            description: React.createRef(),
            priority: React.createRef(),
            due_date: React.createRef(),
            assigned_to: React.createRef(),
        };
    }

    stripHtml(html) {
        const div = document.createElement("div");
        div.innerHTML = html;
        return div.textContent || div.innerText || "";
    }

    componentDidMount() {
        const { location } = this.props;
        if (location && location.state && location.state.ticket) {
            const ticket = location.state.ticket;
            const ticket_id = location.state.ticketId;

            const formatDate = (dateStr) => {
                if (!dateStr) return "";
                const d = new Date(dateStr);
                if (isNaN(d.getTime())) return "";

                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');

                return `${year}-${month}-${day}`;
            };

            const formatDateTime = (dateStr) => {
                if (!dateStr) return "";
                const d = new Date(dateStr);
                if (isNaN(d.getTime())) return "";

                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                const hours = String(d.getHours()).padStart(2, '0');
                const minutes = String(d.getMinutes()).padStart(2, '0');

                return `${year}-${month}-${day}T${hours}:${minutes}`;
            };

            getService.getCall('tickets.php', {
                action: 'get',
                ticket_id: ticket_id
            })
                .then((ticketDetails) => {
                    if (ticketDetails.data) {
                        this.setState({
                            ticket_id: ticketDetails.data.ticket.ticket_id || "",
                            title: ticketDetails.data.ticket.title || "",
                            description: ticketDetails.data.ticket.description || "",
                            priority: ticketDetails.data.ticket.priority || "",
                            due_date: formatDate(ticketDetails.data.ticket.due_date) || "",
                            progress: ticketDetails.data.ticket.progress || "",
                            completed_at: formatDate(ticketDetails.data.ticket.completed_at) || "",
                            selectedEmployee: ticketDetails.data.ticket.assigned_to.employee_id || "",
                        });
                    } else {
                        console.warn("No ticket found.");
                        this.props.history.push({
                            pathname: `/ticket`,
                            state: { ticket, selectedTicket: [], ticket_id }
                        });
                    }
                })
                .catch((err) => {
                    console.error("Failed to fetch ticket details", err);
                });
        }

        getService.getCall('get_employees.php', {
            action: 'view'
        })
            .then((employeesData) => {
                let employeesArray = Array.isArray(employeesData.data) ? employeesData.data : [employeesData.data];
                this.setState({ employeeData: employeesArray });
            })
            .catch((error) => console.error("Error fetching employees:", error));
    }
    handleEmployeeChange = (event) => {
        this.setState({ selectedEmployee: event.target.value });
    };
    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    };

    handleBack = () => {
        this.props.history.goBack();
    };

    editTicket = (e) => {
        e.preventDefault();
        this.setState({ ButtonLoading: true });
        const { id } = window.user;
        const { title, description, selectedEmployee, priority, due_date, progress, completed_at } = this.state;
        const { location } = this.props;
        const ticket_id = location.state.ticketId;

        const validationSchema = [
            { name: 'title', value: title, required: true, messageName: 'Title' },
            { name: 'description', value: description, required: true, messageName: 'Description' },
            { name: 'selectedEmployee', value: selectedEmployee, required: true, messageName: 'Employee' },
            { name: 'priority', value: priority, required: true, messageName: 'Priority' },
            { name: 'due_date', value: due_date, type: 'date', required: false, messageName: 'Due Date' },
            { name: 'progress', value: progress, type: 'number', required: false, messageName: 'Progress' },
            { name: 'completed_at', value: completed_at, type: 'date', required: false, messageName: 'Completed At' },
        ];

        const errors = validateFields(validationSchema);
        if (Object.keys(errors).length > 0) {
            this.setState({ errors, ButtonLoading: false, showError: false, showSuccess: false }, () => {
                const firstErrorField = Object.keys(errors)[0];
                const ref = this.fieldRefs[firstErrorField];
                if (ref && ref.current) {
                    ref.current.focus();
                    ref.current.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
                } else {
                    console.warn('No ref found for field:', firstErrorField);
                }
            });
            return
        } else {
            this.setState({ errors: {} });
        }
        const editTicketData = new FormData();
        const data = {
            title: title,
            description: this.stripHtml(description),
            priority: priority,
            due_date: due_date,
            assigned_by: id,
            assigned_to: selectedEmployee,
            progress: progress,
            completed_at: completed_at,
            updated_by: id
        }

        appendDataToFormData(editTicketData, data)

        getService.editCall('tickets.php', 'edit', editTicketData, ticket_id)
            .then(response => {
                if (response.status === 'success') {
                    this.setState({
                        showSuccess: true,
                        successMessage: "Ticket updated successfully!",
                        errorMessage: "",
                        showError: false,
                        ButtonLoading: false
                    });
                    this.props.history.push('/ticket');
                }
            })
            .catch(error => {
                console.error('Error updating ticket', error);
            });
    };

    render() {
        const { fixNavbar } = this.props;
        const { title, description, due_date, progress, completed_at, employeeData, selectedEmployee, priority } = this.state;
        return (
            <div>
                <div className={`section-body ${fixNavbar ? "marginTop" : ""}`}>
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-12 col-lg-12">
                                <form className="card" noValidate onSubmit={this.editTicket}>
                                    <div className="card-body">
                                        <h3 className="card-title">Edit Ticket</h3>
                                        <div className="row">
                                            <div className="col-sm-6 col-md-6">
                                                <div>
                                                    <InputField
                                                        label="Title"
                                                        name="title"
                                                        value={title}
                                                        onChange={this.handleChange}
                                                        placeholder="Title"
                                                        error={this.state.errors.title}
                                                        refInput={this.fieldRefs.title}
                                                    />
                                                </div>
                                                <div>
                                                    <EmployeeSelector
                                                        allEmployeesData={employeeData}
                                                        selectedEmployee={selectedEmployee}
                                                        handleEmployeeChange={this.handleEmployeeChange}
                                                        showAllInOption={false}
                                                    />
                                                    {this.state.errors.selectedEmployee && (
                                                        <div className="invalid-feedback d-block">{this.state.errors.selectedEmployee}</div>
                                                    )}
                                                </div>

                                                <InputField
                                                    label="Select Priority"
                                                    name="priority"
                                                    type="select"
                                                    value={priority}
                                                    onChange={this.handleChange}
                                                    error={this.state.errors.priority}
                                                    refInput={this.fieldRefs.priority}
                                                    options={[
                                                        { value: 'low', label: 'Low' },
                                                        { value: 'medium', label: 'Medium' },
                                                        { value: 'high', label: 'High' },
                                                    ]}
                                                />
                                                <InputField
                                                    label="Due Date"
                                                    name="due_date"
                                                    type="date"
                                                    value={due_date}
                                                    onChange={this.handleChange}
                                                    error={this.state.errors.due_date}
                                                    refInput={this.fieldRefs.due_date}
                                                    min={new Date().toISOString().split('T')[0]}
                                                />
                                                <InputField
                                                    label="Progress"
                                                    name="progress"
                                                    value={progress}
                                                    onChange={this.handleChange}
                                                    placeholder="0"
                                                    error={this.state.errors.progress}
                                                    type="number"
                                                    min={0}
                                                    max={100}
                                                />
                                                <InputField
                                                    label="Completed At"
                                                    name="completed_at"
                                                    type="date"
                                                    value={completed_at}
                                                    onChange={this.handleChange}
                                                    error={this.state.errors.completed_at}
                                                    // min={due_date || new Date().toISOString().split('T')[0]}
                                                />
                                            </div>
                                            <div className="col-sm-6 col-md-6">
                                                <TextEditor
                                                    value={description}
                                                    onChange={(value) => this.handleChange({ target: { name: 'description', value } })}
                                                    error={this.state.errors.description}
                                                    refInput={this.fieldRefs.description}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        className="card-footer text-right mt-4"
                                        style={{
                                            display: "flex",
                                            justifyContent: "flex-end",
                                            gap: "10px",
                                        }}
                                    >
                                        <Button
                                            label="Back"
                                            onClick={this.handleBack}
                                            className="btn-secondary"
                                        />
                                        <Button
                                            label="Save Changes"
                                            type="submit"
                                            loading={this.state.ButtonLoading}
                                            disabled={this.state.ButtonLoading}
                                            className="btn-primary"
                                        />
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    fixNavbar: state.settings.isFixNavbar,
})

const mapDispatchToProps = dispatch => ({})
export default connect(mapStateToProps, mapDispatchToProps)(EditTicket);
