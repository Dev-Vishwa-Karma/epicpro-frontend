import React, { useState, useEffect, useMemo, useRef } from 'react';
import api from '../../../api/axios';
import authService from '../../Authentication/authService';
import AlertMessages from '../../common/AlertMessages';
import Messagess from './elements/Messagess';
import Pusher from 'pusher-js';
import CommentInput from './elements/CommentInput';

export const checkIsCurrentUser = (user1, user2) => {
    if (!user1 || !user2) return false;
    const id1 = String(user1.employee_id || user1.id);
    const id2 = String(user2.employee_id || user2.id);
    return id1 === id2;
};

const addCommentToTree = (comments, newComment) => {
    if (!newComment.parent_comment_id) {
        return [...comments, newComment];
    }
    return comments.map(c => {
        if (String(c.id) === String(newComment.parent_comment_id)) {
            return { ...c, replies: [...(c.replies || []), newComment] };
        }
        if (c.replies && c.replies.length > 0) {
            return { ...c, replies: addCommentToTree(c.replies, newComment) };
        }
        return c;
    });
};

const editCommentInTree = (comments, updatedComment) => {
    return comments.map(c => {
        if (String(c.id) === String(updatedComment.id)) {
            return { ...c, ...updatedComment };
        }
        if (c.replies && c.replies.length > 0) {
            return { ...c, replies: editCommentInTree(c.replies, updatedComment) };
        }
        return c;
    });
};

const deleteCommentFromTree = (comments, commentId) => {
    return comments.filter(c => String(c.id) !== String(commentId)).map(c => {
        if (c.replies && c.replies.length > 0) {
            return { ...c, replies: deleteCommentFromTree(c.replies, commentId) };
        }
        return c;
    });
};

const CommentModule = ({ moduleType, moduleId, maxHeight = '700px' }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [inputText, setInputText] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [editingComment, setEditingComment] = useState(null);
    const [hoveredCommentId, setHoveredCommentId] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const currentUser = authService.getUser();
    const chatContainerRef = useRef(null);

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };

    const showSuccessAlert = (msg) => {
        setSuccessMessage(msg);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const showErrorAlert = (msg) => {
        setErrorMessage(msg);
        setShowError(true);
        setTimeout(() => setShowError(false), 3000);
    };

    const fetchComments = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const response = await api.get(`/comment.php?action=view&module_type=${moduleType}&module_id=${moduleId}`);
            if (response.data.status === 'success') {
                setComments(response.data.data || []);
            } else {
                showErrorAlert(response.data.message || 'Failed to fetch comments');
            }
        } catch (error) {
            showErrorAlert('Error fetching comments');
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        if (moduleType && moduleId) {
            fetchComments();
        }
        // Initialize Pusher
        if (process.env.REACT_APP_PUSHER_KEY) {
            const pusher = new Pusher(process.env.REACT_APP_PUSHER_KEY, {
                cluster: process.env.REACT_APP_PUSHER_CLUSTER
            });

            const channel = pusher.subscribe(process.env.REACT_APP_PUSHER_CHANNEL);
            const eventName = `comment_updated_${moduleType}_${moduleId}`;

            channel.bind(eventName, (data) => {
                console.log('Event received:', eventName, data);
                if (data.status === 'success') {
                    // Use Pusher data to update state instead of fetching from API
                    if (data.data && Array.isArray(data.data)) {
                        setComments(data.data);
                    } else if (Array.isArray(data)) {
                        setComments(data);
                    } else if (data.action) {
                        setComments(prev => {
                            const commentObj = data.comment || data.data;
                            if (data.action === 'add' && commentObj) {
                                return addCommentToTree(prev, commentObj);
                            } else if (data.action === 'edit' && commentObj) {
                                return editCommentInTree(prev, commentObj);
                            } else if (data.action === 'delete') {
                                const id = data.comment_id || data.id || (commentObj ? commentObj.id : null);
                                if (id) return deleteCommentFromTree(prev, id);
                            }
                            return prev;
                        });
                    } else {
                        // Fallback removed to prevent API execution as requested
                        console.log('Pusher event received but format not recognized. Payload:', data);
                    }
                }
            });

            return () => {
                channel.unbind(eventName);
                pusher.unsubscribe(process.env.REACT_APP_PUSHER_CHANNEL);
            };
        }
        // eslint-disable-next-line
    }, [moduleType, moduleId]);



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

    const prevFlatCommentsLengthRef = useRef(0);
    const prevLoadingRef = useRef(loading);

    useEffect(() => {
        const justFinishedLoading = prevLoadingRef.current && !loading;
        const newCommentAdded = flatComments.length > prevFlatCommentsLengthRef.current;

        if (justFinishedLoading || newCommentAdded) {
            setTimeout(scrollToBottom, 100);
        }

        prevFlatCommentsLengthRef.current = flatComments.length;
        prevLoadingRef.current = loading;
    }, [flatComments.length, loading]);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!inputText.trim()) return;

        setIsSubmitting(true);
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
                    showSuccessAlert('Comment updated successfully');
                } else {
                    showErrorAlert(response.data.message);
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
                showSuccessAlert('Comment added successfully');
            } else {
                showErrorAlert(response.data.message);
            }
        } catch (error) {
            showErrorAlert('Error adding comment');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (commentId) => {
        if (!window.confirm("Are you sure you want to delete this message?")) return;
        try {
            const formData = new FormData();
            formData.append('comment_id', commentId);
            formData.append('module_type', moduleType);
            formData.append('module_id', moduleId);

            const response = await api.post('/comment.php?action=delete', formData);
            if (response.data.status === 'success') {
                showSuccessAlert('Comment deleted successfully');
            } else {
                showErrorAlert(response.data.message);
            }
        } catch (error) {
            showErrorAlert('Error deleting comment');
        }
    };

    return (
        <div className="card shadow-sm border-0 pe-3 d-flex flex-column h-100" style={{ maxHeight: maxHeight }}>
            {/* Header */}
            <div className="card-header bg-white border-bottom py-3" style={{ borderRadius: '12px 12px 0 0' }}>
                <h6 className="mb-0 fw-bold">Comments & Discussions</h6>
            </div>

            {/* Chat Body */}
            <div
                className="card-body flex-grow-1 overflow-auto position-relative p-3 custom-scrollbar"
                ref={chatContainerRef}
            >
                <div className="position-relative" style={{ zIndex: 1 }}>
                    <AlertMessages
                        showSuccess={showSuccess}
                        successMessage={successMessage}
                        showError={showError}
                        errorMessage={errorMessage}
                        setShowSuccess={setShowSuccess}
                        setShowError={setShowError}
                    />

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
                isSubmitting={isSubmitting}
            />
        </div>
    );
};

export default CommentModule;
