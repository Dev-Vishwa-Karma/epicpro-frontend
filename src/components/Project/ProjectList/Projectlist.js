import React, { Component } from 'react'
import { connect } from 'react-redux';
import {
    boxAction, box2Action, box3Action, box4Action, box5Action, box6Action
} from '../../../actions/settingsAction';
import AlertMessages from '../../common/AlertMessages';
import DeleteModal from '../../common/DeleteModal';
import EditModal from './EditModal';

class ProjectList extends Component {
    constructor(props) {
        super(props);
        this.handleBox = this.handleBox.bind(this);
        this.state = {
            projectName: "",
            projectDescription: "",
            projectTechnology: "",
            teamMembers: [],
            projectStartDate: "",
            projectEndDate: "",
            successMessage: "",
            errorMessage: "",
            dropdownOpen: false,
            showSuccess: false,
            showError: false,
            employees: [],
            clients: [],
            projects: [],
            allProjects: '',
            selectedClient: "",
            logged_in_employee_id: null,
            logged_in_employee_role: null,
			searchQuery: "",
            errors: {},
            collapsedCards: {},
            editingProjectId: null,
            isEditing: false,
            showDeleteModal: false,
            deleteProjectId: null,
            deleteProjectName: '',
            isDeleting: false,
            showEditModal: false,
            isSubmitting: false,
        }
    }
    handleBoxToggle = (index) => {
        this.setState((prevState) => ({
            collapsedCards: {
                ...prevState.collapsedCards,
                [index]: !prevState.collapsedCards[index], // toggle only the clicked card
            },
        }));
    };
    handleBox(e) {
        this.props.boxAction(e)
    }
    handleBox2(e) {
        this.props.box2Action(e)
    }
    handleBox3(e) {
        this.props.box3Action(e)
    }
    handleBox4(e) {
        this.props.box4Action(e)
    }
    handleBox5(e) {
        this.props.box5Action(e)
    }
    handleBox6(e) {
        this.props.box6Action(e)
    }

    componentDidMount() {
        const {role} = window.user;
        if (window.user?.id) {
            this.setState({
                logged_in_employee_id: window.user.id,
                logged_in_employee_role: role
            });
        }

        // Fetch employees data
        fetch(`${process.env.REACT_APP_API_URL}/get_employees.php?action=view`, {
            method: "GET",
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                this.setState({
                    employees: data.status === 'success' ? data.data : [],
                    loading: false
                });
            } else {
                this.setState({ error: data.message, loading: false });
            }
        })
        .catch(err => {
            this.setState({ error: 'Failed to fetch employees data' });
            console.error(err);
        });


        // Get projects data
        fetch(`${process.env.REACT_APP_API_URL}/projects.php?action=view&logged_in_employee_id=${window.user.id}&role=${window.user.role}`, {
            method: "GET",
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                this.setState({
                    projects: data.status === 'success' ? data.data : [],
                    allProjects: data.status === 'success' ? data.data: [],
                    loading: false
                });
            } else {
                this.setState({ error: data.message, loading: false });
            }
        })
        .catch(err => {
            this.setState({ error: 'Failed to fetch employees data' });
            console.error(err);
        });

        // Get clients data
        fetch(`${process.env.REACT_APP_API_URL}/clients.php?action=view`, {
            method: "GET",
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                this.setState({
                    clients: data.status === 'success' ? data.data : [],
                    loading: false
                });
            } else {
                this.setState({ error: data.message, loading: false });
            }
        })
        .catch(err => {
            this.setState({ error: 'Failed to fetch employees data' });
            console.error(err);
        });
    }

    // Handle input changes
    handleInputChangeForAddProject = (event) => {
        const { name, value } = event.target;
        this.setState({ 
            [name]: value,
            errors: { ...this.state.errors, [name]: "" }
        });
    };

    handleSelectionChange = (event) => {
        const { name, multiple } = event.target;
        let value = multiple
            ? Array.from(event.target.selectedOptions, (option) => option.value) // Store as an array
            : event.target.value;
    
        this.setState((prevState) => ({
            [name]: value,
            errors: { ...prevState.errors, [name]: "" }
        }));
    };

    toggleDropdown = () => {
        this.setState((prevState) => ({
            dropdownOpen: !prevState.dropdownOpen,
        }));
    };

    handleCheckboxChange = (event) => {
        const { value, checked } = event.target;
    
        this.setState((prevState) => {
            let updatedTeamMembers = [...prevState.teamMembers];
    
            if (checked) {
                // Add employee ID if checked
                updatedTeamMembers.push(value);
            } else {
                // Remove employee ID if unchecked
                updatedTeamMembers = updatedTeamMembers.filter((id) => id !== value);
            }
    
            return { teamMembers: updatedTeamMembers };
        });
    };    
    

    // Validate Add Project Form
	validateAddProjectForm = (e) => {
		const { projectName, projectDescription, projectTechnology, teamMembers, projectStartDate, projectEndDate} = this.state;
        let errors = {};
        let isValid = true;

        // Name Validation (Only letters and spaces)
        const namePattern = /^[a-zA-Z\s]+$/;
        if (!projectName.trim()) {
            errors.projectName = "Project Name is required.";
            isValid = false;
        } else if (!namePattern.test(projectName)) {
            errors.projectName = "Project Name must only contain letters and spaces.";
            isValid = false;
        }

        // Description Validation (Required, Min 10 characters)
        if (!projectDescription.trim()) {
            errors.projectDescription = "Project Description is required.";
            isValid = false;
        } else if (projectDescription.length < 10) {
            errors.projectDescription = "Project Description must be at least 10 characters.";
            isValid = false;
        }

        // Technology Validation (Required, allows comma-separated words)
        const technologyPattern = /^[a-zA-Z\s,]+$/;
        if (!projectTechnology.trim()) {
            errors.projectTechnology = "Project Technology is required.";
            isValid = false;
        } else if (!technologyPattern.test(projectTechnology)) {
            errors.projectTechnology = "Projet Technology must only contain letters, commas, and spaces.";
            isValid = false;
        }

        // Client Validation (Required)
        /* if (!selectedClient || selectedClient.trim() === "") {
            errors.selectedClient = "Please select a client.";
            isValid = false;
        } */

        // Team Members Validation (At least one team member should be selected)
        if (!teamMembers || (Array.isArray(teamMembers) && teamMembers.length === 0)) {
            errors.teamMembers = "Please assign at least one team member.";
            isValid = false;
        }

        // Date Validation (Start Date & End Date)
        if (!projectStartDate) {
            errors.projectStartDate = "Project Start Date is required.";
            isValid = false;
        }

        // End Date Validation (Optional, but must be after Start Date if provided)
        if (projectStartDate && projectEndDate && new Date(projectEndDate) < new Date(projectStartDate)) {
            errors.projectEndDate = "Project End Date must be after the Start Date.";
            isValid = false;
        }

        this.setState({ errors });
        return isValid;
	};

    // Add/Update project data API call
    addProjectData = () => {
        const { logged_in_employee_id, projectName, projectDescription, projectTechnology, projectStartDate, projectEndDate, selectedClient, teamMembers, isEditing, editingProjectId } = this.state;

        if (!this.validateAddProjectForm()) {
            return; // Stop execution if validation fails
        }

        const projectFormData = new FormData();
        projectFormData.append('logged_in_employee_id', logged_in_employee_id);
        projectFormData.append('project_name', projectName);
        projectFormData.append('project_description', projectDescription);
        projectFormData.append('project_technology', projectTechnology);
        projectFormData.append('client_id', selectedClient);
        projectFormData.append('project_start_date', projectStartDate);
        projectFormData.append('project_end_date', projectEndDate);
        teamMembers.forEach((member) => {
            projectFormData.append('team_members[]', member);
        });
        if (isEditing && editingProjectId) {
            projectFormData.append('project_id', editingProjectId);
        }
        const action = isEditing ? 'update' : 'add';
        const successMessage = isEditing ? 'Project updated successfully!' : 'Project added successfully!';

        // API call to add/update project (always POST for PHP)
        fetch(`${process.env.REACT_APP_API_URL}/projects.php?action=${action}`, {
            method: 'POST',
            body: projectFormData,
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.status === 'success' || data.success) {
                if (isEditing) {
                    // Update existing project in the list
                    this.setState((prevState) => ({
                        projects: prevState.projects.map(project => 
                            project.project_id === editingProjectId ? data.updatedProject : project
                        ),
                        allProjects: prevState.allProjects.map(project => 
                            project.project_id === editingProjectId ? data.updatedProject : project
                        ),
                    }));
                } else {
                    // Add new project to the list
                    this.setState((prevState) => ({
                        projects: [data.newProject, ...(prevState.projects || [])],
                        allProjects: [data.newProject, ...(prevState.allProjects || [])],
                    }));
                }
                this.setState({
                    projectName: "",
                    projectDescription: "",
                    projectTechnology: "",
                    selectedClient: "",
                    teamMembers: [],
                    projectStartDate: "",
                    projectEndDate: "",
                    errors: {},
                    editingProjectId: null,
                    isEditing: false,
                    showEditModal: false,
                    isSubmitting: false,
                    successMessage: successMessage,
                    showSuccess: true,
                });
                setTimeout(() => {
                    this.setState({
                        showSuccess: false, 
                        successMessage: ''
                    });
                }, 5000);
            } else {
                this.setState({
                    errorMessage: data.message || `Failed to ${isEditing ? 'update' : 'add'} project. Please try again.`,
                    showError: true,
                    isSubmitting: false,
                });
                setTimeout(() => {
                    this.setState({
                        showError: false,
                        errorMessage: ''
                    });
                }, 5000);
            }
        })
        .catch((error) => {
            console.error("Error:", error);
            this.setState({
                errorMessage: `An error occurred while ${isEditing ? 'updating' : 'adding'} the project.`,
                showError: true,
                isSubmitting: false,
            });
        });
    };

    // Reset form errors when modal is closed
    resetFormErrors = () => {
        this.setState({
            errors: {}, // Clear all error messages
            projectName: "",
            projectDescription: "",
            projectTechnology: "",
            selectedClient: "",
            teamMembers: [],
            projectStartDate: "",
            projectEndDate: "",
            editingProjectId: null,
            isEditing: false,
        });

        // Properly close the modal
        const modal = document.querySelector("#addProjectModal");
        if (modal) {
            modal.classList.remove('show');
            modal.style.display = 'none';
            document.body.classList.remove('modal-open');
            
            // Remove backdrop
            const backdrop = document.getElementById('modalBackdrop');
            if (backdrop) {
                backdrop.remove();
            }
        }
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

    // Add searching functionalit for project search
	handleSearch = (event) => {
        const query = event.target.value.toLowerCase(); // Get search input
        this.setState({ searchQuery: query }, () => {
			if (query === "") {
				// If search is empty, reset projects to the original list
				this.setState({ projects: this.state.allProjects });
			} else {
				const filtered = this.state.allProjects.filter(project => {
					return (
						project.project_name.toLowerCase().includes(query) ||
						project.project_technology.toLowerCase().includes(query)
					);
				});
				this.setState({ projects: filtered });
			}
        });
    };

    // Handle edit project
    handleEditProject = (project) => {
        // Populate form with project data for editing
        this.setState({
            projectName: project.project_name || "",
            projectDescription: project.project_description || "",
            projectTechnology: project.project_technology || "",
            selectedClient: project.client_id || "",
            teamMembers: project.team_members ? project.team_members.map(member => String(member.id)) : [],
            projectStartDate: project.project_start_date || "",
            projectEndDate: project.project_end_date || "",
            editingProjectId: project.id,
            isEditing: true,
            showEditModal: true
        });
    };

    // Handle delete project - show delete modal
    handleDeleteProject = (projectId, projectName) => {
        this.setState({
            showDeleteModal: true,
            deleteProjectId: projectId,
            deleteProjectName: projectName
        }, () => {
            this.showDeleteModal();
        });
    };

    // Confirm delete project
    confirmDeleteProject = () => {
        const { deleteProjectId } = this.state;
        this.setState({ isDeleting: true });

        // Make API call to delete project (use POST for PHP compatibility)
        const formData = new FormData();
        formData.append('project_id', deleteProjectId);
        fetch(`${process.env.REACT_APP_API_URL}/projects.php?action=delete`, {
            method: 'DELETE',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // Remove project from state
                const updatedProjects = this.state.projects.filter(project => project.project_id !== deleteProjectId);
                const updatedAllProjects = this.state.allProjects.filter(project => project.project_id !== deleteProjectId);
                this.setState({
                    projects: updatedProjects,
                    allProjects: updatedAllProjects,
                    showSuccess: true,
                    successMessage: 'Project deleted successfully!',
                    showDeleteModal: false,
                    deleteProjectId: null,
                    deleteProjectName: '',
                    isDeleting: false
                });
                setTimeout(() => this.setState({ showSuccess: false }), 3000);
            } else {
                this.setState({
                    showError: true,
                    errorMessage: data.message || 'Failed to delete project',
                    showDeleteModal: false,
                    deleteProjectId: null,
                    deleteProjectName: '',
                    isDeleting: false
                });
                setTimeout(() => this.setState({ showError: false }), 3000);
            }
        })
        .catch(error => {
            console.error('Error deleting project:', error);
            this.setState({
                showError: true,
                errorMessage: 'An error occurred while deleting the project',
                showDeleteModal: false,
                deleteProjectId: null,
                deleteProjectName: '',
                isDeleting: false
            });
            setTimeout(() => this.setState({ showError: false }), 3000);
        });
    };

    // Close delete modal
    closeDeleteModal = () => {
        this.setState({
            showDeleteModal: false,
            deleteProjectId: null,
            deleteProjectName: '',
            isDeleting: false
        }, () => {
            this.hideDeleteModal();
        });
    };

    // Close edit modal
    closeEditModal = () => {
        this.setState({
            showEditModal: false,
            editingProjectId: null,
            isEditing: false,
            projectName: "",
            projectDescription: "",
            projectTechnology: "",
            selectedClient: "",
            teamMembers: [],
            projectStartDate: "",
            projectEndDate: "",
            errors: {}
        });
    };

    // Handle edit modal submit
    handleEditModalSubmit = () => {
        this.setState({ isSubmitting: true });
        this.addProjectData();
    };

    // Show delete modal
    showDeleteModal = () => {
        const modal = document.querySelector('#deleteProjectModal');
        if (modal) {
            modal.classList.add('show');
            modal.style.display = 'block';
            document.body.classList.add('modal-open');
        }
    };

    // Hide delete modal
    hideDeleteModal = () => {
        const modal = document.querySelector('#deleteProjectModal');
        if (modal) {
            modal.classList.remove('show');
            modal.style.display = 'none';
            document.body.classList.remove('modal-open');
        }
    };


    render() {
        const { fixNavbar/* , boxOpen */ } = this.props;
        const { projectName, projectDescription, projectTechnology, projectStartDate, projectEndDate, clients, selectedClient, teamMembers, employees, projects, message, logged_in_employee_role, showSuccess, successMessage, showError, errorMessage} = this.state;

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
                        <div className="d-flex justify-content-between align-items-center">
                            <ul className="nav nav-tabs page-header-tab">
                                <li className="nav-item"><a className="nav-link active" id="Project-tab" data-toggle="tab" href="#Project-OnGoing">OnGoing</a></li>
                                {/* <li className="nav-item"><a className="nav-link" id="Project-tab" data-toggle="tab" href="#Project-UpComing">UpComing</a></li> */}
                            </ul>
                            <div className="header-action d-md-flex">
                                <div className="input-group mr-2">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search project..."
                                        name="s"
                                        value={this.state.searchQuery}
                                        onChange={this.handleSearch}
                                    />
                                </div>
                                {(logged_in_employee_role === 'admin' || logged_in_employee_role === 'super_admin') && (
                                    <button 
                                        type="button" 
                                        className="btn btn-primary" 
                                        onClick={() => this.setState({ 
                                            showEditModal: true, 
                                            isEditing: false,
                                            projectName: "",
                                            projectDescription: "",
                                            projectTechnology: "",
                                            selectedClient: "",
                                            teamMembers: [],
                                            projectStartDate: "",
                                            projectEndDate: "",
                                            errors: {}
                                        })}
                                    >
                                        <i className="fe fe-plus mr-2" />Add
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="section-body mt-3">
                    <div className="container-fluid">
                        <div className="tab-content">
                            <div className="tab-pane fade show active" id="Project-OnGoing" role="tabpanel">
                                <div className="row">
                                {projects && projects.length > 0 ? (
                                    projects.map((project, index) => (
                                            <div className="col-lg-4 col-md-12" key={index}>
                                                <div className={`card ${this.state.collapsedCards[index] ? 'card-collapsed' : ""}`}>
                                                    <div className="card-header">
                                                        <h3 className="card-title">{project.project_name}</h3>
                                                        <div className="card-options">
                                                            <label className="custom-switch m-0">
                                                                <input type="checkbox" defaultValue={1} className="custom-switch-input" defaultChecked />
                                                                <span className="custom-switch-indicator" />
                                                            </label>
                                                            <span className="card-options-collapse" data-toggle="card-collapse" onClick={() => this.handleBoxToggle(index)}
                                                            ><i className="fe fe-chevron-up" /></span>
                                                            
                                                            {/* 3-dot menu dropdown - Only show for admin users */}
                                                            {(logged_in_employee_role === 'admin' || logged_in_employee_role === 'super_admin') && (
                                                                <div className="dropdown">
                                                                    <button 
                                                                        className="btn btn-icon btn-sm" 
                                                                        type="button" 
                                                                        data-toggle="dropdown" 
                                                                        aria-haspopup="true" 
                                                                        aria-expanded="false"
                                                                        title="More options"
                                                                    >
                                                                        <i className="fa fa-ellipsis-v" />
                                                                    </button>
                                                                    <div className="dropdown-menu dropdown-menu-right">
                                                                        <button 
                                                                            className="dropdown-item" 
                                                                            type="button"
                                                                            onClick={() => this.handleEditProject(project)}
                                                                            title="Edit Project"
                                                                        >
                                                                            <i className="fa fa-edit mr-2" />
                                                                            Edit
                                                                        </button>
                                                                        <button 
                                                                            className="dropdown-item text-danger" 
                                                                            type="button"
                                                                            onClick={() => this.handleDeleteProject(project.id, project.project_name)}
                                                                            title="Delete Project"
                                                                        >
                                                                            <i className="fa fa-trash-o mr-2" />
                                                                            Delete
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="card-body">
                                                        <span className="tag tag-blue mb-3">{project.project_technology}</span>
                                                        <p>{project.project_description}</p>
                                                        <div className="row">
                                                            <div className="col-4 py-1"><strong>Created:</strong></div>
                                                            <div className="col-8 py-1">
                                                                {new Date(project.created_at).toLocaleString("en-US", {
                                                                    day: "2-digit",
                                                                    month: "short",
                                                                    year: "numeric",
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                    hour12: true,
                                                                }).replace(",", "")}
                                                            </div>
                                                            {/* <div className="col-4 py-1"><strong>Creator:</strong></div>
                                                            <div className="col-8 py-1">Nathan Guerrero</div> */}
                                                            <div className="col-4 py-1"><strong>Team:</strong></div>
                                                            <div className="col-8 py-1">
                                                                <div className="avatar-list avatar-list-stacked">
                                                                    {project.team_members.map((member) => (
                                                                        <span key={member.id}>
                                                                            {member.profile ? (
                                                                                <img
                                                                                    src={`${process.env.REACT_APP_API_URL}/${member.profile}`}
                                                                                    className="avatar avatar-blue add-space"
                                                                                    alt={`${member.first_name} ${member.last_name}`}
                                                                                    data-toggle="tooltip"
                                                                                    data-placement="top"
                                                                                    title={`${member.first_name} ${member.last_name}`}
                                                                                    onError={(e) => {
                                                                                        e.target.style.display = 'none';
                                                                                        const initialsSpan = document.createElement('span');
                                                                                        initialsSpan.className = 'avatar avatar-blue add-space';
                                                                                        initialsSpan.setAttribute('data-toggle', 'tooltip');
                                                                                        initialsSpan.setAttribute('data-placement', 'top');
                                                                                        initialsSpan.setAttribute('title', `${member.first_name} ${member.last_name}`);
                                                                                        e.target.parentNode.insertBefore(initialsSpan, e.target.nextSibling);
                                                                                        initialsSpan.style.display = 'inline-flex';
                                                                                        initialsSpan.style.alignItems = 'center';
                                                                                        initialsSpan.style.justifyContent = 'center';
                                                                                        initialsSpan.style.width = '35px';
                                                                                        initialsSpan.style.height = '35px';
                                                                                    }}
                                                                                />
                                                                            ) : (
                                                                                <span
                                                                                    className="avatar avatar-blue add-space"
                                                                                    data-toggle="tooltip"
                                                                                    data-placement="top"
                                                                                    title={`${member.first_name} ${member.last_name}`}
                                                                                    style={{
                                                                                        width: '35px',
                                                                                        height: '35px',
                                                                                        display: 'inline-flex',
                                                                                        alignItems: 'center',
                                                                                        justifyContent: 'center',
                                                                                    }}
                                                                                >
                                                                                    {member.first_name.charAt(0).toUpperCase()}{member.last_name.charAt(0).toUpperCase()}
                                                                                </span>
                                                                            )}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* <div className="card-footer">
                                                        <div className="clearfix">
                                                            <div className="float-left"><strong>15%</strong></div>
                                                            <div className="float-right"><small className="text-muted">Progress</small></div>
                                                        </div>
                                                        <div className="progress progress-xs">
                                                            <div className="progress-bar bg-red" role="progressbar" style={{ width: '15%' }} aria-valuenow={36} aria-valuemin={0} aria-valuemax={100} />
                                                        </div>
                                                    </div> */}
                                                </div>
                                            </div>
                                        ))
                                ): (
                                    !message && <tr><td>projects not available.</td></tr>
                                )}
                                </div>
                            </div>
                            <div className="tab-pane fade" id="Project-UpComing" role="tabpanel">
                                <div className="card">
                                    <div className="card-body">
                                        <div className="table-responsive">
                                            <table className="table table-hover table-striped table-vcenter mb-0">
                                                <thead>
                                                    <tr>
                                                        <th>Owner</th>
                                                        <th>Milestone</th>
                                                        <th className="w100">Work</th>
                                                        <th className="w100">Duration</th>
                                                        <th>Priority</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td><img src="../assets/images/xs/avatar1.jpg" alt="Avatar" className="w30 rounded-circle mr-2" /> <span>Isidore Dilao</span></td>
                                                        <td>Account receivable</td>
                                                        <td><span>30:00</span></td>
                                                        <td>30:0 hrs</td>
                                                        <td><span className="text-warning">Medium</span></td>
                                                    </tr>
                                                    <tr>
                                                        <td><img src="../assets/images/xs/avatar2.jpg" alt="Avatar" className="w30 rounded-circle mr-2" /> <span>Maricel Villalon</span></td>
                                                        <td>Account receivable</td>
                                                        <td><span>68:00</span></td>
                                                        <td>105:0 hrs</td>
                                                        <td><span className="text-danger">High</span></td>
                                                    </tr>
                                                    <tr>
                                                        <td><img src="../assets/images/xs/avatar3.jpg" alt="Avatar" className="w30 rounded-circle mr-2" /> <span>Theresa Wright</span></td>
                                                        <td>Approval site</td>
                                                        <td><span>74:00</span></td>
                                                        <td>89:0 hrs</td>
                                                        <td><span>None</span></td>
                                                    </tr>
                                                    <tr>
                                                        <td><img src="../assets/images/xs/avatar4.jpg" alt="Avatar" className="w30 rounded-circle mr-2" /> <span>Jason Porter</span></td>
                                                        <td>Final touch up</td>
                                                        <td><span>30:00</span></td>
                                                        <td>30:0 hrs</td>
                                                        <td><span>None</span></td>
                                                    </tr>
                                                    <tr>
                                                        <td><img src="../assets/images/xs/avatar5.jpg" alt="Avatar" className="w30 rounded-circle mr-2" /> <span>Annelyn Mercado</span></td>
                                                        <td>Account receivable</td>
                                                        <td><span>30:00</span></td>
                                                        <td>30:0 hrs</td>
                                                        <td><span>None</span></td>
                                                    </tr>
                                                    <tr>
                                                        <td><img src="../assets/images/xs/avatar6.jpg" alt="Avatar" className="w30 rounded-circle mr-2" /> <span>Sean Black</span></td>
                                                        <td>Basement slab preparation</td>
                                                        <td><span>88:00</span></td>
                                                        <td>88:0 hrs</td>
                                                        <td><span>None</span></td>
                                                    </tr>
                                                    <tr>
                                                        <td><img src="../assets/images/xs/avatar7.jpg" alt="Avatar" className="w30 rounded-circle mr-2" /> <span>Scott Ortega</span></td>
                                                        <td>Account receivable</td>
                                                        <td><span>56:00</span></td>
                                                        <td>125:0 hrs</td>
                                                        <td><span className="text-warning">Medium</span></td>
                                                    </tr>
                                                    <tr>
                                                        <td><img src="../assets/images/xs/avatar8.jpg" alt="Avatar" className="w30 rounded-circle mr-2" /> <span>David Wallace</span></td>
                                                        <td>Account receivable</td>
                                                        <td><span>30:00</span></td>
                                                        <td>30:0 hrs</td>
                                                        <td><span>None</span></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                {/* Add Project Modal */}
                <div className="modal fade" id="addProjectModal" tabIndex={-1} role="dialog" aria-labelledby="addProjectModalLabel" data-backdrop="static" 
                data-keyboard="false" style={{ zIndex: 1050 }} onClick={(e) => {
                    if (e.target.id === 'addProjectModal') {
                        this.resetFormErrors();
                    }
                }}>
                    <div className="modal-dialog" role="document">
                        <div className="modal-content" tabIndex={-1}>
                            <div className="modal-header">
                                <h5 className="modal-title" id="addProjectModalLabel">{this.state.isEditing ? 'Edit Project' : 'Add Project'}</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={this.resetFormErrors}><span aria-hidden="true">×</span></button>
                            </div>
                            <div className="modal-body">
                                <div className="row clearfix">
                                    <div className="col-md-12">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="projectName">Project Name</label>
                                            <input
                                                type="text"
                                                // className="form-control"
                                                className={`form-control ${this.state.errors.projectName ? "is-invalid" : ""}`}
                                                placeholder="Project Name"
                                                name="projectName"
                                                value={projectName}
                                                onChange={this.handleInputChangeForAddProject}
                                            />
                                            {this.state.errors.projectName && (
                                                <small className="invalid-feedback">{this.state.errors.projectName}</small>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="projectDescription">Project Description</label>
                                            <textarea
                                                className={`form-control ${this.state.errors.projectDescription ? "is-invalid" : ""}`}
                                                placeholder="Project Description"
                                                name="projectDescription"
                                                value={projectDescription}
                                                onChange={this.handleInputChangeForAddProject}
                                                rows={3}
                                            >
                                            </textarea>
                                            {this.state.errors.projectDescription && (
                                                <small className="invalid-feedback">{this.state.errors.projectDescription}</small>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="projectTechnology">Project Technology</label>
                                            <input
                                                type="text"
                                                className={`form-control ${this.state.errors.projectTechnology ? "is-invalid" : ""}`}
                                                placeholder="Enter technologies (comma-separated)"
                                                name="projectTechnology"
                                                value={projectTechnology}
                                                onChange={this.handleInputChangeForAddProject}
                                            />
                                            {this.state.errors.projectTechnology && (
                                                <small className="invalid-feedback">{this.state.errors.projectTechnology}</small>
                                            )}
                                        </div>
                                    </div>
                                    {/* Client Details */}
                                    <div className="col-md-12">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="selectedClient">Select Client</label>
                                            <select
                                                name='selectedClient'
                                                id="selectedClient"
                                                className={`form-control ${this.state.errors.selectedClient ? "is-invalid" : ""}`}
                                                value={selectedClient}
                                                onChange={this.handleSelectionChange}
                                            >
                                                {clients.length > 0 ? (
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
                                            {this.state.errors.selectedClient && (
                                                <small className="invalid-feedback">{this.state.errors.selectedClient}</small>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-md-12">
                                        <div className="form-group">
                                            <label className="form-label">Assign Team Members</label>
                                            {/* Custom dropdown */}
                                            <div className="dropdown w-100">
                                                <button
                                                    type="button"
                                                    className="form-control dropdown-toggle"
                                                    onClick={this.toggleDropdown}
                                                    style={{ textAlign: "left" }}
                                                >
                                                    {teamMembers.length > 0
                                                        ? `${teamMembers.length} selected`
                                                        : "Select Team Members"}
                                                </button>

                                                {this.state.dropdownOpen && (
                                                    <div className="dropdown-menu show w-100 p-2" style={{ maxHeight:"120px", overflowY: "auto" }}>
                                                        {employees.map((employee) => (
                                                            <div key={employee.id} className="form-check">
                                                                <input
                                                                    type="checkbox"
                                                                    className="form-check-input"
                                                                    id={`emp_${employee.id}`}
                                                                    value={String(employee.id)}
                                                                    checked={teamMembers.includes(String(employee.id))}
                                                                    onChange={this.handleCheckboxChange}
                                                                />
                                                                <label className="form-check-label" htmlFor={`emp_${employee.id}`}>
                                                                    {employee.first_name} {employee.last_name}
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            {this.state.errors.teamMembers && (
                                                <small className="invalid-feedback">{this.state.errors.teamMembers}</small>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="projectStartDate">Project start date</label>
                                            <input
                                                type="date"
                                                className={`form-control ${this.state.errors.projectStartDate ? "is-invalid" : ""}`}
                                                name="projectStartDate"
                                                value={projectStartDate}
                                                onChange={this.handleInputChangeForAddProject}
                                            />
                                            {this.state.errors.projectStartDate && (
                                                <small className="invalid-feedback">{this.state.errors.projectStartDate}</small>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="projectEndDate">Project end date</label>
                                            <input
                                                type="date"
                                                className={`form-control ${this.state.errors.projectEndDate ? "is-invalid" : ""}`}
                                                name="projectEndDate"
                                                value={projectEndDate}
                                                onChange={this.handleInputChangeForAddProject}
                                            />
                                            {this.state.errors.projectEndDate && (
                                                <small className="invalid-feedback">{this.state.errors.projectEndDate}</small>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={this.resetFormErrors}>Close</button>
                                <button type="button" onClick={this.addProjectData} className="btn btn-primary">
                                    {this.state.isEditing ? 'Update Project' : 'Add Project'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Project Modal */}
                <EditModal
                    modalId="editProjectModal"
                    isOpen={this.state.showEditModal}
                    onClose={this.closeEditModal}
                    onSubmit={this.handleEditModalSubmit}
                    formData={{
                        projectName: this.state.projectName,
                        projectDescription: this.state.projectDescription,
                        projectTechnology: this.state.projectTechnology,
                        selectedClient: this.state.selectedClient,
                        teamMembers: this.state.teamMembers,
                        projectStartDate: this.state.projectStartDate,
                        projectEndDate: this.state.projectEndDate
                    }}
                    onInputChange={this.handleInputChangeForAddProject}
                    onSelectionChange={this.handleSelectionChange}
                    onCheckboxChange={this.handleCheckboxChange}
                    errors={this.state.errors}
                    employees={this.state.employees}
                    clients={this.state.clients}
                    dropdownOpen={this.state.dropdownOpen}
                    toggleDropdown={this.toggleDropdown}
                    isEditing={this.state.isEditing}
                    isLoading={this.state.isSubmitting}
                />

                {/* Delete Project Modal */}
                <DeleteModal
                    modalId="deleteProjectModal"
                    deleteBody={`Are you sure you want to delete the project "${this.state.deleteProjectName}"`}
                    onConfirm={this.confirmDeleteProject}
                    onClose={this.closeDeleteModal}
                    isLoading={this.state.isDeleting}
                />
            </>
        )
    }
}
const mapStateToProps = state => ({
    fixNavbar: state.settings.isFixNavbar,
    boxOpen: state.settings.isbox,
    box2Open: state.settings.isbox2,
    box3Open: state.settings.isbox3,
    box4Open: state.settings.isbox4,
    box5Open: state.settings.isbox5,
    box6Open: state.settings.isbox6,
})

const mapDispatchToProps = dispatch => ({
    boxAction: (e) => dispatch(boxAction(e)),
    box2Action: (e) => dispatch(box2Action(e)),
    box3Action: (e) => dispatch(box3Action(e)),
    box4Action: (e) => dispatch(box4Action(e)),
    box5Action: (e) => dispatch(box5Action(e)),
    box6Action: (e) => dispatch(box6Action(e))
})
export default connect(mapStateToProps, mapDispatchToProps)(ProjectList);


