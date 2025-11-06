import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';

export default withRouter(class ForgotPassword extends Component {

	constructor(props) {
		super(props);
		this.state = {
			email: "",
			error: null,
			success: null,
			emailError: false,
			emailErrorMessage: '',
			loading: false,
		};
	}

	handleEmailChange = (event) => {
		this.setState({ email: event.target.value });
	};

	handleForgotPassword = () => {
		const { email } = this.state;

		// Reset error messages
		let emailError = false;
		let emailErrorMessage = '';

		// Validate email
		const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
		if (!email) {
			emailError = true;
			emailErrorMessage = 'Email is required';
		} else if (!emailRegex.test(email)) {
			emailError = true;
			emailErrorMessage = 'Please enter a valid email address';
		}

		if (emailError) {
			this.setState({
				emailError,
				emailErrorMessage,
				success: null,
				error: null,
			});
			return;
		}

		// Start loader when the request begins
		this.setState({ loading: true, success: null, error: null });

		const formData = new FormData();
		formData.append('email', email);

		// API call to request password reset
		fetch(`${process.env.REACT_APP_API_URL}/password_reset.php?action=forgot-password`, {
			method: "POST",
			body: formData,
		})
			.then((response) => response.json())
			.then((data) => {
				// Stop loader when API response is received
				this.setState({ loading: false });

				if (data.status === "success") {
					this.setState({
						success: data.message,
						error: null,
						emailError: false,
						emailErrorMessage: '',
						email: '',
					});
					// Redirect to login page after 3 seconds
					setTimeout(() => {
						this.props.history.push('/login');
					}, 3000);
				} else {
					this.setState({
						error: data.message,
						success: null,
						emailError: false,
						emailErrorMessage: '',
					});
				}
			})
			.catch((error) => {
				this.setState({
					loading: false,
					error: 'Something went wrong. Please try again.',
					success: null,
					emailError: false,
					emailErrorMessage: '',
				});
				console.error("Error:", error);
			});
	};

	render() {
		const { email, emailError, emailErrorMessage, success, error, loading } = this.state;
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
							<div className="card-title">Forgot Password</div>
							{loading && <div className="loader"></div>}
							<div className="dimmer-content">
								<div className="form-group">
									<label className="form-label">Email address</label>
									<input
										type="email"
										className={`form-control ${emailError ? 'is-invalid' : ''}`}
										id="exampleInputEmail1"
										aria-describedby="emailHelp"
										placeholder="Enter email"
										value={email}
										onChange={this.handleEmailChange}
									/>
									{emailError && <div className="invalid-feedback">{emailErrorMessage}</div>}
									<small id="emailHelp" className="form-text text-muted">Enter your registered email address and we'll send you a reset link.</small>
								</div>
								<div className="form-footer">
									<button className="btn btn-primary btn-block" onClick={this.handleForgotPassword}>
										Send Reset Link
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
								<img src="assets/images/slider1.svg" className="img-fluid" alt="forgot password" />
								<div className="px-4 mt-4">
									<h4>Password Recovery</h4>
									<p>Don't worry! It happens to the best of us. Enter your email and we'll send you a reset link.</p>
								</div>
							</div>
							<div className="carousel-item">
								<img src="assets/images/slider2.svg" className="img-fluid" alt="forgot password" />
								<div className="px-4 mt-4">
									<h4>Secure Reset Process</h4>
									<p>Your password reset link is secure and will expire in 1 hour for your safety.</p>
								</div>
							</div>
							<div className="carousel-item">
								<img src="assets/images/slider3.svg" className="img-fluid" alt="forgot password" />
								<div className="px-4 mt-4">
									<h4>Quick Recovery</h4>
									<p>Get back to your account quickly with our streamlined password recovery process.</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
});