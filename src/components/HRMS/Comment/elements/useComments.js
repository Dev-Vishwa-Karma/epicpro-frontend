import { useState, useEffect, useMemo } from 'react';
import api from '../../../../api/axios';
import Pusher from 'pusher-js';
import { addCommentToTree, editCommentInTree, deleteCommentFromTree } from './commentTreeHelpers';

const useComments = (moduleType, moduleId, showErrorAlert) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);

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
                if (data.status === 'success') {
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
                                return deleteCommentFromTree(prev, commentObj);
                            }
                            return prev;
                        });
                    } else {
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

    const { totalCount, commentsMap } = useMemo(() => {
        const map = new Map();
        let totalCount = 0;
        const extract = (list) => {
            list.forEach(c => {
                totalCount++;
                map.set(c.id, c);
                map.set(String(c.id), c);
                if (c.replies && c.replies.length > 0) {
                    extract(c.replies);
                }
            });
        };
        extract(comments);
        return { totalCount, commentsMap: map };
    }, [comments]);

    return {
        comments,
        loading,
        totalCount,
        commentsMap,
        setComments,
        fetchComments
    };
};

export default useComments;
