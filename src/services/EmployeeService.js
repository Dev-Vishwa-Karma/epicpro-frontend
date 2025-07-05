import api from "../api/axios";

export const EmployeeService = {
    // Get all employees or a single employee based on role
    getEmployees: (role, userId = null) => {
        let url = `${process.env.REACT_APP_API_URL}/get_employees.php?action=view`;
        
        if (role === "admin" || role === "super_admin") {
            url += `&role=employee`;
        } else if (role === "employee" && userId) {
            url += `&user_id=${userId}`;
        }

        return api.get(url)
            .then(response => response.data)
            .catch(error => {
                throw error;
            });
    },

    // Get employee leaves with optional filters
    getEmployeeLeaves: (employeeId, fromDate = null, toDate = null) => {
        let url = `${process.env.REACT_APP_API_URL}/employee_leaves.php?action=view`;
        
        if (employeeId) {
            url += `&employee_id=${employeeId}`;
        }

        if (fromDate) {
            url += `&start_date=${fromDate}`;
        }

        if (toDate) {
            url += `&end_date=${toDate}`;
        }

        return api.get(url)
            .then(response => response.data)
            .catch(error => {
                throw error;
            });
    },

    // Get employee salary details
    getEmployeeSalaryDetails: (employeeId) => {
        return api.get(`${process.env.REACT_APP_API_URL}/employee_salary_details.php?action=view&employee_id=${employeeId}`)
            .then(response => response.data)
            .catch(error => {
                throw error;
            });
    },

    // Add employee leave
    addEmployeeLeave: (leaveData) => {
        const formData = new FormData();
        Object.keys(leaveData).forEach(key => {
            formData.append(key, leaveData[key]);
        });

        return api.post(`${process.env.REACT_APP_API_URL}/employee_leaves.php?action=add`, formData)
            .then(response => response.data)
            .catch(error => {
                throw error;
            });
    },

    // Update employee leave
    updateEmployeeLeave: (leaveId, leaveData) => {
        const formData = new FormData();
        Object.keys(leaveData).forEach(key => {
            formData.append(key, leaveData[key]);
        });

        return api.post(`${process.env.REACT_APP_API_URL}/employee_leaves.php?action=edit&id=${leaveId}`, formData)
            .then(response => response.data)
            .catch(error => {
                throw error;
            });
    },

    // Delete employee leave
    deleteEmployeeLeave: (leaveId) => {
        return api.delete(`${process.env.REACT_APP_API_URL}/employee_leaves.php?action=delete&id=${leaveId}`)
            .then(response => response.data)
            .catch(error => {
                throw error;
            });
    },

    // Delete employee
    deleteEmployee: (employeeId, loggedInUserId, loggedInUserRole) => {
        return api.post(`${process.env.REACT_APP_API_URL}/get_employees.php?action=delete`, {
            user_id: employeeId,
            logged_in_employee_id: loggedInUserId,
            logged_in_employee_role: loggedInUserRole,
        })
        .then(response => response.data)
        .catch(error => {
            throw error;
        });
    }
};