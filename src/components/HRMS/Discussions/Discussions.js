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
import ParticipantsModal from "./ParticipantsModal";
import authService from "../../Authentication/authService";
import Avatar from "../../common/Avatar";
import api from "../../../api/axios";
import cryptoService from "../../../services/cryptoService";
import BulkRecoveryModal from "./BulkRecoveryModal";
import "./Discussions.css";

let cachedDiscussions = null;
let cachedTotal = 0;
let cachedHasMore = false;
let cachedPage = 1;

const parseTags = (rawTags) => {
  if (!rawTags) return [];
  if (Array.isArray(rawTags)) return rawTags.map(String);
  if (typeof rawTags === "string") {
    try {
      const parsed = JSON.parse(rawTags);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch (e) {
      return rawTags.split(",").map((t) => t.trim()).filter(Boolean);
    }
  }
  return [];
};

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
      limit: 3,
      page: cachedPage,
      total: cachedTotal,
      hasMore: cachedHasMore,

      // Top Filter States
      searchQuery: "",
      filterDate: null,
      filterCreatedBy: null,
      filterParticipants: [],

      // Modal States
      showAddEditModal: false,
      showViewModal: false,
      showDeleteModal: false,
      showParticipantsModal: false,
      e2eeStatus: "checking", // 'checking', 'ready', 'missing'
      selectedDiscussion: null,
      discussionToView: null,
      isEditing: false,
      discussionToDelete: null,

      // Unified Bulk Recovery Modal State (Request / Approve)
      showBulkModal: false,
      bulkModalMode: "approve", // "request" | "approve"
      bulkRequesterId: null,
      bulkRequesterName: "",
      bulkRequesterPublicKey: null,

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
    this.checkE2EEStatus();
    if (!cachedDiscussions || cachedDiscussions.length === 0) {
      this.fetchDiscussions(false);
    }
    window.addEventListener("scroll", this.handleScroll, true);
    window.addEventListener("wheel", this.handleWheel, { passive: true });
    window.addEventListener("e2eeKeysUpdated", this.handleE2EEKeysUpdated);
    window.addEventListener("openBulkApprovalModal", this.handleOpenBulkApprovalModal);
  }

  handleE2EEKeysUpdated = () => {
    cachedDiscussions = null;
    this.setState(
      {
        e2eeStatus: "ready",
        page: 1,
        discussions: [],
        loading: true,
      },
      () => {
        this.checkE2EEStatus();
        this.fetchEmployees();
        this.fetchDiscussions(false);
      }
    );
  };

  checkE2EEStatus = async () => {
    const user = authService.getUser();
    if (!user || !user.id) return;

    try {
      const res = await api.get("/get_employees.php?action=check-public-key");
      const publicKey = res.data?.data?.public_key;
      const hasPrivateKey = await cryptoService.hasPrivateKey(user.id);

      if (!publicKey || !hasPrivateKey) {
        this.setState({
          e2eeStatus: "missing",
        });
      } else {
        this.setState({
          e2eeStatus: "ready",
        });
      }
    } catch (error) {
      console.error("E2EE status check failed:", error);
    }
  };

  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll, true);
    window.removeEventListener("wheel", this.handleWheel);
    window.removeEventListener("e2eeKeysUpdated", this.handleE2EEKeysUpdated);
    window.removeEventListener("openBulkApprovalModal", this.handleOpenBulkApprovalModal);
  }

  handleOpenBulkRecoveryModal = () => {
    if (this.state.e2eeStatus !== "ready") {
      window.dispatchEvent(new Event('openE2EESetupModal'));
      return;
    }
    this.setState({
      showBulkModal: true,
      bulkModalMode: "request",
    })
  }

  handleOpenBulkApprovalModal = (event) => {
    const { requesterId, requesterPublicKey, requesterName } = event.detail || {};
    if (!requesterId) return;
    this.setState({
      showBulkModal: true,
      bulkModalMode: "approve",
      bulkRequesterId: requesterId,
      bulkRequesterName: requesterName || "A participant",
      bulkRequesterPublicKey: requesterPublicKey || null,
    });
  };

  handleWheel = (e) => {
    const { loading, loadingMore, hasMore } = this.state;
    if (loading || loadingMore || !hasMore) return;

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
    const uId = String(user.id || user.employee_id || "");
    const isE2EEReady = this.state.e2eeStatus === "ready";
    const isAdmin = authService.isAdminCheck ? authService.isAdminCheck() : (authService.isAdmin ? authService.isAdmin() : false);
    return isE2EEReady && (String(disc?.created_by) === uId || isAdmin);
  };

  fetchEmployees = () => {
    getService
      .getCall("get_employees.php", { action: "view", role: "admin" })
      .then((res) => {
        const empList = res?.data || [];
        this.setState({ employees: empList });
      })
      .catch((err) => {
        console.error("Error fetching employees:", err);
      });
  };

  decryptDiscussionsList = async (discussionsList) => {
    const user = authService.getUser();
    if (!user || !user.id || !Array.isArray(discussionsList)) return discussionsList;

    const decryptedPromises = discussionsList.map((disc) =>
      cryptoService.decryptDiscussionDetails(disc, user.id)
    );

    return await Promise.all(decryptedPromises);
  };

  fetchDiscussions = (append = false) => {
    if (append) {
      if (this.state.loadingMore || !this.state.hasMore) return;
      this.setState({ loadingMore: true });
    } else {
      this.setState({ loading: true, discussions: [], page: 1, hasMore: false });
    }

    const { filterDate, filterCreatedBy, filterParticipants, limit, discussions } =
      this.state;

    const currentPage = append ? Math.floor(discussions.length / limit) + 1 : 1;

    const params = {
      action: "view",
      limit: limit,
      page: currentPage,
    };

    if (filterDate) {
      const formattedDate = dayjs(filterDate).format("YYYY-MM-DD");
      params.from_date = formattedDate;
      params.date = formattedDate;
    }

    if (filterCreatedBy) {
      params.created_by = filterCreatedBy.value || filterCreatedBy;
    }

    if (filterParticipants && filterParticipants.length > 0) {
      params.participants = filterParticipants
        .map((p) => p.value)
        .join(",");
    }

    getService
      .getCall("discussions.php", params)
      .then(async (res) => {
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

          fetchedList = await this.decryptDiscussionsList(fetchedList);

          this.setState(
            (prevState) => {
              const newDiscussions = append ? [...fetchedList, ...prevState.discussions] : fetchedList;
              // Update in-memory cache
              cachedDiscussions = newDiscussions;
              cachedTotal = totalCount;
              cachedHasMore = hasMoreData;
              cachedPage = currentPage;

              return {
                discussions: newDiscussions,
                total: totalCount,
                hasMore: hasMoreData,
                loading: false,
                loadingMore: false,
                page: currentPage,
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
    this.setState({ searchQuery: e.target.value });
  };

  handleDateChange = (date) => {
    cachedDiscussions = null;
    this.setState({ filterDate: date }, () => {
      this.fetchDiscussions(false);
    });
  };

  handleCreatedByChange = (selectedOption) => {
    cachedDiscussions = null;
    this.setState({ filterCreatedBy: selectedOption || null }, () => {
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
    if (this.state.e2eeStatus !== "ready") {
      window.dispatchEvent(new Event('openE2EESetupModal'));
      return;
    }
    this.setState({
      showAddEditModal: true,
      selectedDiscussion: null,
      isEditing: false,
    });
  };

  handleOpenEditModal = (discussion) => {
    if (this.state.e2eeStatus !== "ready") {
      window.dispatchEvent(new Event('openE2EESetupModal'));
      return;
    }
    this.setState({
      showAddEditModal: true,
      selectedDiscussion: discussion,
      isEditing: true,
    });
  };

  handleOpenViewModal = (discussion) => {
    if (this.state.e2eeStatus !== "ready") {
      window.dispatchEvent(new Event('openE2EESetupModal'));
      return;
    }
    if (discussion && discussion.id) {
      this.setState({
        showViewModal: true,
        discussionToView: discussion,
      });
    }
  };

  handleParticipantModal = (discussion) => {
    if (this.state.e2eeStatus !== "ready") {
      window.dispatchEvent(new Event('openE2EESetupModal'));
      return;
    }
    this.setState({
      showParticipantsModal: true,
      discussionToView: discussion,
    });
  };

  handleOpenDeleteModal = (discussion) => {
    if (this.state.e2eeStatus !== "ready") {
      window.dispatchEvent(new Event('openE2EESetupModal'));
      return;
    }
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
      showParticipantsModal: false,
      selectedDiscussion: null,
      discussionToDelete: null,
      discussionToView: null,
    });
  };

  handleSaveDiscussion = (payload) => {
    this.setState({ buttonLoading: true });
    const { isEditing, selectedDiscussion } = this.state;

    const targetId = payload.id || (selectedDiscussion ? selectedDiscussion.id : null);
    const action = isEditing || targetId ? "edit" : "add";
    const dataToSend = {
      ...payload,
      id: targetId,
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
      showParticipantsModal,
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

    // Show Sync Bulk button only when there is at least one un-decrypted discussion
    const hasAnyUndecrypted = discussions.some((d) => !d.isDecrypted);

    // Participant options excluding current user (can't request from yourself)
    const currentUser = authService.getUser();
    const currentUserId = currentUser?.id;

    const participantOptions = employees.map((emp) => ({
      value: emp.id,
      label: currentUser && Number(currentUser.id) === Number(emp.id) ? `You` : `${emp.first_name} ${emp.last_name}`,
    }));

    let displayedDiscussions = [...discussions];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      displayedDiscussions = displayedDiscussions.filter((disc) => {
        const title = (disc.title || "").toLowerCase();
        const description = (disc.description || "").toLowerCase();
        const conclusion = (disc.conclusion || "").toLowerCase();
        const creatorName = (disc.creator_name || "").toLowerCase();

        return (
          title.includes(q) ||
          description.includes(q) ||
          conclusion.includes(q) ||
          creatorName.includes(q)
        );
      });
    }

    displayedDiscussions.sort((a, b) => {
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
              <div className="header-action d-flex align-items-center">
                {this.state.e2eeStatus === "ready" ? (
                  <span className="badge badge-success px-3 py-2 mr-2" style={{ fontSize: "13px", fontWeight: "600", borderRadius: "8px" }}>
                    <i className="fe fe-shield mr-1" /> E2EE Active
                  </span>
                ) : (
                  <button
                    className="btn btn-sm btn-outline-warning mr-2"
                    style={{ fontWeight: "600", borderRadius: "8px" }}
                    onClick={() => window.dispatchEvent(new Event('openE2EESetupModal'))}
                  >
                    <i className="fe fe-shield-off mr-1" /> E2EE Disabled
                  </button>
                )}

                {/* Sync Bulk button — only visible when any discussion is NOT decrypted */}
                {hasAnyUndecrypted && (
                  <button
                    className="btn btn-sm btn-outline-info mr-2"
                    style={{ fontWeight: "600", borderRadius: "8px" }}
                    title="Request bulk key recovery from another participant"
                    onClick={() =>
                      this.handleOpenBulkRecoveryModal()
                    }
                  >
                    <i className="fa fa-refresh mr-1" /> Sync Bulk
                  </button>
                )}

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
                    <Select
                      isClearable
                      options={participantOptions}
                      value={filterCreatedBy}
                      onChange={this.handleCreatedByChange}
                      placeholder="Created By..."
                      className="basic-single-select discussion-filter-select"
                      classNamePrefix="select"
                    />
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
                    const displayParticipants = disc.participant_details ? disc.participant_details : [];

                    const currentUserId = authService.getUser()?.id;
                    const currentUserParticipant = (displayParticipants || []).find(
                      (p) => Number(p.user_id) === Number(currentUserId)
                    );
                    const myTags = parseTags(currentUserParticipant?.tags);
                    const hasApproveRequest = disc.isDecrypted && displayParticipants.some((p) => myTags.includes(String(p.user_id)));
                    const hasSentRequest = !disc.isDecrypted && displayParticipants.some((p) => parseTags(p?.tags).includes(String(currentUserId)));

                    return (
                      <div className="col-12 mb-3" key={disc.id}>
                        <div
                          className="card shadow-sm rounded-lg mb-0 discussion-card-item cursor-pointer position-relative overflow-hidden"
                          onClick={() => this.handleOpenViewModal(disc)}
                          title="Click to view discussion details"
                          style={{
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            backgroundColor: "#ffffff",
                            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                            minHeight: "85px",
                            cursor: "pointer",
                            position: "relative",
                            overflow: "hidden",
                          }}
                        >
                          {/* Top Right Corner Tag: Approvals or Requested */}
                          {hasApproveRequest || hasSentRequest ? (
                            <div
                              className="position-absolute cursor-pointer"
                              style={{
                                top: 0,
                                right: 0,
                                zIndex: 10,
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                this.handleParticipantModal(disc);
                              }}
                              title={hasApproveRequest ? "Recovery request waiting for your approval." : "Recovery request sent. Waiting for approval."}
                            >
                              <span
                                className="badge font-weight-bold d-inline-flex align-items-center shadow-sm"
                                style={{
                                  backgroundColor: hasApproveRequest ? "#f59e0b" : "#2563eb",
                                  color: "#ffffff",
                                  borderBottomLeftRadius: "8px",
                                  borderTopRightRadius: "6px",
                                  padding: "9px 10px",
                                  fontSize: "11px",
                                  letterSpacing: "0.4px",
                                  fontWeight: "700",
                                  boxShadow: "0 2px 4px rgba(0,0,0,0.12)"
                                }}
                              >
                                <i className="fa fa-exclamation-circle mr-1" style={{ fontSize: "11px" }} />
                                {hasApproveRequest ? "Approvals" : "Requested"}
                              </span>
                            </div>
                          ) : null}

                          <div className="card-body py-3 px-3 d-flex align-items-center justify-content-between discussion-card-body">
                            {/* 1. Date & Creator */}
                            <div className="d-flex align-items-center mr-md-3 discussion-meta-col">
                              {/* Date Container */}
                              <div
                                className="text-center mr-3 rounded-lg flex-shrink-0"
                                title="Created Date"
                                style={{
                                  backgroundColor: "#eff6ff",
                                  border: "1px solid #dbeafe",
                                  minWidth: "62px",
                                  paddingTop: "6px",
                                  paddingBottom: "6px",
                                  paddingLeft: "8px",
                                  paddingRight: "8px",
                                  borderRadius: "10px",
                                }}
                              >
                                <small
                                  className="d-block font-weight-bold text-uppercase"
                                  style={{ fontSize: "11px", letterSpacing: "0.5px", lineHeight: "1", color: "#2563eb" }}
                                >
                                  {disc.created_at ? dayjs(disc.created_at).format("MMM") : "NOTE"}
                                </small>
                                <strong
                                  className="d-block font-weight-extrabold my-1"
                                  style={{ fontSize: "20px", lineHeight: "1.1", color: "#2563eb" }}
                                >
                                  {disc.created_at ? dayjs(disc.created_at).format("DD") : "--"}
                                </strong>
                                <small
                                  className="d-block font-weight-medium text-muted"
                                  style={{ fontSize: "10px", lineHeight: "1", color: "#64748b" }}
                                >
                                  {disc.created_at ? dayjs(disc.created_at).format("YYYY") : ""}
                                </small>
                              </div>

                              {/* Creator Details */}
                              <div
                                className="d-flex align-items-center overflow-hidden"
                                title={`Created by ${disc.creator_name || 'User #' + disc.created_by}`}
                              >
                                <Avatar
                                  profile={disc.creator_profile}
                                  first_name={disc.creator_first_name || disc.creator_name || "U"}
                                  last_name={disc.creator_last_name || ""}
                                  size={36}
                                  className="mr-2 flex-shrink-0"
                                />
                                <div className="overflow-hidden" style={{ minWidth: 0 }}>
                                  <span
                                    className="d-block font-weight-bold text-dark text-truncate"
                                    style={{ fontSize: "14px", lineHeight: "1.2", color: "#0f172a" }}
                                  >
                                    {Number(disc.created_by) === Number(authService.getUser()?.id) ? 'You' : (disc.creator_name || `User #${disc.created_by}`)}
                                  </span>
                                  <small
                                    className="d-block text-secondary text-truncate"
                                    style={{ fontSize: "12px", color: "#64748b", lineHeight: "1.3" }}
                                  >
                                    {disc.creator_name || `User #${disc.created_by}`}
                                  </small>
                                </div>
                              </div>
                            </div>

                            {/* 2. Content & Snippets */}
                            <div className="flex-fill mr-md-3 overflow-hidden" style={{ minWidth: 0 }}>
                              {/* Title & Participants Header */}
                              <div className="d-flex align-items-center justify-content-between mb-2">
                                <div className="d-flex align-items-center flex-grow-1" style={{ minWidth: 0 }}>
                                  <i
                                    className="fa fa-tag mr-2"
                                    style={{ color: "#4f46e5", fontSize: "14px", flexShrink: 0 }}
                                  ></i>

                                  <span
                                    className="font-weight-bold text-dark"
                                    style={{
                                      flex: 1,
                                      minWidth: 0,
                                      overflow: "hidden",
                                      whiteSpace: "nowrap",
                                      textOverflow: "ellipsis",
                                      fontSize: "15px",
                                      color: "#0f172a",
                                    }}
                                    title={`Title: ${disc.title}`}
                                  >
                                    {disc.title}
                                  </span>
                                </div>

                                <div className="d-flex align-items-center flex-shrink-0">
                                  {displayParticipants.length > 0 && (
                                    <button
                                      className="btn btn-sm btn-light border text-secondary rounded-pill ml-2 d-inline-flex align-items-center shadow-none"
                                      title="View Participant"
                                      style={{
                                        flexShrink: 0,
                                        fontSize: "12px",
                                        fontWeight: "500",
                                        padding: "3px 10px",
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        this.handleParticipantModal(disc);
                                      }}
                                    >
                                      <i className="fa fa-users text-secondary mr-1" style={{ fontSize: "12px" }}></i>
                                      {displayParticipants.length} participant{displayParticipants.length > 1 ? "s" : ""}
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Description Box */}
                              {disc?.description && (
                                <div
                                  className="mb-2 px-3 py-2 rounded-lg d-flex align-items-start"
                                  title="Description"
                                  style={{
                                    backgroundColor: "#eff6ff",
                                    border: "1px solid #dbeafe",
                                    borderRadius: "8px",
                                  }}
                                >
                                  <i
                                    className="fa fa-file-text-o text-primary mr-2"
                                    style={{ fontSize: "14px", marginTop: "3px", flexShrink: 0 }}
                                  ></i>
                                  <div
                                    className="discussion-text-clamp flex-fill"
                                    style={{ fontSize: "13.5px", color: "#334155", lineHeight: "1.5" }}
                                  >
                                    <span>{disc.description}</span>
                                  </div>
                                </div>
                              )}

                              {/* Conclusion Box */}
                              {isConcluded && disc.conclusion ? (
                                <div
                                  className="px-3 py-2 rounded-lg d-flex align-items-start"
                                  title="Conclusion"
                                  style={{
                                    backgroundColor: "#ecfdf5",
                                    border: "1px solid #bbf7d0",
                                    borderRadius: "8px",
                                  }}
                                >
                                  <i
                                    className="fa fa-check-circle text-success mr-2"
                                    style={{ fontSize: "15px", marginTop: "2px", flexShrink: 0 }}
                                  ></i>
                                  <div
                                    className="discussion-text-clamp flex-fill"
                                    style={{ fontSize: "13.5px", color: "#15803d", lineHeight: "1.5" }}
                                  >
                                    <span>{disc.conclusion}</span>
                                  </div>
                                </div>
                              ) : null}
                            </div>

                            {/* 3. Action Buttons Column */}
                            <div
                              className="d-flex align-items-center justify-content-end discussion-actions-col"
                              title="Actions"
                            >
                              <button
                                className="btn btn-sm btn-light border text-secondary rounded-circle mr-1 shadow-none"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  this.handleOpenViewModal(disc);
                                }}
                                title="View Details"
                                style={{ width: "32px", height: "32px", padding: 0 }}
                              >
                                <i className="fa fa-eye"></i>
                              </button>
                              {disc.isDecrypted && this.canModifyDiscussion(disc) && (
                                <button
                                  className="btn btn-sm btn-light border text-secondary rounded-circle mr-1 shadow-none"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    this.handleOpenEditModal(disc);
                                  }}
                                  title="Edit Discussion"
                                  style={{ width: "32px", height: "32px", padding: 0 }}
                                >
                                  <i className="fa fa-pencil" style={{ fontSize: "13px", color: "#64748b" }}></i>
                                </button>
                              )}
                              {disc.isDecrypted && this.canModifyDiscussion(disc) && (
                                <button
                                  className="btn btn-sm btn-light border text-secondary rounded-circle shadow-none"
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

        {/* Participants Modal */}
        <ParticipantsModal
          show={showParticipantsModal}
          onClose={this.handleCloseModals}
          discussion={discussionToView}
          onDiscussionUpdated={() => this.fetchDiscussions(false)}
        />

        {/* Unified Bulk Recovery Modal in Discussions Module */}
        <BulkRecoveryModal
          show={this.state.showBulkModal}
          mode={this.state.bulkModalMode}
          participantOptions={participantOptions}
          currentUserId={currentUserId}
          requesterId={this.state.bulkRequesterId}
          requesterName={this.state.bulkRequesterName}
          requesterPublicKey={this.state.bulkRequesterPublicKey}
          onClose={() => this.setState({ showBulkModal: false })}
          onSuccess={() => {
            cachedDiscussions = null;
            this.fetchDiscussions(false);
          }}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  fixNavbar: state.settings.isFixNavbar,
});

export default connect(mapStateToProps, {})(Discussions);

