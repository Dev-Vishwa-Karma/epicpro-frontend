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
      showConfirmRemove: false,
      selectedFiles: [],
      previews: [],
      removeIndex: null
    };
  }

  // Helper: make absolute URL for previews if backend returns relative paths
  getAbsoluteUrl = (fileUrl) => {
    if (!fileUrl) return '';
    if (/^https?:\/\//i.test(fileUrl) || fileUrl.startsWith('data:image/')) return fileUrl;
    const base = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');
    const path = String(fileUrl).replace(/^\//, '');
    return base ? `${base}/${path}` : `/${path}`;
  };

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
    const files = e.dataTransfer.files;
    if (files && files.length) {
      this.consumeFiles(Array.from(files));
      const fakeEvent = {
        target: {
          name: 'file_path',
          type: 'file',
          files
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
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      this.consumeFiles(files);
    } else {
      this.setState({ previewUrl: null, previewType: null, selectedFiles: [], previews: [] });
    }
    this.props.onChange(e);
  };

  consumeFiles = (files) => {
    const nextFiles = [...this.state.selectedFiles, ...files];
    const seen = new Set();
    const deduped = [];
    nextFiles.forEach(f => {
      const key = [f.name, f.size, f.type].join('|');
      if (!seen.has(key)) { seen.add(key); deduped.push(f); }
    });

    const previews = [];
    let pendingReaders = 0;
    deduped.forEach((file, idx) => {
      if (file && file.type && file.type.startsWith('image/')) {
        pendingReaders++;
        const reader = new FileReader();
        reader.onload = (ev) => {
          previews[idx] = { type: 'image', url: ev.target.result, name: file.name };
          pendingReaders--;
          if (pendingReaders === 0) {
            this.setState({ selectedFiles: deduped, previews });
          }
        };
        reader.readAsDataURL(file);
      } else {
        previews[idx] = { type: 'file', url: null, name: file ? file.name : '' };
      }
    });
    if (pendingReaders === 0) {
      this.setState({ selectedFiles: deduped, previews });
    }
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
  handleRemoveFile = (index = null) => {
    if (index === null) {
      if (this.fileInput) { try { this.fileInput.value = ''; } catch (e) {} }
    this.setState({ previewUrl: null, previewType: null });
      const fakeEvent = { target: { name: 'file_path', value: '', type: 'text', files: null } };
      if (typeof this.props.onChange === 'function') { this.props.onChange(fakeEvent); }
      return;
    }
    const files = [...this.state.selectedFiles];
    const previews = [...this.state.previews];
    files.splice(index, 1);
    previews.splice(index, 1);
    if (this.fileInput) { try { this.fileInput.value = ''; } catch (e) {} }
    this.setState({ selectedFiles: files, previews });
    const fakeEvent = { target: { name: 'file_path', type: 'file', files } };
    if (typeof this.props.onChange === 'function') { this.props.onChange(fakeEvent); }
  };

  openConfirmRemove = (e, index = null) => {
    e && e.stopPropagation();
    this.setState({ showConfirmRemove: true, removeIndex: index });
  };

  cancelConfirmRemove = (e) => {
    e && e.stopPropagation();
    this.setState({ showConfirmRemove: false });
  };

  confirmRemoveFile = (e) => {
    e && e.stopPropagation();
    const idx = this.state.removeIndex;
    this.setState({ showConfirmRemove: false, removeIndex: null });
    if (typeof idx === 'number') {
      this.handleRemoveFile(idx);
    } else {
      this.handleRemoveFile(null);
    }
  };

  componentDidUpdate(prevProps) {
    // Helper to detect if a path looks like an image
    const isImagePath = (p) => {
      if (!p || typeof p !== 'string') return false;
      const lowered = p.split('?')[0].toLowerCase();
      return /\.(png|jpe?g|webp|gif)$/.test(lowered) || lowered.indexOf('data:image/') === 0;
    };

    //  When modal opens for a new row, reset selection and show that row's saved file
    if ((!prevProps.show && this.props.show) || (prevProps.formData?.id !== this.props.formData?.id)) {
      // Clear input element so same file can be re-picked
      if (this.fileInput) { try { this.fileInput.value = ''; } catch (e) {} }
      const filePath = this.props.formData?.file_path || null;
      if (filePath && typeof filePath === 'string') {
        this.setState({
          selectedFiles: [],
          previews: [],
          removeIndex: null,
          previewUrl: isImagePath(filePath) ? this.getAbsoluteUrl(filePath) : null,
          previewType: isImagePath(filePath) ? 'image' : 'file',
          showConfirmRemove: false
        });
      } else {
        this.setState({
          selectedFiles: [],
          previews: [],
          removeIndex: null,
          previewUrl: null,
          previewType: null,
          showConfirmRemove: false
        });
      }
    }

    // If file_path changes while open (e.g., after save fetch), reflect it
    if (prevProps.formData?.file_path !== this.props.formData?.file_path && this.props.show) {
      const filePath = this.props.formData?.file_path || null;
      if (filePath && typeof filePath === 'string') {
        this.setState({
          selectedFiles: [],
          previews: [],
          removeIndex: null,
          previewUrl: isImagePath(filePath) ? this.getAbsoluteUrl(filePath) : null,
          previewType: isImagePath(filePath) ? 'image' : 'file'
        });
      } else if (!filePath) {
      this.setState({ previewUrl: null, previewType: null });
      }
    }
  }

  render() {
    const {
      isEdit = false, show, onClose, onSubmit, onChange, formData = {}, errors = {}, loading = false, modalId,  activeTab
    } = this.props;
    const { title = '', url = '', file_path = null } = formData;
    const showFileInput = activeTab === 'Excel' || activeTab === 'Codebase';
    const { previewUrl, previewType, showConfirmRemove, selectedFiles, previews } = this.state;
    const fileDisplayName = file_path && (typeof file_path === 'object' ? file_path.name : (typeof file_path === 'string' ? file_path.split('/').pop() : ''));
    const hasAnyFile = (selectedFiles && selectedFiles.length > 0) || !!previewUrl || (!!file_path);
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
                          {!hasAnyFile && (
                        <span className="or-main mx-2">OR</span>
                          )}
                        <div className="flex-grow-1 or-line" />
                      </div>
                      {!hasAnyFile && (
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
                          multiple
                        />
                        <div className='drag-drop-content mb-2'>
                          <i className='fa fa-upload fa-2x text-primary mb-2' />
                          <div>
                            <span className='text-secondary'>Drag &amp; drop a file here, or <span className='text-primary drag-browser'>browse</span></span>
                          </div>
                        </div>
                      </div>
                      )}
                      {/* Outside Preview Grid */}
                      {(selectedFiles && selectedFiles.length > 0) && (
                        <>
                        <div className='d-flex flex-wrap mt-2 justify-content-center'>
                          {selectedFiles.map((f, idx) => (
                            <div key={idx} className='mr-2 mb-2' style={{ width: 140 }}>
                              <div className='border rounded shadow-sm' style={{ position: 'relative', width: '100%', height: 100, overflow: 'hidden', background: '#fff' }}>
                                {previews[idx]?.type === 'image' && previews[idx]?.url ? (
                                  <img src={previews[idx].url} alt={f.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  <div className='h-100 w-100 d-flex align-items-center justify-content-center text-muted'>
                                    <i className='fa fa-file fa-2x' />
                                  </div>
                                )}
                                <button
                                  type='button'
                                  className='btn btn-light btn-sm file-close-icon'
                                  onClick={(e)=>this.openConfirmRemove(e, idx)}
                                  title='Remove'
                                >
                                  <i className='fa fa-times text-danger' />
                                </button>
                              </div>
                              
                            </div>
                          ))}
                        </div>
                        {selectedFiles.map((f, idx) => (
                          <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', fontSize: 13, textAlign: 'start' }}>
                            {f.name}
                          </div>
                        ))}  
                        </>
                        )}
                      {/* single file preview outside */}
                      {(!selectedFiles || selectedFiles.length === 0) && (file_path || previewUrl) && (
                        <>
                        <div className='d-flex flex-wrap mt-2 justify-content-center'>
                          <div className='mr-2 mb-2' style={{ width: 140 }}>
                            <div className='border rounded shadow-sm' style={{ position: 'relative', width: '100%', height: 100, overflow: 'hidden', background: '#fff' }}>
                              {previewType === 'image' && previewUrl ? (
                                <img src={previewUrl} alt={fileDisplayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <div className='h-100 w-100 d-flex align-items-center justify-content-center text-muted'>
                                  <i className='fa fa-file fa-2x' />
                                </div>
                              )}
                              <button
                                type='button'
                                className='btn btn-light btn-sm file-close-icon'
                                onClick={(e)=>this.openConfirmRemove(e, null)}
                                title='Remove'
                              >
                                <i className='fa fa-times text-danger' />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', fontSize: 13, textAlign: 'start'  }}>
                            {fileDisplayName}
                        </div>
                      </>
                      )}
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