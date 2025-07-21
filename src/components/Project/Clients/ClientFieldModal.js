import React from 'react';

const ClientFieldModal = ({
  isEdit = false,
  show,
  onClose,
  onSubmit,
  onChange,
  formData = {},
  errors = {},
  loading = false,
  modalId,
}) => {
  const {
    name = '',
    profilePic = null,
    email = '',
    about = '',
    country = '',
    state = '',
    city = '',
    status = '',
  } = formData;

  let previewUrl = null;
  if (profilePic) {
    if (typeof profilePic === 'object' && profilePic instanceof File) {
      try {
        previewUrl = window.URL.createObjectURL(profilePic);
      } catch (e) {
        previewUrl = null;
      }
    } else if (typeof profilePic === 'string') {
      previewUrl = profilePic;
    }
  }
  const defaultAvatarUrl = 'https://thumbs.dreamstime.com/b/male-avatar-profile-picture-silhouette-34443055.jpg';

  return (
    <>
      {show && (
        <div className="modal fade show d-block" id={modalId} tabIndex={-1} role="dialog" aria-modal="true" data-backdrop="static" data-keyboard="false">
          <div className="modal-dialog modal-dialog-scrollable" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id={`${modalId}Label`}>
                  {isEdit ? 'Edit Client' : 'Add Client'}
                </h5>
                <button type="button" className="close" onClick={onClose}>
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <div className="row">
                  <div className="col-md-12 mb-3 d-flex justify-content-center">
                    <div style={{ position: 'relative', display: 'inline-block', width: 100, height: 100 }}>
                      <img
                        src={previewUrl || defaultAvatarUrl}
                        alt="Profile"
                        className="img-thumbnail"
                        style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: '50%', border: '2px solid #fff' }}
                      />
                      <label
                        htmlFor="profilePicInput"
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          background: '#fff',
                          borderRadius: '50%',
                          border: '1px solid #ccc',
                          width: 32,
                          height: 32,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.12)'
                        }}
                        title="Change photo"
                      >
                        <i className="fa fa-camera" style={{ fontSize: 18 }} />
                        <input
                          id="profilePicInput"
                          type="file"
                          name="profilePic"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={onChange}
                        />
                      </label>
                    </div>
                  </div>
                  {errors.profilePic && (
                    <div className="col-md-12"><small className="invalid-feedback d-block text-center">{errors.profilePic}</small></div>
                  )}
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label" htmlFor="name">Name</label>
                      <input
                        type="text"
                        className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                        placeholder="Client Name"
                        name="name"
                        value={name}
                        onChange={onChange}
                      />
                      {errors.name && <small className="invalid-feedback">{errors.name}</small>}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label" htmlFor="email">Email</label>
                      <input
                        type="email"
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        placeholder="Client Email"
                        name="email"
                        value={email}
                        onChange={onChange}
                      />
                      {errors.email && <small className="invalid-feedback">{errors.email}</small>}
                    </div>
                  </div>

                  <div className="col-md-12">
                    <div className="form-group">
                      <label className="form-label" htmlFor="about">About</label>
                      <textarea
                        className={`form-control ${errors.about ? 'is-invalid' : ''}`}
                        placeholder="About Client"
                        name="about"
                        value={about}
                        onChange={onChange}
                        rows={3}
                      />
                      {errors.about && <small className="invalid-feedback">{errors.about}</small>}
                    </div>
                  </div>
                  
                  <div className="col-md-4">
                    <div className="form-group">
                      <label className="form-label" htmlFor="country">Country</label>
                      <input
                        type="text"
                        className={`form-control ${errors.country ? 'is-invalid' : ''}`}
                        placeholder="Country"
                        name="country"
                        value={country}
                        onChange={onChange}
                      />
                      {errors.country && <small className="invalid-feedback">{errors.country}</small>}
                    </div>
                  </div>
                  
                  <div className="col-md-4">
                    <div className="form-group">
                      <label className="form-label" htmlFor="state">State</label>
                      <input
                        type="text"
                        className={`form-control ${errors.state ? 'is-invalid' : ''}`}
                        placeholder="State"
                        name="state"
                        value={state}
                        onChange={onChange}
                      />
                      {errors.state && <small className="invalid-feedback">{errors.state}</small>}
                    </div>
                  </div>
                  
                  <div className="col-md-4">
                    <div className="form-group">
                      <label className="form-label" htmlFor="city">City</label>
                      <input
                        type="text"
                        className={`form-control ${errors.city ? 'is-invalid' : ''}`}
                        placeholder="City"
                        name="city"
                        value={city}
                        onChange={onChange}
                      />
                      {errors.city && <small className="invalid-feedback">{errors.city}</small>}
                    </div>
                  </div>
                  
                  <div className="col-md-12">
                    <div className="form-group">
                      <label className="form-label" htmlFor="status">Status</label>
                      <select
                        className={`form-control ${errors.status ? 'is-invalid' : ''}`}
                        name="status"
                        value={status}
                        onChange={onChange}
                      >
                        <option value="">Select Status</option>
                        <option value="1">Active</option>
                        <option value="0">Inactive</option>
                      </select>
                      {errors.status && <small className="invalid-feedback">{errors.status}</small>}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer" style={{ position: 'sticky', bottom: 0, background: 'white', zIndex: 1 }}>
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Close
                </button>
                <button type="button" onClick={onSubmit} className="btn btn-primary" disabled={loading}>
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

export default ClientFieldModal;