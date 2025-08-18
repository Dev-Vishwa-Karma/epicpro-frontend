import React, { Component } from 'react';
import InputField from '../../common/formInputs/InputField';
import { validateFields } from '../../common/validations';
import { getService } from '../../../services/getService';
import AlertMessages from '../../common/AlertMessages';
import { appendDataToFormData } from '../../../utils';
import Button from '../../common/formInputs/Button';


const initialState = {
  fullname: '', 
  email: '', 
  phone: '', 
  dob: '',
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
      resume,
    } = this.state;

    const formData = new FormData();

    let employeeName = '';
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user) {
      employeeName = user.fullname || user.name || (user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : '');
    }
    const data = {
      fullname: fullname,
      email: email,
      phone: phone,
      resume: resume,
      source: 'referral',
      employee_id: user.id,
      employee_name: employeeName
    };
    appendDataToFormData(formData, data);

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

                    <div className="col-md-6 ">
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

                </div>
                <div className="card-footer text-right" style={{ backgroundColor: '#f8f9fa', borderBottomLeftRadius: '10px', borderBottomRightRadius: '10px' }}>
                  <Button
                    label={isSubmitting ? "Submitting..." : "Submit "}
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