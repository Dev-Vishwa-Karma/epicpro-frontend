import React, { Component } from 'react';
import Button from '../../../common/formInputs/Button';

class ApplicantViewModal extends Component {
  render() {
    const { 
      show, 
      onClose, 
      applicant, 
      getStatusColor 
    } = this.props;
    
    if (!show || !applicant) return null;

    return (
      <div
        className="modal fade show"
        style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Applicant Details</h5>
              <button
                type="button"
                className="close"
                aria-label="Close"
                onClick={onClose}
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col-12">
                  <div className="text-center mb-4">
                    <span className="avatar avatar-pink avatar-lg">
                    {applicant.fullname ? applicant.fullname .split(' ') .map(word => word[0]) .join('') .toUpperCase() : '?'}
                    </span>
                  </div>
                  
                  <div className="row">
                    <div className="col-lg-6 col-md-6 col-sm-12 mb-3">
                      <div className="form-group">
                        <label className="font-weight-bold text-muted small">Full Name:</label>
                        <p className="form-control-plaintext  pb-2 mb-0" style={{ wordBreak: 'break-word' }}>
                          {applicant.fullname || ''}
                        </p>
                      </div>
                    </div>
                    <div className="col-lg-6 col-md-6 col-sm-12 mb-3">
                      <div className="form-group">
                        <label className="font-weight-bold text-muted small">Email:</label>
                        <p className="form-control-plaintext  pb-2 mb-0" style={{ wordBreak: 'break-all', overflowWrap: 'break-word' }}>
                          {applicant.email || ''}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-lg-6 col-md-6 col-sm-12 mb-3">
                      <div className="form-group">
                        <label className="font-weight-bold text-muted small">Mobile:</label>
                        <p className="form-control-plaintext  pb-2 mb-0">
                          {applicant.phone || ''}
                        </p>
                      </div>
                    </div>
                    <div className="col-lg-6 col-md-6 col-sm-12 mb-3">
                      <div className="form-group">
                        <label className="font-weight-bold text-muted small">Alternate Mobile:</label>
                        <p className="form-control-plaintext  pb-2 mb-0">
                          {applicant.alternate_phone || 'Not provided'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-lg-6 col-md-6 col-sm-12 mb-3">
                      <div className="form-group">
                        <label className="font-weight-bold text-muted small">Date of Birth:</label>
                        <p className="form-control-plaintext  pb-2 mb-0">
                          {applicant.dob ? new Date(applicant.dob).toLocaleDateString() : 'Not provided'}
                        </p>
                      </div>
                    </div>
                    <div className="col-lg-6 col-md-6 col-sm-12 mb-3">
                      <div className="form-group">
                        <label className="font-weight-bold text-muted small">Marital Status:</label>
                        <p className="form-control-plaintext  pb-2 mb-0">
                          {applicant.merital_status ? applicant.merital_status.charAt(0).toUpperCase() + applicant.merital_status.slice(1) : 'Not provided'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-lg-6 col-md-6 col-sm-12 mb-3">
                      <div className="form-group">
                        <label className="font-weight-bold text-muted small">Experience:</label>
                        <p className="form-control-plaintext  pb-2 mb-0">
                          {applicant.experience ? `${applicant.experience} years` : 'Not specified'}
                        </p>
                      </div>
                    </div>
                    <div className="col-lg-6 col-md-6 col-sm-12 mb-3">
                      <div className="form-group">
                        <label className="font-weight-bold text-muted small">Applied On:</label>
                        <p className="form-control-plaintext  pb-2 mb-0">
                          {applicant.created_at ? new Date(applicant.created_at).toLocaleDateString() : ''}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12 mb-3">
                      <div className="form-group">
                        <label className="font-weight-bold text-muted small">Address:</label>
                        <p className="form-control-plaintext  pb-2 mb-0">
                          {applicant.address || 'Not provided'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {applicant.skills && (
                    <div className="row">
                      <div className="col-lg-12 col-md-12 col-sm-12 mb-3">
                        <div className="form-group">
                          <label className="font-weight-bold text-muted small">Skills:</label>
                          <div className="mt-2">
                            {(() => {
                              try {
                                const skills = JSON.parse(applicant.skills);
                                return Array.isArray(skills) ? skills.map((skill, index) => (
                                  <span key={index} className="badge badge-primary mr-1 mb-1">
                                    {skill}
                                  </span>
                                )) : 'No skills specified';
                              } catch (e) {
                                return 'No skills specified';
                              }
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="row">
                    <div className="col-lg-6 col-md-6 col-sm-12 mb-3">
                      <div className="form-group">
                        <label className="font-weight-bold text-muted small">Status:</label>
                        <div className="mt-2">
                          <span
                            className="badge"
                            style={{
                              ...getStatusColor(applicant.status),
                              padding: '8px 12px',
                              fontSize: '12px',
                              textTransform: 'capitalize'
                            }}
                          >
                            {applicant.status || ''}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-6 col-md-6 col-sm-12 mb-3">
                      <div className="form-group">
                        <label className="font-weight-bold text-muted small">Resume:</label>
                        <div className="mt-2">
                          {applicant.resume_path ? (
                            <a
                              href={`${process.env.REACT_APP_API_URL}/${applicant.resume_path}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-primary"
                            >
                              <i className="fa fa-download mr-2"></i>
                              View Resume
                            </a>
                          ) : (
                            <span className="text-muted">No resume uploaded</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <Button
                label="Close"
                onClick={onClose}
                className="btn-secondary"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ApplicantViewModal; 