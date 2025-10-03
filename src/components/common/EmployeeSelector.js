import React from 'react';
import {getSortedEmployees} from '../../utils'

const EmployeeSelector = ({ allEmployeesData, selectedEmployee, handleEmployeeChange, showAllInOption }) => {

const sortedEmployees = getSortedEmployees(allEmployeesData);
    return (
        <div className="form-group">
            <label className="form-label">Select Employee</label>
            <select 
                className="form-control custom-select" 
                value={selectedEmployee} 
                onChange={handleEmployeeChange}
            >
                {showAllInOption 
                    ? <option value="">All Employees</option> 
                    : <option value="">Select an Employee</option>
                }
                {sortedEmployees
                    .filter(employee => {
                        const role = (employee.role || '').toLowerCase();
                        const isActive = Number(employee.status) === 1;
                        return role !== 'admin' && role !== 'super_admin' && isActive;
                    })
                    .map((employee) => (
                        <option key={employee.id} value={employee.id}>
                            {employee.first_name} {employee.last_name}
                        </option>
                    ))}
            </select>
        </div>
    );
};


export default EmployeeSelector;