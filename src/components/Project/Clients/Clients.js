import React, { Component } from "react";
import { connect } from "react-redux";
import AlertMessages from "../../common/AlertMessages";
import ClientInfoModal from "./ClientInfoModal";
import ClientFieldModal from "./ClientFieldModal";
import ClientCard from "./ClientCard";
import DeleteModal from '../../common/DeleteModal';
import { getService } from "../../../services/getService";
import BlankState from "../../common/BlankState";
import { validateFields } from '../../common/validations';
import ClientCardSkeleton from "../../common/skeletons/ClientCardSkeleton";
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
    getService.getCall('clients.php', {
      action: 'view_client',
      search: search
    })
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
    
    // Apply Validation component
    const validationSchema = [
      { name: 'name', value: clientFieldFormData.name, type: 'name', required: true, messageName: 'Name'},
      { name: 'email', value: clientFieldFormData.email, type: 'email', required: true, messageName: 'Email'},
      { name: 'status', value: clientFieldFormData.status, required: true, messageName: 'Status'}
    ];
    const errors = validateFields(validationSchema);

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
    const skeletonCount = clients.length === 0 ? 4 : clients.length;
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
                Array.from({ length: skeletonCount }).map((_, index) => (
                    <ClientCardSkeleton key={index} />
                ))
              ) : clients && clients.length > 0 ? (
                clients.map((client, index) => (
                  <ClientCard
                    key={index}
                    client={client}
                    onViewProfile={this.handleViewProfile}
                    onEdit={this.handleOpenEditClientField}
                    onDelete={this.handleOpenDeleteModal}
                  />
                ))
              ) : (
                <div className="col-12">
                  <BlankState message="No clients available" />
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