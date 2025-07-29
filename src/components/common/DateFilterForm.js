// DateFilterForm.js
import React from 'react';
import DatePicker from 'react-datepicker';
import EmployeeSelector from './EmployeeSelector';

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
    maxDate
}) => {
    return (
        <div className="row">
            <div className="col-md-3">
                <div className="form-group">
                    <label className="form-label">From Date</label>
                    <DatePicker
                        selected={fromDate ? new Date(fromDate) : null}
                        onChange={(date) => handleDateChange(date, 'fromDate')}
                        className="form-control"
                        dateFormat="yyyy-MM-dd"
                        placeholderText="From Date"
                        maxDate={maxDate}
                    />
                </div>
            </div>

            <div className="col-md-3">
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
                    />
                </div>
            </div>

            {window.user && (window.user.role === 'admin' || window.user.role === 'super_admin') && (
                <EmployeeSelector
                    allEmployeesData={allEmployeesData}
                    selectedEmployee={selectedEmployee}
                    handleEmployeeChange={handleEmployeeChange}
                />
            )}

            <div className="col-md-3">
                <div className="form-group">
                    <label className="form-label">&nbsp;</label>
                    <button
                        type="button"
                        className="btn btn-primary btn-block"
                        onClick={handleApplyFilters}
                        disabled={ButtonLoading}
                    >
                        {ButtonLoading ? (
                            <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                        ) : null}
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DateFilterForm;
