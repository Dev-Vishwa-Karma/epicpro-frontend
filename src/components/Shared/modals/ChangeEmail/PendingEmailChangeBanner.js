import React, { Component } from "react";
import api from "../../../../api/axios";
import VerifyEmailCodeModal from "./VerifyEmailCodeModal";

class PendingEmailChangeBanner extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pendingRequest: null,
      loading: true,
      cancelling: false,
      showModal: false,
      errorMessage: "",
      successMessage: "",
    };
  }

  componentDidMount() {
    this.checkPendingRequest();
  }

  checkPendingRequest = async () => {
    try {
      const response = await api.get("/get_employees.php?action=get-pending-email-change");
      if (response.data && response.data.status === "success" && response.data.data) {
        this.setState({
          pendingRequest: response.data.data,
          loading: false,
        });
      } else {
        this.setState({
          pendingRequest: null,
          loading: false,
        });
      }
    } catch (err) {
      console.error("Error fetching pending email change:", err);
      this.setState({ loading: false });
    }
  };

  handleCancel = async () => {
    this.setState({ cancelling: true, errorMessage: "" });
    try {
      const response = await api.post("/get_employees.php?action=cancel-email-change");
      if (response.data && response.data.status === "success") {
        this.setState({
          pendingRequest: null,
          cancelling: false,
          successMessage: "Pending email change cancelled.",
        });
      } else {
        this.setState({
          errorMessage: response.data?.message || "Failed to cancel email change.",
          cancelling: false,
        });
      }
    } catch (err) {
      this.setState({
        errorMessage: "Error cancelling request.",
        cancelling: false,
      });
    }
  };

  handleOpenModal = () => {
    this.setState({ showModal: true });
  };

  handleCloseModal = () => {
    this.setState({ showModal: false });
    this.checkPendingRequest();
  };

  render() {
    const { pendingRequest, loading, cancelling, showModal } = this.state;

    // Do not render banner if loading, no pending request, OR while modal is active
    if (loading || !pendingRequest || showModal) {
      return (
        <VerifyEmailCodeModal
          show={showModal}
          onClose={this.handleCloseModal}
          pendingRequest={pendingRequest}
        />
      );
    }

    return (
      <>
        {/* Top-Centered Floating Banner Below Navbar */}
        <div
          className="pending-email-top-banner shadow-lg rounded"
          style={{
            position: "fixed",
            top: "76px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            width: "90%",
            maxWidth: "680px",
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderLeft: "4px solid #467fcf",
            borderRadius: "8px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            padding: "10px 16px",
          }}
        >
          <div className="d-flex align-items-center justify-content-between flex-wrap" style={{ gap: "10px 16px" }}>
            {/* Left Content */}
            <div className="d-flex align-items-center" style={{ gap: "12px", flex: "1 1 320px", minWidth: "0" }}>
              <div
                className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                style={{
                  width: "36px",
                  height: "36px",
                  minWidth: "36px",
                  backgroundColor: "#ebf5ff",
                  color: "#467fcf",
                }}
              >
                <i className="fe fe-mail" style={{ fontSize: "17px" }} />
              </div>
              <div style={{ fontSize: "13px", lineHeight: "1.4", color: "#334155", wordBreak: "break-word" }}>
                <span className="text-muted">Verification code sent to </span>
                <strong className="text-dark font-weight-semibold">{pendingRequest.new_email}</strong>
                <span className="text-muted">. Please check your inbox to complete the email change.</span>
              </div>
            </div>

            {/* Right Actions (Cancel and Enter Code) */}
            <div className="d-flex align-items-center ml-auto" style={{ gap: "8px", flexShrink: 0 }}>
              <button
                type="button"
                className="btn btn-sm btn-outline-danger font-weight-semibold px-3"
                style={{ fontSize: "12px", borderRadius: "6px", height: "32px", display: "inline-flex", alignItems: "center" }}
                onClick={this.handleCancel}
                disabled={cancelling}
              >
                {cancelling ? "Cancelling..." : "Cancel"}
              </button>

              <button
                type="button"
                className="btn btn-sm btn-primary font-weight-semibold px-3"
                style={{
                  fontSize: "12px",
                  borderRadius: "6px",
                  height: "32px",
                  display: "inline-flex",
                  alignItems: "center",
                  backgroundColor: "#467fcf",
                  borderColor: "#467fcf",
                }}
                onClick={this.handleOpenModal}
              >
                Verify Code
              </button>
            </div>
          </div>
        </div>

        <VerifyEmailCodeModal
          show={showModal}
          onClose={this.handleCloseModal}
          pendingRequest={pendingRequest}
        />
      </>
    );
  }
}

export default PendingEmailChangeBanner;
