import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

const ImagePreview = ({ imageUrl, downloadUrl, onClose }) => {
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [hasError, setHasError] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const bgRef = useRef(null);

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.5, 4));
    const handleZoomOut = () => setZoom(prev => {
        const newZoom = Math.max(prev - 0.5, 1);
        if (newZoom === 1) setPosition({ x: 0, y: 0 });
        return newZoom;
    });
    const handleReset = () => {
        setZoom(1);
        setPosition({ x: 0, y: 0 });
    };

    const handleImageClick = (e) => {
        e.stopPropagation();
        if (hasError) return;
        if (e.detail === 2) {
            setZoom(prev => Math.min(prev + 0.5, 4));
        } else if (e.detail > 2) {
            const decrement = e.detail === 3 ? 1.0 : 0.5;
            setZoom(prev => {
                const newZoom = Math.max(prev - decrement, 1);
                if (newZoom === 1) setPosition({ x: 0, y: 0 });
                return newZoom;
            });
        }
    };

    const handleBackgroundClick = (e) => {
        if (e.target.id === 'image-modal-bg' || e.target.id === 'image-container') {
            onClose();
        }
    };

    const handleMouseDown = (e) => {
        if (zoom > 1) {
            e.preventDefault(); // prevent native drag
            setIsDragging(true);
            dragStartRef.current = {
                x: e.clientX - position.x,
                y: e.clientY - position.y
            };
        }
    };

    const handleMouseMove = (e) => {
        if (isDragging && zoom > 1) {
            setPosition({
                x: e.clientX - dragStartRef.current.x,
                y: e.clientY - dragStartRef.current.y
            });
        }
    };

    const handleMouseUp = () => {
        if (isDragging) {
            setIsDragging(false);
        }
    };

    useEffect(() => {
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, []);

    useEffect(() => {
        const bg = bgRef.current;
        if (!bg) return;
        bg.focus();

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                e.stopPropagation();
                onClose();
            }
        };

        bg.addEventListener('keydown', handleKeyDown);
        return () => bg.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    useEffect(() => {
        const handleWheel = (e) => {
            if (e.ctrlKey) {
                e.preventDefault();
                if (e.deltaY < 0) {
                    setZoom(prev => Math.min(prev + 0.15, 4));
                } else {
                    setZoom(prev => {
                        const newZoom = Math.max(prev - 0.15, 1);
                        if (newZoom === 1) setPosition({ x: 0, y: 0 });
                        return newZoom;
                    });
                }
            }
        };

        window.addEventListener('wheel', handleWheel, { passive: false });
        return () => window.removeEventListener('wheel', handleWheel);
    }, []);

    const modalContent = (
        <div
            id="image-modal-bg"
            ref={bgRef}
            tabIndex={-1}
            onClick={handleBackgroundClick}
            style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 1)', zIndex: 999999,
                display: 'flex', flexDirection: 'column',
                outline: 'none'
            }}
        >
            <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 1000000, display: 'flex', gap: '10px' }}>
                {!hasError && (
                    <a
                        href={downloadUrl || imageUrl}
                        download
                        className="btn btn-dark"
                        title="Download Image"
                    >
                        <i className="fa fa-download"></i>
                    </a>
                )}
                <button className="btn btn-dark" onClick={onClose} title="Close">
                    <i className="fa fa-times"></i>
                </button>
            </div>

            <div style={{
                position: 'absolute',
                bottom: '30px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1000000,
                display: 'flex',
                gap: '10px'
            }}>
                {!hasError && (
                    <>
                        <button className="btn btn-dark" onClick={handleZoomIn} title="Zoom In">
                            <i className="fa fa-search-plus"></i>
                        </button>
                        <button className="btn btn-dark" onClick={handleReset} title="Reset Zoom">
                            <i className="fa fa-undo"></i>
                        </button>
                        <button className="btn btn-dark" onClick={handleZoomOut} title="Zoom Out">
                            <i className="fa fa-search-minus"></i>
                        </button>
                    </>
                )}

            </div>

            <div
                id="image-container"
                onClick={handleBackgroundClick}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    width: '100vw',
                    height: '100vh',
                    cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
                }}
            >
                <img
                    src={imageUrl}
                    alt="Preview"
                    onClick={handleImageClick}
                    onError={(e) => {
                        setHasError(true);
                        e.target.onerror = null;
                        e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjdmN2Y3Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjM4IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5JbWFnZSBub3QgYXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==";
                    }}
                    style={{
                        maxWidth: '90%',
                        maxHeight: '90vh',
                        objectFit: 'contain',
                        transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                        transition: isDragging ? 'none' : 'transform 0.2s ease-in-out',
                        cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
                    }}
                />
            </div>
        </div>
    );

    return ReactDOM.createPortal(modalContent, document.body);
};

export default ImagePreview;
