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

export const commonCommentInTree = (comments, updatedComment) => {
    return comments.map(c => {
        if (String(c.id) === String(updatedComment.id)) {
            return { ...c, ...updatedComment };
        }
        if (c.replies && c.replies.length > 0) {
            return { ...c, replies: commonCommentInTree(c.replies, updatedComment) };
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
    flat.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at.replace(' ', 'T')).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at.replace(' ', 'T')).getTime() : 0;
        
        if (dateA && dateB && !isNaN(dateA) && !isNaN(dateB) && dateA !== dateB) {
            return dateA - dateB;
        }
        return parseInt(a.id) - parseInt(b.id);
    });
    return flat;
};

export const mergeCommentTrees = (existingTree, newTree) => {
    const map = new Map();
    
    const extract = (list) => {
        list.forEach(c => {
            const idStr = String(c.id);
            if (!map.has(idStr)) {
                map.set(idStr, { ...c, replies: [] });
            } else {
                const existing = map.get(idStr);
                map.set(idStr, { ...existing, ...c, replies: [] });
            }
            if (c.replies && c.replies.length > 0) {
                extract(c.replies);
            }
        });
    };
    
    extract(existingTree);
    extract(newTree);
    
    const tree = [];
    Array.from(map.values()).forEach(c => {
        const parentId = c.parent_comment_id ? String(c.parent_comment_id) : null;
        if (!parentId || !map.has(parentId)) {
            tree.push(c);
        } else {
            const parent = map.get(parentId);
            parent.replies.push(c);
        }
    });
    
    const sortTree = (list) => {
        list.sort((a, b) => {
            const dateA = a.created_at ? new Date(a.created_at.replace(' ', 'T')).getTime() : 0;
            const dateB = b.created_at ? new Date(b.created_at.replace(' ', 'T')).getTime() : 0;
            
            if (dateA && dateB && !isNaN(dateA) && !isNaN(dateB) && dateA !== dateB) {
                return dateA - dateB;
            }
            return parseInt(a.id) - parseInt(b.id);
        });
        list.forEach(c => {
            if (c.replies && c.replies.length > 0) {
                sortTree(c.replies);
            }
        });
    };
    
    sortTree(tree);
    return tree;
};

