import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';

class ResetPassword extends Component {

	constructor(props) {
		super(props);
		this.state = {
			token: "",
			newPassword: "",
			confirmPassword: "",
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

	handleNewPasswordChange = (event) => {
		this.setState({ newPassword: event.target.value });
	};

	handleConfirmPasswordChange = (event) => {
		this.setState({ confirmPassword: event.target.value });
	};

	handleResetPassword = () => {
		const { token, newPassword, confirmPassword } = this.state;

		// Reset error messages
		let newPasswordError = false;
		let confirmPasswordError = false;
		let newPasswordErrorMessage = '';
		let confirmPasswordErrorMessage = '';

		// Validate new password
		if (!newPassword) {
			newPasswordError = true;
			newPasswordErrorMessage = 'New password is required';
		} else if (newPassword.length < 6) {
			newPasswordError = true;
			newPasswordErrorMessage = 'Password must be at least 6 characters long';
		}

		// Validate confirm password
		if (!confirmPassword) {
			confirmPasswordError = true;
			confirmPasswordErrorMessage = 'Confirm password is required';
		} else if (newPassword !== confirmPassword) {
			confirmPasswordError = true;
			confirmPasswordErrorMessage = 'Passwords do not match';
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
			error: null
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
						<div className={`card-body ${loading ? 'dimmer active' : 'dimmer'}`}>
							<div className="card-title">Reset Password</div>
							{loading && <div className="loader"></div>}
							<div className="dimmer-content">
								<div className="form-group">
									<label className="form-label">New Password</label>
									<input
										type="password"
										className={`form-control ${newPasswordError ? 'is-invalid' : ''}`}
										id="newPassword"
										placeholder="Enter new password"
										value={newPassword}
										onChange={this.handleNewPasswordChange}
									/>
									{newPasswordError && <div className="invalid-feedback">{newPasswordErrorMessage}</div>}
								</div>
								<div className="form-group">
									<label className="form-label">Confirm Password</label>
									<input
										type="password"
										className={`form-control ${confirmPasswordError ? 'is-invalid' : ''}`}
										id="confirmPassword"
										placeholder="Confirm new password"
										value={confirmPassword}
										onChange={this.handleConfirmPasswordChange}
									/>
									{confirmPasswordError && <div className="invalid-feedback">{confirmPasswordErrorMessage}</div>}
								</div>
								<div className="form-footer">
									<button className="btn btn-primary btn-block" onClick={this.handleResetPassword}>
										Reset Password
									</button>
								</div>
								<div className="text-center mt-3">
									<Link to="/login">Back to Login</Link>
								</div>
							</div>
						</div>
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
									<p>Your new password should be at least 6 characters long and hard to guess.</p>
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