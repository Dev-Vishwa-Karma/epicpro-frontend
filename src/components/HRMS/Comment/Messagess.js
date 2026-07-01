import React, { useState } from 'react';
import Avatar from '../../common/Avatar';

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
                <div className="mb-1 pe-3" style={{ fontSize: '0.8rem', color: '#128C7E', fontWeight: 'bold' }}>
                    {isCurrentUser ? 'You' : `${comment.commented_by?.first_name} ${comment.commented_by?.last_name}`}
                </div>

                {isCurrentUser && (
                    <div className="position-absolute" style={{ top: '8px', right: '8px', zIndex: 5 }}>
                        <div className="position-relative">
                            <button
                                className="btn btn-sm btn-link p-0 text-muted"
                                style={{ fontSize: '1.2rem', textDecoration: 'none', lineHeight: '0.5' }}
                                onClick={() => setShowMenu(!showMenu)}
                                onBlur={() => setTimeout(() => setShowMenu(false), 200)}
                            >
                                ⋮
                            </button>
                            {showMenu && (
                                <div
                                    className="position-absolute bg-white shadow rounded p-1"
                                    style={{ top: '100%', right: '0', zIndex: 100, minWidth: '80px', border: '1px solid #ddd' }}
                                >
                                    <button
                                        className="btn btn-sm btn-link d-block w-100 text-start p-1 px-2 text-primary text-decoration-none"
                                        style={{ fontSize: '0.8rem' }}
                                        onClick={() => { setShowMenu(false); onEdit(comment); }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn btn-sm btn-link d-block w-100 text-start p-1 px-2 text-danger text-decoration-none"
                                        style={{ fontSize: '0.8rem' }}
                                        onClick={() => { setShowMenu(false); onDelete(comment.id); }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
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

                <div style={{ fontSize: '0.9rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word', paddingBottom: '4px', paddingRight: isCurrentUser ? '15px' : '0' }} dangerouslySetInnerHTML={{ __html: comment.message }}>
                </div>

                <div className="d-flex align-items-center mt-1">
                    <button
                        className="btn btn-sm btn-link p-0 me-auto text-decoration-none fw-bold"
                        style={{ fontSize: '0.75rem' }}
                        onClick={() => onReply(comment)}
                    >
                        Reply
                    </button>

                    <div className="d-flex ml-auto">

                        {comment?.modified_at && (
                            <span
                                className="text-muted"
                                style={{ fontSize: '0.65rem' }}
                            >
                                Edited
                            </span>
                        )}
                        <span
                            className="text-muted ml-1"
                            style={{ fontSize: '0.65rem' }}
                        >
                            {new Date(comment.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Messagess;
