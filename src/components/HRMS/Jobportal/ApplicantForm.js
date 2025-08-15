import React, { Component } from 'react';
import InputField from '../../common/formInputs/InputField';
import CheckboxGroup from '../../common/formInputs/CheckboxGroup';
import YearSelector from '../../common/YearSelector';
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
  marital_status: '',
  address: '', 
  experience: '', 
  skills: [], 
  resume: null,
  joining_timeframe: '',
  custom_joining_time: '',
  bond_agreement: '',
  branch: '',
  graduate_year: new Date().getFullYear(),
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
      joining_timeframe: joining_timeframe === 'custom' ? custom_joining_time : joining_timeframe,
      bond_agreement: bond_agreement,
      branch: branch,
      graduate_year: graduate_year
    }
    data.source = 'public';
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

  handleYearChange = (e) => {
    this.setState({ graduate_year: parseInt(e.target.value) });
  };

  experienceOptions = () => {
    let opts = [];
    for (let i = 0; i <= 8; i++) {
      let label = '';
      if (i === 0) {
        label = 'Fresher';
      } else if (i === 8) {
        label = '8+ years';
      } else {
        label = `${i} year${i > 1 ? 's' : ''}`;
      }
      opts.push({
        label: label,
        value: i.toString()
      });
    }
    console.log('opts',opts)
    return opts;
    
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
    } = this.state

    const validationSchema = [
      { name: 'fullname', value: fullname, type: 'name', required: true, messageName: 'Full Name' },
      { name: 'email', value: email, type: 'email', required: true, messageName: 'Email' },
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
      marital_status,                                         
      address, 
      skills, 
      experience,                         
      resume, 
      joining_timeframe,                      
      custom_joining_time,
      bond_agreement,               
      branch,
      graduate_year,              
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
                        name="marital_status"
                        type="select"
                        value={marital_status}
                        onChange={this.handleChange}
                        error={errors.marital_status}
                        options={[
                          { value: '', label: 'Select Marital Status' },
                          { value: 'single', label: 'Single' },
                          { value: 'married', label: 'Married' },
                          { value: 'divorced', label: 'Divorced' },
                          { value: 'widowed', label: 'Widowed' },
                        ]}
                      />
                    </div>
                    <div className="col-md-6">
                      <InputField
                        label="How Soon Can You Join?"
                        name="joining_timeframe"
                        type="select"
                        value={joining_timeframe}
                        onChange={this.handleChange}
                        error={errors.joining_timeframe}
                        options={[
                          { value: '', label: 'Select Joining Time' },
                          { value: 'Same Week', label: 'Same Week' },
                          { value: 'Next Week', label: 'Next Week' },
                          { value: 'After 15 Days', label: 'After 15 Days' },
                          { value: 'custom', label: 'Mention How Much' },
                        ]}
                      />
                    </div>
                  </div>

                  {joining_timeframe === 'custom' && (
                    <div className="row">
                      <div className="col-md-6">
                        <InputField
                          label="Custom Joining Time"
                          name="custom_joining_time"
                          type="text"
                          value={custom_joining_time}
                          onChange={this.handleChange}
                          placeholder="e.g., 1 month, 45 days"
                          error={errors.custom_joining_time}
                        />
                      </div>
                    </div>
                  )}

                  <div className="row">
                    <div className="col-md-6">
                      <InputField
                        label="Are You Willing to Sign 18 Month Bond?"
                        name="bond_agreement"
                        type="select"
                        value={bond_agreement}
                        onChange={this.handleChange}
                        error={errors.bond_agreement}
                        options={[
                          { value: 'yes', label: 'Yes' },
                          { value: 'no', label: 'No' },
                        ]}
                      />
                    </div>
                    <div className="col-md-6">
                      <InputField
                        label="Branch"
                        name="branch"
                        type="text"
                        value={branch}
                        onChange={this.handleChange}
                        placeholder="Enter Branch"
                        error={errors.branch}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">Graduate Year</label>
                        <YearSelector
                          selectedYear={graduate_year}
                          handleYearChange={this.handleYearChange}
                          labelClass="form-label"
                          selectClass="form-control"
                        />
                        {errors.graduate_year && (
                          <div className="invalid-feedback d-block">{errors.graduate_year}</div>
                        )}
                      </div>
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
                          options={this.experienceOptions()}
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