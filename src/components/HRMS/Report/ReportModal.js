import React, { Component } from 'react';
import { connect } from 'react-redux';

class ReportModal extends Component {
	componentDidMount() {
		if (this.props.show) {
			document.body.style.overflow = 'hidden';
		}
	}

	componentDidUpdate(prevProps) {
		if (this.props.show && !prevProps.show) {
			document.body.style.overflow = 'hidden';
		} else if (!this.props.show && prevProps.show) {
			document.body.style.overflow = '';
		}
	}

	componentWillUnmount() {
		document.body.style.overflow = '';
	}

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
					backgroundColor: 'rgba(0, 0, 0, 0.5)'
				}}
			>
				<div
					className="modal-dialog modal-dialog-centered modal-lg"
					role="document"
				>
					<div
						className="modal-content"
						style={{
							maxHeight: '90vh',
							display: 'flex',
							flexDirection: 'column'
						}}
					>
						<div className="modal-header">
							<h5 className="modal-title">Daily Report</h5>
							<button type="button" className="close" onClick={onClose}>
								<span>&times;</span>
							</button>
						</div>

						<div
							className="modal-body"
							style={{
								overflowY: 'auto',
								flex: '1 1 auto'
							}}
						>
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
								{report.note && (
								<div className="col-md-12 mb-2" style={{backgroundColor:'#fecaca', padding: '15px', borderRadius:'5px', color: '#8B3946'}}>
                                        <strong>Note:</strong> {report.note}
                                </div>
								)}
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

const mapStateToProps = state => ({});
const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(ReportModal);
