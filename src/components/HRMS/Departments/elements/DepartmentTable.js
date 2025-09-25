import React from 'react';
import NoDataRow from '../../../common/NoDataRow';
import Button from '../../../common/formInputs/Button';

const DepartmentTable = ({ departmentData, message, onEditClick, onDeleteClick }) => {
  return (
    <div className="table-responsive">
      <table className="table table-striped table-vcenter table-hover mb-0">
        <thead>
          <tr>
            <th></th>
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
                <td>{department.total_employee || 0}</td>
                <td>
                  <Button
                    icon="fa fa-edit"
                    className="btn-icon"
                    title="Edit"
                    dataToggle="modal"
                    dataTarget="#editDepartmentModal"
                    onClick={() => onEditClick(department)}
                  />
                  <Button
                    icon="fa fa-trash-o text-danger"
                    className="btn-icon btn-sm js-sweetalert"
                    title="Delete"
                    dataToggle="modal"
                    dataTarget="#deleteDepartmentModal"
                    onClick={() => onDeleteClick(department.id)}
                    dataType="confirm"
                  />
                </td>
              </tr>
            ))
          ) : (
            <NoDataRow colSpan={7} message="Department not found" />
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DepartmentTable;
