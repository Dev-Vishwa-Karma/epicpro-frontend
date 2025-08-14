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
      showSyncConfirmModal: false,
      showRejectModal: false,
      rejectReason: '',
      rejectingForApplicant: null,
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
    console.log('handleStatusChange called:', { applicantId, newStatus, applicantName });
    if (newStatus === 'rejected') {
      console.log('Opening rejection modal');
      this.setState({ showRejectModal: true, rejectReason: '', rejectingForApplicant: { id: applicantId, name: applicantName } });
      return;
    }
    console.log('Opening confirmation modal');
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
      onStatusChange(pendingStatusChange.applicantId, pendingStatusChange.newStatus);
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

  handleSyncClick = () => {
    this.setState({ showSyncConfirmModal: true });
  };

  handleConfirmSync = () => {
    const { onSync } = this.props;
    this.setState({ showSyncConfirmModal: false });
    if (onSync) onSync();
  };

  handleCancelSync = () => {
    this.setState({ showSyncConfirmModal: false });
  };

  handleRejectConfirm = () => {
    const { rejectingForApplicant, rejectReason } = this.state;
    const { onStatusChange } = this.props;
    if (!rejectingForApplicant) return;
    this.setState({ isUpdatingStatus: true });
    onStatusChange(rejectingForApplicant.id, 'rejected', rejectReason);
    this.setState({ showRejectModal: false, rejectingForApplicant: null, rejectReason: '', isUpdatingStatus: false });
  };

  handleRejectCancel = () => {
    this.setState({ showRejectModal: false, rejectingForApplicant: null, rejectReason: '' });
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

    const { selectedApplicant, showViewModal, showConfirmModal, pendingStatusChange, isUpdatingStatus, showRejectModal, rejectReason, rejectingForApplicant } = this.state;

    return (
      <div className="col-lg-12 col-md-12 col-sm-12">
        <div className="card">
          <div className="card-header d-flex align-items-center justify-content-between">
            <h3 className="card-title mb-0">Applicants</h3>
            <Button
              label={syncing ? "Syncing..." : "Sync"}
              onClick={this.handleSyncClick}
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
                    <th className="w40"><i className="fa fa-user"></i></th>
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
                    applicants.map((applicant) => (
                      <tr key={applicant.id}>
                        <td>
                          <span className="avatar avatar-pink" data-toggle="tooltip" data-placement="top" data-original-title={applicant.fullname}>
                          {applicant.fullname ? applicant.fullname .split(' ').filter(Boolean).slice(0, 2).map(word => word[0]).join('').toUpperCase(): '?'}
                          </span>
                        </td>
                        <td>
                          <div className="">
                            <div>
                              <div className="font-15">{applicant.fullname} 
                                   <span className='ml-2'>
                                   {applicant.source === 'sync' && (
                                <i
                                  className="fa fa-refresh text-info"
                                  data-toggle="tooltip"
                                  data-placement="top"
                                  title="Synced"
                                ></i>
                              )}
                              {applicant.source === 'admin' && (
                                <i
                                  className="fa fa-user text-success"
                                  data-toggle="tooltip"
                                  data-placement="top"
                                  title="Added by admin"
                                ></i>
                              )}
                                   </span>
                              </div>
                              <span className="text-muted">{applicant.email}</span>
                            </div>
                          </div>
                        </td>
                        <td>{applicant.phone}</td>
                        <td>{shortformatDate(applicant.created_at)}</td>
                        <td>{applicant.experience_display || applicant.experience || "N/A"}</td>
                        <td>
                          <div >
                          <span>
                           {applicant.status === 'rejected' && applicant.reject_reason && (
                              <span title={applicant.reject_reason} data-toggle="tooltip" data-placement="top">
                                <p style={{color:'red', fontSize:'10px'}}>Reject reason</p>
                              </span>
                            )}
                           </span>
                            <InputField
                              className="custom-select"
                              type="select"
                              value={applicant.status}
                              style={{                                                                    
                                  ...ApplicantTable.getStatusColor(applicant.status),
                                  ...(applicant.status === 'rejected' ? { marginTop: '-10px' } : {})
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
                          </div>
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

        {/* Rejection Reason Modal */}
        {showRejectModal && (
          <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1} role="dialog" aria-modal="true">
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Rejection Reason</h5>
                  <button type="button" className="close" aria-label="Close" onClick={this.handleRejectCancel}>
                    <span aria-hidden="true">×</span>
                  </button>
                </div>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Please provide a reason for rejection</label>
                    <textarea 
                      className="form-control" 
                      rows={3} 
                      value={rejectReason} 
                      onChange={(e) => this.setState({ rejectReason: e.target.value })} 
                      placeholder="Enter reason"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={this.handleRejectCancel} disabled={isUpdatingStatus}>
                    Cancel
                  </button>
                  <button type="button" className="btn btn-danger" onClick={this.handleRejectConfirm} disabled={isUpdatingStatus || !rejectReason.trim()}>
                    {isUpdatingStatus && (
                      <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                    )}
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {showRejectModal && <div className="modal-backdrop fade show" />}

        {/* Sync Confirmation Modal */}
        <ConfirmModal
          show={this.state.showSyncConfirmModal}
          title="Confirm Sync"
          message="Are you sure you want to sync third-party applicants?"
          confirmText="Sync"
          cancelText="Cancel"
          confirmButtonClass="btn-primary"
          onConfirm={this.handleConfirmSync}
          onCancel={this.handleCancelSync}
          isLoading={syncing}
        />
      </div>
    );
  }
}

export default ApplicantTable;