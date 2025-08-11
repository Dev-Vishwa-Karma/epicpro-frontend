import React from 'react';
import InputField from '../../../common/formInputs/InputField';

const EditUserModal = ({
	selectedUser,
	departments,
	errors,
	handleInputChangeForEditUser,
	handleSelectChange,
	updateProfile,
	ButtonLoading
}) => {
	return (
		<div className="modal fade" id="editUserModal" tabIndex={-1} role="dialog" aria-labelledby="editUserModalLabel">
			<div className="modal-dialog" role="document">
				<div className="modal-content">
					<div className="modal-header">
						<h5 className="modal-title" id="editUserModalLabel">Edit User</h5>
						<button type="button" className="close" data-dismiss="modal" aria-label="Close">
							<span aria-hidden="true">×</span>
						</button>
					</div>
					<form>
						<div className="modal-body">
							{selectedUser ? (
								<div className="row clearfix">
									<div className="col-md-12">
										<InputField
											label="First Name"
											name="first_name"
											type="text"
											value={selectedUser?.first_name || ""}
											onChange={handleInputChangeForEditUser}
											error={errors.firstName}
											placeholder="Enter First Name"
										/>
									</div>

									<div className="col-md-12">
										<InputField
											label="Last Name"
											name="last_name"
											type="text"
											value={selectedUser?.last_name || ""}
											onChange={handleInputChangeForEditUser}
											error={errors.lastName}
											placeholder="Enter Last Name"
										/>
									</div>

									<div className="col-md-12">
										<InputField
											label="Email Address"
											name="email"
											type="text"
											value={selectedUser?.email || ""}
											onChange={handleInputChangeForEditUser}
											error={errors.email}
											placeholder="Enter Email"
										/>
									</div>

									<div className="col-md-12">
										<InputField
											label="Date of Birth"
											name="dob"
											type="date"
											value={selectedUser?.dob || ""}
											onChange={handleInputChangeForEditUser}
											error={errors.dob}
											max={new Date().toISOString().split("T")[0]}
										/>
									</div>

									<div className="col-md-6">
										<InputField
											label="Role"
											name="role"
											type="select"
											value={selectedUser?.role || ""}
											onChange={handleSelectChange}
											options={[
													{ value: 'super_admin', label: 'Super Admin' },
													{ value: 'admin', label: 'Admin' }
													]}
										/>
									</div>

									<div className="col-md-6">
										<InputField
											label="Position"
											name="department_id"
											type="select"
											value={selectedUser?.department_id || ""}
											onChange={handleSelectChange}
											options={departments.map(dept => 
											({
												value: dept.id,
												label: dept.department_name
											}))}
										/>
									</div>
								</div>
							) : (
								<p>Loading user data...</p>
							)}
						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
							<button
								type="button"
								onClick={updateProfile}
								className="btn btn-primary"
								disabled={ButtonLoading}
							>
								{ButtonLoading && (
									<span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
								)}
								Update Profile
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default EditUserModal;
