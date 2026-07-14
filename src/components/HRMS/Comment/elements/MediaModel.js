import React, { useState } from 'react';
import Button from '../../../common/formInputs/Button';
import ImagePreview from '../../../common/ImagePreview';

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
                <div className="modal-dialog modal-lg modal-dialog-scrollable" role="document">
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
                                <div className="d-flex flex-wrap gap-5 gallery-image-wrapper">
                                    {media.map((attachment, index) => {
                                        const isImage = attachment.source_type && attachment.source_type.startsWith('image/');
                                        const fileUrl = `${process.env.REACT_APP_API_URL}/${attachment.source}`;
                                        const downloadUrl = `${process.env.REACT_APP_API_URL}/download.php?file=${attachment.source}`;
                                        const fileName = attachment.source ? attachment.source.split('/').pop() : 'Unknown File';

                                        return (
                                            <div key={attachment.id || index} className="col-3 attachment-item border gallery-image-wrapper rounded overflow-hidden position-relative" style={{ width: '140px', height: '140px', backgroundColor: '#f8f9fa' }}>
                                                {isImage ? (
                                                    <div className="w-100 h-100 position-relative gallery-inner-img">
                                                        <div
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setPreviewImage({ url: fileUrl, downloadUrl });
                                                            }}
                                                            title="Click to view full image"
                                                            style={{ cursor: 'pointer', width: '100%', height: '100%' }}
                                                        >
                                                            <img src={fileUrl} alt={fileName} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 6 }} />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <a href={downloadUrl} className="d-flex flex-column align-items-center justify-content-center h-100 text-decoration-none text-dark p-2 text-center" title="Click to download file">
                                                        <i className="fa fa-file text-muted mb-2" style={{ fontSize: '2rem' }}></i>
                                                        <span className="text-truncate w-100" style={{ fontSize: '0.65rem' }}>{fileName}</span>
                                                    </a>
                                                )}
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
