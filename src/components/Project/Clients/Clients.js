import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import AlertMessages from "../../common/AlertMessages";
import ClientInfoModal from "./ClientInfoModal";
import ClientFieldModal from "./ClientFieldModal";
import DeleteModal from '../../common/DeleteModal';
import { getService } from "../../../services/getService";
class Clients extends Component {
  constructor(props) {
    super(props);
    this.state = {
      clients: [],
      loading: true,
      searchTerm: "",
      selectedClient: null,
      showClientModal: false,
      //ClientFieldModal
      showClientFieldModal: false,
      isEditClientField: false,
      clientFieldFormData: {},
      clientFieldErrors: {},
      clientFieldLoading: false,
      // DeleteModal
      showDeleteModal: false,
      deletingClient: null,
      deleteLoading: false,
    };
  }

  componentDidMount() {
    this.getClients();
  }

  getClients = (search = "") => {
    this.setState({ loading: true });
      getService.getCall('clients.php', 'view_client', null, null, null, null, null, null, null, null , null, null, null, null,search)
      .then((data) => {
        if (data.status === "success") {
          this.setState({
            clients: data.status === "success" ? data.data : [],
            loading: false,
          });
        } else {
          this.setState({ error: data.message, loading: false });
        }
      })
      .catch((err) => {
        this.setState({ error: "Failed to fetch clients data", loading: false });
        console.error(err);
      });
  };

  dismissMessages = () => {
    this.setState({
      showSuccess: false,
      successMessage: "",
      showError: false,
      errorMessage: "",
    });
  };

  handleViewProfile = (client) => {
    this.setState({
        selectedClient: client,
        showClientModal: true,
    });
  };

    handleCloseClientModal = () => {
        this.setState({
            selectedClient: null,
            showClientModal: false,
        });
    };

  // Add handlers for ClientFieldModal
  handleOpenAddClientField = () => {
    this.setState({
      showClientFieldModal: true,
      isEditClientField: false,
      clientFieldFormData: {
        name: '',
        profilePic: null,
        email: '',
        about: '',
        country: '',
        state: '',
        city: '',
        status: '',
      },
      clientFieldErrors: {},
    });
  };

  handleOpenEditClientField = (client) => {
  this.setState({
    showClientFieldModal: true,
    isEditClientField: true,
    clientFieldFormData: {
      name: client.client_name || '',
      profilePic: client.client_profile
        ? `${process.env.REACT_APP_API_URL}/${client.client_profile}`
        : '',
      email: client.client_email || '',
      about: client.client_about || '',
      country: client.client_country || '',
      state: client.client_state || '',
      city: client.client_city || '',
      status: client.client_status !== undefined ? String(client.client_status) : '',
    },
    clientFieldErrors: {},
    editingClientId: client.client_id, // Use client_id instead of id
  });
};

  handleCloseClientFieldModal = () => {
    this.setState
    ({ 
      showClientFieldModal: 
      false, clientFieldErrors: {}, 
      clientFieldLoading: false 
    });
  };

  handleClientFieldChange = (e) => {
    const { name, value, type, files } = e.target;
    this.setState((prevState) => ({
      clientFieldFormData: {
        ...prevState.clientFieldFormData,
        [name]: type === 'file' ? files[0] : value,
      },
    }));
  };

  handleClientFieldSubmit = () => {

    const { clientFieldFormData, isEditClientField, editingClientId } = this.state;
    let errors = {};
    
    // Validation
    if (!clientFieldFormData.name) errors.name = 'Name is required';
    if (!clientFieldFormData.email) errors.email = 'Email is required';
    if (!clientFieldFormData.status) errors.status = 'Status is required';
    if (!isEditClientField && !clientFieldFormData.profilePic) errors.profilePic = 'Profile pic is required';
    
    if (Object.keys(errors).length > 0) {
      this.setState({ clientFieldErrors: errors });
      return;
    }

    this.setState({ clientFieldLoading: true });

    const formData = new FormData();
    formData.append('name', clientFieldFormData.name);
    formData.append('email', clientFieldFormData.email);
    formData.append('about', clientFieldFormData.about);
    formData.append('country', clientFieldFormData.country);
    formData.append('state', clientFieldFormData.state);
    formData.append('city', clientFieldFormData.city);
    formData.append('status', clientFieldFormData.status);
    
    // Only append profile if it's a file (new upload)
    if (clientFieldFormData.profilePic instanceof File) {
      formData.append('profile', clientFieldFormData.profilePic);
    }

    if (isEditClientField) {
      formData.append('client_id', editingClientId);
    }

    const apiCall = isEditClientField 
    ? getService.editCall('clients.php', 'edit', formData, null, editingClientId)
    : getService.addCall('clients.php', 'add', formData);

      apiCall.then(data => {
        if (data.status === 'success') {
          this.setState({
            clientFieldLoading: false,
            showClientFieldModal: false,
            showSuccess: true,
            successMessage: isEditClientField ? 'Client updated successfully' : 'Client added successfully'
          });
          this.getClients();
          setTimeout(this.dismissMessages, 3000);
        } else {
          this.setState({
            clientFieldLoading: false,
            showError: true,
            errorMessage: data.message || 'Operation failed'
          });
          setTimeout(this.dismissMessages, 3000);
        }
      })
      .catch(error => {
        this.setState({
          clientFieldLoading: false,
          showError: true,
          errorMessage: 'Network error occurred'
        });
        setTimeout(this.dismissMessages, 3000);
        console.error('Error:', error);
      });
  };

handleConfirmDelete = () => {
  const { deletingClient } = this.state;
  this.setState({ deleteLoading: true });

  getService.deleteCall('clients.php', 'delete', null, deletingClient.client_id, null, null)
    .then(data => {
      if (data.status === 'success') {
        this.setState({
          deleteLoading: false,
          showDeleteModal: false,
          showSuccess: true,
          successMessage: 'Client deleted successfully'
        });
        this.getClients();
        setTimeout(this.dismissMessages, 3000);
      } else {
        this.setState({
          deleteLoading: false,
          showError: true,
          errorMessage: data.message || 'Failed to delete client'
        });
        setTimeout(this.dismissMessages, 3000);
      }
    })
    .catch(error => {
      this.setState({
        deleteLoading: false,
        showError: true,
        errorMessage: 'Network error occurred'
      });
      setTimeout(this.dismissMessages, 3000);
      console.error('Error:', error);
    });
};


  handleOpenDeleteModal = (client) => {
    this.setState({ showDeleteModal: true, deletingClient: client });
  };

  handleCloseDeleteModal = () => {
    this.setState({ showDeleteModal: false, deletingClient: null, deleteLoading: false });
  };

  handleConfirmDelete = () => {
  const { deletingClient } = this.state;
  this.setState({ deleteLoading: true });
    getService.deleteCall('clients.php', 'delete', deletingClient.client_id, null, null, null)
    .then(data => {
      if (data.status === 'success') {
        this.setState({
          deleteLoading: false,
          showDeleteModal: false,
          showSuccess: true,
          successMessage: 'Client deleted successfully'
        });
        this.getClients();
        setTimeout(this.dismissMessages, 3000);
      } else {
        this.setState({
          deleteLoading: false,
          showError: true,
          errorMessage: data.message || 'Failed to delete client'
        });
        setTimeout(this.dismissMessages, 3000);
      }
    })
    .catch(error => {
      this.setState({
        deleteLoading: false,
        showError: true,
        errorMessage: 'Network error occurred'
      });
      setTimeout(this.dismissMessages, 3000);
        });
    };

  render() {
    const { fixNavbar } = this.props;
    const {
      loading,
      showSuccess,
      successMessage,
      showError,
      errorMessage,
      clients,
      showClientModal,
      selectedClient,
      // For ClientFieldModal
      showClientFieldModal,
      isEditClientField,
      clientFieldFormData,
      clientFieldErrors,
      clientFieldLoading,
      // For DeleteModal
      showDeleteModal,
      deletingClient,
      deleteLoading,
    } = this.state;
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
        <div className={`section-body ${fixNavbar ? "marginTop" : ""} mt-3`}>
          <div className="container-fluid">
            <div className="row clearfix">
              <div className="col-12">
                <div className="card">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-lg-4 col-md-4 col-sm-6">
                        <div className="input-group">
                            <input
                            type="text"
                            className="form-control"
                            placeholder="Client Name"
                            value={this.state.searchTerm}
                            onChange={(e) => this.setState({ searchTerm: e.target.value })}
                            />
                        </div>
                      </div>
                      <div className="col-lg-5 col-md-4 col-sm-6">
                        <div className="input-group">
                          <button className="btn btn-primary" onClick={() => this.getClients(this.state.searchTerm)}>Search</button>
                        </div>
                      </div>
                      <div className="col-lg-3 col-md-4 col-sm-12">
                        <button
                          style={{ float: "right" }}
                          type="button"
                          className="btn btn-primary"
                          onClick={this.handleOpenAddClientField}
                        >
                          <i className="fe fe-plus mr-2" />
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
                {loading ? (
                    <div className="col-12">
                        <div className="card p-3 d-flex align-items-center justify-content-center" style={{ height: '300px' }}>
                            <div className="dimmer active">
                                <div className="loader" />
                            </div>
                        </div>
                    </div>
                    
                    ) : clients && clients.length > 0 ? (
                    clients.map((client, index) => (
                        <div key={index} className="col-xl-3 col-lg-4 col-md-6 mb-4">
                          <div className="card h-80">
                            <div className="card-body text-center ribbon" style={{ minHeight: '300px' }}> 
                                <div className={`ribbon-box ${client.client_country ? 'green' : 'transparent'}`}>
                                  {client.client_country || ' '}
                            </div>
                                    
                      <div className="d-flex justify-content-center" style={{ height: '100px', margin: '20px 0' }}>
                            <img
                              className="rounded-circle img-thumbnail"
                              src={`${process.env.REACT_APP_API_URL}/${client.client_profile}`}
                                alt="Client Profile"
                              style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                            />
                      </div>
            
            <div className="dropdown" style={{ position: 'absolute', top: '16px', right: '10px' }}>
                                <a
                                    href="/#"
                    className="nav-link icon d-md-flex ml-1"
                                    data-toggle="dropdown"
                                    title="More options"
                                >
                                    <i className="fa fa-ellipsis-v" />
                                </a>
                                <div className="dropdown-menu dropdown-menu-right dropdown-menu-arrow">
                                    <button 
                        className="dropdown-item" 
                        style={{ width: '200px', textAlign: 'center' }} 
                                    type="button"
                        title="Edit Client"
                        onClick={() => this.handleOpenEditClientField(client)}
                                    >
                                    <i className="dropdown-icon fe fe-edit mr-2" />
                                    Edit
                                    </button>
                                    <button 
                        className="dropdown-item text-danger" 
                        style={{ width: '200px', textAlign: 'center' }}
                                    type="button"
                        title="Delete Client"
                        onClick={() => this.handleOpenDeleteModal(client)}
                                    >
                                    <i className="dropdown-icon fe fe-trash-2 mr-2" />
                                    Delete
                                    </button>
                                </div>
                            </div> 
            
            {/* Client info with fixed spacing */}
            <div style={{ minHeight: '40px' }}>
                <h6 className="mt-3 mb-0">{client.client_name || ' '}</h6>
                <span style={{ fontSize: '15px' }}>{client.client_email || ' '}</span>
            </div>
            
            {/* View Profile button */}
            <ul className="mt-3 list-unstyled d-flex justify-content-center" >
                                <button className="btn btn-default btn-sm"
                                onClick={() => this.handleViewProfile(client)} >
                                View Profile
                                </button>
                            </ul>
            
            {/* Stats section with fixed height */}
            <div className="row text-center mt-4" style={{ minHeight: '80px' }}>
                                <div className="col-lg-6 border-right">
                                <label className="mb-0">Project</label>
                                <h4 className="font-18">
                                    <Link to={`/project-list`}>
                                    {client.project_count}
                                    </Link>
                                </h4>
                                </div>
                                <div className="col-lg-6">
                                <label className="mb-0">Employee</label>
                                <h4 className="font-18">
                                    <Link to={`/hr-employee`}>
                                    {client.employee_count}
                                    </Link>
                                </h4>
                                </div>
                            </div>
                            </div>
                        </div>
                        </div>
                    ))
                    ) : (
                    <div className="col-12 text-center mt-4 text-muted" style={{ fontSize: '1rem', padding: '2rem 0' }}>
                        <h5>No clients available</h5>
                    </div>
                    )}

            </div>
          </div>
        </div>
        {showClientModal && (
            <ClientInfoModal
                client={selectedClient}
                onClose={this.handleCloseClientModal}
            />
        )}
        {/* Client Field Modal for Add/Edit */}
        {showClientFieldModal && (
          <ClientFieldModal
            show={showClientFieldModal}
            isEdit={isEditClientField}
            onClose={this.handleCloseClientFieldModal}
            onSubmit={this.handleClientFieldSubmit}
            onChange={this.handleClientFieldChange}
            formData={clientFieldFormData}
            errors={clientFieldErrors}
            loading={clientFieldLoading}
            modalId="clientFieldModal"
          />
        )}
        {/* Delete Modal */}
        {showDeleteModal && (
          <DeleteModal
            show={showDeleteModal}
            onConfirm={this.handleConfirmDelete}
            isLoading={deleteLoading}
            onClose={this.handleCloseDeleteModal}
            deleteBody={`Are you sure you want to delete client "${deletingClient?.client_name || ''}"?`}
            modalId="deleteClientModal"
          />
        )}
      </>
      
    );
  }
}
const mapStateToProps = (state) => ({
  fixNavbar: state.settings.isFixNavbar,
});

const mapDispatchToProps = (dispatch) => ({});
export default connect(mapStateToProps, mapDispatchToProps)(Clients);
