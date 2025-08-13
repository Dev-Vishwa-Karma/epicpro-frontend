import React from "react";
import { Link } from "react-router-dom";
import Button from "../../../common/formInputs/Button";

const ClientCard = ({ 
  client, 
  onViewProfile, 
  onEdit, 
  onDelete 
}) => {
  return (
    <div className="col-xl-3 col-lg-4 col-md-6 mb-4">
      <div className="card h-100">
        <div className="card-body text-center ribbon" style={{ minHeight: '300px' }}>
          <div className={`ribbon-box ${client.client_country ? 'green' : 'transparent'}`}>
            {client.client_country || ' '}
          </div>

          <div className="d-flex justify-content-center" style={{ height: '100px', margin: '20px 0' }}>
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
          </div>
          
          <div
            className="dropdown d-flex"
            style={{ position: 'absolute', top: '16px', right: '10px' }}
          >
            <a
              href="/#"
              className="nav-link icon d-none d-md-flex ml-1"
              data-toggle="dropdown"
              title="More options"
            >
              <i className="fa fa-ellipsis-v" />
            </a>

            <div
              className="dropdown-menu dropdown-menu-right dropdown-menu-arrow"
              style={{
                  minWidth: '100px',
                  padding: '4px 0',
                  overflow: 'hidden'
                }}
            >
              
              <Button
                label="Edit"
                onClick={() => onEdit(client)}
                className="dropdown-item project-dropdown-item"
                title="Edit"
              />

              <Button
                label="Delete"
                onClick={() => onDelete(client)}
                className="dropdown-item project-dropdown-item"
                title="Delete"
                style={{ color: '#d9534f' }}
              />

            </div>
          </div>

          {/* Client info with fixed spacing */}
          <div style={{ minHeight: '40px' }}>
            <h6 className="mt-3 mb-0">{client.client_name || ' '}</h6>
            <span style={{ fontSize: '15px' }}>{client.client_email || ' '}</span>
          </div>

          {/* View Profile button */}
          <ul className="mt-3 list-unstyled d-flex justify-content-center" >
          <Button
            label="View Profile"
            onClick={() => onViewProfile(client)}
            className="btn btn-default btn-sm"
          />
          </ul>

          {/* Stats section with fixed height */}
          <div className="row text-center mt-4" style={{ minHeight: '80px' }}>
            <div className="col-lg-6 border-right">
              <label className="mb-0">Project</label>
              <h4 className="font-18">
                <Link to={`/project-list`}>
                  {client.project_count}
                </Link>
              </h4>
            </div>
            <div className="col-lg-6">
              <label className="mb-0">Employee</label>
              <h4 className="font-18">
                <Link to={`/hr-employee`}>
                  {client.employee_count}
                </Link>
              </h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientCard; 