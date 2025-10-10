import React from 'react';
import NoDataRow from '../../../common/NoDataRow';  // Ensure the correct path to NoDataRow component
import TableSkeleton from '../../../common/skeletons/TableSkeleton';
import Avatar from '../../../common/Avatar';
import Button from '../../../common/formInputs/Button';

const EmployeeLeaveTable = ({ currentEmployeeLeaves, loading, handleEditClickForEmployeeLeave, openDeleteLeaveModal }) => {
  return (
    <div className="card-body">
      {loading ? (
        <div className="dimmer active">
          <TableSkeleton columns={7} rows={currentEmployeeLeaves.length} />
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover table-striped table-vcenter text-nowrap mb-0">
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Date</th>
                <th>Reason</th>
                <th>Leave On</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentEmployeeLeaves.length > 0 ? (
                currentEmployeeLeaves.filter(l => l).map((leave, index) => (
                  <tr key={index}>
                    <td className="width60">
                      <Avatar
                        profile={leave.profile || '/assets/images/sm/avatar2.jpg'}
                        first_name={leave.first_name}
                        last_name={leave.last_name}
                        size={40}
                        className="avatar avatar-blue add-space me-2"
                        onError={(e) => e.target.src = '/assets/images/sm/avatar2.jpg'}
                      />
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
                      <Button
                        icon="fa fa-edit"
                        title="Edit"
                        onClick={() => handleEditClickForEmployeeLeave(leave)}
                        className="btn-icon btn-sm"
                        dataToggle="modal"
                        dataTarget="#editLeaveRequestModal"
                      />
                      <Button
                        icon="fa fa-trash-o text-danger"
                        title="Delete"
                        onClick={() => openDeleteLeaveModal(leave.id)}
                        className="btn-icon btn-sm js-sweetalert"
                        dataType="confirm"
                        dataToggle="modal"
                        dataTarget="#deleteLeaveRequestModal"
                      />
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
