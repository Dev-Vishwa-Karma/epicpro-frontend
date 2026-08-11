import React, { Component } from "react";
import Select from "react-select";
// import { performBulkKeyRecovery, sendBulkRecoveryRequest } from "./autoSyncDiscussion";

import cryptoService from "../../../services/cryptoService";
import { getService } from "../../../services/getService";
import authService from "../../Authentication/authService";

export async function performBulkKeyRecovery(requesterId, requesterPublicKey, requesterName, onProgress) {
  const currentUser = authService.getUser();
  if (!currentUser?.id) throw new Error("Not authenticated");

  const res = await getService.getCall("discussions.php", {
    action: "view",
    participant_id: requesterId,
    limit: 9999,
    page: 1,
  });

  if (res?.status !== "success") {
    throw new Error(res?.message || "Unable to load shared discussions. Please try again.");
  }

  if ((!requesterPublicKey || typeof requesterPublicKey !== "string" || !requesterPublicKey.trim()) && res.data?.requester_public_key) {
    requesterPublicKey = res.data.requester_public_key;
  }

  if (!requesterPublicKey || typeof requesterPublicKey !== "string" || !requesterPublicKey.trim()) {
    throw new Error("This participant does not have a valid encryption key yet, so their access cannot be restored.");
  }

  const discussions =
    res.data?.discussions ?? (Array.isArray(res.data) ? res.data : []);

  const total = discussions.length;
  if (total === 0) {
    throw new Error("No shared discussions were found with this participant.");
  }

  let done = 0;
  const recoveries = [];
  const failedIds = [];

  for (const disc of discussions) {
    try {
      if (!disc.participant_details || !Array.isArray(disc.participant_details)) {
        failedIds.push(disc.id);
        continue;
      }

      const reencryptedKey = await cryptoService.reencryptDiscussionKeyForTargetUser(
        disc,
        currentUser.id,
        requesterPublicKey
      );

      recoveries.push({
        discussion_id: disc.id,
        encrypted_key: reencryptedKey,
      });
    } catch (err) {
      console.warn(
        `[BulkSync] Could not re-encrypt discussion ${disc.id}:`,
        err.message
      );
      failedIds.push(disc.id);
    }

    done++;
    if (typeof onProgress === "function") onProgress(done, total);
  }

  if (recoveries.length === 0) {
    throw new Error(
      "We couldn't restore access to any discussions. Please make sure your encryption key is available on this device and try again."
    );
  }

  const submitRes = await getService.addCall("discussions.php", "bulk_recover_keys", {
    requester_id: requesterId,
    recoveries,
  });

  if (submitRes?.status !== "success") {
    throw new Error(submitRes?.message || "Unable to complete the access restoration. Please try again.");
  }

  return {
    recovered: recoveries.length,
    failed: failedIds.length,
    failedIds,
  };
}

export async function sendBulkRecoveryRequest(helperUserId) {
  const res = await getService.addCall("discussions.php", "request_bulk_recovery", {
    target_user_id: helperUserId,
  });

  if (res?.status !== "success") {
    throw new Error(res?.message || "Unable to send the recovery request. Please try again.");
  }

  return res.data;
}



class BulkRecoveryModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedHelper: null,
      loading: false,
      progress: 0,
      total: 0,
      done: false,
      result: null,
      error: null,
      requestSent: false,
    };
  }

  componentDidUpdate(prevProps) {
    // Reset internal state when modal opens or mode changes
    if (this.props.show && (!prevProps.show || prevProps.mode !== this.props.mode)) {
      this.setState({
        selectedHelper: null,
        loading: false,
        progress: 0,
        total: 0,
        done: false,
        result: null,
        error: null,
        requestSent: false,
      });
    }
  }



  handleSendRequest = async () => {
    const { selectedHelper } = this.state;
    const { onSuccess } = this.props;

    if (!selectedHelper || !selectedHelper.value) {
      this.setState({ error: "Please select a participant before sending the recovery request." });
      return;
    }

    this.setState({ loading: true, error: null });

    try {
      const result = await sendBulkRecoveryRequest(selectedHelper.value);
      this.setState({
        loading: false,
        requestSent: true,
        result: result,
      });
      if (typeof onSuccess === "function") {
        onSuccess(result);
      }
    } catch (err) {
      this.setState({
        loading: false,
        error: err.message || "Failed to send recovery request",
      });
    }
  };

  handleApprove = async () => {
    const { requesterId, requesterPublicKey, requesterName, onSuccess } = this.props;
    if (!requesterId) return;

    this.setState({
      loading: true,
      progress: 0,
      total: 0,
      done: false,
      result: null,
      error: null,
    });

    try {
      const result = await performBulkKeyRecovery(
        requesterId,
        requesterPublicKey,
        requesterName,
        (doneCount, totalCount) => {
          this.setState({ progress: doneCount, total: totalCount });
        }
      );

      this.setState({
        loading: false,
        done: true,
        result: result,
      });

      // Dispatch global event so discussions refresh decryption status automatically
      window.dispatchEvent(new CustomEvent("e2eeKeysUpdated"));

      if (typeof onSuccess === "function") {
        onSuccess(result);
      }
    } catch (err) {
      this.setState({
        loading: false,
        error: err.message || "We couldn't restore access to the discussions. Please try again.",
      });
    }
  };

  handleClose = () => {
    if (this.state.loading) return;
    this.setState({
      selectedHelper: null,
      loading: false,
      progress: 0,
      total: 0,
      done: false,
      result: null,
      error: null,
      requestSent: false,
    });
    if (typeof this.props.onClose === "function") {
      this.props.onClose();
    }
  };

  render() {
    const { show, mode, requesterName, participantOptions, currentUserId } = this.props;
    const { selectedHelper, loading, progress, total, done, result, error, requestSent } = this.state;

    if (!show) return null;

    const isRequestMode = mode === "request";
    const displayName = requesterName || "A participant";

    // Options for participant select (excluding current user)
    const options = participantOptions.filter(emp => Number(emp.id) !== Number(currentUserId)).map(emp => {
            const hasKey = emp.public_key && emp.public_key.trim();
            const fullName = `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || emp.email || `User #${emp.id}`;
            return {
                value: emp.id,
                label: hasKey ? fullName : `${fullName} (No E2EE Key)`,
                isDisabled: !hasKey
            };
        });

    return (
      <>
        <div
          className="modal fade show"
          style={{ display: "block", zIndex: 1060 }}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-dialog modal-dialog-top" role="document">
            <div
              className="modal-content"
              style={{ borderRadius: "5px", overflow: "hidden", border: "none" }}
            >
              {/* Modal Header */}
              <div
                className="modal-header"
                style={{
                  background: "#5a5278",
                  color: "#fff",
                }}
              >
                <h5 className="modal-title d-flex align-items-center mb-0">
                  {isRequestMode ? "Request Key Recovery" : "Access Recovery Request"}
                </h5>
                <button
                  type="button"
                  className="close"
                  style={{ color: "#fff", opacity: 1 }}
                  disabled={loading}
                  onClick={this.handleClose}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>

              {/* Modal Body */}
              <div className="modal-body p-4">
                {error && (
                  <div className="alert alert-danger mb-3 py-2 px-3 style-alert" style={{ fontSize: "13px" }}>
                    <i className="fa fa-exclamation-circle mr-2" />
                    {error}
                  </div>
                )}

                {/* REQUEST RECOVERY */}
                {isRequestMode && (
                  <>
                    {!requestSent ? (
                      <>
                        <div
                          className="alert mb-3 d-flex align-items-start"
                          style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "8px" }}
                        >
                          <i className="fa fa-info-circle text-primary mr-2 mt-1" style={{ flexShrink: 0, fontSize: "16px" }} />
                          <div style={{ fontSize: "13px", color: "#1e40af", lineHeight: "1.5" }}>
                            Some discussions are currently unavailable because your encryption key has changed. Select a participant who still has access to request that they restore your access.
                          </div>
                        </div>

                        <label className="form-label" style={{ fontWeight: "600", fontSize: "13px" }}>
                          Choose a participant...
                        </label>
                        <Select
                          options={options}
                          value={selectedHelper}
                          onChange={(opt) => this.setState({ selectedHelper: opt, error: null })}
                          placeholder="Choose a participant..."
                          className="basic-single-select mb-3"
                          classNamePrefix="select"
                          isDisabled={loading}
                          maxMenuHeight={188}
                          menuPortalTarget={document.body}
                          styles={{
                            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                          }}
                        />

                        {loading && (
                          <div className="text-center py-2">
                            <div className="spinner-border spinner-border-sm text-primary mr-2" role="status" />
                            <small className="text-muted">Sending recovery request...</small>
                          </div>
                        )}
                      </>
                    ) : (
                      /* Request Sent Success Screen */
                      <div className="text-center py-3">
                        <div
                          style={{
                            width: "64px",
                            height: "64px",
                            borderRadius: "50%",
                            background: "#dcfce7",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 16px",
                          }}
                        >
                          <i className="fa fa-paper-plane" style={{ fontSize: "24px", color: "#16a34a" }} />
                        </div>
                        <p className="font-weight-bold mb-1" style={{ fontSize: "16px", color: "#15803d" }}>
                          Recovery Request Sent
                        </p>
                        <p className="text-muted small mb-0">
                          {selectedHelper?.label || "The participant"} will be notified that you need access to your shared discussions. They can review and approve your request.
                          {result?.discussion_count ? ` (${result.discussion_count} shared discussions)` : ""}
                        </p>
                      </div>
                    )}
                  </>
                )}

                {/* APPROVE RECOVERY */}
                {!isRequestMode && (
                  <>
                    {!done ? (
                      <>
                        <div className="d-flex align-items-start mb-3">
                          <div
                            style={{
                              width: "42px",
                              height: "42px",
                              borderRadius: "50%",
                              background: "#f5f3ff",
                              border: "2px solid #ddd6fe",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              marginRight: "14px",
                            }}
                          >
                            <i className="fa fa-user" style={{ color: "#7c3aed", fontSize: "18px" }} />
                          </div>
                          <div>
                            <p className="mb-1" style={{ fontWeight: "600", fontSize: "14.5px", color: "#1e1b4b" }}>
                              {displayName} is requesting access to shared discussions
                            </p>
                            <p className="mb-0 text-muted" style={{ fontSize: "13px", lineHeight: "1.5" }}>
                              {displayName} has requested access to your shared discussions. If you approve, the encryption keys for your shared discussions will be securely shared with them. No other discussion data or permissions will be changed.
                            </p>
                          </div>
                        </div>

                        {!loading && (
                          <div
                            className="d-flex align-items-center mb-3 px-3 py-2"
                            style={{
                              background: "#f0fdf4",
                              border: "1px solid #bbf7d0",
                              borderRadius: "8px",
                              fontSize: "13px",
                              color: "#15803d",
                            }}
                          >
                            <i className="fa fa-shield mr-2" style={{ fontSize: "15px" }} />
                            <span>Your approval is required. Only you can authorize access to these discussion keys.</span>
                          </div>
                        )}

                        {loading && (
                          <div className="mb-2">
                            <div
                              className="d-flex justify-content-between mb-1"
                              style={{ fontSize: "12px", color: "#6b7280", fontWeight: "600" }}
                            >
                              <span>Restoring discussion access...</span>
                              <span>{progress} / {total || "?"}</span>
                            </div>
                            <div className="progress mb-2" style={{ height: "10px", borderRadius: "6px" }}>
                              <div
                                className="progress-bar"
                                role="progressbar"
                                style={{
                                  width: total ? `${Math.round((progress / total) * 100)}%` : "5%",
                                  background: "linear-gradient(90deg, #7c3aed, #a78bfa)",
                                  transition: "width 0.3s ease",
                                  borderRadius: "6px",
                                }}
                              />
                            </div>
                            <div className="text-center mt-2">
                              <div className="spinner-border spinner-border-sm text-primary mr-2" role="status" />
                              <small className="text-muted">
                                Restoring access. Please keep this window open until the process is complete.
                              </small>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      /* Approval Success State */
                      <div className="text-center py-3">
                        <div
                          style={{
                            width: "64px",
                            height: "64px",
                            borderRadius: "50%",
                            background: "#dcfce7",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 16px",
                          }}
                        >
                          <i className="fa fa-check" style={{ fontSize: "28px", color: "#16a34a" }} />
                        </div>
                        <p className="font-weight-bold mb-1" style={{ fontSize: "16px", color: "#15803d" }}>
                          Access restored!
                        </p>
                        <p className="text-muted small mb-0">
                          {displayName} can now access <strong>{result?.recovered ?? 0}</strong> shared discussion(s) again.
                          {result?.failed > 0 && (
                            <span className="d-block mt-1 text-warning">
                              {result.failed} discussion(s) could not be restored because you may no longer have access to them.
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Modal Footer */}
              <div className="modal-footer" style={{ background: "#fafafa" }}>
                {isRequestMode ? (
                  <>
                    {!requestSent && (
                      <button
                        className="btn btn-sm btn-primary"
                        disabled={loading || !selectedHelper}
                        onClick={this.handleSendRequest}
                        style={{ borderRadius: "6px", padding: "7px 18px", fontWeight: "600" }}
                      >
                        <i className="fa fa-paper-plane mr-1" /> Send Request
                      </button>
                    )}
                    <button
                      className="btn btn-secondary btn-sm"
                      disabled={loading}
                      onClick={this.handleClose}
                    >
                      {requestSent ? "Close" : "Cancel"}
                    </button>
                  </>
                ) : (
                  <>
                    {!done && !loading && (
                      <button
                        className="btn btn-sm"
                        style={{
                          background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                          color: "#fff",
                          border: "none",
                          fontWeight: "600",
                          borderRadius: "6px",
                          padding: "7px 18px",
                        }}
                        onClick={this.handleApprove}
                      >
                        <i className="fa fa-check mr-1" /> Approve
                      </button>
                    )}
                    <button
                      className="btn btn-secondary btn-sm"
                      disabled={loading}
                      onClick={this.handleClose}
                    >
                      {done ? "Close" : "Decline"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="modal-backdrop fade show" style={{ zIndex: 1050 }} />
      </>
    );
  }
}

export default BulkRecoveryModal;
