import React from "react";

const CheckFileAvailability = ({ 
  file,                         
  fileUrl = null,              
  label = "File",               
  apiBaseUrl = process.env.REACT_APP_API_URL 
}) => {
  if (!file) {
    return (
      <small className="text-primary small" style={{ fontWeight: 500 }}>
        {label} not uploaded
      </small>
    );
  }

  // Determine filename and URL
  const isFileObject = file instanceof File;
  const name = isFileObject ? file.name : file.split("/").pop().replace(/^\w+-/, "");
  const href = fileUrl || `${apiBaseUrl}/${isFileObject ? file.name : file}`;

  return (
    <div className="d-inline-block">
      <a
        href={href}
        className="text-primary small"
        style={{ fontWeight: 500, display: "inline-block" }}
        target="_blank"
        rel="noopener noreferrer"
      >
        {name}
      </a>
    </div>
  );
};

export default CheckFileAvailability;
