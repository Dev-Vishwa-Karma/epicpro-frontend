// BreakReasonModal.js
import React from 'react';

const BreakReasonModal = ({ showModal, breakReason, handleReasonChange, handleSaveBreakIn, closeModal, ButtonLoading, errors = {} }) => {
  return (
    <>
    {showModal && (
      <div className="modal fade show d-block" id="addBreakReasonModal" tabIndex="-1" role="dialog">
        <div className="modal-dialog" role="dialog" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Break Reason</h5>
              <button type="button" className="close" onClick={closeModal} aria-label="Close">
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="dimmer-content">
              <div className="modal-body">
                <div className="row clearfix">
                  <div className="col-md-12">
                    <div className="form-group">
                      <label className="form-label">Break Reason</label>
                      <textarea
                        className={`form-control${errors.breakReason ? ' is-invalid' : ''}`}
                        placeholder="Please provide the reason for your break"
                        value={breakReason}
                        onChange={handleReasonChange}
                        rows="10"
                        cols="50"
                        ref={errors.breakReason ? (el) => el && el.focus() : null}
                      />
                      {errors.breakReason && (
                        <div className="invalid-feedback d-block">{errors.breakReason}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveBreakIn}
                disabled={ButtonLoading}
              >
                {ButtonLoading && (
                  <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                )}
                Save changes
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    {showModal && <div className="modal-backdrop fade show" />}
    </>
  );
};

export default BreakReasonModal;
