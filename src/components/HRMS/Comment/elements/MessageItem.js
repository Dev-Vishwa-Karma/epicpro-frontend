import { getFileUrl } from '../../../../utils';
import React, { useState } from 'react';
import Avatar from '../../../common/Avatar';
import ImagePreview from '../../../common/ImagePreview';
import imageNotAvailable from '../../../../assets/images/image-not-available.svg';

const getActiveRepliesCount = (replies) => {
    if (!replies || !Array.isArray(replies)) return 0;
    return replies.reduce((count, reply) => {
        const currentCount = reply ? 1 : 0;
        const childrenCount = getActiveRepliesCount(reply.replies);
        return count + currentCount + childrenCount;
    }, 0);
};

const AttachmentItem = ({ attachment, index, onImageClick }) => {
    const isImage = attachment.source_type && attachment.source_type.startsWith('image/');
    const fileUrl = getFileUrl(attachment.source);
    const downloadUrl = `${process.env.REACT_APP_API_URL}/download.php?file=${attachment.source}`;
    const fileName = attachment.source.split('/').pop();

    return (
        <div key={attachment.id || index} className="attachment-item border rounded overflow-hidden" style={{ width: '100px', height: '100px', backgroundColor: '#f8f9fa' }}>
            {isImage ? (
                <div className="position-relative w-100 h-100 gallery-inner-img">
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onImageClick) onImageClick({ url: fileUrl, downloadUrl });
                        }}
                        title="Click to view full image"
                        style={{ cursor: 'pointer', width: '100%', height: '100%' }}
                    >
                        <img
                            src={fileUrl}
                            alt={fileName}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = imageNotAvailable;
                            }}
                        />
                    </div>
                </div>
            ) : (
                <a
                    href={downloadUrl}
                    target="_blank"
                    className="d-flex flex-column align-items-center justify-content-center h-100 text-decoration-none text-dark p-2 text-center"
                    title="Click to download file"
                >
                    <i className="fa fa-file text-muted mb-2" style={{ fontSize: '2rem' }}></i>
                    <span className="text-truncate w-100" style={{ fontSize: '0.65rem' }}>{fileName}</span>
                </a>
            )}
        </div>
    );
};

const showAttachements = (attachements, onImageClick) => {
    return (
        attachements.map((attachment, index) => (
            <AttachmentItem key={attachment.id || index} attachment={attachment} index={index} onImageClick={onImageClick} />
        ))
    );
};

const MessageItem = ({ comment, isCurrentUser, parentComment, isParentCurrentUser, onReply, onEdit, onDelete, isHovered, onHover, isParent, inThreadView }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const activeRepliesCount = getActiveRepliesCount(comment.replies);

    const replyButton = (
        <button
            className="btn btn-sm p-0 text-primary text-decoration-none fw-bold d-flex align-items-center"
            style={{ fontSize: '0.75rem', backgroundColor: 'transparent', border: 'none' }}
            onClick={() => onReply(comment)}
        >
            {activeRepliesCount} {activeRepliesCount === 1 ? 'reply' : 'replies'}
        </button>
    );

    const replyIcon = (
        <i
            className={`fa fa-reply-all text-muted mt-0 ${isCurrentUser ? 'ms-1' : 'me-1'}`}
            style={{
                fontSize: '0.7rem',
                transform: isCurrentUser ? 'rotate(180deg) scaleX(-1)' : 'rotate(180deg)',
                display: 'inline-block',
                padding: '4px'
            }}
        ></i>
    );

    return (
        <>
            <div
                id={`comment-${comment.id}`}
                className={`d-flex flex-column mb-3 ${isCurrentUser ? 'align-items-end' : 'align-items-start'}`}
                onMouseEnter={onHover}
                onMouseLeave={() => onHover(null)}
                style={{ width: '100%' }}
            >
                <div className="d-flex flex-column" style={{ maxWidth: '85%' }}>
                    <div className="d-flex align-items-start">
                        {!isCurrentUser && (
                            <Avatar
                                profile={comment.commented_by?.profile}
                                first_name={comment.commented_by?.first_name}
                                last_name={comment.commented_by?.last_name}
                                size={32}
                                className="me-2"
                                backgroundColor="#018d40ff"
                            />
                        )}
                        <div className={`card d-flex flex-column ps-2 ${isCurrentUser ? 'align-items-end mr-2' : 'align-items-start ml-2'}`}>
                            <div
                                id={`bubble-${comment.id}`}
                                className={`position-relative p-2`}
                                style={{
                                    maxWidth: '100%',
                                    backgroundColor: isCurrentUser ? '#b8e9afff' : '#f3f3f3ff',
                                    borderRadius: '10px',
                                    borderTopRightRadius: isCurrentUser ? '0px' : '8px',
                                    borderTopLeftRadius: isCurrentUser ? '8px' : '0px',
                                    minWidth: '230px'
                                }}
                            >
                                {isCurrentUser ?
                                    <span id={`tail-${comment.id}`} style={{ position: 'absolute', top: -2, right: '-16px', width: '16px', height: '26px', color: '#b8e9afff' }}>
                                        <svg viewBox="0 0 8 13" width="100%" height="100%">
                                            <path opacity="1" fill="currentColor" d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z"></path>
                                        </svg>
                                    </span>
                                    : <span id={`tail-${comment.id}`} style={{ position: 'absolute', top: -2, left: '-16px', width: '16px', height: '26px', color: '#f3f3f3ff' }}>
                                        <svg viewBox="0 0 8 13" width="100%" height="100%">
                                            <path opacity="1" fill="currentColor" d="M1.533 3.568L8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568z"></path>
                                        </svg>
                                    </span>}
                                <div className="mb-1 pe-5" style={{ fontSize: '0.8rem', color: '#128C7E', fontWeight: 'bold' }}>
                                    {isCurrentUser ? 'You' : `${comment.commented_by?.first_name} ${comment.commented_by?.last_name}`}
                                </div>

                                {(isCurrentUser || comment?.modified_at) && (
                                    <div className="position-absolute d-flex align-items-center" style={{ top: '8px', right: '8px', zIndex: 5 }}>
                                        {comment?.modified_at && !comment?.deleted_at && (
                                            <span className="text-muted me-2" style={{ fontSize: '0.65rem', fontStyle: 'italic' }}>
                                                Edited
                                            </span>
                                        )}
                                        {isCurrentUser && !comment?.deleted_at && (
                                            <div className="dropdown position-relative ml-2">
                                                <button
                                                    className="btn btn-sm btn-link p-0 text-muted fw-bold"
                                                    style={{ fontSize: '1.2rem', textDecoration: 'none', lineHeight: '0.5' }}
                                                    onClick={() => setShowMenu(!showMenu)}
                                                    onBlur={() => setTimeout(() => setShowMenu(false), 200)}
                                                >
                                                    ⋮
                                                </button>
                                                {showMenu && (
                                                    <div
                                                        className="dropdown-menu dropdown-menu-right show shadow-sm"
                                                        style={{ top: '100%', right: '0', left: 'auto', zIndex: 100, minWidth: '100px', padding: '0.25rem 0', position: 'absolute' }}
                                                    >
                                                        <button
                                                            className="dropdown-item text-primary"
                                                            style={{ fontSize: '0.85rem' }}
                                                            onClick={() => { setShowMenu(false); onEdit(comment); }}
                                                        >
                                                            <i className="fa fa-edit mr-1"></i>Edit
                                                        </button>
                                                        <button
                                                            className="dropdown-item text-danger"
                                                            style={{ fontSize: '0.85rem' }}
                                                            onClick={() => { setShowMenu(false); onDelete(comment.id); }}
                                                        >
                                                            <i className="fa fa-trash mr-1"></i>Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {parentComment && (
                                    <div
                                        className="p-2 mb-1 rounded"
                                        style={{ backgroundColor: 'rgba(0,0,0,0.05)', borderLeft: '4px solid #128C7E', cursor: 'pointer' }}
                                        onClick={() => {
                                            const element = document.getElementById(`comment-${parentComment.id}`);
                                            if (element) {
                                                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                const bubble = document.getElementById(`bubble-${parentComment.id}`);
                                                const tail = document.getElementById(`tail-${parentComment.id}`);
                                                if (bubble) {
                                                    const originalBg = bubble.style.backgroundColor;
                                                    bubble.style.transition = 'background-color 0.3s ease';
                                                    bubble.style.backgroundColor = '#cce5ff';
                                                    let originalTailColor = '';
                                                    if (tail) {
                                                        originalTailColor = tail.style.color;
                                                        tail.style.color = '#cce5ff';
                                                    }
                                                    setTimeout(() => {
                                                        bubble.style.backgroundColor = originalBg;
                                                        if (tail) {
                                                            tail.style.color = originalTailColor;
                                                        }
                                                        setTimeout(() => { bubble.style.transition = ''; }, 300);
                                                    }, 1200);
                                                }
                                            }
                                        }}
                                    >
                                        <div className="fw-bold color-primary" style={{ fontSize: '0.75rem' }}>
                                            {isParentCurrentUser ? 'You' : `${parentComment.commented_by?.first_name} ${parentComment.commented_by?.last_name}`}
                                        </div>
                                        <div className="d-flex align-items-center text-muted parent-message-content preview-text mt-1" style={{ fontSize: '0.75rem' }}>
                                            {parentComment.message && typeof parentComment.message === 'string' && parentComment.message.replace(/(<([^>]+)>)/gi, "").replace(/&nbsp;/gi, "").trim() !== '' && (
                                                <div className="text-truncate me-2" style={{ maxWidth: '200px' }} dangerouslySetInnerHTML={{ __html: parentComment.message ? parentComment.message : '' }}></div>
                                            )}
                                            {parentComment.attachments && parentComment.attachments.length > 0 && (
                                                <div className="d-flex flex-wrap gap-2 mt-2 mb-1">
                                                    {showAttachements(parentComment.attachments, setPreviewImage)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="message-content" style={{ fontSize: '0.9rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word', paddingRight: isCurrentUser ? '15px' : '0' }} dangerouslySetInnerHTML={{ __html: comment.message || '' }}>
                                </div>

                                {comment.attachments && comment.attachments.length > 0 && (
                                    <div className="d-flex flex-wrap gap-2 mt-2 mb-1">
                                        {showAttachements(comment.attachments, setPreviewImage)}
                                    </div>
                                )}

                                <div className="d-flex mt-1">
                                    {!(inThreadView && isParent) && !comment.deleted_at && (
                                        <button
                                            className="btn btn-sm btn-link p-0 me-auto text-decoration-none fw-bold"
                                            style={{ fontSize: '0.75rem' }}
                                            onClick={() => onReply(comment)}
                                        >
                                            {!inThreadView && comment.replies && activeRepliesCount > 0 ? 'View Thread' : 'Reply'}
                                        </button>
                                    )}

                                    <div className="d-flex ml-auto">
                                        <span
                                            className="text-muted ml-1"
                                            style={{ fontSize: '0.65rem' }}
                                        >
                                            At {new Date(comment?.deleted_at ? comment.deleted_at : comment.modified_at || comment.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* right side avatar */}
                        {isCurrentUser && (
                            <Avatar
                                profile={comment.commented_by?.profile}
                                first_name={comment.commented_by?.first_name}
                                last_name={comment.commented_by?.last_name}
                                size={32}
                                className="ms-2"
                                backgroundColor="#018d40ff"
                            />
                        )}
                    </div>
                    {
                        !isParent && !inThreadView && comment.replies && activeRepliesCount > 0 && (
                            <div className={`d-flex ${isCurrentUser ? 'align-self-start' : 'align-self-end'}`} style={{ marginTop: '-12px' }}>
                                {isCurrentUser ? (
                                    <>
                                        {replyButton}
                                        {replyIcon}
                                    </>
                                ) : (
                                    <>
                                        {replyIcon}
                                        {replyButton}
                                    </>
                                )}
                            </div>
                        )
                    }
                </div>
            </div>
            {isParent && inThreadView && (
                <div className="d-flex align-items-center mb-3 mt-1 w-100">
                    <hr className="flex-grow-1 m-0" style={{ borderTop: '1px solid #dee2e6', opacity: 1 }} />
                    <span className="mx-3 text-muted" style={{ fontSize: '0.75rem', fontWeight: '500' }}>
                        {activeRepliesCount} {activeRepliesCount > 1 ? 'replies' : 'reply'}
                    </span>
                    <hr className="flex-grow-1 m-0" style={{ borderTop: '1px solid #dee2e6', opacity: 1 }} />
                </div>
            )}

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

export default MessageItem;
