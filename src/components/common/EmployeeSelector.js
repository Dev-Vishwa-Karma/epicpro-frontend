import React from 'react';
import {getSortedEmployees} from '../../utils'

const EmployeeSelector = ({ allEmployeesData, selectedEmployee, handleEmployeeChange, showAllInOption }) => {

const sortedEmployees = getSortedEmployees(allEmployeesData);
    return (
        <div className="form-group">
            <label className="form-label">Select Employee</label>
            <select 
                className="form-control" 
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
                        return role !== 'admin' && role !== 'super_admin';
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