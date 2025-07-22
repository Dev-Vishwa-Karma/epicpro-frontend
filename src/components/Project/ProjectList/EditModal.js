import React from 'react';

const EditModal = ({ 
    modalId, 
    isOpen, 
    onClose, 
    onSubmit, 
    formData, 
    onInputChange, 
    onSelectionChange, 
    onCheckboxChange,
    errors, 
    employees, 
    clients, 
    dropdownOpen, 
    toggleDropdown,
    isEditing,
    isLoading 
}) => {
    const labelId = `${modalId}Label`;
    
    return (
        <div
            className={`modal fade ${isOpen ? 'show' : ''}`}
            id={modalId}
            tabIndex={-1}
            role="dialog"
            aria-labelledby={labelId}
            style={{ display: isOpen ? 'block' : 'none', zIndex: 1050 }}
            onClick={(e) => {
                if (e.target.id === modalId) {
                    onClose();
                }
            }}
        >
            <div className="modal-dialog modal-dialog-scrollable" role="document">
                <div className="modal-content" tabIndex={-1}>
                    <div className="modal-header">
                        <h5 className="modal-title" id={labelId}>
                            {isEditing ? 'Edit Project' : 'Add Project'}
                        </h5>
                        <button 
                            type="button" 
                            className="close" 
                            onClick={onClose}
                            aria-label="Close"
                        >
                            <span aria-hidden="true">×</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        <div className="row clearfix">
                            <div className="col-md-12">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="projectName">Project Name</label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.projectName ? "is-invalid" : ""}`}
                                        placeholder="Project Name"
                                        name="projectName"
                                        value={formData.projectName || ""}
                                        onChange={onInputChange}
                                    />
                                    {errors.projectName && (
                                        <small className="invalid-feedback">{errors.projectName}</small>
                                    )}
                                </div>
                            </div>
                            <div className="col-md-12">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="projectDescription">Project Description</label>
                                    <textarea
                                        className={`form-control ${errors.projectDescription ? "is-invalid" : ""}`}
                                        placeholder="Project Description"
                                        name="projectDescription"
                                        value={formData.projectDescription || ""}
                                        onChange={onInputChange}
                                        rows={3}
                                    />
                                    {errors.projectDescription && (
                                        <small className="invalid-feedback">{errors.projectDescription}</small>
                                    )}
                                </div>
                            </div>
                            <div className="col-md-12">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="projectTechnology">Project Technology</label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.projectTechnology ? "is-invalid" : ""}`}
                                        placeholder="Enter technologies (comma-separated)"
                                        name="projectTechnology"
                                        value={formData.projectTechnology || ""}
                                        onChange={onInputChange}
                                    />
                                    {errors.projectTechnology && (
                                        <small className="invalid-feedback">{errors.projectTechnology}</small>
                                    )}
                                </div>
                            </div>
                            {/* Client Details */}
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="selectedClient">Select Client</label>
                                    <select
                                        name='selectedClient'
                                        id="selectedClient"
                                        className={`form-control ${errors.selectedClient ? "is-invalid" : ""}`}
                                        value={formData.selectedClient || ""}
                                        onChange={onSelectionChange}
                                    >
                                        {clients && clients.length > 0 ? (
                                            <>
                                                <option value="">Select a Client</option>
                                                {clients.map((client) => (
                                                    <option key={client.id} value={client.id}>
                                                        {client.name}
                                                    </option>
                                                ))}
                                            </>
                                        ) : (
                                            <option value="">No clients available</option>
                                        )}
                                    </select>
                                    {errors.selectedClient && (
                                        <small className="invalid-feedback">{errors.selectedClient}</small>
                                    )}
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="form-label">Assign Team Members</label>
                                    {/* Custom dropdown */}
                                    <div className="dropdown w-100">
                                        <button
                                            type="button"
                                            className="form-control dropdown-toggle"
                                            onClick={toggleDropdown}
                                            style={{ textAlign: "left" }}
                                        >
                                            {formData.teamMembers && formData.teamMembers.length > 0
                                                ? `${formData.teamMembers.length} selected`
                                                : "Select Team Members"}
                                        </button>

                                        {dropdownOpen && (
                                            <div className="dropdown-menu show w-100 p-2" style={{ maxHeight:"120px", overflowY: "auto" }}>
                                                {employees && employees.map((employee) => (
                                                   <ul style={{ listStyleType: "none", padding: 0 }} key={employee.id}>
                                                        <li>
                                                    <div key={employee.id} className="form-check">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id={`emp_${employee.id}`}
                                                            value={String(employee.id)}
                                                            checked={formData.teamMembers && formData.teamMembers.includes(String(employee.id))}
                                                            onChange={onCheckboxChange}
                                                        />
                                                        <label className="form-check-label" htmlFor={`emp_${employee.id}`}>
                                                            {employee.first_name} {employee.last_name}
                                                        </label>
                                                    </div>
                                                        </li>
                                                   </ul>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {errors.teamMembers && (
                                        <small className="invalid-feedback">{errors.teamMembers}</small>
                                    )}
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="projectStartDate">Project start date</label>
                                    <input
                                        type="date"
                                        className={`form-control ${errors.projectStartDate ? "is-invalid" : ""}`}
                                        name="projectStartDate"
                                        value={formData.projectStartDate || ""}
                                        onChange={onInputChange}
                                    />
                                    {errors.projectStartDate && (
                                        <small className="invalid-feedback">{errors.projectStartDate}</small>
                                    )}
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="projectEndDate">Project end date</label>
                                    <input
                                        type="date"
                                        className={`form-control ${errors.projectEndDate ? "is-invalid" : ""}`}
                                        name="projectEndDate"
                                        value={formData.projectEndDate || ""}
                                        onChange={onInputChange}
                                    />
                                    {errors.projectEndDate && (
                                        <small className="invalid-feedback">{errors.projectEndDate}</small>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Close
                        </button>
                        <button 
                            type="button" 
                            onClick={onSubmit} 
                            className="btn btn-primary"
                            // disabled={isLoading}
                        >
                            {/* {isLoading && (
                                <span
                                    className="spinner-border spinner-border-sm mr-2"
                                    role="status"
                                    aria-hidden="true"
                                ></span>
                            )} */}
                            {isEditing ? 'Update Project' : 'Add Project'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditModal; 