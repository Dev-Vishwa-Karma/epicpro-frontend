import React from 'react';
import ReactCropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';

const CropperModal = ({
  open,
  image,
  onCrop,
  onCancel,
  aspectRatio = 1,
  cropButtonText = 'Save Changes',
  cancelButtonText = 'Cancel',
  title = 'Crop Image',
}) => {
  const cropperRef = React.useRef(null);

  const handleCrop = () => {
    if (cropperRef.current && cropperRef.current.cropper && cropperRef.current.cropper.getCroppedCanvas()) {
      cropperRef.current.cropper.getCroppedCanvas().toBlob((blob) => {
        onCrop(blob);
      }, 'image/jpeg');
    }
  };
  
  if (!open) return null;

  return (
    <div className="modal show" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="close" onClick={onCancel}>
              <span>&times;</span>
            </button>
          </div>
          <div className="modal-body" style={{ textAlign: 'center' }}>
            <ReactCropper
              ref={cropperRef}
              src={image}
              style={{ height: 400, width: '100%' }}
              aspectRatio={aspectRatio}
              guides={false}
              viewMode={1}
              dragMode="move"
              scalable={true}
              cropBoxResizable={true}
              cropBoxMovable={true}
            />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>{cancelButtonText}</button>
            <button type="button" className="btn btn-primary" onClick={handleCrop}>{cropButtonText}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropperModal; 