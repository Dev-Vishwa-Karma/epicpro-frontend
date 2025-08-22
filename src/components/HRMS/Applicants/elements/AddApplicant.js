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

// Provide minimal process shim for browser builds if needed
if (typeof window !== 'undefined' && typeof window.process === 'undefined') {
  window.process = { env: {} };
}

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
      marital_status: "",
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
      isParsingResume: false,
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

    if (file) {
      this.parseResume(file);
    }
  };

  parseResume = async (file) => {
    this.setState({ isParsingResume: true });
    try {
      const ext = file.name.split(".").pop().toLowerCase();
      if (ext === "pdf") {
        const text = await this.extractTextFromPdf(file);
        this.extractResumeData(text);
      } else if (ext === "docx") {
        const text = await this.extractTextFromDocx(file);
        this.extractResumeData(text);
      } else if (ext === "txt" || ext === "rtf" || file.type === "text/plain") {
        const text = await this.readFileAsText(file);
        this.extractResumeData(text);
      } else {
        const text = await this.readFileAsText(file);
        this.extractResumeData(text);
      }
    } catch (err) {
      console.error("Resume parse error:", err);
    } finally {
      this.setState({ isParsingResume: false });
    }
  };

  ensureScript = (src, globalVar) =>
    new Promise((resolve, reject) => {
      if (globalVar && window[globalVar]) return resolve(window[globalVar]);
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        existing.addEventListener('load', () => resolve(window[globalVar]));
        existing.addEventListener('error', reject);
        return;
      }
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = () => resolve(window[globalVar]);
      s.onerror = reject;
      document.body.appendChild(s);
    });

  extractTextFromPdf = async (file) => {
    // Load pdf.js from CDN and use window.pdfjsLib
    await this.ensureScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js', 'pdfjsLib');
    const pdfjsLib = window.pdfjsLib;
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let textContent = "";
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const strings = content.items.map((item) => item.str);
      textContent += strings.join(" ") + "\n";
    }
    return textContent;
  };

  extractTextFromDocx = async (file) => {
    // Load mammoth from CDN and use window.mammoth
    await this.ensureScript('https://unpkg.com/mammoth/mammoth.browser.min.js', 'mammoth');
    const mammoth = window.mammoth;
    const arrayBuffer = await file.arrayBuffer();
    const { value } = await mammoth.extractRawText({ arrayBuffer });
    return value || "";
  };

  readFileAsText = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (ev) => resolve(ev.target.result || "");
      reader.onerror = reject;
      reader.readAsText(file);
    });

  extractResumeData = (rawContent) => {
    const text = rawContent || "";
    const lower = text.toLowerCase();
    const extracted = {};

    // Email
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
    const emailMatch = text.match(emailRegex);
    if (emailMatch) extracted.email = emailMatch[0];

    // Phones
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const phoneMatches = text.match(phoneRegex);
    if (phoneMatches && phoneMatches.length > 0) {
      const cleaned = phoneMatches
        .map((p) => (p || "").replace(/[^\d]/g, ""))
        .filter((p) => p.length >= 10)
        .map((p) => p.slice(-10));
      if (cleaned[0]) extracted.phone = cleaned[0];
      if (cleaned[1]) extracted.alternate_phone = cleaned[1];
    }

    // Full name heuristic
    const nameLabelRegex = /(name|full\s*name)[:\s]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i;
    const nameLabelMatch = text.match(nameLabelRegex);
    if (nameLabelMatch && nameLabelMatch[2]) {
      extracted.fullname = nameLabelMatch[2].trim();
    } else {
      // First line with multiple Title Case words
      const firstLine = (text.split(/\n|\r/).find((l) => /([A-Z][a-z]+\s+){1,}[A-Z][a-z]+/.test(l)) || "").trim();
      if (firstLine) {
        const m = firstLine.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/);
        if (m && m[1]) extracted.fullname = m[1];
      }
    }

    // Address hints
    const addrRegex = /(address|location)[:\s]*([^\n\r]{10,100})/i;
    const addrMatch = text.match(addrRegex);
    if (addrMatch && addrMatch[2]) extracted.address = addrMatch[2].trim();

    // Experience years
    const expRegex = /(\d+)\s*(?:\+?\s*)?(year|yr)s?\s*(?:of\s*)?experience/i;
    const expMatch = lower.match(expRegex);
    if (expMatch && expMatch[1]) {
      const years = Math.min(8, Math.max(0, parseInt(expMatch[1], 10)));
      extracted.experience = String(years);
    }

    // Graduation year
    const yearRegex = /(graduation|graduated|degree)[^\d]{0,10}(\d{4})/i;
    const yr = lower.match(yearRegex);
    if (yr && yr[2]) {
      const y = parseInt(yr[2], 10);
      const cy = new Date().getFullYear();
      if (y >= 1990 && y <= cy) extracted.graduate_year = y;
    }

    // Skills
    const skillsDict = [
      "html", "css", "javascript", "react", "angular", "vue", "typescript", "jquery",
      "php", "laravel", "python", "node", "symfony", "django", "ruby on rails", "java",
      "c#", ".net", "sql", "mysql", "postgres", "mongodb", "aws", "docker", "kubernetes",
      "git", "rest", "graphql", "redux", "bootstrap", "tailwind", "sass", "less", "webpack",
      "babel", "jest", "mocha", "cypress"
    ];
    const foundSkills = Array.from(new Set(
      skillsDict.filter((s) => lower.includes(s))
    ));
    if (foundSkills.length) extracted.skills = foundSkills;

    this.applyExtractedData(extracted);
  };

  applyExtractedData = (data) => {
    const updates = {};
    if (data.fullname && !this.state.fullname) updates.fullname = data.fullname;
    if (data.email && !this.state.email) updates.email = data.email;
    if (data.phone && !this.state.phone) updates.phone = data.phone;
    if (data.alternate_phone && !this.state.alternate_phone) updates.alternate_phone = data.alternate_phone;
    if (data.address && !this.state.address) updates.address = data.address;
    if (data.experience && !this.state.experience) updates.experience = data.experience;
    if (data.graduate_year && !this.state.graduate_year) updates.graduate_year = data.graduate_year;
    if (data.skills && data.skills.length) updates.skills = data.skills;

    if (Object.keys(updates).length) {
      this.setState({ ...updates, showSuccess: true, successMessage: "Resume parsed. Fields auto-filled." });
      setTimeout(this.dismissMessages, 2500);
    }
  };

  addApplicant = () => {
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
      marital_status,
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
        marital_status: marital_status,
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
      data.source = 'admin';
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
              marital_status: "",
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
    
    const {
      fullname,
      email,
      phone,
      alternate_phone,
      dob,
      marital_status,
      address,
      experience,
      skills,
      joining_timeframe,
      custom_joining_time,
      bond_agreement,
      branch,
      graduate_year,
      showSuccess,
      successMessage,
      showError,
      errorMessage,
      isParsingResume,
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
        <div className="card" noValidate>
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
                  name="marital_status"
                  type="select"
                  value={marital_status}
                  onChange={this.handleChange}
                  error={this.state.errors.marital_status}
                  options={[
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

            <div className="row mb-4">
              <div className="col-md-12">
                <div className="form-group">
                  <label className="form-label">
                    Resume {" "}
                    <small className="text-muted">
                      (PDF, DOCX, DOC, TXT, RTF)
                    </small>
                  </label>
                  <InputField
                    type="file"
                    name="resume"
                    placeholder="Select your resume"
                    onChange={this.handleFileChange}
                    accept=".pdf,.docx,.doc,.txt,.rtf"
                    disabled={isParsingResume}
                  />
                  {this.state.errors.resume && (
                    <div className="invalid-feedback d-block">
                      {this.state.errors.resume}
                    </div>
                  )}
                  {isParsingResume && (
                    <div className="text-muted">Parsing resume...</div>
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
              type="button"
              className="btn-primary"
              loading={this.state.ButtonLoading}
              onClick={this.addApplicant}
            />
          </div>
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  fixNavbar: state.settings.isFixNavbar,
});

const mapDispatchToProps = (dispatch) => ({});
export default connect(mapStateToProps, mapDispatchToProps)(AddApplicant);
