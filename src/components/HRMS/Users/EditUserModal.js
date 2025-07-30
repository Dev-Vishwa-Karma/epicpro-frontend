import React, { Component } from 'react';
import { validateFields } from '../../common/validations';

class EditUserModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedUser: {
                role: '',
            },
            errors: {},
            ButtonLoading: false
        };
    }

    componentDidUpdate(prevProps) {
        // Update selectedUser when it changes in props
        if (prevProps.selectedUser !== this.props.selectedUser) {
            this.setState({ selectedUser: this.props.selectedUser || { role: '' } });
        }
    }

    // Handle input change for editing fields
    handleInputChangeForEditUser = (e) => {
        const { name, value } = e.target;
        this.setState((prevState) => ({
            selectedUser: {
                ...prevState.selectedUser,
                [name]: value, // Dynamically update the field
            },
            errors: { ...prevState.errors, [name]: "" } // Clear error for this field
        }));
    };

    handleSelectChange = (event) => {
        const { name, value } = event.target;
        this.setState((prevState) => ({
            selectedUser: {
                ...prevState.selectedUser,
                [name]: value,
            },
            errors: { ...prevState.errors, [name]: "" } // Clear error for this field
        }));
    };

    // Update/Edit User profile (API Call)
    updateProfile = () => {
        const { selectedUser } = this.state;
        if (!selectedUser) return;

        this.setState({ ButtonLoading: true });

        // Apply Validation component
        const validationSchema = [
            { name: 'firstName', value: selectedUser.first_name, type: 'name', required: true, messageName: 'First Name'},
            { name: 'lastName', value: selectedUser.last_name, type: 'name', required: false, messageName: 'Last Name'},
        ];
        
        const errors = validateFields(validationSchema);
        if (Object.keys(errors).length > 0) {
            this.setState({ errors, ButtonLoading: false });
            return;
        } else {
            this.setState({ errors: {} });
        }

        const updateProfileData = new FormData();
        updateProfileData.append('first_name', selectedUser.first_name);
        updateProfileData.append('last_name', selectedUser.last_name);
        updateProfileData.append('email', selectedUser.email);
        updateProfileData.append('selected_role', selectedUser.role);
        updateProfileData.append('dob', selectedUser.dob);
        updateProfileData.append('department_id', selectedUser.department_id);
        updateProfileData.append('logged_in_employee_id', this.props.logged_in_employee_id);
        updateProfileData.append('logged_in_employee_role', this.props.logged_in_employee_role);

        // Call the parent's updateProfile method
        this.props.onUpdateProfile(updateProfileData, selectedUser.id, () => {
            // Reset form after successful update
            this.setState({
                selectedUser: { role: '' },
                errors: {},
                ButtonLoading: false
            });
        });
    };

    render() {
        const { selectedUser, errors, ButtonLoading } = this.state;
        const { departments } = this.props;

        return (
            <div className="modal fade" id="editUserModal" tabIndex={-1} role="dialog" aria-labelledby="editUserModalLabel">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="editUserModalLabel">Edit User</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">×</span>
                            </button>
                        </div>
                        <form>
                            <div className="modal-body">
                                {selectedUser ? (
                                    <div className="row clearfix">
                                        <div className="col-md-12">
                                            <div className="form-group">
                                                <label className="form-label">First Name</label>
                                                <input
                                                    type="text"
                                                    className={`form-control${errors.firstName ? ' is-invalid' : ''}`}
                                                    value={selectedUser?.first_name || ""}
                                                    onChange={this.handleInputChangeForEditUser}
                                                    name="first_name"
                                                />
                                                {errors.firstName && (
                                                    <div className="invalid-feedback d-block">{errors.firstName}</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-md-12">
                                            <div className="form-group">
                                                <label className="form-label">Last Name</label>
                                                <input
                                                    type="text"
                                                    className={`form-control${errors.lastName ? ' is-invalid' : ''}`}
                                                    value={selectedUser?.last_name || ""}
                                                    onChange={this.handleInputChangeForEditUser}
                                                    name="last_name"
                                                />
                                                {errors.lastName && (
                                                    <div className="invalid-feedback d-block">{errors.lastName}</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-md-12">
                                            <div className="form-group">
                                                <label className="form-label">Email Address</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={selectedUser?.email || ""} 
                                                    onChange={this.handleInputChangeForEditUser}
                                                    name="email"
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-12">
                                            <div className="form-group">
                                                <label className="form-label">Date of Birth</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    value={selectedUser?.dob || ""} 
                                                    onChange={this.handleInputChangeForEditUser}
                                                    name="dob"
                                                    max={new Date().toISOString().split("T")[0]}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label className="form-label">Role</label>
                                                <select
                                                    className="form-control show-tick"
                                                    value={selectedUser?.role || ""}
                                                    onChange={this.handleSelectChange}
                                                    name="role"
                                                >
                                                    <option value="">Select Role Type</option>
                                                    <option value="super_admin">Super Admin</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label className="form-label">Position</label>
                                                <select
                                                    className="form-control show-tick"
                                                    value={selectedUser?.department_id || ""}
                                                    onChange={this.handleSelectChange}
                                                    name="department_id"
                                                >
                                                    <option value="">Select Position</option>
                                                    {departments.map((dept) => (
                                                        <option key={dept.id} value={dept.id}>
                                                            {dept.department_name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p>Loading user data...</p>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                                <button 
                                    type="button" 
                                    onClick={this.updateProfile} 
                                    className="btn btn-primary" 
                                    disabled={ButtonLoading}
                                >
                                    {ButtonLoading && (
                                        <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                                    )}
                                    Update Profile
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }
}

export default EditUserModal;