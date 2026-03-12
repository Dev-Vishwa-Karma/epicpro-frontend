import React, { Component } from 'react';
import Button from '../../../common/formInputs/Button';
import styles from './applicant.module.css';
import {getService} from '../../../../services/getService';
import Avatar from '../../../common/Avatar';
import { shortformatDate } from '../../../../utils';

class ApplicantViewModal extends Component {
  state = {
    employeeDetails: null,
    loadingEmployee: false,
    attempts: [],
    loadingAttempts: false,
    showAttempts: true,
    openAttemptIndex: 0,
    activeActionMenu: null, // Tracks which attempt's action menu is open
  };

  componentDidMount() {
    this.fetchEmployeeDetails();
    this.fetchAttempts();
    window.addEventListener('click', this.closeAllMenus);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.closeAllMenus);
  }

  componentDidUpdate(prevProps) {
    if (this.props.applicant?.id !== prevProps.applicant?.id) {
      this.fetchEmployeeDetails();
      this.fetchAttempts();
    }
  }

  fetchEmployeeDetails = () => {
    const { applicant } = this.props;
    if (applicant?.employee_id && !applicant.employee_name) {
      this.setState({ loadingEmployee: true });
      getService.getCall('get_employees.php', { action: 'view', user_id: applicant.employee_id })
        .then(response => {
          if (response.status === 'success' && response.data) {
            this.setState({
              employeeDetails: response.data,
              loadingEmployee: false
            });
          }
        })
        .catch(() => this.setState({ loadingEmployee: false }));
    }
  };

  fetchAttempts = () => {
    const { applicant } = this.props;
    if (applicant?.id) {
      this.setState({ loadingAttempts: true });
      getService.getCall('applicants.php', { action: 'get_attempts', applicant_id: applicant.id })
        .then(response => {
          if (response.status === 'success') {
            this.setState({
              attempts: response.data || [],
              loadingAttempts: false
            });
          }
        })
        .catch(() => this.setState({ loadingAttempts: false }));
    }
  };

  toggleAttempts = () => {
    this.setState(prevState => ({ showAttempts: !prevState.showAttempts }));
  };

  handleToggleAttemptDetail = (index) => {
    this.setState(prevState => ({
      openAttemptIndex: prevState.openAttemptIndex === index ? null : index
    }));
  };

  closeAllMenus = () => {
    this.setState({ activeActionMenu: null });
  };

  toggleActionMenu = (e, index) => {
    e.stopPropagation();
    this.setState(prevState => ({
      activeActionMenu: prevState.activeActionMenu === index ? null : index
    }));
  };

  handleDeleteClick = (e, attempt) => {
    e.stopPropagation();
    this.setState({ activeActionMenu: null });
    if (window.confirm('Are you sure you want to delete this attempt?')) {
      this.props.onDeleteAttempt(attempt.id)
        .then(() => {
          this.fetchAttempts();
        });
    }
  };

  handleEditClick = (e, attempt) => {
    e.stopPropagation();
    this.setState({ activeActionMenu: null });
    this.props.onEditAttempt(this.props.applicant, attempt);
  };

  render() {
    const { 
      show, 
      onClose, 
      applicant, 
      getStatusColor 
    } = this.props;
    
    if (!show || !applicant) return null;


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

    // Check if section has data
    const hasContactInfo = applicant.email || applicant.address || applicant.phone || applicant.alternate_phone;
    

    const hasAdditionalInfo = applicant.dob || applicant.marital_status || 
                             applicant.graduate_year || applicant.bond_agreement;
    
    const hasProfessionalDetails = applicant.experience_display || applicant.experience || 
                                  applicant.branch || applicant.graduate_year || 
                                  applicant.joining_timeframe;

    return (
      <div
        className="modal fade show"
        style={{
          display: "block",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(3px)",
        }}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
      >
        <div
          className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-xl"
          role="document"
        >
          <div
            className="modal-content border-0 shadow-lg"
            style={{ maxWidth: "1000px", margin: "0 auto" }}
          >
            <div className="modal-header bg-transparent border-0 p-0 position-relative">
              <Button
                label="x"
                onClick={onClose}
                className={`position-absolute text-primary ${styles.topdata}`}
              />
            </div>
            <div className="modal-body p-0">
              <div className={`row no-gutters ${styles.guttopdata}`}>
                {/* Left Main Content - Light Background */}
                <div
                  className="col-md-8"
                  style={{
                    backgroundColor: "white",
                    color: "#2C3E50",
                    padding: "30px 35px",
                  }}
                >
                  {/* Name*/}
                  <h1
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: "bold",
                      color: "#7B7493",
                      textTransform: "uppercase",
                      marginBottom: "15px",
                    }}
                  >
                    {applicant.fullname || "Applicant"}
                  </h1>

                  {/* Contact Section - only show if has data */}
                  {hasContactInfo && (
                    <div className="mb-4">
                      <h6
                        style={{
                          fontWeight: "bold",
                          borderBottom: "1px solid rgb(171, 172, 173)",
                          paddingBottom: "5px",
                          marginBottom: "15px",
                          fontSize: "14px",
                          textTransform: "uppercase",
                          color: "#2C3E50",
                        }}
                      >
                        Contact Details
                      </h6>
                      <div style={{ fontSize: "14px", lineHeight: "1.6" }}>
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
                        <div className="d-flex gap-4">
                          {applicant.phone && (
                            <div className="mb-2">
                              <i className="fa fa-phone mr-2"></i>
                              {applicant.phone}
                            </div>
                          )}{" "}
                          &nbsp;&nbsp;
                          {applicant.alternate_phone && (
                            <div className="mb-2">
                              <span className="mr-2">|</span>
                              {applicant.alternate_phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Skills Section - only show if has skills */}
                  {skills.length > 0 && (
                    <div className="mb-4">
                      <h6
                        style={{
                          fontWeight: "bold",
                          borderBottom: "1px solid rgb(171, 172, 173)",
                          paddingBottom: "5px",
                          marginBottom: "15px",
                          fontSize: "14px",
                          textTransform: "uppercase",
                          color: "#2C3E50",
                        }}
                      >
                        Skills
                      </h6>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "10px",
                        }}
                      >
                        {skills.map((skill, index) => (
                          <div
                            key={index}
                            style={{
                              backgroundColor: "#f0f0f0",
                              padding: "5px 12px",
                              borderRadius: "20px",
                              fontSize: "13px",
                              fontWeight: "500",
                              color: "#2C3E50",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            {skill}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Additional Info Section - only show if has data */}
                  {hasAdditionalInfo && (
                    <div className="mb-4">
                      <h6
                        style={{
                          fontWeight: "bold",
                          borderBottom: "1px solid rgb(171, 172, 173)",
                          paddingBottom: "5px",
                          marginBottom: "15px",
                          fontSize: "14px",
                          textTransform: "uppercase",
                          color: "#2C3E50",
                        }}
                      >
                        Additional Details
                      </h6>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          fontSize: "14px",
                          lineHeight: "1.6",
                        }}
                      >
                        {applicant.dob && (
                          <div style={{ width: "50%", marginBottom: "8px" }}>
                            <div className="mb-2">
                              <strong>DOB:</strong>{" "}
                              {shortformatDate(applicant.dob)}
                            </div>
                          </div>
                        )}
                        {applicant.marital_status && (
                          <div style={{ width: "50%", marginBottom: "8px" }}>
                            <div className="mb-2">
                              <strong>Marital Status:</strong>{" "}
                              {applicant.marital_status}
                            </div>
                          </div>
                        )}
                        {applicant.graduate_year && (
                          <div style={{ width: "50%", marginBottom: "8px" }}>
                            <div className="mb-2">
                              <strong>Graduated:</strong>{" "}
                              {applicant.graduate_year}
                            </div>
                          </div>
                        )}
                        {applicant.bond_agreement && (
                          <div style={{ width: "50%", marginBottom: "8px" }}>
                            <div className="mb-2">
                              <i className="fas fa-file-contract mr-2"></i>
                              <strong>Bond:</strong>{" "}
                              {applicant.bond_agreement
                                .charAt(0)
                                .toUpperCase() +
                                applicant.bond_agreement.slice(1)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Attempts Section */}
                  <div className="mb-4">
                    <h6
                      onClick={this.toggleAttempts}
                      style={{
                        fontWeight: "bold",
                        borderBottom: "1px solid rgb(171, 172, 173)",
                        paddingBottom: "10px",
                        marginBottom: "15px",
                        fontSize: "14px",
                        textTransform: "uppercase",
                        color: "#2C3E50",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      Attempts {this.state.attempts.length > 0 && `(${this.state.attempts.length})`}
                      <i className={`fa ${this.state.showAttempts ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                    </h6>
                    {this.state.showAttempts && (
                      <div className="attempts-list">
                        {this.state.loadingAttempts ? (
                          <div className="text-center py-3 text-muted">
                            <i className="fa fa-spinner fa-spin mr-2"></i> Loading attempts...
                          </div>
                        ) : this.state.attempts.length === 0 ? (
                          <div className="text-center py-4 text-muted" style={{ fontStyle: 'italic', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                            <i className="fa fa-info-circle mr-2"></i> No attempts found for this applicant.
                          </div>
                        ) : (
                          <div className="accordion-attempts">
                            {this.state.attempts.map((attempt, index) => (
                              <div key={index} className="mb-3" style={{ border: '1px solid #eff0f1', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', position: 'relative' }}>
                                <div
                                  className="d-flex justify-content-between align-items-center p-2"
                                  style={{ backgroundColor: '#fcfcfd', cursor: 'pointer', borderTopLeftRadius: '10px', borderTopRightRadius: '10px', borderBottom: this.state.openAttemptIndex === index ? '1px solid #eff0f1' : 'none', borderBottomLeftRadius: this.state.openAttemptIndex === index ? '0' : '10px', borderBottomRightRadius: this.state.openAttemptIndex === index ? '0' : '10px' }}
                                  onClick={() => this.handleToggleAttemptDetail(index)}
                                >
                                  <div>
                                    {/* <span style={{ fontWeight: '600', color: '#495057', fontSize: '13px' }}>
                                      Attempt #{this.state.attempts.length - index}
                                    </span>
                                    <span className="text-muted mx-2" style={{ fontSize: '12px' }}>•</span> */}
                                    <span style={{ fontSize: '13px', color: '#6c757d' }}>
                                      {shortformatDate(attempt.applied_date || attempt.created_at)}
                                    </span>
                                  </div>
                                  <div className="d-flex align-items-center">
                                    <span
                                      className="badge badge-pill mr-3"
                                      style={{
                                        ...getStatusColor(attempt.result),
                                        padding: '5px 12px',
                                        fontSize: '11px',
                                        textTransform: 'capitalize'
                                      }}
                                    >
                                      {attempt.result}
                                    </span>

                                    {/* Action Menu (Three dots) */}
                                    <div className={styles.attemptActions} onClick={(e) => e.stopPropagation()}>
                                      <div
                                        className={styles.actionToggle}
                                        onClick={(e) => this.toggleActionMenu(e, index)}
                                      >
                                        <i className="fa fa-ellipsis-v"></i>
                                      </div>

                                      {this.state.activeActionMenu === index && (
                                        <div className={styles.actionMenu}>
                                          <div
                                            className={styles.actionItem}
                                            onClick={(e) => this.handleEditClick(e, attempt)}
                                          >
                                            <i className="fa fa-pencil"></i> Edit
                                          </div>
                                          <div
                                            className={`${styles.actionItem} ${styles.deleteItem}`}
                                            onClick={(e) => this.handleDeleteClick(e, attempt)}
                                          >
                                            <i className="fa fa-trash"></i> Delete
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    <i
                                      className={`fa ${this.state.openAttemptIndex === index ? 'fa-chevron-up' : 'fa-chevron-down'} text-muted ml-2`}
                                      style={{ fontSize: '12px', width: '15px', textAlign: 'center' }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        this.handleToggleAttemptDetail(index);
                                      }}
                                    ></i>
                                  </div>
                                </div>
                                {this.state.openAttemptIndex === index && (
                                  <div className="p-3 bg-white" style={{ animation: 'slideDown 0.3s ease-out', borderBottomLeftRadius: '10px', borderBottomRightRadius: '10px' }}>
                                    <div className="row mb-3">
                                      <div className="col-md-4">
                                        <div className="small text-muted mb-1 text-uppercase font-weight-bold" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>Applied On</div>
                                        <div style={{ fontSize: '13px', color: '#2c3e50' }}>{shortformatDate(attempt.applied_date) || "N/A"}</div>
                                      </div>
                                      <div className="col-md-4">
                                        <div className="small text-muted mb-1 text-uppercase font-weight-bold" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>Contacted On</div>
                                        <div style={{ fontSize: '13px', color: '#2c3e50' }}>{shortformatDate(attempt.contacted_date) || "N/A"}</div>
                                      </div>
                                      <div className="col-md-4">
                                        <div className="small text-muted mb-1 text-uppercase font-weight-bold" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>Interview On</div>
                                        <div style={{ fontSize: '13px', color: '#2c3e50' }}>{shortformatDate(attempt.interview_date) || "N/A"}</div>
                                      </div>
                                    </div>
                                    <div>
                                      <div className="small text-muted mb-1 text-uppercase font-weight-bold" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>Interviewer Comments</div>
                                      <div style={{ fontSize: '13px', color: '#2c3e50' }}>
                                        {attempt.comments || "No comments provided for this attempt."}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Sidebar - Dark Background */}
                <div
                  className="col-md-4"
                  style={{
                    backgroundColor: "#5A5278",
                    color: "white",
                    padding: "30px 25px",
                  }}
                >
                  {/* Name and Title */}
                  <div className="mb-4">
                    <div className="text-center mb-4">
                      <Avatar
                          first_name={applicant.fullname ? applicant.fullname.split(" ")[0] : ""}
                          last_name={applicant.fullname ? applicant.fullname.split(" ")[1] : ""}
                          size={120}
                          style={{
                            ...getStatusColor(applicant.status),
                            fontSize: "2.5rem",
                            objectFit: "cover",
                          }}
                          title={`${applicant.fullname || ''}`}
                      />
                    </div>
                  </div>                                                                                  
                  <div className='text-center mb-4                                                                  '>
                     <span
                      className="badge badge-pill"
                      style={{
                        ...getStatusColor(applicant.status),
                        padding: "8px 16px",
                        fontSize: "12px",
                        textTransform: "capitalize",
                        fontWeight: 500,
                      }}
                    >
                      {applicant.status || "No Status"}
                    </span>
                  </div>

                  {/* Professional Details Section - only show if has data */}
                  {hasProfessionalDetails && (
                    <div className="mb-4">
                      <h6
                        style={{
                          fontWeight: "bold",
                          borderBottom: "1px solid white",
                          paddingBottom: "5px",
                          marginBottom: "15px",
                          fontSize: "14px",
                          textTransform: "uppercase",
                        }}
                      >
                        Professional Details
                      </h6>
                      <div style={{ fontSize: "13px", lineHeight: "1.6" }}>
                        {(applicant.experience_display ||
                          applicant.experience) && (
                          <div className="mb-2">
                            <strong>Experience:</strong>{" "}
                            {applicant.experience_display ||
                              `${applicant.experience} years`}
                          </div>
                        )}
                        {applicant.branch && (
                          <div className="mb-2">
                            <strong>Branch:</strong> {applicant.branch}
                          </div>
                        )}
                        {applicant.graduate_year && (
                          <div className="mb-2">
                            <strong>Graduate Year:</strong>{" "}
                            {applicant.graduate_year}
                          </div>
                        )}
                        {applicant.joining_timeframe && (
                          <div className="mb-2">
                            <strong>Joining Timeframe:</strong>{" "}
                            {applicant.joining_timeframe}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Application Details Section */}
                  <div className="mb-4">
                    <h6
                      style={{
                        fontWeight: "bold",
                        borderBottom: "1px solid white",
                        paddingBottom: "5px",
                        marginBottom: "15px",
                        fontSize: "14px",
                        textTransform: "uppercase",
                      }}
                    >
                      Application Details
                    </h6>
                    <div style={{ fontSize: "13px", lineHeight: "1.6" }}>
                      <div className="mb-2">
                        <strong>Applied on:</strong>{" "}
                        {shortformatDate(applicant.created_at|| "")}
                      </div>
                      <div className="mb-2">
                        <strong>Source:</strong>{" "}
                        {applicant.source
                          ? applicant.source === "sync"
                            ? "Synced from External Source"
                            : applicant.source === "admin"
                            ? "Added by Admin"
                            : applicant.source === "referral"
                            ? "referral Application Form"
                            : "Unknown"
                          : "N/A"}
                      </div>
                      {applicant.employee_id && (
                        <div className="mb-2">
                          <strong>Referred By:</strong>
                          {applicant.employee_name ? (
                            <span>
                              {" "}
                              {applicant.employee_name} 
                              {/* (ID:{" "}
                              {applicant.employee_id}) */}
                            </span>
                          ) : this.state.employeeDetails ? (
                            <span>
                              {" "}
                              {this.state.employeeDetails.first_name}{" "}
                              {this.state.employeeDetails.last_name} 
                              {/* (ID:{" "}
                              {applicant.employee_id}) */}
                            </span>
                          ) : this.state.loadingEmployee ? (
                            <span>Loading...</span>
                          ) : (
                            <span> Employee ID:
                               {/* {applicant.employee_id} */}
                            </span>
                          )}
                        </div>
                      )}
                      {applicant.reject_reason &&
                        applicant.status &&
                        applicant.status !== "pending" &&
                        applicant.status !== "reviewed" &&
                        applicant.status !== "interviewed" &&
                        applicant.status !== "hired" && (
                          <div className="mb-2">
                            <strong>Rejection Reason:</strong>{" "}
                            {applicant.reject_reason}
                          </div>
                        )}
                    </div>
                  </div>

                  {applicant.resume_path ? (
                    <a
                      href={`${process.env.REACT_APP_API_URL}/${applicant.resume_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                      style={{
                        backgroundColor: "white",
                        borderColor: "white",
                        color: "#2C3E50",
                        padding: "10px 25px",
                        fontWeight: "500",
                      }}
                    >
                      <i className="fa fa-download mr-2"></i>
                      Download Applicant Resume
                    </a>
                  ) : (
                    <button
                      className="btn btn-secondary"
                      disabled
                      style={{
                        backgroundColor: "#ccc",
                        borderColor: "#ccc",
                        color: "#666",
                        padding: "10px 25px",
                        fontWeight: "500",
                      }}
                    >
                      <i className="fa fa-ban mr-2"></i>
                      Resume Not Available
                    </button>
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