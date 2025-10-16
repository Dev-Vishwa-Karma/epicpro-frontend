import React from 'react';
import Button from '../../../common/formInputs/Button';

const ImageModal = ({
  show,
  image,
  onClose,
  onDownload,
  onDelete,
  downloadLoading
}) => {
  if (!show || !image) return null;

  const fileName = image.url.split('/').pop();
  const imageUrl = process.env.REACT_APP_API_URL + '/gallery.php?action=view_image&img=' + encodeURIComponent(fileName);

  return (
    <div className="modal-backdrop modal-backdrop-type">
      <div className="modal-backdrop-content">
        <button
          onClick={onClose}
          className="gallery-closeImageModal"
          aria-label="Close"
        >
          &times;
        </button>
        <img
          src={imageUrl}
          alt="Gallery Large"
          className="gallery-large"
        />
        {(window.user?.role === "admin" || window.user?.role === "super_admin") && (
          <div className="image-info" style={{ textAlign: 'center', marginBottom: '16px' }}>
            <p><strong>Employee:</strong> {image.first_name} {image.last_name}</p>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
          <Button
            label="DELETE"
            className="btn-danger"
            onClick={onDelete}
          />

          <Button
            label={downloadLoading ? 'Downloading...' : 'DOWNLOAD'}
            className="btn-primary"
            onClick={onDownload}
            loading={downloadLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default ImageModal; 