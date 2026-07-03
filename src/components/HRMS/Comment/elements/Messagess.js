import React, { useState } from 'react';
import Avatar from '../../../common/Avatar';

const Messagess = ({ comment, isCurrentUser, parentComment, isParentCurrentUser, onReply, onEdit, onDelete, isHovered, onHover }) => {
    const [showMenu, setShowMenu] = useState(false);
    return (
        <div
            id={`comment-${comment.id}`}
            className={`d-flex mb-3 ${isCurrentUser ? 'justify-content-end' : 'justify-content-start'}`}
            onMouseEnter={onHover}
            onMouseLeave={() => onHover(null)}
        >
            <Avatar
                profile={comment.commented_by?.profile}
                first_name={comment.commented_by?.first_name}
                last_name={comment.commented_by?.last_name}
                size={32}
                className="me-2 align-self-end mb-1"
            />

            <div
                id={`bubble-${comment.id}`}
                className={`position-relative p-2 shadow-sm`}
                style={{
                    maxWidth: '85%',
                    backgroundColor: isCurrentUser ? '#d9fdd3' : '#ffffff',
                    borderRadius: '8px',
                    borderTopRightRadius: isCurrentUser ? '0px' : '8px',
                    borderTopLeftRadius: isCurrentUser ? '8px' : '0px',
                    minWidth: '210px'
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
                        <div className="text-truncate text-muted" style={{ maxWidth: '200px', fontSize: '0.75rem' }} dangerouslySetInnerHTML={{ __html: parentComment.message }}>
                        </div>
                    </div>
                )}

                <div className="message-content" style={{ fontSize: '0.9rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word', paddingBottom: '4px', paddingRight: isCurrentUser ? '15px' : '0' }} dangerouslySetInnerHTML={{ __html: comment.message }}>
                </div>

                <div className="d-flex align-items-center mt-1">
                    {!comment?.deleted_at && (
                        <button
                            className="btn btn-sm btn-link p-0 me-auto text-decoration-none fw-bold"
                            style={{ fontSize: '0.75rem' }}
                            onClick={() => onReply(comment)}
                        >
                            Reply
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
            <style>
                {`
                .message-content p {
                    margin-bottom: 0 !important;
                    margin-top: 0 !important;
                }
                `}
            </style>
        </div>
    );
};

export default Messagess;
