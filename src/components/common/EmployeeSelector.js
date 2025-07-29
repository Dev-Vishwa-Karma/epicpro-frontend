// EmployeeSelector.js
import React from 'react';

const EmployeeSelector = ({ allEmployeesData, selectedEmployee, handleEmployeeChange }) => {
    return (
        <div className="col-md-3">
            <div className="form-group">
                <label className="form-label">Select Employee</label>
                <select 
                    className="form-control" 
                    value={selectedEmployee} 
                    onChange={handleEmployeeChange}
                >
                    <option value="">All Employees</option>
                    {allEmployeesData
                        .filter(employee => {
                            const role = (employee.role || '').toLowerCase();
                            return role !== 'admin' && role !== 'super_admin';
                        })
                        .map((employee) => (
                            <option key={employee.id} value={employee.id}>
                                {employee.first_name} {employee.last_name}
                            </option>
                        ))}
                </select>
            </div>
        </div>
    );
};

export default EmployeeSelector;