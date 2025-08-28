import React from 'react';
import NoDataRow from '../../../common/NoDataRow';
import Avatar from '../../../common/Avatar';
import Button from '../../../common/formInputs/Button';

const NotificationTable = ({ notificationData, onEditClick, onDeleteClick, userRole }) => {
    const formatType = (type) => {
        if (!type) return '';
        const normalized = String(type).toLowerCase();
        const mapping = {
            'task_completed': 'Task Completed',
            'task_added': 'Task Added',
            'task_due': 'Task Due',
            'event_added': 'Event Added',
        };
        if (mapping[normalized]) return mapping[normalized];
        return String(type)
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase());
    };

    return (
        <div className="table-responsive">
            <table className="table table-striped table-vcenter table-hover mb-0">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Title</th>
                        <th>Body</th>
                        <th>Type</th>
                        {(userRole === "admin" || userRole === "super_admin") && (
                            <th><i className="icon-user" /></th>
                        )}
                        <th>Action</th>
                    </tr>
                </thead>
               <tbody>
                {notificationData.length > 0 ? (
                    notificationData.map((notification, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{notification.title}</td>
                            <td>{notification.body}</td>
                            <td>{formatType(notification.type)}</td>
                            {(userRole === "admin" || userRole === "super_admin") && (
                                <td className="d-flex">
                                    <Avatar
                                    profile={notification.profile}
                                    first_name={notification.full_name ? notification.full_name.split(' ')[0] : ''}
                                    last_name={notification.full_name ? notification.full_name.split(' ')[1] : ''}
                                    size={35}
                                    className="avatar avatar-blue add-space me-2"
                                    style={{
                                        objectFit: 'cover',
                                    }}
                                    onError={(e) => e.target.src = '/assets/images/sm/avatar2.jpg'}
                                    title={notification.full_name || 'User'}
                                    />

                            </td>
                            )}
                            <td>
                                {/* <Button
                                label=""
                                onClick={() => onEditClick(notification)}
                                title="Edit"
                                className="btn-icon"
                                icon="fa fa-edit"
                                />*/}
                            <Button
                            label=""
                            onClick={() => onDeleteClick(notification.id)}
                            title="Delete"
                            className="btn-icon btn-sm js-sweetalert"
                            icon="fa fa-trash-o text-danger"
                            />
                            </td>
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

export default NotificationTable;
