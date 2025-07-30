import React, { Component } from 'react';
import NoDataRow from '../../common/NoDataRow';
import Pagination from '../../common/Pagination';

class ReportTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentPageReports: 1,
            dataPerPage: 10,
        };
    }

    componentDidMount() {
        // Initialize pagination state
        this.setState({
            currentPageReports: 1
        });
    }

    // Handle Pagination of reports listing
    handlePageChange = (newPage) => {
        const totalPages = Math.ceil(this.props.reports.length / this.state.dataPerPage);
        if (newPage >= 1 && newPage <= totalPages) {
            this.setState({ currentPageReports: newPage });
        }
    };

    // Get the todays date and based on this update the edit report button
    isToday = (dateString) => {
        const inputDate = new Date(dateString);
        const today = new Date();
    
        return (
            inputDate.getFullYear() === today.getFullYear() &&
            inputDate.getMonth() === today.getMonth() &&
            inputDate.getDate() === today.getDate()
        );
    };

    // Format date and time
    formatDateTimeAMPM = (timeString) => {
        if (!timeString || typeof timeString !== 'string') return '';

        // If input is in format "YYYY-MM-DD HH:mm" or "YYYY-MM-DD HH:mm:ss"
        if (timeString.includes(' ')) {
            const parts = timeString.split(' ');
            timeString = parts[1]; // Extract the time part
        }

        const [hours, minutes, seconds = '00'] = timeString.split(':');
        const now = new Date();

        now.setHours(parseInt(hours, 10));
        now.setMinutes(parseInt(minutes, 10));
        now.setSeconds(parseInt(seconds, 10));
        now.setMilliseconds(0);

        if (isNaN(now.getTime())) {
            console.warn("Invalid time format:", timeString);
            return '';
        }

        return now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    render() {
        const {
            reports,
            loading,
            onViewReport,
            onEditReport,
            onDeleteReport,
            userRole
        } = this.props;

        const { currentPageReports, dataPerPage } = this.state;

        // Handle empty reports data safely
        const reportList = (reports || []).length > 0 ? reports : [];

        // Pagination Logic for Reports
        const indexOfLastReport = currentPageReports * dataPerPage;
        const indexOfFirstReport = indexOfLastReport - dataPerPage;
        const currentReports = reportList.slice(indexOfFirstReport, indexOfLastReport);
        const totalPagesReports = Math.ceil(reportList.length / dataPerPage);

        return (
            <>
                <div className="card-body">
                    {loading ? (
                        <div className="dimmer active p-3">
                            <div className="loader" />
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover table-striped table-vcenter mb-0">
                                <thead>
                                    <tr>
                                        {userRole !== 'employee' && (
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
                                                {userRole !== 'employee' && (
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
                                                <td>{this.formatDateTimeAMPM(report.start_time)}</td>
                                                <td>{report.break_duration_in_minutes} Mins</td>
                                                <td>{this.formatDateTimeAMPM(report.end_time)}</td>
                                                <td>{report.todays_working_hours?.slice(0, 5)}</td>
                                                <td>{report.todays_total_hours?.slice(0, 5)}</td>
                                                <td width="15%">
                                                    <button 
                                                        type="button" 
                                                        className="btn btn-icon btn-sm" 
                                                        title="View" 
                                                        data-toggle="modal" 
                                                        data-target="#viewpunchOutReportModal" 
                                                        onClick={() => onViewReport && onViewReport(report)}
                                                    >
                                                        <i className="icon-eye text-danger"></i>
                                                    </button>

                                                    {/* Admin/Super Admin can edit any report */}
                                                    {userRole === 'admin' || userRole === 'super_admin' ? (
                                                        <button
                                                            type="button"
                                                            className="btn btn-icon btn-sm"
                                                            title="Edit"
                                                            data-toggle="modal"
                                                            data-target="#editpunchOutReportModal"
                                                            onClick={() => onEditReport && onEditReport(report)}
                                                        >
                                                            <i className="icon-pencil text-primary"></i>
                                                        </button>
                                                    ) : (
                                                        /* Employee can edit only today's report */
                                                        userRole === 'employee' && this.isToday(report.created_at) && (
                                                            <button 
                                                                type="button" 
                                                                className="btn btn-icon btn-sm"
                                                                title="Edit"
                                                                data-toggle="modal" 
                                                                data-target="#editpunchOutReportModal"
                                                                onClick={() => onEditReport && onEditReport(report)}
                                                            >
                                                                <i className="icon-pencil text-danger"></i>
                                                            </button>
                                                        )
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <NoDataRow colSpan={userRole !== 'employee' ? 8 : 7} message="No reports available" />
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Only show pagination if there are reports */}
                {totalPagesReports > 1 && (
                    <div className="card-footer">
                        <Pagination
                            currentPage={currentPageReports}
                            totalPages={totalPagesReports}
                            onPageChange={this.handlePageChange}
                        />
                    </div>
                )}
            </>
        );
    }
}

export default ReportTable;