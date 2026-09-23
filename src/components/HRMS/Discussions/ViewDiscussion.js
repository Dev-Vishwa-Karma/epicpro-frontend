import React, { Component } from 'react';
import { connect } from 'react-redux';
import dayjs from 'dayjs';
import Button from '../../common/formInputs/Button';
import Avatar from '../../common/Avatar';
import authService from '../../Authentication/authService';
import cryptoService from '../../../services/cryptoService';
import CommentModule from '../Comment/CommentModule';
import AddEditDiscussionModal from './AddEditDiscussionModal';
import AlertMessages from '../../common/AlertMessages';
import { getService } from '../../../services/getService';
import api from '../../../api/axios';

class ViewDiscussion extends Component {
  constructor(props) {
    super(props);
    this.state = {
      discussion: null,
      discussionId: null,
      employees: [],
      loading: true,
      showAddEditModal: false,
      buttonLoading: false,
      showSuccess: false,
      successMessage: '',
      showError: false,
      errorMessage: '',
    };
  }

  componentDidMount() {
    const { location, match } = this.props;
    const urlId = match?.params?.id;
    const stateDiscussion = location?.state?.discussion;
    const stateId = location?.state?.discussionId;

    const discussionId = urlId || stateId || (stateDiscussion ? stateDiscussion.id : null);

    this.fetchEmployees();

    if (discussionId) {
      this.setState({
        discussionId: discussionId,
        loading: true,
      });

      this.fetchDiscussionDetails(discussionId);
    } else {
      if (this.props.history) {
        this.props.history.push('/discussions');
      }
    }
  }

  fetchEmployees = () => {
    getService
      .getCall('get_employees.php', { action: 'view', role: 'all' })
      .then((res) => {
        const empList = res?.data || (Array.isArray(res) ? res : []);
        this.setState({ employees: empList });
      })
      .catch((err) => {
        console.error('Error fetching employees:', err);
      });
  };

  fetchDiscussionDetails = async (id) => {
    try {
      const res = await api.get(`/discussions.php?action=view&id=${id}`);
      let discData = null;
      if (res.data && res.data.status === 'success' && res.data.data) {
        if (Array.isArray(res.data.data)) {
          discData = res.data.data.find((d) => Number(d.id) === Number(id)) || res.data.data[0];
        } else {
          discData = res.data.data;
        }
      }

      const user = authService.getUser();
      if (user && user.id && discData) {
        try {
          discData = await cryptoService.decryptDiscussionDetails(discData, user.id);
        } catch (decryptErr) {
          console.error('Error decrypting discussion details:', decryptErr);
        }
      }

      if (discData) {
        this.setState({
          discussion: discData,
          loading: false,
        });
      } else {
        this.setState({ loading: false });
      }
    } catch (err) {
      console.error('Error fetching discussion details:', err);
      this.setState({ loading: false });
    }
  };

  canModifyDiscussion = () => {
    const user = authService.getUser() || window.user || {};
    const { discussion } = this.state;
    if (!user || (!user.id && !user.employee_id) || !discussion) return false;
    const uId = String(user.id || user.employee_id || '');
    const role = user.role || '';
    const isAdmin = ['admin', 'super_admin'].includes(role);
    return String(discussion.created_by) === uId || isAdmin;
  };

  handleOpenEditModal = () => {
    this.setState({ showAddEditModal: true });
  };

  handleCloseAddEditModal = () => {
    this.setState({ showAddEditModal: false });
  };

  handleSaveDiscussion = (payload) => {
    this.setState({ buttonLoading: true });
    const { discussion } = this.state;
    const targetId = payload.id || (discussion ? discussion.id : null);

    const dataToSend = {
      ...payload,
      id: targetId,
    };

    getService
      .addCall('discussions.php', 'edit', dataToSend)
      .then((res) => {
        this.setState({ buttonLoading: false });
        if (res?.status === 'success') {
          this.setState({
            showSuccess: true,
            successMessage: res.message || 'Discussion updated successfully',
            showAddEditModal: false,
          });
          if (targetId) {
            this.fetchDiscussionDetails(targetId);
          }
        } else {
          this.setState({
            showError: true,
            errorMessage: res?.message || 'Failed to update discussion',
          });
        }
      })
      .catch((err) => {
        this.setState({
          buttonLoading: false,
          showError: true,
          errorMessage: err?.response?.data?.message || 'Failed to update discussion',
        });
      });
  };

  handleBack = () => {
    if (this.props.history) {
      this.props.history.push('/discussions');
    }
  };

  render() {
    const { fixNavbar } = this.props;
    const {
      discussion,
      discussionId,
      employees,
      loading,
      showAddEditModal,
      buttonLoading,
      showSuccess,
      successMessage,
      showError,
      errorMessage,
    } = this.state;

    if (loading || !discussion) {
      return (
        <div className={`section-body ${fixNavbar ? 'marginTop' : ''} mt-3`}>
          <div className="container-fluid text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Loading discussion...</span>
            </div>
          </div>
        </div>
      );
    }

    const participants = Array.isArray(discussion.participant_details)
      ? discussion.participant_details
      : [];
    const isConcluded = discussion.conclusion && discussion.conclusion.trim();
    const isCreator = this.canModifyDiscussion();

    return (
      <div className={`section-body ${fixNavbar ? 'marginTop' : ''} mt-3`}>
        <AlertMessages
          showSuccess={showSuccess}
          successMessage={successMessage}
          showError={showError}
          errorMessage={errorMessage}
          setShowSuccess={(val) => this.setState({ showSuccess: val })}
          setShowError={(val) => this.setState({ showError: val })}
        />

        <div className="container-fluid">
          <div className="row clearfix">
            {/* Left Column: Discussion Details */}
            <div className="col-lg-7 col-md-12 mb-3">
              <div className="card shadow-sm rounded-lg" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                <div className="card-header border-bottom py-3 bg-white d-flex align-items-center justify-content-between">
                  <h6
                    className="card-title font-weight-bold mb-1 mt-1 text-dark d-flex align-items-center"
                    style={{
                      fontSize: '16px',
                      minWidth: 0,
                      flex: 1,
                    }}
                    title={`Title: ${discussion.title || ''}`}
                  >
                    <i className="fa fa-comments text-primary mr-2 flex-shrink-0" />
                    <span style={{ minWidth: 0, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                      Discussion: #{discussion.id || ''} - {discussion.title || ''}
                    </span>
                  </h6>

                  {isCreator && (
                    <button
                      className="btn btn-sm btn-outline-info ml-2 flex-shrink-0 font-weight-bold"
                      onClick={this.handleOpenEditModal}
                      title="Edit Discussion"
                    >
                      <i className="fa fa-pencil mr-1" /> Edit
                    </button>
                  )}
                </div>

                <div className="card-body p-3 p-sm-4" style={{ overflowY: 'auto', height: '69vh' }}>
                  {/* Created By Section */}
                  <div className="row mb-4">
                    <div className="col-12 d-flex flex-column">
                      <label className="font-weight-bold text-secondary text-uppercase mb-2" style={{ fontSize: '12px', letterSpacing: '0.5px' }}>
                        <i className="fa fa-user text-info mr-2" /> Created By
                      </label>
                      <div
                        className="p-3 rounded text-dark flex-grow-1 d-flex align-items-center"
                        style={{
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          fontSize: '14px',
                        }}
                      >
                        <Avatar
                          profile={discussion.creator_profile}
                          first_name={discussion.creator_first_name || discussion.creator_name || 'U'}
                          last_name={discussion.creator_last_name || ''}
                          size={36}
                          className="mr-3 flex-shrink-0"
                        />
                        <div className="overflow-hidden">
                          <strong className="text-dark d-block text-truncate" style={{ fontSize: '14px', lineHeight: '1.2' }}>
                            {Number(discussion.created_by) === Number(authService.getUser()?.id)
                              ? 'You'
                              : (discussion.creator_first_name && discussion.creator_last_name)
                                ? `${discussion.creator_first_name} ${discussion.creator_last_name}`
                                : (discussion.creator_name || `User #${discussion.created_by}`)}
                          </strong>
                          <small className="text-muted d-block text-truncate" style={{ fontSize: '12px', marginTop: '2px' }}>
                            {discussion.creator_designation || discussion.creator_role || discussion.creator_department || (discussion.creator_name ? discussion.creator_name : 'Team Member')}
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Participants Section */}
                  <div className="mb-4">
                    <label className="font-weight-bold text-secondary text-uppercase mb-2" style={{ fontSize: '12px', letterSpacing: '0.5px' }}>
                      <i className="fa fa-users text-info mr-2" /> Participants ({participants.length})
                    </label>
                    <div className="d-flex flex-wrap align-items-center">
                      {participants.length > 0 ? (
                        participants.map((p, idx) => (
                          <span
                            key={p?.id || idx}
                            className="badge badge-pill badge-light border border-info text-dark px-3 py-1 mr-2 mb-2 d-inline-flex align-items-center"
                            style={{ fontSize: '13px', backgroundColor: '#f0f9ff', maxWidth: '100%' }}
                            title={p?.name || `${p?.first_name || ''} ${p?.last_name || ''}`.trim()}
                          >
                            <Avatar
                              profile={p?.profile}
                              first_name={p?.first_name || p?.name || 'P'}
                              last_name={p?.last_name || ''}
                              size={28}
                              className="mr-2 flex-shrink-0"
                            />
                            <span className="text-truncate" style={{ maxWidth: '160px' }}>
                              {Number(p?.user_id) === Number(authService.getUser()?.id) ? 'You' : p?.name || `${p?.first_name || ''} ${p?.last_name || ''}`.trim() || `User #${p}`}
                            </span>
                          </span>
                        ))
                      ) : (
                        <span className="text-muted italic">No participants assigned</span>
                      )}
                    </div>
                  </div>

                  {/* Description Section */}
                  <div className="mb-4">
                    <label className="font-weight-bold text-secondary text-uppercase mb-2" style={{ fontSize: '12px', letterSpacing: '0.5px' }}>
                      <i className="fa fa-align-left text-primary mr-2" /> Description
                    </label>
                    <div
                      className="p-3 rounded text-dark"
                      style={{
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        lineHeight: '1.6',
                        fontSize: '14px',
                        minHeight: '80px',
                        maxHeight: '320px',
                        overflowY: 'auto',
                      }}
                    >
                      {discussion.description || 'No description provided.'}
                    </div>
                  </div>

                  {/* Conclusion Section */}
                  <div className="mb-3">
                    <label className="font-weight-bold text-secondary text-uppercase mb-2" style={{ fontSize: '12px', letterSpacing: '0.5px' }}>
                      <i className="fa fa-check-circle text-success mr-2" /> Conclusion
                    </label>
                    <div
                      className="p-3 rounded text-dark"
                      style={{
                        backgroundColor: isConcluded ? '#f0fdf4' : '#ffffff',
                        border: isConcluded ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        lineHeight: '1.6',
                        fontSize: '14px',
                        minHeight: '60px',
                        maxHeight: '320px',
                        overflowY: 'auto',
                      }}
                    >
                      {isConcluded ? (
                        <span style={{ color: '#15803d' }}>{discussion.conclusion}</span>
                      ) : (
                        <span className="text-muted italic">No conclusion recorded yet.</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer for Discussion Section */}
                <div className="card-footer border-top py-3 bg-white d-flex align-items-center justify-content-between rounded-bottom">
                  <div className="d-flex align-items-center">
                    <small className="text-muted mr-2" style={{ fontSize: '12px' }}>
                      <i className="fa fa-calendar text-info mr-1" /> Created At:
                    </small>
                    <strong className="text-dark" style={{ fontSize: '13px' }}>
                      {discussion.created_at
                        ? dayjs(discussion.created_at).format('MMM DD, YYYY hh:mm A')
                        : 'N/A'}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Comment Module */}
            <div className="col-lg-5 col-md-12 mb-3">
              {(discussionId || discussion.id) && (
                <CommentModule
                  title="Discussion Comments"
                  moduleType="discussion"
                  moduleId={discussionId || discussion.id}
                  height="80vh"
                />
              )}
            </div>
          </div>

          {/* Sticky Back Button Container (Matching ViewTicket.js layout) */}
          <div
            className="d-flex justify-content-end mt-3 mb-3"
            style={{ position: 'sticky', bottom: '20px', zIndex: 1020 }}
          >
            <Button
              label="Back"
              onClick={this.handleBack}
              className="btn-secondary px-4"
            />
          </div>
        </div>

        {/* Edit Discussion Modal */}
        {showAddEditModal && (
          <AddEditDiscussionModal
            show={showAddEditModal}
            onClose={this.handleCloseAddEditModal}
            discussion={discussion}
            isEditing={true}
            isLoading={buttonLoading}
            employees={employees}
            onSubmit={this.handleSaveDiscussion}
          />
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  fixNavbar: state.settings.isFixNavbar,
});

export default connect(mapStateToProps, {})(ViewDiscussion);
