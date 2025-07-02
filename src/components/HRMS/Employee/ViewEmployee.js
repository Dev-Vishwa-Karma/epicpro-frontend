import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera } from "@fortawesome/free-solid-svg-icons";
import Fullcalender from '../../common/fullcalender';
import ReportModal from '../Report/ReportModal';
import ReactCropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';

class ViewEmployee extends Component {
    constructor(props) {
        super(props);
        this.state = {
            employee: {
                first_name: "",
                last_name: "",
                email: "",
                mobile_no1: "",
                mobile_no2: "",
                password: "",
                gender:"",
                dob: "",
                address_line1: "",
                address_line2: "",
                about_me: "",
                department_id: "",
                joining_date:"",
                emergency_contact1: '',
                emergency_contact2: '',
                emergency_contact3: '',
            },
            skillsFrontend: [],
            skillsBackend: [],
            departments: [],
            employeeId: null,
            selectedImage: null,
            previewImage: null,
            successMessage: "",
            showSuccess: false,
            errorMessage: "",
            showError: false,
            activeTab: "calendar", 
            activities: [],
            reports: [],
            leaves: [],
            calendarEventsData: [],
            showReportModal: false,
            selectedReport: null,
            alternateSatudays: [],
            openFileSelectModel: false,
            images: [],   
            showGallery: true,
            croppperPreviewImage: null,
            profileImage: null
        };
        this.cropperRef = React.createRef();
        localStorage.removeItem('empId');
        localStorage.removeItem('startDate');
        localStorage.removeItem('eventStartDate');
        localStorage.removeItem('eventEndDate');
        localStorage.removeItem('endDate');
        localStorage.removeItem('defaultView');
    }

    toDataURL = async (url) => {
        console.log(
            
        );
        
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
        const file = event.target.files[0];
        if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            this.setState({ croppperPreviewImage: reader.result });
            this.saveCroppedImage();
            
        };
        reader.readAsDataURL(file);
        }
        try {
            const file = event.target.files[0];
            const uploadImageData = new FormData();
            uploadImageData.append('employee_id', this.state.employeeId);
            uploadImageData.append('created_by', window.user.id);
            uploadImageData.append('images[]', file);
            const response = await fetch(`${process.env.REACT_APP_API_URL}/gallery.php?action=add`, {
                method: 'POST', body: uploadImageData
            });
            const data = await response.json();
            if (data.status === "success") {
                const updatedImages = [...this.state.images, ...data.data];
                const sortedImages = this.sortImages(updatedImages, 'desc');
                this.setState({
                    images: sortedImages,
                    successMessage: "",
                    showSuccess: false,
                    errorMessage: "",
                    showError: false
                });
            }
        } catch (error) {
            console.error("Error uploading the image in gallery: ", error);

        }
    }

    saveCroppedImage = () => {
        this.setState({ showGallery: false});
    };

    handleSave = async () => {
        const croppedImage = this.cropper.getCroppedCanvas().toDataURL();
        try {
            const uploadImageData = new FormData();
            uploadImageData.append('employee_id', this.state.employeeId);
            uploadImageData.append('created_by', window.user.id);
            uploadImageData.append('image', croppedImage);
            const response = await fetch(`${process.env.REACT_APP_API_URL}/get_employees.php?action=profile-update`, {
                method: 'POST', body: uploadImageData
            });
            const data = await response.json();
            if (data.status === "success") {
                const profileImagePath = data.data.url.replace(/\\/g, '/');
                console.log('data.data',data.data)
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
        const { id, activeTab } = this.props.match.params;
        this.setState({
            employeeId: id
        })
        this.setState({ activeTab: activeTab})
        this.fetchEmployeeDetails(id);
        this.getEmployeeGallery(id);
        this.getDepartments();
    }

    componentDidUpdate(prevProps, prevState) {
        const { id, activeTab } = this.props.match.params;
        // // Watch for tab change even if pathname is same
        if (activeTab && activeTab !== prevState.activeTab) {
            this.setState({ activeTab });
        }
    
    }

    getDepartments = () => {
        // Get department data from departments table
		fetch(`${process.env.REACT_APP_API_URL}/departments.php`, {
            method: "GET"
        })
        .then(response => response.json())
        .then(data => {
			this.setState({ departments: data.data });
        })
        .catch(error => console.error("Error fetching departments:", error));
    }

    formatDate = (date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = (`0${d.getMonth() + 1}`).slice(-2);
        const day = (`0${d.getDate()}`).slice(-2);
        return `${year}-${month}-${day}`;
    };

    getEmployeeGallery = (id) => {
        let galleryUrl = `${process.env.REACT_APP_API_URL}/gallery.php?action=view&id=${id}`;
        // Fetch gallery data (as in the previous code)
        fetch(galleryUrl, {
            method: "GET",
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    const sortedImages = this.sortImages(data.data, this.state.sortOrder);
                    this.setState({
                        images: sortedImages,
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

    sortImages = (images, sortOrder) => {
        return [...images].sort((a, b) => {
            return sortOrder === "asc"
                ? new Date(b.created_at) - new Date(a.created_at)  // Newest first
                : new Date(a.created_at) - new Date(b.created_at); // Oldest first
        });
    };

    // Common fetch function
    fetchData = (url, onSuccessKey) => {
        fetch(url, {
            method: "GET",
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                this.setState({ [onSuccessKey]: data.data });
            } else {
                this.setState({ errorMessage: data.message });
            }
        })
        .catch(err => {
            this.setState({ error: 'Failed to fetch data' });
            console.error(err);
        });
    }

    generateCalendarEvents = (reports, leaves) => {
        const missingReportEvents = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Determine which reports to check based on employeeId in state
        let reportsForMissing = reports;
        let startDate;
        let endDate;
        
        const date = new Date();
        const year = date.getFullYear();
        const firstDay = new Date(year, 0, 1);
        const lastDay = new Date(year, 11, 31);
        const formatDate = (date) => date.toISOString().split('T')[0];
        startDate = formatDate(firstDay);
        endDate = formatDate(lastDay);
        const employeeLeavesData = [];
        let currentDate = new Date(startDate);
        

        // 1. Working Hours Events
        const totalWorkingHours = reports.map(report => {
            const hoursStr = report.todays_working_hours?.slice(0, 5);
            const hours = parseFloat(hoursStr);

            let className = "daily-report";
			if (hours < 4) className = "red-event";
			else if (hours >= 4  && hours < 8) className = "half-day-leave-event";

            return {
                title: `${hoursStr}`, // Display hours
                start: report.created_at?.split(" ")[0],
                display: "background", // Render as background event
                allDay: true,
                className: className, // Use the className based on hours
                report: report // Store the full report object directly
            };
        }).flat();

        leaves.filter(leave => leave.status === 'approved').forEach((leave) => {
            const start = new Date(leave.from_date);
            const end = new Date(leave.to_date);
            if (end >= today) {
                const loopStart = start < today ? new Date(today) : new Date(start);
                for (let d = new Date(loopStart); d <= end; d.setDate(d.getDate() + 1)) {
                    if (d >= today) {
                        if (leave.is_half_day === "1") {
                            employeeLeavesData.push({
                                title: '',
                                start: d.toISOString().split("T")[0],
                                className: "half-day-leave-event",
                                allDay: true,
                            });
                        } else {
                            employeeLeavesData.push({
                                title: '',
                                start: d.toISOString().split("T")[0],
                                className: "leave-event",
                                allDay: true,
                            });
                        }
                    }
                }
            }
        });

        while (this.formatDate(currentDate) <= this.formatDate(today) && this.formatDate(currentDate) <= this.formatDate(endDate)) {
            const dateStr = currentDate.toISOString().split("T")[0];
            const hasReport = reportsForMissing.some((report) => report.created_at?.split(" ")[0] === dateStr);
            if (!hasReport) {
                missingReportEvents.push({
                    start: dateStr,
                    display: 'background',
                    color: '#ff6b6b', 
                    allDay: true,
                    className: 'missing-report-day',
                });
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        // Merge all events
        const calendarEvents = [
            ...totalWorkingHours,
            ...employeeLeavesData,
            ...missingReportEvents,
        ];
        return calendarEvents;
    }

    getAlternateSaturday = async () => {
        const now = localStorage.getItem('startDate') ? new Date(localStorage.getItem('startDate')) : new Date();
        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/alternate_saturdays.php?action=view&year=${now.getFullYear()}`
            );
            const data = await response.json();

            this.setState({
                alternateSatudays: data?.data
            })
			
        } catch (error) {
            console.error("Failed to fetch saved Saturdays:", error);
        }
    }

    loadEmployeeData = () => {
        const baseUrl = process.env.REACT_APP_API_URL;
        let employeeId = this.props.match.params.id;

        if (!employeeId) {
			employeeId = localStorage.getItem('empId');
		}
        let startDate = localStorage.getItem('startDate');
        let endDate = localStorage.getItem('endDate');

		if (!startDate || !endDate) {
			const now = new Date();
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
            const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
            const formatDate = (date) => date.toISOString().split('T')[0];
			startDate = formatDate(firstDay);
            endDate = formatDate(lastDay);
        }
        const currentEmployeeId = employeeId;

        if (currentEmployeeId) {
            // Fetch activities
            this.fetchData(`${baseUrl}/activities.php?user_id=${currentEmployeeId}`, 'activities');

            // Fetch reports
            fetch(`${baseUrl}/reports.php?user_id=${currentEmployeeId}&from_date=${startDate}&to_date=${endDate}`, {
                method: "GET",
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    const reports = data.data;
                     this.setState({ reports }, () => {
                         // Generate calendar events after reports and leaves are fetched and state is updated
                         const { reports, leaves } = this.state;
                         const calendarEventsData = this.generateCalendarEvents(reports, leaves);
                         this.setState({ calendarEventsData });
                     });
                } else {
                    this.setState({ errorMessage: data.message, reports: [] });
                     // Still generate events even if reports fetch fails, to show leaves/closures
                     const { reports, leaves } = this.state;
                     const calendarEventsData = this.generateCalendarEvents(reports, leaves);
                     this.setState({ calendarEventsData });
                }
            })
            .catch(err => {
                this.setState({ error: 'Failed to fetch reports', reports: [] });
                 // Still generate events even if reports fetch fails, to show leaves/closures
                 const { reports, leaves } = this.state;
                 const calendarEventsData = this.generateCalendarEvents(reports, leaves);
                 this.setState({ calendarEventsData });
            });

             // Fetch leaves
            fetch(`${baseUrl}/employee_leaves.php?employee_id=${currentEmployeeId}`, {
                method: "GET",
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    const leaves = data.data;
                    this.setState({ leaves }, () => {
                         // Generate calendar events after reports and leaves are fetched and state is updated
                         const { reports, leaves } = this.state;
                         const calendarEventsData = this.generateCalendarEvents(reports, leaves);
                         this.setState({ calendarEventsData });
                    });
                } else {
                    this.setState({ errorMessage: data.message, leaves: [] });
                      // Still generate events even if leaves fetch fails, to show reports/closures
                     const { reports, leaves } = this.state;
                     const calendarEventsData = this.generateCalendarEvents(reports, leaves);
                     this.setState({ calendarEventsData });
                }
            })
            .catch(err => {
                this.setState({ error: 'Failed to fetch leaves', leaves: [] });
                 // Still generate events even if leaves fetch fails, to show reports/closures
                 const { reports, leaves } = this.state;
                 const calendarEventsData = this.generateCalendarEvents(reports, leaves);
                 this.setState({ calendarEventsData });
            });
        }
    }

    fetchEmployeeDetails = (employeeId) => {
        fetch(`${process.env.REACT_APP_API_URL}/get_employees.php?action=view&user_id=${employeeId}`, {
            method: "GET",
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.status === "success") {
                    this.setState(prevState => ({
                        employee: { ...prevState.employee, ...data.data }, // Merge new data
                        previewImage: data.data.profile ? `${process.env.REACT_APP_API_URL}/${data.data.profile}` : prevState.previewImage
                    }));

                    const skillsFrontend = this.parseSkills(this.state.employee.frontend_skills);
                    const skillsBackend = this.parseSkills(this.state.employee.backend_skills);

                    // Remove duplicates between frontend and backend
                    const uniqueFrontendSkills = skillsFrontend.filter(skill => !skillsBackend.includes(skill));
                    const uniqueBackendSkills = skillsBackend.filter(skill => !skillsFrontend.includes(skill));
                    this.setState({
                        skillsFrontend: uniqueFrontendSkills,
                        skillsBackend: uniqueBackendSkills,
                    });

                    const isAdmin = data.data.role === 'super_admin' || data.data.role === 'admin';
                    if (!isAdmin) {
                        this.loadEmployeeData();
                        this.getAlternateSaturday();
                    }
                } else {
                    console.error("Failed to fetch employee details:", data.message);
                }
            })
            .catch((error) => console.error("Error fetching employee details:", error));
    };

    /**
     * Parses skills data from string or array.
     */
    parseSkills(skills) {
        if (typeof skills === 'string') {
            return skills.replace(/["[\]]/g, '').split(',').map(skill => skill.trim());
        }
        return Array.isArray(skills) ? skills : [];
    }

    handleSkillChange = (event, fieldName) => {
        const { value, checked } = event.target;
    
        // Check which field we're updating (frontend or backend)
        this.setState((prevState) => {
            let updatedSkills = fieldName === 'frontend' 
                ? [...prevState.skillsFrontend] 
                : [...prevState.skillsBackend];
    
            if (checked) {
                // Add the skill if not already in the array
                if (!updatedSkills.includes(value)) {
                    updatedSkills.push(value);
                }
            } else {
                // Remove the skill if checkbox is unchecked
                updatedSkills = updatedSkills.filter((skill) => skill !== value);
            }
    
            // Return the updatdepartmented state for the specific field
            return {
                [fieldName === 'frontend' ? 'skillsFrontend' : 'skillsBackend']: updatedSkills,
            };
        }, () => {
            console.log(fieldName === 'frontend' ? 'Updated skillsFrontend' : 'Updated skillsBackend', this.state[fieldName === 'frontend' ? 'skillsFrontend' : 'skillsBackend']);
        });
    }; 

    
    fetchWorkingHoursReports = (employeeId) => {
			if (!employeeId) {
				employeeId = localStorage.getItem('empId');
			}
			let startDate = localStorage.getItem('startDate');
			let endDate = localStorage.getItem('endDate');

			if (!startDate || !endDate) {
			const now = new Date();

				// First day of the current month
				const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);

				// Last day of the current month
				const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);

				// Format as YYYY-MM-DD
				const formatDate = (date) =>
					date.toISOString().split('T')[0];

				startDate = formatDate(firstDay);
				endDate = formatDate(lastDay);
			}

		fetch(
			
		`${process.env.REACT_APP_API_URL}/reports.php?user_id=${employeeId}&from_date=${startDate}&to_date=${endDate}`,
		{
			method: "GET",
		}
		)
		.then((response) => {
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			return response.json();
		})
		.then((data) => {
			if (data.status === "success") {
				if(employeeId === ''){
					this.setState({ 
						workingHoursReports: []
					});
				}else{
					this.setState({ 
						workingHoursReports: data.data,
						loading: false 
					});
				}
			} else {
				this.setState({ 
					workingHoursReports: [],
					error: data.message || "Failed to load reports",
					loading: false 
				});
			}
		})
		.catch((err) => {
			console.error("Error fetching working hours:", err);
			this.setState({ 
				workingHoursReports: [],
				error: "Failed to fetch working hours",
				loading: false 
			});
		});
		};

        
    handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            this.setState({
                selectedImage: file,
                previewImage: URL.createObjectURL(file),
            });
    
            // Call function to upload image
            this.uploadImage(file);
        }
    };

    uploadImage = (file) => {
        const {id, role} = window.user;
        const { employeeId } = this.state;
        const formData = new FormData();
        formData.append("employee_id", employeeId);
        formData.append("logged_in_employee_id", id);
        formData.append('logged_in_employee_role', role); // Logged-in employee role
        formData.append("photo", file);
    
        fetch(`${process.env.REACT_APP_API_URL}/get_employees.php?action=edit&user_id=${employeeId}`, {
          method: "POST",
          body: formData,
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.status === "success") {
                // Correct the image path and set the previewImage state
                const profileImagePath = data.data.profile.replace(/\\/g, '/');

                // Update the previewImage state correctly
                this.setState((prevState) => ({
                    previewImage: `${process.env.REACT_APP_API_URL}/${profileImagePath}`,
                    employee: { 
                        ...prevState.employee, 
                        profile: profileImagePath // Update the profile in employee data
                    },
                    successMessage: "Image uploaded successfully!",
                    showSuccess: true,
                    errorMessage: "",
                    showError: false
                }));
                setTimeout(this.dismissMessages, 3000);
            } else {
                this.setState({
                    errorMessage: "Image upload failed!",
                    showError: true,
                    showSuccess: false,
                });
                // setTimeout(this.dismissMessages, 3000);
            }
        })
        .catch((error) => {
            console.error("Error uploading image:", error);
            this.setState({
                errorMessage: "An error occurred while uploading the image.",
                showError: true,
                showSuccess: false,
            });
            // setTimeout(this.dismissMessages, 3000);
        });
    };

    // Update profile
    handleProfileChange = (event) => {
        const { name, value } = event.target;
        
        // Update state for the selected user
        this.setState((prevState) => ({
            employee: {
                ...prevState.employee,
                [name]: value,
            }
        }));
    };

    updateProfile = () => {
        const { employee, skillsFrontend,skillsBackend } = this.state;

        // Validation for required fields
        const namePattern = /^[A-Za-z\s]+$/;
        let errors = {};
        if (!employee.first_name || employee.first_name.trim() === "") {
            errors.first_name = "First Name is required.";
        } else if (!namePattern.test(employee.first_name)) {
            errors.first_name = "First Name must not contain special characters or numbers.";
        }
        if (!employee.last_name || employee.last_name.trim() === "") {
            errors.last_name = "Last Name is required.";
        } else if (!namePattern.test(employee.last_name)) {
            errors.last_name = "Last Name must not contain special characters or numbers.";
        }
        if (!employee.email || employee.email.trim() === "") {
            errors.email = "Email address is required.";
        }
        if (!employee.gender || employee.gender.trim() === "") {
            errors.gender = "Gender is required.";
        }
        if (!employee.department_id || employee.department_id === "") {
            errors.department_id = "Department is required.";
        }
        if (!employee.dob || employee.dob.trim() === "") {
            errors.dob = "DOB is required.";
        }
        if (!employee.joining_date || employee.joining_date.trim() === "") {
            errors.joining_date = "Joining Date is required.";
        }
        if (Object.keys(errors).length > 0) {
            this.setState({ errors });
            return;
        } else {
            this.setState({ errors: {} });
        }

        // Get the logged-in user from localStorage
        const storedUser = window.user || JSON.parse(localStorage.getItem("user"));
        if (!storedUser || !storedUser.id) {
            console.warn("User data missing from localStorage");
            return;
        }

        const { id, role } = storedUser;
        // Create a new FormData object
        const updatedProfileData = new FormData();

        // Helper function to ensure blank values are stored as empty strings
        const appendField = (key, value) => {
            updatedProfileData.append(key, value !== undefined && value !== null ? value : "");
        };

        appendField("id", employee.id);
        appendField("logged_in_employee_id", id);
        appendField("logged_in_employee_role", role);
        appendField("first_name", employee.first_name);
        appendField("last_name", employee.last_name);
        appendField("email", employee.email);
        appendField("gender", employee.gender);
        appendField("department_id", employee.department_id);
        appendField("joining_date", employee.joining_date);
        appendField("mobile_no1", employee.mobile_no1);
        appendField('mobile_no2',employee.mobile_no2);
        appendField("password", employee.password);
        appendField("dob", employee.dob);
        appendField("address_line1", employee.address_line1);
        appendField("address_line2", employee.address_line2);
        appendField('emergency_contact1', employee.emergency_contact1);
        appendField('emergency_contact2', employee.emergency_contact2);
        appendField('emergency_contact3', employee.emergency_contact3);
        appendField('frontend_skills', JSON.stringify(skillsFrontend));
        appendField('backend_skills', JSON.stringify(skillsBackend));
        appendField("about_me", employee.about_me);

        // Preserve social media URLs even if not updated
        appendField("facebook_url", employee.facebook_url);
        appendField("twitter_url", employee.twitter_url);
    
        fetch(`${process.env.REACT_APP_API_URL}/get_employees.php?action=edit&user_id=${employee.id}`, {
            method: "POST",
            body: updatedProfileData,
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                const updatedUser = data.data;

                // Only update the logged-in user's data
                if (employee.id === id) {
                    const mergedUserData = { ...storedUser, ...updatedUser };

                    // Store updated data in local storage
                    localStorage.setItem("user", JSON.stringify(mergedUserData));
                    window.user = mergedUserData;

                    // Update state to re-render UI with new data
                    this.setState({ employee: mergedUserData });
                } else {
                    // If updating another user from the listing, just update the state
                    this.setState({ employee: updatedUser });
                }

                this.setState((prevState) => ({
                    successMessage: "Profile updated successfully!",
                    showSuccess: true,
                    errorMessage: "",
                    showError: false
                }));
    
                // Auto-hide success message after 5 seconds
                setTimeout(this.dismissMessages, 5000);
            } else {
                this.setState({
                    errorMessage: "Failed to update profile.",
                    showError: true,
                    showSuccess: false
                });
    
                // setTimeout(this.dismissMessages, 3000);
            }
        })
        .catch(error => {
            console.error("Error updating profile:", error);
            this.setState({
                errorMessage: "An error occurred while updating the profile.",
                showError: true,
                showSuccess: false,
            });

            // setTimeout(this.dismissMessages, 3000);
        });
    };

    // Render function for Bootstrap toast messages
    renderAlertMessages = () => {
        return (
            
            <>
                {/* Add the alert for success messages */}
                <div 
                    className={`alert alert-success alert-dismissible fade show ${this.state.showSuccess ? "d-block" : "d-none"}`} 
                    role="alert" 
                    style={{ 
                        position: "fixed", 
                        top: "20px", 
                        right: "20px", 
                        zIndex: 1050, 
                        minWidth: "250px", 
                        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" 
                    }}
                >
                    <i className="fa-solid fa-circle-check me-2"></i>
                    {this.state.successMessage}
                    <button
                        type="button"
                        className="close"
                        aria-label="Close"
                        onClick={() => this.setState({ showSuccess: false })}
                    >
                    </button>
                </div>

                {/* Add the alert for error messages */}
                <div 
                    className={`alert alert-danger alert-dismissible fade show ${this.state.showError ? "d-block" : "d-none"}`} 
                    role="alert" 
                    style={{ 
                        position: "fixed", 
                        top: "20px", 
                        right: "20px", 
                        zIndex: 1050, 
                        minWidth: "250px", 
                        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" 
                    }}
                >
                    <i className="fa-solid fa-triangle-exclamation me-2"></i>
                    {this.state.errorMessage}
                    <button
                        type="button"
                        className="close"
                        aria-label="Close"
                        onClick={() => this.setState({ showError: false })}
                    >
                    </button>
                </div>
            </>
        );
    };

    handleEventClick = (eventInfo) => {
        // The event data is directly in the eventInfo object
        const report = eventInfo.report;
        if (report) {
            this.setState({
                selectedReport: report,
                showReportModal: true
            });
        } 
    };

    closeReportModal = () => {
        this.setState({
            showReportModal: false,
            selectedReport: null
        });
    };

    render() {
        const { fixNavbar} = this.props;
        const {employee, activities, errorMessage, calendarEventsData, openFileSelectModel, skillsFrontend, skillsBackend, showGallery} = this.state;
        const frontendSkills = ["HTML", "CSS", "JavaScript", "React", "Angular", "Vue"];
        const backendSkills = ["PHP", "Laravel", "Python", "Node.js", "Symfony", "Django", "Ruby on Rails"];
        // Handle case where employee data is not available
        if (!employee) {
            return <p>Loading employee details...</p>;
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const defaultDate = localStorage.getItem('startDate') ?? this.formatDate(today);
		const defaultView = localStorage.getItem('defaultView') ?? 'month';

        // Use calendarEventsData from state, default to empty array if not yet loaded
        const finalCalendarEvents = calendarEventsData || [];

        return (
            <>
                {this.renderAlertMessages()} {/* Show Toast Messages */}

                {this.state.showReportModal && this.state.selectedReport && (
                    <ReportModal
                        show={this.state.showReportModal}
                        report={this.state.selectedReport}
                        onClose={this.closeReportModal}
                        userRole={this.state.logged_in_employee_role}
                    />
                )}

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
                                                src={this.state.previewImage}
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
                                                {/* <input
                                                    id="imageUpload"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={this.handleImageChange}
                                                    style={{ display: "none" }}
                                                /> */}
                                            </label>
                                        </div>

                                        <h4 className="mb-3">{`${employee.first_name} ${employee.last_name || ''}`}</h4>
                                        {/* <ul className="social-links list-inline mb-3 mt-2">
                                            {employee.facebook_url && employee.facebook_url !== "null" && employee.facebook_url.trim() !== "" ? (
                                                <li className="list-inline-item">
                                                    <a href={employee.facebook_url} title="Facebook" data-toggle="tooltip" target="_blank" rel="noopener noreferrer">
                                                        <i className="fa fa-facebook" />
                                                    </a>
                                                </li>
                                            ) : (
                                                <li className="list-inline-item">
                                                    <a
                                                        href="#"
                                                        onClick={(e) => e.preventDefault()} 
                                                        title="Facebook (No link available)" 
                                                        data-toggle="tooltip"
                                                        style={{ cursor: "default" }}
                                                    >
                                                        <i className="fa fa-facebook" />
                                                    </a>
                                                </li>
                                            )}

                                            {employee.twitter_url && employee.twitter_url !== "null" && employee.twitter_url.trim() !== "" ? (
                                                <li className="list-inline-item">
                                                    <a href={employee.twitter_url} title="Twitter" data-toggle="tooltip" target="_blank" rel="noopener noreferrer">
                                                        <i className="fa fa-twitter" />
                                                    </a>
                                                </li>
                                            ) : (
                                                <li className="list-inline-item">
                                                    <a 
                                                        href="#"
                                                        onClick={(e) => e.preventDefault()}
                                                        title="Twitter (No link available)" 
                                                        data-toggle="tooltip"
                                                        style={{ cursor: "default" }}
                                                    >
                                                        <i className="fa fa-twitter" />
                                                    </a>
                                                </li>
                                            )}

                                            {employee.mobile_no1 && employee.mobile_no1 !== "null" && employee.mobile_no1.trim() !== "" ? (
                                                <li className="list-inline-item">
                                                    <a href={`tel:${employee.mobile_no1}`} title={employee.mobile_no1} data-toggle="tooltip">
                                                        <i className="fa fa-phone" />
                                                    </a>
                                                </li>
                                            ) : (
                                                <li className="list-inline-item">
                                                    <a 
                                                        href="#"
                                                        onClick={(e) => e.preventDefault()}
                                                        title="Mobile Number not available" 
                                                        data-toggle="tooltip"
                                                        style={{ cursor: "default" }}
                                                    >
                                                        <i className="fa fa-phone" />
                                                    </a>
                                                </li>
                                            )}

                                            {employee.first_name && employee.last_name && (
                                                <li className="list-inline-item">
                                                    <a 
                                                        href={`skype:${employee.first_name.toLowerCase()}.${employee.last_name.toLowerCase()}?chat`}
                                                        title={`${employee.first_name} ${employee.last_name}`} 
                                                        data-toggle="tooltip"
                                                    >
                                                        <i className="fa fa-skype" />
                                                    </a>
                                                </li>
                                            )}
                                        </ul> */}
                                        <p className="mb-4" style={{ whiteSpace: "pre-line" }}>{employee.about_me}</p>
                                        {/* <button className="btn btn-outline-primary btn-sm"><span className="fa fa-twitter" /> Follow</button> */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="section-body  py-4">
                    <div className="container-fluid">
                        <div className="row clearfix">
                            <div className="col-12">
                                <ul className="nav nav-tabs mb-3" id="pills-tab" role="tablist">
                                {(employee.role === "employee") && (
                                    <li className="nav-item">
                                        <a
                                            className={`nav-link ${this.state.activeTab === "calendar" ? "active" : ""}`}
                                            id="pills-calendar-tab"
                                            data-toggle="pill"
                                            href="#pills-calendar"
                                            role="tab"
                                            aria-controls="pills-calendar"
                                            aria-selected={this.state.activeTab === "calendar"}
                                            onClick={() => this.setState({ activeTab: "calendar" })}
                                        >
                                            Calendar
                                        </a>
                                    </li>
                                    )}
                                    {(employee.role === "employee") && (
                                    <li className="nav-item">
                                        <a
                                            className={`nav-link ${this.state.activeTab === "timeline" ? "active" : ""}`}
                                            id="pills-timeline-tab"
                                            data-toggle="pill"
                                            href="#pills-timeline"
                                            role="tab"
                                            aria-controls="pills-timeline"
                                            aria-selected={this.state.activeTab === "timeline"}
                                            onClick={() => this.setState({ activeTab: "timeline" })}
                                        >
                                            Timeline
                                        </a>
                                    </li>
                                     )}
                                    <li className="nav-item">
                                        <a
                                            className={`nav-link ${this.state.activeTab === "profile" ? "active" : ""}`}
                                            id="pills-profile-tab"
                                            data-toggle="pill"
                                            href="#pills-profile"
                                            role="tab"
                                            aria-controls="pills-profile"
                                            aria-selected={this.state.activeTab === "profile"}
                                            onClick={() => this.setState({ activeTab: "profile" })}
                                        >
                                            Profile
                                        </a>
                                    </li>
                                    {/* <li className="nav-item">
                                        <a className="nav-link" id="pills-blog-tab" data-toggle="pill" href="#pills-blog" role="tab" aria-controls="pills-blog" aria-selected="true">Blog</a>
                                    </li> */}
                                </ul>
                            </div>
                            <div className="col-lg-12 col-md-12">
                                <div className="tab-content" id="pills-tabContent">
                                    <div className={`tab-pane fade ${this.state.activeTab === "calendar" ? "show active" : ""}`} id="pills-calendar" role="tabpanel" aria-labelledby="pills-calendar-tab">
                                        <div className="card">
                                            <div className="card-header bline">
                                                <h3 className="card-title">Calendar</h3>
                                                {/* <div className="card-options">
                                                    <a href="/#" className="card-options-fullscreen" data-toggle="card-fullscreen"><i className="fe fe-maximize" /></a>
                                                    <div className="item-action dropdown ml-2">
                                                        <a href="fake_url" data-toggle="dropdown"><i className="fe fe-more-vertical" /></a>
                                                        <div className="dropdown-menu dropdown-menu-right">
                                                            <a href="fake_url" className="dropdown-item"><i className="dropdown-icon fa fa-eye" /> View Details </a>
                                                            <a href="fake_url" className="dropdown-item"><i className="dropdown-icon fa fa-share-alt" /> Share </a>
                                                            <a href="fake_url" className="dropdown-item"><i className="dropdown-icon fa fa-cloud-download" /> Download</a>
                                                            <div className="dropdown-divider" />
                                                            <a href="fake_url" className="dropdown-item"><i className="dropdown-icon fa fa-copy" /> Copy to</a>
                                                            <a href="fake_url" className="dropdown-item"><i className="dropdown-icon fa fa-folder" /> Move to</a>
                                                            <a href="fake_url" className="dropdown-item"><i className="dropdown-icon fa fa-edit" /> Rename</a>
                                                            <a href="fake_url" className="dropdown-item"><i className="dropdown-icon fa fa-trash" /> Delete</a>
                                                        </div>
                                                    </div>
                                                </div> */}
                                            </div>
                                            <div className="card-body">
                                                <Fullcalender 
                                                    alternateSatudays={this.state.alternateSatudays}
                                                    defaultDate={defaultDate}
                                                    defaultView={defaultView}
                                                    key={`calendar-${this.state.activeTab}`}
                                                    events={finalCalendarEvents}
                                                    eventClick={this.handleEventClick}
                                                    selectable={true}
                                                    selectMirror={true}
                                                    dayMaxEvents={true}
                                                    eventDisplay="block"
                                                    headerToolbar={{
                                                        left: 'prev,next today',
                                                        center: 'title',
                                                        right: 'dayGridMonth,timeGridWeek,timeGridDay'
                                                    }}
                                                    buttonText={{
                                                        today: 'Today',
                                                        month: 'Month',
                                                        week: 'Week',
                                                        day: 'Day'
                                                    }}
                                                    height="auto"
                                                    onAction={this.loadEmployeeData}
                                                    eventTimeFormat={{
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        meridiem: false,
                                                        hour12: false
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`tab-pane fade ${this.state.activeTab === "timeline" ? "show active" : ""}`} id="pills-timeline" role="tabpanel" aria-labelledby="pills-timeline-tab">
                                        <div className="card">
                                            <div className="card-header">
                                                <h3 className="card-title">Activity</h3>
                                            </div>
                                            <div className="card-body">
                                                {activities.length > 0 ? (
                                                    activities.map((activity, index) => (
                                                        <div key={index}>
                                                            {/* In Time Entry */}
                                                            {activity.activity_type === 'Break' && (
                                                                <div className="timeline_item ">
                                                                    <img
                                                                        className="tl_avatar"
                                                                        src="../assets/images/xs/avatar1.jpg"
                                                                        alt="fake_url"
                                                                    />
                                                                    <span>
                                                                        <a>{activity.first_name} {activity.last_name}</a> {/* {activity.location} */}
                                                                        <small className="float-right text-right">
                                                                            {activity.in_time}
                                                                        </small>
                                                                    </span>
                                                                    <h6 className="font600">
                                                                        (Break In) {activity.description}
                                                                    </h6>

                                                                    <div className="msg">
                                                                        {activity.created_by && (
                                                                            <a className="mr-20 text-muted"><i className="fa fa-user text-pink"></i> Created by System Admin</a>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {/* Out Time Entry */}
                                                            {activity.activity_type === 'Break' && activity.out_time && (
                                                                <>
                                                                    <div className="timeline_item ">
                                                                        <img
                                                                            className="tl_avatar"
                                                                            src="../assets/images/xs/avatar1.jpg"
                                                                            alt="fake_url"
                                                                        />
                                                                        <span>
                                                                            <a href="#">{activity.first_name} {activity.last_name}</a> {/* {activity.location} */}
                                                                            <small className="float-right text-right">
                                                                                {activity.out_time}
                                                                            </small>
                                                                        </span>
                                                                        <h6 className="font600">
                                                                            Break out
                                                                        </h6>
                                                                        <div className="msg">
                                                                            {activity.updated_by && (
                                                                                <a className="mr-20 text-muted"><i className="fa fa-user text-pink"></i> Edited by System Admin</a>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            )}

                                                            {/* In Time Entry Punch */}
                                                            {activity.activity_type === 'Punch' && (
                                                                <div className="timeline_item ">
                                                                    <img
                                                                        className="tl_avatar"
                                                                        src="../assets/images/xs/avatar1.jpg"
                                                                        alt="fake_url"
                                                                    />
                                                                    <span>
                                                                        <a href="#">{activity.first_name} {activity.last_name}</a> {/* {activity.location} */}
                                                                        <small className="float-right text-right">
                                                                            {activity.in_time}
                                                                        </small>
                                                                    </span>
                                                                    <h6 className="font600">
                                                                        has started his day
                                                                    </h6>

                                                                    <div className="msg">
                                                                        {activity.created_by && (
                                                                            <a className="mr-20 text-muted"><i className="fa fa-user text-pink"></i> Created by System Admin</a>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {/* Out Time Entry */}
                                                            {activity.activity_type === 'Punch' && activity.out_time && (
                                                                <>
                                                                    <div className="timeline_item ">
                                                                        <img
                                                                            className="tl_avatar"
                                                                            src="../assets/images/xs/avatar1.jpg"
                                                                            alt="fake_url"
                                                                        />
                                                                        <span>
                                                                            <a href="#">{activity.first_name} {activity.last_name}</a> {/* {activity.location} */}
                                                                            <small className="float-right text-right">
                                                                                {activity.out_time}
                                                                            </small>
                                                                        </span>
                                                                        <h6 className="font600">
                                                                            has ended his day
                                                                        </h6>
                                                                        <div className="msg">
                                                                            {activity.updated_by && (
                                                                                <a className="mr-20 text-muted"><i className="fa fa-user text-pink"></i> Edited by System Admin</a>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    ))
                                                ) : (
                                                    // errorMessage && <p>{errorMessage}</p>
                                                    <div className="text-muted py-4">activities not found</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`tab-pane fade ${this.state.activeTab === "profile" ? "show active" : ""}`} id="pills-profile" role="tabpanel" aria-labelledby="pills-profile-tab">
                                        <div className="card">
                                            <div className="card-header">
                                                <h3 className="card-title">Edit Profile</h3>
                                                {/* <div className="card-options">
                                                    <a href="/#" className="card-options-fullscreen" data-toggle="card-fullscreen"><i className="fe fe-maximize" /></a>
                                                    <a href="/#" className="card-options-remove" data-toggle="card-remove"><i className="fe fe-x" /></a>
                                                    <div className="item-action dropdown ml-2">
                                                        <a href="fake_url" data-toggle="dropdown"><i className="fe fe-more-vertical" /></a>
                                                        <div className="dropdown-menu dropdown-menu-right">
                                                            <a href="fake_url" className="dropdown-item"><i className="dropdown-icon fa fa-eye" /> View Details </a>
                                                            <a href="fake_url" className="dropdown-item"><i className="dropdown-icon fa fa-share-alt" /> Share </a>
                                                            <a href="fake_url" className="dropdown-item"><i className="dropdown-icon fa fa-cloud-download" /> Download</a>
                                                            <div className="dropdown-divider" />
                                                            <a href="fake_url" className="dropdown-item"><i className="dropdown-icon fa fa-copy" /> Copy to</a>
                                                            <a href="fake_url" className="dropdown-item"><i className="dropdown-icon fa fa-folder" /> Move to</a>
                                                            <a href="fake_url" className="dropdown-item"><i className="dropdown-icon fa fa-edit" /> Rename</a>
                                                            <a href="fake_url" className="dropdown-item"><i className="dropdown-icon fa fa-trash" /> Delete</a>
                                                        </div>
                                                    </div>
                                                </div> */}
                                            </div>
                                            <div className="card-body">
                                                <div className="row clearfix">
                                                    <div className="col-sm-6 col-md-6">
                                                        <div className="form-group">
                                                            <label className="form-label">First Name</label>
                                                            <input
                                                                type="text"
                                                                name='first_name'
                                                                className={`form-control${this.state.errors && this.state.errors.first_name ? ' is-invalid' : ''}`} placeholder="First Name"
                                                                value={employee.first_name || ""}
                                                                onChange={this.handleProfileChange}
                                                                required
                                                            />
                                                            {this.state.errors && this.state.errors.first_name && (
                                                                <div className="invalid-feedback d-block">{this.state.errors.first_name}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6 col-md-6">
                                                        <div className="form-group">
                                                            <label className="form-label">Last Name</label>
                                                            <input
                                                                type="text"
                                                                name='last_name'
                                                                className={`form-control${this.state.errors && this.state.errors.last_name ? ' is-invalid' : ''}`}
                                                                placeholder="Last Name"
                                                                value={employee.last_name || ""}
                                                                onChange={this.handleProfileChange}
                                                                required
                                                            />
                                                            {this.state.errors && this.state.errors.last_name && (
                                                                <div className="invalid-feedback d-block">{this.state.errors.last_name}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-4 col-md-4">
                                                        <div className="form-group">
                                                            <label className="form-label">Email address</label>
                                                            <input
                                                                type="email"
                                                                name='email'
                                                                className={`form-control${this.state.errors && this.state.errors.email ? ' is-invalid' : ''}`}
                                                                placeholder="Email"
                                                                value={employee.email || ""}
                                                                onChange={this.handleProfileChange}
                                                                required
                                                            />
                                                            {this.state.errors && this.state.errors.email && (
                                                                <div className="invalid-feedback d-block">{this.state.errors.email}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {/* <div className="col-sm-4 col-md-4">
                                                        <div className="form-group">
                                                            <label className="form-label">Mobile No</label>
                                                            <input
                                                                type="tel"
                                                                name="mobile_no1"
                                                                id="mobile_no1"
                                                                className="form-control"
                                                                placeholder="Enter Mobile No"
                                                                value={employee.mobile_no1 || ""}
                                                                onChange={this.handleProfileChange}
                                                            />
                                                        </div>
                                                    </div> */}
                                                    <div className="col-sm-4 col-md-4">
                                                        <div className="form-group">
                                                            <label className="form-label">Gender</label>
                                                            <select 
                                                                name="gender"
                                                                className={`form-control${this.state.errors && this.state.errors.gender ? ' is-invalid' : ''}`}
                                                                id='gender'
                                                                value={employee.gender || ""}
                                                                onChange={this.handleProfileChange}
                                                                required
                                                            >
                                                                <option value="">Select Gender</option>
                                                                <option value="male" >Male</option>
                                                                <option value="female" >Female</option>
                                                            </select>
                                                            {this.state.errors && this.state.errors.gender && (
                                                                <div className="invalid-feedback d-block">{this.state.errors.gender}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4 col-sm-12">
                                                        <div className="form-group">
                                                            <label className="form-label">DOB</label>
                                                            <input
                                                                type="date"
                                                                id="dob"
                                                                name="dob"
                                                                className={`form-control${this.state.errors && this.state.errors.dob ? ' is-invalid' : ''}`}
                                                                value={employee.dob || ""}
                                                                onChange={this.handleProfileChange}
                                                                required
                                                            />
                                                            {this.state.errors && this.state.errors.dob && (
                                                                <div className="invalid-feedback d-block">{this.state.errors.dob}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6 col-md-6">
                                                        <label className="form-label">Select Department</label>
                                                        <div className="form-group">
                                                            <select
                                                                className={`form-control show-tick${this.state.errors && this.state.errors.department_id ? ' is-invalid' : ''}`}
                                                                value={employee.department_id || ""}
                                                                onChange={this.handleProfileChange}
                                                                name="department_id"
                                                                disabled={window.user && (window.user.role === 'employee')}
                                                            >
                                                                <option value="">Select Department</option>
                                                                {this.state.departments.map((dept) => (
                                                                    <option key={dept.id} value={dept.id}>
                                                                        {dept.department_name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            {this.state.errors && this.state.errors.department_id && (
                                                                <div className="invalid-feedback d-block">{this.state.errors.department_id}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6 col-md-6">
                                                    <div className="form-group">
                                                        <label className="form-label">Joining Date</label>
                                                        <input
                                                            type="date"
                                                            id="joining_date"
                                                            name="joining_date"
                                                            className={`form-control${this.state.errors && this.state.errors.joining_date ? ' is-invalid' : ''}`}
                                                            value={employee.joining_date || ""}
                                                            onChange={this.handleProfileChange}
                                                            disabled={window.user && (window.user.role === 'employee')}
                                                        />
                                                        {this.state.errors && this.state.errors.joining_date && (
                                                            <div className="invalid-feedback d-block">{this.state.errors.joining_date}</div>
                                                        )}
                                                    </div>
                                                    </div>
                                                    <div className="col-sm-4 col-md-4">
                                                    <div className="form-group">
                                                        <label className="form-label">Mobile No (1)</label>
                                                        <input
                                                            type="tel"
                                                            name="mobile_no1"
                                                            id="mobile_no1"
                                                            className="form-control"
                                                            placeholder="Enter Mobile No"
                                                            value={employee.mobile_no1 || ""}
                                                            onChange={this.handleProfileChange}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-sm-4 col-md-4">
                                                    <div className="form-group">
                                                        <label className="form-label">Mobile No (2)</label>
                                                        <input
                                                            type="tel"
                                                            name="mobile_no2"
                                                            id="mobile_no2"
                                                            className="form-control"
                                                            placeholder="Enter Mobile No"
                                                            value={employee.mobile_no2 || ""}
                                                            onChange={this.handleProfileChange}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-sm-4 col-md-4">
                                                    <div className="form-group">
                                                        <label className="form-label">Password</label>
                                                        <input
                                                            type="password"
                                                            name="password"
                                                            id="password"
                                                            className="form-control"
                                                            placeholder=" Enter password"
                                                            // value={employee.password || ""}
                                                            onChange={this.handleProfileChange}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-12">
                                                    <div className="form-group">
                                                        <label className="form-label">Address Line 1</label>
                                                        <input
                                                            type="text"
                                                            name="address_line1"
                                                            id="address_line1"
                                                            className="form-control"
                                                            placeholder="Enter Address Line 1"
                                                            value={employee.address_line1 || ""}
                                                            onChange={this.handleProfileChange}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-12">
                                                    <div className="form-group">
                                                        <label className="form-label">Address Line 2</label>
                                                        <input
                                                            type="text"
                                                            name="address_line2"
                                                            id="address_line2"
                                                            className="form-control"
                                                            placeholder="Enter Address Line 2"
                                                            value={employee.address_line2 || ""}
                                                            onChange={this.handleProfileChange}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-sm-6 col-md-4 mb-4">
                                                    <label className="form-label">Emergency Contact 1</label>
                                                    <input
                                                        type="tel"
                                                        name="emergency_contact1"
                                                        id="emergency_contact1"
                                                        className="form-control"
                                                        placeholder="Enter Emergency Contact"
                                                        value={employee.emergency_contact1}
                                                        onChange={this.handleProfileChange}
                                                    />
                                                </div>
                                                <div className="col-sm-6 col-md-4 mb-4">
                                                    <label className="form-label">Emergency Contact 2</label>
                                                    <input
                                                        type="tel"
                                                        name="emergency_contact2"
                                                        id="emergency_contact2"
                                                        className="form-control"
                                                        placeholder="Enter Emergency Contact"
                                                        value={employee.emergency_contact2}
                                                        onChange={this.handleProfileChange}
                                                    />
                                                </div>
                                                <div className="col-sm-6 col-md-4 mb-4">
                                                    <label className="form-label">Emergency Contact 3</label>
                                                    <input
                                                        type="tel"
                                                        name="emergency_contact3"
                                                        id="emergency_contact3"
                                                        className="form-control"
                                                        placeholder="Enter Emergency Contact"
                                                        value={employee.emergency_contact3}
                                                        onChange={this.handleProfileChange}
                                                    />
                                                </div>
                                                
                                                {/* Frontend Skills */}
                                                <div className="row mb-4">
                                                    <h5 className="w-100">Skills</h5>
                                                    <div className="col-sm-6 col-md-12">
                                                        <label className="form-label">Frontend</label>
                                                        <div className="d-flex flex-wrap">
                                                            {frontendSkills.map((skill) => (
                                                                <label key={skill} className="colorinput mr-3 mb-2">
                                                                    <input
                                                                        name="color"
                                                                        type="checkbox"
                                                                        value={skill}
                                                                        checked={skillsFrontend.includes(skill)}
                                                                        onChange={(e) => this.handleSkillChange(e, 'frontend')}
                                                                        className="colorinput-input"
                                                                    />
                                                                    <span className="colorinput-color bg-blue" />
                                                                    <span className={`ml-2 tag tag-${this.getColor(skill)} py-1 px-2`}>{skill}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Backend Skills */}
                                                    <div className="col-sm-6 col-md-12">
                                                        <label className="form-label">Backend</label>
                                                        <div className="d-flex flex-wrap">
                                                            {backendSkills.map((skill) => (
                                                                <label key={skill} className="colorinput mr-3 mb-2">
                                                                    <input
                                                                        name="color"
                                                                        type="checkbox"
                                                                        value={skill}
                                                                        checked={skillsBackend.includes(skill)}
                                                                        onChange={(e) => this.handleSkillChange(e, 'backend')}
                                                                        className="colorinput-input"
                                                                    />
                                                                    <span className="colorinput-color bg-blue" />
                                                                    <span className={`ml-2 tag tag-${this.getColor(skill)} py-1 px-2`}>{skill}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                      
                                                    <div className="col-md-12">
                                                        <div className="form-group mb-0">
                                                            <label className="form-label">About Me</label>
                                                            <textarea rows={5} name='about_me' className="form-control" placeholder="Here can be your description" value={employee.about_me || ""} onChange={this.handleProfileChange}/>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card-footer text-right">
                                                <button type="submit" className="btn btn-primary" onClick={this.updateProfile}>Update Profile</button>
                                            </div>
                                        </div>
                                    </div>
                                    {/* <div className="tab-pane fade" id="pills-blog" role="tabpanel" aria-labelledby="pills-blog-tab">
                                        <div className="card">
                                            <div className="card-body">
                                                <div className="new_post">
                                                    <div className="form-group">
                                                        <textarea rows={4} className="form-control no-resize" placeholder="Please type what you want..." defaultValue={""} />
                                                    </div>
                                                    <div className="mt-4 text-right">
                                                        <button className="btn btn-warning"><i className="icon-link" /></button>
                                                        <button className="btn btn-warning"><i className="icon-camera" /></button>
                                                        <button className="btn btn-primary">Post</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="card blog_single_post">
                                            <div className="img-post">
                                                <img className="d-block img-fluid" src="../assets/images/gallery/6.jpg" alt="First slide" />
                                            </div>
                                            <div className="card-body">
                                                <h4><a href="/#">All photographs are accurate</a></h4>
                                                <p>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal</p>
                                            </div>
                                            <div className="footer">
                                                <div className="actions">
                                                    <a href="fake_url;" className="btn btn-outline-secondary">Continue Reading</a>
                                                </div>
                                                <ul className="stats list-unstyled">
                                                    <li><a href="fake_url;">General</a></li>
                                                    <li><a href="fake_url;" className="icon-heart"> 28</a></li>
                                                    <li><a href="fake_url;" className="icon-bubbles"> 128</a></li>
                                                </ul>
                                            </div>
                                            <ul className="list-group card-list-group">
                                                <li className="list-group-item py-5">
                                                    <div className="media">
                                                        <img className="media-object avatar avatar-md mr-4" src="../assets/images/xs/avatar3.jpg" alt="fake_url" />
                                                        <div className="media-body">
                                                            <div className="media-heading">
                                                                <small className="float-right text-muted">4 min</small>
                                                                <h5>Peter Richards</h5>
                                                            </div>
                                                            <div>
                                                                Aenean lacinia bibendum nulla sed consectetur. Vestibulum id ligula porta felis euismod semper. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Cras
                                                                justo odio, dapibus ac facilisis in, egestas eget quam. Vestibulum id ligula porta felis euismod semper. Cum sociis natoque penatibus et magnis dis parturient montes,
                                                                nascetur ridiculus mus.
                                                        </div>
                                                            <ul className="media-list">
                                                                <li className="media mt-4">
                                                                    <img className="media-object avatar mr-4" src="../assets/images/xs/avatar1.jpg" alt="fake_url" />
                                                                    <div className="media-body">
                                                                        <strong>Debra Beck: </strong>
                                                                        Donec id elit non mi porta gravida at eget metus. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Donec ullamcorper nulla non metus
                                                                        auctor fringilla. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Sed posuere consectetur est at lobortis.
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="card blog_single_post">
                                            <div className="img-post">
                                                <img className="d-block img-fluid" src="../assets/images/gallery/4.jpg" alt="First slide" />
                                            </div>
                                            <div className="card-body">
                                                <h4><a href="/#">All photographs are accurate</a></h4>
                                                <p>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal</p>
                                            </div>
                                            <div className="footer">
                                                <div className="actions">
                                                    <a href="fake_url;" className="btn btn-outline-secondary">Continue Reading</a>
                                                </div>
                                                <ul className="stats list-unstyled">
                                                    <li><a href="fake_url;">General</a></li>
                                                    <li><a href="fake_url;" className="icon-heart"> 28</a></li>
                                                    <li><a href="fake_url;" className="icon-bubbles"> 128</a></li>
                                                </ul>
                                            </div>
                                            <ul className="list-group card-list-group">
                                                <li className="list-group-item py-5">
                                                    <div className="media">
                                                        <img className="media-object avatar avatar-md mr-4" src="../assets/images/xs/avatar7.jpg" alt="fake_url" />
                                                        <div className="media-body">
                                                            <div className="media-heading">
                                                                <small className="float-right text-muted">12 min</small>
                                                                <h5>Peter Richards</h5>
                                                            </div>
                                                            <div>
                                                                Donec id elit non mi porta gravida at eget metus. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Cum sociis natoque penatibus et magnis dis
                                                                parturient montes, nascetur ridiculus mus. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                                                            </div>
                                                        </div>
                                                    </div>
                                                </li>
                                                <li className="list-group-item py-5">
                                                    <div className="media">
                                                        <img className="media-object avatar avatar-md mr-4" src="../assets/images/xs/avatar6.jpg" alt="fake_url" />
                                                        <div className="media-body">
                                                            <div className="media-heading">
                                                                <small className="float-right text-muted">34 min</small>
                                                                <h5>Peter Richards</h5>
                                                            </div>
                                                            <div>
                                                                Donec ullamcorper nulla non metus auctor fringilla. Vestibulum id ligula porta felis euismod semper. Aenean eu leo quam. Pellentesque ornare sem lacinia quam
                                                                venenatis vestibulum. Etiam porta sem malesuada magna mollis euismod. Donec sed odio dui.
                                                            </div>
                                                            <ul className="media-list">
                                                                <li className="media mt-4">
                                                                    <img className="media-object avatar mr-4" src="../assets/images/xs/avatar5.jpg" alt="fake_url" />
                                                                    <div className="media-body">
                                                                        <strong>Wayne Holland: </strong>
                                                                        Donec id elit non mi porta gravida at eget metus. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Donec ullamcorper nulla non metus
                                                                        auctor fringilla. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Sed posuere consectetur est at lobortis.
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </li>
                                            </ul>
                                        </div>
                                    </div> */}
                                </div>
                            </div>
                            {/* <div className="col-lg-4 col-md-12">
                                <div className="card">
                                    <div className="card-body">
                                        <div className="widgets1">
                                            <div className="icon">
                                                <i className="icon-trophy text-success font-30" />
                                            </div>
                                            <div className="details">
                                                <h6 className="mb-0 font600">Total Earned</h6>
                                                <span className="mb-0">$96K +</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="card">
                                    <div className="card-body">
                                        <div className="widgets1">
                                            <div className="icon">
                                                <i className="icon-heart text-warning font-30" />
                                            </div>
                                            <div className="details">
                                                <h6 className="mb-0 font600">Total Likes</h6>
                                                <span className="mb-0">6,270</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="card">
                                    <div className="card-body">
                                        <div className="widgets1">
                                            <div className="icon">
                                                <i className="icon-handbag text-danger font-30" />
                                            </div>
                                            <div className="details">
                                                <h6 className="mb-0 font600">Delivered</h6>
                                                <span className="mb-0">720 Delivered</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="card">
                                    <div className="card-body">
                                        <div className="widgets1">
                                            <div className="icon">
                                                <i className="icon-user text-primary font-30" />
                                            </div>
                                            <div className="details">
                                                <h6 className="mb-0 font600">Jobs</h6>
                                                <span className="mb-0">614</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="card">
                                    <div className="card-header">
                                        <h3 className="card-title">Followers</h3>
                                        <div className="card-options">
                                            <a href="/#" className="card-options-collapse" data-toggle="card-collapse"><i className="fe fe-chevron-up" /></a>
                                            <a href="/#" className="card-options-remove" data-toggle="card-remove"><i className="fe fe-x" /></a>
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <ul className="right_chat list-unstyled mb-0">
                                            <li className="online">
                                                <a href="fake_url;">
                                                    <div className="media">
                                                        <img className="media-object " src="../assets/images/xs/avatar4.jpg" alt="fake_url" />
                                                        <div className="media-body">
                                                            <span className="name">Donald Gardner</span>
                                                            <span className="message">Designer, Blogger</span>
                                                            <span className="badge badge-outline status" />
                                                        </div>
                                                    </div>
                                                </a>
                                            </li>
                                            <li className="offline">
                                                <a href="fake_url;">
                                                    <div className="media">
                                                        <img className="media-object " src="../assets/images/xs/avatar1.jpg" alt="fake_url" />
                                                        <div className="media-body">
                                                            <span className="name">Nancy Flanary</span>
                                                            <span className="message">Art director, Movie Cut</span>
                                                            <span className="badge badge-outline status" />
                                                        </div>
                                                    </div>
                                                </a>
                                            </li>
                                            <li className="online">
                                                <a href="fake_url;">
                                                    <div className="media">
                                                        <img className="media-object " src="../assets/images/xs/avatar3.jpg" alt="fake_url" />
                                                        <div className="media-body">
                                                            <span className="name">Phillip Smith</span>
                                                            <span className="message">Writter, Mag Editor</span>
                                                            <span className="badge badge-outline status" />
                                                        </div>
                                                    </div>
                                                </a>
                                            </li>
                                            <li className="online">
                                                <a href="fake_url;">
                                                    <div className="media">
                                                        <img className="media-object " src="../assets/images/xs/avatar4.jpg" alt="fake_url" />
                                                        <div className="media-body">
                                                            <span className="name">Donald Gardner</span>
                                                            <span className="message">Designer, Blogger</span>
                                                            <span className="badge badge-outline status" />
                                                        </div>
                                                    </div>
                                                </a>
                                            </li>
                                            <li className="offline">
                                                <a href="fake_url;">
                                                    <div className="media">
                                                        <img className="media-object " src="../assets/images/xs/avatar1.jpg" alt="fake_url" />
                                                        <div className="media-body">
                                                            <span className="name">Nancy Flanary</span>
                                                            <span className="message">Art director, Movie Cut</span>
                                                            <span className="badge badge-outline status" />
                                                        </div>
                                                    </div>
                                                </a>
                                            </li>
                                            <li className="online">
                                                <a href="fake_url;">
                                                    <div className="media">
                                                        <img className="media-object " src="../assets/images/xs/avatar3.jpg" alt="fake_url" />
                                                        <div className="media-body">
                                                            <span className="name">Phillip Smith</span>
                                                            <span className="message">Writter, Mag Editor</span>
                                                            <span className="badge badge-outline status" />
                                                        </div>
                                                    </div>
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div> */}
                        </div>
                    </div>
                </div>
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
                                            this.setState({ openFileSelectModel: false,showGallery:true });
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
                                            <div className="d-flex flex-wrap gap-3 px-2 align-items-start justify-content-start">
                                                {this.state.images.map((image, index) => (
                                                    <div key={index} className="position-relative cursor-pointer mr-2">
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
                                                                    style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                                                                />
                                                            </div>
                                                        </label>
                                                    </div>
                                                ))}
                                                
                                                <label className="cursor-pointer">
                                                    <div className="border rounded-2 mt-1 ml-1 border-dashed hover-bg-light">
                                                        <div 
                                                            style={{
                                                                width: '80px',
                                                                height: '80px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                color: '#6c757d'
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
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="modal-footer border-b-2 pt-2 d-flex justify-content-end">
                                    <button
                                        className="btn btn-outline-secondary me-3 px-4"
                                        onClick={() => {
                                            this.setState({ openFileSelectModel: false,showGallery:true });
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
                                            Next
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

      getColor(skill) {
            const colors = {
            HTML: "pink",
            CSS: "blue",
            JavaScript: "yellow",
            React: "cyan",
            Angular: "red",
            Vue: "green",
            PHP: "pink",
            Laravel: "blue",
            Python: "yellow",
            "Node.js": "cyan",
            Symfony: "red",
            Django: "purple",
            "Ruby on Rails": "orange",
            };
            return colors[skill] || "gray";
        }
}

const mapStateToProps = state => ({
    fixNavbar: state.settings.isFixNavbar
})

const mapDispatchToProps = dispatch => ({})
export default connect(mapStateToProps, mapDispatchToProps)(ViewEmployee);