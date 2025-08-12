import React, { Component } from 'react';
import { connect } from 'react-redux';
import AlertMessages from '../../common/AlertMessages';
import CropperModal from './elements/CropperModal';
import { getService } from '../../../services/getService';
import { validateFields } from '../../common/validations';
import InputField from '../../common/formInputs/InputField';
import CheckboxGroup from '../../common/formInputs/CheckboxGroup';
import CheckFileAvailability from './elements/CheckFileAvailability';

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
            status: "",
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
                    statisticsVisibilityStatus: String(employee.statistics_visibility_status || "0"),
                    status: String(employee.status || "0"),
                }, () => {
                    // After employee data is loaded.
                    this.fetchLatestSalaryDetails();
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
    
            console.log('Salary details from location state:', formattedSalaryDetails);
            console.log('Setting initial salary details from location state');
            // Store formatted data in state
            this.setState({ salaryDetails: formattedSalaryDetails });
        } else {
            console.log('No salary details found in location state, will fetch from backend');
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
            console.log('Salary details being sent:', salaryDetails);
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

        console.log('FormData contents before sending:');
        for (let pair of updateEmployeeData.entries()) {
            console.log(pair[0] + ': ' + pair[1]);
        }

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
                
                // Fetch latest salary details after successful update
                setTimeout(() => {
                    this.fetchLatestSalaryDetails();
                }, 1000);
                
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

    // Fetch latest salary details from backend
    fetchLatestSalaryDetails = () => {
        const { employeeId } = this.state;
        console.log('fetchLatestSalaryDetails called with employeeId:', employeeId);
        
        if (!employeeId) {
            console.log('No employeeId, returning early');
            return;
        }

        console.log('Making API call to fetch salary details...');
        getService.getCall('employee_salary_details.php', {
            action: 'view',
            employee_id: employeeId
        })
        .then(data => {
            console.log('Salary details API response:', data);
            if (data && data.data) {
                // Transform the salary details to match the expected format
                const formattedSalaryDetails = data.data.map((detail) => ({
                    salaryId: detail.id || '',
                    salarySource: detail.source || "",
                    salaryAmount: detail.amount || 0,
                    fromDate: detail.from_date || "",
                    toDate: detail.to_date || "",
                }));
                
                console.log('Current salary details in state before update:', this.state.salaryDetails);
                this.setState({ salaryDetails: formattedSalaryDetails }, () => {
                    console.log('State updated with new salary details:', this.state.salaryDetails);
                });
            } else {
            }
        })
        .catch(error => {
            console.error("Error fetching latest salary details:", error);
        });
    };

    render() {
        const { fixNavbar } = this.props;
        const { firstName, lastName, email, gender, photo, photoUrl, dob, joiningDate, mobile1, mobile2, password, address1, address2, emergencyContact1, emergencyContact2, emergencyContact3, skillsFrontend, skillsBackend,  bankAccountName, bankAccountNo, bankName, ifscCode, bankAddress, salaryDetails, aadharCardNumber, aadharCardFile, aadharCardFileUrl, drivingLicenseNumber, drivingLicenseFile, drivingLicenseFileUrl, panCardNumber, panCardFile, panCardFileUrl, facebook, twitter, linkedin, instagram, upworkProfile, resume, resumeUrl, visibilityPriority, statisticsVisibilityStatus, status, showSuccess,successMessage,showError, errorMessage } = this.state;
        

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
                                                    <InputField
                                                        label="First Name"
                                                        name="firstName"
                                                        type="text"
                                                        value={firstName}
                                                        onChange={this.handleChange}
                                                        placeholder="Enter First Name"
                                                        error={this.state.errors.firstName}
                                                        refInput={this.fieldRefs.firstName}
                                                    />
                                                </div>
                                                <div className="col-sm-6 col-md-6">
                                                    <InputField
                                                        label="Last Name"
                                                        name="lastName"
                                                        type="text"
                                                        value={lastName}
                                                        onChange={this.handleChange}
                                                        placeholder="Enter Last Name"
                                                        error={this.state.errors.lastName}
                                                        refInput={this.fieldRefs.lastName}
                                                    />
                                                </div>
                                                <div className="col-sm-6 col-md-4">
                                                    <InputField
                                                        label="Email address"
                                                        name="email"
                                                        type="email"
                                                        value={email}
                                                        onChange={this.handleChange}
                                                        placeholder="Enter Email Address"
                                                        error={this.state.errors.email}
                                                        refInput={this.fieldRefs.email}
                                                    />
                                                </div>
                                                <div className="col-sm-6 col-md-4">
                                                    <InputField
                                                        label="Gender"
                                                        name="gender"
                                                        type="select"
                                                        value={gender}
                                                        onChange={this.handleChange}
                                                        error={this.state.errors.gender}
                                                        refInput={this.fieldRefs.gender}
                                                        options={[
                                                            { value: 'male', label: 'Male' },
                                                            { value: 'female', label: 'Female' }
                                                        ]}
                                                    />
                                                </div>
                                                <div className="col-md-4 col-sm-12">
                                                     <InputField
                                                        label="Select Department"
                                                        name="selectedDepartment"
                                                        type="select"
                                                        value={this.state.selectedDepartment}
                                                        onChange={this.handleChange}
                                                        error={this.state.errors.selectedDepartment}
                                                        refInput={this.fieldRefs.selectedDepartment}
                                                        options={this.state.departments.map((dept) => ({
                                                            value: dept.id,
                                                            label: dept.department_name
                                                        }))}
                                                    />
												</div>
                                                <div className="col-sm-6 col-md-4">
                                                    <InputField
                                                        label="DOB"
                                                        name="dob"
                                                        type="date"
                                                        value={dob}
                                                        onChange={this.handleChange}
                                                        error={this.state.errors.dob}
                                                        refInput={this.fieldRefs.dob}
                                                        max={new Date().toISOString().split("T")[0]}
                                                    />
                                                </div>
                                                <div className="col-sm-6 col-md-4">
                                                    <InputField
                                                        label="Joining Date"
                                                        name="joiningDate"
                                                        type="date"
                                                        value={joiningDate}
                                                        onChange={this.handleChange}
                                                        error={this.state.errors.joiningDate}
                                                        refInput={this.fieldRefs.joiningDate}
                                                    />
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

                                                        <CheckFileAvailability
                                                            file={photo} 
                                                            fileUrl={photoUrl} 
                                                            label="Photo" 
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-sm-6 col-md-4">
                                                    <InputField
                                                        label="Mobile No (1)"
                                                        name="mobile1"
                                                        type="tel"
                                                        value={mobile1}
                                                        onChange={this.handleChange}
                                                        placeholder="Enter Mobile No"
                                                        error={this.state.errors.mobile1}
                                                        refInput={this.fieldRefs.mobile1}
                                                        maxLength="10"
                                                        onInput={(e) => {
                                                            e.target.value = e.target.value.replace(/\D/g, '');
                                                        }}
                                                    />
                                                </div>
                                                <div className="col-sm-6 col-md-4">
                                                    <InputField
                                                        label="Mobile No (2)"
                                                        name="mobile2"
                                                        type="tel"
                                                        value={mobile2}
                                                        onChange={this.handleChange}
                                                        placeholder="Enter Mobile No"
                                                        error={this.state.errors.mobile2}
                                                        refInput={this.fieldRefs.mobile2}
                                                        maxLength="10"
                                                        onInput={(e) => {
                                                            e.target.value = e.target.value.replace(/\D/g, '');
                                                        }}
                                                    />
                                                </div>
                                                    <div className="col-sm-6 col-md-4">
                                                        <InputField
                                                            label="Password"
                                                            name="password"
                                                            type="password"
                                                            value={password}
                                                            onChange={this.handleChange}
                                                            placeholder="Enter New Password"
                                                            refInput={this.fieldRefs.password}
                                                        />
                                                    </div>
                                                <div className="col-md-12">
                                                     <InputField
                                                        label="Address Line 1"
                                                        name="address1"
                                                        type="text"
                                                        value={address1}
                                                        onChange={this.handleChange}
                                                        placeholder="Enter Address Line 1"
                                                    />
                                                </div>
                                                <div className="col-md-12">
                                                    <InputField
                                                        label="Address Line 2"
                                                        name="address2"
                                                        type="text"
                                                        value={address2}
                                                        onChange={this.handleChange}
                                                        placeholder="Enter Address Line 2"
                                                    />
                                                </div>
                                                <div className="col-sm-6 col-md-4 mb-4">
                                                    <InputField
                                                        label="Emergency Contact 1"
                                                        name="emergencyContact1"
                                                        type="tel"
                                                        value={emergencyContact1}
                                                        onChange={this.handleChange}
                                                        placeholder="Enter Emergency Contact"
                                                        error={this.state.errors.emergencyContact1}
                                                        refInput={this.fieldRefs.emergencyContact1}
                                                        maxLength="10"
                                                        onInput={(e) => {
                                                            e.target.value = e.target.value.replace(/\D/g, '');
                                                        }}
                                                    />
                                                </div>
                                                <div className="col-sm-6 col-md-4 mb-4">
                                                    <InputField
                                                        label="Emergency Contact 2"
                                                        name="emergencyContact2"
                                                        type="tel"
                                                        value={emergencyContact2}
                                                        onChange={this.handleChange}
                                                        placeholder="Enter Emergency Contact"
                                                        error={this.state.errors.emergencyContact2}
                                                        refInput={this.fieldRefs.emergencyContact2}
                                                        maxLength="10"
                                                        onInput={(e) => {
                                                            e.target.value = e.target.value.replace(/\D/g, '');
                                                        }}
                                                    />
                                                </div>
                                                <div className="col-sm-6 col-md-4 mb-4">
                                                    <InputField
                                                        label="Emergency Contact 3"
                                                        name="emergencyContact3"
                                                        type="tel"
                                                        value={emergencyContact3}
                                                        onChange={this.handleChange}
                                                        placeholder="Enter Emergency Contact"
                                                        error={this.state.errors.emergencyContact3}
                                                        refInput={this.fieldRefs.emergencyContact3}
                                                        maxLength="10"
                                                        onInput={(e) => {
                                                            e.target.value = e.target.value.replace(/\D/g, '');
                                                        }}
                                                    />
                                                </div>

                                                {/* Frontend Skills */}
                                                <div className="row mb-4">
                                                    <h5 className="w-100">Skills</h5>
                                                    <CheckboxGroup
                                                        label="Frontend"
                                                        options={frontendSkills}
                                                        selected={skillsFrontend}
                                                        onChange={(e) => this.handleSkillChange(e, 'frontend')}
                                                    />

                                                    {/* Backend Skills */}
                                                    <CheckboxGroup
                                                        label="Backend"
                                                        options={backendSkills}
                                                        selected={skillsBackend}
                                                        onChange={(e) => this.handleSkillChange(e, 'backend')}
                                                    />
                                                </div>

                                                {/* Bank Account Detail */}
                                                <div className="row mb-4">
                                                    <h5 className="w-100">Bank Account Details</h5>
                                                    <div className="col-sm-6 col-md-6">
                                                        <InputField
                                                            label="Account Holder Name"
                                                            name="bankAccountName"
                                                            type="text"
                                                            id='bankAccountName'
                                                            value={bankAccountName}
                                                            onChange={this.handleChange}
                                                            placeholder="Account Holder Name"
                                                            maxLength="90"
                                                        />
                                                    </div>
                                                    <div className="col-sm-6 col-md-6">
                                                    <InputField
                                                            label="Account Number"
                                                            name="bankAccountNo"
                                                            type="number"
                                                            id="bankAccountNo"
                                                            value={bankAccountNo}
                                                            onChange={this.handleChange}
                                                            placeholder="Account Number"
                                                            error={this.state.errors.bankAccountNo}
                                                            refInput={this.fieldRefs.bankAccountNo}
                                                            maxLength="20"
                                                        />
                                                    </div>
                                                    <div className="col-sm-6 col-md-4">
                                                       <InputField
                                                            label="Bank Name"
                                                            name="bankName"
                                                            type="text"
                                                            id='bankName'
                                                            value={bankName}
                                                            onChange={this.handleChange}
                                                            placeholder="Bank Name"
                                                        />
                                                    </div>
                                                    <div className="col-sm-6 col-md-4">
                                                        <InputField
                                                            label="IFSC Code"
                                                            name="ifscCode"
                                                            type="text"
                                                            id='ifscCode'
                                                            value={ifscCode}
                                                            onChange={this.handleChange}
                                                            placeholder="IFSC Code"
                                                        />    
                                                    </div>
                                                    <div className="col-sm-6 col-md-4">
                                                         <InputField
                                                            label="Bank Address"
                                                            name="bankAddress"
                                                            type="text"
                                                            id='bankAddress'
                                                            value={bankAddress}
                                                            onChange={this.handleChange}
                                                            placeholder="Bank Address"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Salary Details */}
                                                <div className="row mb-4">
                                                    <h5 className="w-100">Salary Details</h5>
                                                    {salaryDetails.map((entry, index) => (
                                                        <div key={index} className='w-100 col-sm-12'>
                                                            <div className="row">
                                                                <div className="col-sm-6 col-md-3">
                                                                    <InputField
                                                                        label="Salary Source"
                                                                        name="salarySource"
                                                                        type="select"
                                                                        value={entry.salarySource || ""}
                                                                        onChange={(e) => this.handleSalaryDetails(index, "salarySource", e.target.value)}
                                                                        options={[
                                                                            { value: "", label: "Select" },
                                                                            { value: "IDBI Bank", label: "IDBI Bank" },
                                                                            { value: "HDFC Bank", label: "HDFC Bank" },
                                                                            { value: "Cash Payout", label: "Cash Payout" },
                                                                            { value: "NEFT", label: "NEFT" }
                                                                        ]}
                                                                    />
                                                                </div>
                                                                <div className="col-sm-6 col-md-3">
                                                                        <InputField type="hidden" name="salaryId"  id="salaryId" value={entry.salaryId} />
                                                                        <InputField
                                                                            label="Salary Amount"
                                                                            name="salaryAmount"
                                                                            type="number"
                                                                            id="salaryAmount"
                                                                            value={entry.salaryAmount || ""}
                                                                            onChange={(e) => this.handleSalaryDetails(index, "salaryAmount", e.target.value)}
                                                                            placeholder="Enter salary amount"
                                                                            error={this.state.errors.salaryAmount}
                                                                            refInput={this.fieldRefs.salaryAmount}
                                                                            maxLength="8"
                                                                        />
                                                                        
                                                                </div>
                                                                <div className="col-sm-6 col-md-3">
                                                                    <InputField
                                                                        label="From"
                                                                        name="fromDate"
                                                                        id="fromDate"
                                                                        type="date"
                                                                        value={entry.fromDate || ""}
                                                                        onChange={(e) => this.handleSalaryDetails(index, "fromDate", e.target.value)}
                                                                    />
                                                                </div>
                                                                <div className="col-sm-6 col-md-3">
                                                                     <InputField
                                                                        label="To"
                                                                        name="toDate"
                                                                        type="date"
                                                                        value={entry.toDate || ""}
                                                                        onChange={(e) => this.handleSalaryDetails(index, "toDate", e.target.value)}
                                                                    />    
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
                                                       <InputField
                                                            label="Facebook"
                                                            name="facebook"
                                                            type="url"
                                                            value={facebook}
                                                            onChange={this.handleChange}
                                                            placeholder="https://facebook.com/yourprofile"
                                                        />
                                                    </div>
                                                    <div className="col-lg-6 col-md-6">
                                                        <InputField
                                                            label="Twitter"
                                                            name="twitter"
                                                            type="url"
                                                            value={twitter}
                                                            onChange={this.handleChange}
                                                            placeholder="https://twitter.com/yourprofile"
                                                        />
                                                    </div>
                                                    <div className="col-lg-6 col-md-6">
                                                         <InputField
                                                            label="Linkedin"
                                                            name="linkedin"
                                                            type="url"
                                                            value={linkedin}
                                                            onChange={this.handleChange}
                                                            placeholder="https://linkedin.com/yourprofile"
                                                        />
                                                    </div>
                                                    <div className="col-lg-6 col-md-6">
                                                        <InputField
                                                            label="Instagram"
                                                            name="instagram"
                                                            type="url"
                                                            value={instagram}
                                                            onChange={this.handleChange}
                                                            placeholder="https://instagram.com/yourprofile"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Upwork Profile */}
                                                <div className="col-md-12">
                                                    <InputField
                                                        label="Upwork Profile"
                                                        name="upworkProfile"
                                                        type="url"
                                                        value={upworkProfile}
                                                        onChange={this.handleChange}
                                                        placeholder="Upwork Profile"
                                                    />
                                                </div>

                                                {/* Visible status */}
                                                <div className="col-md-6">
                                                    <InputField
                                                        label="Visibility Priority"
                                                        name="visibilityPriority"
                                                        type="text"
                                                        value={visibilityPriority}
                                                        onChange={this.handleChange}
                                                        error={this.state.errors.visibilityPriority}
                                                        refInput={this.fieldRefs.visibilityPriority}
                                                    />
                                                </div>
                                                {/* Visible statistics status */}
                                                <div className="col-md-6">
                                                    <InputField
                                                        label="Statistics Visibility Status"
                                                        name="statisticsVisibilityStatus"
                                                        type="select"
                                                        value={statisticsVisibilityStatus || "0"}
                                                        onChange={this.handleChange}
                                                        options={[
                                                            { value: "1", label: "Active" },
                                                            { value: "0", label: "Inactive" }
                                                        ]}
                                                    />
                                                </div>
                                                {/* Status */}
                                                <div className="col-md-6">
                                                    <InputField
                                                        label="Status"
                                                        name="status"
                                                        type="select"
                                                        value={status || "0"}
                                                        onChange={this.handleChange}
                                                        options={[
                                                            { value: "1", label: "Active" },
                                                            { value: "0", label: "Inactive" }
                                                        ]}
                                                    />
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
                                                          <CheckFileAvailability
                                                            file={resume} 
                                                            fileUrl={resumeUrl} 
                                                            label="Resume" 
                                                        />
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
}

const mapStateToProps = state => ({
    fixNavbar: state.settings.isFixNavbar
})

const mapDispatchToProps = dispatch => ({})
export default connect(mapStateToProps, mapDispatchToProps)(EditEmployee);