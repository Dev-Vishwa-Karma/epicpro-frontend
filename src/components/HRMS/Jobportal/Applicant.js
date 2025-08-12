import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getService } from '../../../services/getService';
import ApplicantTable from './ApplicantTable';
import DeleteModal from '../../common/DeleteModal';
import ApplicantFilter from './ApplicantFilter';
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
  };

  componentDidMount() {
    this.fetchApplicants();
  }

  fetchApplicants = () => {
    this.setState({ loading: true });
    const {search, status, order, currentPage, pageSize} = this.state;
    getService.getCall('applicants.php', {
      action: 'list',
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

  handleStatusChange = (id, status) => {
    const formData = new FormData();
 
    const data = {
      id: id,
      status:status
    }
    appendDataToFormData(formData, data)

    getService.addCall('applicants.php', 'update', formData)
      .then(data => {
        if (data.status === 'success') {
          this.setState(prev => ({
            applicants: prev.applicants.map(app =>
              app.id === id ? { ...app, status } : app
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
    
    // Correct way to use addCall:
    getService.addCall('applicants.php', 'sync_applicant')  // <-- Note the change here
      .then(data => {
        if (data.status === 'success') {
          // alert(`Synced ${data.data.inserted} new applicants`);
          this.setState({ syncing: true, syncSuccess: "" });
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
    const { applicants, loading, error, search, status, order, currentPage, totalPages, showDeleteModal, isDeleting, isSyncing,syncSuccess } = this.state;
    return (
      <>
        <div className={`section-body ${fixNavbar ? "marginTop" : ""} mt-3`}>
          <div className="container-fluid">
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
                syncSuccess={syncSuccess}
              />
              {/* Delete Modal */}
              <DeleteModal
                show={showDeleteModal}
                onConfirm={this.confirmDelete}
                isLoading={isDeleting}
                onClose={this.closeDeleteModal}
                deleteBody={"Are you sure you want to delete this applicant?"}
              />
            </div>
          </div>
        </div>
      </>
    );
  }
}
const mapStateToProps = state => ({
  fixNavbar: state.settings.isFixNavbar,
});

const mapDispatchToProps = dispatch => ({});
export default connect(mapStateToProps, mapDispatchToProps)(Applicant);