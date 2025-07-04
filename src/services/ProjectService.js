import api from "../api/axios";

export const ProjectService = {

    getProjects: () => {
        return api.get(`${process.env.REACT_APP_API_URL}/projects.php?action=view&logged_in_employee_id=${window.user.id}&role=${window.user.role}`)
            .then(response => response.data)
            .catch(error => {
                throw error;
        });
    }
};
