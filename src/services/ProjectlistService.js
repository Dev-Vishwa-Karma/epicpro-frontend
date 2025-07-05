import api from "../api/axios";

const ProjectlistService = {
  // Fetch employees
  getEmployees: () => {
    return api.get(`${process.env.REACT_APP_API_URL}/get_employees.php`, {
      params: { action: 'view' }
    })
      .then(response => response.data)
      .catch(error => { throw error; });
  },

  // Fetch projects for a user/role
  getProjects: (employeeId, role) => {
    return api.get(`${process.env.REACT_APP_API_URL}/projects.php`, {
      params: { action: 'view', logged_in_employee_id: employeeId, role }
    })
      .then(response => response.data)
      .catch(error => { throw error; });
  },

  // Fetch clients
  getClients: () => {
    return api.get(`${process.env.REACT_APP_API_URL}/clients.php`, {
      params: { action: 'view' }
    })
      .then(response => response.data)
      .catch(error => { throw error; });
  },

  // Add project
  addProject: (formData) => {
    return api.post(`${process.env.REACT_APP_API_URL}/projects.php?action=add`, formData)
      .then(response => response.data)
      .catch(error => { throw error; });
  }
};

export default ProjectlistService;
