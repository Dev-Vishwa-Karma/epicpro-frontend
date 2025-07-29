import React from 'react';
import NoDataRow from '../../common/NoDataRow';

const DashboardTable = ({ projects, loading }) => {
  return (
    <div className="card-body">
      {loading ? (
        <div className="dimmer active p-3">
          <div className="loader" />
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover table-striped text-nowrap table-vcenter mb-0">
            <thead>
              <tr>
                <th>#</th>
                <th>Client Name</th>
                <th>Team</th>
                <th>Project Name</th>
                <th>Technology</th>
              </tr>
            </thead>
            <tbody>
              {projects && projects.length > 0 ? (
                projects.map((project, index) => (
                  <tr key={project.id || index}>
                    <td>{(index + 1).toString().padStart(2, '0')}</td>
                    <td>{project.client_name}</td>
                    <td>
                      {project.team_members && project.team_members.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
                          {project.team_members.map((member, idx) => (
                            <img
                              key={member.id || idx}
                              src={member.profile ? `${process.env.REACT_APP_API_URL}/${member.profile}` : "/assets/images/sm/avatar2.jpg"}
                              alt={`${member.first_name} ${member.last_name}`}
                              title={`${member.first_name} ${member.last_name}`}
                              style={{
                                width: 35,
                                height: 35,
                                borderRadius: '50%',
                                border: '2px solid #fff',
                                objectFit: 'cover',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
                                marginLeft: idx === 0 ? 0 : -14,
                                background: '#fff',
                                zIndex: 10 + idx,
                                transition: 'z-index 0.2s, transform 0.25s cubic-bezier(0.4,0,0.2,1)',
                                cursor: 'pointer',
                              }}
                              onError={(e) => {
                                e.target.src = '/assets/images/sm/avatar2.jpg';
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
                            />
                          ))}
                        </div>
                      )}
                    </td>
                    <td>{project.project_name}</td>
                    <td>{project.project_technology}</td>
                  </tr>
                ))
              ) : (
                <NoDataRow colSpan={7} message="Projects not available" />
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DashboardTable;
