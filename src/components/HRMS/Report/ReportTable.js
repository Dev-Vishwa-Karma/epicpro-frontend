import React from 'react';
import NoDataRow from '../../common/NoDataRow';
import TableSkeleton from '../../common/skeletons/TableSkeleton';

const ReportTable = ({ 
    currentReports, 
    loading, 
    formatDateTimeAMPM, 
    isToday, 
    openReportModal 
}) => {
    return (
        <div className="card-body">
            {loading ? (
                <div className="dimmer active p-3">
                    <TableSkeleton columns={8} rows={5} />
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-hover table-striped table-vcenter mb-0">
                        <thead>
                            <tr>
                                {window.user && window.user.role !== 'employee' && (
                                    <th>Employee Name</th>
                                )}
                                <th>Date</th>
                                <th>Start Time</th>
                                <th>Break Duration</th>
                                <th>End Time</th>
                                <th>Working Hours</th>
                                <th>Total Hours</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentReports.length > 0 ? (
                                currentReports.map((report, index) => (
                                    <tr key={index}>
                                        {window.user && window.user.role !== 'employee' && (
                                            <td>{report.full_name}</td>
                                        )}
                                        <td>
                                            {report.created_at && !isNaN(new Date(report.created_at).getTime())
                                                ? new Intl.DateTimeFormat('en-US', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                }).format(new Date(report.created_at))
                                                : 'N/A'}
                                        </td>
                                        <td>{formatDateTimeAMPM(report.start_time)}</td>
                                        <td>{report.break_duration_in_minutes} Mins</td>
                                        <td>{formatDateTimeAMPM(report.end_time)}</td>
                                        <td>{report.todays_working_hours?.slice(0, 5)}</td>
                                        <td>{report.todays_total_hours?.slice(0, 5)}</td>
                                        <td width="15%">
                                            <button
                                                type="button"
                                                className="btn btn-icon btn-sm"
                                                title="View"
                                                data-toggle="modal"
                                                data-target="#viewpunchOutReportModal"
                                                onClick={() => openReportModal(report)}
                                            >
                                                <i className="icon-eye text-danger"></i>
                                            </button>

                                            {/* Admin/Super Admin can edit any report */}
                                            {window.user && (window.user.role === 'admin' || window.user.role === 'super_admin') && (
                                                <button
                                                    type="button"
                                                    className="btn btn-icon btn-sm"
                                                    title="Edit"
                                                    data-toggle="modal"
                                                    data-target="#editpunchOutReportModal"
                                                    onClick={() => openReportModal(report)}
                                                >
                                                    <i className="icon-pencil text-primary"></i>
                                                </button>
                                            )}

                                            {/* Employee can edit only today's report */}
                                            {window.user && window.user.role === 'employee' && isToday(report.created_at) && (
                                                <button
                                                    type="button"
                                                    className="btn btn-icon btn-sm"
                                                    title="Edit"
                                                    data-toggle="modal"
                                                    data-target="#editpunchOutReportModal"
                                                    onClick={() => openReportModal(report)}
                                                >
                                                    <i className="icon-pencil text-danger"></i>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <NoDataRow colSpan={7} message="No reports available" />
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ReportTable; 