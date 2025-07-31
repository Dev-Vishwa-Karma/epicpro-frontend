import React from 'react';

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
										<div className="form-group">
											<label className="form-label">First Name</label>
											<input
												type="text"
												className={`form-control${errors.firstName ? ' is-invalid' : ''}`}
												value={selectedUser?.first_name || ""}
												onChange={handleInputChangeForEditUser}
												name="first_name"
											/>
											{errors.firstName && (
												<div className="invalid-feedback d-block">{errors.firstName}</div>
											)}
										</div>
									</div>

									<div className="col-md-12">
										<div className="form-group">
											<label className="form-label">Last Name</label>
											<input
												type="text"
												className={`form-control${errors.lastName ? ' is-invalid' : ''}`}
												value={selectedUser?.last_name || ""}
												onChange={handleInputChangeForEditUser}
												name="last_name"
											/>
											{errors.lastName && (
												<div className="invalid-feedback d-block">{errors.lastName}</div>
											)}
										</div>
									</div>

									<div className="col-md-12">
										<div className="form-group">
											<label className="form-label">Email Address</label>
											<input
												type="text"
												className={`form-control${errors.email ? ' is-invalid' : ''}`}
												value={selectedUser?.email || ""}
												onChange={handleInputChangeForEditUser}
												name="email"
											/>
											{errors.email && (
												<div className="invalid-feedback d-block">{errors.email}</div>
											)}
										</div>
									</div>

									<div className="col-md-12">
										<div className="form-group">
											<label className="form-label">Date of Birth</label>
											<input
												type="date"
												className={`form-control${errors.dob ? ' is-invalid' : ''}`}
												value={selectedUser?.dob || ""}
												onChange={handleInputChangeForEditUser}
												name="dob"
												max={new Date().toISOString().split("T")[0]}
											/>
											{errors.dob && (
												<div className="invalid-feedback d-block">{errors.dob}</div>
											)}
										</div>
									</div>

									<div className="col-md-6">
										<div className="form-group">
											<label className="form-label">Role</label>
											<select
												className="form-control show-tick"
												value={selectedUser?.role || ""}
												onChange={handleSelectChange}
												name="role"
											>
												<option value="">Select Role Type</option>
												<option value="super_admin">Super Admin</option>
												<option value="admin">Admin</option>
											</select>
										</div>
									</div>

									<div className="col-md-6">
										<div className="form-group">
											<label className="form-label">Position</label>
											<select
												className="form-control show-tick"
												value={selectedUser?.department_id || ""}
												onChange={handleSelectChange}
												name="department_id"
											>
												<option value="">Select Position</option>
												{departments.map((dept) => (
													<option key={dept.id} value={dept.id}>
														{dept.department_name}
													</option>
												))}
											</select>
										</div>
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
