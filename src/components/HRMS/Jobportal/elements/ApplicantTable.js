import React, { Component } from 'react';
import NoDataRow from '../../../common/NoDataRow';
import TableSkeleton from '../../../common/skeletons/TableSkeleton';
import Pagination from '../../../common/Pagination';
import ApplicantViewModal from './ApplicantViewModal';
import ConfirmModal from '../../../common/ConfirmModal';
import InputField from '../../../common/formInputs/InputField';
import Button from '../../../common/formInputs/Button';
import { shortformatDate } from '../../../../utils';
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
      showConfirmModal: false,
      pendingStatusChange: null,
      isUpdatingStatus: false,
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

  handleStatusChange = (applicantId, newStatus, applicantName) => {
    this.setState({
      showConfirmModal: true,
      pendingStatusChange: {
        applicantId,
        newStatus,
        applicantName
      }
    });
  };

  handleConfirmStatusChange = () => {
    const { pendingStatusChange } = this.state;
    const { onStatusChange } = this.props;
    
    if (pendingStatusChange) {
      this.setState({ isUpdatingStatus: true });
      
      // Call the parent's onStatusChange function
      onStatusChange(pendingStatusChange.applicantId, pendingStatusChange.newStatus);
      
      // Close the modal and reset state
      this.setState({
        showConfirmModal: false,
        pendingStatusChange: null,
        isUpdatingStatus: false,
      });
    }
  };

  handleCancelStatusChange = () => {
    this.setState({
      showConfirmModal: false,
      pendingStatusChange: null,
      isUpdatingStatus: false,
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

    const { selectedApplicant, showViewModal, showConfirmModal, pendingStatusChange, isUpdatingStatus } = this.state;

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
              <table className="table table-vcenter table_custom spacing5 border-style mb-0">
                <thead>
                  <tr>
                    <th className="w40">#</th>
                    <th>Name</th>
                    <th>Mobile</th>
                    <th>Applied On</th>
                    <th>Experience</th>
                    <th>Status</th>
                    <th className="w40" />
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" style={{ padding: 0 }}>
                        <TableSkeleton columns={8} rows={5} />
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="8" className="text-danger">{error}</td>
                    </tr>
                  ) : applicants.length === 0 ? (
                    <NoDataRow colSpan={8} message="No applicants found." />
                  ) : (
                    applicants.map((applicant, index) => (
                      <tr key={applicant.id}>
                        <td>
                          <span className="avatar avatar-pink" data-toggle="tooltip" data-placement="top" data-original-title={applicant.fullname}>
                            {applicant.fullname ? applicant.fullname.split(' ').map(word => word[0]).join('').toUpperCase() : '?'}
                          </span>
                        </td>
                        <td>
                          <div className="font-15">{applicant.fullname}</div>
                          <span className="text-muted">{applicant.email}</span>
                        </td>
                        <td>{applicant.phone}</td>
                        <td>
                            {shortformatDate(applicant.created_at)}
                        </td>
                        <td>{applicant.experience} Years</td>
                        <td>
                          <InputField
                            className="custom-select"
                            type="select"
                            value={applicant.status}
                            style={{
                                ...ApplicantTable.getStatusColor(applicant.status),
                            }}
                            onChange={e => this.handleStatusChange(applicant.id, e.target.value, applicant.fullname)}
                            options={[
                              { value: "pending", label: "Pending" },
                              { value: "reviewed", label: "Reviewed" },
                              { value: "interviewed", label: "Interviewed" },
                              { value: "hired", label: "Hired" },
                              { value: "rejected", label: "Rejected" }
                            ]}
                            firstOption={false}
                          />
                        </td>
                        <td>
                          <div className="item-action dropdown">
                            <a href="fake_url" data-toggle="dropdown" aria-expanded="false">
                              <i className="fa fa-ellipsis-h" />
                            </a>
                            <div className="dropdown-menu dropdown-menu-right"  style={{ position: 'absolute', willChange: 'transform', top: 0, left: 0, transform: 'translate3d(18px, 25px, 0px)' }}>
                              <a href="fake_url" className="dropdown-item" onClick={(e) => { e.preventDefault(); this.handleViewApplicant(applicant); }}>
                                <i className="dropdown-icon fa fa-eye" /> View Details
                              </a>
                              {applicant.resume_path && (
                                <a
                                  href={`${process.env.REACT_APP_API_URL}/${applicant.resume_path}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="dropdown-item"
                                >
                                  <i className="dropdown-icon fa fa-cloud-download" /> Download Resume
                                </a>
                              )}
                            </div>
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

        {/* Status Change Confirmation Modal */}
        <ConfirmModal
          show={showConfirmModal}
          title="Confirm Status Change"
          message={pendingStatusChange ? 
            `Are you sure you want to change the status of "${pendingStatusChange.applicantName}" to "${pendingStatusChange.newStatus.charAt(0).toUpperCase() + pendingStatusChange.newStatus.slice(1)}"?` 
            : ""
          }
          confirmText="Update Status"
          cancelText="Cancel"
          confirmButtonClass="btn-primary"
          onConfirm={this.handleConfirmStatusChange}
          onCancel={this.handleCancelStatusChange}
          isLoading={isUpdatingStatus}
        />
      </div>
    );
  }
}

export default ApplicantTable;