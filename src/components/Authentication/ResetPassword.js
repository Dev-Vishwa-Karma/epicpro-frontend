import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import '../Shared/modals/ChangePassword/ChangePasswordModal.css';

class ResetPassword extends Component {

	constructor(props) {
		super(props);
		this.state = {
			token: "",
			newPassword: "",
			confirmPassword: "",
			showNewPassword: false,
			showConfirmPassword: false,
			error: null,
			success: null,
			newPasswordError: false,
			confirmPasswordError: false,
			newPasswordErrorMessage: '',
			confirmPasswordErrorMessage: '',
			loading: false,
		};
	}

	componentDidMount() {
		// Get token from URL query parameters
		const urlParams = new URLSearchParams(window.location.search);
		const token = urlParams.get('token');
		if (token) {
			this.setState({ token });
		} else {
			this.setState({ error: 'Invalid reset link. Please request a new password reset.' });
		}
	}

	handleChange = (event) => {
		this.setState({
			[event.target.name]: event.target.value,
			error: null,
			newPasswordError: false,
			confirmPasswordError: false,
		});
	};

	toggleVisibility = (field) => {
		this.setState((prevState) => ({
			[field]: !prevState[field],
		}));
	};

	handleResetPassword = (e) => {
		if (e && e.preventDefault) {
			e.preventDefault();
		}
		const { token, newPassword, confirmPassword } = this.state;

		// Reset error messages
		let newPasswordError = false;
		let confirmPasswordError = false;
		let newPasswordErrorMessage = '';
		let confirmPasswordErrorMessage = '';

		// Validate new password
		if (!newPassword) {
			newPasswordError = true;
			newPasswordErrorMessage = 'New password is required.';
		} else {
			const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
			if (newPassword.length < 8) {
				newPasswordError = true;
				newPasswordErrorMessage = 'Password must be at least 8 characters long.';
			} else if (!passwordRegex.test(newPassword)) {
				newPasswordError = true;
				newPasswordErrorMessage = 'Password must include uppercase, lowercase, numbers, and symbols.';
			}
		}

		// Validate confirm password
		if (!confirmPassword) {
			confirmPasswordError = true;
			confirmPasswordErrorMessage = 'Please confirm your new password.';
		} else if (newPassword && newPassword !== confirmPassword) {
			confirmPasswordError = true;
			confirmPasswordErrorMessage = 'Passwords do not match.';
		}

		if (newPasswordError || confirmPasswordError) {
			this.setState({
				newPasswordError,
				confirmPasswordError,
				newPasswordErrorMessage,
				confirmPasswordErrorMessage,
				success: null,
				error: null,
			});
			return;
		}

		this.setState({
			loading: true,
			success: null,
			error: null,
			newPasswordError: false,
			confirmPasswordError: false,
		});

		const formData = new FormData();
		formData.append('token', token);
		formData.append('new_password', newPassword);
		formData.append('confirm_password', confirmPassword);

		// API call to reset password
		fetch(`${process.env.REACT_APP_API_URL}/password_reset.php?action=reset-password`, {
			method: "POST",
			body: formData,
		})
			.then((response) => response.json())
			.then((data) => {
				this.setState({ loading: false });

				if (data.status === "success") {
					this.setState({
						success: data.message,
						error: null,
						newPasswordError: false,
						confirmPasswordError: false,
						newPasswordErrorMessage: '',
						confirmPasswordErrorMessage: '',
					});
					setTimeout(() => {
						this.props.history.push('/login');
					}, 3000);
				} else {
					this.setState({
						error: data.message,
						success: null,
						newPasswordError: false,
						confirmPasswordError: false,
						newPasswordErrorMessage: '',
						confirmPasswordErrorMessage: '',
					});
				}
			})
			.catch((error) => {
				this.setState({
					loading: false,
					error: 'Something went wrong. Please try again.',
					success: null,
					newPasswordError: false,
					confirmPasswordError: false,
					newPasswordErrorMessage: '',
					confirmPasswordErrorMessage: '',
				});
				console.error("Error:", error);
			});
	};

	render() {
		const {
			newPassword,
			confirmPassword,
			showNewPassword,
			showConfirmPassword,
			newPasswordError,
			confirmPasswordError,
			newPasswordErrorMessage,
			confirmPasswordErrorMessage,
			success,
			error,
			loading,
			token
		} = this.state;

		if (!token) {
			return (
				<div className="auth">
					<div className="auth_left">
						<div className="card">
							<div className="text-center mb-2">
								<Link className="header-brand" to="/">
									<i className="fe fe-command brand-logo" />
								</Link>
							</div>
							{error && <div className="card-alert alert alert-danger mb-0">{error}</div>}
							<div className="card-body">
								<div className="text-center mt-3">
									<Link to="/forgot-password">Request New Reset Link</Link>
								</div>
							</div>
						</div>
					</div>
				</div>
			);
		}

		const hasMinLength = newPassword.length >= 8;
		const hasUppercase = /[A-Z]/.test(newPassword);
		const hasLowercase = /[a-z]/.test(newPassword);
		const hasNumber = /\d/.test(newPassword);
		const hasSymbol = /[\W_]/.test(newPassword);
		const isSubmitDisabled = loading || !hasMinLength || !hasUppercase || !hasLowercase || !hasNumber || !hasSymbol || !newPassword || !confirmPassword;

		return (
			<div className="auth">
				<div className="auth_left">
					<div className="card">
						<div className="text-center mb-2">
							<Link className="header-brand" to="/">
								<i className="fe fe-command brand-logo" />
							</Link>
						</div>
						{success && <div className="card-alert alert alert-success mb-0">{success}</div>}
						{error && <div className="card-alert alert alert-danger mb-0">{error}</div>}
						<form onSubmit={this.handleResetPassword}>
							<div className={`card-body ${loading ? 'dimmer active' : 'dimmer'}`}>
								<div className="card-title">Reset Password</div>
								{loading && <div className="loader"></div>}
								<div className="dimmer-content">
									{/* New Password */}
									<div className="form-group mb-3">
										<label className="form-label font-weight-semibold">
											New Password <span className="text-danger">*</span>
										</label>
										<div className={`custom-hoverable-input-group ${newPasswordError ? 'is-invalid-wrapper' : ''}`}>
											<input
												type={showNewPassword ? "text" : "password"}
												className="form-control"
												name="newPassword"
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
										{newPasswordError && <div className="invalid-feedback d-block mt-1">{newPasswordErrorMessage}</div>}

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

									{/* Confirm Password */}
									<div className="form-group mb-3">
										<label className="form-label font-weight-semibold">
											Confirm Password <span className="text-danger">*</span>
										</label>
										<div className={`custom-hoverable-input-group ${confirmPasswordError ? 'is-invalid-wrapper' : ''}`}>
											<input
												type={showConfirmPassword ? "text" : "password"}
												className="form-control"
												name="confirmPassword"
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
										{confirmPasswordError && <div className="invalid-feedback d-block mt-1">{confirmPasswordErrorMessage}</div>}
									</div>

									<div className="form-footer">
										<button
											type="submit"
											className="btn btn-primary btn-block"
											disabled={isSubmitDisabled}
										>
											Reset Password
										</button>
									</div>
									<div className="text-center mt-3">
										<Link to="/login">Back to Login</Link>
									</div>
								</div>
							</div>
						</form>
					</div>
				</div>
				<div className="auth_right">
					<div className="carousel slide" data-ride="carousel" data-interval={3000}>
						<div className="carousel-inner">
							<div className="carousel-item active">
								<img src="https://ik.imagekit.io/sentyaztie/secure-password-reset.png?updatedAt=1762326746022" className="img-fluid" alt="reset password" />
								<div className="px-4 mt-4">
									<h4>Secure Password Reset</h4>
									<p>Create a strong new password to keep your account secure.</p>
								</div>
							</div>
							<div className="carousel-item">
								<img src="https://ik.imagekit.io/sentyaztie/reset-password.png?updatedAt=1762326731649" className="img-fluid" alt="reset password" />
								<div className="px-4 mt-4">
									<h4>Password Requirements</h4>
									<p>Your new password should be at least 8 characters long and hard to guess.</p>
								</div>
							</div>
							<div className="carousel-item">
								<img src="https://ik.imagekit.io/sentyaztie/account-security.png?updatedAt=1762326746080" className="img-fluid" alt="reset password" />
								<div className="px-4 mt-4">
									<h4>Account Security</h4>
									<p>After resetting, you'll be redirected to login with your new credentials.</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default withRouter(ResetPassword);