import React, { Component } from 'react';
import { connect } from 'react-redux';
import "react-datepicker/dist/react-datepicker.css";
import { getService } from '../../../services/getService';
import AlertMessages from '../../common/AlertMessages';
import DeleteModal from '../../common/DeleteModal';
import Pagination from '../../common/Pagination';
import { validateFields } from '../../common/validations';
import DateFilterForm from '../../common/DateFilterForm';
import {
	statisticsAction,
	statisticsCloseAction
} from '../../../actions/settingsAction';
import AddLeaveRequestModal from './elements/AddLeaveRequestModal';
import EditLeaveRequestModal from './elements/EditLeaveRequestModal';
import LeaveStats from './elements/LeaveStats';
import EmployeeLeaveTable from './elements/EmployeeLeaveTable';
import EmployeeTable from './elements/EmployeeTable';
import { formatDate } from '../../../utils';
import { appendDataToFormData } from '../../../utils';
import Button from '../../common/formInputs/Button';

class Employee extends Component {
	constructor(props) {
		super(props);
		this.handleStatistics = this.handleStatistics.bind(this);
		this.closeStatistics = this.closeStatistics.bind(this);
		this.sparkline1 = React.createRef();
		this.sparkline2 = React.createRef();
		this.sparkline3 = React.createRef();
		this.sparkline4 = React.createRef();
		this.state = {
			activeTab: 'Employee-list', // Default active tab
			showAddLeaveRequestModal: false,
			employeeData: [],
			employeeLeavesData: [],
			selectedSalaryDetails: [],
			totalLeaves: 0,
			approvedLeaves: 0,
			rejectedLeaves: 0,
			cancelledLeaves: 0,
			pendingLeaves: 0,
			message: null,
			deleteUser: null,
			// Initialize all fields with empty string or null
			fields: {
				first_name: '',
				last_name: '',
				email: '',
				gender: '',
				profile: '',
				dob: '',
				joining_date: '',
				mobile_no1: '',
				mobile_no2: '',
				address_line1: '',
				address_line2: '',
				emergency_contact1: '',
				emergency_contact2: '',
				emergency_contact3: '',
				frontend_skills: '',
				backend_skills: '',
				account_holder_name: '',
				account_number: '',
				ifsc_code: '',
				bank_name: '',
				bank_address: '',
				source: '',
				amount: '',
				from_date: '',
				to_date: '',
				aadhar_card_number: '',
				aadhar_card_file: '',
				pan_card_number: '',
				pan_card_file: '',
				driving_license_number: '',
				driving_license_file: '',
				facebook_url: '',
				twitter_url: '',
				linkedin_url: '',
				instagram_url: '',
				upwork_profile_url: '',
				resume: '',
				
			},
			// Set state for add employee leave
			employee_id: '',
			logged_in_employee_id: '',
			logged_in_employee_role: '',
			from_date: '',
			to_date: '',
			reason: '',
			status: 'approved',
			halfDayCheckbox: 0,
			selectedEmployeeLeave: '',
			deleteEmployeeLeave: '',
			searchQuery: "",
			currentPageEmployees: 1,
			currentPageLeaves: 1,
            dataPerPage: 8,
			loading: true,
			showSuccess: false,
			successMessage: '',
			showError: false,
			errorMessage: '',
			addLeaveErrors: {},
			selectedLeaveEmployeeId: '',
			allEmployeesData: [],
			fromDate: null,
			toDate: null,
			selectedLeaveEmployee: (window.user.role === 'admin' || window.user.role === 'super_admin') ? "" : window.user.id,
			ButtonLoading: false,
    		showEditLeaveModal: false, 
			col: 3
		};
	}
	handleStatistics(e) {
		this.props.statisticsAction(e)
	}
	closeStatistics(e) {
		this.props.statisticsCloseAction(e)
	}

	calculateLeaveCounts = (employeeLeavesData) => {
		let totalLeaves = 0;
		let pendingLeaves = 0;
		let approvedLeaves = 0;
		let rejectedLeaves = 0;
		let cancelledLeaves = 0;
		// Iterate over the employee leaves data and calculate counts
		employeeLeavesData.forEach((leave) => {
			if (leave) {
				totalLeaves += 1;
				switch (leave.status) {
					case 'pending':
						pendingLeaves += 1;
						break;
					case 'approved':
						approvedLeaves += 1;
						break;
					case 'rejected':
						rejectedLeaves += 1;
						break;
					case 'cancelled':
						cancelledLeaves += 1;
						break;
					default:
						break;
				}
			}
		});
	
		return { totalLeaves, pendingLeaves, approvedLeaves, rejectedLeaves, cancelledLeaves };
	};

	componentDidMount() {
		if (window.user) {
			const { id, role } = window.user;
			this.setState({
				employee_id: id || null,
				logged_in_employee_role: role || null,
			});

			const now = new Date();
			const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
			const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
			// Set the state for fromDate and toDate
			// this.setState({
			// 	fromDate: firstDay,
			// 	toDate: lastDay
			// });

			// Fetch employees & leaves based on role using EmployeeService
			Promise.all([
				getService.getCall('get_employees.php', {
					action: 'view',
					role: 'employee',
					employee_id:id
				}),
				getService.getCall('employee_leaves.php', {
					action: 'view',
					start_date:formatDate(firstDay),
					end_date: formatDate(lastDay),
					role:role === "admin" || role === "super_admin" ? null : id
				})
			])
			.then(([employeesData, employeeLeavesData]) => {
				// If only a single employee is returned, convert it to an array
				let employeesArray = Array.isArray(employeesData.data) ? employeesData.data : [employeesData.data];

				let employeesLeaveArray = Array.isArray(employeeLeavesData.data) ? employeeLeavesData.data : [employeeLeavesData.data];

				// Calculate leaves
				const { totalLeaves, pendingLeaves, approvedLeaves, rejectedLeaves, cancelledLeaves } = 
					this.calculateLeaveCounts(employeeLeavesData.data);
	
				this.setState({
					employeeData: employeesArray,
					allEmployeesData: employeesArray, //Save all employees (Working)
					filterEmployeesData: employeesArray,
					employeeLeavesData: employeesLeaveArray,
					totalLeaves,
					pendingLeaves,
					approvedLeaves,
					rejectedLeaves,
					cancelledLeaves,
					loading: false
				});
			})
			.catch(err => {
				this.setState({ message: "Failed to fetch data", loading: false });
				console.error(err);
			});
		} else {
			console.warn("window.user is undefined");
		}
	}

	fetchEmployeeLeaves = () => {
		const { fromDate, toDate, selectedLeaveEmployee } = this.state;
        const fromDateFormatted = fromDate ? formatDate(fromDate) : null;
        const toDateFormatted = toDate ? formatDate(toDate) : null;

		getService.getCall('employee_leaves.php', {
			action: 'view',
			start_date:fromDateFormatted,
			end_date: toDateFormatted,
			employee_id: selectedLeaveEmployee
		})
        .then(data => {
            if (data.status === 'success') {
				let employeesLeaveArray = Array.isArray(data.data) ? data.data : [data.data];
                    this.setState({ 
                        //reports: data.data,
                        employeeLeavesData: employeesLeaveArray,
                        loading: false,
                        error: null 
                    });
                
            }else {
                this.setState({ 
                    error: data.message || 'Failed to fetch reports',
                    loading: false,
                    employeeLeavesData: []
                });
            }
        });
    }

	handleApplyFilters = () => {
		this.setState({ 
			ButtonLoading: true,
			currentPageLeaves: 1 // Reset to first page
		}, () => {
			this.fetchEmployeeLeaves();
			this.setState({ ButtonLoading: false });
		});
    };
		
	goToEditEmployee = (employee, employeeId) => {
		// Fetch salary details based on employee_id
		getService.getCall('employee_salary_details.php', {
					action: 'view',
					employee_id:employeeId
				})
        .then((salaryDetails) => {
            if (salaryDetails.data) {
				this.props.history.push({
                    pathname: `/edit-employee`,
                    state: { employee, selectedSalaryDetails: salaryDetails.data, employeeId }
                });
            } else {
				console.warn("No salary details found for this employee. Navigating without salary details.");
                this.props.history.push({
					pathname: `/edit-employee`,
					state: { employee, selectedSalaryDetails: [], employeeId } // Pass an empty array or default data
				});
            }
        })
        .catch((err) => {
            console.error("Failed to fetch salary details", err);
        });
	}

	viewEmployee = (employee, employeeId) => {
		if (window.user.role === 'super_admin' || window.user.role === 'admin') {
			this.props.history.push({
				pathname: `/view-employee/${employeeId}/profile`,
			});
		}
		else {
			this.props.history.push({
				pathname: `/view-employee/${employeeId}/calendar`,
			});
		}
	}

	// Function to handle tab change
    handleTabChange = (tabId) => {
        this.setState({ activeTab: tabId });
		if(tabId === 'Employee-Request'){
			const now = new Date();
			const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
			const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
			// Set the state for fromDate and toDate
			this.setState({
				fromDate: firstDay,
				toDate: lastDay
			});
			setTimeout(() => {
				this.fetchEmployeeLeaves();
			}, 1000);
		}
			

    };

	handleDateChange = (date, type) => {
        if (date) {
            const newDate = new Date(date);
            if (type === 'fromDate') {
                this.setState({ fromDate: newDate });
               
            } else if (type === 'toDate') {
                this.setState({ toDate: newDate });
            }
         
        } else {
            this.setState({ [type]: null });
        }
    };

	// Function to dismiss messages
    dismissMessages = () => {
        this.setState({
            showSuccess: false,
            successMessage: "",
            showError: false,
            errorMessage: "",
        });
    };

	handleEmployeeChange = (event) => {
        this.setState({ 
			selectedLeaveEmployee: event.target.value, 
			currentPageLeaves: 1 // Reset to first page
		});
    };

	// Function for "Add" button based on active tab
    goToAddEmployee = () => {
        const { activeTab, logged_in_employee_role } = this.state;
        switch (activeTab) {
            case 'Employee-list':
                // Handle Add for Employee List
                this.props.history.push("/add-employee");
                break;
            case 'Employee-Request':
                const newState = {
                    showAddLeaveRequestModal: true,
                    from_date: "",
                    to_date: "",
                    reason: "",
                    status: 'approved',
                    halfDayCheckbox: 0,
                    addLeaveErrors: {}
                };

                if (logged_in_employee_role === 'admin' || logged_in_employee_role === 'super_admin') {
                    newState.employee_id = '';
                }
                
                this.setState(newState);
                break;
            default:
                break;
        }
    };

	// Delete Employee
	openDeleteModal = (userId) => {
        this.setState({
            deleteUser: userId,
        });
    };

    // Function to close the delete employee modal
    onCloseDeleteEmployeeModal = () => {
        this.setState({ deleteUser: null });
    };

    // Function to close the delete leave modal
    onCloseDeleteLeaveModal = () => {
        this.setState({ deleteEmployeeLeave: null });
    };

	confirmDelete = () => {
		const { deleteUser, currentPageEmployees, employeeData, dataPerPage } = this.state;
		const {id, role} = window.user;
		const loggedInUserId = id; // Get logged-in user ID
		const loggedInUserRole = role; // Get logged-in user role
		
		if (!deleteUser) return;

		this.setState({ ButtonLoading: true });
		getService.deleteCall('get_employees.php','delete', null, deleteUser, loggedInUserId, loggedInUserRole)
		.then((data) => {
			if (data.status === "success") {
				// Update users state after deletion
				const updatedEmployees = employeeData.filter((d) => d.id !== deleteUser);

				// Calculate the total pages after deletion
				const totalPages = Math.ceil(updatedEmployees.length / dataPerPage);
	
				// Adjust currentPageEmployees if necessary (if we're on a page that no longer has data)
				let newPage = currentPageEmployees;
				if (updatedEmployees.length === 0) {
					newPage = 1;
				} else if (currentPageEmployees > totalPages) {
					newPage = totalPages;
				}

				this.setState({
					employeeData: updatedEmployees,
					successMessage: "Employee deleted successfully",
					showSuccess: true,
					currentPageEmployees: newPage, // Update currentPageEmployees to the new page
					deleteUser: null,  // Clear the deleteUser state
					ButtonLoading: false,
				});
				this.onCloseDeleteEmployeeModal(); // Close the modal after successful delete
				setTimeout(this.dismissMessages, 3000);
			} else {
				this.setState({
					successMessage: '',
					showSuccess: false,
					showError: true,
					errorMessage:"Failed to delete employee.",
					ButtonLoading: false,
				});
				setTimeout(this.dismissMessages, 3000);
				
			}
		})
		.catch((error) => {
			console.error("Error:", error);
			this.setState({
                ButtonLoading: false,
			});
		});
	};
	

	// Function to close the modal
    closeModal = () => {
        this.setState({ showAddLeaveRequestModal: false });
		this.setState({ showEditLeaveModal: false });
    };

	// Handle input changes for employee leave
    handleInputChangeForAddLeaves = (event) => {
		const { name, type, checked, value } = event.target;

		if (type === 'checkbox') {
			this.setState({ [name]: checked ? 1 : 0 }, () => {});
		} else if (name === 'from_date') {
			// If selecting from_date, auto-fill to_date if empty or before from_date
			this.setState((prevState) => {
				let newState = { from_date: value };
				if (!prevState.to_date || prevState.to_date < value) {
					newState.to_date = value;
				}
				return newState;
			});
		} else {
			this.setState({ [name]: value });	
		}
    };

	handleLeaveStatus = (event) => {
		const { value } = event.target;
		this.setState({
            status: value, // Update selectedRole in state
        });
    };

	handleInputChangeForEditEmployeeLeave = (event) => {
		const { name, value, type, checked, } = event.target;
		this.setState((prevState) => ({
			selectedEmployeeLeave: {
				...prevState.selectedEmployeeLeave,
				[name]: type === 'checkbox' ? (checked ? '1' : '0') : value,
			},
		}));
	}

	// API endpoint to add employee leave data
    addLeave = (event) => {
		event.preventDefault();

		this.setState({ ButtonLoading: true });

        const { employee_id, from_date, to_date, reason, status, halfDayCheckbox, logged_in_employee_role} = this.state;
		
		// Apply Validation component
		const validationSchema = [
			{ name: 'employee_id', value: employee_id, required: true, messageName: 'Employee selection'},
			{ name: 'from_date', value: from_date, type: 'leave_date', required: true, messageName: 'From date'},
			{ name: 'to_date', value: to_date, type: 'leave_date', required: true, messageName: 'To date'},
			{ name: 'reason', value: reason, required: true, messageName: 'Reason'},
			{ name: 'status', value: status, required: true, messageName: 'Status'}
		];
		const errors = validateFields(validationSchema);

		if (Object.keys(errors).length > 0) {
			this.setState({ addLeaveErrors: errors, ButtonLoading: false });
			return;
		} else {
			this.setState({ addLeaveErrors: {} });
		}

		// If role is 'employee', force status to 'pending'
		// const finalStatus = logged_in_employee_role === "employee" ? "pending" : status;
		const finalStatus = status || "pending"; 

		// Ensure correct employee_id is sent
		const selectedEmployeeId = logged_in_employee_role === "employee" ? window.user.id : employee_id;

        const addEmployeeLeaveData = new FormData();
		const data = {
			employee_id:selectedEmployeeId,
			from_date: from_date,
			to_date: to_date,
			reason: reason,
			status: finalStatus,
			is_half_day:halfDayCheckbox
		}
		appendDataToFormData(addEmployeeLeaveData, data)

		getService.addCall('employee_leaves.php','add', addEmployeeLeaveData)
        .then((data) => {
            if (data.status === "success") {
				data.data.is_half_day = data.data.is_half_day.toString();
				this.setState((prevState) => {
					const updatedEmployeeLeavesData = [...(prevState.employeeLeavesData || []), data.data];
					
					// Calculate the leave counts
					const { totalLeaves, pendingLeaves, approvedLeaves, rejectedLeaves, cancelledLeaves } = this.calculateLeaveCounts(updatedEmployeeLeavesData);
					
					// Return the updated state
					return {
						employeeLeavesData: updatedEmployeeLeavesData,
						totalLeaves,
						pendingLeaves,
						approvedLeaves,
						rejectedLeaves,
						cancelledLeaves,
						// Clear form fields after submission
						from_date: "",
						to_date: "",
						reason: "",
						status: "",
						halfDayCheckbox: "",
						showSuccess: true,
						successMessage: data.message,
						ButtonLoading: false
					};
				});
				document.querySelector("#addLeaveRequestModal .close").click();
				setTimeout(() => this.setState({ showSuccess: false }), 3000);
            } else {
				this.setState({
					showError: true,
					errorMessage: data.message,
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
			setTimeout(() => this.setState({ showError: false }), 3000);
		});
    };

	
	// Handle employee leave edit button
    	handleEditClickForEmployeeLeave = (employeeLeave) => {
		this.setState({ selectedEmployeeLeave: employeeLeave, addLeaveErrors: {},showEditLeaveModal: true, });
		
    };
	
	// API endpoint to update/edit employee leave data
	updateEmployeeLeave = () => {
		const { selectedEmployeeLeave } = this.state;
		if (!selectedEmployeeLeave) return;

		// Apply Validation component for edit
		const validationSchema = [
			{ name: 'employee_id', value: selectedEmployeeLeave.employee_id, required: true, messageName: 'Employee selection'},
			{ name: 'from_date', value: selectedEmployeeLeave.from_date, type: 'leave_date', required: true, messageName: 'From date'},
			{ name: 'to_date', value: selectedEmployeeLeave.to_date, type: 'leave_date', required: true, messageName: 'To date'},
			{ name: 'reason', value: selectedEmployeeLeave.reason, required: true, messageName: 'Reason'},
			{ name: 'status', value: selectedEmployeeLeave.status, required: true, messageName: 'Status'}
		];
		const errors = validateFields(validationSchema);

		if (Object.keys(errors).length > 0) {
			this.setState({ addLeaveErrors: errors, ButtonLoading: false });
			return;
		} else {
			this.setState({ addLeaveErrors: {} });
		}

		this.setState({ ButtonLoading: true });

		const updateEmployeeLeaveData = new FormData();

		const data = {
			employee_id: selectedEmployeeLeave.employee_id,
			from_date: selectedEmployeeLeave.from_date,
			to_date: selectedEmployeeLeave.to_date,
			reason: selectedEmployeeLeave.reason,
			status: selectedEmployeeLeave.status,
			is_half_day: selectedEmployeeLeave.is_half_day,
		}
		appendDataToFormData(updateEmployeeLeaveData, data)

		getService.editCall('employee_leaves.php','edit',updateEmployeeLeaveData, selectedEmployeeLeave.id )
		.then((data) => {
			if (data.status === "success") {
				this.setState((prevState) => {
					// Update the employee leave data with the new data
					const updatedEmployeeLeavesData = prevState.employeeLeavesData.map((leave) => {
						if (leave.id === selectedEmployeeLeave.id) {
							return { ...leave, ...selectedEmployeeLeave }; // Replace the old leave with the updated one
						}
						return leave;
					});
	
					// Calculate the leave counts, excluding the totalLeaves count
					const { pendingLeaves, approvedLeaves, rejectedLeaves, cancelledLeaves } = this.calculateLeaveCounts(updatedEmployeeLeavesData);
					
					// Return the updated state
					return {
						employeeLeavesData: updatedEmployeeLeavesData,
						pendingLeaves,
						approvedLeaves,
						rejectedLeaves,
						cancelledLeaves,
						showSuccess: true,
						successMessage: data.message,
						ButtonLoading: false,
					};
				});

				document.querySelector("#editLeaveRequestModal .close").click();
				setTimeout(() => this.setState({ showSuccess: false }), 3000);
			} else {
				this.setState({
					showError: true,
					errorMessage: data.message,
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

	// Delete Employee leave
	openDeleteLeaveModal = (leaveId) => {
        this.setState({
            deleteEmployeeLeave: leaveId,
        });
    };

	confirmDeleteForEmployeeLeave = () => {
        const { deleteEmployeeLeave, currentPageLeaves, dataPerPage } = this.state;
      
        if (!deleteEmployeeLeave) {
			console.error("Employee leave ID is not found for deletion.");
			return;
		}

        this.setState({ ButtonLoading: true });

		getService.deleteCall('employee_leaves.php','delete', deleteEmployeeLeave, null, null, null)
        .then((data) => {
			if (data.status === "success") {
				this.setState((prevState) => {
					// Remove the leave data with the specified ID
					const updatedEmployeeLeavesData = prevState.employeeLeavesData.filter((d) => d.id !== deleteEmployeeLeave);
			
					// Calculate the leave counts
					const { totalLeaves, pendingLeaves, approvedLeaves, rejectedLeaves, cancelledLeaves } = this.calculateLeaveCounts(updatedEmployeeLeavesData);

					// Calculate the total pages after deletion
					const totalPages = Math.ceil(updatedEmployeeLeavesData.length / dataPerPage);
		
					// Adjust currentPage if necessary (if we're on a page that no longer has data)
					let newPage = currentPageLeaves;
					if (updatedEmployeeLeavesData.length === 0) {
						newPage = 1;
					} else if (currentPageLeaves > totalPages) {
						newPage = totalPages;
					}
			
					// Return the updated state
					return {
						employeeLeavesData: updatedEmployeeLeavesData,
						totalLeaves,
						pendingLeaves,
						approvedLeaves,
						rejectedLeaves,
						cancelledLeaves,
						currentPageLeaves: newPage,
						showSuccess: true,
						successMessage: data.message,
						ButtonLoading: false,
					};
				});
				this.onCloseDeleteLeaveModal(); // Close the modal after successful delete
				setTimeout(() => this.setState({ showSuccess: false }), 3000);
			} else {
				this.setState({
					showError: true,
					errorMessage: data.message,
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

	// Handle Pagination of employee leaves listing
	handlePageChange = (newPage) => {
		const totalPages = Math.ceil(this.state.employeeLeavesData.length / this.state.dataPerPage);
		if (newPage >= 1 && newPage <= totalPages) {
			this.setState({ currentPageLeaves: newPage });
		}
	};	

	// Add searching user by name and email
	handleSearch = (event) => {
        const query = event.target.value.toLowerCase(); // Get search input
        this.setState({ searchQuery: query }, () => {
			if (query === "") {
				// If search is empty, reset users to the original list
				this.setState({ employeeData: this.state.filterEmployeesData, currentPageEmployees: 1 });
			} else {
				const filtered = this.state.filterEmployeesData.filter(employee => {
					return (
						employee.first_name.toLowerCase().includes(query) ||
						employee.last_name.toLowerCase().includes(query) ||
						`${employee.first_name.toLowerCase()} ${employee.last_name.toLowerCase()}`.includes(query) ||  
						employee.email.toLowerCase().includes(query)
					);
				});
				this.setState({ employeeData: filtered, currentPageEmployees: 1});
			}
        });
    };



	render() {
		const { fixNavbar, /* statisticsOpen, statisticsClose */ } = this.props;
			
		const { activeTab, employeeData, employeeLeavesData, totalLeaves, pendingLeaves, approvedLeaves, rejectedLeaves, message,  currentPageLeaves, dataPerPage, loading, selectedLeaveEmployee, showSuccess, successMessage, showError, errorMessage  } = this.state;

		// Handle empty employee data safely
		const employeeList = (employeeData || []).length > 0
			? employeeData.filter(emp => emp.role === "employee")
			: [];
		const leaveList = (employeeLeavesData || []).length > 0 ? employeeLeavesData : [];

		// Filter leaves
		const filteredLeaveList = (this.state.selectedLeaveEmployeeId
			? leaveList.filter(l => l && String(l.employee_id) === String(this.state.selectedLeaveEmployeeId))
			: leaveList.filter(l => l)
		).slice().sort((a, b) => {
			//Descending Order
			const dateA = new Date(a.from_date);
			const dateB = new Date(b.from_date);
			if (!isNaN(dateA) && !isNaN(dateB)) {
				return dateB - dateA;
			}
			return (b.id || 0) - (a.id || 0);
		});

		const leaveData = [
			{ label: 'Total Leaves', value: totalLeaves },
			{ label: 'Approved Leaves', value: approvedLeaves },
			{ label: 'Rejected Leaves', value: rejectedLeaves },
			{ label: 'Pending Leaves', value: pendingLeaves }
		];

		// Pagination logic for employee leaves
		const indexOfLastLeave = this.state.currentPageLeaves * dataPerPage;
		const indexOfFirstLeave = indexOfLastLeave - dataPerPage;
		const currentEmployeeLeaves = filteredLeaveList.slice(indexOfFirstLeave, indexOfLastLeave);
		const totalPagesLeaves = Math.ceil(filteredLeaveList.length / dataPerPage);

		return (
			<>
				<AlertMessages
                    showSuccess={showSuccess}
                    successMessage={successMessage}
                    showError={showError && !!errorMessage}
                    errorMessage={errorMessage}
                    setShowSuccess={(val) => this.setState({ showSuccess: val })}
                    setShowError={(val) => this.setState({ showError: val })}
                />
				<div>
					<div>
						<div className={`section-body ${fixNavbar ? "marginTop" : ""} `}>
							<div className="container-fluid">
								<div className="d-flex justify-content-between align-items-center mb-3">
									<ul className="nav nav-tabs page-header-tab">
										<li className="nav-item">
											<a
												className={`nav-link ${activeTab === 'Employee-list' ? 'active' : ''}`}
												id="Employee-tab"
												data-toggle="tab"
												href="#Employee-list"
												onClick={() => this.handleTabChange('Employee-list')}
											>
												All
											</a>
										</li>
										<li className="nav-item">
											<a
												className={`nav-link ${activeTab === 'Employee-Request' ? 'active' : ''}`}
												id="Employee-tab"
												data-toggle="tab"
												href="#Employee-Request"
												onClick={() => this.handleTabChange('Employee-Request')}
											>
												Leave Request
											</a>
										</li>
									</ul>
									{/* Render the Add buttons and icons */}
									<div className="header-action">
											<Button
												icon="fe fe-plus mr-2"
												onClick={this.goToAddEmployee}
												className="btn-primary"
												label={activeTab === 'Employee-list' ? 'Add Employee' : activeTab === 'Employee-Request' ? 'Add Leave' : ''}
											/>
									</div>
								</div>
								{/* Show leave count */}
								<div className="row justify-content-center align-items-stretch">
									{leaveData.map((item, index) => (
										<LeaveStats
											key={index}
											label={item.label}
											value={item.value}
											loading={loading}
										/>
									))}
								</div>
							</div>
						</div>
						<div className="section-body">
							<div className="container-fluid">
								<div className="tab-content">
									<div className="tab-pane fade show active" id="Employee-list" role="tabpanel">
										<div className="card">
											<div className="card-header">
												<h3 className="card-title">Employee List</h3>
												<div className="card-options">
													<div className="input-group">
														<div className="input-icon ml-2">
															<span className="input-icon-addon">
																<i className="fe fe-search" />
															</span>
															<input
																type="text"
																className="form-control"
																placeholder="Search employee..."
																// name="s"
																value={this.state.searchQuery}
																onChange={this.handleSearch}
															/>
														</div>
													</div>
												</div>
											</div>
											<EmployeeTable
												loading={loading}
												employeeList={employeeList}
												viewEmployee={this.viewEmployee}
												goToEditEmployee={this.goToEditEmployee}
												openDeleteModal={this.openDeleteModal}
												message={message}
											/>
										</div>
									</div>
									<div className="tab-pane fade" id="Employee-Request" role="tabpanel">
										<div className="card">
											<div className="card-header">
													<div className="row">
														<DateFilterForm
															fromDate={this.state.fromDate}
															toDate={this.state.toDate}
															selectedEmployee={selectedLeaveEmployee}
															allEmployeesData={this.state.allEmployeesData}
															ButtonLoading={this.state.ButtonLoading}
															handleDateChange={this.handleDateChange}
															handleEmployeeChange={this.handleEmployeeChange}
															handleApplyFilters={this.handleApplyFilters}
															col={this.state.col}
														/>
													</div>
												</div>
											<EmployeeLeaveTable
												currentEmployeeLeaves={currentEmployeeLeaves}
												loading={loading}
												handleEditClickForEmployeeLeave={this.handleEditClickForEmployeeLeave}
												openDeleteLeaveModal={this.openDeleteLeaveModal}
											/>
										</div>

										{/* Only show pagination if there are employee leaves */}
										{totalPagesLeaves > 1 && (
											<Pagination
												currentPage={currentPageLeaves}
												totalPages={totalPagesLeaves}
												onPageChange={this.handlePageChange}
											/>
										)}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Modal for Add Leave Request */}
				<AddLeaveRequestModal
					showModal={this.state.showAddLeaveRequestModal}
					employeeData={this.state.employeeData}
					logged_in_employee_role={this.state.logged_in_employee_role}
					handleInputChangeForAddLeaves={this.handleInputChangeForAddLeaves}
					handleLeaveStatus={this.handleLeaveStatus}
					addLeaveErrors={this.state.addLeaveErrors}
					halfDayCheckbox={this.state.halfDayCheckbox}
					addLeave={this.addLeave}
					closeModal={this.closeModal}
					ButtonLoading={this.state.ButtonLoading}
					from_date={this.state.from_date}
					to_date={this.state.to_date}
					reason={this.state.reason}
					employee_id={this.state.employee_id}
					status={this.state.status}
				/>

				<EditLeaveRequestModal
					showModal={this.state.showEditLeaveModal}
					selectedEmployeeLeave={this.state.selectedEmployeeLeave}
					employeeData={this.state.employeeData}
					logged_in_employee_role={this.state.logged_in_employee_role}
					handleInputChangeForEditEmployeeLeave={this.handleInputChangeForEditEmployeeLeave}
					addLeaveErrors={this.state.addLeaveErrors}
					updateEmployeeLeave={this.updateEmployeeLeave}
					ButtonLoading={this.state.ButtonLoading}
					closeModal={this.closeModal}
				/>

				{/* Delete Leave Request Modal */}
				<DeleteModal
					show={!!this.state.deleteEmployeeLeave}
					onConfirm={this.confirmDeleteForEmployeeLeave}
					isLoading={this.state.ButtonLoading}
					deleteBody='Are you sure you want to delete the leave?'
					modalId="deleteLeaveRequestModal"
					onClose={this.onCloseDeleteLeaveModal}
				/>

				{/* Delete Employee Model */}
				<DeleteModal
					show={!!this.state.deleteUser}
					onConfirm={this.confirmDelete}
					isLoading={this.state.ButtonLoading}
					deleteBody='Are you sure you want to delete the employee?'
					modalId="deleteEmployeeModal"
					onClose={this.onCloseDeleteEmployeeModal}
				/>
			</>
		);
	}
}
const mapStateToProps = state => ({
	fixNavbar: state.settings.isFixNavbar,
	statisticsOpen: state.settings.isStatistics,
	statisticsClose: state.settings.isStatisticsClose,
})

const mapDispatchToProps = dispatch => ({
	statisticsAction: (e) => dispatch(statisticsAction(e)),
	statisticsCloseAction: (e) => dispatch(statisticsCloseAction(e))
})
export default connect(mapStateToProps, mapDispatchToProps)(Employee);