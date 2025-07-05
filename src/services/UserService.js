import api from "../api/axios";

const UserService = {
  // Fetch all users
  getAllUsers: () => {
    return api.get(`${process.env.REACT_APP_API_URL}/get_employees.php`, {
      params: { action: 'view' }
    })
      .then(response => response.data)
      .catch(error => { throw error; });
  },

  // Fetch departments
  getDepartments: () => {
    return api.get(`${process.env.REACT_APP_API_URL}/departments.php`)
      .then(response => response.data)
      .catch(error => { throw error; });
  },

  // Fetch admin users
  getAdmins: () => {
    return api.get(`${process.env.REACT_APP_API_URL}/get_employees.php`, {
      params: { action: 'view', role: 'admin' }
    })
      .then(response => response.data)
      .catch(error => { throw error; });
  },

  // Add user
  addUser: (formData) => {
    return api.post(`${process.env.REACT_APP_API_URL}/get_employees.php?action=add`, formData)
      .then(response => response.data)
      .catch(error => { throw error; });
  },

  // Update user
  updateUser: (userId, formData) => {
    return api.post(`${process.env.REACT_APP_API_URL}/get_employees.php?action=edit&user_id=${userId}`, formData)
      .then(response => response.data)
      .catch(error => { throw error; });
  },

  // Delete user
  deleteUser: (payload) => {
    return api.delete(`${process.env.REACT_APP_API_URL}/get_employees.php?action=delete`, {
      headers: { 'Content-Type': 'application/json' },
      data: payload
    })
      .then(response => response.data)
      .catch(error => { throw error; });
  },

  // Search users
  searchUsers: (search) => {
    return api.get(`${process.env.REACT_APP_API_URL}/get_employees.php`, {
      params: { action: 'view', role: 'admin', search }
    })
      .then(response => response.data)
      .catch(error => { throw error; });
  }
};

export default UserService;
