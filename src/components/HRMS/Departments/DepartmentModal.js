// components/modals/DepartmentModal.jsx
import React from 'react';

const DepartmentModal = ({
  isEdit = false,
  show,
  onClose,
  onSubmit,
  onChange,
  formData = {},
  errors = {},
  loading = false,
  modalId
}) => {
  const { department_name = '', department_head = '' } = formData;

  return (
    <>
      {show && (
        <div className="modal fade show d-block" id={modalId} tabIndex={-1} role="dialog" aria-modal="true">
          <div className="modal-dialog modal-dialog-scrollable" role="document">
            <div className="modal-content">

              <div className="modal-header">
                <h5 className="modal-title">{isEdit ? 'Edit Department' : 'Add Department'}</h5>
                <button type="button" className="close" onClick={onClose}><span aria-hidden="true">×</span></button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="department_name" className="form-label">Department Name</label>
                  <input
                    id="department_name"
                    type="text"
                    className={`form-control ${errors.department_name ? 'is-invalid' : ''}`}
                    name="department_name"
                    value={department_name}
                    onChange={onChange}
                    placeholder="Department Name"
                  />
                  {errors.department_name && <small className="invalid-feedback">{errors.department_name}</small>}
                </div>

                <div className="form-group">
                  <label htmlFor="department_head" className="form-label">Department Head</label>
                  <input
                    id="department_head"
                    type="text"
                    className={`form-control ${errors.department_head ? 'is-invalid' : ''}`}
                    name="department_head"
                    value={department_head}
                    onChange={onChange}
                    placeholder="Department Head"
                  />
                  {errors.department_head && <small className="invalid-feedback">{errors.department_head}</small>}
                </div>
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

export default DepartmentModal;
