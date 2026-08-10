import React, { useState, useEffect } from "react";
import Avatar from "../../common/Avatar";
import Button from "../../common/formInputs/Button";
import authService from "../../Authentication/authService";
import cryptoService from "../../../services/cryptoService";
import { getService } from "../../../services/getService";
import AlertMessages from "../../common/AlertMessages";

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

const ParticipantsModal = ({
  show = false,
  onClose = () => { },
  discussion = null,
  onDiscussionUpdated = null,
}) => {
  const [loadingUserId, setLoadingUserId] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [localParticipants, setLocalParticipants] = useState([]);

  useEffect(() => {
    if (discussion?.participant_details && Array.isArray(discussion.participant_details)) {
      setLocalParticipants(discussion.participant_details);
    } else {
      setLocalParticipants([]);
    }
  }, [discussion]);

  useEffect(() => {
    setShowSuccess(false);
    setSuccessMessage("");
    setShowError(false);
    setErrorMessage("");
  }, [show, discussion]);

  const handleClose = () => {
    setShowSuccess(false);
    setSuccessMessage("");
    setShowError(false);
    setErrorMessage("");
    onClose();
  };

  if (!show) return null;

  const currentUserId = authService.getUser()?.id;
  const currentUserParticipant = localParticipants.find(
    (item) => Number(item.user_id) === Number(currentUserId)
  );
  const myTagsArr = parseTags(currentUserParticipant?.tags);

  const getActionType = (p) => {
    const targetUserId = String(p.user_id);
    const pTagsArr = parseTags(p?.tags);

    if (!discussion?.isDecrypted) {
      return pTagsArr.includes(String(currentUserId)) ? "request again" : "request";
    }
    if (myTagsArr.includes(targetUserId)) {
      return "approve";
    }
    return null;
  };

  const handleRequestKey = async (p) => {
    const targetUserId = p.user_id;
    try {
      setLoadingUserId(targetUserId);
      const payload = {
        discussion_id: discussion.id,
        target_user_id: targetUserId,
      };

      const res = await getService.addCall("discussions.php", "request_key_recovery", payload);
      if (res?.status === "success") {
        setShowSuccess(true);
        setSuccessMessage(res?.message || "Key recovery request sent successfully.");

        // Immediately update local participant tags so button label updates to "request again"
        setLocalParticipants((prev) =>
          prev.map((item) => {
            if (Number(item.user_id) === Number(targetUserId)) {
              const currentTags = parseTags(item.tags);
              if (!currentTags.includes(String(currentUserId))) {
                currentTags.push(String(currentUserId));
              }
              return { ...item, tags: currentTags };
            }
            return item;
          })
        );

        if (onDiscussionUpdated) {
          onDiscussionUpdated();
        }
      } else {
        setShowError(true);
        setErrorMessage(res?.message || "Failed to send key recovery request.");
      }
    } catch (err) {
      console.error("Request key recovery error:", err);
      setShowError(true);
      setErrorMessage(err.response?.data?.message || err.message || "Failed to send request.");
    } finally {
      setLoadingUserId(null);
    }
  };

  const handleRecoverKey = async (p) => {
    const targetUserId = p.user_id;
    try {
      setLoadingUserId(targetUserId);

      let targetPublicKey = p.public_key;
      if (!targetPublicKey) {
        setShowError(true);
        setErrorMessage("Target participant does not have a public key configured.");
        return;
      }

      const reencryptedKeyBase64 = await cryptoService.reencryptDiscussionKeyForTargetUser(
        discussion,
        currentUserId,
        targetPublicKey
      );

      const payload = {
        discussion_id: discussion.id,
        target_user_id: targetUserId,
        encrypted_key: reencryptedKeyBase64,
      };

      const res = await getService.addCall("discussions.php", "recover_participant_key", payload);
      if (res?.status === "success") {
        setShowSuccess(true);
        setSuccessMessage(res?.message || "Key recovered successfully.");

        setLocalParticipants((prev) =>
          prev.map((item) => {
            if (Number(item.user_id) === Number(currentUserId)) {
              const currentTags = parseTags(item.tags).filter(
                (t) => String(t) !== String(targetUserId)
              );
              return { ...item, tags: currentTags };
            }
            return item;
          })
        );

        if (onDiscussionUpdated) {
          onDiscussionUpdated();
        }
      } else {
        setShowError(true);
        setErrorMessage(res?.message || "Failed to recover key for participant.");
      }
    } catch (err) {
      console.error("Recover key error:", err);
      setShowError(true);
      setErrorMessage(err.response?.data?.message || err.message || "Failed to recover key.");
    } finally {
      setLoadingUserId(null);
    }
  };

  return (
    <>
      <div
        className="modal fade show"
        style={{ display: "block" }}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-dialog modal-dialog-top" role="document">
          <div className="modal-content">
            {/* Modal Header */}
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="fa fa-users mr-2 text-primary"></i>
                Participants
              </h5>
              <button
                type="button"
                className="close"
                onClick={handleClose}
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <AlertMessages
              showSuccess={showSuccess}
              successMessage={successMessage}
              showError={showError}
              errorMessage={errorMessage}
              setShowSuccess={(val) => setShowSuccess(val)}
              setShowError={(val) => setShowError(val)}
            />

            {/* Modal Body */}
            <div className="modal-body" style={{ maxHeight: "65vh", overflowY: "auto" }}>
              {localParticipants.length > 0 ? (
                <div className="list-group list-group-flush">
                  {localParticipants.map((p, index) => {
                    const userId = p.user_id;
                    const actionType = getActionType(p);
                    return (
                      <div
                        key={userId || index}
                        className="mb-2 px-3 py-2 rounded-lg d-flex align-items-center justify-content-between"
                        style={{
                          backgroundColor: "#eff6ff",
                          border: "1px solid #dbeafe",
                          borderRadius: "8px",
                        }}
                      >
                        <div className="d-flex align-items-center overflow-hidden mr-2">
                          <Avatar
                            profile={p?.profile}
                            first_name={p?.first_name}
                            last_name={p?.last_name}
                            size={35}
                            className="mr-3 flex-shrink-0"
                          />
                          <div className="overflow-hidden">
                            <strong className="text-dark d-block text-truncate mb-0" style={{ fontSize: "14px" }}>
                              {Number(p.user_id) === Number(currentUserId) ? "You" : (p?.name || `${p?.first_name || ""} ${p?.last_name || ""}`.trim())}
                            </strong>
                            <small className="text-muted d-block text-truncate" style={{ fontSize: "12px" }}>
                              {p?.role || p?.employee_role || p?.email || "Participant"}
                            </small>
                          </div>
                        </div>

                        {actionType && p.user_id !== currentUserId && (
                          <Button
                            style={{ textTransform: 'capitalize' }}
                            label={actionType}
                            title={
                              actionType === "request"
                                ? "Send a recovery request for this discussion"
                                : actionType === "request again"
                                  ? "Resend the recovery request for this discussion"
                                  : "Approve the recovery request for this discussion"
                            }
                            loading={loadingUserId === userId}
                            onClick={() => {
                              if (actionType === "request" || actionType === "request again") {
                                handleRequestKey(p);
                              } else if (actionType === "approve") {
                                handleRecoverKey(p);
                              }
                            }}
                            className={`btn-sm flex-shrink-0 ${actionType === "request again" ? "btn-warning" : "btn-info"}`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-3 text-muted">
                  <p className="small mb-0">No participants found.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
              <Button
                label="Close"
                onClick={handleClose}
                className="btn-secondary"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </>
  );
};

export default ParticipantsModal;
