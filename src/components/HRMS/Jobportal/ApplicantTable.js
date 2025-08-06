import React from 'react';
import NoDataRow from '../../common/NoDataRow';
import TableSkeleton from '../../common/skeletons/TableSkeleton';
import Pagination from '../../common/Pagination';

const ApplicantTable = ({
  applicants,
  loading,
  error,
  currentPage,
  totalPages,
  onPageChange,
  onStatusChange,
  onDelete,
  getStatusColor,
}) => {
  return (
    <div className="col-lg-12 col-md-12 col-sm-12">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Applicants</h3>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover table-striped table-vcenter mb-0">
              <thead>
                <tr>
                  <th />
                  <th>Name</th>
                  <th>Mobile</th>
                  <th>Applied On</th>
                  <th>Status</th>
                  <th>Resume</th>
                  {/* <th>Action</th> */}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" style={{ padding: 0 }}>
                      <TableSkeleton columns={7} rows={5} />
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="7" className="text-danger">{error}</td>
                  </tr>
                ) : applicants.length === 0 ? (
                  <NoDataRow colSpan={7} message="No applicants found." />
                ) : (
                  applicants.map(applicant => (
                    <tr key={applicant.id}>
                      <td className="w60">
                        <span className="avatar avatar-pink">
                          {applicant.fullname ? applicant.fullname[0] : '?'}
                        </span>
                      </td>
                      <td>
                        <div className="font-15">{applicant.fullname}</div>
                        <span className="text-muted">{applicant.email}</span>
                      </td>
                      <td>{applicant.phone}</td>
                      <td>{new Date(applicant.created_at).toLocaleDateString()}</td>
                      <td>
                        <select
                          className="custom-select"
                          value={applicant.status}
                          style={{
                            ...getStatusColor(applicant.status),
                            WebkitAppearance: 'menulist-button',
                            MozAppearance: 'menulist',
                            appearance: 'menulist',
                          }}
                          onChange={e => onStatusChange(applicant.id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="interviewed">Interviewed</option>
                          <option value="hired">Hired</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                      <td>
                        {applicant.resume_path && (
                          <a
                            href={`${process.env.REACT_APP_API_URL}/${applicant.resume_path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm d-flex justify-content-center align-items-center"
                          >
                            <i className="fa fa-files-o" style={{ fontSize: "20px" }}></i>
                          </a>
                        )}
                      </td>
                      {/* <td>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => onDelete(applicant.id)}
                        >
                          Delete
                        </button>
                      </td> */}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="d-flex justify-content-end mt-3">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicantTable;
