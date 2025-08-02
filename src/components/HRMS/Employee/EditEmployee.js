import React, { Component } from 'react';
import { connect } from 'react-redux';
import AlertMessages from '../../common/AlertMessages';
import CropperModal from './CropperModal';
import { getService } from '../../../services/getService';
import { validateFields } from '../../common/validations';
import InputField from '../../common/formInputs/InputField';
import CheckFileAvailability from './CheckFileAvailability';
class EditEmployee extends Component {
    constructor(props) {
        super(props);
        // Assuming the employee data is passed as props or initialized in state
        this.state = {
            employeeId: '',
            firstName: '',
            lastName: '',
            email: '',
            selectedDepartment: "",
            departments: [],
            gender: '',
            photo: null,
            photoUrl: '',
            dob: '',
            joiningDate: '',
            mobile1: '',
            mobile2: '',
            password: '', // Added password field
            address1: '',
            address2: '',
            emergencyContact1: '',
            emergencyContact2: '',
            emergencyContact3: '',
            skillsFrontend: [],
            skillsBackend: [],
            bankAccountName: '',
            bankAccountNo: '',
            bankName: '',
            ifscCode: '',
            bankAddress: '',
            salaryDetails: [],
            aadharCardNumber: '',
            aadharCardFile: '',
            aadharCardFileUrl: '',
            drivingLicenseNumber: '',
            drivingLicenseFile: '',
            drivingLicenseFileUrl: '',
            panCardNumber: '',
            panCardFile: '',
            panCardFileUrl: '',
            facebook: '',
            twitter: '',
            linkedin: '',
            instagram: '',
            upworkProfile: '',
            resume: '',
            resumeUrl: '',
            visibilityPriority: 0,
            statisticsVisibilityStatus:0,
            status: true,
            selectedEmployee: '',
            successMessage: "",
            showSuccess: false,
            errorMessage: "",
            showError: false,
            errors: {},
            ButtonLoading: false,
            showCropper: false,
            cropperImage: null,
            photoInputName: '',
        };
        this.fieldRefs = {
            firstName: React.createRef(),
            lastName: React.createRef(),
            email: React.createRef(),
            selectedDepartment: React.createRef(),
            gender: React.createRef(),
            dob: React.createRef(),
            joiningDate: React.createRef(),
            mobile1: React.createRef(),
            mobile2: React.createRef(),
            password: React.createRef(),
            emergencyContact1: React.createRef(),
            emergencyContact2: React.createRef(),
            emergencyContact3: React.createRef(),
            bankAccountNo: React.createRef(),
            visibilityPriority: React.createRef(),
            salaryAmount: React.createRef(),
        };
    }

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
        const { selectedSalaryDetails = [], employeeId } = this.props.location.state || {}; // Retrieve employee data
        this.setState({employeeId});
        if (!employeeId) {
            console.error("No employee ID found in location state.");
            return;
        }

        // Fetch latest employee data from API
        // fetch(`${process.env.REACT_APP_API_URL}/get_employees.php?action=view&user_id=${employeeId}`, {
        //     method: "GET",
        // })
        // .then(response => response.json())
        getService.getCall('get_employees.php', {
                    action: 'view',
                    user_id:employeeId
                })
        .then(data => {
            if (data.status === "success" && data.data) {
                const employee = data.data;

                const skillsFrontend = this.parseSkills(employee.frontend_skills);
                const skillsBackend = this.parseSkills(employee.backend_skills);

                // Remove duplicates between frontend and backend
                const uniqueFrontendSkills = skillsFrontend.filter(skill => !skillsBackend.includes(skill));
                const uniqueBackendSkills = skillsBackend.filter(skill => !skillsFrontend.includes(skill));

                this.setState({
                    selectedDepartment: employee.department_id,
                    firstName: employee.first_name,
                    lastName: employee.last_name,
                    email: employee.email,
                    gender: employee.gender,
                    photo: employee.profile,
                    dob: employee.dob,
                    joiningDate: employee.joining_date,
                    mobile1: employee.mobile_no1,
                    mobile2: employee.mobile_no2,
                    address1: employee.address_line1,
                    address2: employee.address_line2,
                    emergencyContact1: employee.emergency_contact1,
                    emergencyContact2: employee.emergency_contact2,
                    emergencyContact3: employee.emergency_contact3,
                    bankAccountName: employee.account_holder_name,
                    bankAccountNo: employee.account_number,
                    bankName: employee.bank_name,
                    ifscCode: employee.ifsc_code,
                    bankAddress: employee.bank_address,
                    aadharCardNumber: employee.aadhar_card_number,
                    aadharCardFile: employee.aadhar_card_file,
                    drivingLicenseNumber: employee.driving_license_number,
                    drivingLicenseFile: employee.driving_license_file,
                    panCardNumber: employee.pan_card_number,
                    panCardFile: employee.pan_card_file,
                    facebook: employee.facebook_url,
                    twitter: employee.twitter_url,
                    linkedin: employee.linkedin_url,
                    instagram: employee.instagram_url,
                    upworkProfile: employee.upwork_profile_url,
                    resume: employee.resume,
                    skillsFrontend: uniqueFrontendSkills,
                    skillsBackend: uniqueBackendSkills,
                    visibilityPriority: employee.visibility_priority || 0,
                    statisticsVisibilityStatus: employee.statistics_visibility_status,
                    status: employee.status,
                });

            } else {
                console.error("Failed to fetch employee data.");
            }
        })
        .catch(error => {
            console.error("Error fetching employee details:", error);
        });


        getService.getCall('departments.php', {
            action: 'view'
        })
        .then(data => {
			this.setState({ departments: data.data });
        })
        .catch(error => console.error("Error fetching departments:", error));

        if (selectedSalaryDetails) {
            // Transform salaryDetails if necessary
            const formattedSalaryDetails = selectedSalaryDetails.map((detail) => ({
                salaryId: detail.id || '',
                salarySource: detail.source || "",
                salaryAmount: detail.amount || 0,
                fromDate: detail.from_date || "",
                toDate: detail.to_date || "",
            }));
    
            // Store formatted data in state
            this.setState({ salaryDetails: formattedSalaryDetails });
        } else {
            console.error("No salary details found in location state.");
        }
    }

    /**
     * Parses skills data from string or array.
     */
    parseSkills(skills) {
        if (typeof skills === 'string') {
            return skills.replace(/["[\]]/g, '').split(',').map(skill => skill.trim());
        }
        return Array.isArray(skills) ? skills : [];
    }

    handleChange = (event) => {
		const { name, value } = event.target;
		
		// Update state for the selected user
        this.setState((prevState) => ({
            [name]: value,
        }));
    };

    handleSalaryDetails = (index, field, value) => {
        this.setState((prevState) => {
            const updatedEntries = [...this.state.salaryDetails];
            updatedEntries[index][field] = value;
            return {
                salaryDetails: updatedEntries,
            };
        });
    };

    handleFileChange = (e) => {
        const { name, files } = e.target;
        const file = files[0];
    
        if (file && name === "photo") {
            // Validate file type for photo
            const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg'];
            const fileType = file.type.toLowerCase();
            
            if (!allowedTypes.includes(fileType)) {
                this.setState({
                    errors: { 
                        ...this.state.errors, 
                        photo: "Only allowed PNG, JPG, or JPEG image files for the photo."
                    },
                    showError: false,
                    errorMessage: ""
                });
                // Clear the file input
                e.target.value = '';
                return;
            }
            
            // Validate file size (5MB limit)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                this.setState({
                    errors: { 
                        ...this.state.errors, 
                        photo: "Photo file size should be less than 5MB."
                    },
                    showError: false,
                    errorMessage: ""
                });
                e.target.value = '';
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (ev) => {
                this.setState({
                    cropperImage: ev.target.result,
                    showCropper: true,
                    photoInputName: name,
                });
            };
            reader.readAsDataURL(file);
        } else if (file && name === "resume") {
            // Validate file type for resume
            const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/rtf'];
            const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.gd oc'];
            const fileType = file.type.toLowerCase();
            const fileName = file.name.toLowerCase();
            
            // Check both MIME type and file extension
            const isValidType = allowedTypes.includes(fileType) || 
                               allowedExtensions.some(ext => fileName.endsWith(ext.toLowerCase()));
            
            if (!isValidType) {
                this.setState({
                    errors: { 
                        ...this.state.errors, 
                        resume: `File is not a valid resume file. Only PDF, DOC, DOCX, TXT, RTF, and GD OC files are allowed.`
                    },
                    showError: false,
                    errorMessage: ""
                });
                // Clear the file input
                e.target.value = '';
                return;
            }
            
            // Validate file size (10MB limit for resume)
            const maxSize = 10 * 1024 * 1024;
            if (file.size > maxSize) {
                this.setState({
                    errors: { 
                        ...this.state.errors, 
                        resume: "Resume file size should be less than 10MB."
                    },
                    showError: false,
                    errorMessage: ""
                });
                e.target.value = '';
                return;
            }
            
            this.setState({
                [name]: file,
                [`${name}Url`]: URL.createObjectURL(file),
                errors: { ...this.state.errors, resume: '' }
            });
        } else if (file) {
            this.setState({
                [name]: file,
                [`${name}Url`]: URL.createObjectURL(file),
            });
        }
    };

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
        });
    };    

    handleBack = () => {
        this.props.history.goBack(); // Navigate to the previous page
    };

    updateEmployee  = () => {
        const {id, role} = window.user;
        const {salaryDetails } = this.state;
        const { 
            employeeId,
            selectedDepartment,
            firstName,
            lastName,
            email,
            gender,
            photo,
            dob,
            joiningDate,
            mobile1,
            mobile2,
            password,
            address1,
            address2,
            emergencyContact1,
            emergencyContact2,
            emergencyContact3,
            skillsFrontend,
            skillsBackend,
            bankAccountName,
            bankAccountNo,
            bankName,
            ifscCode,
            bankAddress,
            aadharCardNumber,
            aadharCardFile,
            drivingLicenseNumber,
            drivingLicenseFile,
            panCardNumber,
            panCardFile,
            facebook,
            salaryAmount,
            twitter,
            linkedin,
            instagram,
            upworkProfile,
            resume,
            visibilityPriority,
            statisticsVisibilityStatus,
            status
        } = this.state;



        // Usage:

        const validationSchema = [
        { name: 'firstName', value: firstName, type: 'name', required: true, messageName:'First Name'  },
        { name: 'lastName', value: lastName, type: 'name', required: true, messageName:'Last Name' },
        { name: 'email', value: email, type: 'email', required: true, messageName:'Email' },
        { name: 'selectedDepartment', value: selectedDepartment, required: true, messageName:'Department' },
        { name: 'gender', value: gender, required: true, messageName: 'Gender' },
        { name: 'password', value: password, type: 'password', required: false, messageName:'Password' },
        { name: 'dob', value: dob, type: 'date', required: true, messageName:'Date of Birth'},
        { name: 'mobile1', value: mobile1, type: 'mobile', required: true, messageName:'Mobile Number' },
        { name: 'mobile2', value: mobile2, type: 'mobile', messageName:'Mobile Number' },
        { name: 'emergencyContact1', value: emergencyContact1, type: 'mobile', messageName:'Mobile Number' },
        { name: 'emergencyContact2', value: emergencyContact2, type: 'mobile',  messageName:'Mobile Number' },
        { name: 'emergencyContact3', value: emergencyContact3, type: 'mobile',  messageName:'Mobile Number'  },
        { name: 'joiningDate', value: joiningDate, type: 'date', required: true,  messageName:'Joining Date'  },
        { name: 'bankAccountNo', value: bankAccountNo, messageName: 'Account Number', maxLength: 20 },
        { name: 'salaryAmount', value:salaryAmount, messageName: 'Salary Amount', maxLength: 8 },
        { name: 'visibilityPriority', value: visibilityPriority, type: 'visibilityPriority', messageName:'Visibility Priority' },
        ];

        // Add salary amount validation only if salary details exist
        // if (salaryDetails && salaryDetails.length > 0 && salaryDetails[0].salaryAmount) {
        //     validationSchema.push({ 
        //         name: 'salaryAmount', 
        //         value: salaryDetails[0].salaryAmount, 
        //         messageName: 'Salary Amount', 
        //         maxLength: 8 
        //     });
        // }

        const errors = validateFields(validationSchema);

        // Debug: Log validation results
        console.log('Validation Schema:', validationSchema);
        console.log('Validation Errors:', errors);

        // Show errors if any and scrolled on there
        if (Object.keys(errors).length > 0) {
            console.log('Validation errors found:', errors);
            this.setState({ errors, ButtonLoading: false, showError: false, showSuccess: false }, () => {
                const firstErrorField = Object.keys(errors)[0];
                const ref = this.fieldRefs[firstErrorField];
                if (ref && ref.current) {
                    ref.current.focus();
                    ref.current.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
                } else {
                    console.warn('No ref found for field:', firstErrorField);
                }
            });
            return;
        } else {
            this.setState({ errors: {} });
        }

        this.setState({ ButtonLoading: true });

		const updateEmployeeData = new FormData();
        updateEmployeeData.append('department_id', selectedDepartment)
        updateEmployeeData.append('first_name', firstName);
        updateEmployeeData.append('last_name', lastName);
        updateEmployeeData.append('email', email);
        updateEmployeeData.append('gender', gender);
        updateEmployeeData.append('photo', photo);
        updateEmployeeData.append('dob',dob);
        updateEmployeeData.append('joining_date',joiningDate);
        updateEmployeeData.append('mobile_no1',mobile1);
        updateEmployeeData.append('mobile_no2',mobile2);
        if (password && password.trim() !== "") {
            updateEmployeeData.append('password', password);
        }
        updateEmployeeData.append('address_line1', address1);
        updateEmployeeData.append('address_line2', address2);
        updateEmployeeData.append('emergency_contact1', emergencyContact1);
        updateEmployeeData.append('emergency_contact2', emergencyContact2);
        updateEmployeeData.append('emergency_contact3', emergencyContact3);
        updateEmployeeData.append('frontend_skills', JSON.stringify(skillsFrontend));
        updateEmployeeData.append('backend_skills', JSON.stringify(skillsBackend));
        updateEmployeeData.append('account_holder_name', bankAccountName);
        updateEmployeeData.append('account_number', bankAccountNo);
        updateEmployeeData.append('bank_name', bankName);
        updateEmployeeData.append('ifsc_code', ifscCode);
        updateEmployeeData.append('bank_address', bankAddress);
        if (salaryDetails && Array.isArray(salaryDetails)) {
            salaryDetails.forEach((detail, index) => {
                updateEmployeeData.append(`salaryDetails[${index}][id]`, detail.salaryId);
                updateEmployeeData.append(`salaryDetails[${index}][source]`, detail.salarySource);
                updateEmployeeData.append(`salaryDetails[${index}][amount]`, detail.salaryAmount);
                updateEmployeeData.append(`salaryDetails[${index}][from_date]`, detail.fromDate);
                updateEmployeeData.append(`salaryDetails[${index}][to_date]`, detail.toDate);
            });
        }
        updateEmployeeData.append('aadhar_card_number', aadharCardNumber);
        updateEmployeeData.append('aadhar_card_file', aadharCardFile);
        updateEmployeeData.append('driving_license_number', drivingLicenseNumber);
        updateEmployeeData.append('driving_license_file', drivingLicenseFile);
        updateEmployeeData.append('pan_card_number', panCardNumber);
        updateEmployeeData.append('pan_card_file', panCardFile);
        updateEmployeeData.append('facebook_url', facebook);
        updateEmployeeData.append('twitter_url', twitter);
        updateEmployeeData.append('linkedin_url', linkedin);
        updateEmployeeData.append('instagram_url', instagram);
        updateEmployeeData.append('upwork_profile_url', upworkProfile);
        updateEmployeeData.append('resume', resume);
        updateEmployeeData.append('visibility_priority', visibilityPriority);
        updateEmployeeData.append('statistics_visibility_status', statisticsVisibilityStatus);
        updateEmployeeData.append('status', status);
        
        updateEmployeeData.append("logged_in_employee_id", id);
        updateEmployeeData.append('logged_in_employee_role', role); // Logged-in employee role
        getService.editCall('get_employees.php','edit',updateEmployeeData, null, employeeId )
        .then((data) => {
            if (data && data.status === "success") {
                this.setState((prevState) => {
                    /* const updatedEmployeeData = prevState.users.map((user) =>
                        user.id === employeeId ? { ...user, ...data.data } : user
                    ); */
    
                    return {
                        ...prevState,
                        ...data.data,
                        // users: updatedEmployeeData,
                        showSuccess: true,
                        successMessage: "Employee updated successfully!",
                        errorMessage: "",
                        showError: false,
                        ButtonLoading: false,
                    };
                });
                this.setState({ password:"" });
                setTimeout(this.dismissMessages, 5000);
            } else {
                console.error("Failed to update employee. Response:", data);
                this.setState({
                    errorMessage: data.message || "Failed to update employee.",
                    showError: true,
                    showSuccess: false,
                    ButtonLoading: false,
                });
            }
        })
        .catch(error => {
            console.error("Error updating employee:", error);
            this.setState({
                errorMessage: "An error occurred while updating the employee.",
                showError: true,
                showSuccess: false,
                ButtonLoading: false,
            });

            // setTimeout(this.dismissMessages, 3000);
        });
    }

    handleCropperCrop = (blob) => {
        const croppedFile = new File([blob], "updateimage.jpg", { type: "image/jpeg" });
        this.setState({
            photo: croppedFile,
            photoUrl: URL.createObjectURL(croppedFile),
            showCropper: false,
            cropperImage: null,
        });
    };
    handleCropperCancel = () => {
        this.setState({ showCropper: false, cropperImage: null });
    };
    render() {
        const { fixNavbar } = this.props;
        const { firstName, lastName, email, gender, photo, photoUrl, dob, joiningDate, mobile1, mobile2, password, address1, address2, emergencyContact1, emergencyContact2, emergencyContact3, skillsFrontend, skillsBackend,  bankAccountName, bankAccountNo, bankName, ifscCode, bankAddress, salaryDetails, aadharCardNumber, aadharCardFile, aadharCardFileUrl, drivingLicenseNumber, drivingLicenseFile, drivingLicenseFileUrl, panCardNumber, panCardFile, panCardFileUrl, facebook, twitter, linkedin, instagram, upworkProfile, resume, resumeUrl, visibilityPriority, statisticsVisibilityStatus, status, showSuccess,successMessage,showError, errorMessage, errors } = this.state;
        

        // Frontend and Backend Skill Options
        const frontendSkills = ["HTML", "CSS", "JavaScript", "React", "Angular", "Vue"];
        const backendSkills = ["PHP", "Laravel", "Python", "Node.js", "Symfony", "Django", "Ruby on Rails"];
        return (
            <>
                {/* Show success and error Messages */}
                <AlertMessages
                    showSuccess={showSuccess}
                    successMessage={successMessage}
                    showError={showError}
                    errorMessage={errorMessage}
                    setShowSuccess={(val) => this.setState({ showSuccess: val })}
                    setShowError={(val) => this.setState({ showError: val })}
                />
                {/* Cropper Show */}
                <CropperModal
                    open={this.state.showCropper}
                    image={this.state.cropperImage}
                    onCrop={this.handleCropperCrop}
                    onCancel={this.handleCropperCancel}
                    aspectRatio={1}
                />
                <div>
                    <div className={`section-body ${fixNavbar ? "marginTop" : ""}`}>
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-12 col-lg-12 card">
                                    {/* <form className="card" onSubmit={this.updateEmployee}> */}
                                        <div className="card-body">
                                            <h3 className="card-title">Edit Employee</h3>
                                            <div className="row">
                                                <div className="col-sm-6 col-md-6">
                                                    <div className="form-group">
                                                        <label className="form-label" htmlFor="firstName">First Name</label>
                                                        <input
                                                            type="text"
                                                            name="firstName"
                                                            id="firstName"
                                                            className={`form-control${this.state.errors.firstName ? ' is-invalid' : ''}`}
                                                            placeholder="Enter First Name"
                                                            value={firstName}
                                                            onChange={this.handleChange}
                                                            ref={this.fieldRefs.firstName}
                                                        />
                                                        {this.state.errors.firstName && (
                                                            <div className="invalid-feedback d-block">{this.state.errors.firstName}</div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="col-sm-6 col-md-6">
                                                    <div className="form-group">
                                                        <label className="form-label">Last Name</label>
                                                        <input
                                                            type="text"
                                                            name="lastName"
                                                            id='lastName'
                                                            className={`form-control${this.state.errors.lastName ? ' is-invalid' : ''}`}
                                                            placeholder="Enter Last Name"
                                                            value={lastName}
                                                            onChange={this.handleChange}
                                                            ref={this.fieldRefs.lastName}
                                                        />
                                                        {this.state.errors.lastName && (
                                                            <div className="invalid-feedback d-block">{this.state.errors.lastName}</div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="col-sm-6 col-md-4">
                                                    <div className="form-group">
                                                        <label className="form-label">Email address</label>
                                                        <input
                                                            type="email"
                                                            name="email"
                                                            id='email'
                                                            className={`form-control${this.state.errors.email ? ' is-invalid' : ''}`}
                                                            placeholder="Enter Email Address"
                                                            value={email}
                                                            onChange={this.handleChange}
                                                            ref={this.fieldRefs.email}
                                                        />
                                                        {this.state.errors.email && (
                                                            <div className="invalid-feedback d-block">{this.state.errors.email}</div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="col-sm-6 col-md-4">
                                                    <div className="form-group">
                                                        <label className="form-label">Gender</label>
                                                        <select 
                                                            name="gender"
                                                            className={`form-control${this.state.errors.gender ? ' is-invalid' : ''}`}
                                                            id='gender'
                                                            value={gender}
                                                            onChange={this.handleChange}
                                                            ref={this.fieldRefs.gender}
                                                        >
                                                            <option value="">Select Gender</option>
                                                            <option value="male" >Male</option>
                                                            <option value="female" >Female</option>
                                                        </select>
                                                        {this.state.errors.gender && (
                                                            <div className="invalid-feedback d-block">{this.state.errors.gender}</div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="col-md-4 col-sm-12">
                                                    <label className="form-label">Select Department</label>
													<div className="form-group">
														<select
															className={`form-control show-tick${this.state.errors.selectedDepartment ? ' is-invalid' : ''}`}
															value={this.state.selectedDepartment}
															onChange={this.handleChange}
															name="selectedDepartment"
                                                            ref={this.fieldRefs.selectedDepartment}
														>
															<option value="">Select Department</option>
															{this.state.departments.map((dept) => (
																<option key={dept.id} value={dept.id}>
																	{dept.department_name}
																</option>
															))}
														</select>
                                                        {this.state.errors.selectedDepartment && (
                                                         <div className="invalid-feedback d-block">{this.state.errors.selectedDepartment}</div>
                                                        )}
													</div>
												</div>
                                                <div className="col-sm-6 col-md-4">
                                                    <div className="form-group">
                                                        <label className="form-label">DOB</label>
                                                        <input
                                                            type="date"
                                                            id="dob"
                                                            name="dob"
                                                            className={`form-control${this.state.errors.dob ? ' is-invalid' : ''}`}
                                                            value={dob}
                                                            onChange={this.handleChange}
                                                            max={new Date().toISOString().split("T")[0]}
                                                            ref={this.fieldRefs.dob}
                                                        />
                                                        {this.state.errors.dob && (
                                                            <div className="invalid-feedback d-block">{this.state.errors.dob}</div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="col-sm-6 col-md-4">
                                                    <div className="form-group">
                                                        <label className="form-label">Joining Date</label>
                                                        <input
                                                            type="date"
                                                            id="joiningDate"
                                                            name="joiningDate"
                                                            className={`form-control${this.state.errors.joiningDate ? ' is-invalid' : ''}`}
                                                            value={joiningDate}
                                                            onChange={this.handleChange}
                                                            ref={this.fieldRefs.joiningDate}
                                                        />
                                                        {this.state.errors.joiningDate && (
                                                            <div className="invalid-feedback d-block">{this.state.errors.joiningDate}</div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="col-sm-6 col-md-4">
                                                    <div className="form-group">
                                                        <label className="form-label">Photo</label>
                                                        <InputField
                                                            type="file"
                                                            name="photo"
                                                            onChange={this.handleFileChange}
                                                            accept=".png,.jpg,.jpeg,image/png,image/jpg,image/jpeg"
                                                        />
                                                        {this.state.errors.photo && (
                                                            <div className="invalid-feedback d-block">{this.state.errors.photo}</div>
                                                        )}

                                                        {photo ? (
                                                            <div className="d-inline-block">
                                                                <a
                                                                    href={
                                                                        photoUrl ? photoUrl : `${process.env.REACT_APP_API_URL}/${photo.name || photo}`
                                                                    }
                                                                    className="text-primary small"
                                                                    style={{ fontWeight: "500", display: "inline-block" }}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                >
                                                                    {photo instanceof File ? this.state.photo.name : this.state.photo.split('/').pop().replace(/^\w+-/, '')}
                                                                </a>
                                                            </div>
                                                        ) : (
                                                            <small>Profile not uploaded</small>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="col-sm-6 col-md-4">
                                                    <div className="form-group">
                                                        <label className="form-label">Mobile No (1)</label>
                                                        <input
                                                            type="tel"
                                                            name="mobile1"
                                                            id="mobile1"
                                                            className={`form-control${this.state.errors.mobile1 ? ' is-invalid' : ''}`}
                                                            placeholder="Enter Mobile No"
                                                            maxLength="10"
                                                            value={mobile1}
                                                            onChange={this.handleChange}
                                                            onInput={(e) => {
                                                                e.target.value = e.target.value.replace(/\D/g, '');
                                                            }}
                                                            ref={this.fieldRefs.mobile1}
                                                        />
                                                        {this.state.errors.mobile1 && (
                                                            <div className="invalid-feedback d-block">{this.state.errors.mobile1}</div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="col-sm-6 col-md-4">
                                                    <div className="form-group">
                                                        <label className="form-label">Mobile No (2)</label>
                                                        <input
                                                            type="tel"
                                                            name="mobile2"
                                                            id="mobile2"
                                                            className={`form-control${this.state.errors.mobile2 ? ' is-invalid' : ''}`}
                                                            placeholder="Enter Mobile No"
                                                            maxLength="10"
                                                            value={mobile2}
                                                            onChange={this.handleChange}
                                                            onInput={(e) => {
                                                                e.target.value = e.target.value.replace(/\D/g, '');
                                                            }}
                                                            ref={this.fieldRefs.mobile2}
                                                        />
                                                        {this.state.errors.mobile2 && (
                                                            <div className="invalid-feedback d-block">{this.state.errors.mobile2}</div>
                                                        )}
                                                    </div>
                                                </div>
                                                    <div className="col-sm-6 col-md-4">
                                                        <div className="form-group">
                                                            <label className="form-label">Password</label>
                                                            <input
                                                                type="password"
                                                                name="password"
                                                                id="password"
                                                                className="form-control"
                                                                placeholder="Enter New Password"
                                                                value={password}
                                                                onChange={this.handleChange}
                                                                ref={this.fieldRefs.password}
                                                            />
                                                        </div>
                                                    </div>
                                                <div className="col-md-12">
                                                    <div className="form-group">
                                                        <label className="form-label">Address Line 1</label>
                                                        <input
                                                            type="text"
                                                            name="address1"
                                                            id="address1"
                                                            className="form-control"
                                                            placeholder="Enter Address Line 1"
                                                            value={address1}
                                                            onChange={this.handleChange}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-12">
                                                    <div className="form-group">
                                                        <label className="form-label">Address Line 2</label>
                                                        <input
                                                            type="text"
                                                            name="address2"
                                                            id="address2"
                                                            className="form-control"
                                                            placeholder="Enter Address Line 2"
                                                            value={address2}
                                                            onChange={this.handleChange}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-sm-6 col-md-4 mb-4">
                                                    <label className="form-label">Emergency Contact 1</label>
                                                    <input
                                                        type="tel"
                                                        name="emergencyContact1"
                                                        id="emergencyContact1"
                                                        className={`form-control${this.state.errors.emergencyContact1 ? ' is-invalid' : ''}`}
                                                        placeholder="Enter Emergency Contact"
                                                        maxLength="10"
                                                        value={emergencyContact1}
                                                        onChange={this.handleChange}
                                                        onInput={(e) => {
                                                            e.target.value = e.target.value.replace(/\D/g, '');
                                                        }}
                                                        ref={this.fieldRefs.emergencyContact1}
                                                    />
                                                    {this.state.errors.emergencyContact1 && (
                                                        <div className="invalid-feedback d-block">{this.state.errors.emergencyContact1}</div>
                                                    )}
                                                </div>
                                                <div className="col-sm-6 col-md-4 mb-4">
                                                    <label className="form-label">Emergency Contact 2</label>
                                                    <input
                                                        type="tel"
                                                        name="emergencyContact2"
                                                        id="emergencyContact2"
                                                        className={`form-control${this.state.errors.emergencyContact2 ? ' is-invalid' : ''}`}
                                                        placeholder="Enter Emergency Contact"
                                                        maxLength="10"
                                                        value={emergencyContact2}
                                                        onChange={this.handleChange}
                                                        onInput={(e) => {
                                                            e.target.value = e.target.value.replace(/\D/g, '');
                                                        }}
                                                        ref={this.fieldRefs.emergencyContact2}
                                                    />
                                                    {this.state.errors.emergencyContact2 && (
                                                        <div className="invalid-feedback d-block">{this.state.errors.emergencyContact2}</div>
                                                    )}
                                                </div>
                                                <div className="col-sm-6 col-md-4 mb-4">
                                                    <label className="form-label">Emergency Contact 3</label>
                                                    <input
                                                        type="tel"
                                                        name="emergencyContact3"
                                                        id="emergencyContact3"
                                                        className={`form-control${this.state.errors.emergencyContact3 ? ' is-invalid' : ''}`}
                                                        placeholder="Enter Emergency Contact"
                                                        maxLength="10"
                                                        value={emergencyContact3}
                                                        onChange={this.handleChange}
                                                        onInput={(e) => {
                                                            e.target.value = e.target.value.replace(/\D/g, '');
                                                        }}
                                                        ref={this.fieldRefs.emergencyContact3}
                                                    />
                                                    {this.state.errors.emergencyContact3 && (
                                                        <div className="invalid-feedback d-block">{this.state.errors.emergencyContact3}</div>
                                                    )}
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

                                                {/* Bank Account Detail */}
                                                <div className="row mb-4">
                                                    <h5 className="w-100">Bank Account Details</h5>
                                                    <div className="col-sm-6 col-md-6">
                                                        <div className="form-group">
                                                            <label className="form-label">Account Holder Name</label>
                                                            <input
                                                                type="text"
                                                                name="bankAccountName"
                                                                id="bankAccountName"
                                                                className="form-control"
                                                                placeholder="Account Holder Name"
                                                                maxLength="90"
                                                                value={bankAccountName}
                                                                onChange={this.handleChange}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6 col-md-6">
                                                        <div className="form-group">
                                                            <label className="form-label">Account Number</label>
                                                            <input
                                                                type="number"
                                                                name="bankAccountNo"
                                                                id="bankAccountNo"
                                                                className={`form-control${this.state.errors.bankAccountNo ? ' is-invalid' : ''}`}
                                                                placeholder="Account Number"
                                                                value={bankAccountNo}
                                                                onChange={this.handleChange}
                                                                ref={this.fieldRefs.bankAccountNo}
                                                                maxLength="20"
                                                            />
                                                            {this.state.errors.bankAccountNo && (
                                                                <div className="invalid-feedback d-block">{this.state.errors.bankAccountNo}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6 col-md-4">
                                                        <div className="form-group">
                                                            <label className="form-label">Bank Name</label>
                                                            <input
                                                                type="text"
                                                                name="bankName"
                                                                id="bankName"
                                                                className="form-control"
                                                                placeholder="Bank Name"
                                                                value={bankName}
                                                                onChange={this.handleChange}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6 col-md-4">
                                                        <div className="form-group">
                                                            <label className="form-label">IFSC Code</label>
                                                            <input
                                                                type="text"
                                                                name="ifscCode"
                                                                id="ifscCode"
                                                                className="form-control"
                                                                placeholder="IFSC Code"
                                                                value={ifscCode}
                                                                onChange={this.handleChange}
                                                            />
                                                        </div>    
                                                    </div>
                                                    <div className="col-sm-6 col-md-4">
                                                        <div className="form-group">
                                                            <label className="form-label">Bank Address</label>
                                                            <input
                                                                type="text"
                                                                name="bankAddress"
                                                                id="bankAddress"
                                                                className="form-control"
                                                                placeholder="Bank Address"
                                                                value={bankAddress}
                                                                onChange={this.handleChange}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Salary Details */}
                                                <div className="row mb-4">
                                                    <h5 className="w-100">Salary Details</h5>
                                                    {salaryDetails.map((entry, index) => (
                                                        <div key={index} className='w-100 col-sm-12'>
                                                            <div className="row">
                                                                <div className="col-sm-6 col-md-3">
                                                                    <div className="form-group">
                                                                        <label className="form-label">Salary Source</label>
                                                                        <select 
                                                                            name="salarySource"
                                                                            className="form-control"
                                                                            id='salarySource'
                                                                            value={entry.salarySource || ""}
                                                                            onChange={(e) => this.handleSalaryDetails(index, "salarySource", e.target.value)}
                                                                        >
                                                                            <option value="">Select</option>
                                                                            <option value="IDBI Bank" >IDBI Bank</option>
                                                                            <option value="HDFC Bank" >HDFC Bank</option>
                                                                            <option value="Cash Payout" >Cash Payout</option>
                                                                            <option value="NEFT" >NEFT</option>
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                                <div className="col-sm-6 col-md-3">
                                                                    <div className="form-group">
                                                                        <label className="form-label">Salary Amount</label>
                                                                        <input type="hidden" name="salaryId"  id="salaryId" value={entry.salaryId}></input>
                                                                        <input
                                                                            type="number"
                                                                            name="salaryAmount"
                                                                            id="salaryAmount"
                                                                            className={`form-control${this.state.errors.salaryAmount ? ' is-invalid' : ''}`}
                                                                            placeholder="Enter salary amount"
                                                                            value={entry.salaryAmount || ""}
                                                                            onChange={(e) => this.handleSalaryDetails(index, "salaryAmount", e.target.value)}
                                                                            maxLength="8"
                                                                            ref={this.fieldRefs.salaryAmount}
                                                                        />
                                                                        {this.state.errors.salaryAmount && (
                                                                            <div className="invalid-feedback d-block">{this.state.errors.salaryAmount}</div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="col-sm-6 col-md-3">
                                                                    <div className="form-group">
                                                                        <label className="form-label">From</label>
                                                                        <input
                                                                            type="date"
                                                                            name="fromDate"
                                                                            id="fromDate"
                                                                            className="form-control"
                                                                            value={entry.fromDate || ""}
                                                                            onChange={(e) => this.handleSalaryDetails(index, "fromDate", e.target.value)}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="col-sm-6 col-md-3">
                                                                    <div className="form-group">
                                                                        <label className="form-label">To</label>
                                                                        <input
                                                                            type="date"
                                                                            name="toDate"
                                                                            id="toDate"
                                                                            className="form-control"
                                                                            value={entry.toDate || ""}
                                                                            onChange={(e) => this.handleSalaryDetails(index, "toDate", e.target.value)}
                                                                        />
                                                                    </div>    
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Govt Issue ID */}
                                                <div className="row mb-4">
                                                <h5 className="w-100">Govt Issue ID</h5>

                                                {/* Aadhar Card Section */}
                                                <div className="col-sm-6 col-md-4">
                                                    <InputField
                                                        label="Aadhar Card"
                                                        name="aadharCardNumber"
                                                        type="text"
                                                        placeholder="Aadhar Card Number"
                                                        value={aadharCardNumber}
                                                        onChange={this.handleChange}
                                                    />
                                                    <InputField
                                                        type="file"
                                                        name="aadharCardFile"
                                                        onChange={this.handleFileChange}
                                                    />
                                                     <CheckFileAvailability
                                                        file={aadharCardFile} 
                                                        fileUrl={aadharCardFileUrl} 
                                                        label="Aadhaar card" 
                                                    />
                                                </div>

                                                {/* Driving License Section */}
                                                <div className="col-sm-6 col-md-4">
                                                    <InputField
                                                        label="Driving License"
                                                        name="drivingLicenseNumber"
                                                        type="text"
                                                        placeholder="Driving License Number"
                                                        value={drivingLicenseNumber}
                                                        onChange={this.handleChange}
                                                    />
                                                    <InputField
                                                        name="drivingLicenseFile"
                                                        type="file"
                                                        onChange={this.handleFileChange}
                                                        placeholder="Driving License"
                                                    />
                                                    <CheckFileAvailability
                                                        file={drivingLicenseFile} 
                                                        fileUrl={drivingLicenseFileUrl} 
                                                        label="Driving license" 
                                                    />
                                                </div>

                                                {/* Pan Card Section */}
                                                <div className="col-sm-6 col-md-4">
                                                    <InputField
                                                        label="Pan Card"
                                                        name="panCardNumber"
                                                        type="text"
                                                        placeholder="Pan Card Number"
                                                        value={panCardNumber}
                                                        onChange={this.handleChange}
                                                    />
                                                    <InputField
                                                        name="panCardFile"
                                                        type="file"
                                                        onChange={this.handleFileChange}
                                                        placeholder="Pan Card"
                                                    />
                                                    <CheckFileAvailability
                                                        file={panCardFile} 
                                                        fileUrl={panCardFileUrl} 
                                                        label="Pan card" 
                                                    />
                                                </div>
                                                </div>


                                                {/* Social Media */}
                                                <div className="row mb-4">
                                                    <h5 className="w-100">Social Media</h5>
                                                    <div className="col-lg-6 col-md-6">
                                                        <div className="form-group">
                                                            <label className="form-label">Facebook</label>
                                                            <input
                                                                type="url"
                                                                name="facebook"
                                                                className="form-control"
                                                                value={facebook}
                                                                onChange={this.handleChange}
                                                                placeholder="https://facebook.com/yourprofile"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-6 col-md-6">
                                                        <div className="form-group">
                                                            <label className="form-label">Twitter</label>
                                                            <input
                                                                type="url"
                                                                name="twitter"
                                                                className="form-control"
                                                                value={twitter}
                                                                onChange={this.handleChange}
                                                                placeholder="https://twitter.com/yourprofile"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-6 col-md-6">
                                                        <div className="form-group">
                                                            <label className="form-label">Linkedin</label>
                                                            <input
                                                                type="url"
                                                                name="linkedin"
                                                                className="form-control"
                                                                value={linkedin}
                                                                onChange={this.handleChange}
                                                                placeholder="https://linkedin.com/yourprofile"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-6 col-md-6">
                                                        <div className="form-group">
                                                            <label className="form-label">Instagram</label>
                                                            <input
                                                                type="url"
                                                                className="form-control"
                                                                name="instagram"
                                                                value={instagram}
                                                                onChange={this.handleChange}
                                                                placeholder="https://instagram.com/yourprofile"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Upwork Profile */}
                                                <div className="col-md-12">
                                                    <div className="form-group">
                                                        <label className="form-label">Upwork Profile</label>
                                                        <input
                                                            type="url"
                                                            name="upworkProfile"
                                                            className="form-control"
                                                            placeholder="Upwork Profile"
                                                            value={upworkProfile}
                                                            onChange={this.handleChange}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Visible status */}
                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label className="form-label" htmlFor="visibilityPriority">Visibility Priority</label>
                                                        <input
                                                            type="text"
                                                            name="visibilityPriority"
                                                            id="visibilityPriority"
                                                            className={`form-control${this.state.errors.visibilityPriority ? ' is-invalid' : ''}`}
                                                            placeholder="Enter First Name"
                                                            value={visibilityPriority}
                                                            onChange={this.handleChange}
                                                            ref={this.fieldRefs.visibilityPriority}
                                                        />
                                                        {this.state.errors.visibilityPriority && (
                                                            <div className="invalid-feedback d-block">{this.state.errors.visibilityPriority}</div>
                                                        )}
                                                    </div>
                                                </div>
                                                {/* Visible statistics status */}
                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label className="form-label">
                                                            Statistics Visibility Status
                                                        </label>
                                                        <select
                                                            className="form-control show-tick"
                                                            value={statisticsVisibilityStatus}
                                                            onChange={this.handleChange}
                                                            name="statisticsVisibilityStatus"
                                                            id='statisticsVisibilityStatus'
                                                        >
                                                            <option value="1">Active</option>
                                                            <option value="0">Inactive</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                {/* Status */}
                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label className="form-label">
                                                            Status
                                                        </label>
                                                        <select
                                                            className="form-control show-tick"
                                                            value={status}
                                                            onChange={this.handleChange}
                                                            name="status"
                                                            id='status'
                                                        >
                                                            <option value="1">Active</option>
                                                            <option value="0">Inactive</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                {/* Resume */}
                                                <div className="col-md-12">
                                                    <div className="form-group">
                                                        <label className="form-label">Resume</label>
                                                        <InputField
                                                            type="file"
                                                            name="resume"
                                                            onChange={this.handleFileChange}
                                                            accept=".pdf,.doc,.docx,.txt,.rtf,.gdoc"
                                                        />
                                                        {this.state.errors.resume && (
                                                            <div className="invalid-feedback d-block">{this.state.errors.resume}</div>
                                                        )}
                                                        {/* Resume Preview Link */}
                                                        {resume ? (
                                                            <div className="d-inline-block">
                                                                <a
                                                                    href={
                                                                        resumeUrl ? resumeUrl : `${process.env.REACT_APP_API_URL}/${resume.name || resume}`
                                                                    }
                                                                    className="text-primary small"
                                                                    style={{ fontWeight: "500", display: "inline-block" }}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                >
                                                                    {resume instanceof File ? resume.name : resume.split('/').pop().replace(/^\w+-/, '')}
                                                                </a>
                                                            </div>
                                                        ) : (
                                                            <small className="text-primary small" style={{ fontWeight: "500" }}>Resume not uploaded</small>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="card-footer text-right" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                            <button type="button" className="btn btn-secondary" onClick={this.handleBack}>Back</button>
                                            <button type="button" className="btn btn-primary" onClick={this.updateEmployee} disabled={this.state.ButtonLoading}>
                                                {this.state.ButtonLoading && (
                                                    <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                                                )}
                                                Update Employee
                                            </button>
                                        </div>
                                    {/* </form> */}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </>
        );
    }

    // Helper function to assign color tags
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
export default connect(mapStateToProps, mapDispatchToProps)(EditEmployee);