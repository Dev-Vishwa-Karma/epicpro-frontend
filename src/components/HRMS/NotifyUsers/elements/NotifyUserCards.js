import React from 'react';
import NoDataRow from '../../../common/NoDataRow';
import { Priority, Status, Type, Receivers } from './NotifyUtility';
import Button from '../../../common/formInputs/Button';

const NotifyUserCards = ({ notificationData = [], onRecordClick, currentTab, handleEditNotification, loading, onSubmit }) => {

    return (
        <div className="notification-container">
            {notificationData.length === 0 ? (
                <div>No Data Found</div>
            ) : (
                notificationData.map((notification) => (
                    <div
                        key={notification.id}
                        className={`custom-card ${notification.priority}`}
                    >

                        <div className="custom-card-header">
                            {notification.title || "Untitled"}
                        </div>

                        <div className="custom-card-meta">
                            {notification.body || "No description"}
                        </div>

                        {(currentTab === 'receive') && (
                            <div className="custom-card-description">
                                Sender: {JSON.parse(notification.sender).name || "No sender information"}
                            </div>
                        )}

                        {(currentTab !== 'receive') && (
                            <div className="custom-card-description">
                                Receiver: <Receivers receivers={notification.receiver} />
                            </div>
                        )}


                        <div className="custom-card-footer">
                            <div className="footer-left">
                                <Type type={notification.type} />
                                <Priority priority={notification.priority} />
                            </div>

                            {currentTab !== "draft" && (
                                <span
                                    onClick={() => onRecordClick(notification)}
                                    style={{ color: 'blue', textDecoration: 'none', cursor: 'pointer' }}>View</span>
                            )}

                            {currentTab === "draft" && (
                                <div>
                                    <Button
                                        label="Edit"
                                        onClick={() => {
                                            handleEditNotification(notification);
                                        }}
                                        className="btn-primary ml-1"
                                    />
                                    <Button
                                        label="Send"
                                        onClick={() => {
                                            onSubmit('sent');
                                        }}
                                        loading={loading}
                                        className="btn-primary ml-1"
                                    />
                                </div>
                            )}
                        </div>

                    </div>
                ))
            )}
        </div>
    );
};

export default NotifyUserCards;