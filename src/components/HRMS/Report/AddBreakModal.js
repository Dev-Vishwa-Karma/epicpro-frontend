import React from 'react';

const AddBreakModal = ({ 
    selectedEmployee,
    selectedStatus,
    punchOutReport,
    employeeData,
    addReportByAdminError,
    handleEmployeeChange,
    handleStatusChange,
    handleReportChange,
    addReportByAdmin
}) => {
    return (
        <div className="modal fade" id="addReportModal" tabIndex={-1} role="dialog" aria-labelledby="addReportModalLabel" aria-hidden="true" data-backdrop="static" data-keyboard="false">
            <div className="modal-dialog" role="dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="addReportModalLabel">Register Employee Punch-In/Out</h5>
                        <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>
                    </div>
                    <div className="modal-body">
                        {/* Display activity error message outside the modal */}
                        {addReportByAdminError && (
                            <div className="alert alert-danger mb-0">{addReportByAdminError}</div>
                        )}
                        <div className="row clearfix">
                            <div className="col-md-12">
                                <div className="form-group">
                                    <select className="form-control" value={selectedEmployee} onChange={handleEmployeeChange}>
                                        <option value="">Select Employee</option>
                                        {employeeData.length > 0 ? (
                                            employeeData.map((employee, index) => (
                                                <option key={index} value={employee.id}>
                                                    {`${employee.first_name} ${employee.last_name}`}
                                                </option>
                                            ))
                                        ) : (
                                            <option value="">No Employees Available</option>
                                        )}
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-12">
                                <div className="form-group">
                                    <select className="form-control" value={selectedStatus} onChange={handleStatusChange}>
                                        <option value="">Select Status</option>
                                        <option value="active">Punch In</option>
                                        <option value="completed">Punch Out</option>
                                    </select>
                                </div>
                            </div>
                            {selectedStatus === "completed" && (
                                <div className="col-md-12">
                                    <div className="form-group">
                                        <textarea
                                            className="form-control"
                                            placeholder="Report"
                                            value={punchOutReport || ''}
                                            onChange={handleReportChange}
                                            rows="30"
                                            cols="50"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-primary" onClick={addReportByAdmin}>Save changes</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddBreakModal; 