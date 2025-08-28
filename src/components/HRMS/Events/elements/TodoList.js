import React, { Component } from 'react';
import { getService } from '../../../../services/getService';
import EmployeeSelector from '../../../common/EmployeeSelector';
import ListSkeleton from '../../../common/skeletons/ListSkeleton';
import { shortformatDate } from '../../../../utils';

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
            <div className="todo-container mt-3" style={{ maxHeight: '250px', overflowY: 'auto' }}>
              <ul className="list-unstyled mb-0">
                {selectedEmployeeIdForTodo === '' ? (
                  <li className="text-center w-100 small">Select an employee to view the To-Do list</li>
                ) : todos.length > 0 ? (
                  todos.map((todo) => (
                    <li key={todo.id}>
                      <span className="custom-control-label" style={{fontSize:'15px'}}>{todo.title}</span>
                      <div style={{fontSize:'11px'}}>
                        {shortformatDate(todo.due_date)}
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
          )
        )}
      </div>
    );
  }
}

export default TodoList;