import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import AlertMessages from "../../common/AlertMessages";
import ClientInfoModal from "./ClientInfoModal";

class Clients extends Component {
  constructor(props) {
    super(props);
    this.state = {
      clients: [],
      loading: true,
      searchTerm: "",
      selectedClient: null,
      showClientModal: false,
    };
  }

  componentDidMount() {
    this.getClients();
  }

  getClients = (search = "") => {
    this.setState({ loading: true });
    fetch(`${process.env.REACT_APP_API_URL}/clients.php?action=view_client&client_name=${search}`, {
      method: "GET",
    })
      .then((response) => response.json())
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
      selectedClient
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
                          data-toggle="modal"
                          data-target="#addBreakModal"
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
                        <div key={index} className="col-xl-3 col-lg-4 col-md-6">
                        <div className="card">
                            <div className="card-body text-center ribbon">
                                
                            <div className="ribbon-box green">
                                          
                                                       
                                                            
                                {client.client_country}
                            </div>
                                    
                            <img
                                className="rounded-circle img-thumbnail w100"
                                src="../assets/images/sm/avatar1.jpg"
                                alt="avatar"
                            />
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
                                        
                                        title="Edit Project"
                                    >
                                        <i className="fa fa-edit mr-2" />
                                        Edit
                                    </button>
                                    <button 
                                        className="dropdown-item text-danger" 
                                        type="button"
                                        
                                        title="Delete Project"
                                    >
                                        <i className="fa fa-trash-o mr-2" />
                                        Delete
                                    </button>
                                </div>
                            </div>                    
                            <h6 className="mt-3 mb-0">{client.client_name}</h6>
                            <span>{client.client_email}</span>
                            <ul className="mt-3 list-unstyled d-flex justify-content-center">
                                <button className="btn btn-default btn-sm"
                                onClick={() => this.handleViewProfile(client)} >
                                View Profile
                                </button>
                            </ul>
                            <div className="row text-center mt-4">
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

      </>
      
    );
  }
}
const mapStateToProps = (state) => ({
  fixNavbar: state.settings.isFixNavbar,
});

const mapDispatchToProps = (dispatch) => ({});
export default connect(mapStateToProps, mapDispatchToProps)(Clients);
