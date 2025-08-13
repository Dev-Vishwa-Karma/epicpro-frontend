// components/modals/DepartmentModal.jsx
import React from 'react';
import InputField from '../../../common/formInputs/InputField';
import Button from '../../../common/formInputs/Button';

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
                      <InputField
                          label="Department Name"
                          name="department_name"
                          value={department_name}
                          onChange={onChange}
                          placeholder="Department Name"
                          error={errors.department_name}
                      />
                      <InputField
                          label="Department Head"
                          name="department_head"
                          value={department_head}
                          onChange={onChange}
                          placeholder="Department Head"
                          error={errors.department_head}
                      />
              </div>

              <div className="modal-footer">
                <Button
                  label="Close"
                  onClick={onClose}
                  className="btn-secondary"
                />
                <Button
                  label="Save changes"
                  onClick={onSubmit}
                  loading={loading}
                  disabled={loading}
                  className="btn-primary"
                />
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
