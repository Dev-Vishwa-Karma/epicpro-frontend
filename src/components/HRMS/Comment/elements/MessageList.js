import React from 'react';
import MessageItem from './MessageItem';
import { checkIsCurrentUser, getFlatReplies } from './commentTreeHelpers';

const MessageList = ({
    comments,
    activeThreadId,
    activeThread,
    commentsMap,
    currentUser,
    hoveredCommentId,
    setHoveredCommentId,
    setActiveThreadId,
    setReplyingTo,
    setEditingComment,
    setInputText,
    promptDelete,
    chatContainerRef,
    mainViewScrollPosRef
}) => {
    const renderSingleMessage = (comment, isParent = false, inThreadView = false) => {
        const isCurrentUser = checkIsCurrentUser(currentUser, comment.commented_by);

        let parentComment = null;
        if (comment.parent_comment_id) {
            if (!(activeThreadId && String(comment.parent_comment_id) === String(activeThreadId))) {
                if (!(activeThreadId && String(comment.parent_comment_id) === String(activeThreadId))) {
                    parentComment = commentsMap.get(String(comment.parent_comment_id));
                }
            }
        }

        const isParentCurrentUser = parentComment ? checkIsCurrentUser(currentUser, parentComment.commented_by) : false;

        return (
            <MessageItem
                key={comment.id}
                comment={comment}
                isCurrentUser={isCurrentUser}
                parentComment={parentComment}
                isParentCurrentUser={isParentCurrentUser}
                onReply={(c) => {
                    if (!activeThreadId) {
                        if (chatContainerRef.current) {
                            mainViewScrollPosRef.current = chatContainerRef.current.scrollTop;
                        }
                        setActiveThreadId(c.id);
                        setTimeout(() => {
                            if (chatContainerRef.current) {
                                chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
                            }
                        }, 50);
                    } else {
                        setReplyingTo(c);
                        setEditingComment(null);
                        setInputText('');
                    }
                }}
                onEdit={(c) => {
                    setEditingComment(c);
                    setReplyingTo(null);
                    setInputText(c.message);
                }}
                onDelete={promptDelete}
                isHovered={hoveredCommentId === comment.id}
                onHover={(id = comment.id) => setHoveredCommentId(id)}
                isParent={isParent}
                inThreadView={inThreadView}
            />
        );
    };

    if (comments.length === 0) {
        return (
            <div className="text-center py-4 text-muted">
                <span style={{ fontStyle: 'italic', backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: '10px', display: 'inline-block', padding: '10px 20px' }}>
                    No messages yet. Send a message to start!
                </span>
            </div>
        );
    }

    return (
        <div className="d-flex flex-column">
            {!activeThreadId ? (
                comments.map(comment => renderSingleMessage(comment, false, false))
            ) : activeThread ? (
                <>
                    {renderSingleMessage(activeThread, true, true)}
                    {activeThread.replies && activeThread.replies.length > 0 && (
                        <div className="ps-3 ms-2 mt-2 border-start border-2 w-100">
                            {getFlatReplies(activeThread.replies).map(reply => renderSingleMessage(reply, false, true))}
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-4 text-muted">Thread not found.</div>
            )}
        </div>
    );
};

export default MessageList;
