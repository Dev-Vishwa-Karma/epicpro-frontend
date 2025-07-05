import api from "../api/axios";

export const EditEmployeeService = {
    getEmployeeDetails: (employeeId) => {
        return api.get(`${process.env.REACT_APP_API_URL}/get_employees.php?action=view&user_id=${employeeId}`)
            .then(response => response.data)
            .catch(error => { throw error; });
    },

    getDepartmentsList: () => {
        return api.get(`${process.env.REACT_APP_API_URL}/departments.php`)
            .then(response => response.data)
            .catch(error => { throw error; });
    },

    updateEmployee: (employeeId, formData) => {
        return api.post(`${process.env.REACT_APP_API_URL}/get_employees.php?action=edit&user_id=${employeeId}`, formData)
            .then(response => response.data)
            .catch(error => { throw error; });
    }
};
