import React from 'react';
import dayjs from 'dayjs';
import Button from '../../common/formInputs/Button';
import Avatar from '../../common/Avatar';

const ViewDiscussion = ({ show = false, onClose = () => {}, discussion = null }) => {
  if (!show || !discussion) return null;

  const participants = Array.isArray(discussion.participant_details) ? discussion.participant_details : [];
  const isConcluded = discussion.conclusion && discussion.conclusion.trim();

  return (
    <div
      className="modal fade show d-block full-modal-mobile"
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
    >
      <div className="modal-dialog modal-dialog-scrollable modal-xxl" role="document">
        <div className="modal-content section-body" style={{ maxHeight: '90vh' }}>
          <div className="modal-header border-bottom py-3">
            <h5 className="modal-title font-weight-bold d-flex align-items-center" style={{ fontSize: '18px', color: '#6e7687' }}>
              <i className="fa fa-comments text-primary mr-2"></i>
              Discussion - #{discussion.id || ''} {discussion.title ? `: ${discussion.title}` : ''}
            </h5>
            <button type="button" className="close" onClick={onClose}>
              <span aria-hidden="true">&times;</span>
            </button>
          </div>

          <div className="modal-body p-4">
            <div className="row clearfix">
              <div className="col-lg-12 col-md-12 mb-3">
                <div className="card shadow-sm border-0 rounded-lg mb-0 h-100">
                  <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-start flex-wrap">
                    <div className="d-flex align-items-center mr-2 mb-2">
                      <div
                        className="rounded-circle bg-primary-light text-primary d-flex align-items-center justify-content-center mr-3 flex-shrink-0"
                        style={{ width: '40px', height: '40px', backgroundColor: '#e0f2fe', color: '#0284c7' }}
                      >
                        <i className="fa fa-tag fa-lg"></i>
                      </div>
                      <div>
                        <h5 className="mb-1 font-weight-bold text-dark">{discussion.title}</h5>
                        <div className="d-flex align-items-center mt-1">
                          <Avatar
                            profile={discussion.creator_profile}
                            first_name={discussion.creator_first_name || discussion.creator_name || 'U'}
                            last_name={discussion.creator_last_name || ''}
                            size={32}
                            className="mx-1 flex-shrink-0"
                          />
                          <strong className="text-dark ml-1" title="Created By" style={{ fontSize: '14px' }}>
                            {discussion.creator_name || `User #${discussion.created_by}`}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card-body p-4">
                    {/* Date Info */}
                    <div className="mb-3 p-2 rounded bg-light border">
                      <small className="text-muted d-block mb-1">
                        <i className="fa fa-calendar text-info mr-1"></i> Created On
                      </small>
                      <strong className="text-dark" style={{ fontSize: '13px' }}>
                        {discussion.created_at ? dayjs(discussion.created_at).format('MMM DD, YYYY hh:mm A') : 'N/A'}
                      </strong>
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
                              style={{ fontSize: '13px', backgroundColor: '#f0f9ff' }}
                            >
                              <Avatar
                                profile={p?.profile}
                                first_name={p?.first_name || p?.name || 'P'}
                                last_name={p?.last_name || ''}
                                size={28}
                                className="mr-2"
                              />
                              {p?.name || `${p?.first_name || ''} ${p?.last_name || ''}`.trim() || `User #${p}`}
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
                          lineHeight: '1.6',
                          fontSize: '14px',
                          minHeight: '80px',
                          maxHeight: '220px',
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
                          backgroundColor: isConcluded ? '#f0fdf4' : '#f8fafc',
                          border: isConcluded ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                          whiteSpace: 'pre-wrap',
                          lineHeight: '1.6',
                          fontSize: '14px',
                          minHeight: '60px',
                          maxHeight: '160px',
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

          <div className="modal-footer border-top bg-light py-2">
            <Button label="Close" onClick={onClose} className="btn-secondary px-4" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewDiscussion;
