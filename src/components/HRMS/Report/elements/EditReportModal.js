import React from 'react';
import DatePicker from 'react-datepicker';
import TextEditor from '../../../common/TextEditor';
import InputField from '../../../common/formInputs/InputField'
import { getTimeAsDate } from '../../../../utils';

const EditReportModal = ({ 
    selectedModalReport,
    start_time,
    end_time,
    break_duration_in_minutes,
    todays_working_hours,
    todays_total_hours,
    report,
    error,
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
                                        <InputField
                                            label="Break duration in minutes"
                                            name="break_duration_in_minutes"
                                            type="number"
                                            value={break_duration_in_minutes || 0}
                                            onChange={(e) => handleChange('break_duration_in_minutes', e.target.value)}
                                            error={error?.break_duration_in_minutes}
                                            disabled={true}
                                        />
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
                                        <InputField
                                            label="Today's working hours"
                                            name="todays_working_hours"
                                            type="text"
                                            value={todays_working_hours?.slice(0, 5) || ''}
                                            placeholder="Today's working hours"
                                            disabled={true}
                                        />
                                    </div>

                                    {/* Today's total hours */}
                                    <div className="col-md-6">
                                        <InputField
                                            label="Today's total hours"
                                            name="todays_total_hours"
                                            type="text"
                                            value={todays_total_hours?.slice(0, 5) || ''}
                                            placeholder="Today's total hours"
                                            disabled={true}
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        {(window.user.role === 'admin' || window.user.role === 'super_admin') && (
                                            <InputField
                                                label={<strong>Note</strong>}
                                                name="note"
                                                type="textarea"
                                                value={editNotes || ''}
                                                onChange={handleNotesChange}
                                                placeholder="Add note for this update..."
                                                rows={3}
                                            />
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