// DateFilterForm.js
import React from 'react';
import DatePicker from 'react-datepicker';
import EmployeeSelector from './EmployeeSelector';
import Button from './formInputs/Button';

const DateFilterForm = ({
    fromDate,
    toDate,
    selectedEmployee,
    allEmployeesData,
    ButtonLoading,
    handleDateChange,
    handleEmployeeChange,
    handleApplyFilters,
    minDate,
    maxDate,
    col
}) => {
    // validation function
    const validateAndApply = () => {
        if (fromDate && toDate) {
            const from = new Date(fromDate);
            const to = new Date(toDate);
            if (to < from) {
                const errorDiv = document.getElementById('dateError');
                if (errorDiv) {
                    errorDiv.textContent = 'To Date cannot be less than From Date';
                    errorDiv.style.display = 'block';
                }
                return;
            }
        }
        // Clear error and apply filters
        const errorDiv = document.getElementById('dateError');
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
        handleApplyFilters();
    };

    return (
        <>
            <div className={`col-md-${col}`}>
                <div className="form-group">
                    <label className="form-label">From Date</label>
                    <DatePicker
                        selected={fromDate ? new Date(fromDate) : null}
                        onChange={(date) => { handleDateChange(date, 'fromDate'); }}
                        className="form-control"
                        dateFormat="yyyy-MM-dd"
                        placeholderText="From Date"
                        maxDate={maxDate}
                        wrapperClassName=""
                    />
                </div>
            </div>

            <div className={`col-md-${col}`}>
                <div className="form-group">
                    <label className="form-label">To Date</label>
                    <DatePicker
                        selected={toDate ? new Date(toDate) : null}
                        onChange={(date) => { handleDateChange(date, 'toDate'); }}
                        className="form-control"
                        dateFormat="yyyy-MM-dd"
                        placeholderText="To Date"
                        minDate={fromDate ? new Date(fromDate) : minDate}
                        maxDate={maxDate}
                        wrapperClassName=""
                    />
                    <div id="dateError" className="invalid-feedback d-block" style={{display: 'none'}}></div>
                </div>
            </div>

            {window.user && (window.user.role === 'admin' || window.user.role === 'super_admin') && allEmployeesData && (
                <div className={`col-md-${col}`}>
                    <EmployeeSelector
                        allEmployeesData={allEmployeesData}
                        selectedEmployee={selectedEmployee}
                        handleEmployeeChange={handleEmployeeChange}
                        showAllInOption={true}
                    />
                </div>
            )}

            <div className={`col-md-${col}`}>
                <div className="form-group">
                    <label className="form-label">&nbsp;</label>
                    <Button
                    label="Apply"
                    onClick={validateAndApply}
                    className="btn-primary btn-block"
                    disabled={ButtonLoading}
                    loading={ButtonLoading}
                    />
                </div>
            </div>
        </>
    );
};

export default DateFilterForm;
