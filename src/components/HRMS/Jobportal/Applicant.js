import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getService } from '../../../services/getService';
import ApplicantTable from './ApplicantTable';
import DeleteModal from '../../common/DeleteModal';

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
  };

  componentDidMount() {
    this.fetchApplicants();
  }

  fetchApplicants = () => {
    this.setState({ loading: true });
    getService.getCall('applicants.php', {
      action: 'list',
      search: this.state.search,
      status: this.state.status,
      order: this.state.order,
      page: this.state.currentPage,
      limit: this.state.pageSize,
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
    this.setState({ currentPage: 1 }, 
    this.fetchApplicants);
  };

  handleInputChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handlePageChange = (pageNum) => {
    this.setState({ currentPage: pageNum }, 
    this.fetchApplicants);
  };

  handleStatusChange = (id, status) => {
    const formData = new FormData();
    formData.append('id', id);
    formData.append('status', status);

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
    const formData = new FormData();
    formData.append('id', deleteId);
    getService.addCall('applicants.php', 'delete', formData)
      .then(data => {
        if (data.status === 'success') {
          this.setState(prev => ({
            applicants: prev.applicants.filter(app => app.id !== deleteId),
            showDeleteModal: false,
            deleteId: null,
            isDeleting: false,
          }));
        } else {
          alert(data.data.message || 'Failed to delete applicant');
          this.setState({ isDeleting: false });
        }
      });
  };

  getStatusColor = (status) => {
    switch (status) {
      case 'pending': return { background: '#FEF9C3', color: '#FEF9C3' };
      case 'reviewed': return { background: '#DBEAFE', color: '#222' };
      case 'interviewed': return { background: '#FFFFE0', color: '#222' };
      case 'hired': return { background: '#DCFCE7', color: '#fff' };
      case 'rejected': return { background: '#FEE2E2', color: '#fff' };
      default: return {};
    }
  };

  render() {
    const { fixNavbar } = this.props;
    const { applicants, loading, error, search, status, order, currentPage, totalPages, showDeleteModal, isDeleting } = this.state;
    return (
      <>
        <div className={`section-body ${fixNavbar ? "marginTop" : ""} mt-3`}>
          <div className="container-fluid">
            <div className="row clearfix row-deck">

              {/* Filter */}
              <div className="card">
                <div className="card-body">
                  <form className="row" onSubmit={this.handleFilter}>
                    <div className="col-lg-4 col-md-4 col-sm-6">
                      <label>Search</label>
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search..."
                          name="search"
                          value={search}
                          onChange={this.handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="col-lg-3 col-md-4 col-sm-6">
                      <label>Status</label>
                      <div className="multiselect_div">
                        <select
                          className="custom-select"
                          name="status"
                          value={status}
                          onChange={this.handleInputChange}
                        >
                          <option value="">All Status</option>
                          <option value="pending">Pending</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="interviewed">Interviewed</option>
                          <option value="hired">Hired</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-lg-3 col-md-4 col-sm-6">
                      <label>Order</label>
                      <div className="form-group">
                        <select
                          className="custom-select"
                          name="order"
                          value={order}
                          onChange={this.handleInputChange}
                        >
                          <option value="newest">Newest first</option>
                          <option value="oldest">Oldest first</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-lg-2 col-md-4 col-sm-6 " style={{marginTop: '35px'}}>
                      <button type="submit" className="btn btn-sm btn-primary btn-block" >
                        Filter
                      </button>
                    </div>
                  </form>
                </div>
              </div>
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
                  getStatusColor={this.getStatusColor}
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