import React from "react";
import { FaCheckCircle, FaTimesCircle, FaFolderOpen, FaUsers, FaEnvelope, FaMapMarkerAlt, FaQuoteLeft } from "react-icons/fa";

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
              background: "rgb(240,240,240)",
              height: 120,
              position: "relative",
            }}
          >
            {/* Profile Image with right and x sign */}
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
              {/* Status Badge */}
              <span
                style={{
                  position: "absolute",
                  right: 6,
                  bottom: 8,
                  background: isActive ? "#28a745" : "#dc3545",
                  borderRadius: "50%",
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "3px solid #fff",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.10)",
                }}
                title={isActive ? "Active" : "Inactive"}
                aria-label={isActive ? "Active" : "Inactive"}
              >
                {isActive ? (
                  <FaCheckCircle color="#fff" size={20} />
                ) : (
                  <FaTimesCircle color="#fff" size={20} />
                )}
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="text-center px-4" style={{ marginTop: 70 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 4 }}>{client.client_name}</h3>
            <div style={{ color: "#888", fontSize: 15, marginBottom: 2 }}>
              <FaEnvelope style={{ marginRight: 6, verticalAlign: -2 }} />
              {client.client_email}
            </div>
            <div style={{ color: "#888", fontSize: 15, marginBottom: 12 }}>
              <FaMapMarkerAlt style={{ marginRight: 6, verticalAlign: -2 }} />
              {client.client_city}, {client.client_state}, {client.client_country}
            </div>

            {/* About */}
            <div
              style={{
                background: "#f8f9fa",
                borderRadius: 12,
                margin: "0 auto 18px auto",
                maxWidth: 420,
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
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
                  minWidth: 100,
                  margin: "0 8px",
                  transition: "box-shadow 0.2s",
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 18 }}>{client.project_count}</div>
                <small className="text-muted">Projects</small>
              </div>
              <div
                className="shadow-sm p-3 rounded text-center d-flex flex-column align-items-center"
                style={{
                  minWidth: 100,
                  margin: "0 8px",
                  transition: "box-shadow 0.2s",
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 18 }}>{client.employee_count}</div>
                <small className="text-muted">Employees</small>
              </div>
            </div>

            {/* Close Button */}
            <div className="card-footer text-right">
              <button
              className="btn btn-primary"
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
    </div>
  );
};

export default ClientInfoModal;
