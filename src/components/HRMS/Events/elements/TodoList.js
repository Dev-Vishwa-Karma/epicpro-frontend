import React, { Component } from 'react';
import { getService } from '../../../../services/getService';
import EmployeeSelector from '../../../common/EmployeeSelector';
import ListSkeleton from '../../../common/skeletons/ListSkeleton';
import { formatDueLabel } from '../../../../utils';
import { withRouter } from 'react-router-dom';
import { appendDataToFormData } from '../../../../utils';
import { isOverduePending, filterUpToTomorrow } from '../../../../utils';

class TodoList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      todos: [],
      selectedEmployeeIdForTodo: '',
      loading: false,
    };
  }

  fetchTodos = (employeeId) => {
    if (!employeeId) {
      this.setState({ todos: [] });
      return;
    }

    this.setState({ loading: true });

    getService.getCall('project_todo.php', {
			action: 'view',
      employee_id:employeeId,
      status: 'pending'
		})
    .then(res => {
			if (res.status === 'success') {
				const list = Array.isArray(res.data) ? res.data : [];
				const filtered = filterUpToTomorrow(list);
				// Sort todos by due date (oldest first)
				const sortedTodos = filtered.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
				this.setState({ todos: sortedTodos, loading: false });
			} else {
				this.setState({ todos: [], loading: false });
			}
		})
		.catch(() => this.setState({ todos: [], loading: false }));
  };
  
  handleEmployeeSelection = (e) => {
    const selectedId = e.target.value;
    this.setState(
      {
        selectedEmployeeIdForTodo: selectedId,
        todos: [],
      },
      () => {
        if (selectedId) {
          this.fetchTodos(selectedId);
        }
      }
    );
  };

  handleCheckboxClick = (todo) => {
    const { logged_in_employee_role } = this.props;
    if (!(logged_in_employee_role === 'admin' || logged_in_employee_role === 'super_admin')) return;

    const isCompleted = String(todo.todoStatus).toLowerCase() === 'completed';
    const newStatus = isCompleted ? 'pending' : 'completed';

    const formData = new FormData();
    const data = {
      id: todo.id,
      status: newStatus,
      logged_in_employee_id: window.user?.id,
      logged_in_employee_role: window.user?.role,
      to_do_created_by: todo.created_by,
      to_do_created_for: todo.employee_id,
      logged_in_employee_name: todo.first_name
    };
    appendDataToFormData(formData, data);

    getService
      .addCall('project_todo.php', 'update_status', formData)
      .then((res) => {
        if (res.status === 'success') {
          // Refetch current employee's todos to reflect the update
          this.fetchTodos(this.state.selectedEmployeeIdForTodo);
        }
      })
      .catch((err) => console.error('Failed to update todo status', err));
  }

  render() {
    const { employees, logged_in_employee_role } = this.props;
    const { todos, selectedEmployeeIdForTodo, loading } = this.state;

    return (
      <div className="todo_list mt-4">
        {(logged_in_employee_role === 'admin' ||
          logged_in_employee_role === 'super_admin' ||
          (Array.isArray(todos) && todos.length > 0)) && (
          <h3 className="card-title">ToDo List</h3>
        )}

        {(logged_in_employee_role === 'admin' || logged_in_employee_role === 'super_admin') && (
          <EmployeeSelector
              allEmployeesData={employees}
              selectedEmployee={selectedEmployeeIdForTodo}
              handleEmployeeChange={this.handleEmployeeSelection}
              showAllInOption={false}
          />
        )}

        {loading ? (
          <ListSkeleton rows={todos.length} />
        ) : (
          Array.isArray(todos) && (
            <>
            <div className="todo-container mt-3" style={{ maxHeight: '250px', overflowY: 'auto' }}>
              <ul className="list-unstyled mb-0">
                {selectedEmployeeIdForTodo === '' ? (
                  <li className="text-center w-100 small">Select an employee to view the To-Do list</li>
                ) : todos.length > 0 ? (
                  todos.map((todo) => (
                    <li key={todo.id} className="d-flex align-items-center justify-content-between">
                      <div>
                        <div className="d-flex align-items-center">
                          {(logged_in_employee_role === 'admin' || logged_in_employee_role === 'super_admin') && (
                            <label className="custom-control custom-checkbox mb-0 mr-2">
                              <input
                                type="checkbox"
                                className="custom-control-input"
                                checked={String(todo.todoStatus).toLowerCase() === 'completed'}
                                onChange={() => this.handleCheckboxClick(todo)}
                              />
                              <span className="custom-control-label "></span>
                            </label>
                          )}
                          <span 
                            key={todo.id}
                            style={{ cursor: 'pointer', textDecoration: String(todo.todoStatus).toLowerCase() === 'completed' ? 'line-through' : 'none', opacity: String(todo.todoStatus).toLowerCase() === 'completed' ? 0.7 : 1 }}
                            onClick={() => {
                              const date = todo.due_date.slice(0, 10);
                              this.props.history.push(`/project-todo?employee_id=${todo.employee_id}&status=${todo.todoStatus}&date=${date}`);
                            }}
                           className="">{todo.title}</span>
                        </div>
                        <div>
                          {todo.due_date && (
                            <small className="text-muted ml-2">{formatDueLabel(todo.due_date)}</small>
                          )} &nbsp;
                          {/* <span className={`badge ml-0 ${
                            String(todo.priority).toLowerCase() === 'high' ? 'tag-danger'
                            : String(todo.priority).toLowerCase() === 'medium' ? 'tag-warning'
                            : 'tag-success'
                          }`}>
                            {(todo.priority || 'low').toString().toUpperCase()}
                          </span> */}
                          {isOverduePending(todo) && (
                            <span className="ml-2 mr-0 overdue-event-todo">Overdue</span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="text-center w-100 small" style={{ color: '#dc3545' }}>
                    No todos available for this employee
                  </li>
                )}
              </ul>
            </div>
            {/* {selectedEmployeeIdForTodo && todos.length > 0 && (
              <div className="mt-2 mb-2 text-right">
                <button
                  type="button"
                  className="btn p-0 view-all"
                  onClick={() => this.props.history.push(`/project-todo?employee_id=${selectedEmployeeIdForTodo}&status=pending&day=all`)}
                >
                  View All <span className="arrow"><i className='fa fa-arrow-right'></i></span>
                </button>
              </div>
            )} */}
            </>
          )
        )}
      </div>
    );
  }
}

export default withRouter(TodoList);