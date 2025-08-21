import React, { Component } from 'react';
import NoDataRow from '../../../common/NoDataRow';
import TableSkeleton from '../../../common/skeletons/TableSkeleton';
import Pagination from '../../../common/Pagination';
import ApplicantViewModal from './ApplicantViewModal';
import ConfirmModal from '../../../common/ConfirmModal';
import RejectModal from './RejectModal';
import InputField from '../../../common/formInputs/InputField';
import { shortformatDate } from '../../../../utils';
import styles from './applicant.module.css';
import Avatar from '../../../common/Avatar';
import SyncedApplicantViewModal from './SyncedApplicantViewModal';
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
      showSyncedModal: false,
      selectedSynced: null
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

  handleViewSynced = (syncId) => {
    const { syncedData } = this.props;
    const found = Array.isArray(syncedData) ? syncedData.find(d => d.id === syncId) : null;
    this.setState({ showSyncedModal: true, selectedSynced: found || null });
  };

  handleCloseSynced = () => {
    this.setState({ showSyncedModal: false, selectedSynced: null });
  };

  handleStatusChange = (applicantId, newStatus, applicantName) => {
    console.log('handleStatusChange called:', { applicantId, newStatus, applicantName });
    if (newStatus === 'rejected') {
      this.setState({ showRejectModal: true, rejectReason: '', rejectingForApplicant: { id: applicantId, name: applicantName } });
      return;
    }
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
      syncing,
      syncedData,
    } = this.props;

    const { selectedApplicant, showViewModal, showConfirmModal, pendingStatusChange, isUpdatingStatus, showRejectModal, rejectReason, showSyncedModal, selectedSynced } = this.state;

    return (
      <div className="col-lg-12 col-md-12 col-sm-12">
        <div className="card">
          <div className="card-header d-flex align-items-center justify-content-between">
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
                      <td colSpan="7" style={{ padding: 0 }}>
                        <TableSkeleton columns={7} rows={applicants.length} />
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="7" className="text-danger">{error}</td>
                    </tr>
                  ) : applicants.length === 0 ? (
                    <NoDataRow colSpan={8} message="No applicants found." />
                  ) : (
                    applicants.map((applicant) => (
                      <tr key={applicant.id}>
                        <td>
                          <Avatar
                            first_name={applicant.fullname ? applicant.fullname.split(' ')[0] : ''}
                            last_name={applicant.fullname ? applicant.fullname.split(' ')[1] : ''}
                            size={40}
                            className="avatar avatar-blue add-space"
                            style={{ objectFit: 'cover' }}
                            data-toggle="tooltip"
                            data-placement="top"
                            title={`${applicant.fullname ? applicant.fullname.split(' ')[0] : ''} ${applicant.fullname ? applicant.fullname.split(' ')[1] : ''}`}
                          />
                        </td>
                        <td>
                          <div className="">
                            <div>
                              <div className="font-15">{applicant.fullname} 
                                <span className='ml-2'>
                                  {applicant.source === 'sync' && (
                                    <i
                                      className={`fa fa-refresh ${styles.syncIcon}`}
                                      data-toggle="tooltip"
                                      data-placement="top"
                                      title="Synced"
                                    ></i>
                                  )}
                                  {applicant.source === 'admin' && (
                                    <i
                                      className={`fa fa-user text-success ${styles.adminIcon}`}
                                      data-toggle="tooltip"
                                      data-placement="top"
                                      title="Added by admin"
                                    ></i>
                                  )}
                                  {applicant.source === 'referral' && (
                                    <i
                                      className={`fa fa-user-plus text-warning ${styles.referralIcon}`}
                                      data-toggle="tooltip"
                                      data-placement="top"
                                      title={applicant.employee_name ? `Referral by ${applicant.employee_name}` : 'referral form'}
                                    ></i>
                                  )}
                                </span>
                              </div>
                              <span className="text-muted">{applicant.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className={styles.tableCellCenter}>{applicant.phone || "--"}</td>
                        <td>{shortformatDate(applicant.created_at)}</td>
                        <td className={styles.tableCellCenter}>{applicant.experience_display || applicant.experience || "--"}</td>
                        <td>
                          <div >
                            <span>
                           {applicant.status === 'rejected' && applicant.reject_reason && (
                              <span  title={applicant.reject_reason} data-toggle="tooltip" data-placement="top" style={{ cursor: 'pointer'}}>
                                <p className={styles.rejectReasonText}>Reject reason</p>
                              </span>
                            )}
                           </span>
                            <InputField
                              className={`custom-select ${applicant.status === 'rejected' ? styles.statusSelectRejected : styles.statusSelect}`}
                              type="select"
                              value={applicant.status}
                              style={{                                                                    
                                ...ApplicantTable.getStatusColor(applicant.status),
                                ...(applicant.status === 'rejected' ? { marginTop: '-10px', marginBottom:'-13px' } : {})
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
                              disabled={applicant.source === 'sync'}
                            />
                            
                          </div>
                        </td>
                        <td>
                          <div className="item-action dropdown">
                            <a href="fake_url" data-toggle="dropdown" aria-expanded="false">
                              <i className="fa fa-ellipsis-h" />
                            </a>
                            <div className={`dropdown-menu dropdown-menu-right ${styles.dropdownMenu}`}>
                              <a href="fake_url" className="dropdown-item" onClick={(e) => { e.preventDefault(); this.handleViewApplicant(applicant); }}>
                                <i className="dropdown-icon fa fa-eye" /> View Details
                              </a>
                              {applicant.source === 'sync' && applicant.sync_id && (
                                <a href="fake_url" className="dropdown-item" onClick={(e) => { e.preventDefault(); this.handleViewSynced(applicant.sync_id); }}>
                                  <i className="dropdown-icon fa fa-external-link" /> View Synced Data
                                </a>
                              )}
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
        <RejectModal
          show={showRejectModal}
          rejectReason={rejectReason}
          onReasonChange={(e) => this.setState({ rejectReason: e.target.value })}
          onConfirm={this.handleRejectConfirm}
          onCancel={this.handleRejectCancel}
          isUpdating={isUpdatingStatus}
        />

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

        <SyncedApplicantViewModal
          show={this.state.showSyncedModal}
          data={this.state.selectedSynced}
          onClose={this.handleCloseSynced}
        />
      </div>
    );
  }
}

export default ApplicantTable;