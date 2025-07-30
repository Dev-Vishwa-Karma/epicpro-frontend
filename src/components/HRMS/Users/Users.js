import React, { Component } from 'react';
import { connect } from 'react-redux';
import AlertMessages from '../../common/AlertMessages';
import { getService } from '../../../services/getService';
import UserTable from './UserTable';
import AddUserModal from './AddUserModal';
import EditUserModal from './EditUserModal';
import DeleteModal from '../../common/DeleteModal';
import { validateFields } from '../../common/validations';

class Users extends Component {
	constructor(props) {
		super(props);
		this.state = {
			logged_in_employee_id: null,
			logged_in_employee_role: null,
			employeeCode: "",
			departments: [],  // Stores all departments
			users: [],
			selectedUser: {
				role: '',
			},
			deleteUser: null,
			error: null,
			searchUser: "",
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
    addUser = (addUserData, callback) => {
        // API call to add user
		getService.addCall('get_employees.php','add',addUserData )
        .then((data) => {
            if (data.status === "success") {
				// Ensure 'users' is an array before updating it
				const normalizedUser = {
                    ...data.data,
                    dob: data.data.dob || ""
                };
                const updatedUsers = [normalizedUser, ...this.state.users];

				// Generate next employee code based on the updated list
				const nextEmployeeCode = this.generateNewUserCode(updatedUsers);

                this.setState((prevState) => ({
                    users: updatedUsers,
                    employeeCode: nextEmployeeCode,
					showSuccess: true,
                	successMessage: "User added successfully!",
					ButtonLoading: false
                }));

				setTimeout(() => this.setState({ showSuccess: false }), 3000);
                
                // Call the callback to reset the form
                if (callback) callback();
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

	// Update/Edit User profile (API Call)
	updateProfile = (updateProfileData, userId, callback) => {
        // Example API call
		getService.editCall('get_employees.php', 'edit', updateProfileData, null, userId)
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
                
                // Call the callback to reset the form
                if (callback) callback();
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
		const { users, selectedUser, loading, showSuccess, successMessage, showError, errorMessage } = this.state;

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
										<UserTable
											users={users}
											loading={loading}
											onEditUser={this.handleEditClick}
											onDeleteUser={this.openDeleteModal}
											searchUser={this.state.searchUser}
											onSearch={this.handleSearch}
													/>
												</div>
											</div>
								<AddUserModal
									employeeCode={this.state.employeeCode}
									departments={this.state.departments}
									logged_in_employee_id={this.state.logged_in_employee_id}
									logged_in_employee_role={this.state.logged_in_employee_role}
									onAddUser={this.addUser}
									ButtonLoading={this.state.ButtonLoading}
								/>
							</div>
						</div>
					</div>

					{/* Edit User Modal */}
					<EditUserModal
						selectedUser={this.state.selectedUser}
						departments={this.state.departments}
						logged_in_employee_id={this.state.logged_in_employee_id}
						logged_in_employee_role={this.state.logged_in_employee_role}
						onUpdateProfile={this.updateProfile}
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