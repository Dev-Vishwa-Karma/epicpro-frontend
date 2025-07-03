import React from 'react';

const AlertMessages = ({ showSuccess, successMessage, showError, errorMessage, setShowSuccess, setShowError }) => (
  <>
    <div
      className={`alert alert-success alert-dismissible fade show ${showSuccess ? 'd-block' : 'd-none'}`}
      role="alert"
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1050,
        minWidth: '250px',
        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
      }}
    >
      <i className="fa-solid fa-circle-check me-2"></i>
      {successMessage}
      <button
        type="button"
        className="close"
        onClick={() => setShowSuccess(false)}
      ></button>
    </div>

    <div
      className={`alert alert-danger alert-dismissible fade show ${showError ? 'd-block' : 'd-none'}`}
      role="alert"
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1050,
        minWidth: '250px',
        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
      }}
    >
      <i className="fa-solid fa-triangle-exclamation me-2"></i>
      {errorMessage}
      <button
        type="button"
        className="close"
        onClick={() => setShowError(false)}
      ></button>
    </div>
  </>
);

export default AlertMessages;
