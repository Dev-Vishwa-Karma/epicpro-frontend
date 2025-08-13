import React, { Component } from 'react';

class ApplicantFilter extends Component {
  render() {
    const { search, status, order, onInputChange, onFilter } = this.props;
    return (
      <div className="card">
        <div className="card-body">
          <form className="row" onSubmit={onFilter}>
            <div className="col-lg-4 col-md-4 col-sm-6">
              <label>Search</label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search..."
                  name="search"
                  value={search}
                  onChange={onInputChange}
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
                  onChange={onInputChange}
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
                  onChange={onInputChange}
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
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
    );
  }
}

export default ApplicantFilter; 