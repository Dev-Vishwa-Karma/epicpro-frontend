import React, { Component } from 'react';
import { connect } from 'react-redux';
import AlertMessages from '../../common/AlertMessages';
import InputField from '../../common/formInputs/InputField';
import Button from '../../common/formInputs/Button';
import { getService } from '../../../services/getService';
import { validateFields } from '../../common/validations';
import { appendDataToFormData, PASSWORD_SENTINEL } from '../../../utils';

class EditUser extends Component {
	constructor(props) {
		super(props);
		this.state = {
			logged_in_employee_id: null,
			logged_in_employee_role: null,
			departments: [],
			selectedUser: null,
			errors: {},
			ButtonLoading: false,
			showPassword: false,
			passwordCleared: false,
			showSuccess: false,
			successMessage: '',
			showError: false,
			errorMessage: ''
		};
	}

	componentDidMount() {
		if (window.user) {
			this.setState({
				logged_in_employee_id: window.user.id,
				logged_in_employee_role: window.user.role,
			});
		}
		const { id } = this.props.match.params;
		// fetch departments
		getService.getCall('departments.php', { action: 'view' })
			.then(data => this.setState({ departments: data.data || [] }))
			.catch(() => {});
		// fetch user by id
		getService.getCall('get_employees.php', { action: 'view', user_id: id })
			.then(res => {
				if (res.status === 'success' && res.data) {
					this.setState({ selectedUser: { ...res.data, password: PASSWORD_SENTINEL } });
				} else {
					this.setState({ showError: true, errorMessage: 'User not found' });
				}
			})
			.catch(() => this.setState({ showError: true, errorMessage: 'Failed to fetch user' }));
	}

	toggleShowPassword = () => {
		this.setState(prev => ({ showPassword: !prev.showPassword }));
	}

	handleInputChange = (e) => {
		const { name, value } = e.target;
		const nextValue = name === 'mobile_no1' ? String(value).replace(/\D/g, '').slice(0, 10) : value;
		this.setState(prev => ({
			selectedUser: { ...prev.selectedUser, [name]: nextValue },
			passwordCleared: name === 'password' ? (nextValue === '' ? true : prev.passwordCleared) : prev.passwordCleared
		}));
	}

	handleSelectChange = (e) => {
		const { name, value } = e.target;
		this.setState(prev => ({ selectedUser: { ...prev.selectedUser, [name]: value } }));
	}

	updateProfile = () => {
		const { logged_in_employee_id, logged_in_employee_role, selectedUser } = this.state;
		if (!selectedUser) return;
		this.setState({ ButtonLoading: true });

		const validationSchema = [
			{ name: 'firstName', value: selectedUser.first_name, type: 'name', required: true, messageName: 'First Name'},
			{ name: 'lastName', value: selectedUser.last_name, type: 'name', required: true, messageName: 'Last Name' },
			{ name: 'email', value: selectedUser.email, type: 'email', required: true, messageName: 'Email Address'},
			{ name: 'dob', value: selectedUser.dob, type: 'date', required: true, messageName: 'Date of Birth'},
			{ name: 'gender', value: selectedUser.gender, required: true, messageName: 'Gender' },
			{ name: 'role', value: selectedUser.role, required: true, messageName: 'Role' },
			{ name: 'department_id', value: selectedUser.department_id, required: true, messageName: 'Position' },
			{ name: 'mobile_no1', value: selectedUser.mobile_no1, type: 'mobile',  required: true, messageName: 'Mobile Number', maxLength: 10},
		];
		const errors = validateFields(validationSchema);
		if (Object.keys(errors).length > 0) {
			this.setState({ errors, ButtonLoading: false });
			return;
		} else {
			this.setState({ errors: {} });
		}

		const form = new FormData();
		const data = {
			first_name: selectedUser.first_name,
			last_name: selectedUser.last_name,
			email: selectedUser.email,
			selected_role: selectedUser.role,
			dob: selectedUser.dob,
			department_id: selectedUser.department_id,
			gender: selectedUser.gender,
			mobile_no1: selectedUser.mobile_no1,
			logged_in_employee_id: logged_in_employee_id,
			logged_in_employee_role: logged_in_employee_role
		};
		appendDataToFormData(form, data);

		if (logged_in_employee_role === 'super_admin') {
			const pwd = (selectedUser.password || '').trim();
			if (pwd !== '' && pwd !== PASSWORD_SENTINEL) {
				form.append('password', pwd);
			}
		}

		getService.editCall('get_employees.php', 'edit', form, null, selectedUser.id)
			.then(res => {
				if (res.status === 'success') {
					this.setState({ showSuccess: true, successMessage: 'User updated successfully!', ButtonLoading: false });
					this.props.history.push('/hr-users');
					setTimeout(() => this.setState({ showSuccess: false }), 3000);
				} else {
					this.setState({ showError: true, errorMessage: 'Failed to update user. Please try again.', ButtonLoading: false });
					setTimeout(() => this.setState({ showError: false }), 3000);
				}
			})
			.catch(() => this.setState({ showError: true, errorMessage: 'An error occurred. Please try again later.', ButtonLoading: false }));
	}

	render() {
		const { fixNavbar } = this.props;
		const { selectedUser, departments, errors, ButtonLoading, showPassword, passwordCleared, showSuccess, successMessage, showError, errorMessage } = this.state;
		return (
			<>
				<AlertMessages
					showSuccess={showSuccess}
					successMessage={successMessage}
					showError={showError}
					errorMessage={errorMessage}
					setShowSuccess={(val) => this.setState({ showSuccess: val })}
					setShowError={(val) => this.setState({ showError: val })}
				/>
				<div className={`section-body ${fixNavbar ? "marginTop" : ""} `}>
					<div className="container-fluid">
						<div className="row clearfix">
							<div className="col-lg-12">
								<div className="card">
									<div className="card-header">
										<h3 className="card-title">Edit User</h3>
									</div>
									<div className="card-body">
										{selectedUser ? (
											<div className="row clearfix">
												<div className="col-md-12">
													<InputField
														label="First Name"
														name="first_name"
														type="text"
														value={selectedUser.first_name || ''}
														onChange={this.handleInputChange}
														error={errors.firstName}
														placeholder="Enter First Name"
													/>
												</div>

												<div className="col-md-12">
													<InputField
														label="Last Name"
														name="last_name"
														type="text"
														value={selectedUser.last_name || ''}
														onChange={this.handleInputChange}
														error={errors.lastName}
														placeholder="Enter Last Name"
													/>
												</div>

												<div className="col-md-12">
													<InputField
														label="Email Address"
														name="email"
														type="text"
														value={selectedUser.email || ''}
														onChange={this.handleInputChange}
														error={errors.email}
														placeholder="Enter Email"
													/>
												</div>

												<div className="col-md-6">
													<InputField
														label="Date of Birth"
														name="dob"
														type="date"
														value={selectedUser.dob || ''}
														onChange={this.handleInputChange}
														error={errors.dob}
														max={new Date().toISOString().split("T")[0]}
													/>
												</div>

												<div className="col-sm-6 col-md-6">
													<InputField
														label="Gender"
														name="gender"
														type="select"
														value={selectedUser.gender || ''}
														onChange={this.handleSelectChange}
														options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }]}
														error={errors.gender}
													/>
												</div>

												{(this.state.logged_in_employee_role || '').toLowerCase().replace(/\s+/g, '_') === 'super_admin' || 'admin' && (
													<div className="col-md-6">
														<div className="form-group">
															<label className="form-label" htmlFor="password">password</label>
															<div className="input-group">
																<input
																	id="password"
																	type={showPassword ? 'text' : 'password'}
																	name="password"
																	className={`form-control${errors.password ? ' is-invalid' : ''}`}
																	value={selectedUser.password || ''}
																	onChange={this.handleInputChange}
																	autoComplete="new-password"
																/>
																{passwordCleared && String(selectedUser.password || '') !== '' && (
																	<div className="input-group-append">
																		<button
																			type="button"
																			className="btn btn-outline-secondary"
																			onClick={this.toggleShowPassword}
																			title={showPassword ? 'Hide' : 'Show'}
																		>
																			<i className={`fe ${showPassword ? 'fe-eye-off' : 'fe-eye'}`}></i>
																		</button>
																	</div>
																)}
																{errors.password && <div className="invalid-feedback d-block">{errors.password}</div>}
															</div>
														</div>
													</div>
												)}

												<div className="col-md-6">
													<InputField
														label="Role"
														name="role"
														type="select"
														value={selectedUser.role || ''}
														onChange={this.handleSelectChange}
														options={[
															{ value: 'super_admin', label: 'Super Admin' },
															{ value: 'admin', label: 'Admin' }
														]}
													/>
												</div>

												<div className="col-md-6">
													<InputField
														label="Mobile No"
														name="mobile_no1"
														type="text"
														value={selectedUser.mobile_no1 || ''}
														onChange={this.handleInputChange}
														error={errors.mobile_no1}
														maxLength={10}
													/>
												</div>

												<div className="col-md-6">
													<InputField
														label="Position"
														name="department_id"
														type="select"
														value={selectedUser.department_id || ''}
														onChange={this.handleSelectChange}
														options={departments.map(dept => ({ value: dept.id, label: dept.department_name }))}
													/>
												</div>
											</div>
										) : (
											<p>Loading user data...</p>
										)}

										<div className="mt-4">
											<Button
												label={ButtonLoading ? (
													<>
														<span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
														Updating...
													</>
												) : "Update Profile"}
												onClick={this.updateProfile}
												disabled={ButtonLoading}
												className="btn-primary mr-2"
											/>
											<Button label="Back" className="btn-secondary" onClick={() => this.props.history.goBack()} />
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</>
		);
	}
}

const mapStateToProps = state => ({
	fixNavbar: state.settings.isFixNavbar
})

export default connect(mapStateToProps)(EditUser); 