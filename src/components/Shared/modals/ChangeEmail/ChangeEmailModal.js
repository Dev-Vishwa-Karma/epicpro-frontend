import React, { Component } from "react";
import api from "../../../../api/axios";
import Button from "../../../common/formInputs/Button";
import AlertMessages from "../../../common/AlertMessages";

class ChangeEmailModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newEmail: "",
      password: "",
      showPassword: false,
      loading: false,
      error: "",
      success: "",
      showSuccessAlert: false,
      showErrorAlert: false,
      emailError: false,
      emailErrorMessage: "",
      passwordError: false,
      passwordErrorMessage: "",
    };
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.show && this.props.show) {
      this.resetState();
    }
  }

  resetState = () => {
    this.setState({
      newEmail: "",
      password: "",
      showPassword: false,
      loading: false,
      error: "",
      success: "",
      showSuccessAlert: false,
      showErrorAlert: false,
      emailError: false,
      emailErrorMessage: "",
      passwordError: false,
      passwordErrorMessage: "",
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

  togglePasswordVisibility = () => {
    this.setState((prevState) => ({
      showPassword: !prevState.showPassword,
    }));
  };

  handleRequestSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const { newEmail, password } = this.state;

    let emailError = false;
    let emailErrorMessage = "";
    let passwordError = false;
    let passwordErrorMessage = "";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newEmail) {
      emailError = true;
      emailErrorMessage = "New email address is required.";
    } else if (!emailRegex.test(newEmail)) {
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
      loading: true,
      error: "",
      showErrorAlert: false,
    });

    try {
      const formData = new FormData();
      formData.append("new_email", newEmail);
      formData.append("password", password);

      const response = await api.post("/get_employees.php?action=change-email-request", formData);

      if (response.data && response.data.status === "success") {
        const msg = response.data.message || "Verification code sent to your new email. Please verify the code to complete the email change process.";
        this.setState({
          success: msg,
          showSuccessAlert: true,
          loading: false,
        });

        setTimeout(() => {
          if (this.props.onClose) this.props.onClose();
          window.location.reload();
        }, 500);

      } else {
        const errMsg = response.data?.message || "Failed to process email change request.";
        this.setState({
          error: errMsg,
          showErrorAlert: true,
          loading: false,
        });
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || "An error occurred while requesting email change.";
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
      loading,
      error,
      success,
      showSuccessAlert,
      showErrorAlert,
      emailError,
      emailErrorMessage,
      passwordError,
      passwordErrorMessage,
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
                  <i className="fe fe-mail mr-2" /> Request Email Change
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
                  <form onSubmit={this.handleRequestSubmit}>
                    <div className="alert alert-warning d-flex align-items-start mb-4" role="alert">
                      <i className="fe fe-alert-triangle mr-2 mt-1 flex-shrink-0" />
                      <small className="mb-0">
                        <strong>Note:</strong> A 6-digit verification code will be sent to your new email. Once requested, you will be logged out until the code is verified.
                      </small>
                    </div>

                    {/* New Email Input */}
                    <div className="form-group mb-3">
                      <label className="form-label font-weight-semibold">
                        New Email Address <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        className={`form-control ${emailError ? "is-invalid" : ""}`}
                        name="newEmail"
                        value={newEmail}
                        onChange={this.handleChange}
                        placeholder="Enter new email address"
                        disabled={loading}
                      />
                      {emailError && (
                        <div className="invalid-feedback d-block mt-1">{emailErrorMessage}</div>
                      )}
                    </div>

                    {/* Current Password Input */}
                    <div className="form-group mb-3">
                      <label className="form-label font-weight-semibold">
                        Current Password <span className="text-danger">*</span>
                      </label>
                      <div
                        className={`custom-hoverable-input-group ${passwordError ? "is-invalid-wrapper" : ""}`}
                      >
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          className="form-control"
                          placeholder="Enter current password"
                          value={password}
                          onChange={this.handleChange}
                          disabled={loading}
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

                    {/* Modal Footer */}
                    <div className="modal-footer px-0 pb-0 pt-3 bg-white border-top-0 d-flex justify-content-end">
                      <Button
                        type="button"
                        label="Cancel"
                        onClick={onClose}
                        className="btn-secondary px-4 mr-2"
                        disabled={loading}
                      />
                      <Button
                        type="submit"
                        label="Request"
                        className="btn-primary px-4"
                        disabled={loading}
                        loading={loading}
                      />
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

export default ChangeEmailModal;
