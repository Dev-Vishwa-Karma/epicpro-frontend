import React, { Component } from "react";
import { connect } from "react-redux";
import AlertMessages from "../../common/AlertMessages";
import { getService } from "../../../services/getService";
import { validateFields } from "../../common/validations";
import InputField from "../../common/formInputs/InputField";
import CheckboxGroup from '../../common/formInputs/CheckboxGroup'
import { appendDataToFormData } from "../../../utils";
import Button from "../../common/formInputs/Button";
import TextEditor from "../../common/TextEditor";
import EmployeeSelector from "../../common/EmployeeSelector";

class AddTicket extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedTicket: "",
            employeeData: [],
            successMessage: "",
            showSuccess: false,
            errorMessage: "",
            showError: false,
            title: "",
            description: "",
            priority: "",
            due_date: "",
            completed_at: "",
            selectedEmployee: "",
            ButtonLoading: false,
            errors: {},
        }

        this.fieldRefs = {
            title: React.createRef(),
            description: React.createRef(),
            priority: React.createRef(),
            due_date: React.createRef(),
        };
    }

    componentDidMount() {
        const { location } = this.props;
        if (location && location.state && location.state.ticket) {
            const ticket = location.state.ticket;
            this.setState({
                ...ticket
            });
        }
        getService.getCall('get_employees.php', {
            action: 'view'
        })
            .then((employeesData) => {
                const employeesArray = employeesData?.data || [];
                this.setState({ employeeData: employeesArray });
            })
            .catch((error) => console.error("Error fetching employees:", error));
    }

    handleEmployeeChange = (event) => {
        this.setState({ selectedEmployee: event.target.value });
    };

    handleChange = (e) => {
        const { name, value } = e.target;
        this.setState({
            [name]: value,
        });
    };

    handleBack = () => {
        this.props.history.goBack();
    };

    addTicket = async (e) => {
        e.preventDefault();
        this.setState({ ButtonLoading: true });
        const { id, role } = window.user;

        const {
            title,
            description,
            selectedEmployee,
            priority,
            due_date
        } = this.state;

        const validationSchema = [
            { name: 'title', value: title, required: true, messageName: 'Title' },
            { name: 'description', value: description, required: true, messageName: 'Description' },
            { name: 'selectedEmployee', value: selectedEmployee, required: true, messageName: 'Employee' },
            { name: 'priority', value: priority, required: true, messageName: 'Priority' },
            { name: 'due_date', value: due_date, type: 'date', required: false, messageName: 'Due Date' },
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

        const addTicketData = new FormData();
        const data = {
            title: title,
            description: description,
            priority: priority,
            due_date: due_date,
            assigned_by: id,
            assigned_to: selectedEmployee,
        }

        appendDataToFormData(addTicketData, data)

        getService.addCall('tickets.php', 'add', addTicketData)
            .then((data) => {
                if (data.status === 'success') {
                    this.setState((prevState) => ({
                        successMessage: data.message || "Ticket added successfully",
                        showSuccess: true,
                        ButtonLoading: false,
                        title: "",
                        description: "",
                        priority: "",
                        due_date: "",
                        selectedEmployee: "",
                    }));
                    this.props.history.push('/ticket');
                } else {
                    this.setState({
                        errorMessage: data.message || "Failed to add ticket.",
                        showError: true,
                        showSuccess: false,
                        ButtonLoading: false,
                    });
                }
            }).catch(() => {
                this.setState({
                    errorMessage: "An error occurred while adding the ticket.",
                    showError: true,
                    showSuccess: false,
                    ButtonLoading: false,
                });
            }
        );
    }

    render() {
        const { fixNavbar } = this.props;
        const {
            title,
            description,
            priority,
            due_date,
            selectedEmployee,
            employeeData,
            showSuccess,
            successMessage,
            showError,
            errorMessage,
            errors: { },
        } = this.state;

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
                <div>
                    <div className={`section-body ${fixNavbar ? "marginTop" : ""}`}>
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-12 col-lg-12">
                                    <form className="card" noValidate onSubmit={this.addTicket}>
                                        <div className="card-body">
                                            <h3 className="card-title">Add Ticket</h3>
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
                                                </div>
                                                <div className="col-sm-6 col-md-6">
                                                    <label className="form-label">Description</label>
                                                    <TextEditor
                                                        label="Description"
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
                                                label="Add Ticket"
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
                    </div >
                </div >
            </>
        )
    }
}
const mapStateToProps = state => ({
    fixNavbar: state.settings.isFixNavbar,
})

const mapDispatchToProps = dispatch => ({})
export default connect(mapStateToProps, mapDispatchToProps)(AddTicket);