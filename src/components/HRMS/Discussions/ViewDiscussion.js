import React from 'react';
import dayjs from 'dayjs';
import Button from '../../common/formInputs/Button';
import Avatar from '../../common/Avatar';
import authService from '../../Authentication/authService';

const ViewDiscussion = ({ show = false, onClose = () => { }, discussion = null }) => {
  if (!show || !discussion) return null;
  const participants = Array.isArray(discussion.participant_details)
    ? discussion.participant_details
    : [];
  const isConcluded = discussion.conclusion && discussion.conclusion.trim();

  return (
    <div
      className="modal fade show d-block full-modal-mobile"
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
    >
      <div className="modal-dialog modal-dialog-scrollable modal-xl" role="document">
        <div className="modal-content section-body" style={{ maxHeight: '90vh', backgroundColor: '#ffffff' }}>
          <div className="modal-header border-bottom py-3">
            <h5 className="modal-title font-weight-bold d-flex align-items-center" title='Discussion' style={{ fontSize: '18px', color: '#6e7687' }}>
              <i className="fa fa-comments mr-2"></i>
              Discussion #{discussion.id || ''}
            </h5>
            <button type="button" className="close" onClick={onClose}>
              <span aria-hidden="true">&times;</span>
            </button>
          </div>

          <div className="modal-body px-2 px-sm-4">
            <div className="row clearfix">
              <div className="col-lg-12 col-md-12 mb-3">
                <div className="card shadow-sm border-0 rounded-lg mb-0 h-100">
                  <div className="card-body p-3 p-sm-4">
                    {/* Title & Created By Section */}
                    <div className="row mb-4">
                      {/* Title Column */}
                      <div className="col-lg-8 col-md-7 col-12 mb-3 mb-md-0 d-flex flex-column">
                        <label className="font-weight-bold text-secondary text-uppercase mb-2" style={{ fontSize: '12px', letterSpacing: '0.5px' }}>
                          <i className="fa fa-tag text-primary mr-2"></i> Title
                        </label>
                        <div
                          className="p-3 rounded text-dark font-weight-bold flex-grow-1 d-flex align-items-center"
                          style={{
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            fontSize: '14px',
                            lineHeight: '1.5',
                            wordBreak: 'break-word',
                          }}
                        >
                          {discussion.title || 'No title provided.'}
                        </div>
                      </div>

                      {/* Created By Column */}
                      <div className="col-lg-4 col-md-5 col-12 d-flex flex-column">
                        <label className="font-weight-bold text-secondary text-uppercase mb-2" style={{ fontSize: '12px', letterSpacing: '0.5px' }}>
                          <i className="fa fa-user text-info mr-2"></i> Created By
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
                        <i className="fa fa-users text-info mr-2"></i> Participants ({participants.length})
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
                        <i className="fa fa-align-left text-primary mr-2"></i> Description
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
                    <div className="mb-2">
                      <label className="font-weight-bold text-secondary text-uppercase mb-2" style={{ fontSize: '12px', letterSpacing: '0.5px' }}>
                        <i className="fa fa-check-circle text-success mr-2"></i> Conclusion
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
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer border-top bg-white py-2 px-3 px-sm-4 d-flex flex-wrap align-items-center justify-content-between">
            <div className="d-flex align-items-center my-1">
              <small className="text-muted mr-2" style={{ fontSize: '12px' }}>
                <i className="fa fa-calendar text-info mr-1"></i> Created At:
              </small>
              <strong className="text-dark" style={{ fontSize: '13px' }}>
                {discussion.created_at
                  ? dayjs(discussion.created_at).format('MMM DD, YYYY hh:mm A')
                  : 'N/A'}
              </strong>
            </div>
            <Button label="Close" onClick={onClose} className="btn-secondary px-4 my-1" />
          </div>
        </div>
      </div>
    </div >
  );
};

export default ViewDiscussion;
