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

    const getAvatarColor = (name) => {
      if (!name) return 'bg-secondary';
      const colors = [
        'bg-pink'
      ];
      const hash = name.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
      return colors[hash % colors.length];
    };

    // Parse skills for sidebar
    const getSkills = () => {
      if (!applicant.skills) return [];
      try {
        const skills = JSON.parse(applicant.skills);
        return Array.isArray(skills) ? skills : [];
      } catch (e) {
        return [];
      }
    };

    const skills = getSkills();

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
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-xl" role="document">
          <div className="modal-content border-0 shadow-lg" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                        <div className="modal-header bg-transparent border-0 p-0 position-relative">
              <Button
                label="x"
                onClick={onClose}
                className="position-absolute"
                style={{ 
                  top: '15px', 
                  right: '15px', 
                  zIndex: 1000,
                  border: 'none',
                  borderRadius: '50%',
                  width: '35px',
                  height: '35px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}
              />
            </div>
            <div className="modal-body p-0">
                            <div className="row no-gutters" style={{ minHeight: '600px' }}>
                {/* Left Main Content - Light Background */}
                <div className="col-md-8" style={{ 
                  backgroundColor: 'white', 
                  color: '#2C3E50',
                  padding: '30px 35px'
                }}>
                  {/* Name*/}
                  <h1 style={{ 
                      fontSize: '2.5rem', 
                      fontWeight: 'bold', 
                      color: '#7B7493',
                      marginBottom: '5px',
                      textTransform: 'uppercase',
                      marginBottom: '15px',
                    }}>
                      {applicant.fullname || 'Applicant'}
                    </h1>

                  {/* Contact Section */}
                  <div className="mb-4">
                    <h6 style={{ 
                      fontWeight: 'bold', 
                      borderBottom: '2px solid #2C3E50', 
                      paddingBottom: '5px',
                      marginBottom: '15px',
                      fontSize: '14px',
                      textTransform: 'uppercase',
                      color: '#2C3E50'
                    }}>
                      Contact
                    </h6>
                    <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                      {applicant.email && (
                        <div className="mb-2">
                          <i className="fa fa-envelope mr-2"></i>
                          {applicant.email}
                        </div>
                      )}
                      {applicant.address && (
                        <div className="mb-2">
                          <i className="fa fa-map-marker mr-2"></i>
                          {applicant.address}
                        </div>
                      )}
                      <div className='d-flex gap-4'>
                        {applicant.phone && (
                          <div className="mb-2">
                            <i className="fa fa-phone mr-2"></i>
                            {applicant.phone}
                          </div>
                        )} &nbsp;&nbsp;
                        {applicant.alternate_phone && (
                          <div className="mb-2">
                            <i className="fa fa-phone mr-2"></i>
                            {applicant.alternate_phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Skills Section */}
                  {skills.length > 0 && (
                    <div className="mb-4">
                      <h6 style={{ 
                        fontWeight: 'bold', 
                        borderBottom: '2px solid #2C3E50', 
                        paddingBottom: '5px',
                        marginBottom: '15px',
                        fontSize: '14px',
                        textTransform: 'uppercase',
                        color: '#2C3E50'
                      }}>
                        Skills
                      </h6>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {skills.map((skill, index) => (
                          <div key={index} style={{
                            backgroundColor: '#f0f0f0',
                            padding: '5px 12px',
                            borderRadius: '20px',
                            fontSize: '13px',
                            fontWeight: '500',
                            color: '#2C3E50',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                          
                            {skill}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Additional Info Section */}
                  <div className="mb-4">
                    <h6 style={{ 
                      fontWeight: 'bold', 
                      borderBottom: '2px solid #2C3E50', 
                      paddingBottom: '5px',
                      marginBottom: '15px',
                      fontSize: '14px',
                      textTransform: 'uppercase',
                      color: '#2C3E50'
                    }}>
                      Additional Info
                    </h6>
                    <div style={{ display: 'flex', flexWrap: 'wrap', fontSize: '14px', lineHeight: '1.6' }}>
                      <div style={{ width: '50%', marginBottom: '8px' }}>
                        {applicant.dob && (
                          <div className="mb-2">
                            <i className="fas fa-birthday-cake mr-2"></i>
                            <strong>DOB:</strong> {new Date(applicant.dob).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <div style={{ width: '50%', marginBottom: '8px' }}>
                        {applicant.merital_status && (
                          <div className="mb-2">
                            <i className="fas fa-heart mr-2"></i>
                            <strong>Status:</strong> {applicant.merital_status}
                          </div>
                        )}
                      </div>
                      <div style={{ width: '50%', marginBottom: '8px' }}>
                        {applicant.graduate_year && (
                          <div className="mb-2">
                            <i className="fas fa-graduation-cap mr-2"></i>
                            <strong>Graduated:</strong> {applicant.graduate_year}
                          </div>
                        )}
                      </div>
                      <div style={{ width: '50%', marginBottom: '8px' }}>
                        {applicant.bond_agreement && (
                          <div className="mb-2">
                            <i className="fas fa-file-contract mr-2"></i>
                            <strong>Bond:</strong> {applicant.bond_agreement.charAt(0).toUpperCase() + applicant.bond_agreement.slice(1)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Sidebar - Dark Background */}
                <div className="col-md-4" style={{ 
                  backgroundColor: '#5A5278', 
                  color: 'white',
                  padding: '30px 25px'
                }}>
                  {/* Name and Title */}
                  <div className="mb-4">
                    <div className="text-center mb-4">
                      <div className={`avatar avatar-xxl rounded-circle ${getAvatarColor(applicant.fullname)} d-inline-flex align-items-center justify-content-center text-white`}
                        style={{ width: '120px', height: '120px', fontSize: '2.5rem' }}>
                        {applicant.fullname ? applicant.fullname .split(' ').filter(Boolean).slice(0, 2).map(word => word[0]).join('').toUpperCase(): '?'}
                      </div>
                    </div>
                      <span
                      className="badge badge-pill"
                      style={{
                        ...getStatusColor(applicant.status),
                        padding: '8px 16px',
                        fontSize: '12px',
                        textTransform: 'capitalize',
                        fontWeight: 500
                      }}
                    >
                      {applicant.status || 'No Status'}
                    </span>
                  </div>

                  {/* Professional Details Section */}
                  <div className="mb-4">
                    <h6 style={{ 
                      fontWeight: 'bold', 
                      borderBottom: '2px solid white', 
                      paddingBottom: '5px',
                      marginBottom: '15px',
                      fontSize: '14px',
                      textTransform: 'uppercase'
                    }}>
                      Professional Details
                    </h6>
                    <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
                      {(applicant.experience_display || applicant.experience) && (
                        <div className="mb-2">
                          <strong>Experience:</strong> {applicant.experience_display || `${applicant.experience} years`}
                        </div>
                      )}
                      {applicant.branch && (
                        <div className="mb-2">
                          <strong>Branch:</strong> {applicant.branch}
                        </div>
                      )}
                      {applicant.graduate_year && (
                        <div className="mb-2">
                          <strong>Graduate Year:</strong> {applicant.graduate_year}
                        </div>
                      )}
                      {applicant.joining_timeframe && (
                        <div className="mb-2">
                          <strong>Joining Timeframe:</strong> {applicant.joining_timeframe}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Application Details Section */}
                  <div className="mb-4">
                    <h6 style={{ 
                      fontWeight: 'bold', 
                      borderBottom: '2px solid white', 
                      paddingBottom: '5px',
                      marginBottom: '15px',
                      fontSize: '14px',
                      textTransform: 'uppercase'
                    }}>
                      Application Details
                    </h6>
                    <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
                      <div className="mb-2">
                        <strong>Applied on:</strong> {applicant.created_at ? new Date(applicant.created_at).toLocaleDateString() : 'N/A'}
                      </div>
                      <div className="mb-2">
                        <strong>Source:</strong> {applicant.source ? 
                          (applicant.source === 'sync' ? 'Synced from External Source' : 
                           applicant.source === 'admin' ? 'Added by Admin' : 
                           applicant.source === 'referral' ? 'referral Application Form' : 'Unknown') : 
                          'N/A'
                        }
                      </div>
                      {applicant.reject_reason && (
                        <div className="mb-2">
                          <strong>Rejection Reason:</strong> {applicant.reject_reason}
                        </div>
                      )}
                    </div>
                  </div>

                  {applicant.resume_path && (
                    <div className="text-center">
                      <a
                        href={`${process.env.REACT_APP_API_URL}/${applicant.resume_path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                        style={{ 
                          backgroundColor: 'white', 
                          borderColor: 'white',
                          color: '#2C3E50',
                          padding: '10px 25px',
                          fontWeight: '500'
                        }}
                      >
                        <i className="fas fa-download mr-2"></i>
                        Download Original Resume
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer bg-light">
              <Button
                label="Close"
                onClick={onClose}
                className="btn btn-primary"
                icon="times"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ApplicantViewModal;