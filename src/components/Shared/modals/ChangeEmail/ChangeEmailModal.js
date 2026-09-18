import React, { Component } from "react";
import api from "../../../../api/axios";
import Button from "../../../common/formInputs/Button";
import AlertMessages from "../../../common/AlertMessages";
import "../ChangePassword/ChangePasswordModal.css";

class ChangeEmailModal extends Component {
  constructor(props) {
    super(props);
    this.timerInterval = null;
    this.state = {
      newEmail: "",
      password: "",
      showPassword: false,
      verificationCode: "",
      isLocked: false,
      showVerification: false,
      resendTimer: 60,
      isResending: false,
      loading: false,
      cancelling: false,
      error: "",
      success: "",
      showSuccessAlert: false,
      showErrorAlert: false,
      emailError: false,
      emailErrorMessage: "",
      passwordError: false,
      passwordErrorMessage: "",
      codeError: false,
      codeErrorMessage: "",
    };
  }

  componentDidMount() { }

  componentDidUpdate(prevProps) {
    if ((!prevProps.show && this.props.show) || (prevProps.show && !this.props.show)) {
      this.resetState();
    }
  }

  handleClose = () => {
    this.resetState();
    if (this.props.onClose) {
      this.props.onClose();
    }
  };

  componentWillUnmount() {
    this.clearResendTimer();
  }

  clearResendTimer = () => {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  };

  startResendTimer = (seconds = 60) => {
    this.clearResendTimer();
    this.setState({ resendTimer: seconds }, () => {
      this.timerInterval = setInterval(() => {
        this.setState((prevState) => {
          if (prevState.resendTimer <= 1) {
            this.clearResendTimer();
            return { resendTimer: 0 };
          }
          return { resendTimer: prevState.resendTimer - 1 };
        });
      }, 1000);
    });
  };

  resetState = () => {
    this.clearResendTimer();
    this.setState({
      newEmail: "",
      password: "",
      showPassword: false,
      verificationCode: "",
      isLocked: false,
      showVerification: false,
      resendTimer: 60,
      isResending: false,
      loading: false,
      cancelling: false,
      error: "",
      success: "",
      showSuccessAlert: false,
      showErrorAlert: false,
      emailError: false,
      emailErrorMessage: "",
      passwordError: false,
      passwordErrorMessage: "",
      codeError: false,
      codeErrorMessage: "",
    });
  };



  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
      error: "",
      showErrorAlert: false,
      emailError: false,
      passwordError: false,
    });
  };

  handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    this.setState({
      verificationCode: value,
      error: "",
      showErrorAlert: false,
      codeError: false,
    });
  };

  togglePasswordVisibility = () => {
    this.setState((prevState) => ({
      showPassword: !prevState.showPassword,
    }));
  };

  handleRequestSubmit = async (e, isResend = false) => {
    if (e && e.preventDefault) e.preventDefault();
    const { newEmail, password } = this.state;

    let emailError = false;
    let emailErrorMessage = "";
    let passwordError = false;
    let passwordErrorMessage = "";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newEmail || !newEmail.trim()) {
      emailError = true;
      emailErrorMessage = "New email address is required.";
    } else if (!emailRegex.test(newEmail.trim())) {
      emailError = true;
      emailErrorMessage = "Please enter a valid email address.";
    }

    if (!password) {
      passwordError = true;
      passwordErrorMessage = "Current password is required.";
    }

    if (emailError || passwordError) {
      this.setState({
        emailError,
        emailErrorMessage,
        passwordError,
        passwordErrorMessage,
      });
      return;
    }

    this.setState({
      isResending: isResend,
      loading: !isResend,
      error: "",
      showErrorAlert: false,
    });

    try {
      const formData = new FormData();
      formData.append("new_email", newEmail.trim());
      formData.append("password", password);
      formData.append("is_resend", isResend);

      const response = await api.post("/get_employees.php?action=change-email-request", formData);

      if (response.data && response.data.status === "success") {
        const msg =
          response.data.message ||
          "Verification code sent to your new email address. Please verify to complete email change.";
        this.setState({
          success: msg,
          showSuccessAlert: true,
          isResending: false,
          loading: false,
          isLocked: true,
          showVerification: true,
        });

        this.startResendTimer(60);
      } else {
        const errMsg = response.data?.message || "Failed to process email change request.";
        this.setState({
          error: errMsg,
          isResending: false,
          loading: false,
          showErrorAlert: true,
        });
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || "An error occurred while requesting verification code.";
      this.setState({
        error: errMsg,
        isResending: false,
        loading: false,
        showErrorAlert: true,
      });
    }
  };

  handleEditDetails = () => {
    this.clearResendTimer();
    this.setState({
      showVerification: false,
      isLocked: false,
      verificationCode: "",
      codeError: false,
      codeErrorMessage: "",
      error: "",
      showErrorAlert: false,
    });
  };

  handleVerifySubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const { newEmail, verificationCode } = this.state;

    if (!verificationCode || verificationCode.trim().length !== 6) {
      this.setState({
        codeError: true,
        codeErrorMessage: "Please enter the complete 6-digit verification code.",
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
      formData.append("new_email", newEmail.trim());
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



  render() {
    const { show, onClose } = this.props;
    const {
      newEmail,
      password,
      showPassword,
      verificationCode,
      isLocked,
      showVerification,
      resendTimer,
      isResending,
      loading,
      cancelling,
      error,
      success,
      showSuccessAlert,
      showErrorAlert,
      emailError,
      emailErrorMessage,
      passwordError,
      passwordErrorMessage,
      codeError,
      codeErrorMessage,
    } = this.state;

    if (!show) return null;

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
          onClick={this.handleClose}
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
                  <i className="fe fe-mail mr-2" /> Change Email Address
                </h5>
                <button
                  type="button"
                  className="close text-white"
                  onClick={this.handleClose}
                  aria-label="Close"
                  style={{ opacity: 0.9 }}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>

              {/* Modal Body */}
              <div className={`modal-body p-4 ${loading || cancelling ? "dimmer active" : "dimmer"}`}>
                {(loading || cancelling) && <div className="loader" />}
                <div className="dimmer-content">
                  {/* Status Info Banner */}
                  {!showVerification ? (
                    <div className="alert alert-primary d-flex align-items-start mb-4" role="alert">
                      <i className="fe fe-info mr-2 mt-1 flex-shrink-0" />
                      <small className="mb-0">
                        Enter your current password and new email address. A 6-digit verification code will be sent to your new email.
                      </small>
                    </div>
                  ) : (
                    <div className="alert alert-success d-flex align-items-start mb-4" role="alert">
                      <i className="fe fe-check-circle mr-2 mt-1 flex-shrink-0" />
                      <small className="mb-0">
                        Verification code sent to <strong>{newEmail}</strong>. Enter the 6-digit code below to update your email.
                      </small>
                    </div>
                  )}

                  <form onSubmit={!showVerification ? this.handleRequestSubmit : this.handleVerifySubmit}>
                    {/* New Email Address Field */}
                    <div className="form-group mb-3">
                      <label className="form-label font-weight-semibold mb-1">
                        New Email Address <span className="text-danger">*</span>
                      </label>
                      <div className={`custom-hoverable-input-group ${emailError ? "is-invalid-wrapper" : ""}`}>
                        <input
                          type="email"
                          className="form-control"
                          name="newEmail"
                          value={newEmail}
                          onChange={this.handleChange}
                          placeholder="Enter new email address"
                          disabled={isLocked || loading}
                        />
                      </div>
                      {emailError && (
                        <div className="invalid-feedback d-block mt-1">{emailErrorMessage}</div>
                      )}
                    </div>

                    {/* Current Password Field */}
                    <div className="form-group mb-3">
                      <label className="form-label font-weight-semibold mb-1">
                        Current Password <span className="text-danger">*</span>
                      </label>
                      <div className={`custom-hoverable-input-group ${passwordError ? "is-invalid-wrapper" : ""}`}>
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          className="form-control"
                          placeholder="Enter current password"
                          value={password}
                          onChange={this.handleChange}
                          disabled={isLocked || loading}
                        />
                        <button
                          type="button"
                          className="eye-toggle-btn"
                          onClick={this.togglePasswordVisibility}
                          tabIndex="-1"
                          aria-label="Toggle password visibility"
                        >
                          <i className={`fe ${showPassword ? "fe-eye-off" : "fe-eye"}`} />
                        </button>
                      </div>
                      {passwordError && (
                        <div className="invalid-feedback d-block mt-1">{passwordErrorMessage}</div>
                      )}
                    </div>

                    {/* Initial Action Button (Get Verification Code) */}
                    {!showVerification && (
                      <div className="modal-footer px-0 pb-0 pt-3 bg-white border-top-0 d-flex justify-content-end">
                        <Button
                          type="button"
                          label="Cancel"
                          onClick={this.handleClose}
                          className="btn-secondary px-4 mr-2"
                          disabled={loading}
                        />
                        <Button
                          type="submit"
                          label="Get Verification Code"
                          className="btn-primary px-4"
                          disabled={loading}
                          loading={loading}
                        />
                      </div>
                    )}

                    {/* Verification Code Section (Revealed below main inputs) */}
                    {showVerification && (
                      <div className="verification-section border-top pt-4 mt-4">
                        <div className="form-group mb-3">
                          <label className="form-label font-weight-semibold mb-1">
                            6-Digit Verification Code <span className="text-danger">*</span>
                          </label>
                          <div className={`custom-hoverable-input-group ${codeError ? "is-invalid-wrapper" : ""}`}>
                            <input
                              type="text"
                              className="form-control form-control-lg text-center font-weight-bold"
                              name="verificationCode"
                              maxLength="6"
                              value={verificationCode}
                              onChange={this.handleCodeChange}
                              placeholder="123456"
                              disabled={loading}
                              style={{ fontSize: "1.4rem", letterSpacing: "6px" }}
                              autoFocus
                            />
                          </div>
                          {codeError && (
                            <div className="invalid-feedback d-block mt-1 text-center">
                              {codeErrorMessage}
                            </div>
                          )}
                        </div>

                        {/* Countdown & Resend Code Action */}
                        <div className="d-flex justify-content-between align-items-center mb-4 px-1">
                          <span className="text-muted small d-flex align-items-center">
                            <i className="fe fe-clock mr-1" /> Code sent to email
                          </span>
                          {resendTimer > 0 ? (
                            <span className="text-muted small font-weight-semibold">
                              Resend Code in {resendTimer}s
                            </span>
                          ) : (
                            <Button
                              type="button"
                              label="Resend Code"
                              icon="fe fe-rotate-cw mr-1"
                              onClick={() => this.handleRequestSubmit(null, true)}
                              className="btn-link p-0 text-primary font-weight-semibold small"
                              disabled={isResending || loading}
                              loading={isResending}
                              style={{ textDecoration: "none" }}
                            />
                          )}
                        </div>

                        {/* Modal Footer for Verification State */}
                        <div className="modal-footer px-0 pb-0 pt-3 bg-white border-top-0 d-flex justify-content-between">
                          <Button
                            type="button"
                            label="Edit Details"
                            icon="fe fe-edit-2 mr-1"
                            onClick={this.handleEditDetails}
                            className="btn-outline-secondary"
                            disabled={loading}
                          />

                          <Button
                            type="submit"
                            label="Submit & Change Email"
                            className="btn-primary px-4"
                            disabled={loading}
                            loading={loading}
                          />
                        </div>
                      </div>
                    )}
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

export default ChangeEmailModal;
