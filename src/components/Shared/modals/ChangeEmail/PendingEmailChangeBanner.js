import React, { Component } from "react";
import api from "../../../../api/axios";
import VerifyEmailCodeModal from "./VerifyEmailCodeModal";
import Button from "../../../common/formInputs/Button";

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
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderLeft: "4px solid #467fcf",
            borderRadius: "8px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            padding: "12px 16px",
          }}
        >
          <div className="d-flex align-items-center justify-content-between flex-wrap" style={{ gap: "16px" }}>
            {/* Left Content (Grid Layout for Icon/Text Alignment) */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "36px 1fr",
                gap: "10px 16px",
                flex: "1 1 0%",
                minWidth: "250px"
              }}
            >
              {/* Row 1, Col 1: Email Icon */}
              <div
                className="d-flex align-items-center justify-content-center rounded-circle"
                style={{
                  width: "36px",
                  height: "36px",
                  backgroundColor: "#ebf5ff",
                  color: "#467fcf",
                }}
              >
                <i className="fe fe-mail" style={{ fontSize: "17px" }} />
              </div>

              {/* Row 1, Col 2: Message */}
              <div
                className="d-flex align-items-center"
                style={{
                  fontSize: "13px",
                  lineHeight: "1.5",
                  color: "#334155",
                  wordBreak: "break-word",
                }}
              >
                <div>
                  <span className="text-muted">
                    A 6-digit verification code has been sent to{" "}
                  </span>
                  <strong className="text-dark font-weight-semibold">
                    {pendingRequest.new_email}
                  </strong>
                  <span className="text-muted">
                    . Please check your inbox and enter the code to complete your email
                    change.
                  </span>
                </div>
              </div>

              {/* Row 2: Warning Block (spanning both columns) */}
              <div
                style={{
                  gridColumn: "1 / -1",
                  display: "grid",
                  gridTemplateColumns: "36px 1fr",
                  gap: "16px", // match main grid col gap
                  backgroundColor: "#fff8e1",
                  color: "#856404",
                  borderRadius: "6px",
                  padding: "8px 10px",
                  marginLeft: "-10px", // offset padding to keep icon aligned
                  marginRight: "-10px",
                }}
              >
                {/* Warning Icon */}
                <div className="d-flex align-items-start justify-content-center" style={{ width: "36px" }}>
                  <i className="fe fe-alert-triangle" style={{ fontSize: "17px", marginTop: "2px" }} />
                </div>
                {/* Warning Text */}
                <div style={{ fontSize: "13px", lineHeight: "1.5" }}>
                  <strong>Important:</strong> If you didn't request this change, or if you've changed your mind, you can cancel the request.
                </div>
              </div>
            </div>

            {/* Right Actions (Cancel and Enter Code) */}
            <div className="d-flex align-items-center flex-shrink-0" style={{ gap: "10px" }}>
              <Button
                type="button"
                label={cancelling ? "Cancelling..." : "Cancel"}
                className="btn btn-sm btn-outline-danger font-weight-semibold px-3"
                onClick={this.handleCancel}
                disabled={cancelling}
              />

              <Button
                type="button"
                label="Verify Code"
                className="btn btn-sm btn-primary font-weight-semibold px-3"
                onClick={this.handleOpenModal}
              />
            </div>
          </div>
        </div >

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
