import React, { Component } from "react";
import { connect } from "react-redux";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import dayjs from "dayjs";
import { getService } from "../../../services/getService";
import AlertMessages from "../../common/AlertMessages";
import Button from "../../common/formInputs/Button";
import DeleteModal from "../../common/DeleteModal";
import AddEditDiscussionModal from "./AddEditDiscussionModal";
import ViewDiscussion from "./ViewDiscussion";
import authService from "../../Authentication/authService";
import Avatar from "../../common/Avatar";
import "./Discussions.css";

// Cache discussions list in memory to prevent refetching API when coming back from ViewDiscussion
let cachedDiscussions = null;
let cachedTotal = 0;
let cachedHasMore = false;
let cachedOffset = 0;

class Discussions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      discussions: cachedDiscussions || [],
      employees: [],
      loading: !cachedDiscussions,
      loadingMore: false,
      buttonLoading: false,

      // Backend Pagination States
      sortOrder: "ASC",
      limit: 5,
      offset: cachedOffset,
      total: cachedTotal,
      hasMore: cachedHasMore,

      // Top Filter States
      searchQuery: "",
      filterDate: null,
      filterCreatedBy: "",
      filterParticipants: [],

      // Modal States
      showAddEditModal: false,
      showViewModal: false,
      showDeleteModal: false,
      selectedDiscussion: null,
      discussionToView: null,
      isEditing: false,
      discussionToDelete: null,


      // Alert States
      showSuccess: false,
      successMessage: "",
      showError: false,
      errorMessage: "",
    };

    this.searchTimeout = null;
  }

  componentDidMount() {
    this.fetchEmployees();
    if (!cachedDiscussions || cachedDiscussions.length === 0) {
      this.fetchDiscussions(false);
    }
    window.addEventListener("scroll", this.handleScroll, true);
    window.addEventListener("wheel", this.handleWheel, { passive: true });
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll, true);
    window.removeEventListener("wheel", this.handleWheel);
  }

  handleWheel = (e) => {
    const { loading, loadingMore, hasMore } = this.state;
    if (loading || loadingMore || !hasMore) return;

    // Detect wheel scroll UP gesture (deltaY < -5)
    if (e && e.deltaY < -5) {
      const now = Date.now();
      if (!this.lastWheelTime || now - this.lastWheelTime > 800) {
        this.lastWheelTime = now;
        if (this.contentScrollRef) {
          this.oldScrollHeight = this.contentScrollRef.scrollHeight;
        }
        this.fetchDiscussions(true);
      }
    }
  };

  handleContentScroll = (e) => {
    if (e && e.isTrusted === false) return;

    const { loading, loadingMore, hasMore } = this.state;
    if (loading || loadingMore || !hasMore) return;

    const target = e.target;
    if (!target) return;

    const currentScrollTop = target.scrollTop;
    const prevScrollTop = this.lastContentScrollTop || 0;

    if (Math.abs(currentScrollTop - prevScrollTop) < 10) return;

    const isScrollingUp = currentScrollTop < prevScrollTop;
    const wasScrolledDown = prevScrollTop > 40;

    if (isScrollingUp && wasScrolledDown && currentScrollTop <= 40) {
      this.oldScrollHeight = target.scrollHeight;
      this.fetchDiscussions(true);
    }

    this.lastContentScrollTop = currentScrollTop;
  };

  handleScroll = (e) => {
    if (e && e.isTrusted === false) return;

    const { loading, loadingMore, hasMore } = this.state;
    if (loading || loadingMore || !hasMore) return;

    const target = e?.target && e.target !== document ? e.target : document.documentElement;
    const scrollTop = target.scrollTop !== undefined ? target.scrollTop : (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0);

    const prevScrollTop = this.lastWindowScrollTop || 0;

    if (Math.abs(scrollTop - prevScrollTop) < 10) return;

    const isScrollingUp = scrollTop < prevScrollTop;
    const wasScrolledDown = prevScrollTop > 40;

    if (isScrollingUp && wasScrolledDown && scrollTop <= 40) {
      this.fetchDiscussions(true);
    }

    this.lastWindowScrollTop = scrollTop;
  };

  canModifyDiscussion = (disc) => {
    const user = authService.getUser() || window.user || {};
    const isAdmin = ["admin", "super_admin"].includes((user.role || "").toLowerCase());
    return isAdmin || String(disc?.created_by) === String(user.id || user.employee_id);
  };

  fetchEmployees = () => {
    getService
      .getCall("get_employees.php", { action: "view" })
      .then((res) => {
        const empList = res?.data || [];
        this.setState({ employees: empList });
      })
      .catch((err) => {
        console.error("Error fetching employees:", err);
      });
  };

  fetchDiscussions = (append = false) => {
    if (append) {
      if (this.state.loadingMore || !this.state.hasMore) return;
      this.setState({ loadingMore: true });
    } else {
      this.setState({ loading: true, discussions: [], offset: 0, hasMore: false });
    }

    const { searchQuery, filterDate, filterCreatedBy, filterParticipants, limit, discussions } =
      this.state;

    const currentOffset = append ? discussions.length : 0;

    const user = window.user || JSON.parse(localStorage.getItem("user") || "{}") || {};
    const currentUserId = user.id || user.employee_id;
    const currentUserRole = user.role || "";

    const params = {
      action: "view",
      limit: limit,
      offset: currentOffset,
      user_id: currentUserId,
      user_role: currentUserRole,
    };

    if (searchQuery.trim()) {
      params.search = searchQuery.trim();
    }

    if (filterDate) {
      const formattedDate = dayjs(filterDate).format("YYYY-MM-DD");
      params.from_date = formattedDate;
      params.date = formattedDate;
    }

    if (filterCreatedBy) {
      params.created_by = filterCreatedBy;
    }

    if (filterParticipants && filterParticipants.length > 0) {
      params.participants = filterParticipants
        .map((p) => p.value)
        .join(",");
    }

    getService
      .getCall("discussions.php", params)
      .then((res) => {
        if (res?.status === "success") {
          let fetchedList = [];
          let totalCount = 0;
          let hasMoreData = false;

          if (res.data && Array.isArray(res.data.discussions)) {
            fetchedList = res.data.discussions;
            totalCount = res.data.total ?? 0;
            hasMoreData = !!res.data.has_more;
          } else if (Array.isArray(res.data)) {
            fetchedList = res.data;
            totalCount = res.data.length;
            hasMoreData = false;
          }

          this.setState(
            (prevState) => {
              const newDiscussions = append ? [...fetchedList, ...prevState.discussions] : fetchedList;
              const newOffset = currentOffset + fetchedList.length;

              // Update in-memory cache
              cachedDiscussions = newDiscussions;
              cachedTotal = totalCount;
              cachedHasMore = hasMoreData;
              cachedOffset = newOffset;

              return {
                discussions: newDiscussions,
                total: totalCount,
                hasMore: hasMoreData,
                loading: false,
                loadingMore: false,
                offset: newOffset,
              };
            },
            () => {
              if (append && this.contentScrollRef && this.oldScrollHeight) {
                const newScrollHeight = this.contentScrollRef.scrollHeight;
                this.contentScrollRef.scrollTop = newScrollHeight - this.oldScrollHeight;
              }
            }
          );
        } else {
          this.setState({
            loading: false,
            loadingMore: false,
            errorMessage: res?.message || "Failed to fetch discussions",
            showError: true,
          });
        }
      })
      .catch((err) => {
        console.error("Error fetching discussions:", err);
        this.setState({
          loading: false,
          loadingMore: false,
          errorMessage: "Network error while loading discussions",
          showError: true,
        });
      });
  };

  handleSearchChange = (e) => {
    const val = e.target.value;
    this.setState({ searchQuery: val });
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      cachedDiscussions = null;
      this.fetchDiscussions(false);
    }, 500);
  };

  handleDateChange = (date) => {
    cachedDiscussions = null;
    this.setState({ filterDate: date }, () => {
      this.fetchDiscussions(false);
    });
  };

  handleCreatedByChange = (e) => {
    cachedDiscussions = null;
    this.setState({ filterCreatedBy: e.target.value }, () => {
      this.fetchDiscussions(false);
    });
  };

  handleParticipantsFilterChange = (selectedOptions) => {
    cachedDiscussions = null;
    this.setState(
      { filterParticipants: selectedOptions || [] },
      () => {
        this.fetchDiscussions(false);
      }
    );
  };

  // Add / Edit / View / Delete Handlers
  handleOpenAddModal = () => {
    this.setState({
      showAddEditModal: true,
      selectedDiscussion: null,
      isEditing: false,
    });
  };

  handleOpenEditModal = (discussion) => {
    this.setState({
      showAddEditModal: true,
      selectedDiscussion: discussion,
      isEditing: true,
    });
  };

  handleOpenViewModal = (discussion) => {
    if (discussion && discussion.id) {
      this.setState({
        showViewModal: true,
        discussionToView: discussion,
      });
    }
  };

  handleOpenDeleteModal = (discussion) => {
    this.setState({
      showDeleteModal: true,
      discussionToDelete: discussion,
    });
  };

  handleCloseModals = () => {
    this.setState({
      showAddEditModal: false,
      showDeleteModal: false,
      showViewModal: false,
      selectedDiscussion: null,
      discussionToDelete: null,
      discussionToView: null,
    });
  };

  handleSaveDiscussion = (payload) => {
    this.setState({ buttonLoading: true });
    const { isEditing, selectedDiscussion } = this.state;
    const user = window.user || JSON.parse(localStorage.getItem("user")) || {};
    const created_by = user.id || 1;

    const targetId = payload.id || (selectedDiscussion ? selectedDiscussion.id : null);
    const action = isEditing || targetId ? "edit" : "add";
    const dataToSend = {
      ...payload,
      id: targetId,
      created_by,
    };

    getService
      .addCall("discussions.php", action, dataToSend)
      .then((res) => {
        this.setState({ buttonLoading: false });
        if (res?.status === "success") {
          cachedDiscussions = null;
          this.setState({
            showSuccess: true,
            successMessage: res.message || (isEditing ? "Discussion updated" : "Discussion created"),
          });
          this.handleCloseModals();
          this.fetchDiscussions(false);
        } else {
          this.setState({
            showError: true,
            errorMessage: res?.message || "Operation failed",
          });
        }
      })
      .catch((err) => {
        this.setState({
          buttonLoading: false,
          showError: true,
          errorMessage: err?.response?.data?.message || "Failed to save discussion",
        });
      });
  };

  handleConfirmDelete = () => {
    const { discussionToDelete } = this.state;
    if (!discussionToDelete) return;

    this.setState({ buttonLoading: true });

    getService
      .addCall("discussions.php", "delete", { id: discussionToDelete.id })
      .then((res) => {
        this.setState({ buttonLoading: false });
        if (res?.status === "success") {
          cachedDiscussions = null;
          this.setState({
            showSuccess: true,
            successMessage: "Discussion deleted successfully",
          });
          this.handleCloseModals();
          this.fetchDiscussions(false);
        } else {
          this.setState({
            showError: true,
            errorMessage: res?.message || "Failed to delete discussion",
          });
        }
      })
      .catch((err) => {
        this.setState({
          buttonLoading: false,
          showError: true,
          errorMessage: "Error deleting discussion",
        });
      });
  };

  render() {
    const {
      discussions,
      employees,
      loading,
      loadingMore,
      buttonLoading,
      searchQuery,
      filterDate,
      filterCreatedBy,
      filterParticipants,
      showAddEditModal,
      showViewModal,
      showDeleteModal,
      selectedDiscussion,
      discussionToView,
      isEditing,
      discussionToDelete,
      sortOrder,
      showSuccess,
      successMessage,
      showError,
      errorMessage,
    } = this.state;

    const { fixNavbar } = this.props;

    const participantOptions = employees.map((emp) => ({
      value: emp.id,
      label: `${emp.first_name} ${emp.last_name}`,
    }));

    // Sort on UI side: sortOrder === 'ASC' puts last created at bottom
    const displayedDiscussions = [...discussions].sort((a, b) => {
      const timeA = new Date(a.created_at || 0).getTime();
      const timeB = new Date(b.created_at || 0).getTime();
      if (timeA !== timeB) {
        return sortOrder === "ASC" ? timeA - timeB : timeB - timeA;
      }
      return sortOrder === "ASC" ? a.id - b.id : b.id - a.id;
    });

    return (
      <div>
        <AlertMessages
          showSuccess={showSuccess}
          successMessage={successMessage}
          showError={showError}
          errorMessage={errorMessage}
          setShowSuccess={(val) => this.setState({ showSuccess: val })}
          setShowError={(val) => this.setState({ showError: val })}
        />

        {/* Page Subheader */}
        <div className={`section-body ${fixNavbar ? "marginTop" : ""}`}>
          <div className="container-fluid">
            <div className="d-flex justify-content-end align-items-center mb-2">
              <div className="header-action">
                <Button
                  label="Add Discussion"
                  onClick={this.handleOpenAddModal}
                  className="btn-primary"
                  icon="fe fe-plus mr-2"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section Body Content */}
        <div className="section-body mt-3">
          <div className="container-fluid">
            {/* Filters Row */}
            <div className="card mb-3 shadow-sm border-0" style={{ borderRadius: "10px" }}>
              <div className="card-body py-3 px-3">
                <div className="row clearfix align-items-center">
                  <div className="col-lg-3 col-md-6 col-sm-12 my-1">
                    <input
                      type="text"
                      className="form-control discussion-filter-control"
                      placeholder="Search title, description..."
                      value={searchQuery}
                      onChange={this.handleSearchChange}
                    />
                  </div>
                  <div className="col-lg-3 col-md-6 col-sm-12 my-1 discussion-filter-datepicker">
                    <DatePicker
                      selected={filterDate}
                      onChange={this.handleDateChange}
                      dateFormat="yyyy-MM-dd"
                      className="form-control discussion-filter-control"
                      placeholderText="Select date..."
                      isClearable
                    />
                  </div>
                  <div className="col-lg-3 col-md-6 col-sm-12 my-1">
                    <select
                      className="form-control custom-select discussion-filter-control"
                      value={filterCreatedBy}
                      onChange={this.handleCreatedByChange}
                    >
                      <option value="">Created By</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.first_name} {emp.last_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-lg-3 col-md-6 col-sm-12 my-1">
                    <Select
                      isMulti
                      options={participantOptions}
                      value={filterParticipants}
                      onChange={this.handleParticipantsFilterChange}
                      placeholder="Participants..."
                      className="basic-multi-select discussion-filter-select"
                      classNamePrefix="select"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Discussion Notes Scroll Container Box */}
            <div
              ref={(node) => (this.contentScrollRef = node)}
              className="card shadow-sm border-0 p-3 mb-0"
              style={{
                minHeight: fixNavbar ? "calc(100vh - 225px)" : "calc(100vh - 195px)",
                maxHeight: fixNavbar ? "calc(100vh - 225px)" : "calc(100vh - 195px)",
                overflowY: "auto",
                overflowX: "hidden",
                backgroundColor: "#f8fafc",
                borderRadius: "12px",
                paddingTop: "12px",
                paddingBottom: "12px",
              }}
              onScroll={this.handleContentScroll}
            >
              {/* Top Loading Spinner on Scroll UP */}
              {loadingMore && (
                <div className="text-center py-2 mb-2">
                  <div className="spinner-border spinner-border-sm text-primary mr-2" role="status"></div>
                  <small className="text-muted font-weight-bold">Loading older discussions...</small>
                </div>
              )}

              {loading ? (
                <div className="dimmer active mb-4 p-4 text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
                  <p className="mt-2 text-muted small">Loading discussions...</p>
                </div>
              ) : displayedDiscussions.length > 0 ? (
                <div className="row clearfix">
                  {displayedDiscussions.map((disc) => {
                    const isConcluded = disc.conclusion && disc.conclusion.trim();

                    return (
                      <div className="col-12 mb-2" key={disc.id}>
                        <div
                          className="card shadow-sm border-0 rounded-lg mb-0 discussion-card-item cursor-pointer"
                          onClick={() => this.handleOpenViewModal(disc)}
                          title="Click to view discussion details"
                          style={{
                            borderLeft: "5px solid #0284c7",
                            backgroundColor: "#ffffff",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                            minHeight: "85px",
                            cursor: "pointer",
                          }}
                        >
                          <div className="card-body py-2 px-3 d-flex align-items-center justify-content-between flex-wrap" style={{ minHeight: "85px" }}>
                            {/* 1. Date & Creator */}
                            <div className="d-flex align-items-center mr-3 my-1" style={{ minWidth: "170px" }}>
                              <div
                                className="text-center mr-3 px-2 py-2 rounded-lg border-0 flex-shrink-0"
                                title="Created Date"
                                style={{
                                  backgroundColor: "#e0f2fe",
                                  color: "#0284c7",
                                  minWidth: "55px",
                                }}
                              >
                                <small className="d-block font-weight-bold text-uppercase" style={{ fontSize: "11px", letterSpacing: "0.5px", lineHeight: "1" }}>
                                  {disc.created_at ? dayjs(disc.created_at).format("MMM") : "NOTE"}
                                </small>
                                <strong className="d-block font-weight-bold" style={{ fontSize: "18px", lineHeight: "1.1" }}>
                                  {disc.created_at ? dayjs(disc.created_at).format("DD") : "--"}
                                </strong>
                              </div>
                              <div
                                className="d-flex align-items-center"
                                title="Created By"
                              >
                                <Avatar
                                  profile={disc.creator_profile}
                                  first_name={disc.creator_first_name || disc.creator_name || "U"}
                                  last_name={disc.creator_last_name || ""}
                                  size={38}
                                  className="mr-2 flex-shrink-0"
                                />
                                <small className="text-dark font-weight-semibold text-truncate" style={{ maxWidth: "120px", fontSize: "13px" }}>
                                  {disc.creator_name || `User #${disc.created_by}`}
                                </small>
                              </div>
                            </div>

                            {/* 2. Content & Snippets */}
                            <div className="flex-fill mr-3 my-1" style={{ minWidth: "240px", maxWidth: "1080px" }}>
                              {/* Title Box */}
                              <div
                                className="mb-2 p-2 rounded"
                                title="Title"
                              // style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}
                              >
                                <div
                                  className="discussion-text-clamp d-flex align-items-center justify-content-between flex-wrap"
                                  style={{ fontSize: "20px", color: "#334155", wordBreak: "break-word" }}
                                >
                                  <div>
                                    <strong className="mr-1" style={{ color: "#475569" }} title="Title">
                                      <i className="fa fa-tag text-primary mr-1"></i>:
                                    </strong>
                                    <span className="font-weight-bold text-dark">
                                      {disc.title}
                                    </span>
                                  </div>
                                  {disc.participant_details && disc.participant_details.length > 0 && (
                                    <span
                                      className="badge badge-pill badge-light border text-secondary font-weight-normal my-1"
                                      title="Participants"
                                      style={{ fontSize: "15px", backgroundColor: "#ffffff" }}
                                    >
                                      <i className="fa fa-users text-info mr-1"></i>
                                      {disc.participant_details.length} participant{disc.participant_details.length > 1 ? "s" : ""}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Description Box */}
                              <div
                                className="mb-2 p-2 rounded"
                                title="Description"
                                style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}
                              >
                                <div
                                  className="discussion-text-clamp"
                                  style={{ fontSize: "13px", color: "#334155", lineHeight: "1.4", wordBreak: "break-word" }}
                                >
                                  <strong className="mr-1" style={{ color: "#475569" }} title="Description">
                                    <i className="fa fa-align-left text-primary mr-1"></i>:
                                  </strong>
                                  <span>{disc.description || "No description provided."}</span>
                                </div>
                              </div>

                              {/* Conclusion Box */}
                              {isConcluded && disc.conclusion ? (
                                <div
                                  className="p-2 rounded"
                                  title="Conclusion"
                                  style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}
                                >
                                  <div
                                    className="discussion-text-clamp"
                                    style={{ fontSize: "13px", color: "#15803d", lineHeight: "1.4", wordBreak: "break-word" }}
                                  >
                                    <strong className="mr-1" style={{ color: "#15803d" }} title="Conclusion">
                                      <i className="fa fa-check-circle text-success mr-1"></i>:
                                    </strong>
                                    <span>{disc.conclusion}</span>
                                  </div>
                                </div>
                              ) : null}
                            </div>

                            {/* 3. Action Buttons Column */}
                            <div
                              className="d-flex align-items-center justify-content-end my-1 flex-shrink-0"
                              title="Actions"
                              style={{ width: "115px" }}
                            >
                              <button
                                className="btn btn-sm btn-light text-primary rounded-circle mr-1 shadow-none"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  this.handleOpenViewModal(disc);
                                }}
                                title="View Details"
                                style={{ width: "32px", height: "32px", padding: 0 }}
                              >
                                <i className="fa fa-eye"></i>
                              </button>
                              {this.canModifyDiscussion(disc) && (
                                <button
                                  className="btn btn-sm btn-light text-info rounded-circle mr-1 shadow-none"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    this.handleOpenEditModal(disc);
                                  }}
                                  title="Edit Discussion"
                                  style={{ width: "32px", height: "32px", padding: 0 }}
                                >
                                  <i className="fa fa-edit"></i>
                                </button>
                              )}
                              {this.canModifyDiscussion(disc) && (
                                <button
                                  className="btn btn-sm btn-light text-danger rounded-circle shadow-none"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    this.handleOpenDeleteModal(disc);
                                  }}
                                  title="Delete Discussion"
                                  style={{ width: "32px", height: "32px", padding: 0 }}
                                >
                                  <i className="fa fa-trash-o"></i>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="card py-5 text-center text-muted">
                  <i className="fa fa-sticky-note-o fa-3x mb-2 text-secondary"></i>
                  <h5>No discussion Found</h5>
                  <p className="small mb-0">No discussion entries match your current search/filter parameters.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add/Edit Discussion Modal */}
        <AddEditDiscussionModal
          show={showAddEditModal}
          onClose={this.handleCloseModals}
          discussion={selectedDiscussion}
          isEditing={isEditing}
          isLoading={buttonLoading}
          employees={employees}
          onSubmit={this.handleSaveDiscussion}
        />

        {/* Delete Discussion Confirmation Modal */}
        <DeleteModal
          show={showDeleteModal}
          onClose={this.handleCloseModals}
          onConfirm={this.handleConfirmDelete}
          isLoading={buttonLoading}
          deleteBody={`Are you sure you want to delete the discussion "${discussionToDelete?.title}"? This action cannot be undone.`}
          label="Delete Discussion"
        />

        {/* View Discussion Modal */}
        <ViewDiscussion
          show={showViewModal}
          onClose={this.handleCloseModals}
          discussion={discussionToView}
          discussionId={discussionToView?.id}
          onDiscussionUpdated={() => this.fetchDiscussions(false)}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  fixNavbar: state.settings.isFixNavbar,
});

export default connect(mapStateToProps, {})(Discussions);

