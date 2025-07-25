import React from 'react';

class LinkModal extends React.Component {
  constructor(props) {
    super(props);
    this.fileInput = null;
    this.dragActive = false;
    this.state = {
      previewUrl: null,
      previewType: null // 'image' or 'file'
    };
  }

  handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      this.dragActive = true;
      e.currentTarget.style.border = '2px solid #007bff';
      e.currentTarget.style.background = '#f0f8ff';
    } else if (e.type === 'dragleave') {
      this.dragActive = false;
      e.currentTarget.style.border = '2px dashed #ccc';
      e.currentTarget.style.background = '#fafbfc';
    }
  };

  handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.dragActive = false;
    e.currentTarget.style.border = '2px dashed #ccc';
    e.currentTarget.style.background = '#fafbfc';
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      this.handleFilePreview(e.dataTransfer.files[0]);
      const fakeEvent = {
        target: {
          name: 'file_path',
          type: 'file',
          files: e.dataTransfer.files
        }
      };
      this.props.onChange(fakeEvent);
    }
  };

  handleFileClick = () => {
    if (this.fileInput) this.fileInput.click();
  };

  setFileInputRef = (input) => {
    this.fileInput = input;
  };

  handleFileInputChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      this.handleFilePreview(file);
    } else {
      this.setState({ previewUrl: null, previewType: null });
    }
    this.props.onChange(e);
  };

  handleFilePreview = (file) => {
    if (file && file.type && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        this.setState({ previewUrl: ev.target.result, previewType: 'image' });
      };
      reader.readAsDataURL(file);
    } else if (file) {
      this.setState({ previewUrl: null, previewType: 'file' });
    } else {
      this.setState({ previewUrl: null, previewType: null });
    }
  };

  componentDidUpdate(prevProps) {
    // If file_path is cleared (e.g. after submit or delete), remove preview
    if (
      prevProps.formData.file_path &&
      !this.props.formData.file_path &&
      (this.state.previewUrl || this.state.previewType)
    ) {
      this.setState({ previewUrl: null, previewType: null });
    }
  }

  render() {
    const {
      isEdit = false, show, onClose, onSubmit, onChange, formData = {}, errors = {}, loading = false, modalId,  activeTab
    } = this.props;
    const { title = '', url = '', file_path = null } = formData;
    const showFileInput = activeTab === 'Excel' || activeTab === 'Codebase';
    const { previewUrl, previewType } = this.state;
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
                <div className="modal-body git-modal-body">
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
                    <label htmlFor="url" className="form-label">URL</label>
                    <input
                      id="url"
                      type="text"
                      className={`form-control ${errors.url ? 'is-invalid' : ''}`}
                      name="url"
                      value={url}
                      onChange={onChange}
                      placeholder="URL"
                    />
                    {errors.url && <small className="invalid-feedback">{errors.url}</small>}
                  </div>
                  {showFileInput && (
                    <>
                      <div className='or-content'>
                        <div className='or-line' />
                        <span className='or-main' >OR</span>
                        <div className='or-line' />
                      </div>
                      <div
                        onClick={this.handleFileClick}
                        onDragEnter={this.handleDrag}
                        onDragOver={this.handleDrag}
                        onDragLeave={this.handleDrag}
                        onDrop={this.handleDrop}
                        className='drag-and-drop-file'
                      >
                        <label htmlFor="file_path" className="form-label">File</label>
                        <input
                          id="file_path"
                          ref={this.setFileInputRef}
                          type="file"
                          style={{ display: 'none' }}
                          className={`form-control ${errors.file_path ? 'is-invalid' : ''}`}
                          name="file_path"
                          onChange={this.handleFileInputChange}
                        />
                        <div className='drag-drop-content'>
                          Drag & drop a file here, or <span className='drag-browser'>browse</span>
                        </div>
                        {file_path && typeof file_path === 'object' && file_path.name && (
                          <div className='file-name'>{file_path.name}</div>
                        )}
                        {file_path && typeof file_path === 'string' && (
                          <div className='file-name'>{file_path.split('/').pop()}</div>
                        )}
                        {/* Preview section */}
                        {previewType === 'image' && previewUrl && (
                          <div className='file-preview' style={{ marginTop: 10 }}>
                            <img src={previewUrl} alt='Preview' style={{ maxWidth: '100%', maxHeight: 120, borderRadius: 6, border: '1px solid #eee' }} />
                          </div>
                        )}
                        {previewType === 'file' && file_path && (
                          <div className='file-preview' style={{ marginTop: 10, color: '#888', fontSize: 14 }}>
                            <i className='fa fa-file' style={{ fontSize: 32, marginRight: 8 }} />
                            {file_path.name || (typeof file_path === 'string' ? file_path.split('/').pop() : '')}
                          </div>
                        )}
                      </div>
                      {errors.file_path && <small className="invalid-feedback" style={{ display: 'block' }}>{errors.file_path}</small>}
                    </>
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
  }
}

export default LinkModal; 