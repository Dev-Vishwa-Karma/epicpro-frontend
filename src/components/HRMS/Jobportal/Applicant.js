import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getService } from '../../../services/getService';
import NoDataRow from '../../common/NoDataRow';
import TableSkeleton from '../../common/skeletons/TableSkeleton';
import Pagination from '../../common/Pagination';

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

  handleDelete = id => {
    if (!window.confirm('Are you sure you want to delete this applicant?')) return;
    const formData = new FormData();
    formData.append('id', id);

    getService.addCall('applicants.php', 'delete', formData)
      .then(data => {
        if (data.status === 'success') {
          this.setState(prev => ({
            applicants: prev.applicants.filter(app => app.id !== id),
          }));
        } else {
          alert(data.data.message || 'Failed to delete applicant');
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
    const { applicants, loading, error, search, status, order, currentPage, totalPages } = this.state;
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
                            <tr><td colSpan="7" className="text-danger">{error}</td></tr>
                          ) : applicants.length === 0 ? (
                            <NoDataRow colSpan={7} message="No applicants found." />
                          ) : (
                            applicants.map(applicant => (
                              <tr key={applicant.id}>
                                <td className="w60">
                                  <span className="avatar avatar-pink">{applicant.fullname ? applicant.fullname[0] : '?'}</span>
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
                                            style=
                                            {{
                                                ...this.getStatusColor(applicant.status),
                                                WebkitAppearance: 'menulist-button', 
                                                MozAppearance: 'menulist',           
                                                appearance: 'menulist'               
                                            }}
                                    onChange={e => this.handleStatusChange(applicant.id, e.target.value)}
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
                                      <i className="fa fa-files-o" style={{fontSize:"20px"}}></i>
                                    </a>
                                  )}
                                </td>
                                {/* <td>
                                  <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => this.handleDelete(applicant.id)}
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
                          onPageChange={this.handlePageChange}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
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