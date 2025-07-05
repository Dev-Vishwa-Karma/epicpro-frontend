import api from "../api/axios";

export const CalendarWithTabService = {
    getDepartmentsList: () => {
        return api.get(`${process.env.REACT_APP_API_URL}/departments.php`)
            .then(response => response.data)
            .catch(error => { throw error; });
    },

    getEmployeeDetails: (employeeId) => {
        return api.get(`${process.env.REACT_APP_API_URL}/get_employees.php?action=view&user_id=${employeeId}`)
            .then(response => response.data)
            .catch(error => { throw error; });
    },

    getActivities: (employeeId) => {
        return api.get(`${process.env.REACT_APP_API_URL}/activities.php?user_id=${employeeId}`, 'activities')
            .then(response => response.data)
            .catch(error => { throw error; });
    },

    getReports: (employeeId, fromDate, toDate) => {
        return api.get(`${process.env.REACT_APP_API_URL}/reports.php?user_id=${employeeId}&from_date=${fromDate}&to_date=${toDate}`)
            .then(response => response.data)
            .catch(error => { throw error; });
    },

    getLeaves: (employeeId) => {
        return api.get(`${process.env.REACT_APP_API_URL}/employee_leaves.php?employee_id=${employeeId}`)
            .then(response => response.data)
            .catch(error => { throw error; });
    },

    getAlternateSaturdays: (year) => {
        return api.get(`${process.env.REACT_APP_API_URL}/alternate_saturdays.php?action=view&year=${year}`)
            .then(response => response.data)
            .catch(error => { throw error; });
    },

    saveProfile: (userId, formData) => {
        return api.post(`${process.env.REACT_APP_API_URL}/get_employees.php?action=edit&user_id=${userId}`, formData)
            .then(response => response.data)
            .catch(error => { throw error; });
    }
};
