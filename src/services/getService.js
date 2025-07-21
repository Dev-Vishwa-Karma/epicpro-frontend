import api from "../api/axios";

export const getService = {
    //more Optimized code 
    getCall: (fileName, params = {}) => {
        let apiUrl = `${process.env.REACT_APP_API_URL}/${fileName}`;
        const queryParams = new URLSearchParams();

        // Only add params that are not null/undefined
        Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
        queryParams.append(key, value);
        }
        });

        if (queryParams.toString()) {
        apiUrl += `?${queryParams.toString()}`;
        }

        return api.get(apiUrl)
        .then(response => response.data)
        .catch(error => {
        throw error;
        });
    },

    // getCall: (1. folderName, 2. action, 3. userId, 4. logged_in_employee_id, 5. role, 6. from_date, 7. to_date, 8. is_timeline, 9. year, 10. employee_id , 11. event_type, 12. status, 13. month, 14. statistics_visibility_status , 15. search, 16. client_id, 17. notification_id) => {
    //     let apiUrl = `${process.env.REACT_APP_API_URL}/${folderName}`;
    //     if(action){
    //        apiUrl += `?action=${action}`;
    //     }
    //     if (role) {
    //         apiUrl += `&role=${role}`;
    //     } 
    //     if (userId) {
    //         apiUrl += `&user_id=${userId}`;
    //     }
    //     if (logged_in_employee_id) {
    //         apiUrl += `&logged_in_employee_id=${logged_in_employee_id}`;
    //     }  
    //     if (is_timeline) {
    //         apiUrl += `&is_timeline=${is_timeline}`;
    //     } 
    //     if (from_date) {
    //         apiUrl += `&from_date=${from_date}`;
    //     }   
    //     if (to_date) {
    //         apiUrl += `&to_date=${to_date}`;
    //     }   
    //     if (year) {
    //         apiUrl += `&year=${year}`;
    //     }  
    //     if (employee_id) {
    //         apiUrl += `&employee_id=${employee_id}`;
    //     } 
    //     if (event_type) {
    //         apiUrl += `&event_type=${event_type}`;
    //     } 
    //     if (status) {
    //         apiUrl += `&status=${status}`;
    //     } 
    //     if (month) {
    //         apiUrl += `&month=${month}`;
    //     } 
    //     if (statistics_visibility_status) {
    //          apiUrl += `&statistics_visibility_status=${statistics_visibility_status}`;
    //     }
    //     if (search) {
    //          apiUrl += `&search=${search}`;
    //     }
    //     if (client_id) {
    //          apiUrl += `&client_id=${client_id}`;
    //     }
    //     if (notification_id) {
    //          apiUrl += `&notification_id=${notification_id}`;
    //     }

    //     return api.get(apiUrl)
    //     .then(response => response.data)
    //     .catch(error => {
    //         throw error;
    //     });
      
    // },

    addCall: (folderName, action, formData) => {
        return api.post(`${process.env.REACT_APP_API_URL}/${folderName}?action=${action}`, formData)
            .then(response => response.data)
            .catch(error => { throw error; });
    },

    editCall: (folderName, action, data, id, user_id, client_id, notification_id) => {
        let apiUrl = `${process.env.REACT_APP_API_URL}/${folderName}?action=${action}`;

        if (id) {
            apiUrl += `&id=${id}`;
        }

        if (user_id) {
            apiUrl += `&user_id=${user_id}`;
        }

        if (client_id) {
            apiUrl += `&client_id=${client_id}`;
        }

        if (notification_id) {
            apiUrl += `&notification_id=${notification_id}`;
        }


        return api.post(apiUrl, data) 
            .then(response => response.data)
            .catch(error => {
                throw error;
            });
    },

    deleteCall: (folderName, action, id, user_id, loggedInUserRole, loggedInUserId) => {
        let apiUrl = `${process.env.REACT_APP_API_URL}/${folderName}?action=${action}`;  
        if (id) {
            apiUrl += `&id=${id}`;
        } 
        if (user_id) {
            apiUrl += `&user_id=${user_id}`;
        } 
        if (loggedInUserRole) {
            apiUrl += `&logged_in_employee_role=${loggedInUserRole}`;
        }  
        if (loggedInUserId) {
            apiUrl += `&logged_in_employee_id=${loggedInUserId}`;
        } 

        return api.delete(apiUrl)
        .then(response => response.data)
        .catch(error => {
            throw error;
        });
    },
};
