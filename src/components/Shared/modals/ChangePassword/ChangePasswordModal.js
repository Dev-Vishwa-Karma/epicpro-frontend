import React, { Component } from "react";
import api from "../../../../api/axios";
import Button from "../../../common/formInputs/Button";
import AlertMessages from "../../../common/AlertMessages";
import "./ChangePasswordModal.css";

class ChangePasswordModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
      showOldPassword: false,
      showNewPassword: false,
      showConfirmPassword: false,
      loading: false,
      error: "",
      success: "",
      showSuccessAlert: false,
      showErrorAlert: false,
      oldPasswordError: false,
      oldPasswordErrorMessage: "",
      newPasswordError: false,
      newPasswordErrorMessage: "",
      confirmPasswordError: false,
      confirmPasswordErrorMessage: "",
    };
  }

  componentDidUpdate(prevProps) {
    // Reset form state when modal is opened
    if (!prevProps.show && this.props.show) {
      this.setState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
        showOldPassword: false,
        showNewPassword: false,
        showConfirmPassword: false,
        loading: false,
        error: "",
        success: "",
        showSuccessAlert: false,
        showErrorAlert: false,
        oldPasswordError: false,
        oldPasswordErrorMessage: "",
        newPasswordError: false,
        newPasswordErrorMessage: "",
        confirmPasswordError: false,
        confirmPasswordErrorMessage: "",
      });
    }
  }

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
      error: "",
      showErrorAlert: false,
      oldPasswordError: false,
      newPasswordError: false,
      confirmPasswordError: false,
    });
  };

  toggleVisibility = (field) => {
    this.setState((prevState) => ({
      [field]: !prevState[field],
    }));
  };

  handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    const { oldPassword, newPassword, confirmPassword } = this.state;

    let oldPasswordError = false;
    let oldPasswordErrorMessage = "";
    let newPasswordError = false;
    let newPasswordErrorMessage = "";
    let confirmPasswordError = false;
    let confirmPasswordErrorMessage = "";

    if (!oldPassword) {
      oldPasswordError = true;
      oldPasswordErrorMessage = "Old password is required.";
    }

    if (!newPassword) {
      newPasswordError = true;
      newPasswordErrorMessage = "New password is required.";
    } else {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
      if (newPassword.length < 8) {
        newPasswordError = true;
        newPasswordErrorMessage = "Password must be at least 8 characters long.";
      } else if (!passwordRegex.test(newPassword)) {
        newPasswordError = true;
        newPasswordErrorMessage = "Password must include uppercase, lowercase, numbers, and symbols.";
      }
    }

    if (!confirmPassword) {
      confirmPasswordError = true;
      confirmPasswordErrorMessage = "Please confirm your new password.";
    } else if (newPassword && newPassword !== confirmPassword) {
      confirmPasswordError = true;
      confirmPasswordErrorMessage = "Passwords do not match.";
    }

    if (oldPasswordError || newPasswordError || confirmPasswordError) {
      this.setState({
        oldPasswordError,
        oldPasswordErrorMessage,
        newPasswordError,
        newPasswordErrorMessage,
        confirmPasswordError,
        confirmPasswordErrorMessage,
        error: "",
        success: "",
        showErrorAlert: false,
        showSuccessAlert: false,
      });
      return;
    }

    this.setState({
      loading: true,
      error: "",
      success: "",
      showErrorAlert: false,
      showSuccessAlert: false,
      oldPasswordError: false,
      newPasswordError: false,
      confirmPasswordError: false,
    });

    try {
      const formData = new FormData();
      formData.append("old_password", oldPassword);
      formData.append("new_password", newPassword);
      formData.append("confirm_password", confirmPassword);

      const response = await api.post("/get_employees.php?action=change-password", formData);

      if (response.data && response.data.status === "success") {
        const msg = response.data.message || "Password updated successfully!";
        this.setState({
          success: msg,
          showSuccessAlert: true,
          loading: false,
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        localStorage.clear();

        // Automatically close modal and reload to force re-login after 1.5 seconds
        setTimeout(() => {
          if (this.props.onClose) {
            this.props.onClose();
          }
          window.location.reload();
        }, 1500);
      } else {
        const errMsg = response.data?.message || "Failed to update password. Please try again.";
        this.setState({
          error: errMsg,
          showErrorAlert: true,
          loading: false,
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (err) {
      const errMsg =
        err.response?.data?.message || "An unexpected error occurred while changing password.";
      this.setState({
        error: errMsg,
        showErrorAlert: true,
        loading: false,
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  };

  render() {
    const { show, onClose } = this.props;
    const {
      oldPassword,
      newPassword,
      confirmPassword,
      showOldPassword,
      showNewPassword,
      showConfirmPassword,
      loading,
      error,
      success,
      showSuccessAlert,
      showErrorAlert,
      oldPasswordError,
      oldPasswordErrorMessage,
      newPasswordError,
      newPasswordErrorMessage,
      confirmPasswordError,
      confirmPasswordErrorMessage,
    } = this.state;

    if (!show) return null;

    const hasMinLength = newPassword.length >= 8;
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasLowercase = /[a-z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    const hasSymbol = /[\W_]/.test(newPassword);

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
                  <i className="fe fe-lock mr-2" /> Change Password
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

              {/* Modal Body with Dimmer active on loading */}
              <form onSubmit={this.handleSubmit}>
                <div className={`modal-body p-4 ${loading ? "dimmer active" : "dimmer"}`}>
                  {loading && <div className="loader" />}
                  <div className="dimmer-content">
                    {/* Warning Notice */}
                    <div className="alert alert-warning d-flex align-items-start mb-4" role="alert">
                      <i className="fe fe-alert-triangle mr-2 mt-1 flex-shrink-0" />
                      <small className="mb-0">
                        <strong>Warning:</strong> Once you have successfully updated your password, you will need to log in again. Please remember your changed password.
                      </small>
                    </div>
                    {/* Old Password */}
                    <div className="form-group mb-3">
                      <label className="form-label font-weight-semibold">
                        Old Password <span className="text-danger">*</span>
                      </label>
                      <div
                        className={`custom-hoverable-input-group ${oldPasswordError ? "is-invalid-wrapper" : ""
                          }`}
                      >
                        <input
                          type={showOldPassword ? "text" : "password"}
                          className="form-control"
                          name="oldPassword"
                          value={oldPassword}
                          onChange={this.handleChange}
                          placeholder="Enter old password"
                          autoComplete="off"
                          disabled={loading}
                        />
                        <button
                          type="button"
                          className="eye-toggle-btn"
                          onClick={() => this.toggleVisibility("showOldPassword")}
                          tabIndex="-1"
                          aria-label={showOldPassword ? "Hide password" : "Show password"}
                        >
                          <i className={`fe ${showOldPassword ? "fe-eye-off" : "fe-eye"}`} />
                        </button>
                      </div>
                      {oldPasswordError && (
                        <div className="invalid-feedback d-block mt-1">{oldPasswordErrorMessage}</div>
                      )}
                    </div>

                    {/* New Password */}
                    <div className="form-group mb-3">
                      <label className="form-label font-weight-semibold">
                        New Password <span className="text-danger">*</span>
                      </label>
                      <div
                        className={`custom-hoverable-input-group ${newPasswordError ? "is-invalid-wrapper" : ""
                          }`}
                      >
                        <input
                          type={showNewPassword ? "text" : "password"}
                          name="newPassword"
                          className="form-control"
                          placeholder="Enter new password (min. 8 characters)"
                          value={newPassword}
                          onChange={this.handleChange}
                          disabled={loading}
                        />
                        <button
                          type="button"
                          className="eye-toggle-btn"
                          onClick={() => this.toggleVisibility("showNewPassword")}
                          tabIndex="-1"
                          aria-label="Toggle password visibility"
                        >
                          <i className={`fe ${showNewPassword ? "fe-eye-off" : "fe-eye"}`} />
                        </button>
                      </div>
                      {newPasswordError && (
                        <div className="invalid-feedback d-block mt-1">{newPasswordErrorMessage}</div>
                      )}

                      {/* Password Requirements Indicator */}
                      <div className="mt-2" style={{ fontSize: "0.85rem" }}>
                        <div className="text-muted mb-1 small font-weight-medium">
                          Password must contain:
                        </div>

                        <div className="d-flex flex-column gap-2">
                          <div className={`d-flex align-items-center ${hasMinLength ? "text-success" : "text-muted"}`}>
                            <i className={`fe ${hasMinLength ? "fe-check-circle" : "fe-circle"} mr-2`} aria-hidden="true" />
                            <span>Minimum 8 characters</span>
                          </div>

                          <div className={`d-flex align-items-center ${hasUppercase ? "text-success" : "text-muted"}`}>
                            <i className={`fe ${hasUppercase ? "fe-check-circle" : "fe-circle"} mr-2`} aria-hidden="true" />
                            <span>At least 1 uppercase letter</span>
                          </div>

                          <div className={`d-flex align-items-center ${hasLowercase ? "text-success" : "text-muted"}`}>
                            <i className={`fe ${hasLowercase ? "fe-check-circle" : "fe-circle"} mr-2`} aria-hidden="true" />
                            <span>At least 1 lowercase letter</span>
                          </div>

                          <div className={`d-flex align-items-center ${hasNumber ? "text-success" : "text-muted"}`}>
                            <i className={`fe ${hasNumber ? "fe-check-circle" : "fe-circle"} mr-2`} aria-hidden="true" />
                            <span>At least 1 number</span>
                          </div>

                          <div className={`d-flex align-items-center ${hasSymbol ? "text-success" : "text-muted"}`}>
                            <i className={`fe ${hasSymbol ? "fe-check-circle" : "fe-circle"} mr-2`} aria-hidden="true" />
                            <span>Minimum 1 special symbol (@, #, $)</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Confirm New Password */}
                    <div className="form-group mb-3">
                      <label className="form-label font-weight-semibold">
                        Confirm Password <span className="text-danger">*</span>
                      </label>
                      <div
                        className={`custom-hoverable-input-group ${confirmPasswordError ? "is-invalid-wrapper" : ""
                          }`}
                      >
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          className="form-control"
                          placeholder="Confirm new password"
                          value={confirmPassword}
                          onChange={this.handleChange}
                          disabled={loading}
                        />
                        <button
                          type="button"
                          className="eye-toggle-btn"
                          onClick={() => this.toggleVisibility("showConfirmPassword")}
                          tabIndex="-1"
                          aria-label="Toggle confirm password visibility"
                        >
                          <i className={`fe ${showConfirmPassword ? "fe-eye-off" : "fe-eye"}`} />
                        </button>
                      </div>
                      {confirmPasswordError && (
                        <div className="invalid-feedback d-block mt-1">{confirmPasswordErrorMessage}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="modal-footer bg-white">
                  <Button
                    type="button"
                    label="Cancel"
                    onClick={onClose}
                    className="btn-secondary px-4"
                    disabled={loading}
                  />
                  <Button
                    type="submit"
                    label="Change"
                    className="btn-primary px-4"
                    disabled={loading || !hasMinLength || !hasUppercase || !hasLowercase || !hasNumber || !hasSymbol || !oldPassword || !newPassword || !confirmPassword}
                    loading={loading}
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default ChangePasswordModal;