import React, { Component } from "react";
import { connect } from "react-redux";
import LinkTable from "./LinkTable";
import LinkModal from "./LinkModal";
import DeleteModal from "../../common/DeleteModal";

class link extends Component {
  constructor() {
    super();
    this.state = {
      activeTab: 'Git',
      gitData: [],
      gitLoading: false,
      excelData: [],
      excelLoading: false,
      codebaseData: [],
      codebaseLoading: false,
      showModal: false,
      modalType: 'git',
      isEdit: false,
      modalInitialData: {},
      modalLoading: false,
      showDeleteModal: false,
      itemToDelete: null,
      modalErrors: {},
      searchQuery: '',
      gitCurrentPage: 1,
      excelCurrentPage: 1,
      codebaseCurrentPage: 1,
      dataPerPage: 10,
    };
  }

  componentDidMount() {
    this.setState({ gitLoading: true, excelLoading: true, codebaseLoading: true });
    setTimeout(() => {
      this.setState({
        gitData: [
          { id: 1, title: 'title1', link: 'title-link1' },
          { id: 2, title: 'title2', link: 'title-link2' },
          { id: 4, title: 'title3', link: 'title-link3' },
          { id: 5, title: 'title4', link: 'title-link4' },
          { id: 1, title: 'title1', link: 'title-link1' },
          { id: 2, title: 'title2', link: 'title-link2' },
          { id: 4, title: 'title3', link: 'title-link3' },
              { id: 5, title: 'title4', link: 'title-link4' },
          { id: 1, title: 'title1', link: 'title-link1' },
          { id: 2, title: 'title2', link: 'title-link2' },
          { id: 4, title: 'title3', link: 'title-link3' },
              { id: 5, title: 'title4', link: 'title-link4' },
          { id: 1, title: 'title1', link: 'title-link1' },
          { id: 2, title: 'title2', link: 'title-link2' },
          { id: 4, title: 'title3', link: 'title-link3' },
              { id: 5, title: 'title4', link: 'title-link4' },
          { id: 1, title: 'title1', link: 'title-link1' },
          { id: 2, title: 'title2', link: 'title-link2' },
          { id: 4, title: 'title3', link: 'title-link3' },
              { id: 5, title: 'title4', link: 'title-link4' },
          { id: 1, title: 'title1', link: 'title-link1' },
          { id: 2, title: 'title2', link: 'title-link2' },
          { id: 4, title: 'title3', link: 'title-link3' },
              { id: 5, title: 'title4', link: 'title-link4' },
          { id: 1, title: 'title1', link: 'title-link1' },
          { id: 2, title: 'title2', link: 'title-link2' },
          { id: 4, title: 'title3', link: 'title-link3' },
              { id: 5, title: 'title4', link: 'title-link4' },
          { id: 1, title: 'title1', link: 'title-link1' },
          { id: 2, title: 'title2', link: 'title-link2' },
          { id: 4, title: 'title3', link: 'title-link3' },
              { id: 5, title: 'title4', link: 'title-link4' },
          { id: 1, title: 'title1', link: 'title-link1' },
          { id: 2, title: 'title2', link: 'title-link2' },
          { id: 4, title: 'title3', link: 'title-link3' },
              { id: 5, title: 'title4', link: 'title-link4' },
          { id: 1, title: 'title1', link: 'title-link1' },
          { id: 2, title: 'title2', link: 'title-link2' },
          { id: 4, title: 'title3', link: 'title-link3' },
              { id: 5, title: 'title4', link: 'title-link4' },
          { id: 1, title: 'title1', link: 'title-link1' },
          { id: 2, title: 'title2', link: 'title-link2' },
          { id: 4, title: 'title3', link: 'title-link3' },
              { id: 5, title: 'title4', link: 'title-link4' },
          { id: 1, title: 'title1', link: 'title-link1' },
          { id: 2, title: 'title2', link: 'title-link2' },
          { id: 4, title: 'title3', link: 'title-link3' },
          { id: 5, title: 'title4', link: 'title-link4' },
        ],
        gitLoading: false,
        excelData: [
          { id: 1, title: 'excel1', link: 'excel-link1' },
          { id: 2, title: 'excel2', link: 'excel-link2' },
          { id: 3, title: 'excel3', link: 'excel-link3' },
          { id: 4, title: 'excel4', file: 'excel-link4' },
        ],
        excelLoading: false,
        codebaseData: [
          { id: 1, title: 'codebase1', link: 'codebase-link1' },
          { id: 2, title: 'codebase2', link: 'codebase-link2' },
          { id: 3, title: 'codebase3', file: 'https://preview.themeforest.net' },
          { id: 4, title: 'codebase4', link: 'codebase-link4' },
        ],
        codebaseLoading: false,
      });
    }, 1000);
  }

  handleTabChange = (tabId) => {
    let newState = { activeTab: tabId };
    if (tabId === 'Git') newState.gitCurrentPage = 1;
    if (tabId === 'Excel') newState.excelCurrentPage = 1;
    if (tabId === 'Codebase') newState.codebaseCurrentPage = 1;
    this.setState(newState);
  };

  handleAddClick = () => {
    const { activeTab } = this.state;
    let modalType = 'git';
    if (activeTab === 'Excel') modalType = 'excel';
    if (activeTab === 'Codebase') modalType = 'codebase';
    this.setState({
      showModal: true,
      modalType,
      isEdit: false,
      modalInitialData: {},
    });
  };

  handleEdit = (row) => {
    const { activeTab } = this.state;
    let modalType = 'git';
    if (activeTab === 'Excel') modalType = 'excel';
    if (activeTab === 'Codebase') modalType = 'codebase';
    this.setState({
      showModal: true,
      modalType,
      isEdit: true,
      modalInitialData: row,
    });
  };

  handleModalClose = () => {
    this.setState({ showModal: false, modalInitialData: {}, isEdit: false });
  };

  handleAddData = (form, type) => {
    const id = Date.now();
    if (type === 'git') {
      this.setState(prev => ({ gitData: [...prev.gitData, { ...form, id }] }));
    } else if (type === 'excel') {
      this.setState(prev => ({ excelData: [...prev.excelData, { ...form, id }] }));
    } else if (type === 'codebase') {
      this.setState(prev => ({ codebaseData: [...prev.codebaseData, { ...form, id }] }));
    }
  };

  validateModalForm = (form, type) => {
    let errors = {};
    // Title validation
    if (!form.title || form.title.trim() === "") {
      errors.title = "Title is required.";
    }
    // Git: Link required
    if (type === 'git') {
      if (!form.link || form.link.trim() === "") {
        errors.link = "Link is required.";
      }
    }
    // Excel/Codebase: Either Link or File required
    if (type === 'excel' || type === 'codebase') {
      if ((!form.link || form.link.trim() === "") && !form.file) {
        errors.link = "Either Link or File is required.";
        errors.file = "Either Link or File is required.";
      }
    }
    return errors;
  };

  handleModalSubmit = (form) => {
    const { modalType, isEdit, modalInitialData, gitData, excelData, codebaseData } = this.state;
    const errors = this.validateModalForm(form, modalType);
    if (Object.keys(errors).length > 0) {
      this.setState({ modalErrors: errors });
      return;
    }
    this.setState({ modalLoading: true, modalErrors: {} });
    setTimeout(() => {
      let updatedData;
      if (isEdit) {
        if (modalType === 'git') {
          updatedData = gitData.map(item => item.id === modalInitialData.id ? { ...item, ...form } : item);
          this.setState({ gitData: updatedData });
        } else if (modalType === 'excel') {
          updatedData = excelData.map(item => item.id === modalInitialData.id ? { ...item, ...form } : item);
          this.setState({ excelData: updatedData });
        } else if (modalType === 'codebase') {
          updatedData = codebaseData.map(item => item.id === modalInitialData.id ? { ...item, ...form } : item);
          this.setState({ codebaseData: updatedData });
        }
      } else {
        this.handleAddData(form, modalType);
      }
      this.setState({ showModal: false, modalLoading: false, modalInitialData: {}, isEdit: false });
    }, 500);
  };

  handleDelete = (row) => {
    this.setState({ showDeleteModal: true, itemToDelete: row });
  };

  handleDeleteConfirm = () => {
    const { activeTab, gitData, excelData, codebaseData, itemToDelete } = this.state;
    if (activeTab === 'Git') {
      this.setState({ gitData: gitData.filter(item => item.id !== itemToDelete.id) });
    } else if (activeTab === 'Excel') {
      this.setState({ excelData: excelData.filter(item => item.id !== itemToDelete.id) });
    } else if (activeTab === 'Codebase') {
      this.setState({ codebaseData: codebaseData.filter(item => item.id !== itemToDelete.id) });
    }
    this.setState({ showDeleteModal: false, itemToDelete: null });
  };

  handleDeleteModalClose = () => {
    this.setState({ showDeleteModal: false, itemToDelete: null });
  };

  handleSearchChange = (e) => {
    const { activeTab } = this.state;
    const value = e.target.value;
    if (activeTab === 'Git') {
      this.setState({ searchQuery: value, gitCurrentPage: 1 });
    } else if (activeTab === 'Excel') {
      this.setState({ searchQuery: value, excelCurrentPage: 1 });
    } else if (activeTab === 'Codebase') {
      this.setState({ searchQuery: value, codebaseCurrentPage: 1 });
    }
  };

  handlePageChange = (tab, pageNum) => {
    if (tab === 'git') this.setState({ gitCurrentPage: pageNum });
    if (tab === 'excel') this.setState({ excelCurrentPage: pageNum });
    if (tab === 'codebase') this.setState({ codebaseCurrentPage: pageNum });
  };

  render() {
    const { activeTab, gitData, gitLoading, excelData, excelLoading, codebaseData, codebaseLoading, showModal, modalType, isEdit, modalInitialData, modalLoading, showDeleteModal, searchQuery, gitCurrentPage, excelCurrentPage, codebaseCurrentPage, dataPerPage } = this.state;
    // Filter data by search query
    const filterData = (data) => {
      if (!searchQuery.trim()) return data;
      return data.filter(row =>
        (row.title && row.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (row.link && row.link.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    };
    // Pagination logic
    const paginate = (data, currentPage) => {
      const total = data.length;
      const totalPages = Math.ceil(total / dataPerPage);
      const start = (currentPage - 1) * dataPerPage;
      const end = start + dataPerPage;
      return {
        pageData: data.slice(start, end),
        totalPages,
        total,
      };
    };
    const gitFiltered = filterData(gitData);
    const excelFiltered = filterData(excelData);
    const codebaseFiltered = filterData(codebaseData);
    const gitPaginated = paginate(gitFiltered, gitCurrentPage);
    const excelPaginated = paginate(excelFiltered, excelCurrentPage);
    const codebasePaginated = paginate(codebaseFiltered, codebaseCurrentPage);
    return (
    <>
        <div className="section-body">
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
                  type="button"
                  className="btn btn-primary"
                  onClick={this.handleAddClick}
                >
                  <i className="fe fe-plus mr-2" />Add
                </button>
              </div>
            </div>
            <div className="tab-content">
              <div className={`tab-pane fade show ${activeTab === 'Git' ? 'active' : ''}`} id="Git" role="tabpanel">
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Git List</h3>
                    <div className="card-options">
                      <div className="input-group">
                        <div className="input-icon ml-2">
                          <span className="input-icon-addon">
                            <i className="fe fe-search" />
                          </span>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Search by title or link..."
                            value={searchQuery}
                            onChange={this.handleSearchChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <LinkTable
                    data={gitPaginated.pageData}
                    loading={gitLoading}
                    emptyMessage="No repositories found"
                    onEdit={this.handleEdit}
                    onDelete={this.handleDelete}
                    type="git"
                  />
                  {gitPaginated.totalPages > 1 && (
                    <nav aria-label="Page navigation">
                      <ul className="pagination mb-0 justify-content-end">
                        <li className={`page-item ${gitCurrentPage === 1 ? 'disabled' : ''}`}>
                          <button className="page-link" onClick={() => this.handlePageChange('git', gitCurrentPage - 1)}>Previous</button>
                        </li>
                        {gitCurrentPage > 5 && (
                          <li className="page-item"><button className="page-link" onClick={() => this.handlePageChange('git', 1)}>1</button></li>
                        )}
                        {gitCurrentPage > 6 && (
                          <li className="page-item disabled"><span className="page-link">...</span></li>
                        )}
                        {Array.from({ length: Math.min(5, gitPaginated.totalPages) }, (_, i) => {
                          let pageNum;
                          if (gitCurrentPage <= 3) {
                            pageNum = i + 1;
                          } else if (gitCurrentPage >= gitPaginated.totalPages - 2) {
                            pageNum = gitPaginated.totalPages - 4 + i;
                          } else {
                            pageNum = gitCurrentPage - 2 + i;
                          }
                          if (pageNum > 0 && pageNum <= gitPaginated.totalPages) {
                            return (
                              <li key={pageNum} className={`page-item ${gitCurrentPage === pageNum ? 'active' : ''}`}>
                                <button className="page-link" onClick={() => this.handlePageChange('git', pageNum)}>{pageNum}</button>
                              </li>
                            );
                          }
                          return null;
                        })}
                        {gitCurrentPage < gitPaginated.totalPages - 3 && (
                          <li className="page-item disabled"><span className="page-link">...</span></li>
                        )}
                        {gitCurrentPage < gitPaginated.totalPages - 2 && (
                          <li className="page-item"><button className="page-link" onClick={() => this.handlePageChange('git', gitPaginated.totalPages)}>{gitPaginated.totalPages}</button></li>
                        )}
                        <li className={`page-item ${gitCurrentPage === gitPaginated.totalPages ? 'disabled' : ''}`}>
                          <button className="page-link" onClick={() => this.handlePageChange('git', gitCurrentPage + 1)}>Next</button>
                        </li>
                      </ul>
                    </nav>
                  )}
                </div>
              </div>
              <div className={`tab-pane fade show ${activeTab === 'Excel' ? 'active' : ''}`} id="Excel" role="tabpanel">
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Excel List</h3>
                    <div className="card-options">
                      <div className="input-group">
                        <div className="input-icon ml-2">
                          <span className="input-icon-addon">
                            <i className="fe fe-search" />
                          </span>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Search by title or link..."
                            value={searchQuery}
                            onChange={this.handleSearchChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <LinkTable
                    data={excelPaginated.pageData}
                    loading={excelLoading}
                    emptyMessage="No excel files found"
                    onEdit={this.handleEdit}
                    onDelete={this.handleDelete}
                    type="excel"
                  />
                  {excelPaginated.totalPages > 1 && (
                    <nav aria-label="Page navigation">
                      <ul className="pagination mb-0 justify-content-end">
                        <li className={`page-item ${excelCurrentPage === 1 ? 'disabled' : ''}`}>
                          <button className="page-link" onClick={() => this.handlePageChange('excel', excelCurrentPage - 1)}>Previous</button>
                        </li>
                        {excelCurrentPage > 5 && (
                          <li className="page-item"><button className="page-link" onClick={() => this.handlePageChange('excel', 1)}>1</button></li>
                        )}
                        {excelCurrentPage > 6 && (
                          <li className="page-item disabled"><span className="page-link">...</span></li>
                        )}
                        {Array.from({ length: Math.min(5, excelPaginated.totalPages) }, (_, i) => {
                          let pageNum;
                          if (excelCurrentPage <= 3) {
                            pageNum = i + 1;
                          } else if (excelCurrentPage >= excelPaginated.totalPages - 2) {
                            pageNum = excelPaginated.totalPages - 4 + i;
                          } else {
                            pageNum = excelCurrentPage - 2 + i;
                          }
                          if (pageNum > 0 && pageNum <= excelPaginated.totalPages) {
                            return (
                              <li key={pageNum} className={`page-item ${excelCurrentPage === pageNum ? 'active' : ''}`}>
                                <button className="page-link" onClick={() => this.handlePageChange('excel', pageNum)}>{pageNum}</button>
                              </li>
                            );
                          }
                          return null;
                        })}
                        {excelCurrentPage < excelPaginated.totalPages - 3 && (
                          <li className="page-item disabled"><span className="page-link">...</span></li>
                        )}
                        {excelCurrentPage < excelPaginated.totalPages - 2 && (
                          <li className="page-item"><button className="page-link" onClick={() => this.handlePageChange('excel', excelPaginated.totalPages)}>{excelPaginated.totalPages}</button></li>
                        )}
                        <li className={`page-item ${excelCurrentPage === excelPaginated.totalPages ? 'disabled' : ''}`}>
                          <button className="page-link" onClick={() => this.handlePageChange('excel', excelCurrentPage + 1)}>Next</button>
                        </li>
                      </ul>
                    </nav>
                  )}
                </div>
              </div>
              <div className={`tab-pane fade show ${activeTab === 'Codebase' ? 'active' : ''}`} id="Codebase" role="tabpanel">
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Codebase List</h3>
                    <div className="card-options">
                      <div className="input-group">
                        <div className="input-icon ml-2">
                          <span className="input-icon-addon">
                            <i className="fe fe-search" />
                          </span>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Search by title or link..."
                            value={searchQuery}
                            onChange={this.handleSearchChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <LinkTable
                    data={codebasePaginated.pageData}
                    loading={codebaseLoading}
                    emptyMessage="No codebase files found"
                    onEdit={this.handleEdit}
                    onDelete={this.handleDelete}
                    type="codebase"
                  />
                  {codebasePaginated.totalPages > 1 && (
                    <nav aria-label="Page navigation">
                      <ul className="pagination mb-0 justify-content-end">
                        <li className={`page-item ${codebaseCurrentPage === 1 ? 'disabled' : ''}`}>
                          <button className="page-link" onClick={() => this.handlePageChange('codebase', codebaseCurrentPage - 1)}>Previous</button>
                        </li>
                        {codebaseCurrentPage > 5 && (
                          <li className="page-item"><button className="page-link" onClick={() => this.handlePageChange('codebase', 1)}>1</button></li>
                        )}
                        {codebaseCurrentPage > 6 && (
                          <li className="page-item disabled"><span className="page-link">...</span></li>
                        )}
                        {Array.from({ length: Math.min(5, codebasePaginated.totalPages) }, (_, i) => {
                          let pageNum;
                          if (codebaseCurrentPage <= 3) {
                            pageNum = i + 1;
                          } else if (codebaseCurrentPage >= codebasePaginated.totalPages - 2) {
                            pageNum = codebasePaginated.totalPages - 4 + i;
                          } else {
                            pageNum = codebaseCurrentPage - 2 + i;
                          }
                          if (pageNum > 0 && pageNum <= codebasePaginated.totalPages) {
                            return (
                              <li key={pageNum} className={`page-item ${codebaseCurrentPage === pageNum ? 'active' : ''}`}>
                                <button className="page-link" onClick={() => this.handlePageChange('codebase', pageNum)}>{pageNum}</button>
                              </li>
                            );
                          }
                          return null;
                        })}
                        {codebaseCurrentPage < codebasePaginated.totalPages - 3 && (
                          <li className="page-item disabled"><span className="page-link">...</span></li>
                        )}
                        {codebaseCurrentPage < codebasePaginated.totalPages - 2 && (
                          <li className="page-item"><button className="page-link" onClick={() => this.handlePageChange('codebase', codebasePaginated.totalPages)}>{codebasePaginated.totalPages}</button></li>
                        )}
                        <li className={`page-item ${codebaseCurrentPage === codebasePaginated.totalPages ? 'disabled' : ''}`}>
                          <button className="page-link" onClick={() => this.handlePageChange('codebase', codebaseCurrentPage + 1)}>Next</button>
                        </li>
                      </ul>
                    </nav>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <LinkModal
          show={showModal}
          onClose={this.handleModalClose}
          onSubmit={this.handleModalSubmit}
          type={modalType}
          isEdit={isEdit}
          initialData={modalInitialData}
          loading={modalLoading}
          errors={this.state.modalErrors}
        />
        <DeleteModal
          show={showDeleteModal}
          onConfirm={this.handleDeleteConfirm}
          onClose={this.handleDeleteModalClose}
          isLoading={false}
          deleteBody="Are you sure you want to delete this item?"
          modalId="deleteLinkModal"
        />
        {showDeleteModal && <div className="modal-backdrop fade show" />}
    </>
    );
  }
}

const mapStateToProps = (state) => ({
  fixNavbar: state.settings.isFixNavbar,
});
export default connect(mapStateToProps)(link);