import React, { useState } from 'react';
import Button from '../../../common/formInputs/Button';
import ImagePreview from '../../../common/ImagePreview';
import imageNotAvailable from '../../../../assets/images/image-not-available.svg';

const MediaModel = ({ show, onClose, media = [] }) => {
    const [previewImage, setPreviewImage] = useState(null);


    if (!show) return null;

    return (
        <>
            <div
                className="modal fade show"
                style={{ display: 'block', zIndex: 1050 }}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
            >
                <div className="modal-dialog modal-xl modal-dialog-scrollable" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">All Media</h5>
                            <button
                                type="button"
                                className="close"
                                aria-label="Close"
                                onClick={onClose}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    fontSize: '1.5rem',
                                    fontWeight: 700,
                                    lineHeight: 1,
                                    color: '#000',
                                    opacity: 0.5
                                }}
                            >
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>

                        <div className="modal-body">
                            {media.length === 0 ? (
                                <p className="text-center text-muted my-4">No media found.</p>
                            ) : (
                                <div className="row g-3">
                                    {media.map((attachment, index) => {
                                        const isImage = attachment.source_type && attachment.source_type.startsWith('image/');
                                        const fileUrl = `${process.env.REACT_APP_API_URL}/${attachment.source}`;
                                        const downloadUrl = `${process.env.REACT_APP_API_URL}/download.php?file=${attachment.source}`;
                                        const fileName = attachment.source ? attachment.source.split('/').pop() : 'Unknown File';

                                        return (
                                            <div key={attachment.id || index} className="col-md-3 mb-3">
                                                <div
                                                    className="card border rounded overflow-hidden position-relative shadow-sm h-100"
                                                    style={{ backgroundColor: '#f8f9fa' }}
                                                >
                                                    {isImage ? (
                                                        <div
                                                            className="card-body p-2 d-flex justify-content-center align-items-center gallery-inner-img"
                                                            onClick={() => {
                                                                setPreviewImage({ url: fileUrl, downloadUrl });
                                                            }}
                                                            title="Click to view full image"
                                                            style={{ cursor: 'pointer', height: '150px' }}
                                                        >
                                                            <img
                                                                src={fileUrl}
                                                                alt={fileName}
                                                                style={{
                                                                    maxWidth: '100%',
                                                                    maxHeight: '100%',
                                                                    objectFit: 'contain'
                                                                }}
                                                                onError={(e) => {
                                                                    e.target.onerror = null;
                                                                    e.target.src = imageNotAvailable;
                                                                }}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <a
                                                            href={downloadUrl}
                                                            className="card-body p-2 d-flex flex-column align-items-center justify-content-center text-decoration-none text-dark"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{ height: '150px' }}
                                                        >
                                                            <i className="fa fa-file text-muted mb-2" style={{ fontSize: '2.5rem' }}></i>
                                                            <span className="text-truncate w-100 text-center" style={{ fontSize: '0.75rem' }}>
                                                                {fileName}
                                                            </span>
                                                        </a>
                                                    )}

                                                    {attachment.date && (
                                                        <div className="card-footer p-2 text-center">
                                                            <div className="text-muted" style={{ fontSize: '0.7rem', fontWeight: '500' }}>
                                                                At- {new Date(attachment.date).toLocaleString('en-US', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    year: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <Button
                                label="Close"
                                onClick={onClose}
                                className="btn-secondary"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop fade show" style={{ zIndex: 1040 }} />

            {previewImage && (
                <ImagePreview
                    imageUrl={previewImage.url}
                    downloadUrl={previewImage.downloadUrl}
                    onClose={() => setPreviewImage(null)}
                />
            )}
        </>
    );
};

export default MediaModel;
