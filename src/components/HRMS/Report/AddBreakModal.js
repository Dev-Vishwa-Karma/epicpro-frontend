import React from 'react';
import EmployeeSelector from '../../common/EmployeeSelector'
import InputField from '../../common/formInputs/InputField';

const AddBreakModal = ({ 
    selectedEmployee,
    selectedStatus,
    punchOutReport,
    employeeData,
    addReportByAdminError,
    handleEmployeeChange,
    handleStatusChange,
    handleReportChange,
    addReportByAdmin,
    errors={}
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
                                    <EmployeeSelector
                                        allEmployeesData={employeeData}
                                        selectedEmployee={selectedEmployee}
                                        handleEmployeeChange={handleEmployeeChange}
                                        showAllInOption={false}
                                    />
                                    {errors.selectedEmployee && (
                                        <div className="invalid-feedback d-block">{errors.selectedEmployee}</div>
                                    )}
                                </div>
                            </div>
                            <div className="col-md-12">
                                <InputField
                                    label="Select Status"
                                    name="selectedStatus"
                                    type="select"
                                    value={selectedStatus}
                                    onChange={handleStatusChange}
                                    error={errors.selectedStatus}
                                    options={[
                                        { value: 'active', label: 'Punch In' },
                                        { value: 'completed', label: 'Punch Out' },
                                    ]}
                                />
                            </div>
                            {selectedStatus === "completed" && (
                                <div className="col-md-12">
                                    <InputField
                                        label="Report"
                                        name="punchOutReport"
                                        type="textarea"
                                        value={punchOutReport || ''}
                                        onChange={handleReportChange}
                                        error={errors.punchOutReport}
                                        placeholder="Report"
                                        rows={30}
                                    />
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