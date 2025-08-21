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
  resume: null,
  errors: {},
  submitted: false,
  isSubmitting: false,
  submitError: null,
  showSuccess: false,
};

class ApplicantForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ...initialState,
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

    // Referrer details
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    let employeeName = '';
    if (user) {
      employeeName =
        user.fullname ||
        user.name ||
        (user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : '');
    }

    const data = {
      fullname: fullname,
      email: email,
      phone: phone,
      resume: resume,
      source: 'referral',
      employee_id: user.id,
      employee_name: employeeName,
    };

    appendDataToFormData(formData, data);

    getService
      .addCall('applicants.php', 'add', formData)
      .then((data) => {
        if (data.status === 'success') {
          this.setState({
            ...initialState,
            submitted: true,
            isSubmitting: false,
            showSuccess: true,
          });
          setTimeout(() => {  
            this.setState({ showSuccess: false });
          }, 3000);
        } else {
          throw new Error(data.data?.message || 'Failed to submit application');
        }
      })  
      .catch((error) => { 
        this.setState({
          isSubmitting: false,
          submitError: error.message || 'An error occurred while submitting the application',
        });
        console.error('Error:', error);
      });
  };

  handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    this.setState({ [name]: type === 'checkbox' ? checked : value });
  };

  handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/rtf',
    ];
    const allowedExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
    const maxSizeBytes = 2 * 1024 * 1024;

    let error = '';
    if (file) {
      const ext = file.name.split('.').pop().toLowerCase();
      const validType = allowedTypes.includes(file.type) || allowedExtensions.includes(ext);
      if (!validType) {
        error =
          'Only PDF, DOC, DOCX, TXT, or RTF files are allowed. Image files are not permitted.';
      } else if (file.size > maxSizeBytes) {
        error = 'File is too large. Maximum allowed size is 2MB.';
      }
    }

    if (error) {
      this.setState((prev) => ({
        resume: null,
        errors: { ...prev.errors, resume: error },
      }));
      return;
    }

    this.setState((prev) => ({
      resume: file || null,
      errors: { ...prev.errors, resume: '' },
    }));
  };

  handleSubmit = (e) => {
    e.preventDefault();
    this.setState({ submitError: null });

    const {
      fullname,
      email
    } = this.state;


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

  handleReset = () => {
    this.setState({ ...initialState });
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
          successMessage="Thanks! We’ve received your referral"
          showError={!!submitError}
          errorMessage={submitError}
          setShowSuccess={(val) => this.setState({ showSuccess: val })}
          setShowError={(val) => this.setState({ submitError: val ? submitError : null })}
        />        

        <div className="container-fluid">
          <div className="mb-4 p-4 rounded bg-primary text-white">
          <div className="d-flex align-items-center">
            <i className="fa fa-handshake-o mr-3" style={{ fontSize: 28 }} aria-hidden="true"></i>
            <div>
              <h4 className="mb-1" style={{ fontWeight: 700 }}>
                Refer a Candidate
              </h4>
                <div className="small">
                  Help us hire great people and build a strong team!
              </div>
            </div>
          </div>
          </div>
          
          <div className="row">
            <div className="col-lg-8 mb-4">
              <form className="card shadow-sm" onSubmit={this.handleSubmit} noValidate autoComplete="off">
                <div
                  className="card-header d-flex align-items-center"
                  style={{
                    backgroundColor: '#f8f9fa',
                    borderBottom: '1px solid #e9ecef',
                  }}
                >
                  <strong>Candidate Information</strong>
                </div>

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
                        placeholder="Enter candidate's full name"
                        error={errors.fullname}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="col-md-6">
                      <InputField
                        label="Email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={this.handleChange}
                        placeholder="candidate@example.com"
                        error={errors.email}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="col-md-6">
                      <InputField
                        label="Phone"
                        name="phone"
                        type="tel"
                        value={phone}
                        onChange={this.handleChange}
                        placeholder="10-digit mobile number"
                        error={errors.phone}
                        maxLength={10}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="resume" style={{ fontWeight: 500 }}>
                        Resume <small className="text-muted">(PDF, DOC, DOCX, TXT, RTF)</small>
                      </label>
                      <div className="custom-file">
                        <InputField
                          type="file"
                          id="resume"
                          name="resume"
                          onChange={this.handleFileChange}
                          accept=".pdf,.doc,.docx,.txt,.rtf"
                          disabled={isSubmitting}
                        />
                        <label className="custom-file-label" htmlFor="resume">
                          {resume ? resume.name : 'Choose file...'}
                        </label>
                        {errors.resume && <div className="invalid-feedback d-block">{errors.resume}</div>}
                      </div>
                      <small className="form-text text-muted">
                        Max file size: 2MB.
                      </small>
                    </div>
                  </div>
                </div>

                <div
                  className="card-footer d-flex justify-content-end align-items-center"
                  style={{ backgroundColor: '#f8f9fa', borderBottomLeftRadius: '10px', borderBottomRightRadius: '10px' }}
                >
                  <div>
                    <Button
                      label="Reset"
                      type="button"
                      className="btn-secondary mr-2"
                      onClick={this.handleReset}
                      disabled={isSubmitting}
                      icon="fa fa-undo"
                      iconStyle={{ marginRight: '8px' }}
                    />
                    <Button
                      label={isSubmitting ? 'Submitting...' : 'Submit Referral'}
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary px-4"
                      iconStyle={{ marginRight: '8px' }}
                      loading={isSubmitting}
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="col-lg-4">
              <div className="card shadow-sm">
                <div
                  className="card-header d-flex align-items-center"
                  style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #e9ecef' }}
                >
                  <i className="fa fa-lightbulb-o mr-2" aria-hidden="true"></i>
                  <strong>Referral Tips</strong>
                </div>
                <div className="card-body">
                  <ul className="mb-3">
                    <li>Share why the candidate is a strong fit for the role.</li>
                    <li>Verify the candidate's full name, email, and current mobile number for accuracy.</li>
                    <li>Submit a tailored, up-to-date resume that highlights relevant skills.</li>
                  </ul>
                  <div className="alert alert-info mb-0" role="alert">
                    <i className="fa fa-handshake-o mr-2" aria-hidden="true"></i>
                    Refer a qualified candidate and make a direct impact on our company's success.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default ApplicantForm;