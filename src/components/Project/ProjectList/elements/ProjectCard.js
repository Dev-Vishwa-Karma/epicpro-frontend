import React from "react";
import Avatar from "../../../common/Avatar";

const ProjectCard = ({ 
  project, 
  index,
  logged_in_employee_role,
  onToggleStatus,
  onEdit,
  onDelete,
  collapsedCards
}) => {
    
  return (
    <div className="col-lg-4 col-md-6 mb-4" key={index}>
      <div
        className={`card h-100 d-flex flex-column ${
          collapsedCards[project.project_id] ? 'card-collapsed' : ''
        }`}
      >
        <div className="card-header">
          <h3 className="card-title">{project.project_name}</h3>
          <div className="card-options">
            <label className="custom-switch m-0">
              <input
                type="checkbox"
                className="custom-switch-input"
                checked={Number(project.project_is_active) === 1}
                onChange={() =>
                  onToggleStatus(project.project_id, project.project_is_active)
                }
              />
              <span className="custom-switch-indicator" />
            </label>
            {(logged_in_employee_role === 'admin' ||
              logged_in_employee_role === 'super_admin') && (
                <div className="dropdown d-flex">
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
                    <button
                      className="dropdown-item project-dropdown-item"
                      type="button"
                      title="Edit"
                      onClick={() => onEdit(project)}
                    >
                      Edit
                    </button>
                                    
                    <button
                      className="dropdown-item project-dropdown-item"
                      type="button"
                      title="Delete"
                      onClick={() => onDelete(project.project_id, project.project_name)}
                      style={{
                        color: '#d9534f'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
            )}
          </div>
        </div>

        <div className="card-body flex-grow-1">
          <span className="tag tag-blue mb-3">{project.project_technology}</span>
          <p
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {project.project_description}
          </p>
          <div className="row">
            <div className="col-4 py-1">
              <strong>Started date:</strong>
            </div>
            <div className="col-8 py-1">
              {new Date(project.created_at)
                .toLocaleString('en-US', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })
                .replace(',', '')}
            </div>
            <div className="col-4 py-1">
              <strong>Team:</strong>
            </div>
            <div className="col-8 py-1">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {project.team_members.map((member, idx) => (
                <Avatar
                    id = {idx}
                    profile={member.profile}
                    first_name={member.first_name}
                    last_name={member.last_name}
                    size={40}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                    className="avatar-img"
                    style={{ marginLeft: idx === 0 ? 0 : -14 }}
                    onError={(e) => e.target.src = '/assets/images/sm/avatar2.jpg'}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard; 