import React, { useState, useEffect, useRef } from 'react';
import CommentModule from '../HRMS/Comment/CommentModule';
import { getService } from '../../services/getService';
import authService from '../Authentication/authService';
import api from '../../api/axios';
import Avatar from '../common/Avatar';
import './ChatWidget.css';

const CustomDraggable = ({ children }) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const isDragging = useRef(false);
    const dragStartPos = useRef({ x: 0, y: 0 });

    const handleMouseDown = (e) => {
        if (!e.target.closest('.card-header') || e.target.closest('button')) return;
        isDragging.current = true;
        dragStartPos.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        };

        const handleMouseMove = (eMove) => {
            if (!isDragging.current) return;
            setPosition({
                x: eMove.clientX - dragStartPos.current.x,
                y: eMove.clientY - dragStartPos.current.y
            });
        };

        const handleMouseUp = () => {
            isDragging.current = false;
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    return (
        <div
            style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
                position: 'relative',
                zIndex: isDragging.current ? 99999 : 'auto'
            }}
            onMouseDown={handleMouseDown}
        >
            {children}
        </div>
    );
};

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [chatList, setChatList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeChats, setActiveChats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => {
            window.removeEventListener('resize', checkMobile);
        };
    }, []);

    const currentUser = authService.getUser();
    const currentUserId = currentUser?.employee_id || currentUser?.id;

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const fetchChatList = () => {
        api.get(`/chat.php?action=chat-list&user_id=${currentUserId}`)
            .then(res => {
                if (res.data && res.data.status === 'success') {
                    setChatList(res.data.data);
                }
            })
            .catch(err => console.error("Failed to fetch chat list:", err));
    };

    useEffect(() => {
        if (isOpen && employees.length === 0) {
            setLoading(true);
            fetchChatList();
            // Fetch the employee list when the widget is opened
            getService.getCall('get_employees.php', { action: 'view', role: 'employee', status: '1' })
                .then(data => {
                    if (data && data.status === 'success') {
                        setEmployees(Array.isArray(data.data) ? data.data : [data.data]);
                    }
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Failed to fetch employees:", err);
                    setLoading(false);
                });
        }
    }, [isOpen, employees.length]);

    const displayedList = searchTerm.trim() !== ''
        ? employees.filter(emp => `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) && String(emp.id) !== String(currentUserId))
        : chatList;

    const handleEmployeeClick = async (emp) => {
        let chatId = null;
        let chatType = null;
        let chatTitle = null;
        const existingChat = chatList.find(chat => String(chat.id) === String(emp.id));

        if (!existingChat) {
            const formData = new FormData();
            formData.append('sender_id', currentUserId);
            formData.append('receiver_id', emp.id);
            try {
                const res = await api.post('/chat.php?action=create-chat', formData);
                if (res.data && res.data.status === 'success') {
                    chatId = res.data.data.chat_id;
                    chatType = res.data.data.chat_type;
                    chatTitle = res.data.data.chat_title;
                    fetchChatList();
                }
            } catch (err) {
                console.error(err);
            }
        } else {
            chatId = existingChat.chat_id;
            chatType = existingChat.chat_type;
            chatTitle = existingChat.title;
        }

        const chatToAdd = { ...emp, chat_id: chatId, chat_type: chatType, title: chatTitle };

        setActiveChats(prev => {
            const existing = prev.find(c => c.id === chatToAdd.id);
            let updated = prev;
            if (existing) {
                updated = prev.filter(c => c.id !== chatToAdd.id);
                updated.push(existing);
            } else {
                updated = [...prev, chatToAdd];
            }
            if (updated.length > 3) {
                updated = updated.slice(updated.length - 3);
            }
            return updated;
        });
        setSearchTerm('');
    };

    const closeActiveChat = (id) => {
        setActiveChats(prev => prev.filter(c => c.id !== id));
    };

    const getVisibleChatsCount = () => {
        if (isMobile) return 1;
        const width = window.innerWidth;
        const rightOffset = 380; // Main modal (350px) + offset (15px) + gap (15px)
        let count = Math.floor((width - rightOffset) / 415); // 400px width + 15px gap
        if (count < 1) count = 1;
        if (count > 3) count = 3;
        return count;
    };

    const visibleCount = getVisibleChatsCount();
    const visibleChats = activeChats.slice(Math.max(0, activeChats.length - visibleCount));

    return (
        <>
            {/* The Modal */}
            <div className={`chat-widget-modal ${isOpen ? 'open' : 'closed'}`}>
                {isMobile && activeChats.length > 0 ? (
                    <div className="chat-widget-active-body">
                        <CommentModule
                            title={
                                activeChats[0].chat_type === 'direct' ? (
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <Avatar
                                            profile={activeChats[0].profile}
                                            first_name={activeChats[0].first_name}
                                            last_name={activeChats[0].last_name}
                                        />
                                        <div style={{ marginLeft: '10px' }}>
                                            <h6 className="mb-0">{activeChats[0].first_name + ' ' + activeChats[0].last_name}</h6>
                                        </div>
                                    </div>
                                ) : (
                                    activeChats[0].title
                                )
                            }
                            moduleType="chat"
                            moduleId={activeChats[0].chat_id || activeChats[0].id}
                            height="100%"
                            showMedia={false}
                            style={{ backgroundColor: '#434A54', color: '#f7f5f5' }}
                            onClose={() => closeActiveChat(activeChats[0].id)}
                        />
                    </div>
                ) : (
                    <>
                        {/*Header */}
                        <div className="chat-widget-header" onClick={toggleChat}>
                            <div className="chat-widget-title-container">
                                <div style={{ marginRight: '10px', display: 'flex', alignItems: 'center' }}>
                                    <div style={{ borderRadius: '50%', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        <Avatar
                                            profile={currentUser?.profile}
                                            first_name={currentUser?.first_name || 'U'}
                                            last_name={currentUser?.last_name || 'R'}
                                        />
                                    </div>
                                </div>
                                <h5 className="chat-widget-title" style={{ fontSize: '15px' }}>Messaging</h5>
                            </div>
                            <div className="chat-widget-close-btn">
                                <i className={`fa fa-chevron-${isOpen ? 'down' : 'up'}`}></i>
                            </div>
                        </div>

                        <div className="chat-widget-body-container">
                            <div className="chat-widget-body">
                                <div className="chat-widget-search-container">
                                    <input
                                        type="text"
                                        className="form-control chat-widget-search-input"
                                        placeholder="Search employees..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                {loading ? (
                                    <div className="text-center mt-4">
                                        <div className="spinner-border text-info" role="status"></div>
                                        <div className="mt-2 text-muted">Loading...</div>
                                    </div>
                                ) : displayedList.length > 0 ? (
                                    <ul className="list-group list-group-flush chat-widget-list">
                                        {displayedList.map(emp => (
                                            <li
                                                key={emp.id}
                                                className="list-group-item list-group-item-action d-flex align-items-center chat-widget-list-item"
                                                onClick={() => handleEmployeeClick(emp)}
                                            >
                                                <Avatar
                                                    profile={emp.profile}
                                                    first_name={emp.first_name}
                                                    last_name={emp.last_name}
                                                />
                                                <div className="chat-widget-list-item-name">
                                                    <h6 className="mb-0">{emp.first_name + ' ' + emp.last_name}</h6>
                                                </div>
                                                <i className="fa fa-angle-right ml-auto text-muted"></i>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-center mt-4 text-muted">
                                        No chats found. Use search to find employees.
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Active Chat Windows (Desktop Only) */}
            {!isMobile && (
                <div className="chat-widget-active-container">
                    {visibleChats.map((chat) => (
                        <CustomDraggable key={chat.id}>
                            <div className="chat-widget-active-window">
                                <div className="chat-widget-active-body">
                                    <CommentModule
                                        title={
                                            chat.chat_type === 'direct' ? (
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    <Avatar
                                                        profile={chat.profile}
                                                        first_name={chat.first_name}
                                                        last_name={chat.last_name}
                                                    />
                                                    <div style={{ marginLeft: '10px' }}>
                                                        <h6 className="mb-0">{chat.first_name + ' ' + chat.last_name}</h6>
                                                    </div>
                                                </div>
                                            ) : (
                                                chat.title
                                            )
                                        }
                                        moduleType="chat"
                                        moduleId={chat.chat_id || chat.id}
                                        height="100%"
                                        showMedia={false}
                                        style={{ backgroundColor: '#434A54', color: '#f7f5f5' }}
                                        onClose={() => closeActiveChat(chat.id)}
                                    />
                                </div>
                            </div>
                        </CustomDraggable>
                    ))}
                </div>
            )}

        </>
    );
};

export default ChatWidget;
