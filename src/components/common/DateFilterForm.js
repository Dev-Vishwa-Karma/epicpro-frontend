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
    return (
        <>
            <div className={`col-md-${col}`}>
                <div className="form-group">
                    <label className="form-label">From Date</label>
                    <DatePicker
                        selected={fromDate ? new Date(fromDate) : null}
                        onChange={(date) => handleDateChange(date, 'fromDate')}
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
                        onChange={(date) => handleDateChange(date, 'toDate')}
                        className="form-control"
                        dateFormat="yyyy-MM-dd"
                        placeholderText="To Date"
                        minDate={minDate}
                        maxDate={maxDate}
                        wrapperClassName=""
                    />
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
                    onClick={handleApplyFilters}
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
