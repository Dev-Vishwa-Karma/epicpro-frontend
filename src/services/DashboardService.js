import api from "../api/axios";

export const DashboardService = {

    getDashboardDetails: () => {
        return api.get(`${process.env.REACT_APP_API_URL}/dashboard.php`)
            .then(response => response.data)
            .catch(error => {
                throw error;
        });
    }
};
