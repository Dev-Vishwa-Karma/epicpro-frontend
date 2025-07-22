// DepartmentGrid.js
import React from 'react';
import BlankState from '../../common/BlankState';

const DepartmentGrid = ({ departmentData, onEditClick, onDeleteClick }) => {
    return (
        <div className="row clearfix">
            {departmentData.length > 0 ? (
                departmentData.map((department, index) => (
                    <div className="col-lg-3 col-md-6" key={index}>
                        <div className="card">
                            <div className="card-body text-center">
                                <img
                                    className="img-thumbnail rounded-circle avatar-xxl"
                                    src="../assets/images/sm/avatar2.jpg"
                                    alt="avatar"
                                />
                                <h6 className="mt-3">{department.department_head}</h6>
                                <div className="text-center text-muted mb-2">{department.department_name}</div>
                                <div className="text-center text-muted mb-3">
                                    Total Employee : {department.total_employee}
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-icon btn-outline-primary mr-2"
                                    title="Edit"
                                    data-toggle="modal"
                                    data-target="#editDepartmentModal"
                                    onClick={() => onEditClick(department)}
                                >
                                    <i className="fa fa-pencil" />
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-icon btn-outline-danger"
                                    title="Delete"
                                    data-type="confirm"
                                    onClick={() => onDeleteClick(department.id)}
                                    data-toggle="modal"
                                    data-target="#deleteDepartmentModal"
                                >
                                    <i className="fa fa-trash" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="col-12 text-center">
                    <BlankState message="Department not found" />
                </div>
            )}
        </div>
    );
};

export default DepartmentGrid;
