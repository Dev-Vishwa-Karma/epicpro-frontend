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

    // Generate avatar background color based on name
    const getAvatarColor = (name) => {
      if (!name) return 'bg-secondary';
      const colors = [
        'bg-primary', 'bg-success', 'bg-info', 
        'bg-warning', 'bg-danger', 'bg-purple',
        'bg-pink', 'bg-indigo', 'bg-teal'
      ];
      const hash = name.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
      return colors[hash % colors.length];
    };

    return (
      <div
        className="modal fade show"
        style={{ 
          display: 'block', 
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(3px)'
        }}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg" role="document">
          <div className="modal-content border-0 shadow-lg">
            <div className="modal-header bg-gradient-primary text-white">
              <h5 className="modal-title font-weight-bold">Applicant Profile</h5>
              <Button
                label=""
                onClick={onClose}
                className="close text-white"
                icon="fas fa-times"
                iconStyle={{ fontSize: '1.5rem' }}
              />
            </div>
            <div className="modal-body p-4">
              <div className="row">
                <div className="col-12">
                  {/* Profile Header */}
                  <div className="text-center mb-4">
                    <div className={`avatar avatar-xl rounded-circle ${getAvatarColor(applicant.fullname)} d-inline-flex align-items-center justify-content-center text-white`}>
                      {applicant.fullname ? 
                        applicant.fullname.split(' ').map(word => word[0]).join('').toUpperCase() : 
                        '?'
                      }
                    </div>
                    <h4 className="mt-3 mb-1 font-weight-bold">{applicant.fullname || 'Applicant'}</h4>
                    <div className="d-flex justify-content-center align-items-center">
                      <span
                        className="badge badge-pill mr-2"
                        style={{
                          ...getStatusColor(applicant.status),
                          padding: '6px 12px',
                          fontSize: '12px',
                          textTransform: 'capitalize',
                          fontWeight: 500
                        }}
                      >
                        {applicant.status || 'No Status'}
                      </span>
                      <span className="text-muted small">
                        Applied on: {applicant.created_at ? new Date(applicant.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Main Content */}
                  <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body">
                      <h6 className="card-title text-uppercase text-muted mb-3 font-weight-bold">Personal Information</h6>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <div className="form-group mb-0">
                            <label className="font-weight-bold text-muted small">Email Address</label>
                            <p className="form-control-plaintext text-dark pb-2 mb-0" style={{ wordBreak: 'break-all' }}>
                              {applicant.email || 'N/A'}
                              {applicant.email && (
                                <a href={`mailto:${applicant.email}`} className="ml-2 text-primary">
                                  <i className="fas fa-envelope"></i>
                                </a>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <div className="form-group mb-0">
                            <label className="font-weight-bold text-muted small">Phone Number</label>
                            <p className="form-control-plaintext text-dark pb-2 mb-0">
                              {applicant.phone || 'N/A'}
                              {applicant.phone && (
                                <a href={`tel:${applicant.phone}`} className="ml-2 text-primary">
                                  <i className="fas fa-phone"></i>
                                </a>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <div className="form-group mb-0">
                            <label className="font-weight-bold text-muted small">Alternate Phone</label>
                            <p className="form-control-plaintext text-dark pb-2 mb-0">
                              {applicant.alternate_phone || 'N/A'}
                              {applicant.alternate_phone && (
                                <a href={`tel:${applicant.alternate_phone}`} className="ml-2 text-primary">
                                  <i className="fas fa-phone"></i>
                                </a>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <div className="form-group mb-0">
                            <label className="font-weight-bold text-muted small">Date of Birth</label>
                            <p className="form-control-plaintext text-dark pb-2 mb-0">
                              {applicant.dob ? new Date(applicant.dob).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <div className="form-group mb-0">
                            <label className="font-weight-bold text-muted small">Marital Status</label>
                            <p className="form-control-plaintext text-dark pb-2 mb-0">
                              {applicant.marital_status ? 
                                applicant.marital_status.charAt(0).toUpperCase() + applicant.marital_status.slice(1) : 
                                'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <div className="form-group mb-0">
                            <label className="font-weight-bold text-muted small">Address</label>
                            <p className="form-control-plaintext text-dark pb-2 mb-0">
                              {applicant.address || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Professional Information */}
                  <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body">
                      <h6 className="card-title text-uppercase text-muted mb-3 font-weight-bold">Professional Details</h6>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <div className="form-group mb-0">
                            <label className="font-weight-bold text-muted small">Experience</label>
                            <p className="form-control-plaintext text-dark pb-2 mb-0">
                              {applicant.experience_display || 
                                (applicant.experience ? `${applicant.experience} years` : 'N/A')}
                            </p>
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <div className="form-group mb-0">
                            <label className="font-weight-bold text-muted small">Branch</label>
                            <p className="form-control-plaintext text-dark pb-2 mb-0">
                              {applicant.branch || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <div className="form-group mb-0">
                            <label className="font-weight-bold text-muted small">Graduate Year</label>
                            <p className="form-control-plaintext text-dark pb-2 mb-0">
                              {applicant.graduate_year || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <div className="form-group mb-0">
                            <label className="font-weight-bold text-muted small">Joining Timeframe</label>
                            <p className="form-control-plaintext text-dark pb-2 mb-0">
                              {applicant.joining_timeframe || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <div className="form-group mb-0">
                            <label className="font-weight-bold text-muted small">Bond Agreement</label>
                            <p className="form-control-plaintext text-dark pb-2 mb-0">
                              {applicant.bond_agreement ? 
                                applicant.bond_agreement.charAt(0).toUpperCase() + applicant.bond_agreement.slice(1) : 
                                'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <div className="form-group mb-0">
                            <label className="font-weight-bold text-muted small">Resume</label>
                            <div className="mt-2">
                              {applicant.resume_path ? (
                                <a
                                  href={`${process.env.REACT_APP_API_URL}/${applicant.resume_path}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-sm btn-outline-primary"
                                >
                                  <i className="fas fa-download mr-2"></i>
                                  Download Resume
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
                  
                  {/* Skills Section */}
                  <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body">
                      <h6 className="card-title text-uppercase text-muted mb-3 font-weight-bold">Skills</h6>
                      <div className="mt-2">
                        {(() => {
                          if (!applicant.skills) {
                            return <p className="text-muted mb-0">N/A</p>;
                          }
                          
                          try {
                            const skills = JSON.parse(applicant.skills);
                            if (Array.isArray(skills) && skills.length > 0) {
                              return (
                                <div className="d-flex flex-wrap">
                                  {skills.map((skill, index) => (
                                    <span 
                                      key={index} 
                                      className="badge badge-primary mr-2 mb-2 px-3 py-2"
                                      style={{
                                        backgroundColor: '#e3f2fd',
                                        color: '#1976d2',
                                        borderRadius: '12px',
                                        fontWeight: 500
                                      }}
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              );
                            } else {
                              return <p className="text-muted mb-0">N/A</p>;
                            }
                          } catch (e) {
                            return <p className="text-muted mb-0">N/A</p>;
                          }
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer bg-light">
              <Button
                label="Close"
                onClick={onClose}
                className="btn-light border"
                icon="times"
              />
              {applicant.email && (
                <a 
                  href={`tel:${applicant.phone}`}
                  className="btn btn-primary ml-2"
                >
                  <i className="fas fa-envelope mr-2"></i>
                  Contact
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ApplicantViewModal;