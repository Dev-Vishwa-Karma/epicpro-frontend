export const checkIsCurrentUser = (user1, user2) => {
    if (!user1 || !user2) return false;
    const id1 = String(user1.employee_id || user1.id);
    const id2 = String(user2.employee_id || user2.id);
    return id1 === id2;
};

export const addCommentToTree = (comments, newComment) => {
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

export const editCommentInTree = (comments, updatedComment) => {
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

export const deleteCommentFromTree = (comments, deletedComment) => {
    return comments.map(c => {
        if (String(c.id) === String(deletedComment.id)) {
            return { ...c, ...deletedComment };
        }
        if (c.replies && c.replies.length > 0) {
            return { ...c, replies: deleteCommentFromTree(c.replies, deletedComment) };
        }
        return c;
    });
};

export const getFlatReplies = (replies) => {
    let flat = [];
    const extract = (list) => {
        list.forEach(c => {
            flat.push(c);
            if (c.replies && c.replies.length > 0) extract(c.replies);
        });
    }
    extract(replies);
    flat.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    return flat;
};
