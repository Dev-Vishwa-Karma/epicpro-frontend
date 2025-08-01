import React from 'react';
import InputField from '../../common/formInputs/InputField';

const AddUserForm = ({
	state,
	handleInputChangeForAddUser,
	handleSelectChange,
	addUser,
}) => {
	return (
		<div className="row clearfix">
			<div className="col-lg-12 col-md-12 col-sm-12">
				<InputField
					name="employeeCode"
					type="text"
					placeholder="Employee Code *"
					value={state.employeeCode}
					onChange={handleInputChangeForAddUser}
				/>
			</div>

			<div className="col-lg-6 col-md-6 col-sm-12">
				<InputField
					name="firstName"
					type="text"
					placeholder="First Name *"
					value={state.firstName}
					onChange={handleInputChangeForAddUser}
					error={state.errors.firstName}
					required
				/>
			</div>

			<div className="col-lg-6 col-md-6 col-sm-12">
				<InputField
					name="lastName"
					type="text"
					placeholder="Last Name"
					value={state.lastName}
					onChange={handleInputChangeForAddUser}
					error={state.errors.lastName}
				/>
			</div>

			<div className="col-md-4 col-sm-12">
				<InputField
					name="email"
					type="text"
					placeholder="Email ID *"
					value={state.email}
					onChange={handleInputChangeForAddUser}
					error={state.errors.email}
				/>
			</div>

			<div className="col-md-4 col-sm-12">
				<InputField
					name="mobileNo"
					type="text"
					placeholder="Mobile No"
					value={state.mobileNo}
					onChange={handleInputChangeForAddUser}
					error={state.errors.mobileNo}
					maxLength={10}
				/>
			</div>

			<div className="col-md-4 col-sm-12">
				<InputField
					name="selectedRole"
					type="select"
					value={state.selectedRole}
					onChange={handleSelectChange}
					options={[
							{ value: 'super_admin', label: 'Super Admin' },
							{ value: 'admin', label: 'Admin' }
							]}
				/>
			</div>

			<div className="col-sm-6 col-md-4">
				<InputField
					name="gender"
					type="select"
					value={state.gender}
					onChange={handleSelectChange}
					error={state.errors.gender}
					options={[
						{ value: 'male', label: 'Male' },
						{ value: 'female', label: 'Female' }
					]}
					required
				/>
			</div>

			<div className="col-md-4 col-sm-12">
				<InputField
					name="selectedDepartment"
					type="select"
					value={state.selectedDepartment}
					onChange={handleSelectChange}
					error={state.errors.selectedDepartment}
					options={state.departments.map(dept => 
					({
						value: dept.id,
						label: dept.department_name
					}))}
				/>
			</div>

			<div className="col-sm-6 col-md-4">
				<InputField
					name="dob"
					type="date"
					value={state.dob}
					onChange={handleInputChangeForAddUser}
					error={state.errors.dob}
				/>
			</div>

			<div className="col-md-4 col-sm-12">
				<InputField
					name="password"
					type="password"
					placeholder="Password"
					value={state.password}
					onChange={handleInputChangeForAddUser}
					error={state.errors.password}
				/>
			</div>

			<div className="col-md-4 col-sm-12">
				<InputField
					name="confirmPassword"
					type="password"
					placeholder="Confirm Password"
					value={state.confirmPassword}
					onChange={handleInputChangeForAddUser}
					error={state.errors.confirmPassword}
				/>
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
