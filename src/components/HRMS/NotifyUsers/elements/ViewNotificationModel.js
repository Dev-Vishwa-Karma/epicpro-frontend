import React, { Component } from "react";
import Avatar from "../../../common/Avatar";
import TableSkeleton from '../../../common/skeletons/TableSkeleton';
import { formatDateTimeAMPM, shortformatDate } from "../../../../utils";
import InputField from '../../../common/formInputs/InputField';

const ViewNotificationModel = ({

    show = false,
    isLoading = false,
    onClose = () => { },
    onChange = {},
    errors = {},
    loading = false,
    employeeData = {},
    selectedNotification = {},
    selectedEmployee = {},
    currentTab = {}

}) => {
    const [filePath, setFilePath] = React.useState(null);
    const [editStatus, setEditStatus] = React.useState(false);
    const [showPreview, setShowPreview] = React.useState(false);
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const formattedDate = shortformatDate(date);
        const formattedTime = formatDateTimeAMPM(dateString);
        return `${formattedDate} ${formattedTime}`;
    };
    const files = selectedNotification.filePath
        ? JSON.parse(selectedNotification.filePath)
        : [];
    let receiver = [];

    if (selectedNotification.receiver) {
        try {
            receiver = typeof selectedNotification.receiver === "string"
                ? JSON.parse(selectedNotification.receiver)
                : selectedNotification.receiver;
        } catch (e) {
            receiver = [];
        }
    }

    const getExt = (file) => file.split('.').pop().toLowerCase();

    const isImage = (ext) =>
        ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);

    const isText = (ext) =>
        ['txt', 'log', 'csv'].includes(ext);

    const getFileIcon = (ext) => {
        switch (ext) {
            case "pdf": return "fa fa-file-pdf-o text-danger";
            case "zip":
            case "rar": return "fa fa-file-archive-o text-warning";
            case "csv": return "fa fa-file-excel-o text-success";
            default: return "fa fa-file-o text-muted";
        }
    };

    const goToFile = (file, index) => {
        const ext = getExt(file);
        const url = `${process.env.REACT_APP_API_URL}/${file}`;
        if (isImage(ext)) {
            setShowPreview(prev => !prev);
            setFilePath(file);
        } else {
            window.open(`${process.env.REACT_APP_API_URL}/${file}`, "_blank");
        }
    }
    const toggleEditStatus = () => {
        setEditStatus(prev => !prev);
    };

    if (!show) return null;
    return (
        <>
            {show && (

                <div className="modal fade show d-block" id={1} tabIndex={-1} role="dialog" aria-modal="true">
                    <div className="modal-dialog modal-dialog-scrollable modal-xxl" role="document">
                        <div className="modal-content section-body" style={{ maxHeight: "90vh" }}>
                            <div className="modal-header">
                                <h5 className="modal-title">View Notification</h5>
                                <button type="button" className="close" onClick={onClose}><span aria-hidden="true">×</span></button>
                            </div>
                            <div className="container-fluid" style={{ overflowY: "auto" }}>
                                <div className="row clearfix">
                                    <div className="col-lg-4 col-md-12">

                                        <div className="card c_grid c_yellow">
                                            <div className="card-body text-center">
                                                {isLoading ? (
                                                    <>
                                                        <div className="mb-3"><TableSkeleton columns={1} rows={1} /></div>
                                                        <div className="mb-2"><TableSkeleton columns={2} rows={1} /></div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="circle">
                                                            <Avatar
                                                                profile={`${process.env.REACT_APP_API_URL}/${selectedEmployee.profile}`}
                                                                first_name={selectedEmployee.first_name}
                                                                last_name={selectedEmployee.last_name}
                                                                size={130}
                                                                className="avatar avatar-blue add-space me-2"
                                                                onError={(e) => e.target.src = '/assets/images/sm/avatar2.jpg'}
                                                            />
                                                        </div>
                                                        <h6 className="mt-3 mb-0">{(selectedEmployee?.first_name || '') + ' ' + (selectedEmployee?.last_name || '')}</h6>
                                                        <span>{(selectedEmployee?.email)}</span>

                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="card">
                                            <div className="card-header">
                                                <h3 className="card-title">Notification Details</h3>
                                                <div className="card-options">
                                                </div>
                                            </div>
                                            <div className="card-body">
                                                {isLoading ? <TableSkeleton columns={2} rows={1} /> : <span>{selectedNotification.title}</span>}
                                            </div>
                                        </div>
                                        <div className="card">
                                            <div className="card-header">
                                                <h3 className="card-title">Notification Info</h3>
                                                <div className="card-options">
                                                </div>
                                            </div>
                                            <div className="card-body">
                                                {isLoading ? (
                                                    <TableSkeleton columns={3} rows={4} />
                                                ) : (
                                                    <ul className="list-group" style={{ height: "500px", overflow: "aito" }}>
                                                        <li className="list-group-item">
                                                            <small className="text-muted">Description: </small>
                                                            <p className="mb-0" style={{ height: "180px", overflow: "auto" }} dangerouslySetInnerHTML={{ __html: selectedNotification.body }}></p>
                                                        </li>
                                                        {currentTab === 'receive' && (
                                                            <li className="list-group-item">
                                                                <small className="text-muted">Status: </small>
                                                                <p className="mb-0 d-flex align-items-center justify-content-between" onClick={toggleEditStatus}>
                                                                    <span className={`tag ${selectedNotification.read === '1' ? 'tag-blue' :
                                                                        selectedNotification.read === '0' ? 'tag-red' :
                                                                            selectedNotification.read === 'read' ? 'tag-blue' :
                                                                                selectedNotification.read === 'unread' ? 'tag-red' :
                                                                                    selectedNotification.read === 'ready_to_discuss' ? 'tag-warn' :
                                                                                        selectedNotification.read === 'completed' ? 'tag-success' : ''
                                                                        }`}
                                                                    >
                                                                        {selectedNotification?.read}
                                                                    </span>
                                                                    <span>
                                                                        <i className="fa fa-pencil" />
                                                                    </span>
                                                                </p>
                                                                {editStatus && (
                                                                    <div>
                                                                        <InputField
                                                                            label="Status"
                                                                            name="status"
                                                                            type="select"
                                                                            value={selectedNotification?.read}
                                                                            // onChange={onChange}
                                                                            onChange={(e) => {
                                                                                onChange(e);
                                                                                setEditStatus(false);
                                                                            }}
                                                                            options={[
                                                                                { value: "unread", label: "Unread" },
                                                                                { value: "read", label: "Read" },
                                                                                { value: "ready_to_discuss", label: "Ready To Discuss" },
                                                                                { value: "completed", label: "Completed" },
                                                                            ]}
                                                                        />
                                                                    </div>
                                                                )}
                                                            </li>
                                                        )}

                                                        {currentTab === 'sent' && Array.isArray(receiver) && receiver.map((notification) => (
                                                            <li className="list-group-item" key={notification.id}>
                                                                <small className="text-muted">Status: </small>

                                                                <p
                                                                    className="mb-0 d-flex align-items-center justify-content-between"
                                                                >
                                                                    <span className={`tag ${notification.read === '1' || notification.read === 'read' ? 'tag-blue' :
                                                                        notification.read === '0' || notification.read === 'unread' ? 'tag-red' :
                                                                            notification.read === 'ready_to_discuss' ? 'tag-warn' :
                                                                                notification.read === 'completed' ? 'tag-success' : ''
                                                                        }`}>
                                                                        {notification.read}
                                                                    </span>

                                                                    <span>
                                                                        <small className="text-muted">Receiver: </small>

                                                                        {notification.receiver_name}
                                                                </span>
                                                                </p>
                                                            </li>
                                                        ))}

                                                        <li className="list-group-item">
                                                            <small className="text-muted">Type: </small>
                                                            <p className="mb-0">
                                                                <span className="">
                                                                    {selectedNotification.type}
                                                                </span>
                                                            </p>
                                                        </li>
                                                        <li className="list-group-item">
                                                            <small className="text-muted">Sender: </small>
                                                            <p className="mb-0">
                                                                <span className="">
                                                                    {selectedNotification.sender_name}
                                                                </span>
                                                            </p>
                                                        </li>
                                                        <li className="list-group-item">
                                                            <div className="d-flex justify-content-between">
                                                                <small className="text-muted">Created Data: </small>
                                                                {selectedNotification.created_at && (new Date(selectedNotification.created_at) < new Date()) ? '' : <span className="tag over-due-ticket">New</span>}
                                                            </div>
                                                            <p className="mb-0">{selectedNotification.created_at ? formatDate(selectedNotification.created_at) : '--/--/--'}</p>
                                                        </li>


                                                    </ul>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-lg-8 col-md-12">

                                        <div className="card mb-0">
                                            <div className="card-header">
                                                <h3 className="card-title">Attached Files</h3>
                                            </div>
                                        </div>
                                        <div className="table-responsive">
                                            <table className="table table-hover table-vcenter mb-0 table_custom spacing8 text-nowrap">
                                                <thead>
                                                    <tr>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {files.length > 0 ? (
                                                        files.map((file, index) => {
                                                            const ext = getExt(file);
                                                            const isImg = isImage(ext);
                                                            const fileName = file.split('/').pop();

                                                            return (
                                                                <tr key={index}>
                                                                    <td>{index + 1}</td>

                                                                    {/* ICON / THUMBNAIL */}
                                                                    <td>
                                                                        {isImg ? (
                                                                            <img
                                                                                src={`${process.env.REACT_APP_API_URL}/${file}`}
                                                                                alt={fileName}
                                                                                style={{
                                                                                    width: "45px",
                                                                                    height: "45px",
                                                                                    objectFit: "cover",
                                                                                    borderRadius: "6px",
                                                                                    border: "1px solid #ddd"
                                                                                }}
                                                                            />
                                                                        ) : (
                                                                            <i
                                                                                className={getFileIcon(ext)}
                                                                                style={{ fontSize: "22px" }}
                                                                            />
                                                                        )}
                                                                    </td>

                                                                    {/* FILE NAME */}
                                                                    <td style={{ maxWidth: "250px" }}>
                                                                        <span title={fileName}>
                                                                            {fileName}
                                                                        </span>
                                                                    </td>

                                                                    {/* ACTION */}
                                                                    <td>
                                                                        {isImg ? (
                                                                            <button
                                                                                className="btn btn-sm btn-info"
                                                                                onClick={() => goToFile(file, index)}
                                                                            >
                                                                                <i className="fa fa-eye" /> View
                                                                            </button>
                                                                        ) : (
                                                                            <a
                                                                                href={`${process.env.REACT_APP_API_URL}/${file}`}
                                                                                download
                                                                                className="btn btn-sm btn-primary"
                                                                            >
                                                                                <i className="fa fa-download" /> Download
                                                                            </a>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="4" className="text-center">
                                                                No files found
                                                            </td>
                                                        </tr>
                                                    )}

                                                </tbody>
                                            </table>
                                        </div>
                                        {/* </div> */}

                                        <div className="card">
                                            <div className="card-header">
                                                <h3 className="card-title">Preview:</h3>
                                            </div>
                                            <div className="card-body" style={{
                                                height: "486px",
                                                overflow: "auto"
                                            }}>
                                                {showPreview && filePath && isImage(getExt(filePath)) && (
                                                    <img
                                                        src={`${process.env.REACT_APP_API_URL}/${filePath}`}
                                                        alt="preview"
                                                        style={{ width: "450px", height: "450px", objectFit: "contain" }}
                                                    />
                                                )}

                                                {filePath && !isImage(getExt(filePath)) && (
                                                    <a
                                                        href={`${process.env.REACT_APP_API_URL}/${filePath}`}
                                                        download
                                                        className="btn btn-primary"
                                                    >
                                                        Download File
                                                    </a>
                                                )}

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            )}
            {show && <div className="modal-backdrop fade show" />}
        </>
    );

};

export default ViewNotificationModel;