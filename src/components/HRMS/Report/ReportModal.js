import React, { Component } from 'react';
import { connect } from 'react-redux';
import { formatDateTimeAMPM } from '../../../utils';
import Button from '../../common/formInputs/Button';

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
									<div
										className="multiline-text"
										dangerouslySetInnerHTML={{ __html: `<strong>Description</strong><br />${report.report || ''}` }}
									/>
								</div>
								<div className="col-md-12 mb-2">
									<strong>Start Time:</strong> {formatDateTimeAMPM(report.start_time)}
								</div>
								<div className="col-md-12 mb-2">
									<strong>End Time:</strong> {formatDateTimeAMPM(report.end_time)}
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
								{report.note && report.note !== null && report.note !== undefined && report.note.toString().trim() !== '' && (
								<div className="col-md-12 mb-2" style={{backgroundColor:'#fecaca', padding: '15px', borderRadius:'5px', color: '#8B3946'}}>
                                        <strong>Note:</strong> {report.note}
                                </div>
								)}
							</div>
						</div>

						<div className="modal-footer">
							<Button
							label="Close"
							onClick={onClose}
							className="btn-secondary"
							/>
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
