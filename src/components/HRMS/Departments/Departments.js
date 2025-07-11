import React, { Component } from 'react'
import { connect } from 'react-redux';
import AlertMessages from '../../common/AlertMessages';
import DepartmentModal from './DepartmentModal';
import DeleteModal from '../../common/DeleteModal';
import DepartmentTable from './DepartmentTable';
import DepartmentGrid from './DepartmentGrid';
class departments extends Component {
    constructor(props) {
		super(props);
		this.state = {
            department_name: "",
            department_head: "",
            departmentData: [],
            selectedDepartment: null,
            departmentToDelete: null,
			successMessage: "",
            errorMessage: "",
            showSuccess: false,
            showError: false,
            errors: {},
            loading: true,
            ButtonLoading: false,
            showModal: false
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

    // Handle Add button click
    handleAddClick = () => {
        this.setState({ 
            showModal: true, 
            selectedDepartment: null,
            department_name: '', 
            department_head: '', 
            errors: {} 
        });
    }

    // Handle edit button click
    handleEditClick = (department) => {
    this.setState({
        selectedDepartment: { ...department },
        showModal: true,
        errors: {}
    });
    };

    getFormData = () => {
        const { selectedDepartment } = this.state;
        if (selectedDepartment) {
            return selectedDepartment;
        } else {
            return {
                department_name: this.state.department_name,
                department_head: this.state.department_head
            };
        }
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
                this.onCloseAddEdit()
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

    onCloseAddEdit = () => {
        this.setState({ showModal: false,
             selectedDepartment: null, 
             department_name: '', 
             department_head: '', 
             errors: {} 
            })
    } 
      
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
        console.log('name',name,value)
        this.setState({ 
            [name]: value,
            errors: { ...this.state.errors, [name]: "" }
        });
    };

    // Validate Add Department Form
	validateDepartmentForm = (e) => {
		const { department_name, department_head } = this.state;
        let errors = {};
        let isValid = true;

        // Department Name validation (only letters and spaces)
        const namePattern = /^[a-zA-Z\s]+$/;
        if (!department_name.trim()) {
            errors.department_name = "Department Name is required.";
            isValid = false;
        } else if (!namePattern.test(department_name)) {
            errors.department_name = "Department Name must only contain letters and spaces.";
            isValid = false;
        }

        // Department Head validation (only letters and spaces)
        if (!department_head.trim()) {
            errors.department_head = "Department Head is required.";
            isValid = false;
        } else if (!namePattern.test(department_head)) {
            errors.department_head = "Department Head must only contain letters and spaces.";
            isValid = false;
        }

        this.setState({ errors });
        return isValid;
	};

    // Add department data API call
    addDepartmentData = () => {
        const { department_name, department_head} = this.state;

        if (!this.validateDepartmentForm()) {
            return; // Stop execution if validation fails
        }

        this.setState({ ButtonLoading: true });

        const addDepartmentFormData = new FormData();
        addDepartmentFormData.append('department_name', department_name);
        addDepartmentFormData.append('department_head', department_head);

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
                    department_name: "",
                    department_head: "",
                    numOfEmployees: "",
                    errors:{},
                    successMessage: "Department added successfully!",
                    showSuccess: true,
                    ButtonLoading: false
                }));
                this.onCloseAddEdit();

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
            department_name: "",
            department_head: ""
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

    render() {
        const { fixNavbar } = this.props;
        const { departmentData, selectedDepartment, message, loading,showSuccess,successMessage,showError,errorMessage} = this.state;
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
                                       <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={() => this.handleAddClick()}>
                                        <i className="fe fe-plus mr-2" />
                                        Add
                                        </button>
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
                                                </div>
                                            </div>
                                            <div className="card-body">
                                                {loading ? (
                                                    <div className="card-body">
                                                        <div className="dimmer active">
                                                            <div className="loader" />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <DepartmentTable 
                                                        departmentData={departmentData} 
                                                        message={message}
                                                        onEditClick={this.handleEditClick} 
                                                        onDeleteClick={this.openModal} 
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="tab-pane fade" id="Departments-grid" role="tabpanel">
                                         <DepartmentGrid
                                            departmentData={departmentData}
                                            onEditClick={this.handleEditClick}
                                            onDeleteClick={this.openModal}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <DepartmentModal
                        isEdit={!!selectedDepartment}
                        show={this.state.showModal}
                        modalId="departmentModal"
                        onClose= {this.onCloseAddEdit}
                        onSubmit={selectedDepartment ? this.saveChanges : this.addDepartmentData}
                        onChange={selectedDepartment ? this.handleInputChange : this.handleInputChangeForAddDepartment}
                        formData={this.getFormData()}
                        errors={this.state.errors}
                        loading={this.state.ButtonLoading}
                    />
                    <DeleteModal
                        onConfirm={this.confirmDelete}
                        isLoading={this.state.ButtonLoading}
                        deleteBody='Are you sure you want to delete the Department?'
                        modalId="deleteDepartmentModal"
                    />
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