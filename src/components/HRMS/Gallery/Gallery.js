import React, { Component } from 'react'
import { connect } from 'react-redux';
import AlertMessages from '../../common/AlertMessages';
import { getService } from '../../../services/getService';
import DeleteModal from '../../common/DeleteModal';
import BlankState from '../../common/BlankState';
import ImageModal from './ImageModal';
import Pagination from '../../common/Pagination';
import { validateFields } from '../../common/validations';
import ImageUploadModal from './ImageUploadModal';
import GallerySkeleton from '../../common/skeletons/GallerySkeleton';
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
            sortOrder: "desc", // Default to newest first
            loading: true,
            ButtonLoading: false,
            showDeleteModal: false,
            imageToDelete: null,
            deleteLoading: false,
            // Modal for image preview
            showImageModal: false,
            selectedImageForModal: null,
            downloadLoading: false,
        };
        this.fileInputRef = React.createRef();
    }

    fetchImages = () => {
        const { sortOrder } = this.state;
        const { role, id } = window.user;
        const params = role === "employee" ? id : null;
        this.setState({ loading: true });
        getService.getCall('gallery.php', {
            action: 'view',
            user_id: params,
            sortOrder: sortOrder
        })
        .then(data => {
            if (data.status === 'success') {
                this.setState({
                    images: data.data,
                    filteredImages: data.data,
                    loading: false
                });
            } else {
                this.setState({ loading: false });
            }
        })
        .catch(() => {
            this.setState({ loading: false });
        });
    };

    handleSortChange = (event) => {
        const newSortOrder = event.target.value;
        this.setState({ sortOrder: newSortOrder }, () => {
            this.fetchImages();
        });
    };

    componentDidMount() {
        const {role, id} = window.user;
        if (window.user?.id) {
            this.setState({
                logged_in_employee_id: window.user.id,
                sortOrder: "desc",
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
        // Fetch gallery data with sortOrder
        this.fetchImages();
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

        // Determine employee_id based on role
        const userRole = window.user?.role;
        let employeeIdToSend = "";

        // Apply Validation component
        const validationSchema = [
            { 
                name: 'selectedEmployeeId', 
                value: selectedEmployeeId, 
                required: (userRole === "admin" || userRole === "super_admin"), 
                messageName: 'Employee selection',
                customValidator: (val) => {
                    if ((userRole === "admin" || userRole === "super_admin") && !val) {
                        return "Please select an employee.";
                    }
                    return undefined;
                }
            },
            { 
                name: 'selectedImages', 
                value: selectedImages, 
                required: true, 
                messageName: 'Image selection',
                customValidator: (val) => {
                    if (!val || val.length === 0) {
                        return "Please select at least one image.";
                    }
                    
                    const validImageTypes = ["image/jpeg", "image/png", "image/webp"];
                    const invalidFiles = val.filter(file => !validImageTypes.includes(file.type));
                    
                    if (invalidFiles.length > 0) {
                        return "Only image files (JPG, PNG, WEBP) are allowed.";
                    }
                    
                    return undefined;
                }
            }
        ];
        const errors = validateFields(validationSchema);

        // Set employee ID based on role
        if (userRole === "admin" || userRole === "super_admin") {
            if (selectedEmployeeId) {
                employeeIdToSend = selectedEmployeeId;
            }
        } else if (userRole === "employee") {
            employeeIdToSend = logged_in_employee_id;
        }

        if (Object.keys(errors).length > 0) {
            this.setState({ errors });
            return false;
        }

        // Prepare FormData to send images via AJAX
        const uploadImageData = new FormData();
        uploadImageData.append('employee_id', employeeIdToSend);
        uploadImageData.append('created_by', logged_in_employee_id);

        // Define valid image types
        const validImageTypes = ["image/jpeg", "image/png", "image/webp"];

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
    sortImages = (images, sortOrder) => {
        return [...images].sort((a, b) => {
            return sortOrder === "desc"
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
    
    // Modal handlers for image preview
    openImageModal = (image) => {
        this.setState({ showImageModal: true, selectedImageForModal: image });
    };

    closeImageModal = () => {
        this.setState({ showImageModal: false, selectedImageForModal: null });
    };

    handleDeleteFromModal = () => {
        this.openDeleteModal(this.state.selectedImageForModal);
        this.closeImageModal();
    };

    handleDownload = () => {
        const { selectedImageForModal } = this.state;
        if (!selectedImageForModal) return;

        this.setState({ downloadLoading: true });

        // Validate file extension
        var validExtensions = ['.png', '.jpg', '.jpeg', '.webp'];
        var fileName = selectedImageForModal.url.split('/').pop();
        var fileExtension = fileName.split('.').pop().toLowerCase();

        if (validExtensions.indexOf('.' + fileExtension) === -1) {
            this.setState({
                downloadLoading: false,
                errorMessage: 'Only PNG, JPG, JPEG, and WEBP images are supported',
                showError: true
            });
            setTimeout(this.dismissMessages, 3000);
            return;
        }

        // backend endpoint for download
        var imageUrl = process.env.REACT_APP_API_URL + '/gallery.php?action=view_image&img=' + encodeURIComponent(fileName);

        fetch(imageUrl)
            .then(function (response) {
                return response.blob();
            })
            .then(function (blob) {
                const imageDataUrl = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = imageDataUrl;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(imageDataUrl);
            })
            .catch((error) => {
                this.setState({
                    downloadLoading: false,
                    errorMessage: 'Failed to download image',
                    showError: true
                });
                setTimeout(this.dismissMessages, 3000);
                console.error('Error downloading image:', error);
            })
            .finally(() => {
                this.setState({
                    downloadLoading: false,
                    successMessage: 'Download started successfully',
                    showSuccess: true
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
                                                <option value="desc">Newest</option>
                                                <option value="asc">Oldest</option>
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
                                            <ImageUploadModal
                                                isOpen={this.state.isModalOpen}
                                                closeModal={this.closeModal}
                                                employees={employees}
                                                selectedEmployeeId={this.state.selectedEmployeeId}
                                                handleEmployeeSelection={this.handleEmployeeSelection}
                                                selectedImages={this.state.selectedImages}
                                                handleImageSelection={this.handleImageSelection}
                                                removeImage={this.removeImage}
                                                submitImages={this.submitImages}
                                                errors={this.state.errors}
                                                ButtonLoading={this.state.ButtonLoading}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="masonry">
                                {loading ? (
                                    <GallerySkeleton rows={3} columns={4} />
                                ) : filteredImages.length > 0 ? (
                                // Show actual images once data is loaded
                                currentImages.map((image, index) => (
                                    <div className="masonry-item" key={image.id || index}>
                                    <div className="card p-3 position-relative gallery-card">
                                        <div className="gallery-image-wrapper">
                                        <img
                                            src={`${process.env.REACT_APP_API_URL}/${image.url}`}
                                            alt="Gallery"
                                            className="rounded w-100 h-auto"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => this.openImageModal(image)}
                                        />
                                        </div>
                                    </div>
                                    </div>
                                ))
                                ) : (
                                // Show BlankState if no images are found
                                <div className="col-12">
                                    <div
                                    className="card p-3 d-flex align-items-center justify-content-center"
                                    style={{ height: '300px' }}
                                    >
                                    <BlankState message="Image not available" />
                                    </div>
                                </div>
                                )}
                            </div>

                            {/* Show Pagination if there are images */}
                            {filteredImages.length > 0 && totalPages > 1 && (
                                <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={this.handlePageChange}
                                />
                            )}
                    </div>
                </div>
                {/* Modal for image preview, delete, and download */}
                <ImageModal
                    show={this.state.showImageModal}
                    image={this.state.selectedImageForModal}
                    onClose={this.closeImageModal}
                    onDownload={this.handleDownload}
                    onDelete={this.handleDeleteFromModal}
                    downloadLoading={this.state.downloadLoading}
                />

            </>
        )
    }
}
const mapStateToProps = state => ({
    fixNavbar: state.settings.isFixNavbar
})

const mapDispatchToProps = dispatch => ({})
export default connect(mapStateToProps, mapDispatchToProps)(Gallery);