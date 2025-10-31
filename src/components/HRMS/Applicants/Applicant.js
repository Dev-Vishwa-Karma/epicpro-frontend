import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getService } from '../../../services/getService';
import AlertMessages from '../../common/AlertMessages';
import DeleteModal from '../../common/DeleteModal';
import ApplicantTable from './elements/ApplicantTable';
import ApplicantFilter from './elements/ApplicantFilter';
import AddApplicant from './elements/AddApplicant'
import { appendDataToFormData } from '../../../utils';
import DuplicateDecisionModal from './elements/DuplicateDecisionModal';
import Button from '../../common/formInputs/Button';
import { shortformatDate } from '../../../utils';

class Applicant extends Component {

  state = {
    applicants: [],
    loading: true,
    error: null,
    search: '',
    status: '',
    order: 'newest',
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    total: 0,
    showDeleteModal: false,
    deleteId: null,
    isDeleting: false,
    isSyncing: false,
    syncSuccess: '',
    showSuccess: false,
    showError: false,
    activeTab: 'list',
    showDuplicateDecision: false,
    duplicates: [],
    selectedDuplicates: {},
    tabKey: 0,
    lastSyncTime: null,
  };

  componentDidMount() {
    this.fetchApplicants();
  }

  fetchApplicants = () => {
    this.setState({ loading: true });
    const {search, status, order, currentPage, pageSize} = this.state;
    getService.getCall('applicants.php', {
      action: 'view',
      search: search,
      status: status,
      order: order,
      page: currentPage,
      limit: pageSize,
    })
      .then(data => {
      if (data.status === 'success') {
        this.setState({
          applicants: data.data.applicants,
          loading: false,
          totalPages: data.data.totalPages,
          total: data.data.total,
          lastSyncTime: data.data.last_sync || this.state.lastSyncTime,
        });
      } else {
        this.setState({ error: data.data.message, loading: false });
      }
    })
      .catch(err => this.setState({ error: err.message, loading: false }));
  };

  handleFilter = (e) => {
    e.preventDefault();
    this.setState({ currentPage: 1 }, this.fetchApplicants);
  };

  handleInputChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handlePageChange = (pageNum) => {
    this.setState({ currentPage: pageNum }, this.fetchApplicants);
  };

    handleStatusChange = (id, status, rejectReason = null) => {
    const formData = new FormData();

    const data = {
      id: id,
      status: status
    };
    if (status === 'rejected' && rejectReason) {
      data.reject_reason = rejectReason;
    }
    appendDataToFormData(formData, data);

    getService.addCall('applicants.php', 'update', formData)
      .then(data => {
        if (data.status === 'success') {
          this.setState(prev => ({
            applicants: prev.applicants.map(app =>
              app.id === id ? { ...app, status, reject_reason: status === 'rejected' ? rejectReason : app.reject_reason } : app
            ),
          }));
        } else {
          alert(data.data.message || 'Failed to update status');
        }
      });
  };

  // New: trigger backend sync and refresh list
  handleSync = () => {
    if (this.state.isSyncing) return;
    this.setState({ isSyncing: true });
    
    getService.addCall('applicants.php', 'sync_applicant')
      .then(response => {        
        if (!response) {
          throw new Error('No response received from server');
        }
        if (response.status === 'success') {
          const insertedCount = response.data?.inserted || 0;
          const updatedCount = response.data?.updated || 0;
          const dupDetails = response.data?.duplicate_details || response.data?.duplicates || [];
          const lastSync = response.data?.last_sync || null;

          // Store the last sync time
          if (lastSync) {
            this.setState({ lastSyncTime: lastSync });
          }
          // Check if no data was received or counts are 0
          if ((insertedCount === 0 || insertedCount === undefined) && 
              (updatedCount === 0 || updatedCount === undefined)) {
            this.setState({ 
              syncSuccess: 'Sync data not available', 
              showSuccess: true 
            });
          } else {
            const successMsg = [
              insertedCount > 0 ? `Sync ${insertedCount} new applicants` : '',
              updatedCount > 0 ? `Updated ${updatedCount} existing applicants` : ''
            ].filter(Boolean).join(' and ') || 'No new updates found';

            this.setState({ 
              syncSuccess: successMsg, 
              showSuccess: true 
            });
          }

          const selectedMap = {};
          if (Array.isArray(dupDetails)) {
            dupDetails.forEach(d => { selectedMap[d.email] = true; });
          }

          if (Array.isArray(dupDetails) && dupDetails.length > 0 && dupDetails[0]?.email) {
            this.setState({ showDuplicateDecision: true, duplicates: dupDetails, selectedDuplicates: selectedMap });
          }

          setTimeout(() => this.setState({ syncSuccess: '', showSuccess: false }), 3000);
          this.fetchApplicants();
        } else {
          const errorMsg = response.data?.message || 'Sync failed';
          throw new Error(errorMsg);
        }
      })
      .catch(err => {
        const error = err?.response?.data?.message || err?.message || 'Sync failed';
        this.setState({ 
          error: error,
          showError: true 
        });
        setTimeout(() => this.setState({ error: '', showError: false }), 3000);
      })
      .finally(() => {
        this.setState({ isSyncing: false });
      });
  };

  handleToggleDuplicate = (dup, checked) => {
    this.setState(prev => ({
      selectedDuplicates: { ...prev.selectedDuplicates, [dup.email]: checked }
    }));
  };

  handleToggleAllDuplicates = (checked) => {
    this.setState(prev => {
      const map = {};
      prev.duplicates.forEach(d => { map[d.email] = checked; });
      return { selectedDuplicates: map };
    });
  };

  handleUpdateSelectedDuplicates = async () => {
    const { duplicates, selectedDuplicates } = this.state;
    const toUpdate = duplicates.filter(d => selectedDuplicates[d.email]);
    for (const dup of toUpdate) {
      const payload = new FormData();
      // Use backend email fallback for update if id is not used
      if (dup.email) payload.append('email', dup.email);
      const newData = dup.new_data || {};
      Object.entries(newData).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') payload.append(k, v);
      });
      await getService.addCall('applicants.php', 'update', payload);
    }
    this.setState({ showDuplicateDecision: false, duplicates: [], selectedDuplicates: {} });
    this.fetchApplicants();
  };

  handleTabChange = (tabId) => {
    // for clear form
    if (tabId === 'add') {
      this.setState(prevState => ({ 
        activeTab: tabId, 
        tabKey: prevState.tabKey + 1 
      }));
    } else {
      this.setState({ activeTab: tabId });
    }
  };

  refreshApplicants = () => {
    this.fetchApplicants();
  };

  openDeleteModal = (id) => {
    this.setState({ showDeleteModal: true, deleteId: id });
  };

  closeDeleteModal = () => {
    this.setState({ showDeleteModal: false, deleteId: null, isDeleting: false });
  };

  confirmDelete = () => {
    const { deleteId } = this.state;
    if (!deleteId) return;
    this.setState({ isDeleting: true });
    getService
      .addCall('applicants.php', 'delete', { id: deleteId })
      .then(data => {
        if (data.status === 'success') {
          this.setState(
            prev => ({
              applicants: prev.applicants.filter(app => app.id !== deleteId),
              showDeleteModal: false,
              deleteId: null,
              isDeleting: false,
            }),
            this.fetchApplicants
          );
        } else {
          alert(data.data.message || 'Failed to delete applicant');
          this.setState({ isDeleting: false });
        }
      })
      .catch(() => this.setState({ isDeleting: false }));
  };

  render() {
    const { fixNavbar } = this.props;
    const { applicants, loading, error, search, status, order, currentPage, totalPages, showDeleteModal, isDeleting, isSyncing, syncSuccess, showSuccess, showError, activeTab, showDuplicateDecision, duplicates, selectedDuplicates } = this.state;
    return (
      <>
        <AlertMessages
          showSuccess={showSuccess}
          successMessage={syncSuccess}
          showError={showError}
          errorMessage={error}
          setShowSuccess={val => this.setState({ showSuccess: val })}
          setShowError={val => this.setState({ showError: val })}
        />
        <div className={`section-body ${fixNavbar ? "marginTop" : ""} `}>
          <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center">
              <ul className="nav nav-tabs page-header-tab">
                <li className="nav-item">
                  <a
                    className={`nav-link ${activeTab === 'list' ? 'active' : ''}`}
                    id="applicant-tab"
                    data-toggle="tab"
                    href="#applicant-list"
                    onClick={() => this.handleTabChange('list')}
                  >
                    List
                  </a>
                </li>
                <li className="nav-item">
                  <a 
                    className={`nav-link ${activeTab === 'add' ? 'active' : ''}`}
                    id="applicant-tab"                                            
                    data-toggle="tab" 
                    href="#applicant-add" 
                    onClick={() => this.handleTabChange('add')}
                  >
                    Add New                                                                                                                                                                                             
                  </a>
                </li>                                                         
              </ul>
              <div className={`tab-pane fade ${activeTab === 'list' ? 'show active' : ''}`} id="applicant-list" role="tabpanel">
                <div className="d-flex flex-column align-items-end">
                  <Button
                    label={isSyncing ? "Syncing..." : `Sync`}
                    onClick={this.handleSync}
                    disabled={isSyncing}
                    className="btn-sm btn-primary mt-2"
                    icon={isSyncing ? "fa fa-refresh" : "fa fa-refresh"}
                    iconStyle={{
                      marginRight: isSyncing ? '2' : '8px',
                      animation: isSyncing ? 'spin 1s linear infinite' : 'none'
                    }}
                  />
                  <style>
                    {`
                      @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                      }
                    `}
                  </style>
                  {this.state.lastSyncTime && (
                    <div className="text-muted small mt-2">
                      Last sync: {shortformatDate(this.state.lastSyncTime)}
                    </div>
                  )}      
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="section-body mt-3">
          <div className="container-fluid">
            <div className="tab-content mt-3">
              <div className={`tab-pane fade ${activeTab === 'list' ? 'show active' : ''}`} id="applicant-list" role="tabpanel">
                <div className="row clearfix row-deck">
                  {/* Filter */}
                  <ApplicantFilter
                    search={search}
                    status={status}
                    order={order}
                    onInputChange={this.handleInputChange}
                    onFilter={this.handleFilter}
                  />
                  {/* Applicants Table */}
                  <ApplicantTable
                    applicants={applicants}
                    loading={loading}
                    error={error}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={this.handlePageChange}
                    onStatusChange={this.handleStatusChange}
                    onDelete={this.openDeleteModal}
                    onSync={this.handleSync}
                    syncing={isSyncing}
                  />
                </div>
              </div>
              <div className={`tab-pane fade ${activeTab === 'add' ? 'show active' : ''}`} id="applicant-add" role="tabpanel">
                <AddApplicant key={this.state.tabKey} onTabChange={this.handleTabChange} onAddSuccess={this.refreshApplicants} />
              </div>
            </div>
                    </div>
        </div>

        {/* Duplicate Decision Modal */}
        <DuplicateDecisionModal
          show={showDuplicateDecision}
          duplicates={duplicates}
          selected={selectedDuplicates}
          onToggleOne={this.handleToggleDuplicate}
          onToggleAll={this.handleToggleAllDuplicates}
          onUpdateSelected={this.handleUpdateSelectedDuplicates}
          onClose={() => this.setState({ showDuplicateDecision: false })}
        />
 
        {/* Delete Modal */}
        <DeleteModal
          show={showDeleteModal}
          onConfirm={this.confirmDelete}
          isLoading={isDeleting}
          onClose={this.closeDeleteModal}
          deleteBody={"Are you sure you want to delete this applicant?"}
        />
      </>
    );
  }
}
const mapStateToProps = state => ({
  fixNavbar: state.settings.isFixNavbar,
});

const mapDispatchToProps = dispatch => ({
});
export default connect(mapStateToProps, mapDispatchToProps)(Applicant);