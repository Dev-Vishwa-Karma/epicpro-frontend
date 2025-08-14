import React, { Component } from 'react';
import InputField from '../../common/formInputs/InputField';
import CheckboxGroup from '../../common/formInputs/CheckboxGroup';
import { validateFields } from '../../common/validations';
import { getService } from '../../../services/getService';
import AlertMessages from '../../common/AlertMessages';
import { getColor } from '../../../utils';
import { appendDataToFormData } from '../../../utils';
import Button from '../../common/formInputs/Button';


const skillOptions = [
  'HTML',
  'CSS',
  'JavaScript',
  'React',
  'Angular',
  'Vue',
  'TypeScript',
  'jQuery',
  'PHP',
  'Laravel',
  'Python',
  'Node.js',
  'Symfony',
  'Django',
  'Ruby on Rails'
];

const initialState = {
  fullname: '', 
  email: '', 
  phone: '', 
  alternate_phone: '',
  dob: '',
  merital_status: '',
  address: '', 
  experience: '', 
  skills: [], 
  resume: null,
};

class ApplicantForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ...initialState,
      errors: {},
      submitted: false,
      isSubmitting: false,
      submitError: null,
      showSuccess: false,
    };
  }

  submitApplication = () => {
    this.setState({ isSubmitting: true });
    
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
    } = this.state;

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
      resume:resume
    }
    appendDataToFormData(formData, data)

    getService.addCall('applicants.php', 'add', formData)
      .then(data => {
        if (data.status === 'success') {
          this.setState({
            submitted: true,
            isSubmitting: false,
            ...initialState,
            showSuccess: true,
          });
          setTimeout(() => {
            this.setState({ showSuccess: false });
          }, 3000);
        } else {
          throw new Error(data.data?.message || 'Failed to submit application');
        }
      })
      .catch(error => {
        this.setState({
          isSubmitting: false,
          submitError: error.message || 'An error occurred while submitting the application'
        });
        console.error('Error:', error);
      });
  };

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  handleSkillsChange = (e) => {
    const { value, checked } = e.target;
    const { skills } = this.state;
    if (checked) {
      this.setState({ skills: [...skills, value] });
    } else {
      this.setState({ skills: skills.filter(s => s !== value) });
    }
  };

  handleFileChange = (e) => {
    const file = e.target.files[0];
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/rtf',
    ];
    const allowedExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
    let error = '';
    if (file) {
      const ext = file.name.split('.').pop().toLowerCase();
      if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(ext)) {
        error = 'Only PDF, DOC, DOCX, TXT, or RTF files are allowed. Image files are not permitted.';
        this.setState(prev => ({
          resume: null,
          errors: { ...prev.errors, resume: error }
        }));
        return;
      }
    }
    this.setState(prev => ({
      resume: file,
      errors: { ...prev.errors, resume: '' }
    }));
  };

  handleSubmit = (e) => {
    e.preventDefault();
    this.setState({ submitError: null });

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
    } = this.state

    const validationSchema = [
      { name: 'fullname', value: fullname, type: 'name', required: true, messageName: 'Full Name' },
      { name: 'email', value: email, type: 'email', required: true, messageName: 'Email' },
      { name: 'phone', value: phone, type: 'mobile', required: true, messageName: 'Phone' },
      { name: 'alternate_phone', value: alternate_phone, type: 'mobile', required: false, messageName: 'Alternate Phone' },
      { name: 'dob', value: dob, type: 'date', required: false, messageName: 'Date of Birth' },
      { name: 'merital_status', value: merital_status, type: 'text', required: false, messageName: 'Marital Status' },
      { name: 'address', value: address, type: 'text', required: true, messageName: 'Address ' },
      { name: 'experience', value: experience, type: 'text', required: true, messageName: 'experience ' },
      { name: 'skills', value: skills.length > 0 ? 'selected' : '', type: 'text', required: true, messageName: 'Skills' },
      { name: 'resume', value: resume ? 'uploaded' : '', type: 'file', required: true, messageName: 'Resume' },
    ];
    const errors = validateFields(validationSchema);
    this.setState({ errors });
    if (Object.keys(errors).length === 0) {
      this.submitApplication();
    }
  };

  render() {
    const { 
      fullname, 
      email, 
      phone, 
      alternate_phone,
      dob,
      merital_status,
      address, 
      skills, 
      experience, 
      resume, 
      errors,
      submitError, 
      isSubmitting,
      showSuccess,
    } = this.state;

    return (
      <>
        <AlertMessages
          showSuccess={showSuccess}
          successMessage="Thank you for applying!"
          showError={!!submitError}
          errorMessage={submitError}
          setShowSuccess={val => this.setState({ showSuccess: val })}
          setShowError={val => this.setState({ submitError: val ? submitError : null })}
        />
          <div className="container-fluid ">
            <div className="col-md-12 col-md-10 col-lg-12">
              <form className="card shadow-sm" onSubmit={this.handleSubmit} noValidate autoComplete="off">
                <div className="card-body">
                  {submitError && (
                    <div className="alert alert-danger" role="alert">
                      <i className="fa fa-exclamation-circle mr-2"></i>
                      {submitError}
                    </div>
                  )}
                  
                  <div className="row">
                    
                    <div className="col-md-6">
                      <InputField
                        label="Full Name"
                        name="fullname"
                        value={fullname}
                        onChange={this.handleChange}
                        placeholder="Enter your Full Name"
                        error={errors.fullname}
                      />
                    </div>

                    <div className="col-md-6">
                      <InputField
                        label="Email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={this.handleChange}
                        placeholder="Enter your email"
                        error={errors.email}
                      />
                    </div>

                    <div className="col-md-6">
                      <InputField
                        label="Phone"
                        name="phone"
                        type="tel"
                        value={phone}
                        onChange={this.handleChange}
                        placeholder="Enter your phone number"
                        error={errors.phone}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <InputField
                        label="Alternate Phone"
                        name="alternate_phone"
                        type="tel"
                        value={alternate_phone}
                        onChange={this.handleChange}
                        placeholder="Enter alternate phone number"
                        error={errors.alternate_phone}
                      />
                    </div>
                    <div className="col-md-6">
                      <InputField
                        label="Date of Birth"
                        name="dob"
                        type="date"
                        value={dob}
                        onChange={this.handleChange}
                        error={errors.dob}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <InputField
                        label="Marital Status"
                        name="merital_status"
                        type="select"
                        value={merital_status}
                        onChange={this.handleChange}
                        error={errors.merital_status}
                        options={[
                          { value: '', label: 'Select Marital Status' },
                          { value: 'single', label: 'Single' },
                          { value: 'married', label: 'Married' },
                          { value: 'divorced', label: 'Divorced' },
                          { value: 'widowed', label: 'Widowed' },
                        ]}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-12">
                      <InputField
                        label="Street Address"
                        name="address"
                        value={address}
                        onChange={this.handleChange}
                        placeholder="Street address"
                        error={errors.address}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-12">
                      <CheckboxGroup
                        label="Technical Skills"
                        options={skillOptions} 
                        selected={skills}
                        onChange={this.handleSkillsChange}
                        getColor={getColor}
                      />
                      {errors.skills && <div className="invalid-feedback d-block">{errors.skills}</div>}
                    </div>

                    <div className="col-md-12 mt-3">
                      <div className="form-group">
                        <label htmlFor="resume" style={{ fontWeight: 500 }}>
                          Resume/CV <small className="text-muted">(PDF, DOC, DOCX, TXT, RTF)</small>
                        </label>
                        <div className="custom-file">
                          <InputField
                            type="file"
                            id="resume"
                            name="resume"
                            onChange={this.handleFileChange}
                            accept=".pdf,.doc,.docx,.txt,.rtf"
                          />
                          <label className="custom-file-label" htmlFor="resume">
                            {resume ? resume.name : "Choose file..."}
                          </label>
                            {this.state.errors.resume && (
                              <div className="invalid-feedback d-block">{this.state.errors.resume}</div>
                          )}
                        </div>
                        <small className="form-text text-muted">Max file size: 2MB.</small>
                      </div>
                    </div>

                    <div className='col-md-4 mt-4'>
                        <InputField
                          id="experience"
                          label="Years of Experience"
                          name="experience"
                          type="select"
                          value={experience}
                          onChange={this.handleChange}
                          error={errors.experience}
                          options={[
                            { value: '', label: 'Select Experience' },
                            { value: '0-1', label: '0-1 years' },
                            { value: '1-2', label: '1-2 years' },
                            { value: '2-4', label: '2-4 years' },
                            { value: '4-6', label: '4-6 years' },
                            { value: '6-8', label: '6-8 years' },
                            { value: '8+', label: '8+ years' },
                          ]}
                        />
                    </div>
                  </div>

                </div>
                <div className="card-footer text-right" style={{ backgroundColor: '#f8f9fa', borderBottomLeftRadius: '10px', borderBottomRightRadius: '10px' }}>
                  <Button
                    label={isSubmitting ? "Submitting..." : "Submit Application"}
                    onClick={this.onSubmit}
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary px-5"
                    style={{ fontWeight: 600 }}
                    icon={isSubmitting ? "" : "fa fa-paper-plane"}
                    iconStyle={{ marginRight: '8px' }}
                    loading={isSubmitting}
                  />
                </div>
              </form>
            </div>
          </div>
      </>
    );
  }
}

export default ApplicantForm;