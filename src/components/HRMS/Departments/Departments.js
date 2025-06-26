import React, { Component } from 'react'
import { connect } from 'react-redux';

class departments extends Component {
    constructor(props) {
		super(props);
		this.state = {
            departmentName: "",
            departmentHead: "",
            departmentData: [], // To store the list of users
            selectedDepartment: null,
            departmentToDelete: null,
		    // message: null, // To store error messages
			successMessage: "",
            errorMessage: "",
            showSuccess: false,
            showError: false,
            errors: {},
            loading: true,
            ButtonLoading: false
		};

        // Create a ref to scroll to the message container
        this.messageRef = React.createRef();
	}

    componentDidMount() {
        fetch(`${process.env.REACT_APP_API_URL}/departments.php?action=view`, {
            method: "GET",
        })
		.then(response => response.json())
		.then(data => {
            if (data.status === 'success') {
                this.setState({ departmentData: data.data, loading: false }); // Update users in state
            } else {
                this.setState({ message: data.message, loading: false }); // Update error in state
            }
		})
		.catch(err => {
			this.setState({ message: 'Failed to fetch data', loading: false });
			console.error(err);
		});
    }

    // Handle edit button click
    handleEditClick = (department) => {
        this.setState({ selectedDepartment: department });
    };

    // Handle input change for editing fields
    handleInputChange = (e) => {
        const { name, value } = e.target;
        this.setState((prevState) => ({
            selectedDepartment: {
                ...prevState.selectedDepartment,
                [name]: value, // Dynamically update the field
            },
            errors: {
                ...prevState.errors,
                [name]: "", // Clear error when typing
            }
        }));
    };

    validateEditDepartmentForm = () => {
        const { selectedDepartment } = this.state;
        let errors = {};
        let isValid = true;
    
        if (!selectedDepartment) return false;
    
        // Validation rules (only letters and spaces)
        const namePattern = /^[a-zA-Z\s]+$/;
    
        // Department Name Validation
        const deptName = selectedDepartment.department_name ? selectedDepartment.department_name : "";
        if (!deptName.trim()) {
            errors.department_name = "Department Name is required.";
            isValid = false;
        } else if (!namePattern.test(deptName)) {
            errors.department_name = "Department Name must only contain letters and spaces.";
            isValid = false;
        }
    
        // Department Head Validation
        const deptHead = selectedDepartment.department_head ? selectedDepartment.department_head : "";
        if (!deptHead.trim()) {
            errors.department_head = "Department Head is required.";
            isValid = false;
        } else if (!namePattern.test(deptHead)) {
            errors.department_head = "Department Head must only contain letters and spaces.";
            isValid = false;
        }
    
        this.setState({ errors });
        return isValid;
    };

    // Save the changes (API call)
    saveChanges = () => {
        if (!this.validateEditDepartmentForm()) {
            return; // Stop if validation fails
        }

        this.setState({ ButtonLoading: true });

        const { selectedDepartment } = this.state;
        if (!selectedDepartment) return;

        // Example API call
        fetch(`${process.env.REACT_APP_API_URL}/departments.php?action=edit&id=${selectedDepartment.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                department_name: selectedDepartment.department_name,
                department_head: selectedDepartment.department_head,
            }),
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Failed to update department');
            }
            return response.json();
        })
        .then((data) => {
            if (data.success) {
                this.setState((prevState) => {
                    // Update the existing department in the array
                    const updatedDepartmentData = prevState.departmentData.map((dept) =>
                        dept.id === selectedDepartment.id ? { ...dept, ...data.updatedDepartmentData } : dept
                    );
                
                    return {
                        departmentData: updatedDepartmentData,
                        successMessage: 'Department updated successfully',
						showSuccess: true,
                        errorMessage: '',
					    showError: false,
                        ButtonLoading: false
                    };
                });
                setTimeout(this.dismissMessages, 3000);
                document.querySelector("#editDepartmentModal .close").click();
            } else {
                this.setState({ 
					errorMessage: "Failed to update department",
					showError: true,
                    successMessage: '',
					showSuccess: false,
                    ButtonLoading: false
				});
                setTimeout(this.dismissMessages, 3000);
            }
        })
        .catch((error) => {
            console.error("Error:", error);
            this.setState({
                errorMessage: "Error updating department:", error,
                showError: true,
                successMessage: '',
				showSuccess: false,
                ButtonLoading: false
            });
            setTimeout(this.dismissMessages, 3000);
        });
    };

    openModal = (departmentId) => {
        this.setState({
            departmentToDelete: departmentId, // Save the department data
        });
    };
      
    confirmDelete = () => {
        const { departmentToDelete } = this.state;
      
        if (!departmentToDelete) return;

        this.setState({ ButtonLoading: true });
      
        fetch(`${process.env.REACT_APP_API_URL}/departments.php?action=delete&id=${departmentToDelete}`, {
          method: 'DELETE',
        })
        .then((response) => response.json())
        .then((data) => {
        if (data.success) {
            this.setState((prevState) => ({
                departmentData: prevState.departmentData.filter((d) => d.id !== departmentToDelete),
                successMessage: "Department deleted successfully",
                showSuccess: true,
                errorMessage: '',
			    showError: false,
                ButtonLoading: false,

            }));
            document.querySelector("#deleteDepartmentModal .close").click();
            setTimeout(this.dismissMessages, 3000);
        } else {
            this.setState({
                errorMessage: "Failed to delete department",
                showError: true,
                successMessage: '',
                showSuccess: false,
                ButtonLoading: false,
            });
           setTimeout(this.dismissMessages, 3000);
        }
        })
        .catch((error) => {
			console.error("Error:", error);
			this.setState({
                ButtonLoading: false,
			});
		});
        
    };

    // Handle input changes
    handleInputChangeForAddDepartment = (event) => {
        const { name, value } = event.target;
        this.setState({ 
            [name]: value,
            errors: { ...this.state.errors, [name]: "" }
        });
    };

    // Validate Add Department Form
	validateDepartmentForm = (e) => {
		const { departmentName, departmentHead } = this.state;
        let errors = {};
        let isValid = true;

        // Department Name validation (only letters and spaces)
        const namePattern = /^[a-zA-Z\s]+$/;
        if (!departmentName.trim()) {
            errors.departmentName = "Department Name is required.";
            isValid = false;
        } else if (!namePattern.test(departmentName)) {
            errors.departmentName = "Department Name must only contain letters and spaces.";
            isValid = false;
        }

        // Department Head validation (only letters and spaces)
        if (!departmentHead.trim()) {
            errors.departmentHead = "Department Head is required.";
            isValid = false;
        } else if (!namePattern.test(departmentHead)) {
            errors.departmentHead = "Department Head must only contain letters and spaces.";
            isValid = false;
        }

        this.setState({ errors });
        return isValid;
	};

    // Add department data API call
    addDepartmentData = () => {
        const { departmentName, departmentHead} = this.state;

        if (!this.validateDepartmentForm()) {
            return; // Stop execution if validation fails
        }

        this.setState({ ButtonLoading: true });

        const addDepartmentFormData = new FormData();
        addDepartmentFormData.append('department_name', departmentName);
        addDepartmentFormData.append('department_head', departmentHead);

        // API call to add department
        fetch(`${process.env.REACT_APP_API_URL}/departments.php?action=add`, {
            method: "POST",
            body: addDepartmentFormData,
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                // Update the department list
                this.setState((prevState) => ({
                    departmentData: [...(prevState.departmentData || []), data.newDepartment], // Assuming the backend returns the new department
                    departmentName: "",
                    departmentHead: "",
                    numOfEmployees: "",
                    errors:{},
                    successMessage: "Department added successfully!",
                    showSuccess: true,
                    ButtonLoading: false
                }));
                // Close the modal
                document.querySelector("#addDepartmentModal .close").click();

                setTimeout(this.dismissMessages, 3000);
            } else {
                this.setState({
                    errorMessage: "Failed to add department. Please try again.",
                    showError: true,
                    ButtonLoading: false
                });

                setTimeout(this.dismissMessages, 3000);
            }
        })
        .catch((error) => {
            console.error("Error:", error);
            this.setState({
                errorMessage: "An error occurred while adding the department.",
                showError: true,
                ButtonLoading: false
            });
            setTimeout(this.dismissMessages, 3000);
        });
    };

    // Reset form errors when modal is closed
    resetFormErrors = () => {
        this.setState({
            errors: {}, // Clear all error messages
            departmentName: "",
            departmentHead: ""
        });
    };

    // Function to dismiss messages
    dismissMessages = () => {
        this.setState({
            showSuccess: false,
            successMessage: "",
            showError: false,
            errorMessage: "",
        });
    };

    renderAlertMessages = () => (
    <>
      <div className={`alert alert-success alert-dismissible fade show ${this.state.showSuccess ? "d-block" : "d-none"}`}
        role="alert"
        style={{ position: "fixed", top: "20px", right: "20px", zIndex: 1050, minWidth: "250px", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" }}
      >
        <i className="fa-solid fa-circle-check me-2"></i>
        {this.state.successMessage}
        <button type="button" className="close" onClick={() => this.setState({ showSuccess: false })}></button>
      </div>

      <div className={`alert alert-danger alert-dismissible fade show ${this.state.showError ? "d-block" : "d-none"}`}
        role="alert"
        style={{ position: "fixed", top: "20px", right: "20px", zIndex: 1050, minWidth: "250px", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" }}
      >
        <i className="fa-solid fa-triangle-exclamation me-2"></i>
        {this.state.errorMessage}
        <button type="button" className="close" onClick={() => this.setState({ showError: false })}></button>
      </div>
    </>
  );

    render() {
        const { fixNavbar } = this.props;
        const { departmentName, departmentHead, departmentData, selectedDepartment, message, loading } = this.state;
        return (
            <>
            {this.renderAlertMessages()}
                <div>
                    <div>
                        <div className={`section-body ${fixNavbar ? "marginTop" : ""} `}>
                            <div className="container-fluid">
                                <div className="d-flex justify-content-between align-items-center">
                                    <ul className="nav nav-tabs page-header-tab">
                                        <li className="nav-item"><a className="nav-link active" id="Departments-tab" data-toggle="tab" href="#Departments-list">List View</a></li>
                                        <li className="nav-item"><a className="nav-link" id="Departments-tab" data-toggle="tab" href="#Departments-grid">Grid View</a></li>
                                    </ul>
                                    <div className="header-action">
                                        <button type="button" className="btn btn-primary" data-toggle="modal" data-target="#addDepartmentModal"><i className="fe fe-plus mr-2" />Add</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="section-body mt-3">
                            <div className="container-fluid">
                                <div className="tab-content mt-3">
                                    <div className="tab-pane fade show active" id="Departments-list" role="tabpanel">
                                        <div className="card">
                                            <div className="card-header">
                                                <h3 className="card-title">Departments List</h3>
                                                <div className="card-options">
                                                    {/* <div className="input-group">
                                                        <input type="text" className="form-control form-control-sm" placeholder="Search something..." name="s" />
                                                        <span className="input-group-btn ml-2"><button className="btn btn-icon" type="submit"><span className="fe fe-search" /></button></span>
                                                    </div> */}
                                                </div>
                                            </div>
                                            <div className="card-body">
                                                <div className="table-responsive">
                                                    {loading ? (
                                                        <div className="card-body">
                                                            <div className="dimmer active">
                                                                <div className="loader" />
                                                            </div>
                                                        </div>
                                                    ) : ( // Show Table after loading is false
                                                        <table className="table table-striped table-vcenter table-hover mb-0">
                                                            <thead>
                                                                <tr>
                                                                    <th>#</th>
                                                                    <th>Department Name</th>
                                                                    <th>Department Head</th>
                                                                    <th>Total Employee</th>
                                                                    <th>Action</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {departmentData.length > 0 ? (
                                                                    departmentData.map((department, index) => (
                                                                        <tr key={index}>
                                                                            <td>{index + 1}</td>
                                                                            <td>
                                                                                <div className="font-15">{department.department_name}</div>
                                                                            </td>
                                                                            <td>{department.department_head}</td>
                                                                            <td>{department.total_employee}</td>
                                                                            <td>
                                                                                <button 
                                                                                    type="button"
                                                                                    className="btn btn-icon"
                                                                                    title="Edit"
                                                                                    data-toggle="modal"
                                                                                    data-target="#editDepartmentModal"
                                                                                    onClick={() => this.handleEditClick(department)}
                                                                                >
                                                                                    <i className="fa fa-edit" />
                                                                                </button>
                                                                                <button 
                                                                                    type="button"
                                                                                    className="btn btn-icon btn-sm js-sweetalert"
                                                                                    title="Delete"
                                                                                    data-type="confirm"
                                                                                    onClick={() => this.openModal(department.id)}
                                                                                    data-toggle="modal"
                                                                                    data-target="#deleteDepartmentModal"
                                                                                >
                                                                                    <i className="fa fa-trash-o text-danger" />
                                                                                </button>
                                                                            </td>
                                                                        </tr>
                                                                    ))
                                                                ): (
                                                                    !message && <tr><td>Department not found</td></tr>
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="tab-pane fade" id="Departments-grid" role="tabpanel">
                                        <div className="row clearfix">
                                            {departmentData.length > 0 ? (
                                                departmentData.map((department, index) => (
                                                    <div className="col-lg-3 col-md-6" key={index}>
                                                        <div className="card">
                                                            <div className="card-body text-center">
                                                                <img className="img-thumbnail rounded-circle avatar-xxl" src="../assets/images/sm/avatar2.jpg" alt="fake_url" />
                                                                <h6 className="mt-3">{department.department_head}</h6>
                                                                <div className="text-center text-muted mb-2">{department.department_name}</div>
                                                                <div className="text-center text-muted mb-3">Total Employee : {department.total_employee}</div>
                                                                <button 
                                                                    type="button"
                                                                    className="btn btn-icon btn-outline-primary mr-2"
                                                                    title="Edit"
                                                                    data-toggle="modal"
                                                                    data-target="#editDepartmentModal"
                                                                    onClick={() => this.handleEditClick(department)}
                                                                >
                                                                    <i className="fa fa-pencil" />
                                                                </button>
                                                                <button 
                                                                    type="button"
                                                                    className="btn btn-icon btn-outline-danger"
                                                                    title="Delete"
                                                                    data-type="confirm"
                                                                    onClick={() => this.openModal(department.id)}
                                                                    data-toggle="modal"
                                                                    data-target="#deleteDepartmentModal"
                                                                >
                                                                    <i className="fa fa-trash" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ): (
                                                <div>
                                                    <span colSpan="2">Department not found</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                    {/* Add Department Modal */}
                    <div className="modal fade" id="addDepartmentModal" tabIndex={-1} role="dialog" aria-labelledby="addDepartmentModalLabel" data-backdrop="static" 
                    data-keyboard="false">
                        <div className="modal-dialog" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="addDepartmentModalLabel">Add Departments</h5>
                                    <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={this.resetFormErrors}><span aria-hidden="true">×</span></button>
                                </div>
                                <div className="modal-body">
                                    <div className="row clearfix">
                                        <div className="col-md-12">
                                            <div className="form-group">
                                                <label className="form-label" htmlFor="departmentName">Department Name</label>
                                                <input
                                                    type="text"
                                                    // className="form-control"
												    className={`form-control ${this.state.errors.departmentName ? "is-invalid" : ""}`}
                                                    placeholder="Departments Name"
                                                    name="departmentName"
                                                    value={departmentName}
                                                    onChange={this.handleInputChangeForAddDepartment}
                                                />
                                                {this.state.errors.departmentName && (
                                                    <small className="invalid-feedback">{this.state.errors.departmentName}</small>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-md-12">
                                            <div className="form-group">
                                                <label className="form-label" htmlFor="departmentHead">Department Head</label>
                                                <input
                                                    type="text"
                                                    className={`form-control ${this.state.errors.departmentHead ? "is-invalid" : ""}`}
                                                    placeholder="Departments Head"
                                                    name="departmentHead"
                                                    value={departmentHead}
                                                    onChange={this.handleInputChangeForAddDepartment}
                                                />
                                                {this.state.errors.departmentHead && (
                                                    <small className="invalid-feedback">{this.state.errors.departmentHead}</small>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={this.resetFormErrors}>Close</button>
                                    <button type="button" onClick={this.addDepartmentData} className="btn btn-primary" disabled={this.state.ButtonLoading}>
                                        {this.state.ButtonLoading ? <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span> : null}
                                        Save changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Edit Department Modal */}
                    <div className="modal fade" id="editDepartmentModal" tabIndex={-1} role="dialog" aria-labelledby="editDepartmentModalLabel" data-backdrop="static" data-keyboard="false">
                        <div className="modal-dialog" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="editDepartmentModalLabel">Edit Departments</h5>
                                    <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={this.resetFormErrors}><span aria-hidden="true">×</span></button>
                                </div>
                                <div className="modal-body">
                                    {selectedDepartment ? (
                                        <>
                                            <div className="row clearfix">
                                                <div className="col-md-12">
                                                    <div className="form-group">
                                                        <label className="form-label" htmlFor='department_name'>Departments Name</label>
                                                        <input 
                                                            type="text"
                                                            className={`form-control ${this.state.errors.department_name ? "is-invalid" : ""}`}
                                                            value={selectedDepartment.department_name || ''} onChange={this.handleInputChange}
                                                            name="department_name"
                                                        />
                                                        {this.state.errors.department_name && (
                                                            <small className="invalid-feedback">{this.state.errors.department_name}</small>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="col-md-12">
                                                    <div className="form-group">
                                                        <label className="form-label">Departments Head</label>
                                                        <input
                                                            type="text"
                                                            className={`form-control ${this.state.errors.department_head ? "is-invalid" : ""}`}
                                                            value={selectedDepartment.department_head || ''} onChange={this.handleInputChange}
                                                            name="department_head"
                                                        />
                                                        {this.state.errors.department_head && (
                                                            <small className="invalid-feedback">{this.state.errors.department_head}</small>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <p>Department data not found.</p>
                                    )}
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={this.resetFormErrors}>Close</button>
                                    <button type="button" className="btn btn-primary" onClick={this.saveChanges} disabled={this.state.ButtonLoading}>
                                        {this.state.ButtonLoading ? <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span> : null}
                                        Save changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Delete Department Model */}
                    <div 
                        className="modal fade" id="deleteDepartmentModal" tabIndex={-1} role="dialog" aria-labelledby="deleteDepartmentModalLabel"
                    >
                        <div className="modal-dialog" role="document">
                            <div className="modal-content">
                                <div className="modal-header" style={{ display: 'none' }}>
                                    <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>
                                </div>
                                <div className="modal-body">
                                    <div className="row clearfix">
                                        <p>Are you sure you want to delete the department?</p>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" data-dismiss="modal" >Cancel</button>
                                    <button type="button" onClick={this.confirmDelete} className="btn btn-danger" isabled={this.state.ButtonLoading}>
                                        {this.state.ButtonLoading && (
											<span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
										)}
                                        Delete</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}
const mapStateToProps = state => ({
    fixNavbar: state.settings.isFixNavbar
})

const mapDispatchToProps = dispatch => ({})
export default connect(mapStateToProps, mapDispatchToProps)(departments);