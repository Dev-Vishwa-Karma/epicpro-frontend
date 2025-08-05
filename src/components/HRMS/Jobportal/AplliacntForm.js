import React, { Component } from 'react';
import InputField from '../../common/formInputs/InputField';
import CheckboxGroup from '../../common/formInputs/CheckboxGroup';
import { validateFields } from '../../common/validations';


const SKILLS = [
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

function getColor(skill) {
  const colors = {
    HTML: 'pink',
    CSS: 'blue',
    JavaScript: 'yellow',
    React: 'cyan',
    Angular: 'red',
    Vue: 'green',
    TypeScript: 'blue',
    jQuery: 'yellow',
    PHP: 'pink',
    Laravel: 'blue',
    Python: 'yellow',
    'Node.js': 'cyan',
    Symfony: 'red',
    Django: 'purple',
    'Ruby on Rails': 'orange',
  };
  return colors[skill] || 'gray';
}

const initialState = {
  fullname: '', email: '', phone: '', streetaddress: '', experience: '', skills: [], resume: null,
};

class ApplicantForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ...initialState,
      errors: {},
      submitted: false,
      isSubmitting: false,
      submitError: null
    };
  }

  submitApplication = () => {
    this.setState({ isSubmitting: true });
    
    const {
      fullname,
      email,
      phone,
      streetaddress,
      experience,
      skills,
      resume,
    } = this.state;

    const formData = new FormData();
    formData.append('fullname', fullname);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('streetaddress', streetaddress);
    formData.append('experience', experience);
    formData.append('skills', JSON.stringify(skills));
    formData.append('resume', resume);

    fetch('applicants.php?action=add', {
      method: 'POST',
      body: formData
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      if (data.status === 'success') {
        this.setState({
          submitted: true,
          isSubmitting: false,
          ...initialState
        });
      } else {
        throw new Error(data.message || 'Failed to submit application');
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
    this.setState({ resume: e.target.files[0] });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    this.setState({ submitError: null });

    const {
      fullname,
      email,
      phone,
      streetaddress,
      experience,
      skills,
      resume,
    } = this.state

    const validationSchema = [
      { name: 'fullname', value: fullname, type: 'name', required: true, messageName: 'Full Name' },
      { name: 'email', value: email, type: 'email', required: true, messageName: 'Email' },
      { name: 'phone', value: phone, type: 'mobile', required: true, messageName: 'Phone' },
      { name: 'streetaddress', value: streetaddress, type: 'text', required: true, messageName: 'Address ' },
      { name: 'experience', value: experience, type: 'text', required: true, messageName: 'experience ' },
      { name: 'skills', value: skills.length > 0 ? 'selected' : '', type: 'text', required: true, messageName: 'Skills' },
      { name: 'resume', value: resume ? 'uploaded' : '', type: 'file', required: true, messageName: 'Resume' },
    ];
    const errors = validateFields(validationSchema);
    this.setState({ errors });
    if (Object.keys(errors).length === 0) {
      this.setState({ submitted: true });
    }
  };

  render() {
    const {  fullname, email, phone, streetaddress, skills, experience, resume, errors, submitted } = this.state;
    return (
      <div className="section-body" style={{ backgroundColor: '#f8f9fa', padding: '2rem 0' }}>
        <div className="container-fluid d-flex justify-content-center align-items-center">
          <div className="col-12 col-md-10 col-lg-8">
            <form className="card shadow-sm" onSubmit={this.handleSubmit} autoComplete="off" style={{ border: 'none', borderRadius: '10px' }}>
              <div className="card-header bg-primary text-white" style={{ borderTopLeftRadius: '10px', borderTopRightRadius: '10px' }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <img src="https://ik.imagekit.io/sentyaztie/profilics_logo-removebg-preview.png?updatedAt=1754393233457" alt="Profilics System" style={{ height: '70px', marginRight: '15px' }} />
                  </div>
                  <div className="text-right">
                    <h3 className="mb-0" style={{ fontWeight: 700 }}>Join Our Team</h3>
                    <small>Innovate. Create. Grow With Us.</small>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div className="text-center mb-4">
                  <h3 className="card-title mb-2" style={{ fontWeight: 700, color: '#2c3e50' }}>Job Application Form</h3>
                  <p className="text-muted mb-0" style={{ fontSize: '1.05rem' }}>
                    We're excited that you're interested in joining our team. Please fill out this form completely to be considered for current or future opportunities.
                  </p>
                  <div className="alert alert-info mt-3 text-left">
                    <i className="fa fa-info-circle mr-2"></i>
                    All fields marked with an asterisk (<span className="text-danger">*</span>) are required.
                  </div>
                </div>

                {submitError && (
                  <div className="alert alert-danger" role="alert">
                    <i className="fa fa-exclamation-circle mr-2"></i>
                    {submitError}
                  </div>
                )}
                
                <h5 className="mb-3" style={{ color: '#3498db', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>Personal Information</h5>
                <div className="row">
                  
                  <div className="col-md-6">
                    <InputField
                      label="Full Name *"
                      name="fullname"
                      value={fullname}
                      onChange={this.handleChange}
                      placeholder="Enter your Full Name"
                      error={errors.fullname}
                    />
                  </div>

                  <div className="col-md-6">
                    <InputField
                      label="Email *"
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
                      label="Phone *"
                      name="phone"
                      type="tel"
                      value={phone}
                      onChange={this.handleChange}
                      placeholder="Enter your phone number"
                      error={errors.phone}
                    />
                  </div>
                </div>

                <h5 className="mb-3 mt-4" style={{ color: '#3498db', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>Address Information</h5>
                <div className="row">
                  <div className="col-md-12">
                    <InputField
                      label="Street Address *"
                      name="streetaddress"
                      value={streetaddress}
                      onChange={this.handleChange}
                      placeholder="Street address"
                      error={errors.streetaddress}
                    />
                  </div>
                </div>

                <h5 className="mb-3 mt-4" style={{ color: '#3498db', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>Professional Information</h5>
                <div className="row">
                  <div className="col-md-12">
                    <CheckboxGroup
                      label="Technical Skills * (select all that apply)"
                      options={SKILLS} 
                      selected={skills}
                      onChange={this.handleSkillsChange}
                      getColor={getColor}
                    />
                    {errors.skills && <div className="invalid-feedback d-block">{errors.skills}</div>}
                    <small className="form-text text-muted">Select the skills that match your expertise.</small>
                  </div>

                  <div className="col-md-12 mt-3">
                    <div className="form-group">
                      <label htmlFor="resume" style={{ fontWeight: 500 }}>
                        Resume/CV * <small className="text-muted">(PDF, DOC, DOCX, TXT, RTF)</small>
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
                      <small className="form-text text-muted">Max file size: 2MB. Please ensure your contact information is included.</small>
                    </div>
                  </div>

                  <div className='col-md-4 mt-4'>
                      <InputField
                        id="experience"
                        label="Years of Experience *"
                        name="experience"
                        type="select"
                        value={experience}
                        onChange={this.handleChange}
                        error={errors.experience}
                        options={[
                          { value: '0-1', label: '0-1 years' },
                          { value: '1-2', label: '1-2 years' },
                          { value: '2-4', label: '2-4 years' },
                          { value: '4-6', label: '4-6 years' },
                          { value: '6-8', label: '6-8 years' },
                          { value: '8+', label: '8+ years' },
                        ]}
                      />
                  </div>

                  <div className="col-md-12 mt-3">
                    <div className="form-group">
                      <label style={{ fontWeight: 500 }}>Cover Letter (optional)</label>
                      <InputField 
                        type='textarea'
                        placeholder="Tell us why you'd be a great fit for our team..."
                        style={{ resize: 'vertical' }}
                      />
                    </div>
                  </div>
                </div>

                <div className="row mt-3">
                  <div className="col-md-12">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="consent" required />
                      <label className="form-check-label" htmlFor="consent">
                        I certify that the information provided in this application is true and complete. I understand that false 
                        or misleading information may result in termination of employment.
                      </label>
                    </div>
                  </div>
                </div>

                {submitted && (
                  <div className="alert alert-success mt-4" role="alert">
                    <i className="fa fa-check-circle mr-2"></i>
                    <strong>Thank you for applying!</strong> We have received your application and will review it carefully. 
                    If your qualifications match our needs, we'll contact you to schedule an interview. 
                    The typical review process takes 2-3 weeks.
                  </div>
                )}
              </div>
              <div className="card-footer text-right" style={{ backgroundColor: '#f8f9fa', borderBottomLeftRadius: '10px', borderBottomRightRadius: '10px' }}>
               
                <button 
                  type="submit" 
                  className="btn btn-primary px-5" 
                  style={{ fontWeight: 600 }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <i className="fa fa-paper-plane mr-2"></i>
                      Submit Application
                    </>
                  )}
                </button>
              </div>
            </form>
            
            <div className="text-center mt-4 text-muted">
              <small>
                <p>We are an equal opportunity employer. All qualified applicants will receive consideration for employment without regard to race, color, religion, sex, sexual orientation, gender identity, national origin, or protected veteran status and will not be discriminated against on the basis of disability.</p>
                <p>For questions about this application, please contact <a href="mailto:hr@profilics.com">hr@profilics.com</a> or <a href="tel:+919999999999">+91-9999999999</a></p>
              </small>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ApplicantForm;