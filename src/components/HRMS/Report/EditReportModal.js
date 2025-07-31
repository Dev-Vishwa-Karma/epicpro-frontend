import React from 'react';
import DatePicker from 'react-datepicker';
import TextEditor from '../../common/TextEditor';

const EditReportModal = ({ 
    selectedModalReport,
    start_time,
    end_time,
    break_duration_in_minutes,
    todays_working_hours,
    todays_total_hours,
    report,
    error,
    getTimeAsDate,
    handleChange,
    handleNotesChange,
    closeReportModal,
    updateReport,
    editNotes
}) => {
    return (
        <div className="modal fade" id="editpunchOutReportModal" tabIndex={-1} role="dialog" aria-labelledby="editpunchOutReportModalLabel" aria-hidden="true" data-backdrop="static" data-keyboard="false">
            <div className="modal-dialog modal-xl" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="editpunchoutReportModalLabel">Update Report</h5>
                        <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={closeReportModal}>
                            <span aria-hidden="true">×</span>
                        </button>
                    </div>
                    {/* Edit Modal */}
                    <div className="modal-body">
                        <div className="row">
                            {/* Left side - Report TextArea */}
                            <div className="col-md-6">
                                <div className="form-group">
                                    <TextEditor
                                        name="report"
                                        value={report || ''}
                                        onChange={(value) => handleChange('report', value)}
                                        error={error?.report}
                                    />
                                </div>
                            </div>

                            {/* Right side - Form fields */}
                            <div className="col-md-6">
                                <div className="row">
                                    {/* Start time */}
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="event_name">Start time</label>
                                            <DatePicker
                                                selected={getTimeAsDate(start_time)}
                                                onChange={(time) => handleChange('start_time', time)}
                                                showTimeSelect
                                                showTimeSelectOnly
                                                timeIntervals={15}
                                                timeCaption="Start time"
                                                dateFormat="h:mm aa"
                                                placeholderText="Select time"
                                                className={`form-control ${error?.start_time ? "is-invalid" : ""}`}
                                                readOnly
                                            />
                                            {error?.start_time && (
                                                <div className="invalid-feedback d-block">{error.start_time}</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Break duration */}
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="break_duration_in_minutes">Break duration in minutes</label>
                                            <input
                                                readOnly
                                                disabled
                                                type="number"
                                                value={break_duration_in_minutes || 0}
                                                onChange={(e) => handleChange('break_duration_in_minutes', e.target.value)}
                                            />
                                            {error?.break_duration_in_minutes && (
                                                <div className="invalid-feedback">{error.break_duration_in_minutes}</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* End time */}
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="event_name">End time</label>
                                            <DatePicker
                                                selected={getTimeAsDate(end_time)}
                                                onChange={(time) => handleChange('end_time', time)}
                                                showTimeSelect
                                                showTimeSelectOnly
                                                timeIntervals={15}
                                                timeCaption="End time"
                                                dateFormat="h:mm aa"
                                                placeholderText="Select End time"
                                                className={`form-control ${error?.end_time ? "is-invalid" : ""}`}
                                                disabled={window.user.role !== 'admin' && window.user.role !== 'super_admin'}
                                            />
                                            {error?.end_time && (
                                                <div className="invalid-feedback d-block">{error.end_time}</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Today's working hours */}
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="todays_working_hours">Today's working hours</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="todays_working_hours"
                                                id="todays_working_hours"
                                                placeholder="Today's working hours"
                                                value={todays_working_hours?.slice(0, 5) || ''}
                                                readOnly
                                            />
                                        </div>
                                    </div>

                                    {/* Today's total hours */}
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="todays_total_hours">Today's total hours</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="todays_total_hours"
                                                id="todays_total_hours"
                                                placeholder="Today's total hours"
                                                value={todays_total_hours?.slice(0, 5) || ''}
                                                readOnly
                                            />
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        {(window.user.role === 'admin' || window.user.role === 'super_admin') && (
                                            <div className="form-group">
                                                <label className="form-label"><strong>Note</strong></label>
                                                <textarea
                                                    className="form-control"
                                                    rows="3"
                                                    placeholder="Add note for this update..."
                                                    name="note"
                                                    id="note"
                                                    value={editNotes || ''}
                                                    onChange={handleNotesChange}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={closeReportModal}>Close</button>
                        <button type="button" className="btn btn-primary" onClick={updateReport}>Update Report</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditReportModal; 