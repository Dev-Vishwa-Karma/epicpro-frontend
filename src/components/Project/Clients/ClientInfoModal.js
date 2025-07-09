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
              <div className="col-md-6 mb-2">
                <strong>Email:</strong> {client.client_email}
              </div>
              <div className="col-md-6 mb-2">
                <strong>Country:</strong> {client.client_country}
              </div>
              <div className="col-md-6 mb-2">
                <strong>Project Count:</strong> {client.project_count}
              </div>
              <div className="col-md-6 mb-2">
                <strong>Employee Count:</strong> {client.employee_count}
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
