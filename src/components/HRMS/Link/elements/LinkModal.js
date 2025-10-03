import React from 'react';
import InputField from '../../../common/formInputs/InputField';
import Button from '../../../common/formInputs/Button';
import DeleteModal from '../../../common/DeleteModal';

class LinkModal extends React.Component {
  constructor(props) {
    super(props);
    this.fileInput = null;
    this.dragActive = false;
    this.state = {
      previewUrl: null,
      previewType: null,
      showConfirmRemove: false
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

  // For remove file while add/edit
  handleRemoveFile = () => {
    if (this.fileInput) {
      try { this.fileInput.value = ''; } catch (e) {}
    }
    this.setState({ previewUrl: null, previewType: null });
    const fakeEvent = {
      target: {
        name: 'file_path',
        value: '',
        type: 'text',
        files: null
      }
    };
    if (typeof this.props.onChange === 'function') {
      this.props.onChange(fakeEvent);
    }
  };

  openConfirmRemove = (e) => {
    e && e.stopPropagation();
    this.setState({ showConfirmRemove: true });
  };

  cancelConfirmRemove = (e) => {
    e && e.stopPropagation();
    this.setState({ showConfirmRemove: false });
  };

  confirmRemoveFile = (e) => {
    e && e.stopPropagation();
    this.setState({ showConfirmRemove: false });
    this.handleRemoveFile();
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
    const { previewUrl, previewType, showConfirmRemove } = this.state;
    const fileDisplayName = file_path && (typeof file_path === 'object' ? file_path.name : (typeof file_path === 'string' ? file_path.split('/').pop() : ''));
    return (
      <>
        {show && (
          <div className="modal fade show d-block" id={modalId} tabIndex={-1} role="dialog" aria-modal="true">
            <div className="modal-dialog modal-dialog-scrollable" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{isEdit ? `Edit ${activeTab}` : `Add ${activeTab}`}</h5>
                  <button type="button" className="close" onClick={onClose}><span aria-hidden="true">×</span></button>
                </div>
                <div className="modal-body git-modal-body">
                  <InputField
                    label="Title"
                    name="title"
                    type="text"
                    value={title}
                    onChange={onChange}
                    placeholder="Title"
                    error={errors.title}
                  />

                  <InputField
                    label="URL"
                    name="url"
                    type="text"
                    value={url}
                    onChange={onChange}
                    placeholder="URL"
                    error={errors.url}
                  />
                  {showFileInput && (
                    <>
                      <div className="or-content d-flex align-items-center my-3">
                        <div className="flex-grow-1 or-line" />
                        <span className="or-main mx-2">OR</span>
                        <div className="flex-grow-1 or-line" />
                      </div>
                      <div
                        className="drag-and-drop-file p-3 mb-3 rounded border border-dashed bg-light text-center"
                        style={{ position: 'relative', minHeight: 180, cursor: 'pointer' }}
                        onClick={this.handleFileClick}
                        onDragEnter={this.handleDrag}
                        onDragOver={this.handleDrag}
                        onDragLeave={this.handleDrag}
                        onDrop={this.handleDrop}
                      >
                        <label htmlFor="file_path" className="form-label font-weight-bold mb-2">Attach File</label>
                        <InputField
                          type="file"
                          name="file_path"
                          id="file_path"
                          onChange={this.handleFileInputChange}
                          refInput={this.setFileInputRef}
                          style={{ display: 'none' }}
                        />
                        <div className='drag-drop-content mb-2'>
                          <i className='fa fa-upload fa-2x text-primary mb-2' />
                          <div>
                            <span className='text-secondary'>Drag &amp; drop a file here, or <span className='text-primary drag-browser'>browse</span></span>
                          </div>
                        </div>
                        {/* File badge and remove */}
                        {file_path && (
                          <div
                            onClick={this.openConfirmRemove}
                            className='file-badge d-inline-flex align-items-center mt-2 px-2 py-1 bg-white border rounded shadow-sm'
                            title='Remove attached file'
                            role='button'
                            tabIndex={0}
                            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && this.openConfirmRemove()}
                          >
                            <span className='file-path-name mr-2'>{fileDisplayName}</span>
                            <span className='file-close-icon text-danger'>
                              <i className='fa fa-times' aria-hidden='true'></i>
                            </span>
                          </div>
                        )}
                        {/* Preview section */}
                        <div className='mt-3 d-flex flex-column align-items-center'>
                          {previewType === 'image' && previewUrl && (
                            <img
                              src={previewUrl}
                              alt='Preview'
                              className='img-thumbnail'
                              style={{ maxWidth: 180, maxHeight: 120, borderRadius: 8, border: '1px solid #eee' }}
                            />
                          )}
                          {previewType === 'file' && file_path && (
                            <div className='file-preview d-flex align-items-center' style={{ color: '#888', fontSize: 15 }}>
                              <i className='fa fa-file fa-2x mr-2' />
                              <span>{file_path.name || (typeof file_path === 'string' ? file_path.split('/').pop() : '')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {errors.file_path && (
                        <small className='invalid-feedback d-block text-left'>{errors.file_path}</small>
                      )}
                    </>
                  )}
                </div>
                <div className="modal-footer">
                <Button
                  label="Close"
                  onClick={onClose}
                  className="btn-secondary"
                />
                <Button
                  label={loading ? "Saving..." : "Save changes"}
                  onClick={onSubmit}
                  disabled={loading}
                  className="btn-primary"
                  loading={loading}
                  icon={loading ? "" : "fa fa-save"}
                  iconStyle={{ marginRight: '8px' }}
                />
                </div>
              </div>
            </div>
          </div>
        )}
        {show && <div className="modal-backdrop fade show" />}

        <DeleteModal
          show={show && showConfirmRemove}
          onConfirm={this.confirmRemoveFile}
          onClose={this.cancelConfirmRemove}
          deleteBody={`Are you sure you want to remove the attached file${fileDisplayName ? ` "${fileDisplayName}"` : ''}?`}
          isLoading={false}
        />
      </>
    );
  }
}

export default LinkModal; 