import React from "react";

const ClientInfoModal = ({ client, onClose }) => {
  if (!client) return null;
  const isActive = client.client_status === "1";

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      role="dialog"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div
          className="modal-content border-0 shadow d-flex flex-column"
          style={{
            borderRadius: 24,
            overflow: "hidden",
            fontFamily: "Inter, sans-serif",
            boxShadow: "0 8px 32px rgba(60,60,120,0.18)",
            maxHeight: '90vh',
            minHeight: 400,
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #6a82fb 0%, #fc5c7d 100%)",
              height: 100,
              position: "relative",
              flexShrink: 0,
            }}
          >
            {/* Profile Image with Status Badge */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                bottom: -50,
                transform: "translateX(-50%)",
                width: 110,
                height: 110,
                borderRadius: "50%",
                border: "6px solid #fff",
                boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                background: "#fff",
                zIndex: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <>
                    {client.client_profile ? (
                      <img
                        className="rounded-circle img-thumbnail"
                        src={`${process.env.REACT_APP_API_URL}/${client.client_profile}`}
                        alt="Client Profile"
                    style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                      />
                    ) : (
                      <img
                        className="rounded-circle img-thumbnail"
                        src="../../../assets/images/sm/avatar2.jpg" 
                        alt="Default Avatar"
                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                      />
                    )}
              </>
              
            </div>
          </div>

          {/* Body (scrollable) */}
          <div className="text-center flex-grow-1" style={{ marginTop: 70, overflowY: 'auto', paddingBottom: 24 }}>
            <h3 style={{ fontWeight: 700,}}>{client.client_name}</h3>
            <div style={{ color: "#888", fontSize: 15, marginTop: -10 }}>
              {client.client_email}
            </div>

            {/* About */}
            <div
              style={{
                margin: "18px auto 18px auto",
                maxWidth: 420,
                position: "relative",
                fontStyle: "italic",
                color: "#555",
              }}
            >
              <span style={{ marginLeft: 24 }}>
                {client.client_about || " "}
              </span>
            </div>

            {/* Stats */}
            {/* <div className="d-flex justify-content-center gap-3 flex-wrap mb-4">
              <div
                className="shadow-sm p-3 rounded text-center d-flex flex-column align-items-center"
                style={{
                  background: "linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)",
                  minWidth: 100,
                  margin: "0 8px",
                  transition: "box-shadow 0.2s",
                }}
              >
                <li className="fa fa-folder-open" style={{ color: "#6a82fb", fontSize: 22, marginBottom: 2 }}></li>
                <div style={{ fontWeight: 600, fontSize: 18 }}>{client.project_count}</div>
                <small className="text-muted">Projects</small>
              </div>
              <div
                className="shadow-sm p-3 rounded text-center d-flex flex-column align-items-center"
                style={{
                  background: "linear-gradient(135deg, #e0f9e0 0%, #d4fc79 100%)",
                  minWidth: 100,
                  margin: "0 8px",
                  transition: "box-shadow 0.2s",
                }}
              >
                <li className="fa fa-user" style={{ color: "#28a745", fontSize: 22, marginBottom: 2 }}></li>
                <div style={{ fontWeight: 600, fontSize: 18 }}>{client.employee_count}</div>
                <small className="text-muted">Employees</small>
              </div>
              <div
                className="shadow-sm p-3 rounded text-center d-flex flex-column align-items-center"
                style={{
                  background: isActive
                    ? "linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)"
                    : "linear-gradient(135deg, #f9d6d5 0%, #fbc2eb 100%)",
                  minWidth: 100,
                  margin: "0 8px",
                  transition: "box-shadow 0.2s",
                }}
              >
                {isActive ? (
                  <li className="fa fa-check-circle " style={{ color: "#28a745", fontSize: 22, marginBottom: 2 }} />
                ) : (
                  <li className="fa fa-times-circle" style={{ color: "#dc3545", fontSize: 22, marginBottom: 2 }}></li>
                )}
                <div style={{ fontWeight: 600, fontSize: 18 }}>
                  {isActive ? "Active" : "Inactive"}
                </div>
                <small className="text-muted">Status</small>
              </div>
            </div> */}

            {/* Project Cards */}
            <div
              className="container mt-4 mb-3"
              style={{
                maxHeight: "350px",
                overflowY: "auto",
                paddingRight: 10,
              }}
            >
              {client.projects && client.projects.length > 0 ? (
                client.projects.map((project) => (
                  <div
                    key={ project.project_name }
                    className="card mb-3"
                    style={{
                      borderRadius: 16,
                      border: "1px solid #e0eafc",
                      boxShadow: "0 5px 12px rgba(60,60,120,0.08)",
                      padding: 16,
                      textAlign: "left",
                    }}
                  >
                    {/* Project Name */}
                    <div style={{ fontWeight: 700, fontSize: 18 }}>{project.project_name}</div>
                    {/* Divider for spacing and separation */}
                    <div style={{ height: 5 }} />
                    <div style={{  margin: '0 0 10px 0' }} />
                    {/* Technology */}
                    <div style={{ color: "#888", fontSize: 15, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} >
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {project.technology
                          ? project.technology.split(',').map((tech, i) => (
                              <span
                                key={i}
                                style={{
                                  display: 'inline-block',
                                  background: '#e0eafc',
                                  color: '#3a3a6a',
                                  borderRadius: 12,
                                  padding: '2px 12px',
                                  fontSize: 13,
                                  fontWeight: 500,
                                  marginRight: 6,
                                  marginBottom: 2,
                                  border: '1px solid #b3c6e0',
                                }}
                              >
                                {tech.trim()}
                              </span>
                            ))
                          : 'N/A'}
                      </div>
                    </div>
                    {/* Team member profiles */}
                    <div style={{ color: '#555', fontSize: 15, marginTop: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontWeight: 600, minWidth: 48 }}>Team:</span>
                        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                        {project.team_member_details && project.team_member_details.length > 0 ? (
                          project.team_member_details.map((member, idx) => (
                            <img
                              key={idx}
                              src={member.profile ? `${process.env.REACT_APP_API_URL}/${member.profile}` : "/assets/images/sm/avatar2.jpg"}
                              alt={member.full_name}
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                border: '2px solid #fff',
                                objectFit: 'cover',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
                                marginLeft: idx === 0 ? 0 : -14,
                                background: '#fff',
                                zIndex: 10 + idx,
                                transition: 'z-index 0.2s',
                                cursor: 'pointer',
                              }}
                              title={member.full_name}
                              onError={e => {
                                if (!e.target.src.includes('/assets/images/sm/avatar2.jpg')) {
                                  e.target.src = '/assets/images/sm/avatar2.jpg';
                                }
                              }}
                            />
                          ))
                        ) : (
                          <span className="text-muted" style={{ marginLeft: 8 }}>No team members</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
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

          {/* Close Button (sticky at bottom) */}
          <div style={{
            width: '100%',
            background: '#fff',
            boxShadow: '0 -2px 8px rgba(0,0,0,0.04)',
            padding: '12px 0 10px 0',
            position: 'sticky',
            bottom: 0,
            zIndex: 10,
            display: 'flex',
            justifyContent: 'center',
          }}>
            <button
              className="btn"
              style={{
                background: "linear-gradient(135deg, #fc5c7d 0%, #6a82fb 100%)",
                color: "#fff",
                borderRadius: 24,
                padding: "8px 20px",
                fontWeight: 500,
                fontSize: 18,
                letterSpacing: 1,
                boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
                transition: "filter 0.2s, box-shadow 0.2s",
              }}
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
