import React, { Component } from 'react'
import { connect } from 'react-redux';
import TodoModal from './TodoModal';
import DeleteModal from '../../common/DeleteModal';
import AlertMessages from '../../common/AlertMessages';
import { getService } from '../../../services/getService';
import NoDataRow from '../../common/NoDataRow';

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
            statusFilter: '',
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
            currentPageTodos: 1 //pagination
		}
	}

    componentDidMount() {
        const {role} = window.user;
		// Get the logged in user id
		this.setState({
			logged_in_employee_id: window.user.id,
            logged_in_employee_role: window.user.role
		});

		// Fetch todos using getService
		getService.getCall('project_todo.php', {
			action: 'view',
			logged_in_employee_id: window.user.id,
			role: window.user.role
		})
		.then(data => {
			if (data.status === 'success') {
				const todoData = data.data.map(t => ({ ...t, imageError: false }));
				this.setState({
					todos: todoData,
					loading: false
				});
			} else {
			  	this.setState({ message: data.message, loading: false });
			}
		})
		.catch(err => {
			this.setState({ message: 'Failed to fetch data', loading: false });
			console.error(err);
		});


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
		const { title, due_date, priority } = this.state;
        let errors = {};
        let isValid = true;

        // title validation (only letters and spaces)
        const namePattern = /^[a-zA-Z\s.,!?'-]+$/;
        if (!title.trim()) {
            errors.title = "Please enter a todo title.";
            isValid = false;
        } else if (!namePattern.test(title)) {
            errors.title = "Todo title can only contain letters, spaces, and punctuation.";
            isValid = false;
        }

        // Due date validation
        if (!due_date.trim()) {
            errors.due_date = "Please select a due date.";
            isValid = false;
        } else {
            const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
            if (due_date < today) {
                errors.due_date = "Due date cannot be in the past.";
                isValid = false;
            }
        }

        // Todo Priority validation
        if (!priority.trim()) {
            errors.priority = "Please select todo priority.";
            isValid = false;
        }

        // Employee selection validation (only for admin/super_admin)
        // if ((logged_in_employee_role === "admin" || logged_in_employee_role === "super_admin") && !selectedEmployeeId.trim()) {
        //     errors.selectedEmployeeId = "Please select an employee to assign todo.";
        //     isValid = false;
        // }

        this.setState({ errors });
        return isValid;
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
        addTodoFormData.append('employee_id', employee_id);
        addTodoFormData.append('title', title);
        addTodoFormData.append('due_date', due_date);
        addTodoFormData.append('priority', priority);
        addTodoFormData.append('logged_in_employee_id', logged_in_employee_id);
        addTodoFormData.append('logged_in_employee_role', logged_in_employee_role);

        // API call to add todo using getService
        getService.addCall('project_todo.php', 'add', addTodoFormData)
        .then((data) => {
            if (data.status === 'success') {
                // Fetch the updated todo list
                getService.getCall('project_todo.php', {
                    action: 'view',
                    logged_in_employee_id: window.user.id,
                    role: window.user.role
                })
                .then(updatedData => {
                    if (updatedData.status === 'success') {
                        this.setState({
                            todos: updatedData.data,
                            title: "",
                            due_date: "",
                            priority: "",
                            selectedEmployeeId: "",
                            errors: {},
                            successMessage: "Todo added successfully!",
                            showSuccess: true,
                            showAddTodoModal: false
                        });
                    } else {
                        this.setState({
                            errorMessage: "Todo added but failed to refresh the list.",
                            showError: true,
                        });
                    }
                })
                .catch(err => {
                    console.error(err);
                    this.setState({
                        errorMessage: "Todo added but failed to refresh the list.",
                        showError: true,
                    });
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
            if (todo.todoStatus === 'completed') {
                // If todo is completed, unchecking will set to pending
                this.setState({ 
                    showOverdueModal: true, 
                    selectedTodo: todo,
                    isUnchecking: true 
                });
            } else {
                // If todo is not completed, checking will set to completed
                this.setState({ 
                    showOverdueModal: true, 
                    selectedTodo: todo,
                    isUnchecking: false 
                });
            // }
        }
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
        formData.append('id', selectedTodo.id);
        formData.append('status', newStatus);
        formData.append('logged_in_employee_id', logged_in_employee_id);
        formData.append('logged_in_employee_role', logged_in_employee_role);
        formData.append('to_do_created_by', selectedTodo.created_by);
        formData.append('to_do_created_for', selectedTodo.employee_id);
        formData.append('logged_in_employee_name', selectedTodo.first_name);
        getService.addCall('project_todo.php', 'update_status', formData)
        .then(data => {
            if (data.status === 'success') {
                this.setState(prevState => ({
                    todos: prevState.todos.map(todo =>
                        todo.id === selectedTodo.id
                            ? { ...todo, todoStatus: newStatus }
                            : todo
                    ),
                    showOverdueModal: false,
                    selectedTodo: null,
                    isUnchecking: false,
                    successMessage: successMessage,
                    showSuccess: true
                }));
                
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

        if (!this.validateAddTodoForm()) {
            return; // Stop execution if validation fails
        }

        // Determine the correct employee_id
        const employee_id = (logged_in_employee_role === "admin" || logged_in_employee_role === "super_admin") 
        ? selectedEmployeeId 
        : logged_in_employee_id;

        const updateTodoFormData = new FormData();
        updateTodoFormData.append('todo_id', selectedTodo.id);
        updateTodoFormData.append('employee_id', employee_id);
        updateTodoFormData.append('title', title);
        updateTodoFormData.append('due_date', due_date);
        updateTodoFormData.append('priority', priority);
        updateTodoFormData.append('logged_in_employee_id', logged_in_employee_id);
        updateTodoFormData.append('logged_in_employee_role', logged_in_employee_role);

        // API call to update todo using getService
        getService.addCall('project_todo.php', 'edit', updateTodoFormData)
        .then((data) => {
            if (data.status === 'success') {
                // Update the todo list
                this.setState((prevState) => ({
                    todos: prevState.todos.map(todo =>
                        todo.id === selectedTodo.id
                            ? { ...todo, title, due_date, priority,  employee_id }
                            : todo
                    ),
                    title: "",
                    due_date: "",
                    priority: "",
                    selectedEmployeeId: "",
                    errors:{},
                    successMessage: "Todo updated successfully!",
                    showSuccess: true,
                    showEditModal: false,
                    selectedTodo: null
                }));

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
            this.setState(prevState => ({
                todos: prevState.todos.filter(todo => todo.id !== todoToDelete.id),
                showDeleteModal: false,
                todoToDelete: null,
                ButtonLoading: false,
                successMessage: "Todo deleted successfully!",
                showSuccess: true
            }));
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

    // Add handler for status filter
    handleStatusFilterChange = (e) => {
        this.setState({
            statusFilter: e.target.value,
            currentPageTodos: 1
        });
        // Make the GET API call when the component is mounted
		getService.getCall('project_todo.php', {
            action: 'view',
            logged_in_employee_id: window.user.id,
            role: window.user.role,
            status: e.target.value
        })
		.then(data => {
			if (data.status === 'success') {
				const todoData = data.data;
				this.setState({
					todos: todoData,
					loading: false
				});
			} else {
			  	this.setState({ message: data.message, loading: false });
			}
		})
		.catch(err => {
			this.setState({ message: 'Failed to fetch data', loading: false });
			console.error(err);
		});
    };

    render() {
        const { fixNavbar } = this.props;
        const { todos, loading, logged_in_employee_role, statusFilter, showSuccess, successMessage, showError, errorMessage,showDeleteModal } = this.state;

        // Pagination logic
        const dataPerPage = 10;
        const currentPageTodos = this.state.currentPageTodos || 1;
        const totalPagesTodos = Math.ceil((todos && todos.length ? todos.length : 0) / dataPerPage);
        const indexOfLastTodo = currentPageTodos * dataPerPage;
        const indexOfFirstTodo = indexOfLastTodo - dataPerPage;
        const currentTodos = todos && todos.length > 0 ? todos.slice(indexOfFirstTodo, indexOfLastTodo) : [];

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
                                                <div className="col-lg-4 col-md-12 col-sm-12" style={{backgroundColor:"transparent"}}>
                                                    <label htmlFor="year-selector" className='d-flex card-title mr-3 align-items-center'>
                                                        Status:
                                                    </label>
                                                    <select
                                                        id="statusFilter"
                                                        className="form-control"
                                                        value={statusFilter}
                                                        onChange={this.handleStatusFilterChange}
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="completed">Completed</option>
                                                        {/* Add more statuses if needed */}
                                                    </select>
                                                </div>
                                                <div className="col-lg-8 col-md-12 col-sm-12 text-right">
                                                    {(logged_in_employee_role === "admin" || logged_in_employee_role === "super_admin") && (
                                                        <button 
                                                            type="button" 
                                                            className="btn btn-primary btn-sm" 
                                                            onClick={() => this.setState({ showAddTodoModal: true })}
                                                        ><i className="fe fe-plus mr-2" />
                                                            Add New
                                                        </button>
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
                                        <div className="table-responsive todo_list">
                                            <table className="table table-hover table-striped table-vcenter mb-0">
                                                <thead>
                                                    <tr>
                                                        <th>
                                                                <p className="w150">Task</p>
                                                        </th>
                                                        <th className="w150 text-right">Due</th>
                                                        <th className="w100">Priority</th>
                                                     
                                                        <th className="w80"><i className="icon-user" /></th>
                                                           {(logged_in_employee_role === "admin" || logged_in_employee_role === "super_admin") && (
                                                        <th className="w150">Action</th>
                                                        )}
                                                    </tr>
                                                </thead>
                                                {loading ? (
                                                    <tbody>
                                                        <tr>
                                                            <td colSpan="5">
                                                                <div className="d-flex justify-content-center align-items-center" style={{ height: "150px" }}>
                                                                    <div className="loader" />
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                ) : (
                                                    <tbody>
                                                        {currentTodos && currentTodos.length > 0 ? (
                                                            currentTodos.map((todo, index) => (
                                                                <tr key={index+1} style={
                                                                    (logged_in_employee_role !== 'employee' && todo.hidden_for_employee)
                                                                        ? { textDecoration: 'line-through', opacity: 0.6 }
                                                                        : {}
                                                                }>
                                                                <td>
                                                                    <label className="custom-control custom-checkbox">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="custom-control-input"
                                                                            name="example-checkbox1"
                                                                            checked={todo.todoStatus === 'completed'}
                                                                            onChange={() => this.handleCheckboxClick(todo)}
                                                                        />
                                                                        <span className="custom-control-label">{todo.title}</span>
                                                                    </label>
                                                                </td>
                                                                <td className="text-right">
                                                                    {new Date(todo.due_date).toLocaleString("en-US", {
                                                                        day: "2-digit",
                                                                        month: "short",
                                                                        year: "numeric"
                                                                    }).replace(",", "")}
                                                                </td>
                                                                <td>
                                                                    <span className={`tag ml-0 mr-0 ${
                                                                        todo.priority === "high"
                                                                            ? "tag-danger"
                                                                            : todo.priority === "medium"
                                                                            ? "tag-warning"
                                                                            : "tag-success"
                                                                        }`}
                                                                    >
                                                                        {todo.priority.toUpperCase()}
                                                                    </span>
                                                                </td>
    
                                                                    <td>
                                                                        {todo.profile && !todo.imageError ? (
                                                                            <img
                                                                                src={`${process.env.REACT_APP_API_URL}/${todo.profile}`}
                                                                                className="avatar avatar-blue add-space"
                                                                                alt={`${todo.first_name || ''} ${todo.last_name || ''}`}
                                                                                data-toggle="tooltip"
                                                                                data-placement="top"
                                                                                title={`${todo.first_name || ''} ${todo.last_name || ''}`}
                                                                                style={{
                                                                                width: '40px',
                                                                                height: '40px',
                                                                                borderRadius: '50%',
                                                                                objectFit: 'cover',
                                                                                }}
                                                                                onError={e => {
																					e.target.src = '/assets/images/sm/avatar2.jpg';
																				}}
                                                                            />
                                                                        ) : (
                                                                            <span
                                                                                    className="avatar avatar-blue add-space"
                                                                                    data-toggle="tooltip"
                                                                                    data-placement="top"
                                                                                    title={`${todo.first_name || ''} ${todo.last_name || ''}`}
                                                                                    style={{
                                                                                    width: '40px',
                                                                                    height: '40px',
                                                                                    display: 'inline-flex',
                                                                                    alignItems: 'center',
                                                                                    justifyContent: 'center',
                                                                                    borderRadius: '50%',
                                                                                }}
                                                                            >
                                                                                {(todo.first_name ? todo.first_name.charAt(0) : '').toUpperCase()}
                                                                                {(todo.last_name ? todo.last_name.charAt(0) : '').toUpperCase()}
                                                                            </span>
                                                                            )}
                                                                    </td>
                                                                        {(logged_in_employee_role === "admin" || logged_in_employee_role === "super_admin") && (
                                                                    <td>
                                                                        <div className="d-flex align-items-center">
                                                                                <>
                                                                                            <button
                                                                                                    type="button"
                                                                                                    className="btn btn-icon"
                                                                                                    title="Edit"
                                                                                                
                                                                                                    onClick={() => this.handleEditTodo(todo)}
                                                                                                >
                                                                                                    <i className="fa fa-edit" />
                                                                                                </button>
                                                                                                <button
                                                                                                    type="button"
                                                                                                    className="btn btn-icon btn-sm js-sweetalert"
                                                                                                    title="Delete"
                                                                                                    onClick={() => {
                                                                                            this.setState({ 
                                                                                                showDeleteModal: true, 
                                                                                                todoToDelete: todo 
                                                                                            }, () => {
                                                                                                // Show the modal using Bootstrap
                                                                                                if (window.$) {
                                                                                                    window.$('#deleteTodoModal').modal('show');
                                                                                                }
                                                                                            });
                                                                                        }}
                                                                                                >
                                                                                                    <i className="fa fa-trash-o text-danger" />
                                                                                                </button>
                                                                                </>
                                                                        </div>
                                                                    </td>
                                                                    )}
                                                                </tr>
                                                            ))
                                                        ): (
                                                            <NoDataRow colSpan={7} message="Todo not available." />
                                                        )}
                                                    </tbody>
                                                )}
                                            </table>
                                        </div>
                                       {/* Pagination for todos */}
                                       {totalPagesTodos > 1 && (
                                         <nav aria-label="Page navigation">
                                           <ul className="pagination mb-0 justify-content-end">
                                             {/* Previous button */}
                                             <li className={`page-item ${currentPageTodos === 1 ? 'disabled' : ''}`}>
                                               <button className="page-link" onClick={() => this.setState({ currentPageTodos: currentPageTodos - 1 })}>
                                                 Previous
                                               </button>
                                             </li>
                                             {/* First page */}
                                             {currentPageTodos > 3 && (
                                               <>
                                                 <li className="page-item">
                                                   <button className="page-link" onClick={() => this.setState({ currentPageTodos: 1 })}>
                                                     1
                                                   </button>
                                                 </li>
                                                 {currentPageTodos > 4 && (
                                                   <li className="page-item disabled">
                                                     <span className="page-link">...</span>
                                                   </li>
                                                 )}
                                               </>
                                             )}
                                             {/* Page numbers */}
                                             {Array.from({ length: totalPagesTodos }, (_, i) => i + 1)
                                               .filter(pageNum => pageNum >= currentPageTodos - 1 && pageNum <= currentPageTodos + 1)
                                               .map(pageNum => {
                                                 if (pageNum > 0 && pageNum <= totalPagesTodos) {
                                                   return (
                                                     <li key={pageNum} className={`page-item ${currentPageTodos === pageNum ? 'active' : ''}`}>
                                                       <button className="page-link" onClick={() => this.setState({ currentPageTodos: pageNum })}>
                                                         {pageNum}
                                                       </button>
                                                     </li>
                                                   );
                                                 }
                                                 return null;
                                               })}
                                             {/* Ellipsis if needed */}
                                             {currentPageTodos < totalPagesTodos - 2 && (
                                               <>
                                                 {currentPageTodos < totalPagesTodos - 3 && (
                                                   <li className="page-item disabled">
                                                     <span className="page-link">...</span>
                                                   </li>
                                                 )}
                                                 <li className="page-item">
                                                   <button className="page-link" onClick={() => this.setState({ currentPageTodos: totalPagesTodos })}>
                                                     {totalPagesTodos}
                                                   </button>
                                                 </li>
                                               </>
                                             )}
                                             {/* Next button */}
                                             <li className={`page-item ${currentPageTodos === totalPagesTodos ? 'disabled' : ''}`}>
                                               <button className="page-link" onClick={() => this.setState({ currentPageTodos: currentPageTodos + 1 })}>
                                                 Next
                                               </button>
                                             </li>
                                           </ul>
                                         </nav>
                                       )}
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
                                    <button type="button" className="btn btn-secondary" onClick={this.closeModal}>
                                        Cancel
                                    </button>
                                    <button type="button" className="btn btn-danger" onClick={this.handleUpdateTodo}>
                                        Confirm
                                    </button>
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
export default connect(mapStateToProps, mapDispatchToProps)(TodoList);