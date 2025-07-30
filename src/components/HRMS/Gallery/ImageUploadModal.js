import React, { useRef } from 'react';

const ImageUploadModal = ({
  isOpen,
  closeModal,
  employees,
  selectedEmployeeId,
  handleEmployeeSelection,
  selectedImages,
  handleImageSelection,
  removeImage,
  submitImages,
  errors,
  ButtonLoading
}) => {
  const fileInputRef = useRef();

  if (!isOpen) return null;

  return (
    <div
      className={`modal fade show`}
      id="uploadImageModal"
      tabIndex={-1}
      role="dialog"
      aria-labelledby="uploadImageModalLabel"
      aria-hidden={!isOpen}
      style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div className="modal-dialog modal-dialog-scrollable" role="document" aria-hidden="true">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="uploadImageModalLabel">Upload Images</h5>
            <button type="button" className="close" aria-label="Close" onClick={closeModal}>
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            {(window.user?.role === "admin" || window.user?.role === "super_admin") && (
              <div className="mt-3">
                <label htmlFor="employeeSelect" className="form-label">Select Employee</label>
                <select
                  id="employeeSelect"
                  className="form-control"
                  value={selectedEmployeeId}
                  onChange={handleEmployeeSelection}
                >
                  <option value="">Select an Employee</option>
                  {employees.map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.first_name} {employee.last_name}
                    </option>
                  ))}
                </select>
                {errors.selectedEmployeeId && (
                  <small className={`invalid-feedback d-block`}>{errors.selectedEmployeeId}</small>
                )}
              </div>
            )}

            <div className="mt-3">
              <label htmlFor="image" className="form-label">Select Image</label>
              <input
                type="file"
                onChange={handleImageSelection}
                className="form-control"
                multiple
                ref={fileInputRef}
              />
            </div>
            {errors.selectedImages && (
              <small className={`invalid-feedback d-block`}>{errors.selectedImages}</small>
            )}

            {selectedImages.length > 0 && (
              <div className="mt-3">
                <p>Selected Images:</p>
                <div className="d-flex flex-wrap">
                  {selectedImages.map((image, index) => (
                    <div key={index} className="position-relative m-2">
                      <img
                        src={URL.createObjectURL(image)}
                        alt="Preview"
                        className="img-thumbnail"
                        style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                      />
                      <button
                        className="btn btn-danger btn-sm position-absolute"
                        style={{ top: '-5px', right: '-5px', borderRadius: '50%' }}
                        onClick={() => removeImage(index)}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={submitImages}
              disabled={ButtonLoading}
            >
              {ButtonLoading && (
                <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
              )}
              Upload Images
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadModal;
