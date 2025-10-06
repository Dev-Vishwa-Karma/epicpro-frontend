import React, { Component } from 'react';
import InputField from '../../../common/formInputs/InputField';
import Button from '../../../common/formInputs/Button';
import styles from './applicant.module.css';
class ApplicantFilter extends Component {
  render() {
    const { search, status, order, onInputChange, onFilter } = this.props;
    return (
      <div className="card">
        <div className="card-body">
          <form className="row" onSubmit={onFilter}>
            <div className="col-lg-4 col-md-4 col-sm-6">
              <label>Search</label>
                <InputField
                  className="form-control"
                  name="search"
                  value={search}
                  onChange={onInputChange}
                  placeholder="Search..."
                />
            </div>
            <div className="col-lg-3 col-md-4 col-sm-6">
              <label>Status</label>
              <div className="multiselect_div">
                <InputField
                  style={{ minWidth: '210px' }}
                  containerClassName="mb-0"
                  inputClassName="custom-select w-auto"
                  name="status"
                  type="select"
                  value={status}
                  onChange={onInputChange}
                  options={[
                    { value: "", label: "All Status" },
                    { value: "pending", label: "Pending" },
                    { value: "reviewed", label: "Reviewed" },
                    { value: "interviewed", label: "Interviewed" },
                    { value: "hired", label: "Hired" },
                    { value: "rejected", label: "Rejected" }
                  ]}
                  firstOption = {false}
                />
              </div>
            </div>
            <div className="col-lg-3 col-md-4 col-sm-6">
              <label>Sort</label>
              <div className="form-group">
                <InputField
                  style={{ minWidth: '210px' }}
                  containerClassName="mb-0"
                  inputClassName="custom-select w-auto"
                  name="order"
                  type="select"
                  value={order}
                  onChange={onInputChange}
                  options={[
                    { value: "newest", label: "Newest" },
                    { value: "oldest", label: "Oldest" }
                  ]}
                  firstOption = {false}
                />
              </div>
            </div>
            <div className={`col-lg-2 col-md-4 col-sm-6 ${styles.filterButtonContainer}`}>
              <Button
                label="Filter"
                type="submit"
                className={`btn-sm btn-primary btn-block ${styles.filterButton}`}
              />
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default ApplicantFilter; 