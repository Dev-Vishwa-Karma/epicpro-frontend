import React, { useState } from 'react';
import NoDataRow from '../../../common/NoDataRow';
import Avatar from '../../../common/Avatar';
import Button from '../../../common/formInputs/Button';
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";

const NotifyUsersTable = ({ notificationData, onRemoveClick, userRole, onRecordClick, filterNotification, currentTab, handleEditNotification }) => {
    const onViewReceivers = (notification) => {
    try {
        return typeof notification.receiver === "string"
            ? JSON.parse(notification.receiver)
            : notification.receiver || [];
    } catch {
        return [];
    }
};
    return (
        <div className="table-responsive">
            <table className="table table-striped table-vcenter table-hover mb-0">
                <thead>
                    <tr>
                        <th></th>
                        <th>Title</th>
                        <th>Body</th>
                        <th>Type</th>
                        {(currentTab === 'receive') && (
                            <>
                                <th>Status</th>
                                <th>Sender</th>
                            </>
                        )}
                        <th>Actions</th>

                    </tr>
                </thead>
                <tbody>
                    {notificationData.length > 0 ? (
                        notificationData.map((notification, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>
                                    {/* {notification.title} */}
                                    <span
                                        style={currentTab !== 'draft' ? { cursor: "pointer", color: "#007bff" } : {}}
                                        onClick={() => { onRecordClick(notification); }}
                                    >
                                        {notification.title}

                                    </span>
                                    <div className="text-muted d-flex align-items-center gap-2">
                                            <div className="tag-wrapper">
                                                Priority:
                                                <span
                                                    className={`tag mx-1 small ${
                                                        notification.priority === "high"
                                                            ? "tag-danger"
                                                            : notification.priority === "medium"
                                                            ? "tag-warning"
                                                            : "tag-success"
                                                    }`}
                                                >
                                                    {notification.priority}
                                                </span>

                                                <div className="tooltip-box">
                                                    Priority: {notification.priority}
                                                </div>
                                            </div>
                                        </div>
                                </td>
                                <td dangerouslySetInnerHTML={{ __html: notification.body }}></td>
                                <td>{notification.type}</td>

                                {currentTab === "receive" && (
                                    <td>
                                        <span
                                            className={`tag ${notification.read === '1' ? 'tag-blue' :
                                                notification.read === '0' ? 'tag-red' :
                                                    notification.read === 'read' ? 'tag-blue' :
                                                        notification.read === 'unread' ? 'tag-red' :
                                                            notification.read === 'ready_to_discuss' ? 'tag-warning' :
                                                                notification.read === 'completed' ? 'tag-danger' : ''
                                                }`}>
                                            {notification.read === '1' ? 'read' : notification.read === '0' ? 'unread' : notification.read}
                                        </span>
                                    </td>
                                )}

                                {/* {(userRole === "admin" || userRole === "super_admin") && ( */}
                                {currentTab === "receive" && (
                                    <td className="d-flex">
                                        <Avatar
                                            profile={notification.profile}
                                            size={35}
                                            alt={notification.sender ? JSON.parse(notification.sender).name: ''}
                                            className="avatar avatar-blue add-space me-2"
                                            style={{
                                                objectFit: 'cover',
                                            }}
                                            onError={(e) => e.target.src = '/assets/images/sm/avatar2.jpg'}
                                            title={JSON.parse(notification.sender).name || 'User'}
                                        />
                                    </td>
                                )}


                                {currentTab === "sent" && (
                                    <td>
                                        <Popup
                                            trigger={
                                                <i
                                                    className="fa fa-info-circle text-danger"
                                                    style={{ cursor: "pointer" }}
                                                />
                                            }
                                            position="right center"
                                            on="hover"
                                            mouseEnterDelay={0}
                                            mouseLeaveDelay={200}
                                            closeOnDocumentClick
                                            overlayStyle={{ background: "transparent" }}
                                            contentStyle={{
                                                background: "rgba(0, 0, 0, 0.75)",  
                                                color: "#fff",
                                                backdropFilter: "blur(6px)",        
                                                WebkitBackdropFilter: "blur(6px)",  
                                                padding: "10px",
                                                borderRadius: "6px",
                                                width: "220px",
                                                maxHeight: "200px",
                                                overflowY: "auto",
                                                boxShadow: "0 4px 15px rgba(0,0,0,0.4)",
                                                border: "1px solid rgba(255,255,255,0.1)"
                                            }}
                                        >
                                            {() => {
                                                const receivers = onViewReceivers(notification);

                                                return (
                                                    <div>
                                                        <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
                                                            Receivers
                                                        </div>

                                                        {receivers.length > 0 ? (
                                                            receivers.map((rec, i) => (
                                                                <div key={i} style={{ marginBottom: "6px" }}>
                                                                    <strong>{rec.receiver_name}</strong>

                                                                    <div>
                                                                        <span
                                                                            className={`tag ${
                                                                                rec.read === 'completed'
                                                                                    ? 'tag-danger'
                                                                                    : rec.read === 'ready_to_discuss'
                                                                                    ? 'tag-warning'
                                                                                    : rec.read === 'read'
                                                                                    ? 'tag-blue'
                                                                                    : 'tag-red'
                                                                            }`}
                                                                        >
                                                                            {rec.read}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div>No receivers</div>
                                                        )}
                                                    </div>
                                                );
                                            }}
                                        </Popup>
                                    </td>
                                )}

                                {(currentTab === "draft") && (
                                    <td>
                                        <Button
                                        icon="fa fa-edit"
                                        onClick={() => handleEditNotification(notification)}
                                        className="btn-icon"
                                        title="Edit"
                                        />
                                    </td>
                                )}

                                {(currentTab === "receive") && (
                                    <td>
                                        <Button
                                            label=""
                                            onClick={() => onRemoveClick(notification)}
                                            title={notification.hidden ? "Unhide" : "Hide"}
                                            className="btn-icon btn-sm js-sweetalert"
                                            icon={
                                                notification.hidden
                                                    ? "fa fa-eye text-success"      // Unhide icon
                                                    : "fa fa-eye-slash text-danger" // Hide icon
                                            }
                                        />
                                    </td>
                                )}

                            </tr>
                        ))
                    ) : (
                        <NoDataRow colSpan={userRole === "admin" || userRole === "super_admin" ? 7 : 6} message="Notifications not found" />
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default NotifyUsersTable;