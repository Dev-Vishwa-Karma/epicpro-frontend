import React from 'react';
import NoDataRow from '../../common/NoDataRow';  // Ensure the correct path to NoDataRow component
import TableSkeleton from '../../common/skeletons/TableSkeleton';

const EmployeeLeaveTable = ({ currentEmployeeLeaves, loading, handleEditClickForEmployeeLeave, openDeleteLeaveModal }) => {
  return (
    <div className="card-body">
      {loading ? (
        <div className="dimmer active">
          <TableSkeleton columns={7} rows={5} />
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover table-striped table-vcenter text-nowrap mb-0">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Date</th>
                <th>Reason</th>
                <th>Leave On</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentEmployeeLeaves.length > 0 ? (
                currentEmployeeLeaves.filter(l => l).map((leave, index) => (
                  <tr key={index}>
                    <td className="width45">
                      {leave.profile ? (
                        <img
                          src={`${process.env.REACT_APP_API_URL}/${leave.profile}`}
                          className="avatar avatar-blue add-space"
                          alt={`${leave.first_name} ${leave.last_name}`}
                          data-toggle="tooltip"
                          data-placement="top"
                          title={`${leave.first_name} ${leave.last_name}`}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                          }}
                          onError={e => {
                            e.target.src = '/assets/images/sm/avatar2.jpg';
                          }}
                        />
                      ) : (
                        <span
                          className="avatar avatar-blue add-space"
                          data-toggle="tooltip"
                          data-placement="top"
                          title={`${leave.first_name} ${leave.last_name}`}
                          style={{
                            width: '40px',
                            height: '40px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {leave.first_name.charAt(0).toUpperCase()}{leave.last_name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="font-15">
                        {`${leave.first_name} ${leave.last_name}`}
                      </div>
                    </td>
                    <td>
                      {leave.from_date && !isNaN(new Date(leave.from_date)) && leave.to_date && !isNaN(new Date(leave.to_date)) ? (
                        `${new Intl.DateTimeFormat('en-US', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        }).format(new Date(leave.from_date))} to ${new Intl.DateTimeFormat('en-US', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        }).format(new Date(leave.to_date))}`
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>{leave.reason}</td>
                    <td>
                      <span
                        className={`tag ${
                          leave.is_half_day === '1'
                            ? 'tag-blue'
                            : leave.is_half_day === '0'
                            ? 'tag-red'
                            : ''
                        }`}
                      >
                        {leave.is_half_day === '1' ? 'Half Day' : 'Full Day'}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`tag ${
                          leave.status === 'approved'
                            ? 'tag-success'
                            : leave.status === 'pending'
                            ? 'tag-warning'
                            : 'tag-danger'
                        }`}
                      >
                        {leave.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-icon btn-sm"
                        title="Edit"
                        data-toggle="modal"
                        data-target="#editLeaveRequestModal"
                        onClick={() => handleEditClickForEmployeeLeave(leave)}
                      >
                        <i className="fa fa-edit" />
                      </button>
                      <button
                        type="button"
                        className="btn btn-icon btn-sm js-sweetalert"
                        title="Delete"
                        data-type="confirm"
                        data-toggle="modal"
                        data-target="#deleteLeaveRequestModal"
                        onClick={() => openDeleteLeaveModal(leave.id)}
                      >
                        <i className="fa fa-trash-o text-danger" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <NoDataRow colSpan={7} message="No leaves found" />
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EmployeeLeaveTable;
