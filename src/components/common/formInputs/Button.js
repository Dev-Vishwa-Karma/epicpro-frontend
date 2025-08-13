// Button.js
import React from 'react';

const Button = ({
  label,
  onClick,
  loading = false,
  disabled = false,
  className = '',
  style = {},
  type = 'button',
  dataToggle,
  dataTarget,
  icon,
  iconStyle = {},
  title,
  dataType,
  dataDismiss
}) => {
  return (
    <button
      type={type}
      className={`btn ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      style={style}
      data-toggle={dataToggle}
      data-target={dataTarget}
      data-type={dataType}
      title={title}
      data-dismiss={dataDismiss}
    >
      {loading && (
        <span
          className="spinner-border spinner-border-sm mr-2"
          role="status"
          aria-hidden="true"
        ></span>
      )}
      {icon && <i className={icon} style={iconStyle} aria-hidden="true"></i>}
      {label}
    </button>
  );
};

export default Button;


