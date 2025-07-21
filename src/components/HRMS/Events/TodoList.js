import React, { Component } from 'react';
import { getService } from '../../../services/getService';
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
      employee_id:employeeId
		})
      .then((data) => {
        if (data.status === 'success' && Array.isArray(data.data)) {
          this.setState({ todos: data.data, loading: false });
        } else {
          this.setState({ todos: [], loading: false });
        }
      })
      .catch((error) => {
        console.error('Error fetching todos:', error);
        this.setState({ todos: [], loading: false });
      });
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
          <div className="form-group mt-3">
            <label htmlFor="employeeSelect" className="form-label font-weight-bold">
              Select Employee
            </label>
            <select
              name="selectedEmployeeIdForTodo"
              id="selectedEmployeeIdForTodo"
              className="form-control custom-select"
              value={selectedEmployeeIdForTodo}
              onChange={this.handleEmployeeSelection}
            >
              <option value="">Select an Employee</option>
                {employees
                  .filter(emp => emp.role !== 'admin' && emp.role !== 'super_admin') // Filter out admins
                  .map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.first_name} {employee.last_name}
                    </option>
                  ))}
            </select>
          </div>
        )}

        {loading ? (
          <div className="dimmer active mb-4 p-3 px-3">
            <div className="loader" />
          </div>
        ) : (
          Array.isArray(todos) && (
            <div className="todo-container mt-3" style={{ maxHeight: '250px', overflowY: 'auto' }}>
              <ul className="list-unstyled mb-0">
                {selectedEmployeeIdForTodo === '' ? (
                  <li className="text-center w-100 small">Select an employee to view the To-Do list</li>
                ) : todos.length > 0 ? (
                  todos.map((todo) => (
                    <li key={todo.id}>
                      <label className="custom-control custom-checkbox">
                        <input
                          type="checkbox"
                          className="custom-control-input"
                          name="example-checkbox1"
                          defaultValue="option1"
                        />
                        <span className="custom-control-label">{todo.title}</span>
                      </label>
                    </li>
                  ))
                ) : (
                  <li className="text-center w-100 small" style={{ color: '#dc3545' }}>
                    No todos available for this employee
                  </li>
                )}
              </ul>
            </div>
          )
        )}
      </div>
    );
  }
}

export default TodoList;