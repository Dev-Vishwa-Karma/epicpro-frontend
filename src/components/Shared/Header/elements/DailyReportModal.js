import React, { Component } from "react";
import TextEditor from "../../../common/TextEditor";
import Button from "../../../common/formInputs/Button";
class DailyReportModal extends Component {
  render() {
    const {
      show,
      onClose,
      punchErrorModel,
      report,
      start_time,                                                   
      end_time,
      breakDuration,
      todays_working_hours,
      todays_total_hours,
      error,
      isReportSubmitting,
      isReportSubmitted,
      handleChange,
      handleSubmit,
    } = this.props;

    if (!show) return null; // don't render if modal is closed

    return (
      <div
        className="modal fade show d-block"
        id="addReportModal"
        tabIndex="-1"
        role="dialog"
      >
        <div
          className="modal-dialog modal-dialog-scrollable modal-xl"
          role="document"
        >
          <div className="modal-content">
            {/* Header */}
            <div className="modal-header">
              <h5 className="modal-title" id="addReportModalLabel">
                Daily Report
              </h5>
              <button type="button" className="close" onClick={onClose}>
                <span aria-hidden="true">×</span>
              </button>
            </div>

            {/* Body */}
            <div className="modal-body">
              {/* Error Message */}
              {punchErrorModel && (
                <div className="alert alert-danger mb-2">
                  {punchErrorModel}
                </div>
              )}

              <div className="row">
                {/* Left side: Report TextArea */}
                <div className="col-md-6">
                  <div className="form-group">
                    <TextEditor
                      value={report}
                      onChange={(value) => handleChange("report", value)}
                      error={error.report}
                    />
                  </div>
                </div>

                {/* Right side: Form Fields */}
                <div className="col-md-6">
                  <div className="row">
                    {/* Start Time */}
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">Start time</label>
                        <input
                          type="text"
                          className="form-control"
                          value={start_time || ""}
                          disabled
                        />
                      </div>
                    </div>

                    {/* Break Duration */}
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">
                          Break duration (minutes)
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={breakDuration || "00"}
                          disabled
                        />
                        {error.break_duration_in_minutes && (
                          <div className="invalid-feedback">
                            {error.break_duration_in_minutes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* End Time */}
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">End time</label>
                        <input
                          type="text"
                          className="form-control"
                          value={end_time || ""}
                          disabled
                        />
                      </div>
                    </div>

                    {/* Today's Working Hours */}
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">
                          Today's working hours
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={todays_working_hours}
                          disabled
                        />
                      </div>
                    </div>

                    {/* Today's Total Hours */}
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">
                          Today's total hours
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={todays_total_hours}
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <Button
                label="Submit"
                onClick={handleSubmit}
                disabled={isReportSubmitting || isReportSubmitted}
                className="btn-primary"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default DailyReportModal;
