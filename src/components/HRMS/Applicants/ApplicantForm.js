import React, { Component } from 'react';
import InputField from '../../common/formInputs/InputField';
import { validateFields } from '../../common/validations';
import { getService } from '../../../services/getService';
import AlertMessages from '../../common/AlertMessages';
import { appendDataToFormData } from '../../../utils';
import Button from '../../common/formInputs/Button';

// Provide minimal process shim for browser builds if needed
if (typeof window !== 'undefined' && typeof window.process === 'undefined') {
  window.process = { env: {} };
}

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
  isParsingResume: false,
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

    if (file) {
      this.parseResume(file);
    }
  };

  parseResume = async (file) => {
    this.setState({ isParsingResume: true });
    try {
      const ext = (file.name.split('.').pop() || '').toLowerCase();
      if (ext === 'pdf') {
        const text = await this.extractTextFromPdf(file);
        this.extractResumeData(text);
      } else if (ext === 'docx') {
        const text = await this.extractTextFromDocx(file);
        this.extractResumeData(text);
      } else if (ext === 'txt' || ext === 'rtf' || file.type === 'text/plain') {
        const text = await this.readFileAsText(file);
        this.extractResumeData(text);
      } else {
        const text = await this.readFileAsText(file);
        this.extractResumeData(text);
      }
    } catch (err) {
      console.error('Resume parse error:', err);
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

  readFileAsText = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (ev) => resolve(ev.target.result || '');
      reader.onerror = reject;
      reader.readAsText(file);
    });

  extractTextFromPdf = async (file) => {
    await this.ensureScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js', 'pdfjsLib');
    const pdfjsLib = window.pdfjsLib;
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let textContent = '';
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const strings = content.items.map((item) => item.str);
      textContent += strings.join(' ') + '\n';
    }
    return textContent;
  };

  extractTextFromDocx = async (file) => {
    await this.ensureScript('https://unpkg.com/mammoth/mammoth.browser.min.js', 'mammoth');
    const mammoth = window.mammoth;
    const arrayBuffer = await file.arrayBuffer();
    const { value } = await mammoth.extractRawText({ arrayBuffer });
    return value || '';
  };

  extractResumeData = (rawContent) => {
    const text = rawContent || '';
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
        .map((p) => (p || '').replace(/[^\d]/g, ''))
        .filter((p) => p.length >= 10)
        .map((p) => p.slice(-10));
      if (cleaned[0]) extracted.phone = cleaned[0];
    }

    // Full name heuristic
    const nameLabelRegex = /(name|full\s*name)[:\s]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i;
    const nameLabelMatch = text.match(nameLabelRegex);
    if (nameLabelMatch && nameLabelMatch[2]) {
      extracted.fullname = nameLabelMatch[2].trim();
    } else {
      const firstLine = (text.split(/\n|\r/).find((l) => /([A-Z][a-z]+\s+){1,}[A-Z][a-z]+/.test(l)) || '').trim();
      if (firstLine) {
        const m = firstLine.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/);
        if (m && m[1]) extracted.fullname = m[1];
      }
    }

    this.applyExtractedData(extracted);
  };

  applyExtractedData = (data) => {
    const updates = {};
    if (data.fullname && !this.state.fullname) updates.fullname = data.fullname;
    if (data.email && !this.state.email) updates.email = data.email;
    if (data.phone && !this.state.phone) updates.phone = data.phone;

    if (Object.keys(updates).length) {
      this.setState({ ...updates, showSuccess: true });
      setTimeout(() => this.setState({ showSuccess: false }), 2500);
    }
  };

  handleSubmit = () => {
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
      isParsingResume,
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
              <div className="card shadow-sm">
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
                        Resume <small className="text-muted">(PDF, DOCX, DOC, TXT, RTF)</small>
                      </label>
                      <div className="custom-file">
                        <InputField
                          type="file"
                          id="resume"
                          name="resume"
                          onChange={this.handleFileChange}
                          accept=".pdf,.docx,.doc,.txt,.rtf"
                          disabled={isSubmitting || isParsingResume}
                        />
                        <label className="custom-file-label" htmlFor="resume">
                          {resume ? resume.name : 'Choose file...'}
                        </label>
                        {errors.resume && <div className="invalid-feedback d-block">{errors.resume}</div>}
                        {isParsingResume && (
                          <div className="text-muted small mt-1">
                            <i className="fa fa-spinner fa-spin mr-1"></i>
                            Parsing resume...
                          </div>
                        )}
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
                      type="button"
                      disabled={isSubmitting}
                      className="btn-primary px-4"
                      iconStyle={{ marginRight: '8px' }}
                      loading={isSubmitting}
                      onClick={this.handleSubmit}
                    />
                  </div>
                </div>
              </div>
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