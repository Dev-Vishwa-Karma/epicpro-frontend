import React from 'react';

const ViewReportModal = ({ 
    selectedModalReport, 
    formatDateTimeAMPM, 
    closeReportModal 
}) => {
    return (
        <div className="modal fade" id="viewpunchOutReportModal" tabIndex={-1} role="dialog" aria-labelledby="viewpunchOutReportModalLabel" aria-hidden="true" data-backdrop="static" data-keyboard="false">
            <div className="modal-dialog" role="dialog">
                <div className="modal-content">
                    <div className="modal-body">
                        {selectedModalReport && typeof selectedModalReport === 'object' && selectedModalReport.report != null ? (
                            <div className="row">
                                {window.user && window.user.role !== 'employee' && (
                                    <div className="col-md-12 mb-3">
                                        <strong>Employee Name:</strong> {selectedModalReport.full_name}
                                    </div>
                                )}
                                <div className="col-md-12 mb-4">
                                    <div
                                        className="multiline-text"
                                        dangerouslySetInnerHTML={{ __html: selectedModalReport?.report || '' }}
                                    />
                                </div>
                                <div className="col-md-12 mb-2">
                                    <strong>Start Time:</strong> {formatDateTimeAMPM(selectedModalReport.start_time)}
                                </div>
                                <div className="col-md-12 mb-2">
                                    <strong>End Time:</strong> {formatDateTimeAMPM(selectedModalReport.end_time)}
                                </div>
                                <div className="col-md-12 mb-2">
                                    <strong>Break Duration:</strong> {selectedModalReport.break_duration_in_minutes} Mins
                                </div>
                                <div className="col-md-12 mb-2">
                                    <strong>Working Hours:</strong> {selectedModalReport.todays_working_hours?.slice(0, 5)}
                                </div>
                                <div className="col-md-12 mb-2">
                                    <strong>Total Hours:</strong> {selectedModalReport.todays_total_hours?.slice(0, 5)}
                                </div>
                                {
                                    selectedModalReport.note !== null &&
                                    <div className="col-md-12 p-3 mb-2 alert alert-danger alert-dismissible fade show">
                                        <strong>Note:</strong> {selectedModalReport.note}
                                    </div>
                                }
                            </div>
                        ) : (
                            <p>No report data available.</p>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={closeReportModal}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewReportModal; 