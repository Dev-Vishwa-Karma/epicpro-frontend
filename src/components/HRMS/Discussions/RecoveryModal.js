import React, { useState, useEffect } from "react";
import Avatar from "../../common/Avatar";
import Button from "../../common/formInputs/Button";
import authService from "../../Authentication/authService";
import AlertMessages from "../../common/AlertMessages";
import { getService } from "../../../services/getService";

const RecoveryModal = ({
  show = false,
  mode = "request",
  onClose = () => { },
}) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loadingUserId, setLoadingUserId] = useState(null);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [employees, setEmployees] = useState([]);

  const currentUserId = authService.getUser()?.id;

  useEffect(() => {
    if (show && currentUserId) {
      setShowSuccess(false);
      setSuccessMessage("");
      setShowError(false);
      setErrorMessage("");
      setLoadingUserId(null);
      fetchRequests();
      fetchEmployees();
    }
  }, [show, mode, currentUserId]);

  const fetchEmployees = () => {
    getService
      .getCall("get_employees.php", { action: "view", role: "admin" })
      .then((res) => {
        const empList = res?.data || [];
        setEmployees(empList);
      })
      .catch((err) => {
        console.error("Error fetching employees:", err);
      });
  };

  const fetchRequests = async () => {
    try {
      setLoadingRequests(true);
      const [incRes, outRes] = await Promise.all([
        getService.addCall("discussions.php", "get_recovery_request", { approver_id: currentUserId }),
        getService.addCall("discussions.php", "get_recovery_request", { requester_id: currentUserId }),
      ]);

      const incList = Array.isArray(incRes?.data) ? incRes.data : (incRes?.data ? [incRes.data] : []);
      const outList = Array.isArray(outRes?.data) ? outRes.data : (outRes?.data ? [outRes.data] : []);

      setIncomingRequests(incList.filter(r => {
        const appStatus = r.approver_status || r.status;
        const procStatus = r.process_status;
        return appStatus === 'pending' && procStatus !== 'completed';
      }));
      setOutgoingRequests(outList.filter(r => {
        const procStatus = r.process_status;
        return procStatus !== 'completed';
      }));
    } catch (err) {
      console.error("Failed to fetch recovery requests:", err);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleClose = () => {
    setShowSuccess(false);
    setSuccessMessage("");
    setShowError(false);
    setErrorMessage("");
    setLoadingUserId(null);
    onClose();
  };

  const handleAction = async (p, actionMeta) => {
    const targetUserId = p.id;
    setLoadingUserId(targetUserId);
    setShowSuccess(false);
    setShowError(false);

    try {
      if (actionMeta.type === "approve") {
        const reqId = actionMeta.request?.id;
        if (reqId) {
          await getService.addCall("discussions.php", "update_request_bulk_recovery", {
            request_id: reqId,
            status: "accepted",
          });
          setIncomingRequests((prev) => (prev || []).filter((r) => Number(r.id) !== Number(reqId)));
          try {
            const raw = localStorage.getItem("active_recovery_requests");
            const activeRequests = raw ? JSON.parse(raw) : [];
            if (!activeRequests.map(Number).includes(Number(reqId))) {
              activeRequests.push(Number(reqId));
              localStorage.setItem("active_recovery_requests", JSON.stringify(activeRequests));
            }
          } catch (e) {
            console.error("Error storing active recovery request in localStorage:", e);
          }
        }
        setShowSuccess(true);
        setSuccessMessage("Key recovery approved. Re-encryption process initiated.");
      } else {
        const payload = {
          target_user_id: p.id,
        };

        console.log("request_bulk_recovery payload:", payload);
        console.log("participant:", p);

        const res = await getService.addCall(
          "discussions.php",
          "request_bulk_recovery",
          payload
        );

        console.log("request_bulk_recovery response:", res);
        if (res?.status === "success") {
          setShowSuccess(true);
          setSuccessMessage(res?.message || "Key recovery request sent successfully.");
        } else {
          setShowError(true);
          setErrorMessage(res?.message || "Failed to send key recovery request.");
        }
      }
    } catch (err) {
      console.error("RecoveryModal action error:", err);
      setShowError(true);
      setErrorMessage(err.response?.data?.message || err.message || "Action failed.");
    } finally {
      fetchRequests();
      setLoadingUserId(null);
    }
  };

  if (!show) return null;
  const validParticipants = employees?.filter(
    (p) => Number(p.id) !== Number(currentUserId) && (p.public_key && p.public_key.trim())
  );

  // In approve mode, ONLY show participants who have sent an active recovery request to the current user
  const displayParticipants = validParticipants?.filter((p) => {
    const pUserId = Number(p.id);
    if (mode === "approve") {
      return incomingRequests.some((r) => Number(r.requester_id) === pUserId);
    }
    return true;
  });

  const getParticipantAction = (p) => {
    const pUserId = Number(p.id);
    if (mode === "approve") {
      const incReq = incomingRequests.find(r => Number(r.requester_id) === pUserId);
      if (incReq) {
        return {
          type: "approve",
          label: "Approve Recovery",
          className: "btn-success",
          request: incReq,
        };
      }
    }

    const outReq = outgoingRequests.find(r => Number(r.approver_id) === pUserId);
    if (outReq) {
      return {
        type: "resend",
        label: "Request Again",
        className: "btn-warning",
        request: outReq,
      };
    }

    return {
      type: "request",
      label: "Request Recovery",
      className: "btn-primary",
      request: null,
    };
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
            <div className="modal-header bg-primary" style={{ color: "#fff" }}>
              <h5 className="modal-title">
                <i className="fa fa-key mr-2"></i>
                {mode === "approve" ? "Approve Key Recovery" : "Request Key Recovery"}
              </h5>
              <button
                type="button"
                className="close"
                style={{ color: "#fff" }}
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
              <p className="text-muted small mb-3">
                {mode === "approve"
                  ? "The participants have requested to be able to retrieve the discussions they had with you."
                  : "Select a participant to request key recovery for your shared discussions."}
              </p>

              {loadingRequests ? (
                <div className="text-center py-4 text-muted">
                  <i className="fa fa-spinner fa-spin mr-2"></i> Loading recovery status...
                </div>
              ) : displayParticipants?.length > 0 ? (
                <div className="list-group list-group-flush">
                  {displayParticipants.map((p, index) => {
                    const userId = p.id;
                    const actionMeta = getParticipantAction(p);
                    return (
                      <div
                        key={userId || index}
                        className="mb-2 px-3 py-2 rounded-lg d-flex align-items-center justify-content-between flex-wrap"
                        style={{
                          backgroundColor: actionMeta.type === "approve" ? "#f0fdf4" : "#eff6ff",
                          border: actionMeta.type === "approve" ? "1px solid #bbf7d0" : "1px solid #dbeafe",
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
                          <div className="overflow-hidden flex-grow-1">
                            <strong className="text-dark d-block text-truncate mb-0" style={{ fontSize: "14px" }}>
                              {`${p?.first_name || ""} ${p?.last_name || ""}`.trim()}
                            </strong>
                            <small className="text-muted d-block text-truncate" style={{ fontSize: "12px" }}>
                              {p?.email || "Participant"}
                            </small>
                          </div>
                        </div>

                        <Button
                          style={{ textTransform: 'capitalize' }}
                          label={actionMeta.label}
                          title={
                            actionMeta.type === "approve"
                              ? "Approve key recovery request from this participant"
                              : actionMeta.type === "resend"
                                ? "Resend key recovery request to this participant"
                                : "Send key recovery request to this participant"
                          }
                          loading={loadingUserId === userId}
                          onClick={() => handleAction(p, actionMeta)}
                          className={`btn-sm flex-shrink-0 ${actionMeta.className}`}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-muted">
                  {mode === "approve" ? (
                    <>
                      <i className="fa fa-check-circle text-success fa-2x mb-2 d-block" />
                      <p className="small mb-0">No recovery requests waiting for your approval.</p>
                    </>
                  ) : (
                    <p className="small mb-0">No eligible participants with active public keys found.</p>
                  )}
                </div>
              )}
            </div >

            {/* Modal Footer */}
            {displayParticipants.length !== 0 ? (
              <div className={`modal-footer ${mode === 'approve' ? 'd-flex justify-content-center w-100' : ''}`}>
                {mode === 'approve' ? (
                  <Button
                    label='Ignore'
                    onClick={handleClose}
                    className='btn-secondary btn-xl px-5 font-weight-bold w-100'
                    style={{ minWidth: '280px', fontSize: '16px' }}
                  />
                ) : (
                  <Button
                    label='Cancel'
                    onClick={handleClose}
                    className='btn-secondary btn-md'
                  />
                )}
              </div>
            ) : null}
          </div >
        </div >
      </div >
      <div className="modal-backdrop fade show" />
    </>
  );
};

export default RecoveryModal;
