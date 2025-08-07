import React, { Component } from 'react';

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
                        <label className="font-weight-bold text-muted small">Applied On:</label>
                        <p className="form-control-plaintext  pb-2 mb-0">
                          {applicant.created_at ? new Date(applicant.created_at).toLocaleDateString() : ''}
                        </p>
                      </div>
                    </div>
                  </div>

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
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ApplicantViewModal; 