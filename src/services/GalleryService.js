import api from '../api/axios';

export const GalleryService = {
    // Fetch gallery images
    getGalleryImages: (role, id) => {
        let params = { action: 'view' };
        if (role === 'employee' && id) {
            params.id = id;
        }
        
        return api.get(`${process.env.REACT_APP_API_URL}/gallery.php`, { params })
            .then(response => response.data)
            .catch(error => {
                console.error('Error fetching gallery images:', error);
                throw error;
            });
    },

    // Fetch employees (for admin/super_admin)
    getEmployees: () => {
        return api.get(`${process.env.REACT_APP_API_URL}/get_employees.php`, {
            params: { action: 'view', role: 'employee' }
        })
        .then(response => response.data)
        .catch(error => {
            console.error('Error fetching employees:', error);
            throw error;
        });
    },

    // Upload images to gallery
    uploadImages: (selectedImages, employeeId, createdBy) => {
        const uploadImageData = new FormData();
        uploadImageData.append('employee_id', employeeId);
        uploadImageData.append('created_by', createdBy);
        
        // Ensure only image files are processed
        const validImageTypes = ["image/jpeg", "image/png", "image/webp"];
        selectedImages.forEach((image) => {
            if (validImageTypes.includes(image.type)) {
                uploadImageData.append('images[]', image);
            }
        });

        return api.post(`${process.env.REACT_APP_API_URL}/gallery.php?action=add`, uploadImageData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(response => response.data)
        .catch(error => {
            console.error('Error uploading gallery images:', error);
            throw error;
        });
    }
};

