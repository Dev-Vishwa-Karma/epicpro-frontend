import api from "../api/axios";

export const ViewEmployeeService = {
    fetchEmployeeDetails: (employeeId) => {
        return api.get(`${process.env.REACT_APP_API_URL}/get_employees.php?action=view&user_id=${employeeId}`)
            .then(response => response.data)
            .catch(error => { throw error; });
    },

    getEmployeeGallery: (employeeId) => {
        return api.get(`${process.env.REACT_APP_API_URL}/gallery.php?action=view&id=${employeeId}`)
            .then(response => response.data)
            .catch(error => { throw error; });
    },

    uploadGalleryImage: (employeeId, file) => {
        const uploadImageData = new FormData();
        uploadImageData.append('employee_id', employeeId);
        uploadImageData.append('created_by', window.user.id);
        uploadImageData.append('images[]', file);
        return api.post(`${process.env.REACT_APP_API_URL}/gallery.php?action=add`, uploadImageData)
            .then(response => response.data)
            .catch(error => { throw error; });
    },

    uploadProfileImage: (employeeId, croppedImage) => {
        const uploadImageData = new FormData();
        uploadImageData.append('employee_id', employeeId);
        uploadImageData.append('created_by', window.user.id);
        uploadImageData.append('image', croppedImage);
        return api.post(`${process.env.REACT_APP_API_URL}/get_employees.php?action=profile-update`, uploadImageData)
            .then(response => response.data)
            .catch(error => { throw error; });
    },

    fetchGalleryImageDataUrl: async (url) => {
        // This function returns a data URL for a gallery image
        const response = await fetch(`${process.env.REACT_APP_API_URL}/gallery.php?action=view_image&img=${url}`);
        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    },
};
