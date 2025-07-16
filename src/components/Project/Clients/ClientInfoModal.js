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
          className="modal-content border-0 shadow"
          style={{
            borderRadius: 24,
            overflow: "hidden",
            fontFamily: "Inter, sans-serif",
            boxShadow: "0 8px 32px rgba(60,60,120,0.18)",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #6a82fb 0%, #fc5c7d 100%)",
              height: 100,
              position: "relative",
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
              <img
                src={`${process.env.REACT_APP_API_URL}/${client.client_profile}`}
                alt="Profile"
                style={{
                  width: 98,
                  height: 98,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: `3px solid ${isActive ? "#28a745" : "#dc3545"}`,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
                }}
              />
              
            </div>
          </div>

          {/* Body */}
          <div className="text-center" style={{ marginTop: 70 }}>
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
                {client.client_about || "No description available."}
              </span>
            </div>

            {/* Stats */}
            <div className="d-flex justify-content-center gap-3 flex-wrap mb-4">
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
            </div>

            {/* Close Button */}
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
                marginTop: 8,
                marginBottom:10,
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
