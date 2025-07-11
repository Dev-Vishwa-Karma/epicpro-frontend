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
        fetch(`${process.env.REACT_APP_API_URL}/get_employees.php?action=view&role=employee`, {
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
                const collapsedCards = {};
                data.data.forEach(project => {
                    collapsedCards[project.project_id] = project.project_is_active === 0;
                });
                this.setState({
                    projects: data.data,
                    allProjects: data.data,
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

    getEmployeeName = (employeeId, namePart) => {
        const employee = this.state.employees.find(emp => String(emp.id) === String(employeeId));
        if (!employee) return '';
        return namePart === 'first' ? employee.first_name : employee.last_name;
    };

    // Add/Update project data API call
    addProjectData = () => {
        const { 
            logged_in_employee_id, 
            projectName, 
            projectDescription, 
            projectTechnology, 
            projectStartDate, 
            projectEndDate, 
            selectedClient, 
            teamMembers, 
            isEditing, 
            editingProjectId 
        } = this.state;

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

        const action = isEditing ? 'edit' : 'add';
        const successMessage = isEditing ? 'Project updated successfully!' : 'Project added successfully!';

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
                            project.project_id === editingProjectId ? {
                                ...project,
                                project_name: projectName,
                                project_description: projectDescription,
                                project_technology: projectTechnology,
                                client_id: selectedClient,
                                project_start_date: projectStartDate,
                                project_end_date: projectEndDate,
                                team_members: teamMembers.map(id => ({
                                    employee_id: id,
                                    first_name: this.getEmployeeName(id, 'first'),
                                    last_name: this.getEmployeeName(id, 'last')
                                }))
                            } : project
                        ),
                        allProjects: prevState.allProjects.map(project => 
                            project.project_id === editingProjectId ? {
                                ...project,
                                project_name: projectName,
                                project_description: projectDescription,
                                project_technology: projectTechnology,
                                client_id: selectedClient,
                                project_start_date: projectStartDate,
                                project_end_date: projectEndDate,
                                team_members: teamMembers.map(id => ({
                                    employee_id: id,
                                    first_name: this.getEmployeeName(id, 'first'),
                                    last_name: this.getEmployeeName(id, 'last')
                                }))
                            } : project
                        ),
                    }));
                } else {
                    // Add new project to the list
                    const newProject = data.newProject || {
                        project_id: data.project_id || data.id, // Adjust based on API response
                        project_name: projectName,
                        project_description: projectDescription,
                        project_technology: projectTechnology,
                        client_id: selectedClient,
                        project_start_date: projectStartDate,
                        project_end_date: projectEndDate,
                        created_at: new Date().toISOString(),
                        project_is_active: 1,
                        team_members: teamMembers.map(id => {
                            const emp = this.state.employees.find(e => String(e.id) === String(id));
                            return {
                                employee_id: id,
                                first_name: emp ? emp.first_name : '',
                                last_name: emp ? emp.last_name : '',
                                profile: emp ? emp.profile : ''
                            };
                        })
                    };
                    this.setState(prevState => ({
                        projects: [newProject, ...prevState.projects],
                        allProjects: [newProject, ...prevState.allProjects],
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
                errorMessage: `An error occurred while ${isEditing ? 'editting' : 'adding'} the project.`,
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

    // API for Toggle o and 1

    handleToggleProjectStatus = async (projectId, currentStatus) => {
        const newStatus = currentStatus === '1' || currentStatus === 1 ? 0 : 1; // Toggle between 1 and 0
    
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/projects.php?action=update_active_status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: projectId,
                    is_active: newStatus,
                    logged_in_employee_id: this.state.logged_in_employee_id
                })
            });
    
            const data = await response.json();
    
            if (data.status === 'success') {
                this.setState(prevState => ({
                    projects: prevState.projects.map(p =>
                        p.project_id === projectId
                            ? { ...p, project_is_active: newStatus }
                            : p
                    ),
                    allProjects: prevState.allProjects.map(p =>
                        p.project_id === projectId
                            ? { ...p, project_is_active: newStatus }
                            : p
                    ),
                    showSuccess: true,
                    successMessage: `Project ${newStatus === 1 ? 'activated' : 'deactivated'}!`
                }));
            }
        } catch (error) {
            // Error handling
            this.setState({ showError: true, errorMessage: 'Failed to update project status.' });
        }
    };
    // Add searching functionality for project search (API-based, name and technology, debounced)
    handleSearch = (event) => {
        const query = event.target.value;
        this.setState({ searchQuery: query });

        // Clear previous timeout
        if (this.searchTimeout) clearTimeout(this.searchTimeout);

        this.searchTimeout = setTimeout(() => {
            const { searchQuery } = this.state;
            const searchParam = searchQuery.trim();

            // Build the API URL with the search query for both name and technology
            let apiUrl = `${process.env.REACT_APP_API_URL}/projects.php?action=view&logged_in_employee_id=${window.user.id}&role=${window.user.role}`;
            if (searchParam !== "") {
                apiUrl += `&project_name=${encodeURIComponent(searchParam)}`;
                apiUrl += `&project_technology=${encodeURIComponent(searchParam)}`;
            }

            fetch(apiUrl, {
                method: "GET",
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    this.setState({
                        projects: data.data,
                        allProjects: data.data,
                    });
                } else {
                    this.setState({ projects: [], allProjects: [] });
                }
            })
            .catch(err => {
                this.setState({ projects: [], allProjects: [] });
                console.error(err);
            });
        }, 500);
    };

    handleEditProject = (project) => {
        const teamMemberIds = project.team_members 
            ? project.team_members.map(member => String(member.employee_id || member.id))
            : [];

        this.setState({
            projectName: project.project_name || "",
            projectDescription: project.project_description || "",
            projectTechnology: project.project_technology || "",
            selectedClient: project.client_id || "",
            teamMembers: teamMemberIds,
            projectStartDate: project.project_start_date || "",
            projectEndDate: project.project_end_date || "",
            editingProjectId: project.project_id,
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
        });
    };

    confirmDeleteProject = () => {    
    const { deleteProjectId } = this.state;
    if (!deleteProjectId) return;
    
    this.setState({ ButtonLoading: true, isDeleting: true });
    
    fetch(`${process.env.REACT_APP_API_URL}/projects.php?action=delete&id=${deleteProjectId}`, {
        method: "DELETE",
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success' || data.success) {
            this.setState(prevState => ({
                projects: prevState.projects.filter(project => project.project_id !== deleteProjectId),
                allProjects: prevState.allProjects.filter(project => project.project_id !== deleteProjectId),
                showSuccess: true,
                successMessage: 'Project deleted successfully!',
                showDeleteModal: false,
                deleteProjectId: null,
                deleteProjectName: '',
                isDeleting: false
            }));
            
            setTimeout(() => this.setState({ showSuccess: false }), 3000);
        } else {
            // Error handling remains the same
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
        const { projects, message, logged_in_employee_role, showSuccess, successMessage, showError, errorMessage} = this.state;

        // Filter projects for employees: only show active projects
        const visibleProjects = (logged_in_employee_role === 'admin' || logged_in_employee_role === 'super_admin')
            ? projects
            : projects.filter(project => project.project_is_active === '1');

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
                                {visibleProjects && visibleProjects.length > 0 ? (
                                    visibleProjects.map((project, index) => (
                                            <div className="col-lg-4 col-md-12" key={index}>
                                                <div className={`card ${this.state.collapsedCards[project.project_id] ? 'card-collapsed' : ''}`}>
                                                    <div className="card-header">
                                                        <h3 className="card-title">{project.project_name}</h3>
                                                        <div className="card-options">
                                                            {/* 3-dot menu dropdown - Only show for admin users */}
                                                            {(logged_in_employee_role === 'admin' || logged_in_employee_role === 'super_admin') && (
                                                                <div className="dropdown d-flex">
                                                                    <a
                                                                        href="/#"
                                                                        className="nav-link icon d-none d-md-flex  ml-1"
                                                                        data-toggle="dropdown"
                                                                        title="More options"
                                                                    >
                                                                        <i className="fa fa-ellipsis-v" />
                                                                    </a>
                                                                    <div className="dropdown-menu dropdown-menu-right dropdown-menu-arrow">
                                                                        <button 
                                                                        className="dropdown-item" style={{width:'200px', textAlign:'center' }} 
                                                                        type="button"
                                                                        onClick={() => this.handleEditProject(project)}
                                                                        >
                                                                        <i className="dropdown-icon fe fe-edit mr-2" />
                                                                        Edit
                                                                        </button>
                                                                        <button 
                                                                        className="dropdown-item text-danger" style={{width:'200px', textAlign:'center' }}
                                                                        type="button"
                                                                        onClick={() => this.handleDeleteProject(project.project_id, project.project_name)}
                                                                        >
                                                                        <i className="dropdown-icon fe fe-trash-2 mr-2" />
                                                                        Delete
                                                                        </button>
                                                                    </div>
                                                                    </div> 
                                                            )}

                                                            <label className="custom-switch m-0">
                                                            <input
                                                                type="checkbox"
                                                                className="custom-switch-input"
                                                                checked={project.project_is_active === '1'}
                                                                onChange={() => this.handleToggleProjectStatus(project.project_id, project.project_is_active)}
                                                            />
                                                                <span className="custom-switch-indicator" />
                                                            </label>
                                                        </div>
                                                    </div>

                                                   
                                                     <div className="card-body">
                                                        <span className="tag tag-blue mb-3">{project.project_technology}</span>
                                                        <p style={{
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 4,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis'
                                                        }}>{project.project_description}</p>
                                                        <div className="row">
                                                            <div className="col-4 py-1"><strong>Started date:</strong></div>
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
                                    !message && (
                                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px', width: '100%' }}>
                                            <p style={{ fontSize: '1.2rem', color: '#888', margin: 0 }}>projects not available.</p>
                                        </div>
                                    )
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

                {/* Edit/Add Project Modal */}
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
                    show={this.state.showDeleteModal}
                    modalId="deleteProjectModal"
                    deleteBody={`Are you sure you want to delete the project "${this.state.deleteProjectName}"`}
                    onConfirm={this.confirmDeleteProject}
                    onClose={() => this.setState({ showDeleteModal: false, selectedId: null })}
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