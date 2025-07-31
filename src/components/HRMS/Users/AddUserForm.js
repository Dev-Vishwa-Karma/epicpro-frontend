import React from 'react';

const AddUserForm = ({
	state,
	handleInputChangeForAddUser,
	handleSelectChange,
	addUser,
}) => {
	return (
		<div className="row clearfix">
			<div className="col-lg-12 col-md-12 col-sm-12">
				<div className="form-group">
					<input
						type="text"
						className="form-control"
						placeholder="Employee Code *"
						name="employeeCode"
						value={state.employeeCode}
						onChange={handleInputChangeForAddUser}
					/>
				</div>
			</div>

			<div className="col-lg-6 col-md-6 col-sm-12">
				<div className="form-group">
					<input
						type="text"
						className={`form-control${state.errors.firstName ? ' is-invalid' : ''}`}
						placeholder="First Name *"
						name="firstName"
						value={state.firstName}
						onChange={handleInputChangeForAddUser}
					/>
					{state.errors.firstName && (
						<div className="invalid-feedback d-block">{state.errors.firstName}</div>
					)}
				</div>
			</div>

			<div className="col-lg-6 col-md-6 col-sm-12">
				<div className="form-group">
					<input
						type="text"
						className={`form-control${state.errors.lastName ? ' is-invalid' : ''}`}
						placeholder="Last Name"
						name="lastName"
						value={state.lastName}
						onChange={handleInputChangeForAddUser}
					/>
					{state.errors.lastName && (
						<div className="invalid-feedback d-block">{state.errors.lastName}</div>
					)}
				</div>
			</div>

			<div className="col-md-4 col-sm-12">
				<div className="form-group">
					<input
						type="text"
						className={`form-control${state.errors.email ? ' is-invalid' : ''}`}
						placeholder="Email ID *"
						name="email"
						value={state.email}
						onChange={handleInputChangeForAddUser}
					/>
					{state.errors.email && (
						<div className="invalid-feedback d-block">{state.errors.email}</div>
					)}
				</div>
			</div>

			<div className="col-md-4 col-sm-12">
				<div className="form-group">
					<input
						type="text"
						className={`form-control${state.errors.mobileNo ? ' is-invalid' : ''}`}
						placeholder="Mobile No"
						name="mobileNo"
						value={state.mobileNo}
						onChange={handleInputChangeForAddUser}
						maxLength="10"
					/>
					{state.errors.mobileNo && (
						<div className="invalid-feedback d-block">{state.errors.mobileNo}</div>
					)}
				</div>
			</div>

			<div className="col-md-4 col-sm-12">
				<div className="form-group">
					<select
						className="form-control show-tick"
						value={state.selectedRole}
						onChange={handleSelectChange}
						name="selectedRole"
					>
						<option>Select Role Type</option>
						<option value="super_admin">Super Admin</option>
						<option value="admin">Admin</option>
					</select>
				</div>
			</div>

			<div className="col-sm-6 col-md-4">
				<div className="form-group">
					<select
						name="gender"
						className={`form-control${state.errors.gender ? ' is-invalid' : ''}`}
						id="gender"
						value={state.gender}
						onChange={handleSelectChange}
						required
					>
						<option value="">Select Gender</option>
						<option value="male">Male</option>
						<option value="female">Female</option>
					</select>
					{state.errors.gender && (
						<div className="invalid-feedback d-block">{state.errors.gender}</div>
					)}
				</div>
			</div>

			<div className="col-md-4 col-sm-12">
				<div className="form-group">
					<select
						className={`form-control show-tick${state.errors.selectedDepartment ? ' is-invalid' : ''}`}
						value={state.selectedDepartment}
						onChange={handleSelectChange}
						name="selectedDepartment"
					>
						<option value="">Select Department</option>
						{state.departments.map((dept) => (
							<option key={dept.id} value={dept.id}>
								{dept.department_name}
							</option>
						))}
					</select>
					{state.errors.selectedDepartment && (
						<div className="invalid-feedback d-block">{state.errors.selectedDepartment}</div>
					)}
				</div>
			</div>

			<div className="col-sm-6 col-md-4">
				<div className="form-group">
					<input
						type="date"
						id="dob"
						name="dob"
						title="dob"
						className={`form-control${state.errors.dob ? ' is-invalid' : ''}`}
						value={state.dob}
						onChange={handleInputChangeForAddUser}
					/>
					{state.errors.dob && (
						<div className="invalid-feedback d-block">{state.errors.dob}</div>
					)}
				</div>
			</div>

			<div className="col-md-4 col-sm-12">
				<div className="form-group">
					<input
						type="password"
						className={`form-control${state.errors.password ? ' is-invalid' : ''}`}
						placeholder="Password"
						name="password"
						value={state.password}
						onChange={handleInputChangeForAddUser}
					/>
					{state.errors.password && (
						<div className="invalid-feedback d-block">{state.errors.password}</div>
					)}
				</div>
			</div>

			<div className="col-md-4 col-sm-12">
				<div className="form-group">
					<input
						type="password"
						className={`form-control${state.errors.confirmPassword ? ' is-invalid' : ''}`}
						placeholder="Confirm Password"
						name="confirmPassword"
						value={state.confirmPassword}
						onChange={handleInputChangeForAddUser}
					/>
					{state.errors.confirmPassword && (
						<div className="invalid-feedback d-block">{state.errors.confirmPassword}</div>
					)}
				</div>
			</div>

			<div className="col-12">
				<hr className="mt-4" />
				<h6>Module Permission</h6>
				<div className="table-responsive">
					<table className="table table-striped">
						<thead>
							<tr>
								<th />
								<th>Read</th>
								<th>Write</th>
								<th>Delete</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>Super Admin</td>
								<td><input type="checkbox" defaultChecked /></td>
								<td><input type="checkbox" defaultChecked /></td>
								<td><input type="checkbox" defaultChecked /></td>
							</tr>
							<tr>
								<td>Admin</td>
								<td><input type="checkbox" defaultChecked /></td>
								<td><input type="checkbox" /></td>
								<td><input type="checkbox" /></td>
							</tr>
						</tbody>
					</table>
				</div>

				<button
					type="button"
					className="btn btn-primary mr-2"
					onClick={addUser}
					disabled={state.ButtonLoading}
				>
					{state.ButtonLoading && (
						<span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
					)}
					Add
				</button>

				<button
					type="button"
					className="btn btn-secondary"
					data-dismiss="modal"
				>
					CLOSE
				</button>
			</div>
		</div>
	);
};

export default AddUserForm;
