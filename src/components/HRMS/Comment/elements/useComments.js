import { useState, useEffect, useMemo } from 'react';
import api from '../../../../api/axios';
import Pusher from 'pusher-js';
import { addCommentToTree, commonCommentInTree, mergeCommentTrees } from './commentTreeHelpers';

const useComments = (moduleType, moduleId, showErrorAlert) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const limit = 20;
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const fetchComments = async (silent = false, currentPage = page, reset = false) => {
        try {
            if (!silent && currentPage === 1) setLoading(true);
            if (currentPage > 1) setIsLoadingMore(true);

            const response = await api.get(`/comment.php?action=view&module_type=${moduleType}&module_id=${moduleId}&limit=${limit}&page=${currentPage}`);
            if (response.data.status === 'success') {
                const fetchedData = response.data.data || [];
                
                let fetchedCount = 0;
                const extractCount = (list) => {
                    list.forEach(c => { fetchedCount++; if (c.replies) extractCount(c.replies); });
                };
                extractCount(fetchedData);
                
                if (fetchedCount === 0 || fetchedData.length === 0) {
                    setHasMore(false);
                } else {
                    setHasMore(true); // There might be more, wait for next fetch to confirm or just rely on backend total which we might not have here
                }

                if (reset || currentPage === 1) {
                    setComments(fetchedData);
                } else {
                    setComments(prev => mergeCommentTrees(prev, fetchedData));
                }
            } else {
                showErrorAlert(response.data.message || 'Failed to fetch comments');
            }
        } catch (error) {
            showErrorAlert('Error fetching comments');
        } finally {
            if (!silent && currentPage === 1) setLoading(false);
            if (currentPage > 1) setIsLoadingMore(false);
        }
    };

    const loadMore = () => {
        if (!isLoadingMore && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchComments(true, nextPage, false);
        }
    };

    useEffect(() => {
        if (moduleType && moduleId) {
            setPage(1);
            setHasMore(true);
            fetchComments(false, 1, true);
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
                                return commonCommentInTree(prev, commentObj);
                            } else if (data.action === 'delete') {
                                return commonCommentInTree(prev, commentObj);
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

    useEffect(() => {
        // We handle hasMore internally inside fetchComments based on fetched items count
    }, [totalCount]);

    return {
        comments,
        loading,
        totalCount,
        commentsMap,
        setComments,
        fetchComments,
        hasMore,
        isLoadingMore,
        loadMore
    };
};

export default useComments;
