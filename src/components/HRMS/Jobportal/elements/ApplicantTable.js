import React, { Component } from 'react';
import NoDataRow from '../../../common/NoDataRow';
import TableSkeleton from '../../../common/skeletons/TableSkeleton';
import Pagination from '../../../common/Pagination';
import ApplicantViewModal from './ApplicantViewModal';
import InputField from '../../../common/formInputs/InputField';
import Button from '../../../common/formInputs/Button';
class ApplicantTable extends Component {
  static getStatusColor(status) {
    switch (status) {
      case 'pending': return { background: '#FEF9C3', color: 'brown' };
      case 'reviewed': return { background: '#DBEAFE', color: 'blue' };
      case 'interviewed': return { background: '#FFFFE0', color: 'orange' };
      case 'hired': return { background: '#DCFCE7', color: 'green' };
      case 'rejected': return { background: '#FEE2E2', color: 'red' };
      default: return {};
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      selectedApplicant: null,
      showViewModal: false,
    };
  }

  handleViewApplicant = (applicant) => {
    this.setState({
      selectedApplicant: applicant,
      showViewModal: true,
    });
  };

  handleCloseViewModal = () => {
    this.setState({
      showViewModal: false,
      selectedApplicant: null,
    });
  };

  render() {
    const {
      applicants,
      loading,
      error,
      currentPage,
      totalPages,
      onPageChange,
      onStatusChange,
      onDelete,
      onSync,
      syncing,
    } = this.props;

    const { selectedApplicant, showViewModal } = this.state;
    const { syncSuccess } = this.props;

    return (
      <div className="col-lg-12 col-md-12 col-sm-12">
        <div className="card">
          <div className="card-header d-flex align-items-center justify-content-between">
            <h3 className="card-title mb-0">Applicants</h3>
            <Button
              label={syncing ? "Syncing..." : "Sync"}
              onClick={onSync}
              disabled={syncing}
              className="btn-sm btn-primary"
              title="Sync third-party applicants"
              icon={syncing ? "" : "fa fa-refresh"}
              iconStyle={{ marginRight: syncing ? '0' : '8px' }}
              loading={syncing}
            />
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
                    {/* <th>Resume</th> */}
                    <th>Action</th>
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
                          {applicant.fullname ? applicant.fullname .split(' ') .map(word => word[0]) .join('') .toUpperCase() : '?'}
                          </span>
                        </td>
                        <td>
                          <div className="font-15">{applicant.fullname}</div>
                          <span className="text-muted">{applicant.email}</span>
                        </td>
                        <td>{applicant.phone}</td>
                        <td>{new Date(applicant.created_at).toLocaleDateString()}</td>
                        <td>
                          <InputField
                            className="custom-select"
                            type="select"
                            value={applicant.status}
                            style={{
                              ...ApplicantTable.getStatusColor(applicant.status),
                              WebkitAppearance: 'menulist-button',
                              MozAppearance: 'menulist',
                              appearance: 'menulist',
                            }}
                            onChange={e => onStatusChange(applicant.id, e.target.value)}
                            options={[
                              { value: "pending", label: "Pending" },
                              { value: "reviewed", label: "Reviewed" },
                              { value: "interviewed", label: "Interviewed" },
                              { value: "hired", label: "Hired" },
                              { value: "rejected", label: "Rejected" }
                            ]}
                          />
                        </td>
                        <td>
                          <div className="d-flex">
                          <Button
                            label=""
                            onClick={() => this.handleViewApplicant(applicant)}
                            title="View Details"
                            className="btn"
                            icon="fa fa-eye"
                          />
                          {/* <Button
                            label=""
                            onClick={() => onDelete(applicant.id)}
                            className="btn"
                            icon="fa fa-trash"
                          /> */}
                            {applicant.resume_path && (
                              <a
                                href={`${process.env.REACT_APP_API_URL}/${applicant.resume_path}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn"
                                title="Download Resume"
                              >
                                <i className="fa fa-download"></i>
                              </a>
                            )}
                          </div>
                        </td>
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

        {/* View Modal */}
        <ApplicantViewModal
          show={showViewModal}
          onClose={this.handleCloseViewModal}
          applicant={selectedApplicant}
          getStatusColor={ApplicantTable.getStatusColor}
        />
      </div>
    );
  }
}

export default ApplicantTable;