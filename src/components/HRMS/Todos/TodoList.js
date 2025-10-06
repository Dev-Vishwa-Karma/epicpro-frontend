import React, { Component } from 'react'
import { connect } from 'react-redux';
import TodoModal from './elements/TodoModal';
import DeleteModal from '../../common/DeleteModal';
import AlertMessages from '../../common/AlertMessages';
import { getService } from '../../../services/getService';
import Pagination from '../../common/Pagination';
import { validateFields } from '../../common/validations';
import TodoTable from './elements/TodoTable';
import { appendDataToFormData, getSortedEmployees, isOverduePending } from '../../../utils';
import Button from '../../common/formInputs/Button';
import BlankState from '../../common/BlankState';
import { withRouter } from 'react-router-dom';
class TodoList extends Component {
    constructor(props) {
		super(props);
		this.state = {
			todos: [],
            employees: [],
            showOverdueModal: false,
            selectedTodo: null,
			showAddTodoModal: false,
            showEditModal: false,
            showDeleteModal:false,
            selectedEmployeeId: '',
			logged_in_employee_id: null,
            logged_in_employee_role: null,
			title: "",
			due_date: "",
            priority: "",
            todoStatus: "",
            statusFilter: 'pending',
			errors: {
				title: '',
        		due_date: '',
                priority: '',
                selectedEmployeeId: '',
			},
			successMessage: "",
      		errorMessage: "",
			showSuccess: false,
      		showError: false,
			loading: true,
            ButtonLoading: false,
            currentPageTodos: 1, //pagination
            dataPerPage: 10,
            employeeFilter: '',
            allTodos: [],
            baseTodos: [],
            dayFilter: '' // will be set to `date:YYYY-MM-DD` for Today on mount
		}
	}

    componentDidMount() {
        const {role} = window.user;
		// Get the logged in user id
		this.setState({
			logged_in_employee_id: window.user.id,
            logged_in_employee_role: window.user.role
		});

        // Check for query params
        const params = new URLSearchParams(this.props.location.search);
        const employee_id = params.get('employee_id') || '';
        const status = params.get('status') || '';
        const date = params.get('date');
        const day = params.get('day');
        let dayFilter = '';
        if (date) dayFilter = `date:${date}`;
        else if (day) dayFilter = day;

        if (employee_id || status || date || day) {
            this.setState({
                employeeFilter: employee_id,
                statusFilter: status,
                dayFilter: dayFilter
            }, () => {
                this.fetchFilteredTodos(employee_id, status);
            });
        } else {
            // Default behavior differs for employee vs admin
            if (role === 'employee') {
                // Employees: show ALL pending by default (no date filter)
                this.setState({ dayFilter: '' }, () => {
                    this.fetchFilteredTodos(this.state.employeeFilter, 'pending');
                });
            } else {
                // Admins: default to Today
                const today = new Date();
                const y = today.getFullYear();
                const m = String(today.getMonth() + 1).padStart(2, '0');
                const d = String(today.getDate()).padStart(2, '0');
                const dayFilterDefault = `date:${y}-${m}-${d}`;
                this.setState({ dayFilter: dayFilterDefault }, () => {
                    this.fetchFilteredTodos(this.state.employeeFilter, 'pending');
                });
            }
        }

        // Check if user is admin or superadmin
        if (role === 'admin' || role === 'super_admin') {
            // Fetch employees data if user is admin or super_admin
            getService.getCall('get_employees.php', {
                action: 'view',
                role: 'employee'
            })
            .then(data => {
                if (data.status === 'success') {
                    this.setState({
                        employees: data.status === 'success' ? data.data : [],
                        loading: false
                    });
                } else {
                    this.setState({ error: data.message, loading: false });
                }
            })
            .catch(err => {
                this.setState({ error: 'Failed to fetch employees data' });
                console.error(err);
            });
        }
	}

    // Handle input changes for add todo
	handleInputChangeForAddTodo = (todo) => {
        const { name, value } = todo.target;
        this.setState({
			[name]: value,
			errors: { ...this.state.errors, [name]: "" } // Clear error for this field
		});
    };

    // Validate Add Department Form
	validateAddTodoForm = (e) => {
		const { title, due_date, priority, logged_in_employee_role, selectedEmployeeId } = this.state;
		
		// Apply Validation component
		const validationSchema = [
			{ name: 'title', value: title, required: true, messageName: 'Todo title',
				customValidator: (val) => {
					if (!String(val || '').trim()) {
						return 'Todo title is required:';
					}
					return undefined;
				}
			},
			{ name: 'due_date', value: due_date, type: 'date', required: true, messageName: 'Due date',
				customValidator: (val) => {
					const today = new Date().toISOString().split("T")[0];
					if (val < today) {
						return "Due date not less than current date:";
					}
					return undefined;
				}
			},
			{ name: 'priority', value: priority, required: true, messageName: 'Todo priority'}
		];

		// Employee selection required for admin/super_admin when adding
		if (logged_in_employee_role === 'admin' || logged_in_employee_role === 'super_admin') {
			validationSchema.push({
				name: 'selectedEmployeeId',
				value: selectedEmployeeId,
				required: true,
				messageName: 'Employee',
				customValidator: (val) => {
					if (!String(val || '').trim()) {
						return 'Employee is required:';
					}
					return undefined;
				}
			});
		}
		const errors = validateFields(validationSchema);
		
		this.setState({ errors });
		return Object.keys(errors).length === 0;
	};

    // Add Todo data API call
    addTodoData = () => {
        const { logged_in_employee_id, logged_in_employee_role, title, due_date, priority, selectedEmployeeId } = this.state;

        if (!this.validateAddTodoForm()) {
            return; // Stop execution if validation fails
        }

        // Determine the correct employee_id
        const employee_id = (logged_in_employee_role === "admin" || logged_in_employee_role === "super_admin") 
            ? selectedEmployeeId 
            : logged_in_employee_id;

        const addTodoFormData = new FormData();

        const data = {
            employee_id: employee_id,
            title: title,
            due_date:due_date,
            priority: priority,
            logged_in_employee_id: logged_in_employee_id,
            logged_in_employee_role:logged_in_employee_role
        }
        appendDataToFormData(addTodoFormData, data)

        // API call to add todo using getService
        getService.addCall('project_todo.php', 'add', addTodoFormData)
        .then((data) => {
            if (data.status === 'success') {
                // Fetch the updated todo list with current filters
                this.fetchFilteredTodos(this.state.employeeFilter, this.state.statusFilter);
                this.setState({
                    title: "",
                    due_date: "",
                    priority: "",
                    selectedEmployeeId: "",
                    errors: {},
                    successMessage: "Todo added successfully!",
                    showSuccess: true,
                    showAddTodoModal: false
                });

                // Auto-hide success message after 5 seconds
                setTimeout(() => {
                    this.setState({
                        showSuccess: false, 
                        successMessage: ''
                    });
                }, 3000);
            } else {
                this.setState({
                    errorMessage: "Failed to add Todo. Please try again.",
                    showError: true,
                });

                setTimeout(() => {
                    this.setState({
                        showError: false,
                        errorMessage: ''
                    });
                }, 3000);
            }
        })
        .catch((error) => {
            console.error("Error:", error);
            this.setState({
                errorMessage: "An error occurred while adding the todo.",
                showError: true,
            });
        });
    };

    handleCheckboxClick = (todo) => {
        // if (this.state.logged_in_employee_role === 'employee') {
        // Add loading state for this todo
        this.setState(prev => ({
            todoLoading: { ...prev.todoLoading, [todo.id]: true }
        }));

        setTimeout(() => {
            // Call backend to update status here (your existing logic)
            const { logged_in_employee_role } = this.state;
            const isAdmin = (logged_in_employee_role === 'super_admin');
            const isUnchecking = (todo.todoStatus === 'completed');
            if (isAdmin) {
			// Admins update immediately without confirmation modal
			this.setState({ selectedTodo: todo, isUnchecking }, () => {
				this.handleUpdateTodo();
			});
            } else {
                // If todo is not completed, checking will set to completed
                this.setState({ 
                    showOverdueModal: true, 
                    selectedTodo: todo,
                    isUnchecking: false 
                });
            }
            // Remove loading after status update
            this.setState(prev => ({
                todoLoading: { ...prev.todoLoading, [todo.id]: false }
            }));
        }, 1000); // Take 1 sec to action
    };

    handleEditTodo = (todo) => {
        this.setState({
            selectedTodo: todo,
            showEditModal: true,
            title: todo.title,
            due_date: todo.due_date,
            priority: todo.priority,
            selectedEmployeeId: todo.employee_id
        });
    };


    // Reset form errors when modal is closed
    resetFormErrors = () => {
        this.setState({
            errors: {},
            title: "",
            due_date: "",
            priority: "",
            selectedEmployeeId: ""
        });
    };

    // Handle modal close
    handleModalClose = () => {
        this.setState({
            showAddTodoModal: false,
            errors: {},
            title: "",
            due_date: "",
            priority: "",
            selectedEmployeeId: ""
        });
    };

    // Handle modal submit
    handleModalSubmit = () => {
        this.addTodoData();
    };    

    closeModal = () => {
        this.setState({ showOverdueModal: false, selectedTodo: null });
    };

    handleUpdateTodo = () => {
        const { selectedTodo, logged_in_employee_id, isUnchecking, logged_in_employee_role } = this.state;
        console.log('update_status',selectedTodo)
        if (!selectedTodo) return;

        const newStatus = isUnchecking ? 'pending' : 'completed';
        const successMessage = isUnchecking 
            ? 'Todo status changed to pending!' 
            : 'Todo marked as completed!';

        const formData = new FormData();

        const data = {
            id: selectedTodo.id,
            status: newStatus,
            logged_in_employee_id: logged_in_employee_id,
            logged_in_employee_role: logged_in_employee_role,
            to_do_created_by: selectedTodo.created_by,
            to_do_created_for: selectedTodo.employee_id,
            logged_in_employee_name: selectedTodo.first_name
        }
        appendDataToFormData(formData, data)
        getService.addCall('project_todo.php', 'update_status', formData)
        .then(data => {
            if (data.status === 'success') {
                // Re-fetch to respect active filters
                this.fetchFilteredTodos(this.state.employeeFilter, this.state.statusFilter);
                this.setState({
                    showOverdueModal: false,
                    selectedTodo: null,
                    isUnchecking: false,
                    successMessage: successMessage,
                    showSuccess: true
                });
                
                setTimeout(() => {
                    this.setState({
                        showSuccess: false,
                        successMessage: ''
                    });
                }, 3000);
            } else {
                this.setState({ 
                    showError: true, 
                    errorMessage: 'Failed to update todo status',
                    showOverdueModal: false, 
                    selectedTodo: null,
                    isUnchecking: false
                });
            }
        })
        .catch(error => {
            console.error("Error:", error);
            this.setState({ 
                showError: true, 
                errorMessage: 'An error occurred while updating the todo',
                showOverdueModal: false, 
                selectedTodo: null,
                isUnchecking: false
            });
        });
    };

    // Handle edit modal close
    handleEditModalClose = () => {
        this.setState({
            showEditModal: false,
            selectedTodo: null,
            errors: {},
            title: "",
            due_date: "",
            priority: "",
            selectedEmployeeId: ""
        });
    };

    // Handle edit modal submit
    handleEditModalSubmit = () => {
        this.updateTodoData();
    };

    // Update Todo data API call
    updateTodoData = () => {
        const { selectedTodo, logged_in_employee_id, logged_in_employee_role, title, due_date, priority, selectedEmployeeId } = this.state;

        // Apply Validation component for edit
        // const validationSchema = [
        //     { name: 'title', value: title, type: 'name', required: true, messageName: 'Todo title'},
        //     { name: 'due_date', value: due_date, type: 'date', required: true, messageName: 'Due date',
        //         customValidator: (val) => {
        //             const today = new Date().toISOString().split("T")[0];
        //             if (val < today) {
        //                 return "Due date not less than current date:";
        //             }
        //             return undefined;
        //         }
        //     },
        //     { name: 'priority', value: priority, required: true, messageName: 'Todo priority'}
        // ];
        // const errors = validateFields(validationSchema);
        
        // if (Object.keys(errors).length > 0) {
        //     this.setState({ errors });
        //     return; // Stop execution if validation fails
        // }
        if (!this.validateAddTodoForm()) {
            return; // Stop execution if validation fails
        }

        // Determine the correct employee_id
        const employee_id = (logged_in_employee_role === "admin" || logged_in_employee_role === "super_admin") 
        ? selectedEmployeeId 
        : logged_in_employee_id;

        const updateTodoFormData = new FormData();

        const data = {
            todo_id: selectedTodo.id,
            employee_id: employee_id,
            title: title,
            due_date: due_date,
            priority: priority,
            logged_in_employee_id: logged_in_employee_id,
            logged_in_employee_role:logged_in_employee_role
        }
        appendDataToFormData(updateTodoFormData, data)

        // API call to update todo using getService
        getService.addCall('project_todo.php', 'edit', updateTodoFormData)
        .then((resp) => {
            if (resp.status === 'success') {
                // After edit, re-fetch with active filters
                this.fetchFilteredTodos(this.state.employeeFilter, this.state.statusFilter);
                this.setState({
                    title: "",
                    due_date: "",
                    priority: "",
                    selectedEmployeeId: "",
                    errors:{},
                    successMessage: "Todo updated successfully!",
                    showSuccess: true,
                    showEditModal: false,
                    selectedTodo: null
                });

                // Auto-hide success message after 3 seconds
                setTimeout(() => {
                    this.setState({
                        showSuccess: false, 
                        successMessage: ''
                    });
                }, 3000);
            } else {
                this.setState({
                    errorMessage: "Failed to update Todo. Please try again.",
                    showError: true,
                });

                setTimeout(() => {
                    this.setState({
                        showError: false,
                        errorMessage: ''
                    });
                }, 3000);
            }
        })
        .catch((error) => {
            console.error("Error:", error);
            this.setState({
                errorMessage: "An error occurred while updating the todo.",
                showError: true,
            });
        });
    };

    // Handle delete modal close
    handleDeleteModalClose = () => {
        this.setState({
            showDeleteModal: false,
            todoToDelete: null,
            ButtonLoading: false
        });
    };

    handleDeleteTodo = () => {
    const { todoToDelete } = this.state;
    if (!todoToDelete) return;
    this.setState({ ButtonLoading: true });

    // API call to delete todo using getService
    getService.deleteCall('project_todo.php', 'delete', todoToDelete.id)
    .then(data => {
        if (data.status === 'success') {
            // Re-fetch to respect filters
            this.fetchFilteredTodos(this.state.employeeFilter, this.state.statusFilter);
            this.setState({
                showDeleteModal: false,
                todoToDelete: null,
                ButtonLoading: false,
                successMessage: "Todo deleted successfully!",
                showSuccess: true
            });
            setTimeout(() => {
                this.setState({
                    showSuccess: false,
                    successMessage: ''
                });
            }, 3000);

        } else {
            this.setState({ 
                showError: true, 
                errorMessage: data.message || 'Failed to delete todo',
                showDeleteModal: false, 
                todoToDelete: null,
                ButtonLoading: false
            });
        }
    })
    .catch(error => {
        console.error("Error:", error);
        this.setState({ 
            showError: true, 
            errorMessage: 'An error occurred while deleting the todo',
            showDeleteModal: false, 
            todoToDelete: null,
            ButtonLoading: false
        });
    });
};

    // Unified filter handler for employee and status
    fetchFilteredTodos = (employeeId, status) => {
        const params = {
            action: 'view',
            logged_in_employee_id: window.user.id,
            role: window.user.role
        };
        if (employeeId) {
            params.employee_id = employeeId;
        }
        if (status) {
            params.status = status;
        }
        // Map dayFilter to backend params
        const { dayFilter } = this.state;
        if (dayFilter) {
            if (dayFilter.startsWith('date:')) {
                params.date = dayFilter.replace('date:','');
            } else {
                // day keywords like this_week, yesterday, tomorrow, weekdays
                params.day = dayFilter;
            }
        }
        this.setState({ loading: true });
        getService.getCall('project_todo.php', params)
            .then(data => {
                if (data.status === 'success') {
                    const list = data.data;
                    const sorted = this.sortTodosForDisplay(list);
                    this.setState({
                        baseTodos: sorted,
                        todos: sorted,
                        loading: false
                    });
                } else {
                    this.setState({
                        todos: [],
                        baseTodos: [],
                        loading: false,
                        message: 'No task available for this employee'
                    });
                }
            })
            .catch(err => {
                this.setState({
                    todos: [],
                    baseTodos: [],
                    loading: false,
                    message: 'No task available for this employee'
                });
                console.error(err);
            });
    };

    handleStatusFilterChange = (e) => {
        const value = e.target.value;
        this.setState({
            statusFilter: value,
            currentPageTodos: 1
        });
        this.fetchFilteredTodos(this.state.employeeFilter, value);
    };

    handleEmployeeFilterChange = (e) => {
        const employeeId = e.target.value;
        this.setState({
            employeeFilter: employeeId,
            currentPageTodos: 1
        });
        this.fetchFilteredTodos(employeeId, this.state.statusFilter);
    };

    // Day filter helpers and handler
    getStartOfWeek = (date) => {
        const d = new Date(date);
        const day = d.getDay(); // 0=Sun ... 6=Sat
        const diffToMonday = (day === 0 ? -6 : 1) - day; // Monday as start
        d.setDate(d.getDate() + diffToMonday);
        d.setHours(0,0,0,0);
        return d;
    };

    getEndOfWeek = (date) => {
        const start = this.getStartOfWeek(date);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23,59,59,999);
        return end;
    };

    toYmd = (date) => {
        const d = new Date(date);
        const y = d.getFullYear();
        const m = String(d.getMonth()+1).padStart(2,'0');
        const day = String(d.getDate()).padStart(2,'0');
        return `${y}-${m}-${day}`;
    };

    // Sort so that overdue pending appear first, then by due_date ascending
    sortTodosForDisplay = (list) => {
        const safeList = Array.isArray(list) ? list.slice() : [];
        return safeList.sort((a, b) => {
            const aOver = isOverduePending(a);
            const bOver = isOverduePending(b);
            if (aOver !== bOver) return aOver ? -1 : 1;
            const aDue = String(a.due_date || '').slice(0, 10);
            const bDue = String(b.due_date || '').slice(0, 10);
            if (aDue && bDue) {
                if (aDue < bDue) return -1;
                if (aDue > bDue) return 1;
            }
            return 0;
        });
    };

    // Removed client-side applyDayFilter usage; now server returns filtered list
    applyDayFilter = (todos, dayFilter) => {
        if (!dayFilter) return todos;
        const today = new Date();
        if (dayFilter === 'this_week') {
            const start = this.getStartOfWeek(today);
            const end = this.getEndOfWeek(today);
            return (todos || []).filter(t => {
                const due = new Date(t.due_date);
                return due >= start && due <= end;
            });
        }
        if (dayFilter.startsWith('date:')) {
            const target = dayFilter.replace('date:','');
            return (todos || []).filter(t => String(t.due_date).slice(0,10) === target);
        }
        return todos;
    };

    getDayOptions = () => {
        const options = [];
        const now = new Date();
        const todayStr = this.toYmd(now);
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const yesterdayStr = this.toYmd(yesterday);
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        const tomorrowStr = this.toYmd(tomorrow);
        // const weekdays = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];

        options.push({ value: 'all', label: 'All Days' });
        options.push({ value: `date:${todayStr}`, label: `Today` });
        // options.push({ value: `date:${yesterdayStr}`, label: `Yesterday` });
        options.push({ value: `date:${tomorrowStr}`, label: `Tomorrow` });
        // Also allow keyword week days for server-side
        // weekdays.forEach(wd => {
        //     options.push({ value: wd, label: wd.charAt(0).toUpperCase() + wd.slice(1) });
        // });
        options.push({ value: 'this_week', label: 'This Week' });
        return options;
    };

    handleDayFilterChange = (e) => {
        const value = e.target.value;
        this.setState({ dayFilter: value, currentPageTodos: 1 }, () => {
            this.fetchFilteredTodos(this.state.employeeFilter, this.state.statusFilter);
        });
    };

    handlePageChange = (newPage) => {
        const totalPages = Math.ceil(this.state.todos.length / this.state.dataPerPage);
        if (newPage >= 1 && newPage <= totalPages) {
            this.setState({ currentPageTodos: newPage });
        }
    };

    render() {
        const { fixNavbar } = this.props;
        const { todos, loading, logged_in_employee_role, statusFilter, showSuccess, successMessage, showError, errorMessage,showDeleteModal,dataPerPage, currentPageTodos } = this.state;
        
        const indexOfLastTodo = this.state.currentPageTodos * dataPerPage;
        const indexOfFirstTodo = indexOfLastTodo - dataPerPage;
        const currentTodos = todos && todos.length > 0 ? todos.slice(indexOfFirstTodo, indexOfLastTodo) : [];
        const totalPagesTodos = Math.ceil((todos && todos.length ? todos.length : 0) / dataPerPage);

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
                                
                                 {/* Show Toast Messages */}
                <div className={`section-body ${fixNavbar ? "marginTop" : ""} mt-3`}>
                    <div className="container-fluid">
                        <div className="row">
                        {/* Status Filter for Admin/Super Admin */}
                        {(logged_in_employee_role === "admin" || logged_in_employee_role === "super_admin") && (
                             
                            	<div className="col-12">
                                    <div className="card">
                                        <div className="card-body">
                                            <div className="row align-items-center">
                                                <div className="col-lg-2 col-md-12 col-sm-12" style={{backgroundColor:"transparent"}}>
                                                    <select
                                                        id="employeeFilter"
                                                        className="form-control custom-select"
                                                        value={this.state.employeeFilter}
                                                        onChange={this.handleEmployeeFilterChange}
                                                    >
                                                        <option value="">All Employees</option>
                                                        {getSortedEmployees(this.state.employees)
                                                        .filter(emp => emp.status === 1)
                                                        .map(emp => (
                                                            <option key={emp.id} value={emp.id}>
                                                                {emp.first_name} {emp.last_name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="col-lg-2 col-md-12 col-sm-12" style={{backgroundColor:"transparent"}}>
                                                    <select
                                                        id="statusFilter"
                                                        className="form-control custom-select"
                                                        value={statusFilter}
                                                        onChange={this.handleStatusFilterChange}
                                                    >
                                                        <option value="">All</option>
                                                        <option value="pending">Pending</option>
                                                        <option value="completed">Completed</option>
                                                        {/* Add more statuses if needed */}
                                                    </select>
                                                </div>
                                                <div className="col-lg-2 col-md-12 col-sm-12" style={{backgroundColor:"transparent"}}>
                                                    <select
                                                        id="dayFilter"
                                                        className="form-control custom-select"
                                                        value={this.state.dayFilter}
                                                        onChange={this.handleDayFilterChange}
                                                    >
                                                        {this.getDayOptions().map(opt => (
                                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="col-lg-6 col-md-12 col-sm-12 text-right">
                                                    {(logged_in_employee_role === "admin" || logged_in_employee_role === "super_admin") && (
                                                    <Button
                                                    label="Add New"
                                                    onClick={() => this.setState({ showAddTodoModal: true })}
                                                    className="btn-primary btn-sm"
                                                    icon="fe fe-plus mr-2"
                                                    />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                        )}
                       
                            <div className="col-12">
                                <div className="card">
                                    <div className="card-body">
                                        {/* Add Seperate Todo Table Component */}
                                        {currentTodos.length === 0 ? (
                                            <BlankState message="No todos available" />
                                        ) : (
                                        <TodoTable
                                            todos={todos}
                                            loading={loading}
                                            currentTodos={currentTodos}
                                            logged_in_employee_role={logged_in_employee_role}
                                            handleCheckboxClick={this.handleCheckboxClick}
                                            handleEditTodo={this.handleEditTodo}
                                            handleDeleteClick={(todo) => {
                                                this.setState({ 
                                                    showDeleteModal: true, 
                                                    todoToDelete: todo 
                                                }, () => {
                                                    if (window.$) {
                                                        window.$('#deleteTodoModal').modal('show');
                                                    }
                                                });
                                            }}
                                            todoLoading={this.state.todoLoading}
                                        />
                                        )}

                                        <div className="mt-3">
                                       {totalPagesTodos > 1 && (
                                            <Pagination
                                                currentPage={currentPageTodos}
                                                totalPages={totalPagesTodos}
                                                onPageChange={this.handlePageChange}
                                            />
                                       )}
                                       </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Add Todo Modal */}
                <TodoModal
                    show={this.state.showAddTodoModal}
                    onClose={this.handleModalClose}
                    onSubmit={this.handleModalSubmit}
                    onChange={this.handleInputChangeForAddTodo}
                    formData={{
                        title: this.state.title,
                        due_date: this.state.due_date,
                        priority: this.state.priority,
                        selectedEmployeeId: this.state.selectedEmployeeId
                    }}
                    errors={this.state.errors}
                    loading={false}
                    modalId="addTodoModal"
                    employees={this.state.employees}
                    loggedInEmployeeRole={this.state.logged_in_employee_role}
                />

                {/* Overdue Modal */}
                {this.state.showOverdueModal && (
                    <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" role="dialog">
                        <div className="modal-dialog" role="document">
                            <div className="modal-content">
                                <div className="modal-header" style={{ display: 'none' }}>
                                    <button type="button" className="close" onClick={this.closeModal}>
                                        <span aria-hidden="true">×</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <div className="row clearfix">
                                        <p>
                                            {this.state.isUnchecking 
                                                ? "Do you want to mark this task as pending?"
                                                : "Do you want to mark this task as completed?"}
                                        </p>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <Button
                                    label="Cancel"
                                    onClick={this.closeModal}
                                    className="btn-secondary"
                                    />

                                    <Button
                                    label="Confirm"
                                    onClick={this.handleUpdateTodo}
                                    className="btn-danger"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Todo Modal */}
                <TodoModal
                    isEdit={true}
                    show={this.state.showEditModal}
                    onClose={this.handleEditModalClose}
                    onSubmit={this.handleEditModalSubmit}
                    onChange={this.handleInputChangeForAddTodo}
                    formData={{
                        title: this.state.title,
                        due_date: this.state.due_date,
                        priority: this.state.priority,
                        selectedEmployeeId: this.state.selectedEmployeeId
                    }}
                    errors={this.state.errors}
                    loading={false}
                    modalId="editTodoModal"
                    employees={this.state.employees}
                    loggedInEmployeeRole={this.state.logged_in_employee_role}
                />
                {this.state.showEditModal && <div className="modal-backdrop fade show" />}

                {/* Delete Todo Modal */}
                <DeleteModal
                    show={showDeleteModal}
                    onConfirm={this.handleDeleteTodo}
                    onClose={this.handleDeleteModalClose} 
                    isLoading={this.state.ButtonLoading}
                    deleteBody="Are you sure you want to delete this todo?"
                    modalId="deleteTodoModal"
                />
                {showDeleteModal && <div className="modal-backdrop fade show" />}
            </>
        )
    }
}
const mapStateToProps = state => ({
    fixNavbar: state.settings.isFixNavbar
})

const mapDispatchToProps = dispatch => ({})
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TodoList));