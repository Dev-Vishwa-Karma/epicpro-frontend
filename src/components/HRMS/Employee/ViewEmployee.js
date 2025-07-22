import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera } from "@fortawesome/free-solid-svg-icons";
import ReactCropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import CalendarWithTabs from './CalendarWithTabs';
import AlertMessages from '../../common/AlertMessages';
import InfiniteScroll from 'react-infinite-scroll-component';
import { getService } from '../../../services/getService';
class ViewEmployee extends Component {
    constructor(props) {
        super(props);
        this.state = {
            employeeNew : {
                first_name: "",
                last_name: "",
                about_me: "",
            },
            employeeId: null,
            selectedImage: null,
            previewImage: null,
            successMessage: "",
            showSuccess: false,
            errorMessage: "",
            showError: false,
            activeTab: "calendar", 
            openFileSelectModel: false,
            images: [],   
            showGallery: true,
            croppperPreviewImage: null,
            profileImage: null,
            page: 1,
            hasMore: true,
            sortOrder: 'asc', // or 'desc'
            loading: true,
            message: ''
        };
        this.cropperRef = React.createRef();
    }

    toDataURL = async (url) => {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/gallery.php?action=view_image&img=${url}`);
        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    };

    blobToFile = (blob, fileName) => {
    return new File([blob], fileName, {
        type: blob.type,
        lastModified: Date.now()
    });
    };

    handleFileChange = async (event) => {
        this.setState({
            selectedImage:null
        });
        const file = event.target.files[0];
        if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            //this.setState({ croppperPreviewImage: reader.result });
           // this.saveCroppedImage();
        };
        reader.readAsDataURL(file);
        }
        try {
            const file = event.target.files[0];
            const uploadImageData = new FormData();
            uploadImageData.append('employee_id', this.state.employeeId);
            uploadImageData.append('created_by', window.user.id);
            uploadImageData.append('images[]', file);

            // Wait for the API response
            const data = await getService.addCall('gallery.php', 'add', uploadImageData);
            

            if (data.status === "success") {
                console.log('profileImagePath',data.data)
                const profileImagePath = data.data[0].url.replace(/\\/g, '/');
                const imageUrl = process.env.REACT_APP_API_URL + '/' + profileImagePath;
                const dataUrl = await this.toDataURL(imageUrl);
                console.log('profileImagePath',profileImagePath)
                const updatedImages = [...this.state.images, ...data.data];
                const sortedImages = this.sortImages(updatedImages, 'desc');
                this.setState({
                    selectedImage: `${profileImagePath}`,
                    croppperPreviewImage: `${dataUrl}`,
                    images: sortedImages,
                    successMessage: "Image uploaded successfully!",
                    showSuccess: true,
                    errorMessage: "",
                    showError: false,
                });
                setTimeout(this.dismissMessages, 3000);
            }
        } catch (error) {
            console.error("Error uploading the image in gallery: ", error);

        }
    }

    saveCroppedImage = () => {
        this.setState({ showGallery: false});
    };

    handleBack = () => {
        this.setState({ showGallery: true});
    }

    handleSave = async () => {
        const croppedImage = this.cropper.getCroppedCanvas().toDataURL();
        try {
            const uploadImageData = new FormData();
            uploadImageData.append('employee_id', this.state.employeeId);
            uploadImageData.append('created_by', window.user.id);
            uploadImageData.append('image', croppedImage);
            const data = await getService.editCall('get_employees.php', 'profile-update', uploadImageData);
            if (data.status === "success") {
                const profileImagePath = data.data.url.replace(/\\/g, '/');
                const updatedImages = [...this.state.images];
                const sortedImages = this.sortImages(updatedImages, 'desc');
                this.setState({
                    previewImage: `${process.env.REACT_APP_API_URL}/${profileImagePath}`,
                    images: sortedImages,
                    successMessage: "Image uploaded successfully!",
                    showSuccess: true,
                    errorMessage: "",
                    showError: false,
                    openFileSelectModel: false,
                    showGallery: true
                });
                setTimeout(this.dismissMessages, 3000);
            } else{
                this.setState({
                    errorMessage: "An error occurred while uploading the image. Check your image size",
                    showError: true,
                    showSuccess: false,
            });
            }
            document.body.style.overflow = 'auto';
        } catch (error) {
            console.error("Error uploading image:", error);
            this.setState({
                errorMessage: "An error occurred while uploading the image.",
                showError: true,
                showSuccess: false,
            });
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

    componentDidMount() {
        let { id, activeTab } = this.props.match.params;
        this.setState({
            employeeId: id
        })

        if (activeTab === undefined) {
            activeTab = 'profile';
        }

        this.setState({ activeTab: activeTab})
        this.fetchEmployeeDetails(id);
        this.getEmployeeGallery(id);
    }

    // componentDidUpdate(prevProps, prevState) {
    //     const { id, activeTab } = this.props.match.params;
    //     // // Watch for tab change even if pathname is same
    //     if (activeTab && activeTab !== prevState.activeTab) {
    //          console.log('prevState.activeTab',prevState.activeTab)
    //         this.setState({ activeTab });
    //     }
    // }

    getEmployeeGallery = (id, page = 1, limit = 12) => {
                getService.getCall('gallery.php', {
                    action: 'view',
                    employee_id:id,
                    page:page,
                    limit:limit
                })
                .then(data => {
                    if (data.status === 'success') {
                        const sortedImages = this.sortImages(data.data, this.state.sortOrder);
                        console.log('sortedImages',sortedImages)
                        this.setState(prevState => ({
                            images: page === 1 ? sortedImages : [...prevState.images, ...sortedImages],
                            hasMore: sortedImages.length >= limit, // if less than limit, we assume no more images
                            page,
                            loading: false
                        }));
                        console.log('images',this.state.images)
                    } else {
                        this.setState({ message: data.message, loading: false, hasMore: false });
                    }
                })
                .catch(err => {
                    this.setState({ message: 'Failed to fetch data', loading: false, hasMore: false });
                    console.error(err);
                });
    };

    fetchMoreImages = () => {
        let { id } = this.props.match.params;
            this.setState({
                employeeId: id
            })

        const { page } = this.state;
        const nextPage = page + 1;
        this.getEmployeeGallery(id, nextPage);
    };

    sortImages = (images, sortOrder) => {
        return [...images].sort((a, b) => {
            return sortOrder === "asc"
                ? new Date(b.created_at) - new Date(a.created_at)  // Newest first
                : new Date(a.created_at) - new Date(b.created_at); // Oldest first
        });
    };

    fetchEmployeeDetails = (employeeId) => {
         getService.getCall('get_employees.php', {
            action: 'view',
            user_id:employeeId
        })
            .then((data) => {
                if (data.status === "success") {
                    this.setState(prevState => ({
                        employeeNew: { ...prevState.employeeNew, ...data.data }, // Merge new data
                        previewImage: data.data.profile ? `${process.env.REACT_APP_API_URL}/${data.data.profile}` : prevState.previewImage
                    }));

                } else {
                    console.error("Failed to fetch employee details:", data.message);
                }
            })
            .catch((error) => console.error("Error fetching employee details:", error));
    };
        
    // Update profile
    handleProfileChange = (event) => {
        const { name, value } = event.target;
        
        // Update state for the selected user
        this.setState((prevState) => ({
            employeeNew: {
                ...prevState.employeeNew,
                [name]: value,
            }
        }));
    };

    render() {
        const { fixNavbar} = this.props;
        const {employeeNew, openFileSelectModel, showGallery, showSuccess, successMessage, showError, errorMessage} = this.state;

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

                <div className={`section-body ${fixNavbar ? "marginTop" : ""} `}>
                    <div className="container-fluid">
                        <div className="row clearfix">
                            <div className="col-md-12">
                                <div className="card card-profile">
                                    <div className="card-body text-center">
                                        {/* <img className="card-profile-img" src={`${process.env.REACT_APP_API_URL}/${employee.profile}`} alt="fake_url" /> */}

                                        <div style={{ position: "relative", display: "inline-block" }}>
                                            {/* Profile Image */}
                                            <img
                                                className="card-profile-img"
                                                src={this.state.previewImage || '/assets/images/sm/avatar4.jpg'}
                                                alt="Profile"
                                                style={{
                                                    borderRadius: "50%",
                                                    objectFit: "cover",
                                                }}
                                            />

                                            {/* Camera Icon Overlay */}
                                            <label
                                                htmlFor="imageUpload"
                                                className='card-profile-img'
                                                style={{
                                                    position: "absolute",
                                                    bottom: "0px",
                                                    right: "0px",
                                                    background: "#ececec",
                                                    color: "#000000",
                                                    borderRadius: "50%",
                                                    padding: "5px",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                <FontAwesomeIcon onClick={() => {
                                                    this.setState({
                                                        openFileSelectModel: true
                                                    })
                                                    document.body.style.overflow = 'hidden';
                                                }} icon={faCamera} />
                                            </label>
                                        </div>

                                        <h4 className="mb-3">{`${employeeNew.first_name} ${employeeNew.last_name || ''}`}</h4>
                                        <p className="mb-4" style={{ whiteSpace: "pre-line" }}>{employeeNew.about_me}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <CalendarWithTabs activeTab={this.state.activeTab} employeeId={this.state.employeeId}  />
                {openFileSelectModel && (
                    <div
                        className="modal fade show d-block"
                        id="birthdayBannerModal"
                        tabIndex="-1"
                        role="dialog"
                        style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
                    >
                        <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '650px' }}>
                            <div className="modal-content rounded-3" style={{
                                maxHeight: '90vh',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                {/* Modal Header */}
                                <div className="modal-header border-b-2 pb-0">
                                    <h5 className="modal-title w-100 text-center fw-bold fs-5 text-dark">
                                        {!showGallery ? "Crop" : "Select"} Your Profile Picture
                                    </h5>
                                    <div 
                                        className="btn btn-close" 
                                        onClick={() => {
                                            this.setState({ openFileSelectModel: false,showGallery:true, selectedImage:null });
                                            document.body.style.overflow = 'auto';
                                        }}
                                        aria-label="Close"
                                    >
                                        <i className="fa fa-times" data-toggle="tooltip" title="fa fa-times"></i>
                                    </div>
                                </div>

                                {/* Modal Body */}
                                <div className="modal-body py-4" style={{
                                    overflowY: 'auto',
                                    flex: '1 1 auto',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <div className="mb-3 w-100">
                                        <p className="text-muted text-center mb-4">
                                            {!showGallery ? "Crop your profile image" : "Choose from existing images or upload a new one"}
                                        </p>

                                        {!showGallery && (
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                minHeight: '400px'
                                            }}>
                                                <div style={{ width: '400px', height: '400px' }}>
                                                    {this.state.croppperPreviewImage && (
                                                        <ReactCropper
                                                            ref={(cropper) => (this.cropper = cropper)}
                                                            src={this.state.croppperPreviewImage}
                                                            style={{ height: 400, width: '100%' }}
                                                            aspectRatio={1}
                                                            guides={false}
                                                            scalable={false}
                                                            checkCrossOrigin={false}
                                                            crossOrigin="anonymous" 
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {showGallery && (
                                            <InfiniteScroll
                                                dataLength={this.state.images.length}
                                                next={this.fetchMoreImages}
                                                hasMore={this.state.hasMore}
                                                loader={<p className="text-center">Loading more images...</p>}
                                                scrollableTarget="scrollableGallery"
                                            >
                                                <div
                                                    id="scrollableGallery"
                                                    className="d-flex flex-wrap gap-3 px-2 align-items-start justify-content-start"
                                                    style={{ maxHeight: '200px', overflowY: 'auto' }}
                                                >
                                                            {/* Upload box */}
                                                    <label className="cursor-pointer">
                                                        <div className="border rounded-2 mt-1 mr-3 border-dashed hover-bg-light">
                                                            <div 
                                                                style={{
                                                                    width: '80px',
                                                                    height: '80px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    color: '#6c757d',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                <i className="fe fe-plus fs-4" />
                                                            </div>
                                                            <input 
                                                                type="file" 
                                                                className="d-none" 
                                                                accept="image/*"
                                                                onChange={this.handleFileChange}
                                                            />
                                                        </div>
                                                    </label>
                                                    {this.state.images.map((image, index) => (
                                                        <div key={index} className="position-relative mr-2">
                                                            <label className="d-block mb-0 pointer">
                                                                <input 
                                                                    name="imagecheck" 
                                                                    type="radio" 
                                                                    value={image.url} 
                                                                    className="d-none" 
                                                                    onChange={async () => {
                                                                        const imageUrl = process.env.REACT_APP_API_URL + '/' + image.url;
                                                                        const dataUrl = await this.toDataURL(imageUrl);
                                                                        this.setState({
                                                                            selectedImage: image.url,
                                                                            croppperPreviewImage: dataUrl
                                                                        });
                                                                    }}
                                                                />
                                                                <div className={`border rounded-2 p-1 ${this.state.selectedImage === image.url ? 'border-primary border-2' : 'border-light'}`}>
                                                                    <img 
                                                                        src={`${process.env.REACT_APP_API_URL}/${image.url}`} 
                                                                        alt="Profile option" 
                                                                        className="img-fluid rounded-1" 
                                                                        style={{ width: '80px', height: '80px', objectFit: 'cover', cursor: 'pointer' }}
                                                                    />
                                                                </div>
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </InfiniteScroll>
                                       
                                         )}
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="modal-footer border-b-2 pt-2 d-flex justify-content-end">
                                    <button
                                        className="btn btn-outline-secondary me-3 px-4"
                                        onClick={() => {
                                            this.setState({ openFileSelectModel: false,showGallery:true ,selectedImage:null });
                                            document.body.style.overflow = 'auto';
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    {showGallery && (
                                        <button
                                            className="btn btn-primary px-4"
                                            onClick={this.saveCroppedImage}
                                            disabled={!this.state.selectedImage}
                                        >
                                            Select & Crop
                                        </button>
                                    )}
                                    {!showGallery && (
                                        <button
                                            className="btn btn-primary px-4"
                                            onClick={this.handleBack}
                                        >
                                            Back
                                        </button>
                                    )}
                                    {!showGallery && (
                                        <button
                                            className="btn btn-primary px-4"
                                            onClick={this.handleSave}
                                        >
                                            Save Changes
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </>
        )
    }
}

const mapStateToProps = state => ({
    fixNavbar: state.settings.isFixNavbar
})

const mapDispatchToProps = dispatch => ({})
export default connect(mapStateToProps, mapDispatchToProps)(ViewEmployee);