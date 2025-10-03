import React from 'react';
import InputField from '../../../common/formInputs/InputField';
import Button from '../../../common/formInputs/Button';
import { getSortedEmployees } from '../../../../utils';

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
    
    const sortedEmployees = Array.isArray(employees) ? getSortedEmployees(employees) : [];
    
    return (
        <>
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
                                <InputField
                                label="Project Name"
                                name="projectName"
                                type="text"
                                placeholder="Project Name"
                                value={formData.projectName || ""}
                                onChange={onInputChange}
                                error={errors.projectName}
                                />
                            </div>
                            <div className="col-md-12">
                                <InputField
                                label="Project Description"
                                name="projectDescription"
                                type="textarea"
                                placeholder="Project Description"
                                value={formData.projectDescription || ""}
                                onChange={onInputChange}
                                error={errors.projectDescription}
                                />
                            </div>
                            <div className="col-md-12">
                                <InputField
                                label="Project Technology"
                                name="projectTechnology"
                                type="text"
                                placeholder="Enter technologies (comma-separated)"
                                value={formData.projectTechnology || ""}
                                onChange={onInputChange}
                                error={errors.projectTechnology}
                                />
                            </div>
                            {/* Client Details */}
                            <div className="col-md-6">
                                <InputField
                                label="Select Client"
                                name="selectedClient"
                                type="select"
                                style={{ minWidth: '220px' }}
                                containerClassName="mb-0"
                                inputClassName="custom-select w-auto"
                                value={formData.selectedClient || ""}
                                onChange={onSelectionChange}
                                error={errors.selectedClient}
                                options={
                                    clients && clients.length > 0
                                    ? [...clients.map(client => ({
                                        value: client.id,
                                        label: client.name,
                                        }))]
                                    : [{ value: "", label: "No clients available" }]
                                }
                                />
                            </div>

                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="form-label">Assign Team Members</label>
                                    {/* Custom dropdown */}
                                    <div className="dropdown w-100">
                                        <button
                                            type="button"
                                            className="form-control custom-select"
                                            onClick={toggleDropdown}
                                            style={{ textAlign: "left" }}
                                        >
                                            {formData.teamMembers && formData.teamMembers.length > 0
                                                ? `${formData.teamMembers.length} selected`
                                                : "Select Team Members"}
                                        </button>

                                        {dropdownOpen && (
                                            <div className="dropdown-menu show w-100 p-2" style={{ maxHeight:"120px", overflowY: "auto" }}>
                                                {sortedEmployees && sortedEmployees
                                                .filter(employee => employee.status === 1)
                                                .map((employee) => (
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
                                <InputField
                                label="Project start date"
                                name="projectStartDate"
                                type="date"
                                value={formData.projectStartDate || ""}
                                onChange={onInputChange}
                                error={errors.projectStartDate}
                                />
                            </div>
                            <div className="col-md-6">
                                <InputField
                                label="Project end date"
                                name="projectEndDate"
                                type="date"
                                value={formData.projectEndDate || ""}
                                onChange={onInputChange}
                                error={errors.projectEndDate}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <Button
                        label="Close"
                        onClick={onClose}
                        className="btn-secondary"
                        />

                        <Button
                        label={isEditing ? 'Update Project' : 'Add Project'}
                        onClick={onSubmit}
                        className="btn-primary"
                        // disabled={isLoading}
                        // You can uncomment the line below if you want to handle loading state:
                        // loading={isLoading}
                        />
                    </div>
                </div>
            </div>
        </div>
        {isOpen && <div className="modal-backdrop fade show" style={{ zIndex: 1040 }} />}
        </>
    );
};

export default EditModal; 