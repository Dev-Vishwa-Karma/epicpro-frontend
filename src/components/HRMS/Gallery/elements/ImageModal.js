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