import React, { Component } from 'react';
import { connect } from 'react-redux';

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
        fetch(`${process.env.REACT_APP_API_URL}/get_employees.php?action=view&user_id=${employeeId}`, {
            method: "GET",
        })
        .then(response => response.json())
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

        // Get department data from departments table
		fetch(`${process.env.REACT_APP_API_URL}/departments.php`, {
            method: "GET"
        })
        .then(response => response.json())
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
    
        if (file) {
            this.setState((prevState) => ({
                [name]: file, // Store the File object for form submission
                [`${name}Url`]: URL.createObjectURL(file), // Create a temporary preview URL
            }));
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
        }, () => {
            console.log(fieldName === 'frontend' ? 'Updated skillsFrontend' : 'Updated skillsBackend', this.state[fieldName === 'frontend' ? 'skillsFrontend' : 'skillsBackend']);
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
            twitter,
            linkedin,
            instagram,
            upworkProfile,
            resume,
            visibilityPriority,
            statisticsVisibilityStatus,
            status
        } = this.state;

        // Name validation: only letters and spaces allowed
        const namePattern = /^[A-Za-z ]+$/;
        let errors = {};
        let hasError = false;
        if (!namePattern.test(firstName)) {
          errors.firstName = "First name must not contain special characters or numbers.";
          hasError = true;
        }
        if (!namePattern.test(lastName)) {
          errors.lastName = "Last name must not contain special characters or numbers.";
          hasError = true;
        }
        this.setState({ errors, showError: false, showSuccess: false });
        if (hasError) return;

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
        fetch(`${process.env.REACT_APP_API_URL}/get_employees.php?action=edit&user_id=${employeeId}`, {
            method: "POST",
            body: updateEmployeeData,
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json(); // Convert response to JSON
        })
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
                    };
                });
    
                setTimeout(this.dismissMessages, 5000);
            } else {
                console.error("Failed to update employee. Response:", data);
                this.setState({
                    errorMessage: data.message || "Failed to update employee.",
                    showError: true,
                    showSuccess: false,
                });
            }
        })
        .catch(error => {
            console.error("Error updating employee:", error);
            this.setState({
                errorMessage: "An error occurred while updating the employee.",
                showError: true,
                showSuccess: false,
            });

            // setTimeout(this.dismissMessages, 3000);
        });
    }

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

    render() {
        const { fixNavbar } = this.props;
        const { firstName, lastName, email, gender, photo, photoUrl, dob, joiningDate, mobile1, mobile2, address1, address2, emergencyContact1, emergencyContact2, emergencyContact3, skillsFrontend, skillsBackend,  bankAccountName, bankAccountNo, bankName, ifscCode, bankAddress, salaryDetails, aadharCardNumber, aadharCardFile, aadharCardFileUrl, drivingLicenseNumber, drivingLicenseFile, drivingLicenseFileUrl, panCardNumber, panCardFile, panCardFileUrl, facebook, twitter, linkedin, instagram, upworkProfile, resume, resumeUrl, visibilityPriority, statisticsVisibilityStatus, status} = this.state;
        // Frontend and Backend Skill Options
        const frontendSkills = ["HTML", "CSS", "JavaScript", "React", "Angular", "Vue"];
        const backendSkills = ["PHP", "Laravel", "Python", "Node.js", "Symfony", "Django", "Ruby on Rails"];
        return (
            <>
                {/* Show success and error Messages */}
                {this.renderAlertMessages()}
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
                                                            className="form-control"
                                                            placeholder="Enter First Name"
                                                            value={firstName}
                                                            onChange={this.handleChange}
                                                            required
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
                                                            className="form-control"
                                                            placeholder="Enter Last Name"
                                                            value={lastName}
                                                            onChange={this.handleChange}
                                                            required
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
                                                            className="form-control"
                                                            placeholder="Enter Email Address"
                                                            value={email}
                                                            onChange={this.handleChange}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-sm-6 col-md-4">
                                                    <div className="form-group">
                                                        <label className="form-label">Gender</label>
                                                        <select 
                                                            name="gender"
                                                            className="form-control"
                                                            id='gender'
                                                            value={gender}
                                                            onChange={this.handleChange}
                                                            required
                                                        >
                                                            <option value="">Select Gender</option>
                                                            <option value="male" >Male</option>
                                                            <option value="female" >Female</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="col-md-4 col-sm-12">
                                                    <label className="form-label">Select Department</label>
													<div className="form-group">
														<select
															className="form-control show-tick"
															value={this.state.selectedDepartment}
															onChange={this.handleChange}
															name="selectedDepartment"
														>
															<option value="">Select Department</option>
															{this.state.departments.map((dept) => (
																<option key={dept.id} value={dept.id}>
																	{dept.department_name}
																</option>
															))}
														</select>
													</div>
												</div>
                                                <div className="col-sm-6 col-md-4">
                                                    <div className="form-group">
                                                        <label className="form-label">DOB</label>
                                                        <input
                                                            type="date"
                                                            id="dob"
                                                            name="dob"
                                                            className="form-control"
                                                            value={dob}
                                                            onChange={this.handleChange}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-sm-6 col-md-4">
                                                    <div className="form-group">
                                                        <label className="form-label">Joining Date</label>
                                                        <input
                                                            type="date"
                                                            id="joiningDate"
                                                            name="joiningDate"
                                                            className="form-control"
                                                            value={joiningDate}
                                                            onChange={this.handleChange}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-sm-6 col-md-4">
                                                    <div className="form-group">
                                                        <label className="form-label">Photo</label>
                                                        <input
                                                            type="file"
                                                            name="photo"
                                                            className="form-control"
                                                            onChange={this.handleFileChange}
                                                            accept="image/*"
                                                        />

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
                                                            className="form-control"
                                                            placeholder="Enter Mobile No"
                                                            value={mobile1}
                                                            onChange={this.handleChange}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-sm-6 col-md-4">
                                                    <div className="form-group">
                                                        <label className="form-label">Mobile No (2)</label>
                                                        <input
                                                            type="tel"
                                                            name="mobile2"
                                                            id="mobile2"
                                                            className="form-control"
                                                            placeholder="Enter Mobile No"
                                                            value={mobile2}
                                                            onChange={this.handleChange}
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
                                                        className="form-control"
                                                        placeholder="Enter Emergency Contact"
                                                        value={emergencyContact1}
                                                        onChange={this.handleChange}
                                                    />
                                                </div>
                                                <div className="col-sm-6 col-md-4 mb-4">
                                                    <label className="form-label">Emergency Contact 2</label>
                                                    <input
                                                        type="tel"
                                                        name="emergencyContact2"
                                                        id="emergencyContact2"
                                                        className="form-control"
                                                        placeholder="Enter Emergency Contact"
                                                        value={emergencyContact2}
                                                        onChange={this.handleChange}
                                                    />
                                                </div>
                                                <div className="col-sm-6 col-md-4 mb-4">
                                                    <label className="form-label">Emergency Contact 3</label>
                                                    <input
                                                        type="tel"
                                                        name="emergencyContact3"
                                                        id="emergencyContact3"
                                                        className="form-control"
                                                        placeholder="Enter Emergency Contact"
                                                        value={emergencyContact3}
                                                        onChange={this.handleChange}
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
                                                                className="form-control"
                                                                placeholder="Account Number"
                                                                value={bankAccountNo}
                                                                onChange={this.handleChange}
                                                            />
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
                                                                            className="form-control"
                                                                            placeholder="Enter salary amount"
                                                                            value={entry.salaryAmount || ""}
                                                                            onChange={(e) => this.handleSalaryDetails(index, "salaryAmount", e.target.value)}
                                                                        />
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
                                                    <div className="col-sm-6 col-md-4">
                                                        <div className="form-group">
                                                            <label className="form-label">Aadhar Card</label>
                                                            
                                                            {/* Aadhaar Card Number Input */}
                                                            <input
                                                                type="text"
                                                                name="aadharCardNumber"
                                                                id="aadharCardNumber"
                                                                className="form-group form-control"
                                                                placeholder="Aadhar Card Number"
                                                                value={aadharCardNumber}
                                                                onChange={this.handleChange}
                                                            />

                                                            {/* File Upload */}
                                                            <input
                                                                type="file"
                                                                name="aadharCardFile"
                                                                className="form-control"
                                                                onChange={this.handleFileChange}
                                                            />

                                                            {/* File Preview Link */}
                                                            {aadharCardFile && aadharCardFile !== "" ? (
                                                                <div className="d-inline-block" style={{ display: "inline-block" }}>
                                                                    <a
                                                                        href={
                                                                            aadharCardFileUrl ? aadharCardFileUrl : `${process.env.REACT_APP_API_URL}/${aadharCardFile.name || aadharCardFile}`
                                                                        }
                                                                        className="text-primary small"
                                                                        style={{ fontWeight: "500", display: "inline-block" }}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                    >
                                                                        {aadharCardFile instanceof File ? aadharCardFile.name : aadharCardFile.split('/').pop().replace(/^\w+-/, '')}
                                                                    </a>
                                                                </div>
                                                            ) : (
                                                                <small className="text-primary small" style={{ fontWeight: "500" }}>Aadhaar card not uploaded</small>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6 col-md-4">
                                                        <div className="form-group">
                                                            <label className="form-label">Driving License</label>
                                                            <input
                                                                type="text"
                                                                name="drivingLicenseNumber"
                                                                id="drivingLicenseNumber"
                                                                className="form-group form-control"
                                                                placeholder="Driving License Number"
                                                                value={drivingLicenseNumber}
                                                                onChange={this.handleChange}
                                                            />
                                                            <input
                                                                type="file"
                                                                name="drivingLicenseFile"
                                                                className="form-control"
                                                                placeholder="Driving License"
                                                                onChange={this.handleFileChange}
                                                            />
                                                            {/* File Preview Link */}
                                                            {drivingLicenseFile ? (
                                                                <div className="d-inline-block">
                                                                    <a
                                                                        href={
                                                                            drivingLicenseFileUrl ? drivingLicenseFileUrl : `${process.env.REACT_APP_API_URL}/${drivingLicenseFile.name || drivingLicenseFile}`
                                                                        }
                                                                        className="text-primary small"
                                                                        style={{ fontWeight: "500", display: "inline-block" }}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                    >
                                                                        {drivingLicenseFile instanceof File ? drivingLicenseFile.name : drivingLicenseFile.split('/').pop().replace(/^\w+-/, '')}
                                                                    </a>
                                                                </div>
                                                            ) : (
                                                                <small className="text-primary small" style={{ fontWeight: "500" }}>Driving license not uploaded</small>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6 col-md-4">
                                                        <div className="form-group">
                                                            <label className="form-label">Pan Card</label>
                                                            <input
                                                                type="text"
                                                                name="panCardNumber"
                                                                id="panCardNumber"
                                                                className="form-group form-control"
                                                                placeholder="Pan Card Number"
                                                                value={panCardNumber}
                                                                onChange={this.handleChange}
                                                            />
                                                            <input
                                                                type="file"
                                                                name="panCardFile"
                                                                className="form-control"
                                                                placeholder="Pan Card"
                                                                onChange={this.handleFileChange}
                                                            />

                                                            {/* File Preview Link */}
                                                            {panCardFile ? (
                                                                <div className="d-inline-block">
                                                                    <a
                                                                        href={
                                                                            panCardFileUrl ? panCardFileUrl : `${process.env.REACT_APP_API_URL}/${panCardFile.name || panCardFile}`
                                                                        }
                                                                        className="text-primary small"
                                                                        style={{ fontWeight: "500", display: "inline-block" }}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                    >
                                                                        {panCardFile instanceof File ? panCardFile.name : panCardFile.split('/').pop().replace(/^\w+-/, '')}
                                                                    </a>
                                                                </div>
                                                            ) : (
                                                                <small className="text-primary small" style={{ fontWeight: "500" }}>Pan card not uploaded</small>
                                                            )}
                                                        </div>
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
                                                        <label className="form-label">
                                                        Visibility Priority
                                                        </label>
                                                        <select
                                                        className="form-control show-tick"
                                                        value={visibilityPriority}
                                                        onChange={this.handleChange}
                                                        name="visibilityPriority"
                                                        >
                                                        {[...Array(11)].map((_, i) => (
                                                            <option key={i} value={i}>
                                                            {i}
                                                            </option>
                                                        ))}
                                                        </select>
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
                                                        <input
                                                            type="file"
                                                            name="resume"
                                                            className="form-control"
                                                            placeholder="Select your resume"
                                                            onChange={this.handleFileChange}
                                                        />
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
                                            <button type="button" className="btn btn-primary" onClick={this.updateEmployee}>Update Employee</button>
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