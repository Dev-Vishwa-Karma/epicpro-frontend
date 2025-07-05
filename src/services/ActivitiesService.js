import api from "../api/axios";

export const ActivitiesService = {

    getActivitiesDetails: () => {
        return api.get(`${process.env.REACT_APP_API_URL}/get_employees.php?action=view&role=employee`)
            .then(response => response.data)
            .catch(error => {
                throw error;
        });
    },

    getBreakStatus: (userId) => {
        return api.get(`${process.env.REACT_APP_API_URL}/activities.php?action=get_break_status&user_id=${userId}`)
            .then(response => response.data)
            .catch(error => {
                throw error;
            });
    },

    getActivitiesTimeline: (params) => {
        let apiUrl = `${process.env.REACT_APP_API_URL}/activities.php?action=view&is_timeline=true`;
        if (params && params.user_id) apiUrl += `&user_id=${params.user_id}`;
        if (params && params.from_date) apiUrl += `&from_date=${params.from_date}`;
        if (params && params.to_date) apiUrl += `&to_date=${params.to_date}`;
        return api.get(apiUrl)
            .then(response => response.data)
            .catch(error => { throw error; });
    },

    addActivityByUser: (formData) => {
        return api.post(`${process.env.REACT_APP_API_URL}/activities.php?action=add-by-user`, formData)
            .then(response => response.data)
            .catch(error => { throw error; });
    },

    breakCalculation: (userId) => {
        return api.get(`${process.env.REACT_APP_API_URL}/activities.php?action=break_calculation&user_id=${userId}`)
            .then(response => response.data)
            .catch(error => { throw error; });
    },

    addActivityByAdmin: (formData) => {
        return api.post(`${process.env.REACT_APP_API_URL}/activities.php?action=add-by-admin`, formData)
            .then(response => response.data)
            .catch(error => { throw error; });
    },
};
