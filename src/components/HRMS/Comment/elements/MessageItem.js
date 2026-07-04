import React, { useState } from 'react';
import Avatar from '../../../common/Avatar';

const getActiveRepliesCount = (replies) => {
    if (!replies || !Array.isArray(replies)) return 0;
    return replies.reduce((count, reply) => {
        const currentCount = reply.deleted_at ? 0 : 1;
        const childrenCount = getActiveRepliesCount(reply.replies);
        return count + currentCount + childrenCount;
    }, 0);
};

const MessageItem = ({ comment, isCurrentUser, parentComment, isParentCurrentUser, onReply, onEdit, onDelete, isHovered, onHover, isParent, inThreadView }) => {
    const [showMenu, setShowMenu] = useState(false);
    const activeRepliesCount = getActiveRepliesCount(comment.replies);

    return (
        <div
            id={`comment-${comment.id}`}
            className={`d-flex mb-3 ${isCurrentUser ? 'justify-content-end' : 'justify-content-start'}`}
            onMouseEnter={onHover}
            onMouseLeave={() => onHover(null)}
        >
            {!isCurrentUser && (
                <Avatar
                    profile={comment.commented_by?.profile}
                    first_name={comment.commented_by?.first_name}
                    last_name={comment.commented_by?.last_name}
                    size={32}
                    className="me-2 align-self-end mb-1"
                />
            )}

            <div className={`d-flex flex-column ${isCurrentUser ? 'align-items-end' : 'align-items-start'}`}>
                <div
                    id={`bubble-${comment.id}`}
                    className={`position-relative p-2 shadow-sm`}
                    style={{
                        maxWidth: '85%',
                        backgroundColor: isCurrentUser ? '#d9fdd3' : '#ffffff',
                        borderRadius: '8px',
                        borderTopRightRadius: isCurrentUser ? '0px' : '8px',
                        borderTopLeftRadius: isCurrentUser ? '8px' : '0px',
                        minWidth: '250px'
                    }}
                >
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

                    {parentComment && !comment?.deleted_at && (
                        <div
                            className="p-2 mb-1 rounded"
                            style={{ backgroundColor: 'rgba(0,0,0,0.05)', borderLeft: '4px solid #128C7E', cursor: 'pointer' }}
                            onClick={() => {
                                const element = document.getElementById(`comment-${parentComment.id}`);
                                if (element) {
                                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    const bubble = document.getElementById(`bubble-${parentComment.id}`);
                                    if (bubble) {
                                        const originalBg = bubble.style.backgroundColor;
                                        bubble.style.transition = 'background-color 0.3s ease';
                                        bubble.style.backgroundColor = '#cce5ff';
                                        setTimeout(() => {
                                            bubble.style.backgroundColor = originalBg;
                                            setTimeout(() => { bubble.style.transition = ''; }, 300);
                                        }, 1200);
                                    }
                                }
                            }}
                        >
                            <div
                                className="fw-bold color-primary"
                                style={{ fontSize: '0.75rem' }}>
                                {isParentCurrentUser ? 'You' : `${parentComment.commented_by?.first_name} ${parentComment.commented_by?.last_name}`}
                            </div>
                            <div className="d-flex align-items-center text-muted parent-message-content mt-1" style={{ fontSize: '0.75rem' }}>
                                {parentComment.message && typeof parentComment.message === 'string' && parentComment.message.replace(/(<([^>]+)>)/gi, "").replace(/&nbsp;/gi, "").trim() !== '' && (
                                    <div className="text-truncate me-2" style={{ maxWidth: '200px' }} dangerouslySetInnerHTML={{ __html: parentComment.message ? parentComment.message : '' }}></div>
                                )}
                                {parentComment.attachments && parentComment.attachments.length > 0 && (
                                    <div className="d-flex flex-wrap gap-2 mt-2 mb-1">
                                        {parentComment.attachments.map((attachment, index) => {
                                            const isImage = attachment.source_type && attachment.source_type.startsWith('image/');
                                            const fileUrl = `${process.env.REACT_APP_API_URL}/${attachment.source}`;
                                            const fileName = attachment.source.split('/').pop();

                                            return (
                                                <div key={attachment.id || index} className="attachment-item border rounded overflow-hidden" style={{ width: '100px', height: '100px', backgroundColor: '#f8f9fa' }}>
                                                    {isImage ? (
                                                        <a href={fileUrl} target="_blank" rel="noreferrer" title="Click to view full image">
                                                            <img src={fileUrl} alt={fileName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        </a>
                                                    ) : (
                                                        <a href={fileUrl} target="_blank" rel="noreferrer" className="d-flex flex-column align-items-center justify-content-center h-100 text-decoration-none text-dark p-2 text-center" title="Click to download file">
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
                        </div>
                    )}

                    <div className="message-content" style={{ fontSize: '0.9rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word', paddingBottom: '4px', paddingRight: isCurrentUser ? '15px' : '0' }} dangerouslySetInnerHTML={{ __html: comment.message || '' }}>
                    </div>

                    {comment.attachments && comment.attachments.length > 0 && (
                        <div className="d-flex flex-wrap gap-2 mt-2 mb-1">
                            {comment.attachments.map((attachment, index) => {
                                const isImage = attachment.source_type && attachment.source_type.startsWith('image/');
                                const fileUrl = `${process.env.REACT_APP_API_URL}/${attachment.source}`;
                                const fileName = attachment.source.split('/').pop();

                                return (
                                    <div key={attachment.id || index} className="attachment-item border rounded overflow-hidden" style={{ width: '100px', height: '100px', backgroundColor: '#f8f9fa' }}>
                                        {isImage ? (
                                            <a href={fileUrl} target="_blank" rel="noreferrer" title="Click to view full image">
                                                <img src={fileUrl} alt={fileName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </a>
                                        ) : (
                                            <a href={fileUrl} target="_blank" rel="noreferrer" className="d-flex flex-column align-items-center justify-content-center h-100 text-decoration-none text-dark p-2 text-center" title="Click to download file">
                                                <i className="fa fa-file text-muted mb-2" style={{ fontSize: '2rem' }}></i>
                                                <span className="text-truncate w-100" style={{ fontSize: '0.65rem' }}>{fileName}</span>
                                            </a>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="d-flex mt-1">
                        {!comment?.deleted_at && !(inThreadView && isParent) && (
                            <button
                                className="btn btn-sm btn-link p-0 me-auto text-decoration-none fw-bold"
                                style={{ fontSize: '0.75rem' }}
                                onClick={() => onReply(comment)}
                            >
                                {!inThreadView && comment.replies && activeRepliesCount === 0 ? 'Start Thread' : !inThreadView && comment.replies && activeRepliesCount > 0 ? 'View Thread' : 'Reply'}
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
                {
                    !isParent && !comment?.deleted_at && !inThreadView && comment.replies && activeRepliesCount > 0 && (
                        <div className={`d-flex mt-1 ${!isCurrentUser ? 'justify-content-start' : 'justify-content-end'}`}>
                            <i
                                className="fa fa-reply-all text-muted rounded-pill mt-0"
                                style={{
                                    fontSize: '0.7rem',
                                    transform: 'rotate(180deg)',
                                    display: 'inline-block',
                                    padding: '4px'
                                }}
                            ></i>
                            <button
                                className="btn btn-sm p-0 text-primary text-decoration-none fw-bold d-flex align-items-center"
                                style={{ fontSize: '0.75rem', backgroundColor: 'transparent', border: 'none' }}
                                onClick={() => onReply(comment)}
                            >
                                {activeRepliesCount} {activeRepliesCount === 1 ? 'reply' : 'replies'}
                            </button>
                        </div>
                    )
                }
            </div>
            {/* right side avatar */}
            {isCurrentUser && (
                <Avatar
                    profile={comment.commented_by?.profile}
                    first_name={comment.commented_by?.first_name}
                    last_name={comment.commented_by?.last_name}
                    size={32}
                    className="ms-2 align-self-end mb-1"
                />
            )}
            <style>
                {`
                #comment-${comment.id} .message-content p {
                margin-bottom: 0 !important;
                margin-top: 0 !important;
                }

                #comment-${comment.id} .parent-message-content p {
                margin: 0 !important;
                display: inline !important;
                }

                #comment-${comment.id} .parent-message-content img {
                max-height: 35px !important;
                max-width: 35px !important;
                object-fit: cover !important;
                border-radius: 4px !important;
                vertical-align: middle !important;
                margin-left: 5px;
                }
            `}
            </style>
        </div>
    );
};

export default MessageItem;
