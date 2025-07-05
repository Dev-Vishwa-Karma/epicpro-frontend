import api from "../api/axios";

export const DepartmentService = {

    getDepartmentsDetails: () => {
        return api.get(`${process.env.REACT_APP_API_URL}/departments.php?action=view`)
            .then(response => response.data)
            .catch(error => {
                throw error;
        });
    },

    addDepartment: (formData) => {
        return api.post(`${process.env.REACT_APP_API_URL}/departments.php?action=add`, formData)
            .then(response => response.data)
            .catch(error => { throw error; });
    },

    editDepartment: (id, data) => {
        return api.post(`${process.env.REACT_APP_API_URL}/departments.php?action=edit&id=${id}`, data)
            .then(response => response.data)
            .catch(error => { throw error; });
    },

    deleteDepartment: (id) => {
        return api.delete(`${process.env.REACT_APP_API_URL}/departments.php?action=delete&id=${id}`)
            .then(response => response.data)
            .catch(error => { throw error; });
    },
};
