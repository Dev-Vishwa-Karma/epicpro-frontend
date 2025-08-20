import React, { Component } from 'react';
import Button from '../../../common/formInputs/Button';
import styles from './applicant.module.css';
import {getService} from '../../../../services/getService';
import Avatar from '../../../common/Avatar';
import { shortformatDate } from '../../../../utils';

class ApplicantViewModal extends Component {
  state = {
    employeeDetails: null,
    loadingEmployee: false
  };

  componentDidMount() {
    this.fetchEmployeeDetails();
  }

  componentDidUpdate(prevProps) {
    if (this.props.applicant?.employee_id !== prevProps.applicant?.employee_id) {
      this.fetchEmployeeDetails();
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
                      marginBottom: "5px",
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
                        Contact
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
                        Additional Info
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
                              <strong>MaritalS Status:</strong>{" "}
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