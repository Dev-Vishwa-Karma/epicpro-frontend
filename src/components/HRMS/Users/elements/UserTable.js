// UserTable.js
import React from 'react';
import TableSkeleton from '../../../common/skeletons/TableSkeleton';
import NoDataRow from '../../../common/NoDataRow';
import Avatar from '../../../common/Avatar';
import Button from '../../../common/formInputs/Button';

const UserTable = ({ loading, currentUsers, handleEditClick, openDeleteModal }) => {
  return (
    <div className="table-responsive">
      {loading ? (
        <div className="card-body">
          <div className="dimmer active">
            <TableSkeleton columns={4} rows={currentUsers.length} />
          </div>
        </div>
      ) : (
        <table className="table table-striped table-hover table-vcenter text-nowrap mb-0">
          <thead>
            <tr>
              <th className="w60">Name</th>
              <th />
              <th>Role</th>
              <th>Created Date</th>
              <th>Position</th>
              <th className="w100">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length > 0 ? (
              currentUsers.map((user, index) => (
                <tr key={index}>
                  <td className="width45">
                    <Avatar
                      profile={user.profile}
                      first_name={user.first_name}
                      last_name={user.last_name}
                      size={45}
                      className="avatar avatar-blue add-space"
                      style={{
                        objectFit: 'cover',
                      }}
                      onError={(e) => e.target.src = '/assets/images/sm/avatar2.jpg'}
                      data-toggle="tooltip"
                      data-placement="top"
                      title={`${user.first_name} ${user.last_name}`}
                    />
                  </td>
                  <td>
                    <h6 className="mb-0">{`${user.first_name} ${user.last_name}`}</h6>
                    <span>{user.email}</span>
                  </td>
                  <td>
                    <span className={`tag ${
                      user.role === 'super_admin'
                        ? 'tag-danger'
                        : user.role === 'admin'
                        ? 'tag-info' 
                        : user.role === null ? 'tag-default' 
                        : 'tag-default'
                    }`}>
                      {user.role 
                        ? user.role.split('_')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                            .join(' ')
                        : 'No Role'}
                    </span>
                  </td>
                  <td>
                    {new Intl.DateTimeFormat('en-US', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    }).format(new Date(user.created_at))}
                  </td>
                  <td>{user.department_name}</td>
                  <td>
                  <Button
                    label=""
                    onClick={() => handleEditClick(user)}
                    className="btn-icon"
                    title="Edit"
                    icon="fa fa-edit"
                  />

                  <Button
                    label=""
                    onClick={() => openDeleteModal(user.id)}
                    className="btn-icon js-sweetalert"
                    title="Delete"
                    dataType="confirm"
                    dataToggle="modal"
                    dataTarget="#deleteUserModal"
                    icon="fa fa-trash-o text-danger"
                  />
                  </td>
                </tr>
              ))
            ) : (
              <NoDataRow colSpan={7} message="User not found" />
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserTable;
