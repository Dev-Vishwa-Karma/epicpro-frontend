import React from 'react';

const EditReportDetailsModal = ({ 
    existingFullName,
    existingActivityType,
    existingActivityDescription,
    existingActivityInTime,
    existingActivityOutTime,
    existingActivitySatus,
    editReportByAdminError,
    handleEditActivityDescriptionChange,
    handleEditActivityInTimeChange,
    handleEditActivityOutTimeChange,
    handleEditActivityStatusChange,
    editReportByAdmin
}) => {
    return (
        <div className="modal fade" id="editReportModal" tabIndex={-1} role="dialog" aria-labelledby="editReportModalLabel" aria-hidden="true" data-backdrop="static" data-keyboard="false">
            <div className="modal-dialog" role="dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="editReportModal">Edit Report</h5>
                        <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>
                    </div>
                    {/* Display activity error message outside the modal */}
                    {editReportByAdminError && (
                        <div className="alert alert-danger mb-0">{editReportByAdminError}</div>
                    )}
                    <div className="modal-body">
                        <div className="row clearfix">
                            <div className="col-md-12">
                                <div className="form-group">
                                    <label className="form-label">Employee</label>
                                    <input type="text" className="form-control" name="example-disabled-input" placeholder="Disabled.." readOnly value={existingFullName} />
                                </div>
                            </div>
                            <div className="col-md-12">
                                <div className="form-group">
                                    <label className="form-label">Activity Type</label>
                                    <input type="text" className="form-control" name="example-disabled-input" placeholder="Disabled.." value={existingActivityType} readOnly/>
                                </div>
                            </div>
                            <div className="col-md-12">
                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        className="form-control"
                                        placeholder="Description"
                                        value={existingActivityDescription}
                                        rows="10"
                                        cols="50"
                                        onChange={handleEditActivityDescriptionChange}
                                    />
                                </div>
                            </div>
                            <div className="col-md-12">
                                <div className="form-group">
                                    <label className="form-label">In Time</label>
                                    <input type="text" className="form-control" value={existingActivityInTime} onChange={handleEditActivityInTimeChange} />
                                </div>
                            </div>
                            <div className="col-md-12">
                                <div className="form-group">
                                    <label className="form-label">Out Time</label>
                                    <input type="text" className="form-control" value={existingActivityOutTime || ''} onChange={handleEditActivityOutTimeChange} />
                                </div>
                            </div>
                            <div className="col-md-12">
                                <div className="form-group">
                                    <label className="form-label">Status</label>
                                    <select className="form-control" value={existingActivitySatus} onChange={handleEditActivityStatusChange}>
                                        <option value="">Select Status</option>
                                        <option value="active">Active</option>
                                        <option value="completed">Completed</option>
                                        <option value="auto closed">Auto Closed</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-primary" onClick={editReportByAdmin}>Save Changes</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditReportDetailsModal; 