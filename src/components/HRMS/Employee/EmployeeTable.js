import React from 'react';
import PropTypes from 'prop-types';
import TableSkeleton from '../../common/skeletons/TableSkeleton';
import Avatar from '../../common/Avatar';

const EmployeeTable = ({ loading, employeeList, viewEmployee, goToEditEmployee, openDeleteModal, message }) => {
    return (
        <div className="card-body">
            {loading ? (
                <div className="card-body">
                    <div className="dimmer active">
                       <TableSkeleton columns={7} rows={5} />
                    </div>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-hover table-striped table-vcenter text-nowrap mb-0">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Employee ID</th>
                                <th>Phone</th>
                                <th>Join Date</th>
                                <th>Role</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employeeList.length > 0 ? (
                                employeeList.map((employee, index) => (
                                    <tr key={employee.id}>
                                        <td className="w40">
                                            {(index + 1).toString().padStart(2, '0')}
                                        </td>
                                        <td className="d-flex">
                                         <Avatar
                                            profile={employee.profile}
                                            first_name={employee.first_name}
                                            last_name={employee.last_name}
                                            size={40}
                                            className="avatar avatar-blue add-space me-2"
                                            onError={(e) => e.target.src = '/assets/images/sm/avatar2.jpg'}
                                            />
                                            <div className="ml-3">
                                                <h6 className="mb-0">
                                                    {`${employee.first_name} ${employee.last_name}`}
                                                </h6>
                                                <span className="text-muted">
                                                    {employee.email}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span>{employee.code}</span>
                                        </td>
                                        <td>
                                            <span>{employee.mobile_no1}</span>
                                        </td>
                                        <td>
                                            {new Intl.DateTimeFormat('en-US', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                            }).format(new Date(employee.joining_date))}
                                        </td>
                                        <td>{employee.department_name}</td>
                                        <td>
                                            <button
                                                type="button"
                                                className="btn btn-icon btn-sm"
                                                title="View"
                                                onClick={() => viewEmployee(employee, employee.id)}
                                            >
                                                <i className="fa fa-eye" />
                                            </button>
                                            <button
                                                onClick={() => goToEditEmployee(employee, employee.id)}
                                                type="button"
                                                className="btn btn-icon btn-sm"
                                                title="Edit"
                                            >
                                                <i className="fa fa-edit" />
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-icon btn-sm js-sweetalert"
                                                title="Delete"
                                                data-type="confirm"
                                                data-toggle="modal"
                                                data-target="#deleteEmployeeModal"
                                                onClick={() => openDeleteModal(employee.id)}
                                            >
                                                <i className="fa fa-trash-o text-danger" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                !message && (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            style={{
                                                textAlign: 'center',
                                                fontWeight: 500,
                                                color: '#888',
                                                fontSize: '1.1rem',
                                                padding: '32px 0',
                                            }}
                                        >
                                            No employees found
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

// Define the expected prop types
EmployeeTable.propTypes = {
    loading: PropTypes.bool.isRequired,
    employeeList: PropTypes.array.isRequired,
    viewEmployee: PropTypes.func.isRequired,
    goToEditEmployee: PropTypes.func.isRequired,
    openDeleteModal: PropTypes.func.isRequired,
    message: PropTypes.string,
};

export default EmployeeTable;
