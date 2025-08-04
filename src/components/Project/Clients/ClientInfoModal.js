import React from "react";
import { Link } from "react-router-dom";
import styles from './client.module.css';
import Avatar from "../../common/Avatar";

const ClientInfoModal = ({ client, onClose }) => {
  if (!client) return null;
  //const isActive = client.client_status === "1";

  return (
    <div
      className={`modal fade show d-block ${styles['custom-modal']}`}
      tabIndex="-1"
      role="dialog"
    >
      <div className={'modal-dialog modal-dialog-centered" role="document'}>
        <div className={`modal-content border-0 shadow d-flex flex-column ${styles['custom-modal-content']}`}>
          {/* Header */}
          <div
            className={styles['content-for-modals']}>
            {/* Profile Image with Status Badge */}
            <div
              className={styles['modal-profile-image']}>
              <>
                    {client.client_profile ? (
                      <img
                        className={`rounded-circle img-thumbnail ${styles['client-profile']}`}
                        src={`${process.env.REACT_APP_API_URL}/${client.client_profile}`}
                        alt="Client Profile"/>
                    ) : (
                      <img
                        className={`rounded-circle img-thumbnail client-profile ${styles['client-profile']}`}
                        src="../../../assets/images/sm/avatar2.jpg" 
                        alt="Default Avatar"
                      />
                    )}
              </>
            </div>
          </div>

          {/* Body (scrollable) */}
          <div className={`text-center flex-grow-1 ${styles['client-info-fixed']}`}
          >
            <h3 style={{ fontWeight: 700,}}>{client.client_name}</h3>
            <div className={`${styles['client-email']}`}>
              {client.client_email}
            </div>

            {/* About */}
            <div className={`flex-grow-1 ${styles['scrollable-projects']}`}>
            <div 
              className={`${styles['about']}`}>
              <span style={{ marginLeft: 24 }}>
                {client.client_about || " "}
              </span>
              </div>
              
            {/* Project Cards */}
            <div
              className={`container mt-4 mb-3 ${styles['project-card']}`}>
              {client.projects && client.projects.length > 0 ? (
                <div className="row">
                  {client.projects.map((project) => (
                    <div className="col-md-6 mb-4" key={project.project_name}>
                      <div className={`card h-100 ${styles['project-content']}`}>
                        {/* Project Name */}
                        <div className={`${styles['project-name']}`}>
                          <Link to={`/project-list`}>
                            {project.project_name}
                          </Link>
                        </div>
                        {/* Divider for spacing and separation */}
                        <div style={{ height: 5 }} />
                        <div style={{  margin: '0 0 10px 0' }} />
                        {/* Technology */}
                        <div className={`${styles['technology']}`}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {project.technology
                              ? project.technology.split(',').map((tech, i) => (
                                  <span key={i} className={`${styles['tech-trim']}`} >
                                    {tech.trim()}
                                  </span>
                                ))
                              : 'N/A'}
                          </div>
                        </div>
                        {/* Team member profiles */}
                        <div className={`${styles['Team-member']}`}>
                            <div className={`${styles['Team-member-profile']}`}>
                              {project.team_member_details && project.team_member_details.length > 0 ? (
                                project.team_member_details.map((member, idx) => (
                                  <Avatar
                                    key={idx}
                                    profile={member.profile}
                                    first_name={member.full_name ? member.full_name.split(' ')[0] : ''}
                                    last_name={member.full_name ? member.full_name.split(' ')[1] : ''}
                                    size={35}
                                    className={styles['avatar-img']}
                                    style={{
                                      marginLeft: idx === 0 ? 0 : -14,
                                    }}
                                    title={member.full_name}
                                    onError={(e) => {
                                      e.target.src = '/assets/images/sm/avatar2.jpg';
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
                                  />
                                ))
                              ) : (
                                <span className="text-muted" style={{ marginLeft: 8 }}>No team members</span>
                              )}

                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card p-3 text-center">
                  {/* <div>
                    <b>No. of Projects:</b> {client.project_count || 0}
                  </div>
                  <div>
                    <b>No. of Team Members:</b> {client.employee_count || 0}
                  </div> */}
                </div>
              )}
            </div>
            </div>
          </div>

          {/* Close Button (sticky at bottom) */}
          <div className={`${styles['sticky-footer']}`} >
            <button
              className={`btn btn-primary ${styles['gradient-button']}`}
              onClick={onClose}
              onMouseOver={e => e.currentTarget.style.filter = "brightness(1.1)"}
              onMouseOut={e => e.currentTarget.style.filter = "none"}
              aria-label="Close Modal"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientInfoModal;
