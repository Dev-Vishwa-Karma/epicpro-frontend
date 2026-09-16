import React, { Component } from "react";
import api from "../../../../api/axios";
import Button from "../../../common/formInputs/Button";
import AlertMessages from "../../../common/AlertMessages";

class VerifyEmailCodeModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      verificationCode: "",
      loading: false,
      error: "",
      success: "",
      showSuccessAlert: false,
      showErrorAlert: false,
      codeError: false,
      codeErrorMessage: "",
    };
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.show && this.props.show) {
      this.setState({
        verificationCode: "",
        loading: false,
        error: "",
        success: "",
        showSuccessAlert: false,
        showErrorAlert: false,
        codeError: false,
        codeErrorMessage: "",
      });
    }
  }

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
      error: "",
      showErrorAlert: false,
      codeError: false,
    });
  };

  handleVerifySubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const { verificationCode } = this.state;

    if (!verificationCode || verificationCode.trim().length === 0) {
      this.setState({
        codeError: true,
        codeErrorMessage: "Please enter the 6-digit verification code.",
      });
      return;
    }

    this.setState({
      loading: true,
      error: "",
      showErrorAlert: false,
    });

    try {
      const formData = new FormData();
      formData.append("verification_code", verificationCode.trim());

      const response = await api.post("/get_employees.php?action=verify-email-code", formData);

      if (response.data && response.data.status === "success") {
        const msg = response.data.message || "Email address updated successfully! Logging out...";
        this.setState({
          success: msg,
          showSuccessAlert: true,
          loading: false,
        });

        localStorage.clear();
        setTimeout(() => {
          if (this.props.onClose) this.props.onClose();
          window.location.reload();
        }, 1500);
      } else {
        const errMsg = response.data?.message || "Invalid or expired verification code.";
        this.setState({
          error: errMsg,
          showErrorAlert: true,
          loading: false,
        });
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || "An error occurred during verification.";
      this.setState({
        error: errMsg,
        showErrorAlert: true,
        loading: false,
      });
    }
  };

  handleCancelRequest = async () => {
    this.setState({ loading: true });
    try {
      const response = await api.post("/get_employees.php?action=cancel-email-change");
      if (response.data && response.data.status === "success") {
        if (this.props.onClose) this.props.onClose();
      } else {
        this.setState({
          error: response.data?.message || "Failed to cancel email change request.",
          showErrorAlert: true,
          loading: false,
        });
      }
    } catch (err) {
      this.setState({
        error: "An error occurred while cancelling request.",
        showErrorAlert: true,
        loading: false,
      });
    }
  };

  render() {
    const { show, onClose, pendingRequest } = this.props;
    const {
      verificationCode,
      loading,
      error,
      success,
      showSuccessAlert,
      showErrorAlert,
      codeError,
      codeErrorMessage,
    } = this.state;

    if (!show) return null;

    const newEmail = pendingRequest?.new_email || "your new email address";

    return (
      <>
        <AlertMessages
          showSuccess={showSuccessAlert}
          successMessage={success}
          showError={showErrorAlert}
          errorMessage={error}
          setShowSuccess={(val) => this.setState({ showSuccessAlert: val })}
          setShowError={(val) => this.setState({ showErrorAlert: val })}
        />

        {/* Backdrop */}
        <div
          className="modal-backdrop fade show"
          style={{ zIndex: 1040 }}
          onClick={onClose}
        />

        {/* Modal */}
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ zIndex: 1050 }}
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content shadow-lg border-0">
              {/* Modal Header */}
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title text-white font-weight-bold">
                  <i className="fe fe-check-circle mr-2" /> Verify Email
                </h5>
                <button
                  type="button"
                  className="close text-white"
                  onClick={onClose}
                  aria-label="Close"
                  style={{ opacity: 0.9 }}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>

              {/* Modal Body */}
              <div className={`modal-body p-4 ${loading ? "dimmer active" : "dimmer"}`}>
                {loading && <div className="loader" />}
                <div className="dimmer-content">
                  <form onSubmit={this.handleVerifySubmit}>
                    <div className="alert alert-primary mb-4" role="alert">
                      <i className="fe fe-mail mr-2" />
                      Enter the 6-digit verification code sent to{" "}
                      <strong>{newEmail}</strong>.
                    </div>

                    {/* Verification Code Input */}
                    <div className="form-group mb-4">
                      <label className="form-label font-weight-semibold">
                        Verification Code <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control form-control-lg text-center font-weight-bold ${codeError ? "is-invalid" : ""
                          }`}
                        name="verificationCode"
                        maxLength="6"
                        value={verificationCode}
                        onChange={this.handleChange}
                        placeholder="123456"
                        disabled={loading}
                        style={{ fontSize: "1.5rem", letterSpacing: "8px" }}
                        autoFocus
                      />
                      {codeError && (
                        <div className="invalid-feedback d-block mt-1 text-center">
                          {codeErrorMessage}
                        </div>
                      )}
                    </div>

                    {/* Modal Footer */}
                    <div className="modal-footer px-0 pb-0 pt-3 bg-white border-top-0 d-flex justify-content-between">
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={this.handleCancelRequest}
                        disabled={loading}
                      >
                        Cancel Request
                      </button>

                      <div className="d-flex" style={{ gap: "8px" }}>
                        <Button
                          type="submit"
                          label="Verify"
                          className="btn-primary px-4"
                          disabled={loading}
                          loading={loading}
                        />
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default VerifyEmailCodeModal;
