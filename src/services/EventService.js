import api from "../api/axios";

export const EventService = {
    getEmployees: () => {
        return api.get(`${process.env.REACT_APP_API_URL}/get_employees.php?action=view&role=employee`)
            .then(response => response.data)
            .catch(error => { throw error; });
    },

    getEvents: (startDate, endDate) => {
        return api.get(`${process.env.REACT_APP_API_URL}/events.php?start_date=${startDate}&end_date=${endDate}`)
            .then(response => response.data)
            .catch(error => { throw error; });
    },

    addEvent: (formData) => {
        return api.post(`${process.env.REACT_APP_API_URL}/events.php?action=add`, formData)
            .then(response => response.data)
            .catch(error => { throw error; });
    },

    deleteEvent: (eventId) => {
        return api.get(`${process.env.REACT_APP_API_URL}/events.php?action=delete&event_id=${eventId}`)
            .then(response => response.data)
            .catch(error => { throw error; });
    },

    getWorkingHoursReports: (userId, fromDate, toDate) => {
        return api.get(`${process.env.REACT_APP_API_URL}/reports.php?user_id=${userId}&from_date=${fromDate}&to_date=${toDate}`)
            .then(response => response.data)
            .catch(error => { throw error; });
    },

    getTodos: (employeeId) => {
        return api.get(`${process.env.REACT_APP_API_URL}/project_todo.php?action=view&employee_id=${employeeId}`)
            .then(response => response.data)
            .catch(error => { throw error; });
    },

    getLeaveData: (employeeId, startDate, endDate) => {
        return api.get(`${process.env.REACT_APP_API_URL}/employee_leaves.php?action=view&start_date=${startDate}&end_date=${endDate}&employee_id=${employeeId}`)
            .then(response => response.data)
            .catch(error => { throw error; });
    },

    getAlternateSaturdays: (year) => {
        return api.get(`${process.env.REACT_APP_API_URL}/alternate_saturdays.php?action=view&year=${year}`)
            .then(response => response.data)
            .catch(error => { throw error; });
    },
};
