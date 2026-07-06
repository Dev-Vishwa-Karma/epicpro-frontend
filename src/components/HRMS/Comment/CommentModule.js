import React, { useState, useEffect, useRef } from 'react';
import api from '../../../api/axios';
import authService from '../../Authentication/authService';
import AlertMessages from '../../common/AlertMessages';
import MessageList from './elements/MessageList';
import CommentInput from './elements/CommentInput';
import DeleteModal from '../../common/DeleteModal';
import useComments from './elements/useComments';

const CommentModule = ({ title = 'Comments & Discussions', moduleType, moduleId, maxHeight = '700px' }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [inputText, setInputText] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [editingComment, setEditingComment] = useState(null);
    const [hoveredCommentId, setHoveredCommentId] = useState(null);
    const [activeThreadId, setActiveThreadId] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const currentUser = authService.getUser();
    const chatContainerRef = useRef(null);
    const mainViewScrollPosRef = useRef(0);

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

    const { comments, loading, totalCount, commentsMap } = useComments(moduleType, moduleId, showErrorAlert);

    const prevCommentsLengthRef = useRef(0);
    const prevLoadingRef = useRef(loading);

    useEffect(() => {
        const justFinishedLoading = prevLoadingRef.current && !loading;
        const newCommentAdded = totalCount > prevCommentsLengthRef.current;

        if (justFinishedLoading || newCommentAdded) {
            setTimeout(scrollToBottom, 100);
        }

        prevCommentsLengthRef.current = totalCount;
        prevLoadingRef.current = loading;
    }, [totalCount, loading]);



    const handleSubmit = async (e, attachments = [], existingAttachments = []) => {
        if (e) e.preventDefault();
        if (!(inputText || '').trim() && (!attachments || attachments.length === 0) && (!existingAttachments || existingAttachments.length === 0)) return;

        if (inputText && new Blob([inputText]).size > 10240) {
            showErrorAlert('Text limit of 10240 bytes exceeded.');
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('module_type', moduleType);
            formData.append('module_id', moduleId);
            formData.append('message', inputText);
            formData.append('user_id', currentUser?.employee_id || currentUser?.id);

            if (attachments && attachments.length > 0) {
                attachments.forEach((file, index) => {
                    formData.append(`attachments[${index}]`, file);
                });
            }

            if (editingComment) {
                formData.append('comment_id', editingComment.id);
                formData.append('edit_attachments', '1');
                if (existingAttachments && existingAttachments.length > 0) {
                    existingAttachments.forEach((att) => {
                        formData.append('existing_attachments[]', att.id);
                    });
                }
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
            } else if (activeThreadId) {
                formData.append('parent_comment_id', activeThreadId);
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

    const promptDelete = (commentId) => {
        setCommentToDelete(commentId);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!commentToDelete) return;
        setDeleteLoading(true);
        try {
            const formData = new FormData();
            formData.append('comment_id', commentToDelete);
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
        } finally {
            setDeleteLoading(false);
            setShowDeleteModal(false);
            setCommentToDelete(null);
        }
    };



    const activeThread = activeThreadId ? commentsMap.get(String(activeThreadId)) : null;

    return (
        <div className="card shadow-sm border-0 pe-3 d-flex flex-column h-100" style={{ maxHeight: maxHeight }}>
            {/* Header */}
            <div className="card-header bg-white border-bottom py-3 d-flex align-items-center" style={{ borderRadius: '12px 12px 0 0' }}>
                {activeThreadId && (
                    <button className="btn btn-sm btn-light me-2" onClick={() => {
                        setActiveThreadId(null);
                        setTimeout(() => {
                            if (chatContainerRef.current) {
                                chatContainerRef.current.scrollTop = mainViewScrollPosRef.current;
                            }
                        }, 50);
                    }}>
                        <i className="fa fa-arrow-left"></i>
                    </button>
                )}
                <h6 className="mb-0 fw-bold ml-1">{activeThreadId ? 'Thread' : title}</h6>
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
                    ) : (
                        <MessageList
                            comments={comments}
                            activeThreadId={activeThreadId}
                            activeThread={activeThread}
                            commentsMap={commentsMap}
                            currentUser={currentUser}
                            hoveredCommentId={hoveredCommentId}
                            setHoveredCommentId={setHoveredCommentId}
                            setActiveThreadId={setActiveThreadId}
                            setReplyingTo={setReplyingTo}
                            setEditingComment={setEditingComment}
                            setInputText={setInputText}
                            promptDelete={promptDelete}
                            chatContainerRef={chatContainerRef}
                            mainViewScrollPosRef={mainViewScrollPosRef}
                        />
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

            <DeleteModal
                show={showDeleteModal}
                onClose={() => { setShowDeleteModal(false); setCommentToDelete(null); }}
                onConfirm={confirmDelete}
                isLoading={deleteLoading}
                deleteBody="Are you sure you want to delete this message?"
            />
        </div>
    );
};

export default CommentModule;
