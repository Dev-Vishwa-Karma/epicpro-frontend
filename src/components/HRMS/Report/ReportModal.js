import React, { Component } from 'react';
import { connect } from 'react-redux';

class ReportModal extends Component {
	formatDateTimeAMPM = (timeString) => {
		if (!timeString || typeof timeString !== 'string') return '';

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

		if (isNaN(now.getTime())) return '';

		return now.toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit',
			hour12: true
		});
	};

	render() {
		const { show, report, onClose, userRole } = this.props;

		if (!show || !report) return null;

		return (
			<div
				className="modal fade show d-block"
				tabIndex="-1"
				role="dialog"
				style={{
					backgroundColor: 'rgba(0, 0, 0, 0.5)',
					position: 'fixed',
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					zIndex: 1050
				}}
			>
				<div className="modal-dialog modal-dialog-centered" role="dialog">
					<div className="modal-content">
						<div className="modal-header">
							<h5 className="modal-title">Daily Report</h5>
							<button type="button" className="close" onClick={onClose}>
								<span>&times;</span>
							</button>
						</div>
						<div className="modal-body">
							<div className="row">
								{userRole !== 'employee' && (
									<div className="col-md-12 mb-3">
										<strong>Employee Name:</strong> {report.full_name}
									</div>
								)}
                                <div className="col-md-12 mb-2">
									<div className="multiline-text">
										<strong>Description</strong> <br />
										{report.report}
									</div>
								</div>
								<div className="col-md-12 mb-2">
									<strong>Start Time:</strong> {this.formatDateTimeAMPM(report.start_time)}
								</div>
								<div className="col-md-12 mb-2">
									<strong>End Time:</strong> {this.formatDateTimeAMPM(report.end_time)}
								</div>
								<div className="col-md-12 mb-2">
									<strong>Break Duration:</strong> {report.break_duration_in_minutes} Mins
								</div>
								<div className="col-md-12 mb-2">
									<strong>Working Hours:</strong> {report.todays_working_hours?.slice(0, 5)}
								</div>
								<div className="col-md-12 mb-2">
									<strong>Total Hours:</strong> {report.todays_total_hours?.slice(0, 5)}
								</div>
							</div>
						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-secondary" onClick={onClose}>
								Close
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

// If needed for Redux:
const mapStateToProps = state => ({});
const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(ReportModal);