import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getService } from '../../../services/getService';
import AlertMessages from '../../common/AlertMessages';
import DeleteModal from '../../common/DeleteModal';
import ApplicantTable from './elements/ApplicantTable';
import ApplicantFilter from './elements/ApplicantFilter';
import AddApplicant from './elements/AddApplicant'
import { appendDataToFormData } from '../../../utils';


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
    activeTab: 'list',
  };

  componentDidMount() {
    this.fetchApplicants();
  }

  fetchApplicants = () => {
    this.setState({ loading: true });
    const {search, status, order, currentPage, pageSize} = this.state;
    getService.getCall('applicants.php', {
      action: 'get',
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
      .then(data => {
        if (data.status === 'success') {
          this.setState({ syncSuccess: `Synced ${data.data.inserted} new applicants successfully!`, showSuccess: true });
          setTimeout(() => this.setState({ syncSuccess: '', showSuccess: false }), 3000);
          this.fetchApplicants();
        } else {
          alert(data.data.message || 'Sync failed');
        }
      })
      .catch(err => {
        alert(err?.message || 'Sync failed');
      })
      .finally(() => {
        this.setState({ isSyncing: false });
      });
  };

  handleTabChange = (tabId) => {
    this.setState({ activeTab: tabId });
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
    const { applicants, loading, error, search, status, order, currentPage, totalPages, showDeleteModal, isDeleting, isSyncing, syncSuccess, showSuccess, activeTab } = this.state;
    return (
      <>
        <AlertMessages
          showSuccess={showSuccess}
          successMessage={syncSuccess}
          showError={false}
          errorMessage={''}
          setShowSuccess={val => this.setState({ showSuccess: val })}
          setShowError={() => {}}
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
                <AddApplicant onTabChange={this.handleTabChange} />
              </div>
            </div>
          </div>
        </div>

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

const mapDispatchToProps = dispatch => ({});
export default connect(mapStateToProps, mapDispatchToProps)(Applicant);