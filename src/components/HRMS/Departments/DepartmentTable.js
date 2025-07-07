import React from 'react';

const DepartmentTable = ({ departmentData, message, onEditClick, onDeleteClick }) => {
    return (
        <div className="table-responsive">
            <table className="table table-striped table-vcenter table-hover mb-0">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Department Name</th>
                        <th>Department Head</th>
                        <th>Total Employee</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {departmentData.length > 0 ? (
                        departmentData.map((department, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>
                                    <div className="font-15">{department.department_name}</div>
                                </td>
                                <td>{department.department_head}</td>
                                <td>{department.total_employee}</td>
                                <td>
                                    <button
                                        type="button"
                                        className="btn btn-icon"
                                        title="Edit"
                                        data-toggle="modal"
                                        data-target="#editDepartmentModal"
                                        onClick={() => onEditClick(department)}
                                    >
                                        <i className="fa fa-edit" />
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-icon btn-sm js-sweetalert"
                                        title="Delete"
                                        data-type="confirm"
                                        data-toggle="modal"
                                        data-target="#deleteDepartmentModal"
                                        onClick={() => onDeleteClick(department.id)}
                                    >
                                        <i className="fa fa-trash-o text-danger" />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        !message && (
                            <tr>
                                <td colSpan="5" className="text-center">Department not found</td>
                            </tr>
                        )
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default DepartmentTable;
