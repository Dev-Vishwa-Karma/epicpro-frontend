import React, { Component } from 'react';
import { validateFields } from '../../common/validations';

class AddUserModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            employeeCode: "",
            firstName: "",
            lastName: "",
            email: "",
            selectedRole: "",
            dob: "",
            gender: "",
            mobileNo: "",
            selectedDepartment: "",
            password: "",
            confirmPassword: "",
            errors: {},
            ButtonLoading: false
        };
    }

    componentDidMount() {
        // Initialize with the generated employee code from props
        if (this.props.employeeCode) {
            this.setState({ employeeCode: this.props.employeeCode });
        }
    }

    componentDidUpdate(prevProps) {
        // Update employee code when it changes in props
        if (prevProps.employeeCode !== this.props.employeeCode) {
            this.setState({ employeeCode: this.props.employeeCode });
        }
    }

    // Handle input changes for add user
    handleInputChangeForAddUser = (event) => {
        const { name, value } = event.target;
        this.setState({ 
            [name]: value,
            errors: { ...this.state.errors, [name]: "" } // Clear error for this field
        });
    };

    handleSelectChange = (event) => {
        const { name, value } = event.target;
        this.setState({ 
            [name]: value,
            errors: { ...this.state.errors, [name]: "" } // Clear error for this field
        });
    };

    // Add user data API call
    addUser = () => {
        this.setState({ ButtonLoading: true });
        const {
            employeeCode, 
            firstName, 
            lastName, 
            email, 
            selectedRole, 
            dob, 
            gender, 
            mobileNo, 
            selectedDepartment, 
            password, 
            confirmPassword
        } = this.state;

        // Apply Validation component
        const validationSchema = [
            { name: 'firstName', value: firstName, type: 'name', required: true, messageName: 'First Name'},
            { name: 'lastName', value: lastName, type: 'name', required: false, messageName: 'Last Name can only contain letters and spaces.'},
            { name: 'email', value: email, type: 'email', required: true, messageName: 'Email ID'},
            { name: 'gender', value: gender, required: true, messageName: 'Gender'},
            { name: 'dob', value: dob, type: 'date', required: true, messageName: 'DOB'},
            { name: 'password', value: password, required: true, messageName: 'Password'},
            { name: 'confirmPassword', value: confirmPassword, required: true, messageName: 'Confirm Password',
                customValidator: (val) => (password && val && password !== val ? 'Passwords do not match.' : undefined)
            }
        ];
        
        const errors = validateFields(validationSchema);
        if (Object.keys(errors).length > 0) {
            this.setState({ errors, ButtonLoading: false });
            return;
        } else {
            this.setState({ errors: {} });
        }

        const addUserData = new FormData();
        addUserData.append('department_id', selectedDepartment);
        addUserData.append('code', employeeCode);
        addUserData.append('first_name', firstName);
        addUserData.append('last_name', lastName);
        addUserData.append('email', email);
        addUserData.append('selected_role', selectedRole);
        addUserData.append('dob', dob);
        addUserData.append('gender', gender);
        addUserData.append('mobile_no1', mobileNo);
        addUserData.append('password', confirmPassword);
        addUserData.append('logged_in_employee_id', this.props.logged_in_employee_id);
        addUserData.append('logged_in_employee_role', this.props.logged_in_employee_role);

        // Call the parent's addUser method
        this.props.onAddUser(addUserData, () => {
            // Reset form after successful addition
            this.setState({
                firstName: "",
                lastName: "",
                email: "",
                mobileNo: "",
                selectedRole: "",
                gender: "",
                selectedDepartment: "",
                dob: "",
                password: "",
                confirmPassword: "",
                errors: {},
                ButtonLoading: false
            });
        });
    };

    render() {
        const {
            departments,
            ButtonLoading
        } = this.props;

        const {
            employeeCode,
            firstName,
            lastName,
            email,
            selectedRole,
            dob,
            gender,
            mobileNo,
            selectedDepartment,
            password,
            confirmPassword,
            errors
        } = this.state;

        return (
            <div className="tab-pane fade" id="user-add" role="tabpanel">
                <div className="card">
                    <div className="card-body">
                        <div className="row clearfix">
                            <div className="col-lg-12 col-md-12 col-sm-12">
                                <div className="form-group">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Employee Code *"
                                        name="employeeCode"
                                        value={employeeCode}
                                        onChange={this.handleInputChangeForAddUser}
                                        readOnly
                                    />
                                </div>
                            </div>
                            <div className="col-lg-6 col-md-6 col-sm-12">
                                <div className="form-group">
                                    <input
                                        type="text"
                                        className={`form-control${errors.firstName ? ' is-invalid' : ''}`}
                                        placeholder="First Name *"
                                        name='firstName'
                                        value={firstName}
                                        onChange={this.handleInputChangeForAddUser}
                                    />
                                    {errors.firstName && (
                                        <div className="invalid-feedback d-block">{errors.firstName}</div>
                                    )}
                                </div>
                            </div>
                            <div className="col-lg-6 col-md-6 col-sm-12">
                                <div className="form-group">
                                    <input
                                        type="text"
                                        className={`form-control${errors.lastName ? ' is-invalid' : ''}`}
                                        placeholder="Last Name"
                                        name='lastName'
                                        value={lastName}
                                        onChange={this.handleInputChangeForAddUser}
                                    />
                                    {errors.lastName && (
                                        <div className="invalid-feedback d-block">{errors.lastName}</div>
                                    )}
                                </div>
                            </div>
                            <div className="col-md-4 col-sm-12">
                                <div className="form-group">
                                    <input
                                        type="text"
                                        className={`form-control${errors.email ? ' is-invalid' : ''}`}
                                        placeholder="Email ID *"
                                        name='email'
                                        value={email}
                                        onChange={this.handleInputChangeForAddUser}
                                    />
                                    {errors.email && (
                                        <div className="invalid-feedback d-block">{errors.email}</div>
                                    )}
                                </div>
                            </div>
                            <div className="col-md-4 col-sm-12">
                                <div className="form-group">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Mobile No"
                                        name='mobileNo'
                                        value={mobileNo}
                                        onChange={this.handleInputChangeForAddUser}
                                    />
                                </div>
                            </div>
                            <div className="col-md-4 col-sm-12">
                                <div className="form-group">
                                    <select
                                        className="form-control show-tick"
                                        value={selectedRole}
                                        onChange={this.handleSelectChange}
                                        name="selectedRole"
                                    >
                                        <option value="">Select Role Type</option>
                                        <option value="super_admin">Super Admin</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            </div>
                            <div className="col-sm-6 col-md-4">
                                <div className="form-group">
                                    <select 
                                        name="gender"
                                        className={`form-control${errors.gender ? ' is-invalid' : ''}`}
                                        id='gender'
                                        value={gender}
                                        onChange={this.handleSelectChange}
                                        required
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                    {errors.gender && (
                                        <div className="invalid-feedback d-block">{errors.gender}</div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Department Dropdown */}
                            <div className="col-md-4 col-sm-12">
                                <div className="form-group">
                                    <select
                                        className="form-control show-tick"
                                        value={selectedDepartment}
                                        onChange={this.handleSelectChange}
                                        name="selectedDepartment"
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map((dept) => (
                                            <option key={dept.id} value={dept.id}>
                                                {dept.department_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-sm-6 col-md-4">
                                <div className="form-group">
                                    <input
                                        type="date"
                                        id="dob"
                                        name="dob"
                                        title='dob'
                                        className={`form-control${errors.dob ? ' is-invalid' : ''}`}
                                        value={dob}
                                        onChange={this.handleInputChangeForAddUser}
                                    />
                                    {errors.dob && (
                                        <div className="invalid-feedback d-block">{errors.dob}</div>
                                    )}
                                </div>
                            </div>
                            <div className="col-md-4 col-sm-12">
                                <div className="form-group">
                                    <input
                                        type="password"
                                        className={`form-control${errors.password ? ' is-invalid' : ''}`}
                                        placeholder="Password"
                                        name='password'
                                        value={password}
                                        onChange={this.handleInputChangeForAddUser}
                                    />
                                    {errors.password && (
                                        <div className="invalid-feedback d-block">{errors.password}</div>
                                    )}
                                </div>
                            </div>
                            <div className="col-md-4 col-sm-12">
                                <div className="form-group">
                                    <input
                                        type="password"
                                        className={`form-control${errors.confirmPassword ? ' is-invalid' : ''}`}
                                        placeholder="Confirm Password"
                                        name='confirmPassword'
                                        value={confirmPassword}
                                        onChange={this.handleInputChangeForAddUser}
                                    />
                                    {errors.confirmPassword && (
                                        <div className="invalid-feedback d-block">{errors.confirmPassword}</div>
                                    )}
                                </div>
                            </div>
                            <div className="col-12">
                                <hr className="mt-4" />
                                <h6>Module Permission</h6>
                                <div className="table-responsive">
                                    <table className="table table-striped">
                                        <thead>
                                            <tr>
                                                <th />
                                                <th>Read</th>
                                                <th>Write</th>
                                                <th>Delete</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>Super Admin</td>
                                                <td>
                                                    <label className="custom-control custom-checkbox">
                                                        <input
                                                            type="checkbox"
                                                            className="custom-control-input"
                                                            name="example-checkbox1"
                                                            defaultValue="option1"
                                                            defaultChecked
                                                        />
                                                        <span className="custom-control-label">
                                                            &nbsp;
                                                        </span>
                                                    </label>
                                                </td>
                                                <td>
                                                    <label className="custom-control custom-checkbox">
                                                        <input
                                                            type="checkbox"
                                                            className="custom-control-input"
                                                            name="example-checkbox1"
                                                            defaultValue="option1"
                                                            defaultChecked
                                                        />
                                                        <span className="custom-control-label">
                                                            &nbsp;
                                                        </span>
                                                    </label>
                                                </td>
                                                <td>
                                                    <label className="custom-control custom-checkbox">
                                                        <input
                                                            type="checkbox"
                                                            className="custom-control-input"
                                                            name="example-checkbox1"
                                                            defaultValue="option1"
                                                            defaultChecked
                                                        />
                                                        <span className="custom-control-label">
                                                            &nbsp;
                                                        </span>
                                                    </label>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>Admin</td>
                                                <td>
                                                    <label className="custom-control custom-checkbox">
                                                        <input
                                                            type="checkbox"
                                                            className="custom-control-input"
                                                            name="example-checkbox1"
                                                            defaultValue="option1"
                                                            defaultChecked
                                                        />
                                                        <span className="custom-control-label">
                                                            &nbsp;
                                                        </span>
                                                    </label>
                                                </td>
                                                <td>
                                                    <label className="custom-control custom-checkbox">
                                                        <input
                                                            type="checkbox"
                                                            className="custom-control-input"
                                                            name="example-checkbox1"
                                                            defaultValue="option1"
                                                        />
                                                        <span className="custom-control-label">
                                                            &nbsp;
                                                        </span>
                                                    </label>
                                                </td>
                                                <td>
                                                    <label className="custom-control custom-checkbox">
                                                        <input
                                                            type="checkbox"
                                                            className="custom-control-input"
                                                            name="example-checkbox1"
                                                            defaultValue="option1"
                                                        />
                                                        <span className="custom-control-label">
                                                            &nbsp;
                                                        </span>
                                                    </label>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-primary mr-2"
                                    onClick={this.addUser}
                                    disabled={ButtonLoading}
                                >
                                    {ButtonLoading ? (
                                        <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                                    ) : null}
                                    Add
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    data-dismiss="modal"
                                >
                                    CLOSE
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default AddUserModal;