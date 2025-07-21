import React, { Component } from 'react';
import { connect } from 'react-redux';
import AlertMessages from '../../common/AlertMessages';
import { getService } from '../../../services/getService';

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
        let errors = {};
        // Validation for required fields
        const namePattern = /^[A-Za-z\s]+$/;
        if (!firstName || firstName.trim() === "") {
            errors.firstName = "First Name is required.";
        } else if (!namePattern.test(firstName)) {
            errors.firstName = "First Name can only contain letters and spaces.";
        }
        if (!email || email.trim() === "") {
            errors.email = "Email ID is required.";
        }
        if (!gender || gender.trim() === "") {
            errors.gender = "Gender is required.";
        }
        if (!dob || dob.trim() === "") {
            errors.dob = "DOB is required.";
        }
        if (!password || password.trim() === "") {
            errors.password = "Password is required.";
        }
        if (!confirmPassword || confirmPassword.trim() === "") {
            errors.confirmPassword = "Confirm Password is required.";
        }
        if (password && confirmPassword && password !== confirmPassword) {
            errors.confirmPassword = "Passwords do not match.";
        }
        if (lastName && lastName.trim() !== "" && !namePattern.test(lastName)) {
            errors.lastName = "Last Name can only contain letters and spaces.";
        }
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

        let errors = {};
        const namePattern = /^[A-Za-z\s]+$/;
        if (!selectedUser.first_name || selectedUser.first_name.trim() === "") {
            errors.firstName = "First Name is required.";
        } else if (!namePattern.test(selectedUser.first_name)) {
            errors.firstName = "First Name can only contain letters and spaces.";
        }
        if (selectedUser.last_name && selectedUser.last_name.trim() !== "" && !namePattern.test(selectedUser.last_name)) {
            errors.lastName = "Last Name can only contain letters and spaces.";
        }
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
		
		console.log('deleteUser',deleteUser)
		// 		fetch(`${process.env.REACT_APP_API_URL}/get_employees.php?action=delete`, {
        //   	method: 'DELETE',
		// 	headers: {
		// 		"Content-Type": "application/json",
		// 	},
		// 	body: JSON.stringify({
		// 		user_id: deleteUser,
		// 		logged_in_employee_id: logged_in_employee_id,
		// 		logged_in_employee_role: logged_in_employee_role,
		// 	}),
        // })
        // .then((response) => response.json())
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
				document.querySelector("#deleteUserModal .close").click();

				setTimeout(() => this.setState({ showSuccess: false }), 3000);
			} else {
				this.setState({
					showError: true,
					errorMessage: "Failed to delete user. Please try again.",
                    ButtonLoading: false,
				});
				// setTimeout(() => this.setState({ showError: false }), 3000);
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

	render() {

		const { fixNavbar } = this.props;
		const { users, error, selectedUser, currentPage, dataPerPage, loading, showSuccess, successMessage, showError, errorMessage } = this.state;

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
										>
											List
										</a>
									</li>
									<li className="nav-item">
										<a className="nav-link" id="user-tab" data-toggle="tab" href="#user-add">
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
													/>
												</div>
											</div>
										</div>
										<div className="card-body">
											<div className="table-responsive">
											{loading ? (
												<div className="card-body">
													<div className="dimmer active">
														<div className="loader" />
													</div>
												</div>
											) : ( // Show Table after loading is false
												<table className="table table-striped table-hover table-vcenter text-nowrap mb-0">
													<thead>
														<tr>
															<th className="w60">Name</th>
															<th />
															<th>Role</th>
															<th>Created Date</th>
															<th>Position</th>
															<th className="w100">Action</th>
														</tr>
													</thead>
													<tbody>
														{currentUsers.length > 0 ? (
															currentUsers.map((user, index) => (
																<tr key={index}>
																	<td className="width45">
																		{/* <span
																			className="avatar avatar-blue"
																			data-toggle="tooltip"
																			data-placement="top"
																			data-original-title="Avatar Name"
																		>
																			{user.first_name.charAt(0).toUpperCase()}{user.last_name.charAt(0).toUpperCase()}
																		</span> */}
																		{user.profile ? (
                                                                            <img 
                                                                                src={`${process.env.REACT_APP_API_URL}/${user.profile}`} 
                                                                                className="avatar avatar-blue add-space" 
                                                                                alt={`${user.first_name} ${user.last_name}`}
                                                                                data-toggle="tooltip" 
                                                                                data-placement="top" 
                                                                                title={`${user.first_name} ${user.last_name}`}
                                                                                style={{
                                                                                    width: '40px', 
                                                                                    height: '40px', 
                                                                                    borderRadius: '50%', 
                                                                                    objectFit: 'cover'
                                                                                }}
                                                                                onError={(e) => {
                                                                                e.target.style.display = 'none';
                                                                                const initialsSpan = document.createElement('span');
                                                                                initialsSpan.className = 'avatar avatar-blue add-space';
                                                                                initialsSpan.setAttribute('data-toggle', 'tooltip');
                                                                                initialsSpan.setAttribute('data-placement', 'top');
                                                                                initialsSpan.setAttribute('title', `${user.first_name} ${user.last_name}`);
                                                                                initialsSpan.style.display = 'inline-flex';
                                                                                initialsSpan.style.alignItems = 'center';
                                                                                initialsSpan.style.justifyContent = 'center';
                                                                                initialsSpan.style.width = '40px';
                                                                                initialsSpan.style.height = '40px';
                                                                                initialsSpan.textContent = `${user.first_name.charAt(0).toUpperCase()}${user.last_name.charAt(0).toUpperCase()}`;
                                                                                e.target.parentNode.appendChild(initialsSpan);
                                                                                }}
                                                                            />
                                                                        ) : (
                                                                            <span
                                                                                className="avatar avatar-blue add-space"
                                                                                data-toggle="tooltip"
                                                                                data-placement="top"
                                                                                title={`${user.first_name} ${user.last_name}`}
                                                                                style={{
                                                                                    width: '40px',
                                                                                    height: '40px',
                                                                                    display: 'inline-flex',
                                                                                    alignItems: 'center',
                                                                                    justifyContent: 'center'
                                                                                }}
                                                                            >
                                                                                {user.first_name.charAt(0).toUpperCase()}{user.last_name.charAt(0).toUpperCase()}
                                                                            </span>
                                                                        )}
																	</td>
																	<td>
																		<h6 className="mb-0">{`${user.first_name} ${user.last_name}`}</h6>
																		<span>{user.email}</span>
																	</td>
																	<td>
																		<span className={
																			`tag ${
																				user.role === 'super_admin'
																				  ? 'tag-danger'
																				  : user.role === 'admin'
																				  ? 'tag-info' : user.role === null ? 'tag-default'
																				  : 'tag-default'
																			  }`}
																		>{/* {user.role.split('_')
																			.map(word=>word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')} */}
																			{user.role 
																			? user.role.split('_')
																				.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
																				.join(' ')
																			: 'No Role'}
																		</span>
																	</td>
																	<td>
																	{new Intl.DateTimeFormat('en-US', {
																			day: '2-digit',
																			month: 'short',
																			year: 'numeric',
																		}).format(new Date(user.created_at))}
																	</td>
																	<td>{user.department_name}</td>
																	<td>
																		<button 
																			type="button"
																			className="btn btn-icon"
																			title="Edit"
																			data-toggle="modal"
																			data-target="#editUserModal"
																			onClick={() => this.handleEditClick(user)}
																		>
																			<i className="fa fa-edit" />
																		</button>
																		<button 
																			type="button"
																			className="btn btn-icon js-sweetalert"
																			title="Delete"
																			data-type="confirm"
																			onClick={() => this.openDeleteModal(user.id)}
																			data-toggle="modal"
																			data-target="#deleteUserModal"
																		>
																			<i className="fa fa-trash-o text-danger" />
																		</button>
																	</td>
																</tr>
															))
														): (
															!error && (
																<tr>
																	<td colSpan="6" style={{ textAlign: 'center', color: '#888', fontSize: '1.1rem', padding: '32px 0' }}>
                                                                        User not found
                                                                    </td>
                                                                </tr>
                                                            )
                                                        )}
                                                    </tbody>
												</table>
												)}
											</div>
										</div>
									</div>

									{/* Only show pagination if there are users */}
									{totalPages > 1 && (
										<nav aria-label="Page navigation">
											<ul className="pagination mb-0 justify-content-end">
												<li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
													<button className="page-link" onClick={() => this.handlePageChange(currentPage - 1)}>
														Previous
													</button>
												</li>
												{[...Array(totalPages)].map((_, i) => (
													<li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
														<button className="page-link" onClick={() => this.handlePageChange(i + 1)}>
															{i + 1}
														</button>
													</li>
												))}
												<li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
													<button className="page-link" onClick={() => this.handlePageChange(currentPage + 1)}>
														Next
													</button>
												</li>
											</ul>
										</nav>
									)}
								</div>
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
                                                    		value={this.state.employeeCode}
                                                    		onChange={this.handleInputChangeForAddUser}
														/>
													</div>
												</div>
												<div className="col-lg-6 col-md-6 col-sm-12">
													<div className="form-group">
														<input
															type="text"
															className={`form-control${this.state.errors.firstName ? ' is-invalid' : ''}`}
															placeholder="First Name *"
															name='firstName'
															value={this.state.firstName}
															onChange={this.handleInputChangeForAddUser}
														/>
														{this.state.errors.firstName && (
															<div className="invalid-feedback d-block">{this.state.errors.firstName}</div>
														)}
													</div>
												</div>
												<div className="col-lg-6 col-md-6 col-sm-12">
													<div className="form-group">
														<input
															type="text"
															className={`form-control${this.state.errors.lastName ? ' is-invalid' : ''}`}
															placeholder="Last Name"
															name='lastName'
															value={this.state.lastName}
															onChange={this.handleInputChangeForAddUser}
														/>
														{this.state.errors.lastName && (
															<div className="invalid-feedback d-block">{this.state.errors.lastName}</div>
														)}
													</div>
												</div>
												<div className="col-md-4 col-sm-12">
													<div className="form-group">
														<input
															type="text"
															className={`form-control${this.state.errors.email ? ' is-invalid' : ''}`}
															placeholder="Email ID *"
															name='email'
															value={this.state.email}
															onChange={this.handleInputChangeForAddUser}
														/>
														{this.state.errors.email && (
															<div className="invalid-feedback d-block">{this.state.errors.email}</div>
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
															value={this.state.mobileNo}
															onChange={this.handleInputChangeForAddUser}
														/>
													</div>
												</div>
												<div className="col-md-4 col-sm-12">
													<div className="form-group">
														<select
															className="form-control show-tick"
															value={this.state.selectedRole}  // Bind value to state
															onChange={this.handleSelectChange}  // Update state on change
															name="selectedRole"
														>
															<option>Select Role Type</option>
															<option value="super_admin">Super Admin</option>
															<option value="admin">Admin</option>
														</select>
													</div>
												</div>
												<div className="col-sm-6 col-md-4">
                                                    <div className="form-group">
                                                        <select 
                                                            name="gender"
                                                            className={`form-control${this.state.errors.gender ? ' is-invalid' : ''}`}
                                                            id='gender'
                                                            value={this.state.gender}
                                                            onChange={this.handleSelectChange}
                                                            required
                                                        >
                                                            <option value="">Select Gender</option>
                                                            <option value="male" >Male</option>
                                                            <option value="female" >Female</option>
                                                        </select>
                                                        {this.state.errors.gender && (
                                                            <div className="invalid-feedback d-block">{this.state.errors.gender}</div>
                                                        )}
                                                    </div>
                                                </div>
												
												
												{/* Department Dropdown */}
												<div className="col-md-4 col-sm-12">
													<div className="form-group">
														<select
															className="form-control show-tick"
															value={this.state.selectedDepartment}
															onChange={this.handleSelectChange}
															name="selectedDepartment"
														>
															<option value="">Select Department</option>
															{this.state.departments.map((dept) => (
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
                                                            className={`form-control${this.state.errors.dob ? ' is-invalid' : ''}`}
                                                            value={this.state.dob}
                                                            onChange={this.handleInputChangeForAddUser}
                                                        />
                                                        {this.state.errors.dob && (
                                                            <div className="invalid-feedback d-block">{this.state.errors.dob}</div>
                                                        )}
                                                    </div>
                                                </div>
												<div className="col-md-4 col-sm-12">
													<div className="form-group">
														<input
															type="password"
															className={`form-control${this.state.errors.password ? ' is-invalid' : ''}`}
															placeholder="Password"
															name='password'
															value={this.state.password}
															onChange={this.handleInputChangeForAddUser}
														/>
														{this.state.errors.password && (
															<div className="invalid-feedback d-block">{this.state.errors.password}</div>
														)}
													</div>
												</div>
												<div className="col-md-4 col-sm-12">
													<div className="form-group">
														<input
															type="password"
															className={`form-control${this.state.errors.confirmPassword ? ' is-invalid' : ''}`}
															placeholder="Confirm Password"
															name='confirmPassword'
															value={this.state.confirmPassword}
															onChange={this.handleInputChangeForAddUser}
														/>
														{this.state.errors.confirmPassword && (
															<div className="invalid-feedback d-block">{this.state.errors.confirmPassword}</div>
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
																{/* <tr>
																	<td>Employee</td>
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
																</tr> */}
																{/* <tr>
																	<td>HR Admin</td>
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
																</tr> */}
															</tbody>
														</table>
													</div>
													<button
														type="button"
														className="btn btn-primary mr-2"
														onClick={this.addUser}
														disabled={this.state.ButtonLoading}
													>
														{this.state.ButtonLoading ? (
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
							</div>
						</div>
					</div>

					{/* Edit User Modal */}
					<div className="modal fade" id="editUserModal" tabIndex={-1} role="dialog" aria-labelledby="editUserModalLabel">
						<div className="modal-dialog" role="document">
							<div className="modal-content">
								<div className="modal-header">
									<h5 className="modal-title" id="editUserModalLabel">Edit User</h5>
									<button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>
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
															className={`form-control${this.state.errors.firstName ? ' is-invalid' : ''}`}
															value={selectedUser?.first_name || ""}
															onChange={this.handleInputChangeForEditUser}
															name="first_name"
														/>
														{this.state.errors.firstName && (
															<div className="invalid-feedback d-block">{this.state.errors.firstName}</div>
														)}
													</div>
												</div>
												<div className="col-md-12">
													<div className="form-group">
														<label className="form-label">Last Name</label>
														<input
															type="text"
															className={`form-control${this.state.errors.lastName ? ' is-invalid' : ''}`}
															value={selectedUser?.last_name || ""}
															onChange={this.handleInputChangeForEditUser}
															name="last_name"
														/>
														{this.state.errors.lastName && (
															<div className="invalid-feedback d-block">{this.state.errors.lastName}</div>
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
															value={selectedUser?.role || ""}  // Bind value to state
															onChange={this.handleSelectChange}  // Update state on 
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
															value={selectedUser?.department_id || ""}  // Bind value to state
															onChange={this.handleSelectChange}  // Update state on 
															name="department_id"
														>
															<option value="">Select Position</option>
															{this.state.departments.map((dept) => (
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
										<button type="button" onClick={this.updateProfile} className="btn btn-primary" disabled={this.state.ButtonLoading}>
											{this.state.ButtonLoading && (
												<span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
											)}
											Update Profile
										</button>
									</div>
								</form>
							</div>
						</div>
					</div>

					{/* Delete User Model */}
					<div className="modal fade" id="deleteUserModal" tabIndex={-1} role="dialog" aria-labelledby="deleteUserModalLabel">
						<div className="modal-dialog" role="document">
							<div className="modal-content">
								<div className="modal-header" style={{ display: 'none' }}>
                                    <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>
                                </div>
								<div className="modal-body">
									<div className="row clearfix">
										<p>Are you sure you want to delete the user?</p>
									</div>
								</div>
								<div className="modal-footer">
									<button type="button" className="btn btn-secondary" data-dismiss="modal">Cancel</button>
									<button type="button" onClick={this.confirmDelete}  className="btn btn-danger" disabled={this.state.ButtonLoading}>
										{this.state.ButtonLoading && (
											<span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
										)}
										Delete
									</button>
								</div>
							</div>
						</div>
					</div>
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