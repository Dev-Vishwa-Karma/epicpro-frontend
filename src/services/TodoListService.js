import api from "../api/axios";

const TodoListService = {
  getTodos: (employeeId, role) => {
    return api.get(`${process.env.REACT_APP_API_URL}/project_todo.php`, {
      params: { action: 'view', logged_in_employee_id: employeeId, role }
    })
      .then(response => response.data)
      .catch(error => { throw error; });
  },

  getEmployees: () => {
    return api.get(`${process.env.REACT_APP_API_URL}/get_employees.php`, {
      params: { action: 'view', role: 'employee' }
    })
      .then(response => response.data)
      .catch(error => { throw error; });
  },

  addTodo: (formData) => {
    return api.post(`${process.env.REACT_APP_API_URL}/project_todo.php?action=add`, formData)
      .then(response => response.data)
      .catch(error => { throw error; });
  },

  updateTodo: (formData) => {
    return api.post(`${process.env.REACT_APP_API_URL}/project_todo.php?action=update`, formData)
      .then(response => response.data)
      .catch(error => { throw error; });
  }
};

export default TodoListService;
