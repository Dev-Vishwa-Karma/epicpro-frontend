import React from "react";

const ClientInfoModal = ({ client, onClose }) => {
  if (!client) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      role="dialog"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{client.client_name}'s Profile</h5>
            <button type="button" className="close" onClick={onClose}>
              <span>&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <div className="row">
              <div className="col-md-12 text-center mb-5">
                <img
                  src={`${process.env.REACT_APP_API_URL}/${client.client_profile}`}
                  alt="Client Profile Picture"
                  title="Client Profile Picture"
                  style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid #ccc"
                  }}
                />
              </div>

              <div className="col-md-6 mb-2">
                <strong>Name:</strong> {client.client_name}
              </div>
              <div className="col-md-6 mb-2">
                <strong>Email:</strong> {client.client_email}
              </div>
              <div className="col-md-6 mb-2">
                <strong>Country:</strong> {client.client_country}
              </div>
              <div className="col-md-6 mb-2">
                <strong>State:</strong> {client.client_state}
              </div>
              <div className="col-md-6 mb-2">
                <strong>City:</strong> {client.client_city}
              </div>
              <div className="col-md-6 mb-2">
                <strong>about:</strong> {client.client_about}
              </div>
              <div className="col-md-6 mb-2">
                <strong>Project Count:</strong> {client.project_count}
              </div>
              <div className="col-md-6 mb-2">
                <strong>Employee Count:</strong> {client.employee_count}
              </div>
              <div className="col-md-6 mb-2">
                <strong>Status:</strong> {client.client_status}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientInfoModal;
