import React from 'react';
import InputField from '../../../common/formInputs/InputField';
import Button from '../../../common/formInputs/Button';

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
    editReportByAdmin,
    errors = {}
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
                                {/* <div className="form-group">
                                    <label className="form-label">Employee</label>
                                    <input type="text" className="form-control" name="example-disabled-input" placeholder="Disabled.." readOnly value={existingFullName} />
                                </div> */}
                                <InputField
                                    label="Employee"
                                    name="existingFullName"
                                    type="text"
                                    value={existingFullName}
                                    disabled={true}
                                    placeholder="Disabled.."
                                />
                            </div>
                            <div className="col-md-12">
                                {/* <div className="form-group">
                                    <label className="form-label">Activity Type</label>
                                    <input type="text" className="form-control" name="example-disabled-input" placeholder="Disabled.." value={existingActivityType} readOnly/>
                                </div> */}
                                <InputField
                                    label="Activity Type"
                                    name="existingActivityType"
                                    type="text"
                                    value={existingActivityType}
                                    disabled={true}
                                    placeholder="Disabled.."
                                />
                            </div>
                            <div className="col-md-12">
                                {/* <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        className="form-control"
                                        placeholder="Description"
                                        value={existingActivityDescription}
                                        rows="10"
                                        cols="50"
                                        onChange={handleEditActivityDescriptionChange}
                                    />
                                </div> */}
                                <InputField
                                    label="Description"
                                    name="existingActivityDescription"
                                    type="textarea"
                                    value={existingActivityDescription}
                                    onChange={handleEditActivityDescriptionChange}
                                    placeholder="Description"
                                    rows={10}
                                    error={errors.existingActivityDescription}
                                />
                            </div>
                            <div className="col-md-12">
                                {/* <div className="form-group">
                                    <label className="form-label">In Time</label>
                                    <input type="text" className="form-control" value={existingActivityInTime} onChange={handleEditActivityInTimeChange} />
                                </div> */}
                                <InputField
                                    label="In Time"
                                    name="existingActivityInTime"
                                    type="text"
                                    value={existingActivityInTime}
                                    onChange={handleEditActivityInTimeChange}
                                    error={errors.existingActivityInTime}
                                />
                            </div>
                            <div className="col-md-12">
                                {/* <div className="form-group">
                                    <label className="form-label">Out Time</label>
                                    <input type="text" className="form-control" value={existingActivityOutTime || ''} onChange={handleEditActivityOutTimeChange} />
                                </div> */}
                                <InputField
                                    label="Out Time"
                                    name="existingActivityOutTime"
                                    type="text"
                                    value={existingActivityOutTime || ''}
                                    onChange={handleEditActivityOutTimeChange}
                                    error={errors.existingActivityOutTime}
                                />
                            </div>
                            <div className="col-md-12">
                                {/* <div className="form-group">
                                    <label className="form-label">Status</label>
                                    <select className="form-control" value={existingActivitySatus} onChange={handleEditActivityStatusChange}>
                                        <option value="">Select Status</option>
                                        <option value="active">Active</option>
                                        <option value="completed">Completed</option>
                                        <option value="auto closed">Auto Closed</option>
                                    </select>
                                </div> */}
                                <InputField
                                    label="Status"
                                    name="existingActivitySatus"
                                    type="select"
                                    value={existingActivitySatus}
                                    onChange={handleEditActivityStatusChange}
                                    error={errors.existingActivitySatus}
                                    options={[
                                        { value: 'active', label: 'Active' },
                                        { value: 'completed', label: 'Completed' },
                                        { value: 'auto closed', label: 'Auto Closed' },
                                    ]}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <Button
                        label="Save Changes"
                        onClick={editReportByAdmin}
                        className="btn-primary"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditReportDetailsModal; 