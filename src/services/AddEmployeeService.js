import api from "../api/axios";

export const AddEmployeeService = {
    addEmployeeServiceData: (formData) => {
        return api.post(`${process.env.REACT_APP_API_URL}/get_employees.php?action=add`, formData)
            .then(response => response.data)
            .catch(error => { throw error; });
    },

    getDepartmentsList: () => {
        return api.get(`${process.env.REACT_APP_API_URL}/departments.php`)
            .then(response => response.data)
            .catch(error => { throw error; });
    }
};
