import React, { Component } from 'react'
import { connect } from 'react-redux';
import AlertMessages from '../../common/AlertMessages';
import { getService } from '../../../services/getService';
import DeleteModal from '../../common/DeleteModal';
class Gallery extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedImages: [],
            images: [],
            filteredImages: [], // Store filtered images
            employees: [],
            logged_in_employee_id: null,
            selectedEmployeeId: '',
            isModalOpen: false,
            successMessage: '',
            showSuccess: false,
            errorMessage: '',
            showError: false,
            errors: {},
            searchQuery: "",
            currentPage: 1,
            imagesPerPage: 8,
            sortOrder: "asc", // Default to newest first
            loading: true,
            ButtonLoading: false,
            showDeleteModal: false,
            imageToDelete: null,
            deleteLoading: false,
        };
        this.fileInputRef = React.createRef();
    }

    componentDidMount() {
        const {role, id} = window.user;
        if (window.user?.id) {
            this.setState({
                logged_in_employee_id: window.user.id,
                sortOrder: "asc",
            });
        }
        // Check if user is admin or superadmin
        if (role === 'admin' || role === 'super_admin') {
            getService.getCall('get_employees.php', {
                action: 'view',
                role: 'employee', 
            })

            .then(data => {
                if (data.status === 'success') {
                    this.setState({
                        employees: data.status === 'success' ? data.data : [],
                        loading: false
                    });
                } else {
                    this.setState({ error: data.message, loading: false });
                }
            })
            .catch(err => {
                this.setState({ error: 'Failed to fetch employees data' });
                console.error(err);
            });
        }

        // Fetch gallery data
        const params = role === "employee" ? id : null;
        getService.getCall('gallery.php', {
            action: 'view',
            employee_id:params 
        })
            .then(data => {
                if (data.status === 'success') {
                    const sortedImages = this.sortImages(data.data, this.state.sortOrder);
                    this.setState({
                        images: sortedImages,
                        filteredImages: sortedImages,
                        loading: false
                    });
                } else {
                    this.setState({ message: data.message, loading: false });
                }
            })
            .catch(err => {
                this.setState({ message: 'Failed to fetch data', loading: false });
                console.error(err);
            });
    }

    openModal = () => {
        this.setState({
            isModalOpen: true,
        });
    };
    
    closeModal = () => {
        this.setState({
            isModalOpen: false,
            selectedImages: [],
            errorMessage: '',
            showError: false,
            errors: {}
        });

        // Reset file input field
        if (this.fileInputRef.current) {
            this.fileInputRef.current.value = "";
        }
    };

    // Remove the selected images from the upload images section
    removeImage = (index) => {
        const updatedImages = [...this.state.selectedImages];
        updatedImages.splice(index, 1);

        this.setState({ selectedImages: updatedImages }, () => {
            // If there are still images, update the file input with remaining images
            if (updatedImages.length > 0) {
                const dataTransfer = new DataTransfer();
                updatedImages.forEach((file) => dataTransfer.items.add(file));
                this.fileInputRef.current.files = dataTransfer.files;
            } else if (this.fileInputRef.current) {
                // Reset the input field when no images are left
                this.fileInputRef.current.value = "";
            }
        });
    };    

    handleImageSelection = (event) => {
        const files = Array.from(event.target.files);

        this.setState({
            selectedImages: files,
            errors: { ...this.state.errors, selectedImages: '' }
        });
    };

    handleEmployeeSelection = (e) => {
        const selectedEmployeeId = e.target.value;

        // Clear errors related to employee selection
        this.setState({
            selectedEmployeeId,
            errors: { ...this.state.errors, selectedEmployeeId: '' },
        });
    };

    submitImages = () => {
        const { selectedImages, logged_in_employee_id, selectedEmployeeId } = this.state;

        let errors = {};
        let isValid = true;

        // Determine employee_id based on role
        const userRole = window.user?.role;

        let employeeIdToSend = "";

        if (userRole === "admin" || userRole === "super_admin") {
            if (!selectedEmployeeId) {
                errors.selectedEmployeeId = "Please select an employee.";
                isValid = false;
            } else {
                employeeIdToSend = selectedEmployeeId;
            }
        } else if (userRole === "employee") {
            employeeIdToSend = logged_in_employee_id;
        }

        if (selectedImages.length === 0) {
            errors.selectedImages = "Please select at least one image.";
            isValid = false;
        }

        const validImageTypes = ["image/jpeg", "image/png", "image/webp"];
        const invalidFiles = selectedImages.filter(file => !validImageTypes.includes(file.type));

        if (invalidFiles.length > 0) {
            errors.selectedImages = "Only image files (JPG, PNG, WEBP) are allowed.";
            isValid = false;
        }

        // If validation fails, set error messages and return
        if (!isValid) {
            this.setState({ errors });
            return isValid;
        }

        // Prepare FormData to send images via AJAX
        const uploadImageData = new FormData();
        uploadImageData.append('employee_id', employeeIdToSend);
        uploadImageData.append('created_by', logged_in_employee_id);

        // Ensure only image files are processed
        selectedImages.forEach((image) => {
            if (validImageTypes.includes(image.type)) {
                uploadImageData.append('images[]', image);
            }
        });

        this.setState({ ButtonLoading: true });
        // Send images using fetch or axios
        getService.addCall('gallery.php','add',uploadImageData )
        .then(data => {
            if (data.status === "success") {
                // Reset file input field using ref
                if (this.fileInputRef.current) {
                    this.fileInputRef.current.value = "";
                }

                // Clear selected images and show success message
                this.setState(prevState => {
                    const updatedImages = [...prevState.images, ...data.data]; // Append new images
                    const sortedImages = this.sortImages(updatedImages, prevState.sortOrder); // Sort images
                    
                    return {
                        successMessage: data.message,
                        showSuccess: true,
                        selectedImages: [],
                        selectedEmployeeId: '',
                        images: sortedImages,
                        filteredImages: sortedImages // Apply sorting dynamically
                    };
                                });
                
                // Close the modal after successful upload
                this.closeModal();

                // Auto-hide success message after 3 seconds
                setTimeout(this.dismissMessages, 3000);
            } else {
                this.setState({
                    errorMessage: data.message || "Upload failed. Please try again.",
                    showError: true,
                });

                // Auto-hide error message after 3 seconds
                setTimeout(this.dismissMessages, 3000);
            }
            this.setState({ ButtonLoading: false });
        })
        .catch((error) => {
            console.error('Error:', error);
            this.setState({
                errorMessage: "An error occurred during the image upload.",
                showError: true,
            });

            // Auto-hide error message after 3 seconds
            setTimeout(this.dismissMessages, 3000);
            this.setState({ ButtonLoading: false });
        });
    };

    // Handle Sort Order Change
    handleSortChange = (event) => {
        const newSortOrder = event.target.value;
        this.setState(prevState => ({
            sortOrder: newSortOrder,
            filteredImages: this.sortImages(prevState.images, newSortOrder)
        }));
    };

    sortImages = (images, sortOrder) => {
        return [...images].sort((a, b) => {
            return sortOrder === "asc"
                ? new Date(b.created_at) - new Date(a.created_at)  // Newest first
                : new Date(a.created_at) - new Date(b.created_at); // Oldest first
        });
    };

    handleSearch = (event) => {
        const query = event.target.value.toLowerCase(); // Get search input
        this.setState({ searchQuery: query }, () => {
            const filtered = this.state.images.filter(image => {
                const fileName = image.url.split('/').pop().toLowerCase();
                return fileName.includes(query);
            });
            this.setState({ filteredImages: filtered });
        });
    };

    // Handle Pagination
    handlePageChange = (newPage) => {
        const totalPages = Math.ceil(this.state.filteredImages.length / this.state.imagesPerPage);
        
        if (newPage >= 1 && newPage <= totalPages) {
            this.setState({ currentPage: newPage });
        }
    };

     // Function to dismiss messages
    dismissMessages = () => {
        this.setState({
            showSuccess: false,
            successMessage: "",
            showError: false,
            errorMessage: "",
        });
    };

    // Open delete modal for image
    openDeleteModal = (image) => {
        this.setState({ showDeleteModal: true, imageToDelete: image });
    };

    // Close delete modal
    closeDeleteModal = () => {
        this.setState({ showDeleteModal: false, imageToDelete: null, deleteLoading: false });
    };

    // Confirm delete image
    confirmDeleteImage = () => {
    const { imageToDelete } = this.state;
    if (!imageToDelete) return;
    this.setState({ deleteLoading: true });
    
    // Get user info from window.user
    const { role: loggedInUserRole, id: loggedInUserId } = window.user || {};
    
    // Call delete with all required parameters
    getService.deleteCall('gallery.php', 'delete', imageToDelete.id, null, loggedInUserRole, loggedInUserId)
        .then(data => {
            if (data.status === 'success') {
                this.setState(prevState => {
                    const updatedImages = prevState.images.filter(img => img.id !== imageToDelete.id);
                    const updatedFiltered = prevState.filteredImages.filter(img => img.id !== imageToDelete.id);
                    return {
                        images: updatedImages,
                        filteredImages: updatedFiltered,
                        showDeleteModal: false,
                        imageToDelete: null,
                        deleteLoading: false,
                        successMessage: data.message,
                        showSuccess: true
                    };
                });
                setTimeout(this.dismissMessages, 3000);
            } else {
                this.setState({
                    errorMessage: data.message || 'Failed to delete image.',
                    showError: true,
                    deleteLoading: false
                });
                setTimeout(this.dismissMessages, 3000);
            }
        })
        .catch(err => {
            this.setState({
                errorMessage: 'An error occurred while deleting the image.',
                showError: true,
                deleteLoading: false
            });
            setTimeout(this.dismissMessages, 3000);
        });
};
    
    render() {
        const { fixNavbar } = this.props;
        const { sortOrder, filteredImages, currentPage, imagesPerPage, employees, loading, showSuccess, successMessage, showError, errorMessage, showDeleteModal, deleteLoading, imageToDelete } = this.state;

        // Pagination Logic
        const indexOfLastImage = currentPage * imagesPerPage;
        const indexOfFirstImage = indexOfLastImage - imagesPerPage;
        const currentImages = filteredImages.slice(indexOfFirstImage, indexOfLastImage);

        const totalPages = Math.ceil(filteredImages.length / imagesPerPage);
        return (
            <>
                <AlertMessages
                    showSuccess={showSuccess}
                    successMessage={successMessage}
                    showError={showError}
                    errorMessage={errorMessage}
                    setShowSuccess={(val) => this.setState({ showSuccess: val })}
                    setShowError={(val) => this.setState({ showError: val })}
                />
                {/* Delete Modal */}
                <DeleteModal
                    show={showDeleteModal}
                    onConfirm={this.confirmDeleteImage}
                    isLoading={deleteLoading}
                    onClose={this.closeDeleteModal}
                    deleteBody={
                        imageToDelete ? (
                            <span>Are you sure you want to delete this image?</span>
                        ) : ''
                    }
                    modalId="deleteGalleryImageModal"
                />
                <div className={`section-body ${fixNavbar ? "marginTop" : ""} mt-3`}>
                    <div className="container-fluid">
                        <div className="row row-cards">
                            <div className="col-12">
                                <div className="card">
                                    <div className="card-header">
                                        <div className="page-subtitle ml-0">
                                            {filteredImages.length > 0
                                            ? `${indexOfFirstImage + 1} - ${Math.min(indexOfLastImage, filteredImages.length)} of ${filteredImages.length} photos`
                                            : <span className="text-muted">Image not available</span>}
                                        </div>
                                        <div className="page-options d-flex">
                                            <select className="form-control custom-select w-auto" onChange={this.handleSortChange} value={sortOrder}>
                                                <option value="asc">Newest</option>
                                                <option value="desc">Oldest</option>
                                            </select>
                                            <div className="input-icon ml-2">
                                                <span className="input-icon-addon">
                                                    <i className="fe fe-search" />
                                                </span>
                                                <input type="text" className="form-control" placeholder="Search photo" value={this.state.searchQuery} onChange={this.handleSearch}/>
                                            </div>
                                            <button type="button" className="btn btn-primary ml-2" onClick={this.openModal}>
                                                Upload New
                                            </button>
                                            <div
                                                className={`modal fade ${this.state.isModalOpen ? 'show' : ''}`}
                                                id="uploadImageModal"
                                                tabIndex={-1}
                                                role="dialog"
                                                aria-labelledby="uploadImageModalLabel"
                                                aria-hidden={!this.state.isModalOpen}
                                                style={{ display: this.state.isModalOpen ? 'block' : 'none', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                                            >
                                                <div className="modal-dialog" role="document" aria-hidden="true">
                                                    <div className="modal-content">
                                                        <div className="modal-header">
                                                            <h5 className="modal-title" id="uploadImageModalLabel">
                                                                Upload Images
                                                            </h5>
                                                            <button type="button" className="close" aria-label="Close" onClick={this.closeModal}>
                                                                <span aria-hidden="true">&times;</span>
                                                            </button>
                                                        </div>
                                                        <div className="modal-body">
                                                            {/* Success and Error Messages */}
                                                            {/* {this.state.showSuccess && (
                                                                <div className="alert alert-success">{this.state.successMessage}</div>
                                                            )} */}
                                                            
                                                            {/* Employee Selection Section */}
                                                            {(window.user?.role === "admin" || window.user?.role === "super_admin") && (
                                                                <div className="mt-3">
                                                                    <label htmlFor="employeeSelect" className="form-label">Select Employee</label>
                                                                    <select
                                                                        id="employeeSelect"
                                                                        className="form-control"
                                                                        value={this.state.selectedEmployeeId}
                                                                        onChange={this.handleEmployeeSelection}
                                                                    >
                                                                        <option value="">Select an Employee</option>
                                                                        {employees.map((employee) => (
                                                                            <option key={employee.id} value={employee.id}>
                                                                                {employee.first_name} {employee.last_name}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                    {this.state.errors.selectedEmployeeId && (
                                                                        <small className={`invalid-feedback ${this.state.errors.selectedEmployeeId ? 'd-block' : ''}`}>{this.state.errors.selectedEmployeeId}</small>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* File Input */}
                                                            <div className="mt-3">
                                                                <label htmlFor="image" className="form-label">Select Image</label>
                                                                <input
                                                                    type="file"
                                                                    onChange={this.handleImageSelection}
                                                                    className="form-control"
                                                                    multiple
                                                                    ref={this.fileInputRef}
                                                                />
                                                            </div>
                                                            {/* Show error message if an invalid file is selected */}
                                                            {this.state.errors.selectedImages && (
                                                                <small className={`invalid-feedback ${this.state.errors.selectedImages ? 'd-block' : ''}`}>{this.state.errors.selectedImages}</small>
                                                            )}

                                                            {/* Preview Section */}
                                                            {this.state.selectedImages.length > 0 && (
                                                                <div className="mt-3">
                                                                    <p>Selected Images:</p>
                                                                    <div className="d-flex flex-wrap">
                                                                        {this.state.selectedImages.map((image, index) => (
                                                                            <div key={index} className="position-relative m-2">
                                                                                <img
                                                                                    src={URL.createObjectURL(image)}
                                                                                    alt="Preview"
                                                                                    className="img-thumbnail"
                                                                                    style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                                                                                />
                                                                                <button
                                                                                    className="btn btn-danger btn-sm position-absolute"
                                                                                    style={{ top: '-5px', right: '-5px', borderRadius: '50%' }}
                                                                                    onClick={() => this.removeImage(index)}
                                                                                >
                                                                                    &times;
                                                                                </button>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="modal-footer">
                                                            <button type="button" className="btn btn-secondary" onClick={this.closeModal}>
                                                                Cancel
                                                            </button>
                                                            <button type="button" className="btn btn-primary" onClick={this.submitImages} disabled={this.state.ButtonLoading}>
                                                                {this.state.ButtonLoading ? (
                                                                    <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                                                                ) : null}
                                                                Upload Images
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Images listing */}
                        <div className="row row-cards">
                            {loading && ( // Show Loader while fetching images
                                <div className="col-12">
                                    <div className="card p-3 d-flex align-items-center justify-content-center" style={{ height: '300px' }}>
                                        <div className="dimmer active">
                                            <div className="loader" />
                                        </div>
                                    </div>
                                </div>
                            )}
            
                            {/* {!loading && window.user?.role === "employee" && (
                                <div className="col-12">
                                    <div className="card p-3 d-flex align-items-center justify-content-center" style={{ height: '300px' }}>
                                        <span className="text-danger fw-bold">Access Denied</span>
                                    </div>
                                </div>
                            )} */}
                            
                            {!loading && filteredImages.length > 0 && ( // If not employee, show images if available
                                currentImages.map((image, index) => (
                                    <div className="col-sm-6 col-lg-3" key={image.id || index}>
                                        <div className="card p-3 position-relative">
                                            {/* Delete Icon */}
                                            <button
                                                type="button"
                                                className="btn btn-link p-0 position-absolute"
                                                style={{ top: '1px', right: '4px', zIndex: 2 }}
                                                title="Delete Image"
                                                onClick={() => this.openDeleteModal(image)}
                                            >
                                                <i className="fa fa-trash " style={{ fontSize: '1rem', color:'red' }}></i>
                                            </button>
                                            <img src={`${process.env.REACT_APP_API_URL}/${image.url}`} alt="Gallery" className="rounded" />
                                        </div>
                                    </div>
                                ))
                            )}
                            
                            {!loading && filteredImages.length === 0 && (
                                <div className="col-12">
                                    <div className="card p-3 d-flex align-items-center justify-content-center" style={{ height: '300px' }}>
                                        <span>Image not available</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Only show pagination if there are images */}
                        {filteredImages.length > 0 && totalPages > 1 && (
                            <nav aria-label="Page navigation">
                                <ul className="pagination mb-0 justify-content-end">
                                    {/* Previous button */}
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={() => this.handlePageChange(currentPage - 1)}>
                                            Previous
                                        </button>
                                    </li>

                                    {/* First page */}
                                    {currentPage > 3 && (
                                        <>
                                            <li className="page-item">
                                                <button className="page-link" onClick={() => this.handlePageChange(1)}>
                                                    1
                                                </button>
                                            </li>
                                            {currentPage > 4 && (
                                                <li className="page-item disabled">
                                                    <span className="page-link">...</span>
                                                </li>
                                            )}
                                        </>
                                    )}

                                    {/* Page numbers */}
                                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                                        .filter(pageNum => pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                        .map(pageNum => {
                                            if (pageNum > 0 && pageNum <= totalPages) {
                                                return (
                                                    <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                                                        <button className="page-link" onClick={() => this.handlePageChange(pageNum)}>
                                                            {pageNum}
                                                        </button>
                                                    </li>
                                                );
                                            }
                                            return null;
                                        })}

                                    {/* Ellipsis if needed */}
                                    {currentPage < totalPages - 2 && (
                                        <>
                                            {currentPage < totalPages - 3 && (
                                                <li className="page-item disabled">
                                                    <span className="page-link">...</span>
                                                </li>
                                            )}
                                            <li className="page-item">
                                                <button className="page-link" onClick={() => this.handlePageChange(totalPages)}>
                                                    {totalPages}
                                            </button>
                                        </li>
                                        </>
                                    )}

                                    {/* Next button */}
                                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={() => this.handlePageChange(currentPage + 1)}>
                                            Next
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        )}
                    </div>
                </div>
            </>
        )
    }
}
const mapStateToProps = state => ({
    fixNavbar: state.settings.isFixNavbar
})

const mapDispatchToProps = dispatch => ({})
export default connect(mapStateToProps, mapDispatchToProps)(Gallery);