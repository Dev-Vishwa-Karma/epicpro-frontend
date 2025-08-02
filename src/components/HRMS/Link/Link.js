import React, { Component } from "react";
import { connect } from "react-redux";
import LinkTable from './LinkTable';
import LinkModal from './LinkModal';
import DeleteModal from '../../common/DeleteModal';
import DownloadModal from '../../common/DownloadModal';
import AlertMessages from '../../common/AlertMessages';
import TableSkeleton from '../../common/skeletons/TableSkeleton';
import { getService } from '../../../services/getService';
import { validateFields } from '../../common/validations';

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
      deleteType: null,
      deleteId: null,
      // Download confirmation modal state
      showDownloadModal: false,
      downloadFileUrl: null,
      downloadFileName: '',
      downloadFileExtension: '',
      showSuccess: false,
      showError: false,
      successMessage: '',
      errorMessage: '',
      // Pagination state
      currentPageGit: 1,
      currentPageExcel: 1,
      currentPageCodebase: 1,
      dataPerPage: 10,
      searchQuery: '', // Add search query state
    };
    this.searchDebounceTimer = null;
  }

  fetchLinks = (search = '') => {
    const params = { action: 'view' };
    if (search) params.search = search;
    getService.getCall('resources.php', params)
      .then(res => {
        if (res.status === 'success') {
          const gitLinks = res.data.filter(l => l.type && l.type.toLowerCase() === 'git');
          const excelLinks = res.data.filter(l => l.type && l.type.toLowerCase() === 'excel');
          const codebaseLinks = res.data.filter(l => l.type && l.type.toLowerCase() === 'codebase');
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
    this.setState({ activeTab: tabId, searchQuery: '', loading: true });
    this.fetchLinks()
  };

  handleAddClick = () => {
    this.setState({
      showModal: true,
      isEdit: false,
      formData: {},
      errors: {},
      editId: null,
    });
  };

  handleEdit = (type, id) => {
    const dataKey = this.getDataKey(type);
    const item = this.state[dataKey].find((row) => row.id === id);
    this.setState({
      showModal: true,
      isEdit: true,
      formData: { ...item, type },
      errors: {},
      editId: id,
    });
  };

  handleDelete = (type, id) => {
    this.setState({
      showDeleteModal: true,
      deleteType: type,
      deleteId: id,
    });
  };

  handleDeleteModalClose = () => {
    this.setState({
      showDeleteModal: false,
      deleteType: null,
      deleteId: null,
      loading: false,
    });
  };

  handleDownloadClick = (fileUrl) => {
    const fileName = fileUrl.split('/').pop();
    const fileExtension = fileName.split('.').pop();
    this.setState({
      showDownloadModal: true,
      downloadFileUrl: fileUrl,
      downloadFileName: fileName,
      downloadFileExtension: fileExtension
    });
  };

  handleDownloadConfirm = () => {
    const { downloadFileUrl } = this.state;
    // Get absolute URL
    const getAbsoluteUrl = (fileUrl) => {
      if (!fileUrl) return '';
      if (/^https?:\/\//i.test(fileUrl)) return fileUrl;
      const base = process.env.REACT_APP_API_URL?.replace(/\/$/, '') || '';
      return base + '/' + fileUrl.replace(/^\//, '');
    };
    
    const absUrl = getAbsoluteUrl(downloadFileUrl);
    const link = document.createElement('a');
    link.href = absUrl;
    link.download = '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    this.setState({
      showDownloadModal: false,
      downloadFileUrl: null,
      downloadFileName: '',
      downloadFileExtension: ''
    });
  };

  handleDownloadModalClose = () => {
    this.setState({
      showDownloadModal: false,
      downloadFileUrl: null,
      downloadFileName: '',
      downloadFileExtension: ''
    });
  };

  confirmDelete = () => {
    const { deleteId } = this.state;
    this.setState({ loading: true });
    getService.deleteCall('resources.php', 'delete', deleteId)
      .then(res => {
        if (res.status === 'success') {
          this.setState({
            showDeleteModal: false,
            deleteType: null,
            deleteId: null,
            loading: false,
            showSuccess: true,
            successMessage: res.message || 'Data deleted successfully!',
          });
          this.fetchLinks();
        } else {
          this.setState({ showError: true, errorMessage: res.message || 'Failed to delete data', loading: false });
        }
        setTimeout(this.dismissMessages, 3000);
      })
      .catch(err => {
        this.setState({ showError: true, errorMessage: err.message || 'Failed to delete data', loading: false });
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

  handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    this.setState((prevState) => ({
      formData: {
        ...prevState.formData,
        [name]: type === 'file' ? files[0] : value,
      },
      errors: {
        ...prevState.errors,
        [name]: '',
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
    
    // Apply Validation component
    const validationSchema = [
      { 
        name: 'title', 
        value: formData.title, 
        required: true, 
        messageName: 'Title'
      },
      { 
        name: 'url', 
        value: formData.url, 
        required: (activeTab === 'Git'), 
        messageName: 'URL',
        customValidator: (val) => {
          if (activeTab === 'Git') {
            if (!val || !val.trim()) {
              return 'URL is required.';
            }
          } else if (activeTab === 'Excel' || activeTab === 'Codebase') {
            const hasUrl = val && val.trim();
            const hasFile = !!formData.file_path;
            if (!hasUrl && !hasFile) {
              return 'Either URL or File is required.';
            }
          }
          return undefined;
        }
      },
      { 
        name: 'file_path', 
        value: formData.file_path, 
        required: false,
        customValidator: (val) => {
          if (activeTab === 'Excel' || activeTab === 'Codebase') {
            const hasUrl = formData.url && formData.url.trim();
            const hasFile = !!val;
            if (!hasUrl && !hasFile) {
              return 'Either URL or File is required.';
            }
          }
          return undefined;
        }
      }
    ];
    const errors = validateFields(validationSchema);
    
    this.setState({ errors });
    return Object.keys(errors).length === 0;
  };

  handleModalSubmit = () => {
    if (!this.validateForm()) return;
    const { isEdit, activeTab, formData, editId } = this.state;
    const apiAction = isEdit ? 'edit' : 'add';
    const submitData = new FormData();
    submitData.append('type', activeTab);
    submitData.append('title', formData.title);
    submitData.append('url', formData.url || '');
    if (activeTab === 'Excel' || activeTab === 'Codebase') {
      if (formData.file_path instanceof File) {
        submitData.append('file_path', formData.file_path);
      } else if (isEdit && formData.file_path) {
        submitData.append('file_path', formData.file_path); // for edit, keep existing file path
      }
    }
    if (isEdit) {
      submitData.append('id', editId);
    }
    this.setState({ loading: true });
    getService.addCall('resources.php', apiAction, submitData)
      .then(res => {
        if (res.status === 'success') {
          this.setState({
            showModal: false,
            isEdit: false,
            formData: {},
            errors: {},
            editId: null,
            showSuccess: true,
            successMessage: res.message || (isEdit ? 'Data updated successfully!' : 'Data added successfully!'),
            loading: false,
          });
          this.fetchLinks();
        } else {
          this.setState({ showError: true, errorMessage: res.message || 'Failed to save data', loading: false });
        }
        setTimeout(this.dismissMessages, 3000);
      })
      .catch(err => {
        this.setState({ showError: true, errorMessage: err.message || 'Failed to save data', loading: false });
        setTimeout(this.dismissMessages, 3000);
      });
  };

  getDataKey = (type) => {
    if (type === 'Git') return 'gitLinks';
    if (type === 'Excel') return 'excelLinks';
    if (type === 'Codebase') return 'codebaseLinks';
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

  handleSearch = (event) => {
    const query = event.target.value;
    this.setState({ 
      searchQuery: query, 
      currentPageGit: 1, 
      currentPageExcel: 1, 
      currentPageCodebase: 1 
    });
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
    this.searchDebounceTimer = setTimeout(() => {
      this.setState({ loading: true });
      this.fetchLinks(query);
    }, 1000);
  };

  componentDidMount() {
    this.setState({ loading: true });
    this.fetchLinks();
  }

  componentWillUnmount() {
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
  }

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
    if (formData && (formData.title || formData.url || formData.file_path)) {
      return formData;
    } else {
      // Default fields for each tab
      if (activeTab === 'Excel') {
        return { title: '', url: '', file_path: null };
      } else {
        return { title: '', url: '' };
      }
    }
  };

  render() {
    const { fixNavbar } = this.props;
    const {
      activeTab, gitLinks, excelLinks, codebaseLinks, showModal, isEdit, errors, loading, modalId,
      showDeleteModal, showDownloadModal, downloadFileName, downloadFileExtension, showSuccess, showError, successMessage, errorMessage,
      currentPageGit, currentPageExcel, currentPageCodebase, dataPerPage, searchQuery
    } = this.state;

    // Pagination logic for each tab (no frontend search filter)
    const indexOfLastGit = currentPageGit * dataPerPage;
    const indexOfFirstGit = indexOfLastGit - dataPerPage;
    const currentGitLinks = gitLinks.slice(indexOfFirstGit, indexOfLastGit);

    const indexOfLastExcel = currentPageExcel * dataPerPage;
    const indexOfFirstExcel = indexOfLastExcel - dataPerPage;
    const currentExcelLinks = excelLinks.slice(indexOfFirstExcel, indexOfLastExcel);

    const indexOfLastCodebase = currentPageCodebase * dataPerPage;
    const indexOfFirstCodebase = indexOfLastCodebase - dataPerPage;
    const currentCodebaseLinks = codebaseLinks.slice(indexOfFirstCodebase, indexOfLastCodebase);

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
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h3 className="card-title mb-0">Git Links</h3>
                  <div className="input-group ms-auto" style={{ maxWidth: 250, marginRight: 0 }}>
                    <div className="input-icon">
                      <span className="input-icon-addon">
                        <i className="fe fe-search" />
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search by title or URL..."
                        value={searchQuery}
                        onChange={this.handleSearch}
                      />
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  {loading ? (
                    <div className="dimmer active">
                      <TableSkeleton columns={3} rows={5} />
                    </div>
                  ) : (
                    <>
                      <LinkTable data={currentGitLinks} type="Git" onEdit={this.handleEdit} onDelete={this.handleDelete} onDownload={this.handleDownloadClick} />
                      {this.renderPagination('Git', gitLinks.length)}
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className={`tab-pane fade ${activeTab === 'Excel' ? 'show active' : ''}`} id="Excel" role="tabpanel">
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h3 className="card-title mb-0">Excel Links</h3>
                  <div className="input-group ms-auto" style={{ maxWidth: 250, marginRight: 0 }}>
                    <div className="input-icon">
                      <span className="input-icon-addon">
                        <i className="fe fe-search" />
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search by title or URL..."
                        value={searchQuery}
                        onChange={this.handleSearch}
                      />
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  {loading ? (
                    <div className="dimmer active">
                      <TableSkeleton columns={3} rows={5} />
                    </div>
                  ) : (
                    <>
                      <LinkTable data={currentExcelLinks} type="Excel" onEdit={this.handleEdit} onDelete={this.handleDelete} onDownload={this.handleDownloadClick} />
                      {this.renderPagination('Excel', excelLinks.length)}
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className={`tab-pane fade ${activeTab === 'Codebase' ? 'show active' : ''}`} id="Codebase" role="tabpanel">
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h3 className="card-title mb-0">Codebase Links</h3>
                  <div className="input-group ms-auto" style={{ maxWidth: 250, marginRight: 0 }}>
                    <div className="input-icon">
                      <span className="input-icon-addon">
                        <i className="fe fe-search" />

                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search by title or URL..."
                        value={searchQuery}
                        onChange={this.handleSearch}
                      />
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  {loading ? (
                    <div className="dimmer active">
                      <TableSkeleton columns={3} rows={5} />
                    </div>
                  ) : (
                    <>
                      <LinkTable data={currentCodebaseLinks} type="Codebase" onEdit={this.handleEdit} onDelete={this.handleDelete} onDownload={this.handleDownloadClick} />
                      {this.renderPagination('Codebase', codebaseLinks.length)}
                    </>
                  )}
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
        <DownloadModal
          show={showDownloadModal}
          onConfirm={this.handleDownloadConfirm}
          isLoading={false}
          deleteBody={`Are you sure you want to download this file? ${downloadFileName} ${downloadFileExtension}`}
          modalId="downloadFileModal"
          onClose={this.handleDownloadModalClose}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  fixNavbar: state.settings.isFixNavbar,
});
export default connect(mapStateToProps)(Link);
