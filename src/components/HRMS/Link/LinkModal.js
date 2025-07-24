import React from 'react';

const LinkModal = ({
  isEdit = false,
  show,
  onClose,
  onSubmit,
  onChange,
  formData = {},
  errors = {},
  loading = false,
  modalId,
  activeTab
}) => {
  const { title = '', link = '', file = null } = formData;

  // Show file input for Excel and Codebase tabs
  const showFileInput = activeTab === 'Excel' || activeTab === 'Codebase';

  return (
    <>
      {show && (
        <div className="modal fade show d-block" id={modalId} tabIndex={-1} role="dialog" aria-modal="true">
          <div className="modal-dialog" role="document">
            <div className="modal-content">

              <div className="modal-header">
                <h5 className="modal-title">{isEdit ? `Edit ${activeTab}` : `Add ${activeTab}`}</h5>
                <button type="button" className="close" onClick={onClose}><span aria-hidden="true">×</span></button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="title" className="form-label">Title</label>
                  <input
                    id="title"
                    type="text"
                    className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                    name="title"
                    value={title}
                    onChange={onChange}
                    placeholder="Title"
                  />
                  {errors.title && <small className="invalid-feedback">{errors.title}</small>}
                </div>

                <div className="form-group">
                  <label htmlFor="link" className="form-label">Link</label>
                  <input
                    id="link"
                    type="text"
                    className={`form-control ${errors.link ? 'is-invalid' : ''}`}
                    name="link"
                    value={link}
                    onChange={onChange}
                    placeholder="Link"
                  />
                  {errors.link && <small className="invalid-feedback">{errors.link}</small>}
                </div>

                {showFileInput && (
                  <div className="form-group">
                    <label htmlFor="file" className="form-label">File</label>
                    <input
                      id="file"
                      type="file"
                      className={`form-control ${errors.file ? 'is-invalid' : ''}`}
                      name="file"
                      onChange={onChange}
                    />
                    {errors.file && <small className="invalid-feedback">{errors.file}</small>}
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
                <button type="button" className="btn btn-primary" onClick={onSubmit} disabled={loading}>
                  {loading && <span className="spinner-border spinner-border-sm mr-2" />}
                  Save changes
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
      {show && <div className="modal-backdrop fade show" />}
    </>
  );
};

export default LinkModal; 