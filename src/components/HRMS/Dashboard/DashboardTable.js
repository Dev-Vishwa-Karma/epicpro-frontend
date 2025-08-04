import React from 'react';
import NoDataRow from '../../common/NoDataRow';
import TableSkeleton from '../../common/skeletons/TableSkeleton';
import Avatar from '../../common/Avatar';

const DashboardTable = ({ projects, loading }) => {
  return (
    <div className="card-body">
      {loading ? (
        <div className="dimmer active p-3">
          <TableSkeleton columns={5} rows={5} />
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
                          <Avatar
                              key = {idx}
                              profile={member.profile}
                              first_name={member.first_name}
                              last_name={member.last_name}
                              size={35}
                              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                              className="avatar-img"
                              style={{ marginLeft: idx === 0 ? 0 : -14,
                               }}
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
