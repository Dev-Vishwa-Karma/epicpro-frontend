import React, { useState, useEffect, useMemo, useRef } from 'react';
import api from '../../../api/axios';
import authService from '../../Authentication/authService';
import AlertMessages from '../../common/AlertMessages';
import Messagess from './Messagess';
import CommentInput from './CommentInput';

export const checkIsCurrentUser = (user1, user2) => {
    if (!user1 || !user2) return false;
    const id1 = String(user1.employee_id || user1.id);
    const id2 = String(user2.employee_id || user2.id);
    return id1 === id2;
};

const CommentModule = ({ moduleType, moduleId, maxHeight = 'calc(100vh - 150px)' }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [inputText, setInputText] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [editingComment, setEditingComment] = useState(null);
    const [hoveredCommentId, setHoveredCommentId] = useState(null);
    const [alert, setAlert] = useState(null);
    const currentUser = authService.getUser();
    const chatContainerRef = useRef(null);

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };

    const fetchComments = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const response = await api.get(`/comment.php?action=view&module_type=${moduleType}&module_id=${moduleId}`);
            if (response.data.status === 'success') {
                setComments(response.data.data || []);
                if (!silent) {
                    setTimeout(scrollToBottom, 100);
                }
            } else {
                setAlert({ type: 'danger', message: response.data.message || 'Failed to fetch comments' });
            }
        } catch (error) {
            setAlert({ type: 'danger', message: 'Error fetching comments' });
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        if (moduleType && moduleId) {
            fetchComments();
        }
        // eslint-disable-next-line
    }, [moduleType, moduleId]);

    // scrolling is handled on fetch

    const flatCommentsData = useMemo(() => {
        let flat = [];
        const map = new Map();
        const extract = (list) => {
            list.forEach(c => {
                flat.push(c);
                map.set(c.id, c);
                map.set(String(c.id), c);
                if (c.replies && c.replies.length > 0) {
                    extract(c.replies);
                }
            });
        };
        extract(comments);
        flat.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        return { flat, map };
    }, [comments]);

    const { flat: flatComments, map: commentsMap } = flatCommentsData;

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!inputText.trim()) return;

        try {
            const formData = new FormData();
            formData.append('module_type', moduleType);
            formData.append('module_id', moduleId);
            formData.append('message', inputText);
            formData.append('user_id', currentUser?.employee_id || currentUser?.id);

            if (editingComment) {
                formData.append('comment_id', editingComment.id);
                const response = await api.post('/comment.php?action=edit', formData);
                if (response.data.status === 'success') {
                    setInputText('');
                    setEditingComment(null);
                    fetchComments(true);
                } else {
                    setAlert({ type: 'danger', message: response.data.message });
                }
                return;
            }

            if (replyingTo) {
                formData.append('parent_comment_id', replyingTo.id);
            }

            const response = await api.post('/comment.php?action=add', formData);
            if (response.data.status === 'success') {
                setInputText('');
                setReplyingTo(null);
                fetchComments(true);
            } else {
                setAlert({ type: 'danger', message: response.data.message });
            }
        } catch (error) {
            setAlert({ type: 'danger', message: 'Error adding comment' });
        }
    };

    const handleDelete = async (commentId) => {
        if (!window.confirm("Are you sure you want to delete this message?")) return;
        try {
            const formData = new FormData();
            formData.append('comment_id', commentId);

            const response = await api.post('/comment.php?action=delete', formData);
            if (response.data.status === 'success') {
                fetchComments(true);
            } else {
                setAlert({ type: 'danger', message: response.data.message });
            }
        } catch (error) {
            setAlert({ type: 'danger', message: 'Error deleting comment' });
        }
    };

    return (
        <div className="card shadow-sm border-0 d-flex flex-column h-100" style={{ minHeight: '400px', maxHeight: maxHeight }}>
            {/* Header */}
            <div className="card-header bg-white border-bottom py-3">
                <h6 className="mb-0 fw-bold">Comments & Discussions</h6>
            </div>

            {/* Chat Body */}
            <div
                className="card-body flex-grow-1 overflow-auto position-relative p-3"
                ref={chatContainerRef}
            >
                <div className="position-relative" style={{ zIndex: 1 }}>
                    {alert && <AlertMessages type={alert.type} message={alert.message} />}

                    {loading ? (
                        <div className="text-center py-4 text-muted">
                            <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                            Loading...
                        </div>
                    ) : flatComments.length === 0 ? (
                        <div className="text-center py-4 text-muted">
                            <span style={{ fontStyle: 'italic', backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: '10px', display: 'inline-block', padding: '10px 20px' }}>
                                No messages yet. Send a message to start!
                            </span>
                        </div>
                    ) : (
                        <div className="d-flex flex-column">
                            {flatComments.map(comment => {
                                const isCurrentUser = checkIsCurrentUser(currentUser, comment.commented_by);
                                const parentComment = comment.parent_comment_id ? commentsMap.get(String(comment.parent_comment_id)) : null;
                                const isParentCurrentUser = parentComment ? checkIsCurrentUser(currentUser, parentComment.commented_by) : false;
                                return (
                                    <Messagess
                                        key={comment.id}
                                        comment={comment}
                                        isCurrentUser={isCurrentUser}
                                        parentComment={parentComment}
                                        isParentCurrentUser={isParentCurrentUser}
                                        onReply={(c) => {
                                            setReplyingTo(c);
                                            setEditingComment(null);
                                            setInputText('');
                                        }}
                                        onEdit={(c) => {
                                            setEditingComment(c);
                                            setReplyingTo(null);
                                            setInputText(c.message);
                                        }}
                                        onDelete={handleDelete}
                                        isHovered={hoveredCommentId === comment.id}
                                        onHover={(id = comment.id) => setHoveredCommentId(id)}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer / Input Area */}
            <CommentInput
                inputText={inputText}
                setInputText={setInputText}
                handleSubmit={handleSubmit}
                editingComment={editingComment}
                setEditingComment={setEditingComment}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                currentUser={currentUser}
            />
        </div>
    );
};

export default CommentModule;
