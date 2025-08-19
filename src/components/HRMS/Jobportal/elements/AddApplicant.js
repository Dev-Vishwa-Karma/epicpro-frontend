import React, { Component } from "react";
import { connect } from "react-redux";
import AlertMessages from "../../../common/AlertMessages";
import { getService } from "../../../../services/getService";
import { validateFields } from "../../../common/validations";
import InputField from "../../../common/formInputs/InputField";
import CheckboxGroup from "../../../common/formInputs/CheckboxGroup";
import Button from "../../../common/formInputs/Button";
import { appendDataToFormData, getColor } from "../../../../utils";
import styles from "./applicant.module.css";

import moment from "moment";

const skillOptions = [
  "HTML",
  "CSS",
  "JavaScript",
  "React",
  "Angular",
  "Vue",
  "TypeScript",
  "jQuery",
  "PHP",
  "Laravel",
  "Python",
  "Node.js",
  "Symfony",
  "Django",
  "Ruby on Rails",
];

class AddApplicant extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fullname: "",
      email: "",
      phone: "",
      alternate_phone: "",
      dob: "",
      merital_status: "",
      address: "",
      experience: "",
      skills: [],
      resume: null,
      joining_timeframe: "",
      custom_joining_time: "",
      bond_agreement: "",
      branch: "",
      graduate_year: "",
      successMessage: "",
      showSuccess: false,
      errorMessage: "",
      showError: false,
      errors: {},
      ButtonLoading: false,
    };

    this.fieldRefs = {
      fullname: React.createRef(),
      email: React.createRef(),
    };
  }

  dismissMessages = () => {
    this.setState({
      showSuccess: false,
      successMessage: "",
      showError: false,
      errorMessage: "",
    });
  };

  handleYearChange = (e) => {
    this.setState({ graduate_year: e.target.value });
  };

  experienceOptions = () => {
    let opts = [];
    for (let i = 0; i <= 8; i++) {
      let label = "";
      if (i === 0) {
        label = "Fresher";
      } else if (i === 8) {
        label = "8+ years";
      } else {
        label = `${i} year${i > 1 ? "s" : ""}`;
      }
      opts.push({
        label: label,
        value: i.toString(),
      });
    }
    console.log("opts", opts);
    return opts;
  };

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({
      [name]: value,
      errors: { ...this.state.errors, [name]: "" },
    });
  };

  handleSkillsChange = (e) => {
    const { value, checked } = e.target;
    const { skills } = this.state;
    if (checked) {
      this.setState({ skills: [...skills, value] });
    } else {
      this.setState({ skills: skills.filter((s) => s !== value) });
    }
  };

  handleFileChange = (e) => {
    const file = e.target.files[0];
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "application/rtf",
    ];
    const allowedExtensions = ["pdf", "doc", "docx", "txt", "rtf"];
    let error = "";

    if (file) {
      const ext = file.name.split(".").pop().toLowerCase();
      if (
        !allowedTypes.includes(file.type) &&
        !allowedExtensions.includes(ext)
      ) {
        error =
          "Only PDF, DOC, DOCX, TXT, or RTF files are allowed. Image files are not permitted.";
        this.setState((prev) => ({
          resume: null,
          errors: { ...prev.errors, resume: error },
        }));
        return;
      }
    }

    this.setState((prev) => ({
      resume: file,
      errors: { ...prev.errors, resume: "" },
    }));
  };

  addApplicant = (e) => {
    e.preventDefault();
    this.setState({
      ButtonLoading: true,
      showError: false,
      showSuccess: false,
    });

    const {
      fullname,
      email,
      phone,
      alternate_phone,
      dob,
      merital_status,
      address,
      experience,
      skills,
      resume,
      joining_timeframe,
      custom_joining_time,
      bond_agreement,
      branch,
      graduate_year,
    } = this.state;

    const validationSchema = [
      {
        name: "fullname",
        value: fullname,
        type: "name",
        required: true,
        messageName: "Full Name",
      },
      {
        name: "email",
        value: email,
        type: "email",
        required: true,
        messageName: "Email",
      },
    ];

    const errors = validateFields(validationSchema);
    this.setState({ errors });

    if (Object.keys(errors).length === 0) {
      const formData = new FormData();

      const data = {
        fullname: fullname,
        email: email,
        phone: phone,
        alternate_phone: alternate_phone,
        dob: dob,
        merital_status: merital_status,
        address: address,
        experience: experience,
        skills: JSON.stringify(skills),
        resume: resume,
        joining_timeframe:
          joining_timeframe === "custom"
            ? custom_joining_time
            : joining_timeframe,
        bond_agreement: bond_agreement,
        branch: branch,
        graduate_year: graduate_year ? parseInt(graduate_year) : null,
      };
      console.log("data", data);
      data.source = "admin";
      appendDataToFormData(formData, data);

      getService
        .addCall("applicants.php", "add", formData)
        .then((data) => {
          if (data.status === "success") {
            this.setState({
              ButtonLoading: false,
              showSuccess: true,
              successMessage: "Applicant added successfully!",
              fullname: "",
              email: "",
              phone: "",
              alternate_phone: "",
              dob: "",
              merital_status: "",
              address: "",
              experience: "",
              skills: [],
              resume: null,
              joining_timeframe: "",
              custom_joining_time: "",
              bond_agreement: "",
              branch: "",
              graduate_year: new Date().getFullYear(),
              errors: {},
            });
            setTimeout(this.dismissMessages, 3000);
          } else {
            throw new Error(data.data?.message || "Failed to add applicant");
          }
        })
        .catch((error) => {
          this.setState({
            ButtonLoading: false,
            showError: true,
            errorMessage:
              error.message || "An error occurred while adding the applicant",
          });
          console.error("Error:", error);
          setTimeout(this.dismissMessages, 3000);
        });
    } else {
      this.setState({ ButtonLoading: false });
    }
  };

  handleBack = () => {
    // Navigate back to the list tab
    if (this.props.onTabChange) {
      this.props.onTabChange("list");
    } else {
      this.props.history.goBack();
    }
  };

  render() {
    const currentYear = moment().year();
    const startYear = 1990;
    const years = [];
    for (let year = startYear; year <= currentYear; year++) {
      years.push(year);
    }

    const { fixNavbar } = this.props;
    const {
      fullname,
      email,
      phone,
      alternate_phone,
      dob,
      merital_status,
      address,
      experience,
      skills,
      resume,
      joining_timeframe,
      custom_joining_time,
      bond_agreement,
      branch,
      graduate_year,
      showSuccess,
      successMessage,
      showError,
      errorMessage,
    } = this.state;

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
        <form className="card" noValidate onSubmit={this.addApplicant}>
          <div className="card-body">
            {/* <h3 className="card-title">Add Applicant</h3> */}
            <div className="row">
              <div className="col-sm-6 col-md-6">
                <InputField
                  label="Full Name"
                  name="fullname"
                  type="text"
                  value={fullname}
                  onChange={this.handleChange}
                  placeholder="Enter Full Name"
                  error={this.state.errors.fullname}
                  refInput={this.fieldRefs.fullname}
                />
              </div>
              <div className="col-sm-6 col-md-6">
                <InputField
                  label="Email Address"
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
            </div>
            <div className="row">
              <div className="col-sm-6 col-md-6">
                <InputField
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={phone}
                  onChange={this.handleChange}
                  placeholder="Enter Phone Number"
                  error={this.state.errors.phone}
                  maxLength="10"
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(/\D/g, "");
                  }}
                />
              </div>
              <div className="col-sm-6 col-md-6">
                <InputField
                  label="Alternate Phone Number"
                  name="alternate_phone"
                  type="tel"
                  value={alternate_phone}
                  onChange={this.handleChange}
                  placeholder="Enter Alternate Phone Number"
                  error={this.state.errors.alternate_phone}
                  maxLength="10"
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(/\D/g, "");
                  }}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-sm-6 col-md-6">
                <InputField
                  label="Date of Birth"
                  name="dob"
                  type="date"
                  value={dob}
                  onChange={this.handleChange}
                  error={this.state.errors.dob}
                />
              </div>
              <div className="col-sm-6 col-md-6">
                <InputField
                  label="Marital Status"
                  name="merital_status"
                  type="select"
                  value={merital_status}
                  onChange={this.handleChange}
                  error={this.state.errors.merital_status}
                  options={[
                    // { value: '', label: 'Select Marital Status' },
                    { value: "single", label: "Single" },
                    { value: "married", label: "Married" },
                    { value: "divorced", label: "Divorced" },
                    { value: "widowed", label: "Widowed" },
                  ]}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <InputField
                  label="Address"
                  name="address"
                  type="text"
                  value={address}
                  onChange={this.handleChange}
                  placeholder="Enter Complete Address"
                  error={this.state.errors.address}
                />
              </div>
            </div>
            <div className="row">
              {/* Technical Skills */}
              <div className="row mb-4">
                <div className="col-md-12">
                  <CheckboxGroup
                    label="Technical Skills"
                    options={skillOptions}
                    selected={skills}
                    onChange={this.handleSkillsChange}
                    getColor={getColor}
                  />
                  {this.state.errors.skills && (
                    <div className="invalid-feedback d-block">
                      {this.state.errors.skills}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-sm-4 col-md-4">
                <InputField
                  label="Years of Experience"
                  name="experience"
                  type="select"
                  value={experience}
                  onChange={this.handleChange}
                  error={this.state.errors.experience}
                  options={this.experienceOptions()}
                />
              </div>
              <div className="col-sm-4 col-md-4">
                <InputField
                  label="Branch"
                  name="branch"
                  type="text"
                  value={branch}
                  onChange={this.handleChange}
                  placeholder="Enter Branch"
                  error={this.state.errors.branch}
                />
              </div>
              <div className="col-sm-4 col-md-4">
                <InputField
                  label="Graduate Year"
                  name="graduate_year"
                  type="select"
                  value={graduate_year}
                  onChange={this.handleChange}
                  error={this.state.errors.graduate_year}
                  options={years.map((year) => ({
                    value: year,
                    label: year.toString(),
                  }))}
                />
              </div>
            </div>

            <div className="row">
              <div className="col-sm-6 col-md-6">
                <InputField
                  label="How Soon He Can Join?"
                  name="joining_timeframe"
                  type="select"
                  value={joining_timeframe}
                  onChange={this.handleChange}
                  error={this.state.errors.joining_timeframe}
                  options={[
                    { value: "Same Week", label: "Same Week" },
                    { value: "Next Week", label: "Next Week" },
                    { value: "After 15 Days", label: "After 15 Days" },
                    { value: "custom", label: "Mention How Much" },
                  ]}
                />
              </div>
              {joining_timeframe === "custom" && (
                <div className="col-sm-6 col-md-6">
                  <InputField
                    label="Custom Joining Time"
                    name="custom_joining_time"
                    type="text"
                    value={custom_joining_time}
                    onChange={this.handleChange}
                    placeholder="e.g., 1 month, 45 days"
                    error={this.state.errors.custom_joining_time}
                  />
                </div>
              )}
              <div className="col-sm-6 col-md-6">
                <InputField
                  label="Is He Willing to Sign 18 Month Bond?"
                  name="bond_agreement"
                  type="select"
                  value={bond_agreement}
                  onChange={this.handleChange}
                  firstOption={false}
                  options={[
                    { value: "", label: "Select Option" },
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "No" },
                  ]}
                />
              </div>
            </div>
            {/* Resume Upload */}
            <div className="row mb-4">
              <div className="col-md-12">
                <div className="form-group">
                  <label className="form-label">
                    Resume/CV{" "}
                    <small className="text-muted">
                      (PDF, DOC, DOCX, TXT, RTF)
                    </small>
                  </label>
                  <InputField
                    type="file"
                    name="resume"
                    placeholder="Select your resume"
                    onChange={this.handleFileChange}
                    accept=".pdf,.doc,.docx,.txt,.rtf"
                  />
                  {this.state.errors.resume && (
                    <div className="invalid-feedback d-block">
                      {this.state.errors.resume}
                    </div>
                  )}
                  <small className="form-text text-muted">
                    Max file size: 2MB.
                  </small>
                </div>
              </div>
            </div>
          </div>
          <div
            className={`card-footer text-right add-resume ${styles.cardFooter}`}
          >
            <Button
              label="Back"
              onClick={this.handleBack}
              className="btn-secondary"
            />
            <Button
              label="Add Applicant"
              type="submit"
              className="btn-primary"
              loading={this.state.ButtonLoading}
            />
          </div>
        </form>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  fixNavbar: state.settings.isFixNavbar,
});

const mapDispatchToProps = (dispatch) => ({});
export default connect(mapStateToProps, mapDispatchToProps)(AddApplicant);
