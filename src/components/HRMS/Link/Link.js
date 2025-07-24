import React, { Component } from "react";
import { connect } from "react-redux";
import LinkTable from './LinkTable';
import LinkModal from './LinkModal';
import DeleteModal from '../../common/DeleteModal';
import AlertMessages from '../../common/AlertMessages';
import { getService } from '../../../services/getService';

class Link extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: 'Git',
      gitLinks: [],
      excelLinks: [],
      codebaseLinks: [],
      showModal: false,
      isEdit: false,
      modalId: 'linkModal',
      formData: {},
      errors: {},
      loading: false,
      editId: null,
      // Alert and delete modal state
      showDeleteModal: false,
      deleteTab: null,
      deleteId: null,
      showSuccess: false,
      showError: false,
      successMessage: '',
      errorMessage: '',
      // Pagination state
      currentPageGit: 1,
      currentPageExcel: 1,
      currentPageCodebase: 1,
      dataPerPage: 10,
    };
  }

  componentDidMount() {
    this.fetchLinks();
  }

  fetchLinks = () => {
    this.setState({ loading: true });
    getService.getCall('link.php', { action: 'view' })
      .then(res => {
        if (res.status === 'success') {
          const gitLinks = res.data.filter(l => l.tab === 'Git');
          const excelLinks = res.data.filter(l => l.tab === 'Excel');
          const codebaseLinks = res.data.filter(l => l.tab === 'Codebase');
          this.setState({ gitLinks, excelLinks, codebaseLinks, loading: false });
        } else {
          this.setState({ showError: true, errorMessage: res.message || 'Failed to fetch links', loading: false });
        }
      })
      .catch(err => {
        this.setState({ showError: true, errorMessage: err.message || 'Failed to fetch links', loading: false });
      });
  };

  handleTabChange = (tabId) => {
    this.setState({ activeTab: tabId });
  };

  // Handle Add button click
  handleAddClick = () => {
    this.setState({
      showModal: true,
      isEdit: false,
      formData: {},
      errors: {},
      editId: null,
    });
  };

  // Handle edit button click
  handleEditClick = (tab, id) => {
    const dataKey = this.getDataKey(tab);
    const item = this.state[dataKey].find((row) => row.id === id);
    this.setState({
      showModal: true,
      isEdit: true,
      formData: { ...item, tab },
      errors: {},
      editId: id,
    });
  };

  handleDelete = (tab, id) => {
    this.setState({
      showDeleteModal: true,
      deleteTab: tab,
      deleteId: id,
    });
  };

  handleDeleteModalClose = () => {
    this.setState({
      showDeleteModal: false,
      deleteTab: null,
      deleteId: null,
      loading: false,
    });
  };

  confirmDelete = () => {
    const { deleteId } = this.state;
    this.setState({ loading: true });
    getService.deleteCall('link.php', 'delete', deleteId)
      .then(res => {
        if (res.status === 'success') {
          this.setState({
            showDeleteModal: false,
            deleteTab: null,
            deleteId: null,
            loading: false,
            showSuccess: true,
            successMessage: res.message || 'Link deleted successfully!',
          });
          this.fetchLinks();
        } else {
          this.setState({ showError: true, errorMessage: res.message || 'Failed to delete link', loading: false });
        }
        setTimeout(this.dismissMessages, 3000);
      })
      .catch(err => {
        this.setState({ showError: true, errorMessage: err.message || 'Failed to delete link', loading: false });
        setTimeout(this.dismissMessages, 3000);
      });
  };

  dismissMessages = () => {
    this.setState({
      showSuccess: false,
      successMessage: '',
      showError: false,
      errorMessage: '',
    });
  };

  // Handle input change for editing fields
  handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    this.setState((prevState) => ({
      formData: {
        ...prevState.formData,
        [name]: type === 'file' ? files[0] : value, // Dynamically update the field
      },
      errors: {
        ...prevState.errors,
        [name]: '', // Clear error when typing
      },
    }));
  };

  handleModalClose = () => {
    this.setState({
      showModal: false,
      isEdit: false,
      formData: {},
      errors: {},
      editId: null,
      loading: false,
    });
  };

  validateForm = () => {
    const { formData, activeTab } = this.state;
    let errors = {};
    let isValid = true;
    if (!formData.title || !formData.title.trim()) {
      errors.title = 'Title is required.';
      isValid = false;
    }
    if (activeTab === 'Git') {
      if (!formData.link || !formData.link.trim()) {
        errors.link = 'Link is required.';
        isValid = false;
      }
    } else if (activeTab === 'Excel' || activeTab === 'Codebase') {
      const hasLink = formData.link && formData.link.trim();
      const hasFile = !!formData.file;
      if (!hasLink && !hasFile) {
        errors.link = 'Either Link or File is required.';
        errors.file = 'Either Link or File is required.';
        isValid = false;
      }
    }
    this.setState({ errors });
    return isValid;
  };

  handleModalSubmit = () => {
    if (!this.validateForm()) return;
    const { isEdit, activeTab, formData, editId } = this.state;
    const dataKey = this.getDataKey(activeTab);
    const apiAction = isEdit ? 'edit' : 'add';
    const submitData = new FormData();
    submitData.append('tab', activeTab);
    submitData.append('title', formData.title);
    submitData.append('link', formData.link || '');
    if (activeTab === 'Excel' || activeTab === 'Codebase') {
      if (formData.file instanceof File) {
        submitData.append('file', formData.file);
      } else if (isEdit && formData.file) {
        submitData.append('file', formData.file); // for edit, keep existing file path
      }
    }
    if (isEdit) {
      submitData.append('id', editId);
    }
    this.setState({ loading: true });
    getService.addCall('link.php', apiAction, submitData)
      .then(res => {
        if (res.status === 'success') {
          this.setState({
            showModal: false,
            isEdit: false,
            formData: {},
            errors: {},
            editId: null,
            showSuccess: true,
            successMessage: res.message || (isEdit ? 'Link updated successfully!' : 'Link added successfully!'),
            loading: false,
          });
          this.fetchLinks();
        } else {
          this.setState({ showError: true, errorMessage: res.message || 'Failed to save link', loading: false });
        }
        setTimeout(this.dismissMessages, 3000);
      })
      .catch(err => {
        this.setState({ showError: true, errorMessage: err.message || 'Failed to save link', loading: false });
        setTimeout(this.dismissMessages, 3000);
      });
  };

  getDataKey = (tab) => {
    if (tab === 'Git') return 'gitLinks';
    if (tab === 'Excel') return 'excelLinks';
    if (tab === 'Codebase') return 'codebaseLinks';
    return '';
  };

  getPageKey = (tab) => {
    if (tab === 'Git') return 'currentPageGit';
    if (tab === 'Excel') return 'currentPageExcel';
    if (tab === 'Codebase') return 'currentPageCodebase';
    return '';
  };

  handlePageChange = (newPage, tab) => {
    const dataKey = this.getDataKey(tab);
    const pageKey = this.getPageKey(tab);
    const totalPages = Math.ceil(this.state[dataKey].length / this.state.dataPerPage);
    if (newPage >= 1 && newPage <= totalPages) {
      this.setState({ [pageKey]: newPage });
    }
  };

  renderPagination = (tab, totalItems) => {
    const pageKey = this.getPageKey(tab);
    const { dataPerPage } = this.state;
    const currentPage = this.state[pageKey];
    const totalPages = Math.ceil(totalItems / dataPerPage);
    if (totalPages <= 1) return null;
    return (
      <nav aria-label="Page navigation">
        <ul className="pagination mb-0 justify-content-end">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => this.handlePageChange(currentPage - 1, tab)}>
              Previous
            </button>
          </li>
          {currentPage > 3 && (
            <>
              <li className="page-item">
                <button className="page-link" onClick={() => this.handlePageChange(1, tab)}>
                  1
                </button>
              </li>
              {currentPage > 4 && (
                <li className="page-item disabled">
                  <span className="page-link">...</span>
                </li>
              )}
            </>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(pageNum => pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
            .map(pageNum => (
              <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                <button className="page-link" onClick={() => this.handlePageChange(pageNum, tab)}>
                  {pageNum}
                </button>
              </li>
            ))}
          {currentPage < totalPages - 2 && (
            <>
              {currentPage < totalPages - 3 && (
                <li className="page-item disabled">
                  <span className="page-link">...</span>
                </li>
              )}
              <li className="page-item">
                <button className="page-link" onClick={() => this.handlePageChange(totalPages, tab)}>
                  {totalPages}
                </button>
              </li>
            </>
          )}
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => this.handlePageChange(currentPage + 1, tab)}>
              Next
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  getFormData = () => {
    const { formData, activeTab } = this.state;
    if (formData && (formData.title || formData.link || formData.file)) {
      return formData;
    } else {
      // Default fields for each tab
      if (activeTab === 'Excel') {
        return { title: '', link: '', file: null };
      } else {
        return { title: '', link: '' };
      }
    }
  };

  render() {
    const { fixNavbar } = this.props;
    const {
      activeTab, gitLinks, excelLinks, codebaseLinks, showModal, isEdit, errors, loading, modalId,
      showDeleteModal, showSuccess, showError, successMessage, errorMessage,
      currentPageGit, currentPageExcel, currentPageCodebase, dataPerPage
    } = this.state;

    // Pagination logic for each tab
    const indexOfLastGit = currentPageGit * dataPerPage;
    const indexOfFirstGit = indexOfLastGit - dataPerPage;
    const currentGitLinks = gitLinks.slice(indexOfFirstGit, indexOfLastGit);
    const totalPagesGit = Math.ceil(gitLinks.length / dataPerPage);

    const indexOfLastExcel = currentPageExcel * dataPerPage;
    const indexOfFirstExcel = indexOfLastExcel - dataPerPage;
    const currentExcelLinks = excelLinks.slice(indexOfFirstExcel, indexOfLastExcel);
    const totalPagesExcel = Math.ceil(excelLinks.length / dataPerPage);

    const indexOfLastCodebase = currentPageCodebase * dataPerPage;
    const indexOfFirstCodebase = indexOfLastCodebase - dataPerPage;
    const currentCodebaseLinks = codebaseLinks.slice(indexOfFirstCodebase, indexOfLastCodebase);
    const totalPagesCodebase = Math.ceil(codebaseLinks.length / dataPerPage);

    return (
      <div className={`section-body ${fixNavbar ? "marginTop" : ""}`}>
        <AlertMessages
          showSuccess={showSuccess}
          successMessage={successMessage}
          showError={showError}
          errorMessage={errorMessage}
          setShowSuccess={(val) => this.setState({ showSuccess: val })}
          setShowError={(val) => this.setState({ showError: val })}
        />
        <div className="container-fluid">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <ul className="nav nav-tabs page-header-tab">
              <li className="nav-item">
                <a
                  className={`nav-link ${activeTab === 'Git' ? 'active' : ''}`}
                  id="Git-tab"
                  data-toggle="tab"
                  href="#Git"
                  onClick={() => this.handleTabChange('Git')}
                >
                  Git
                </a>
              </li>
              <li className="nav-item">
                <a
                  className={`nav-link ${activeTab === 'Excel' ? 'active' : ''}`}
                  id="Excel-tab"
                  data-toggle="tab"
                  href="#Excel"
                  onClick={() => this.handleTabChange('Excel')}
                >
                  Excel
                </a>
              </li>
              <li className="nav-item">
                <a
                  className={`nav-link ${activeTab === 'Codebase' ? 'active' : ''}`}
                  id="Codebase-tab"
                  data-toggle="tab"
                  href="#Codebase"
                  onClick={() => this.handleTabChange('Codebase')}
                >
                  Codebase
                </a>
              </li>
            </ul>
            <div className="header-action">
              <button
                onClick={this.handleAddClick}
                type="button"
                className="btn btn-primary"
              >
                <i className="fe fe-plus mr-2" />
                {activeTab === 'Git' && 'Add'}
                {activeTab === 'Excel' && 'Add'}
                {activeTab === 'Codebase' && 'Add'}
              </button>
            </div>
          </div>
          <div className="tab-content">
            <div className={`tab-pane fade ${activeTab === 'Git' ? 'show active' : ''}`} id="Git" role="tabpanel">
              <div className="card">
                <div className="card-body">
                  <LinkTable
                    data={currentGitLinks}
                    tab="Git"
                    onEdit={this.handleEditClick}
                    onDelete={this.handleDelete}
                  />
                  {this.renderPagination('Git', gitLinks.length)}
                </div>
              </div>
            </div>
            <div className={`tab-pane fade ${activeTab === 'Excel' ? 'show active' : ''}`} id="Excel" role="tabpanel">
              <div className="card">
                <div className="card-body">
                  <LinkTable
                    data={currentExcelLinks}
                    tab="Excel"
                    onEdit={this.handleEditClick}
                    onDelete={this.handleDelete}
                  />
                  {this.renderPagination('Excel', excelLinks.length)}
                </div>
              </div>
            </div>
            <div className={`tab-pane fade ${activeTab === 'Codebase' ? 'show active' : ''}`} id="Codebase" role="tabpanel">
              <div className="card">
                <div className="card-body">
                  <LinkTable
                    data={currentCodebaseLinks}
                    tab="Codebase"
                    onEdit={this.handleEditClick}
                    onDelete={this.handleDelete}
                  />
                  {this.renderPagination('Codebase', codebaseLinks.length)}
                </div>
              </div>
            </div>
          </div>
        </div>
        <LinkModal
          isEdit={isEdit}
          show={showModal}
          modalId={modalId}
          onClose={this.handleModalClose}
          onSubmit={this.handleModalSubmit}
          onChange={this.handleInputChange}
          formData={this.getFormData()}
          errors={errors}
          loading={loading}
          activeTab={activeTab}
        />
        <DeleteModal
          show={showDeleteModal}
          onConfirm={this.confirmDelete}
          isLoading={loading}
          deleteBody='Are you sure you want to delete this link?'
          modalId="deleteLinkModal"
          onClose={this.handleDeleteModalClose}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  fixNavbar: state.settings.isFixNavbar,
});
export default connect(mapStateToProps)(Link);