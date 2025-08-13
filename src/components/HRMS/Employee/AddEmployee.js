import React, { Component } from "react";
import { connect } from "react-redux";
import AlertMessages from "../../common/AlertMessages";
import CropperModal from './elements/CropperModal';
import { getService } from "../../../services/getService";
import { validateFields } from "../../common/validations";
import InputField from "../../common/formInputs/InputField";
import CheckboxGroup from '../../common/formInputs/CheckboxGroup'
import { appendDataToFormData } from "../../../utils";
import Button from "../../common/formInputs/Button";

class AddEmployee extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDepartment: "",
      departments: [],
      firstName: "",
      lastName: "",
      email: "",
      gender: "",
      photo: null,
      dob: "",
      joiningDate: "",
      mobile1: "",
      mobile2: "",
      password: "",
      address1: "",
      address2: "",
      emergencyContact1: "",
      emergencyContact2: "",
      emergencyContact3: "",
      skillsFrontend: [],
      skillsBackend: [],
      bankAccountName: "",
      bankAccountNo: "",
      bankName: "",
      ifscCode: "",
      bankAddress: "",
      salaryDetails: [
        { salarySource: "", salaryAmount: "", fromDate: "", toDate: "" },
      ],
      aadharCardNumber: "",
      aadharCardFile: null,
      drivingLicenseNumber: "",
      drivingLicenseFile: null,
      panCardNumber: "",
      panCardFile: null,
      facebook: "",
      twitter: "",
      linkedin: "",
      instagram: "",
      upworkProfile: "",
      resume: null,
      successMessage: "",
      showSuccess: false,
      errorMessage: "",
      showError: false,
      visibilityPriority: 0,
      statisticsVisibilityStatus: 1,
      errors: {},
      ButtonLoading: false,
      showCropper: false,
      cropperImage: null,
      photoInputName: '',
    };

    // Create refs for each file input
    this.fileInputRefs = {
      photo: React.createRef(),
      aadharCardFile: React.createRef(),
      drivingLicenseFile: React.createRef(),
      panCardFile: React.createRef(),
      resume: React.createRef(),
    };

    // Create refs for form fields for error scrolling
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
      emergencyContact1: React.createRef(),
      emergencyContact2: React.createRef(),
      emergencyContact3: React.createRef(),
      bankAccountNo: React.createRef(),
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
    // Get department data from departments table
       getService.getCall('departments.php', {
            action: 'view'
          })
      .then((data) => {
        this.setState({ departments: data.data });
      })
      .catch((error) => console.error("Error fetching departments:", error));
  }

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({
      [name]: value,
    });
  };

  handleSalaryDetails = (index, field, value) => {
    this.setState((prevState) => {
      const updatedEntries = [...prevState.salaryDetails];
      updatedEntries[index][field] = value;
      return { salaryDetails: updatedEntries };
    });
  };

  // Add more salary details
  addMore = () => {
    this.setState((prevState) => ({
      salaryDetails: [
        ...prevState.salaryDetails,
        { salarySource: "", salaryAmount: "", fromDate: "", toDate: "" },
      ],
    }));
  };

  // Remove an entry
  removeEntry = (index) => {
    const salaryDetails = this.state.salaryDetails.filter(
      (_, i) => i !== index
    );
    this.setState({ salaryDetails });
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
      const maxSize = 5 * 1024 * 1024;
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
        errors: { ...this.state.errors, resume: '' }
      });
    } else if (file) {
      this.setState({
        [name]: file,
      });
    }
  };

  handleSkillChange = (e, category) => {
    const { value, checked } = e.target;
    this.setState((prevState) => {
      const updatedSkills = checked
        ? [...prevState[category], value]
        : prevState[category].filter((skill) => skill !== value);

      return { [category]: updatedSkills };
    });
  };

  addEmployee = async (e) => {
    e.preventDefault();
    this.setState({ ButtonLoading: true });
    const { id, role } = window.user;

    const {
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
      salaryDetails,
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
      statisticsVisibilityStatus
    } = this.state;

    const validationSchema = [
      { name: 'firstName', value: firstName, type: 'name', required: true, messageName:'First Name' },
      { name: 'lastName', value: lastName, type: 'name', required: true, messageName:'Last Name' },
      { name: 'email', value: email, type: 'email', required: true, messageName:'Email' },
      { name: 'gender', value: gender, type: 'name', required: true, messageName:'Gender' },
      { name: 'dob', value: dob, type: 'date', required: true, messageName:'Date of Birth',},
      { name: 'selectedDepartment', value: selectedDepartment, required: true, messageName:'Department' },
      { name: 'mobile1', value: mobile1, type: 'mobile', required: true, messageName:'Mobile Number' },
      { name: 'mobile2', value: mobile2, type: 'mobile', messageName:'Mobile Number' },
      { name: 'emergencyContact1', value: emergencyContact1, type: 'mobile', messageName:'Mobile Number' },
      { name: 'emergencyContact2', value: emergencyContact2, type: 'mobile', messageName:'Mobile Number' },
      { name: 'emergencyContact3', value: emergencyContact3, type: 'mobile', messageName: 'Mobile Number' },
      { name: 'joiningDate', value: joiningDate, type: 'date', required: true, messageName: 'Joining Date' },
      { name: 'password', value: password, type: 'password', required:true, messageName:'Password' },
      { name: 'bankAccountNo', value: bankAccountNo, messageName: 'Account Number', maxLength: 20 },
      { name: 'salaryAmount', value: this.state.salaryDetails[0].salaryAmount, messageName: 'Salary Amount', maxLength: 8 },
      { name: 'visibilityPriority', value: visibilityPriority, type: 'visibilityPriority', messageName:'visibility Priority' }
    ];

    const errors = validateFields(validationSchema);

    if (Object.keys(errors).length > 0) {
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
      return
    } else {
      this.setState({ errors: {} });
    }

    const addEmployeeData = new FormData();
    const data = {
    department_id: selectedDepartment,
    first_name: firstName,
    last_name: lastName,
    email: email,
    gender: gender,
    photo: photo,
    dob: dob,
    joining_date: joiningDate,
    mobile_no1: mobile1,
    mobile_no2: mobile2,
    password: password,
    address_line1: address1,
    address_line2: address2,
    emergency_contact1: emergencyContact1,
    emergency_contact2: emergencyContact2,
    emergency_contact3: emergencyContact3,
    frontend_skills: skillsFrontend,
    backend_skills: skillsBackend,
    account_holder_name: bankAccountName,
    account_number: bankAccountNo,
    bank_name: bankName,
    ifsc_code: ifscCode,
    bank_address: bankAddress,
    statistics_visibility_status: statisticsVisibilityStatus,
    aadhar_card_number: aadharCardNumber,
    aadhar_card_file: aadharCardFile,
    driving_license_number: drivingLicenseNumber,
    driving_license_file: drivingLicenseFile,
    pan_card_number: panCardNumber,
    pan_card_file: panCardFile,
    facebook_url: facebook,
    twitter_url: twitter,
    linkedin_url: linkedin,
    instagram_url: instagram,
    upwork_profile_url: upworkProfile,
    resume: resume,
    visibility_priority: visibilityPriority,
    logged_in_employee_id: id,
    logged_in_employee_role: role
};
appendDataToFormData(addEmployeeData, data)


    // Make this seperately
    salaryDetails.forEach((detail, index) => {
      addEmployeeData.append(`salaryDetails[${index}][source]`, detail.salarySource);
      addEmployeeData.append(`salaryDetails[${index}][amount]`, detail.salaryAmount);
      addEmployeeData.append(`salaryDetails[${index}][from_date]`, detail.fromDate);
      addEmployeeData.append(`salaryDetails[${index}][to_date]`, detail.toDate);
    });


    getService.addCall('get_employees.php','add', addEmployeeData)
      .then((data) => {
        if (data.status === "success") {
          // Update the department list
          this.setState((prevState) => ({
            //users: [...(prevState.users || []), data.data], // Assuming the backend returns the new department
            selectedDepartment: "",
            firstName: "",
            lastName: "",
            email: "",
            gender: "",
            photo: null,
            dob: "",
            joiningDate: "",
            mobile1: "",
            mobile2: "",
            password: "",
            address1: "",
            address2: "",
            emergencyContact1: "",
            emergencyContact2: "",
            emergencyContact3: "",
            skillsFrontend: [],
            skillsBackend: [],
            bankAccountName: "",
            bankAccountNo: "",
            bankName: "",
            ifscCode: "",
            bankAddress: "",
            salaryDetails: [
              { salarySource: "", salaryAmount: "", fromDate: "", toDate: "" },
            ],
            aadharCardNumber: "",
            aadharCardFile: null,
            drivingLicenseNumber: "",
            drivingLicenseFile: null,
            panCardNumber: "",
            panCardFile: null,
            facebook: "",
            twitter: "",
            linkedin: "",
            instagram: "",
            upworkProfile: "",
            resume: null,
            visibilityPriority: 0,
            showSuccess: true,
            successMessage: "Employee added successfully!",
            errorMessage: "",
            showError: false,
            ButtonLoading: false,
          }));

          setTimeout(this.dismissMessages, 5000);

          // Clear all file inputs
          Object.values(this.fileInputRefs).forEach((ref) => {
            if (ref.current) ref.current.value = "";
          });
        } else {
          console.error("Failed to add employee details:", data);
          this.setState({
            errorMessage: data.message || "Failed to add employee.",
            showError: true,
            showSuccess: false,
            ButtonLoading: false,
          });
        }
      })
      .catch((error) => {
        console.error("Error adding employee:", error);
        this.setState({
          errorMessage: "An error occurred while adding the employee.",
          showError: true,
          showSuccess: false,
          ButtonLoading: false,
        });

        // setTimeout(this.dismissMessages, 3000);
      });
  };

  handleBack = () => {
    this.props.history.goBack(); // Navigate to the previous page
  };

  handleCropperCrop = (blob) => {
    const croppedFile = new File([blob], "profile.jpg", { type: "image/jpeg" });
    this.setState({
      photo: croppedFile,
      showCropper: false,
      cropperImage: null,
    });
  };
  handleCropperCancel = () => {
    this.setState({ showCropper: false, cropperImage: null });
  };

  render() {
    const { fixNavbar } = this.props;
    const {
      firstName,
      lastName,
      email,
      gender,
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
      salaryDetails,
      aadharCardNumber,
      drivingLicenseNumber,
      panCardNumber,
      facebook,
      twitter,
      linkedin,
      instagram,
      upworkProfile,
      visibilityPriority,
      statisticsVisibilityStatus,
      showSuccess,
      successMessage,
      showError, 
      errorMessage 
    } = this.state;

    // const { skillsFrontend, skillsBackend } = this.state;
    // Frontend and Backend Skill Options
    const frontendSkills = [
      "HTML",
      "CSS",
      "JavaScript",
      "React",
      "Angular",
      "Vue",
    ];
    const backendSkills = [
      "PHP",
      "Laravel",
      "Python",
      "Node.js",
      "Symfony",
      "Django",
      "Ruby on Rails",
    ];

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
        <div>
          <div className={`section-body ${fixNavbar ? "marginTop" : ""}`}>
            <div className="container-fluid">
              <div className="row">
                <div className="col-12 col-lg-12">
                  <form className="card" noValidate onSubmit={this.addEmployee}>
                    <div className="card-body">
                      <h3 className="card-title">Add Employee</h3>
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
                            autoComplete="off"
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
                        <div className="col-sm-6 col-md-4">
                          <InputField
                            type="file"
                            name="photo"
                            label="Photo"
                            onChange={this.handleFileChange}
                            refInput={this.fileInputRefs.photo}
                            accept=".png,.jpg,.jpeg,image/png,image/jpg,image/jpeg"
                            error={this.state.errors.photo}
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
                        <div className="col-md-4 col-sm-12">
                          <InputField
                            label="Password"
                            name="password"
                            type="password"
                            value={password}
                            onChange={this.handleChange}
                            placeholder="Password"
                            error={this.state.errors.password}
                            autoComplete="new-password"
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
                            onChange={(e) => this.handleSkillChange(e, "skillsFrontend")}
                          />

                          {/* Backend Skills */}
                           <CheckboxGroup
                            label="Backend"
                            options={backendSkills}
                            selected={skillsBackend}
                            onChange={(e) => this.handleSkillChange(e, "skillsBackend")}
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
                            <div key={index} className="w-100 col-sm-12">
                              <div className="row">
                                <div className="col-sm-6 col-md-3">
                                  <InputField
                                    label="Salary Source"
                                    name="salarySource"
                                    type="select"
                                    value={entry.salarySource}
                                    onChange={(e) =>
                                      this.handleSalaryDetails(
                                        index,
                                        "salarySource",
                                        e.target.value
                                      )
                                    }
                                    options={[
                                      { value: "IDBI Bank", label: "IDBI Bank" },
                                      { value: "HDFC Bank", label: "HDFC Bank" },
                                      { value: "Cash Payout", label: "Cash Payout" },
                                      { value: "NEFT", label: "NEFT" }
                                    ]}
                                  />
                                </div>
                                <div className="col-sm-6 col-md-3">
                                  <InputField
                                    label="Salary Amount"
                                    name="salaryAmount"
                                    type="number"
                                    value={entry.salaryAmount}
                                    onChange={(e) =>
                                      this.handleSalaryDetails(
                                        index,
                                        "salaryAmount",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Enter salary amount"
                                    error={this.state.errors.salaryAmount}
                                    maxLength="8"
                                  />
                                </div>
                                <div className="col-sm-6 col-md-2">
                                  <InputField
                                    label="From"
                                    name="fromDate"
                                    id="fromDate"
                                    type="date"
                                    value={entry.fromDate}
                                    onChange={(e) =>
                                      this.handleSalaryDetails(
                                        index,
                                        "fromDate",
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                                <div className="col-sm-6 col-md-2">
                                  <InputField
                                    label="To"
                                    name="toDate"
                                    id="toDate"
                                    type="date"
                                    value={entry.toDate}
                                    onChange={(e) =>
                                      this.handleSalaryDetails(
                                        index,
                                        "toDate",
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                                {salaryDetails.length > 1 && (
                                  <div className="col-sm-6 col-md-2">
                                    <div className="form-group">
                                      <Button
                                        icon="fa fa-trash-o text-danger"
                                        title="Delete"
                                        onClick={() => this.removeEntry(index)}
                                        className="btn-icon"
                                        style={{
                                          marginTop: "1.2em",
                                          fontSize: "1.2em",
                                        }}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                          <div className="col-sm-6 col-md-4">
                            <div className="form-group">
                              <Button
                                label="Add More"
                                onClick={this.addMore}
                                className="btn-primary"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Govt Issue ID */}
                        <div className="row mb-4">
                          <h5 className="w-100">Govt Issue ID</h5>
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
                              name="aadharCardFile"
                              type="file"
                              onChange={this.handleFileChange}
                              refInput={this.fileInputRefs.aadharCardFile}
                              
                            />
                          </div>

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
                              refInput={this.fileInputRefs.drivingLicenseFile}
                              placeholder="Driving License"
                            />
                          </div>
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
                              placeholder="Pan Card"
                              onChange={this.handleFileChange}
                              refInput={this.fileInputRefs.panCardFile}
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
                                  value={statisticsVisibilityStatus}
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
                              placeholder="Select your resume"
                              onChange={this.handleFileChange}
                              refInput={this.fileInputRefs.resume}
                              accept=".pdf,.doc,.docx,.txt,.rtf,.gdoc"
                            />
                            {this.state.errors.resume && (
                              <div className="invalid-feedback d-block">{this.state.errors.resume}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      className="card-footer text-right"
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "10px",
                      }}
                    >
                    <Button
                      label="Back"
                      onClick={this.handleBack}
                      className="btn-secondary"
                    />
                    <Button
                      label="Add Employee"
                      type="submit"
                      loading={this.state.ButtonLoading}
                      disabled={this.state.ButtonLoading}
                      className="btn-primary"
                    />
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
        <CropperModal
          open={this.state.showCropper}
          image={this.state.cropperImage}
          onCrop={this.handleCropperCrop}
          onCancel={this.handleCropperCancel}
          aspectRatio={1}
        />
      </>
    );
  }

}

const mapStateToProps = (state) => ({
  fixNavbar: state.settings.isFixNavbar,
});

const mapDispatchToProps = (dispatch) => ({});
export default connect(mapStateToProps, mapDispatchToProps)(AddEmployee);
