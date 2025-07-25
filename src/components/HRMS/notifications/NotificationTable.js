import React from 'react';
import NoDataRow from '../../common/NoDataRow';

const NotificationTable = ({ notificationData, onEditClick, onDeleteClick }) => {
    return (
        <div className="table-responsive">
            <table className="table table-striped table-vcenter table-hover mb-0">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Title</th>
                        <th>Body</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Employee</th>
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
                            <td>{notification.type}</td>
                            <td>
                                <span className={`tag ${
                                    notification.read == '1' ? 'tag-blue' :
                                    notification.read == '0' ? 'tag-red' : ''
                                }`}>
                                    {notification.read == '1' ? 'Read' : 'Unread'}
                                </span>
                            </td>
                            <td>
                                <div className="font-15">{notification.full_name}</div>
                            </td>
                            <td>
                                {/* <button
                                    type="button"
                                    className="btn btn-icon"
                                    title="Edit"
                                    data-toggle="modal"
                                    data-target="#editNotificationModal"
                                    onClick={() => onEditClick(notification)}
                                >
                                    <i className="fa fa-edit" />
                                </button> */}
                                <button
                                    type="button"
                                    className="btn btn-icon btn-sm js-sweetalert"
                                    title="Delete"
                                    data-type="confirm"
                                    data-toggle="modal"
                                    data-target="#deleteNotificationModal"
                                    onClick={() => onDeleteClick(notification.id)}
                                >
                                    <i className="fa fa-trash-o text-danger" />
                                </button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <NoDataRow colSpan={7} message="Notifications not found" />
                )}
            </tbody>
            </table>
        </div>
    );
};

export default NotificationTable;
