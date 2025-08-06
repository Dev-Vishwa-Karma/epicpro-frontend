import React, { Component } from 'react';
import { connect } from 'react-redux';
import AlertMessages from '../../common/AlertMessages';
import { getService } from '../../../services/getService';
import DeleteModal from '../../common/DeleteModal';
import Pagination from '../../common/Pagination';
import { validateFields } from '../../common/validations';
import UserTable from './UserTable';
import AddUserForm from './AddUserForm';
import EditUserModal from './EditUserModal';

class Users extends Component {
	constructor(props) {
		super(props);
		this.state = {
			logged_in_employee_id: null,
			logged_in_employee_role: null,
			employeeCode: "",
			firstName: "",
			lastName: "",
			email: "",
			selectedRole: "",
			dob: "",
			gender: "",
			mobileNo: "",
			departments: [],  // Stores all departments
        	selectedDepartment: "",
			password: "",
			confirmPassword: "",
			users: [],
			selectedUser: {
				role: '',
			},
			deleteUser: null,
			error: null,
			searchUser: "",
			currentPage: 1,
            dataPerPage: 10,
			loading: true,
			errors: {},
			ButtonLoading: false
		};
	}

	componentDidMount() {
		if (window.user) {
			this.setState({
				logged_in_employee_id: window.user.id,
				logged_in_employee_role: window.user.role,
			});
		}

		this.getAdmins();

		// Fetch all users to generate the correct employee code
		getService.getCall('get_employees.php', {
			action: 'view'
		})
		.then(data => {
			if (data.status === 'success') {
				// Generate next employee Code from all users
				const nextEmployeeCode = this.generateNewUserCode(data.data);
				this.setState({ employeeCode: nextEmployeeCode });
			} else {
				this.setState({ error: data.message });
			}
		})
		.catch(err => {
			this.setState({ error: 'Failed to fetch all users' });
			console.error(err);
		});

		// Get department data from departments table
		getService.getCall('departments.php', {
			action: 'view'
		})
        .then(data => {
			this.setState({ departments: data.data });
        })
        .catch(error => console.error("Error fetching departments:", error));
	}

	getAdmins = () => {
		// Make the GET API call when the component is mounted
		getService.getCall('get_employees.php', {
			action: 'view',
			role:'admin'
		})
		.then(data => {
			if (data.status === 'success') {
			  	this.setState({
					users: data.data, // only admin and super_admin users
					allUsers: data.data,
					loading: false
				});
			} else {
			  	this.setState({ error: data.message, loading: false });
			}
		})
		.catch(err => {
			this.setState({ error: 'Failed to fetch data', loading: false });
			console.error(err);
		});
	}
	generateNewUserCode = (users) => {
		if (!users || users.length === 0) {
			return "EMP001"; // Default if no users exist
		}
	
		// Extract numeric part from employee IDs
		const userCodes = users
			.map(user => user.code)
			.filter(code => code.match(/^EMP\d+$/))
			.map(code => parseInt(code.replace(/\D/g, ""), 10));
	
		const maxCode = Math.max(...userCodes); // Find the highest number
		const nextCode = (maxCode + 1).toString().padStart(3, "0"); // Increment and format
		return `EMP${nextCode}`;
	};

	// Handle input changes
    handleInputChangeForAddUser = (event) => {
        const { name, value } = event.target;
        this.setState({ [name]: value });
    };

	handleSelectChange = (event) => {
		const { name, value } = event.target;
		// Update state for the selected user
        this.setState((prevState) => ({
            selectedUser: {
                ...prevState.selectedUser,
                [name]: value,
            },
			[name]: value,
        }));
    };

	// Add user data API call
    addUser = () => {
        this.setState({ ButtonLoading: true });
        const {logged_in_employee_id, logged_in_employee_role, employeeCode, firstName, lastName, email, selectedRole, dob, gender, mobileNo, selectedDepartment, password, confirmPassword} = this.state;

		// Apply Validation component
        const validationSchema = [
			{ name: 'firstName', value: firstName, type: 'name', required: true, messageName: 'First Name'},
			{ name: 'lastName', value: lastName, type: 'name', required: false, messageName: 'Last Name'},
			{ name: 'email', value: email, type: 'email', required: true, messageName: 'Email ID'},
			{ name: 'gender', value: gender, required: true, messageName: 'Gender' },
			{ name: 'selectedDepartment', value: selectedDepartment, required: true, messageName: 'Department' },
			{ name: 'dob', value: dob, type: 'date', required: true, messageName: 'Date of Birth'},
			{ name: 'mobileNo', value: mobileNo, required: false, messageName: 'Mobile Number', maxLength:20},
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
		addUserData.append('logged_in_employee_id', logged_in_employee_id);
		addUserData.append('logged_in_employee_role', logged_in_employee_role);

        // API call to add user
		getService.addCall('get_employees.php','add',addUserData )
        .then((data) => {
            if (data.status === "success") {
				// Ensure 'users' is an array before updating it
				const normalizedUser = {
                    ...data.data,
                    dob: data.data.dob || dob || ""
                };
                const updatedUsers = [normalizedUser, ...this.state.users];

				// Generate next employee code based on the updated list
				const nextEmployeeCode = this.generateNewUserCode(updatedUsers);

                this.setState((prevState) => ({
                    users: updatedUsers, // Assuming the backend returns the new department
                    employeeCode: nextEmployeeCode,
                    firstName: "",
                    lastName: "",
					email: "",
					mobileNo: "",
					selectedRole:"",
					gender: "",
					selectedDepartment: "",
					dob: "",
					password: "",
					confirmPassword: "",
					showSuccess: true,
                	successMessage: "User added successfully!",
					ButtonLoading: false
                }));

				setTimeout(() => this.setState({ showSuccess: false }), 3000);
            } else {
				this.setState({
					showError: true,
					errorMessage: "Failed to add user. Please try again.",
					ButtonLoading: false,
				});
				setTimeout(() => this.setState({ showError: false }), 3000);
            }
        })
        .catch((error) => {
			console.error("Error:", error);
			this.setState({
				showError: true,
				errorMessage: "An error occurred. Please try again later.",
				ButtonLoading: false,
			});
			setTimeout(() => this.setState({ showError: false }), 3000);
		});
    };

	// Handle edit button click
    handleEditClick = (user) => {
        this.setState({ selectedUser: user });
    };

	// Handle input change for editing fields
    handleInputChangeForEditUser = (e) => {
        const { name, value } = e.target;
        this.setState((prevState) => ({
            selectedUser: {
                ...prevState.selectedUser,
                [name]: value, // Dynamically update the field
            },
        }));
    };

	// Update/Edit User profile (API Call)
	updateProfile = () => {
        const {logged_in_employee_id, logged_in_employee_role, selectedUser } = this.state;
        if (!selectedUser) return;

        this.setState({ ButtonLoading: true });

        // Apply Validation component
        const validationSchema = [
            { name: 'firstName', value: selectedUser.first_name, type: 'name', required: true, messageName: 'First Name'},
			{ name: 'lastName', value: selectedUser.last_name, type: 'name', required: false, messageName: 'Last Name' },
			{ name: 'email', value: selectedUser.email, type: 'email', required: true, messageName: 'Email Address'},
            { name: 'dob', value: selectedUser.dob, type: 'date', required: false, messageName: 'Date of Birth'},
        ];
        const errors = validateFields(validationSchema);
        if (Object.keys(errors).length > 0) {
            this.setState({ errors, ButtonLoading: false });
            return;
        } else {
            this.setState({ errors: {} });
        }

		const updateProfileData = new FormData();
        // updateProfileData.append('employee_id', selectedUser.employeeId);
        updateProfileData.append('first_name', selectedUser.first_name);
        updateProfileData.append('last_name', selectedUser.last_name);
        updateProfileData.append('email', selectedUser.email);
        updateProfileData.append('selected_role', selectedUser.role);
		updateProfileData.append('dob', selectedUser.dob);
        updateProfileData.append('department_id', selectedUser.department_id);
        updateProfileData.append('logged_in_employee_id', logged_in_employee_id);
        updateProfileData.append('logged_in_employee_role', logged_in_employee_role);

        // Example API call
		getService.editCall('get_employees.php', 'edit', updateProfileData, null, selectedUser.id)
        .then((data) => {
            if (data.status === "success") {
				this.getAdmins();
                this.setState((prevState) => {
                    return {
						successMessage: "User updated successfully!",
						showSuccess: true,
                        ButtonLoading: false
                    };
                });

                document.querySelector("#editUserModal .close").click();

				setTimeout(() => this.setState({ showSuccess: false }), 3000);
            } else {
				this.setState({
					showError: true,
					errorMessage: "Failed to update user. Please try again.",
                    ButtonLoading: false
				});
				setTimeout(() => this.setState({ showError: false }), 3000);
            }
        })
		.catch((error) => {
			console.error("Error:", error);
			this.setState({
				showError: true,
				errorMessage: "An error occurred. Please try again later.",
                ButtonLoading: false
			});
		});
    };

	openDeleteModal = (userId) => {
        this.setState({
            deleteUser: userId,
        });
    };

	confirmDelete = () => {
        const { deleteUser, currentPage, users, dataPerPage, logged_in_employee_id, logged_in_employee_role} = this.state;
      
        if (!deleteUser) return;

		this.setState({ ButtonLoading: true });
		getService.deleteCall('get_employees.php', 'delete', null, deleteUser, logged_in_employee_id, logged_in_employee_role)
        .then((data) => {
			if (data.status === "success") {
				// Update users state after deletion
				const updatedUsers = users.filter((d) => d.id !== deleteUser);

				// Calculate the total pages after deletion
				const totalPages = Math.ceil(updatedUsers.length / dataPerPage);
	
				// Adjust currentPage if necessary (if we're on a page that no longer has data)
				let newPage = currentPage;
				if (updatedUsers.length === 0) {
					newPage = 1;
				} else if (currentPage > totalPages) {
					newPage = totalPages;
				}

				this.setState({
					users: updatedUsers,
					successMessage: "User deleted successfully",
					showSuccess: true,
					currentPage: newPage, // Update currentPage to the new page
					deleteUser: null,  // Clear the deleteUser state
                    ButtonLoading: false,
				});

				setTimeout(() => this.setState({ showSuccess: false }), 3000);
			} else {
				this.setState({
					showError: true,
					errorMessage: "Failed to delete user. Please try again.",
                    ButtonLoading: false,
				});
			}
        })
		.catch((error) => {
			console.error("Error:", error);
			this.setState({
				showError: true,
				errorMessage: `An error occurred: ${error.message || error}`,
                ButtonLoading: false,
			});
		});
    };

	onCloseDeleteModal = () => {
        this.setState({ deleteUser: null });
    }

	// Handle Pagination
    handlePageChange = (newPage) => {
        const totalPages = Math.ceil(this.state.users.length / this.state.dataPerPage);
        
        if (newPage >= 1 && newPage <= totalPages) {
            this.setState({ currentPage: newPage });
        }
    };

	handleSearch = (event) => {
		const query = event.target.value;
		this.setState({ searchUser: query });

		// Clear previous timeout
		if (this.searchTimeout) clearTimeout(this.searchTimeout);

		this.searchTimeout = setTimeout(() => {
			const { searchUser } = this.state;
			const searchParam = searchUser.trim();
			
			// If search is empty, fetch all admins (or whatever default you want)
			getService.getCall('get_employees.php', {
				action: 'view',
				role:'admin',
				search:searchParam
			})
				.then(data => {
					if (data.status === 'success') {
						this.setState({
							users: data.data,
							allUsers: data.data,
							currentPage: 1,
							loading: false,
							error: null 
						});
					} else {
						this.setState({ 
							users: [], 
							loading: false,
							error: null
						});
					}
				})
				.catch(err => {
					this.setState({ 
						users: [], 
						loading: false,
						error: 'Failed to perform search. Please try again.'
					});
					console.error('Search error:', err);
				});
			}, 500);
	};

	handleTabChange = () => {
		// Clear errors when switching tabs
		this.setState({ errors: {} });
	};

	render() {

		const { fixNavbar } = this.props;
		const { users, currentPage, dataPerPage, loading, showSuccess, successMessage, showError, errorMessage } = this.state;

		// Pagination Logic
        const indexOfLastUser = currentPage * dataPerPage;
        const indexOfFirstUser = indexOfLastUser - dataPerPage;
        const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
        const totalPages = Math.ceil(users.length / dataPerPage);
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
					<div className={`section-body ${fixNavbar ? "marginTop" : ""} `}>
						<div className="container-fluid">
							<div className="d-flex justify-content-between align-items-center">
								<ul className="nav nav-tabs page-header-tab">
									<li className="nav-item">
										<a
											className="nav-link active"
											id="user-tab"
											data-toggle="tab"
											href="#user-list"
											onClick={this.handleTabChange}
										>
											List
										</a>
									</li>
									<li className="nav-item">
										<a className="nav-link" id="user-tab" data-toggle="tab" href="#user-add" onClick={this.handleTabChange}>
											Add New
										</a>
									</li>
								</ul>
							</div>
						</div>
					</div>
					<div className="section-body mt-3">
						<div className="container-fluid">
							<div className="tab-content mt-3">
								<div className="tab-pane fade show active" id="user-list" role="tabpanel">
									<div className="card">
										<div className="card-header">
											<h3 className="card-title">User List</h3>
											<div className="card-options">
												<form autoComplete='off' >
													<div className="input-icon ml-2">
													<span className="input-icon-addon">
														<i className="fe fe-search" />
													</span>
													<input
														type="text"
														className="form-control"
														placeholder="Search user..."
														name="search"
														value={this.state.searchUser}
															onChange={this.handleSearch}
															autoCapitalize='new-email'
													/>
												</div>
												</form>
											</div>
										</div>
										<div className="card-body">
											<UserTable 
												loading={loading}
												currentUsers={currentUsers}
												handleEditClick={this.handleEditClick}
												openDeleteModal={this.openDeleteModal}
											/>
										</div>
									</div>

									{/* Only show pagination if there are users */}
									{totalPages > 1 && (
										<Pagination
											currentPage={currentPage}
											totalPages={totalPages}
											onPageChange={this.handlePageChange}
										/>
									)}
								</div>
								<div className="tab-pane fade" id="user-add" role="tabpanel">
									<div className="card">
										<div className="card-body">
										<AddUserForm
											state={this.state}
											handleInputChangeForAddUser={this.handleInputChangeForAddUser}
											handleSelectChange={this.handleSelectChange}
											addUser={this.addUser}
										/>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Edit User Modal */}
					<EditUserModal
						selectedUser={this.state.selectedUser}
						departments={this.state.departments}
						errors={this.state.errors}
						handleInputChangeForEditUser={this.handleInputChangeForEditUser}
						handleSelectChange={this.handleSelectChange}
						updateProfile={this.updateProfile}
						ButtonLoading={this.state.ButtonLoading}
					/>

					{/* Delete User Model */}
					<DeleteModal
                        show={!!this.state.deleteUser}
                        onConfirm={this.confirmDelete}
                        isLoading={this.state.ButtonLoading}
                        deleteBody='Are you sure you want to delete the user?'
                        modalId="deleteUserModal"
                        onClose={this.onCloseDeleteModal}
                    />
				</div>
			</>
		);
	}
}
const mapStateToProps = state => ({
	fixNavbar: state.settings.isFixNavbar
})

const mapDispatchToProps = dispatch => ({})
export default connect(mapStateToProps, mapDispatchToProps)(Users);