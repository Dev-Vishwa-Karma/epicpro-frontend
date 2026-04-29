import React, { Component } from "react";
import Avatar from "../../../common/Avatar";
import TableSkeleton from '../../../common/skeletons/TableSkeleton';
import { formatDateTimeAMPM, shortformatDate } from "../../../../utils";
import InputField from '../../../common/formInputs/InputField';

const ViewConnectModel = ({

    show = false,
    isLoading = false,
    onClose = () => { },
    onChange = {},
    errors = {},
    loading = false,
    employeeData = {},
    selectedConnect = {},
    selectedEmployee = {},
    currentTab = {}

}) => {
    const [filePath, setFilePath] = React.useState(null);
    const [editStatus, setEditStatus] = React.useState(false);
    const [showPreview, setShowPreview] = React.useState(false);
    const user = window.user;
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const formattedDate = shortformatDate(date);
        const formattedTime = formatDateTimeAMPM(dateString);
        return `${formattedDate} ${formattedTime}`;
    };
    const files = selectedConnect.filePath
        ? JSON.parse(selectedConnect.filePath)
        : [];
    let receiver = [];

    if (selectedConnect.receiver) {
        try {
            receiver = typeof selectedConnect.receiver === "string"
                ? JSON.parse(selectedConnect.receiver)
                : selectedConnect.receiver;
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
                                <h5 className="modal-title">View Connects</h5>
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
                                                                profile={`${process.env.REACT_APP_API_URL}/${user.profile}`}
                                                                first_name={user.first_name}
                                                                last_name={user.last_name}
                                                                size={130}
                                                                className="avatar avatar-blue add-space me-2"
                                                                onError={(e) => e.target.src = '/assets/images/sm/avatar2.jpg'}
                                                            />
                                                        </div>
                                                        <h6 className="mt-3 mb-0">{(user?.first_name || '') + ' ' + (user?.last_name || '')}</h6>
                                                        <span>{(user?.email)}</span>

                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="card">
                                            <div className="card-header">
                                                <h3 className="card-title">Connects Details</h3>
                                                <div className="card-options">
                                                </div>
                                            </div>
                                            <div className="card-body">
                                                {isLoading ? <TableSkeleton columns={2} rows={1} /> : <span>{selectedConnect.title}</span>}
                                            </div>
                                        </div>
                                        <div className="card">
                                            <div className="card-header">
                                                <h3 className="card-title">Connects Info</h3>
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
                                                            <p className="mb-0" style={{ height: "180px", overflow: "auto" }} dangerouslySetInnerHTML={{ __html: selectedConnect.body }}></p>
                                                        </li>
                                                        {currentTab === 'receive' && (
                                                            <li className="list-group-item">
                                                                <small className="text-muted">Status: </small>
                                                                <p className="mb-0 d-flex align-items-center justify-content-between" onClick={toggleEditStatus}>
                                                                    <span className={`tag ${selectedConnect.read === '1' ? 'tag-blue' :
                                                                        selectedConnect.read === '0' ? 'tag-red' :
                                                                            selectedConnect.read === 'read' ? 'tag-blue' :
                                                                                selectedConnect.read === 'unread' ? 'tag-red' :
                                                                                    selectedConnect.read === 'ready_to_discuss' ? 'tag-warning' :
                                                                                        selectedConnect.read === 'completed' ? 'tag-danger' : ''
                                                                        }`}
                                                                    >
                                                                        {selectedConnect?.read}
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
                                                                            value={selectedConnect?.read}
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

                                                        {currentTab === 'sent' && Array.isArray(receiver) && receiver.map((connect) => (
                                                            <li className="list-group-item" key={connect.id}>
                                                                <small className="text-muted">Status: </small>

                                                                <p
                                                                    className="mb-0 d-flex align-items-center justify-content-between"
                                                                >
                                                                    <span className={`tag ${connect.read === '1' || connect.read === 'read' ? 'tag-blue' :
                                                                        connect.read === '0' || connect.read === 'unread' ? 'tag-red' :
                                                                            connect.read === 'ready_to_discuss' ? 'tag-warning' :
                                                                                connect.read === 'completed' ? 'tag-danger' : ''
                                                                        }`}>
                                                                        {connect.read}
                                                                    </span>

                                                                    <span>
                                                                        <small className="text-muted">Receiver: </small>

                                                                        {connect.receiver_name}
                                                                </span>
                                                                </p>
                                                            </li>
                                                        ))}

                                                        <li className="list-group-item">
                                                            <small className="text-muted">Type: </small>
                                                            <p className="mb-0">
                                                                <span className="">
                                                                    {selectedConnect.type}
                                                                </span>
                                                            </p>
                                                        </li>
                                                        <li className="list-group-item">
                                                            <small className="text-muted">Sender: </small>
                                                            <p className="mb-0">
                                                                <span className="">
                                                                    {JSON.parse(selectedConnect.sender).name}
                                                                </span>
                                                            </p>
                                                        </li>
                                                        <li className="list-group-item">
                                                            <div className="d-flex justify-content-between">
                                                                <small className="text-muted">Created Data: </small>
                                                                {selectedConnect.created_at && (new Date(selectedConnect.created_at) < new Date()) ? '' : <span className="tag over-due-ticket">New</span>}
                                                            </div>
                                                            <p className="mb-0">{selectedConnect.created_at ? formatDate(selectedConnect.created_at) : '--/--/--'}</p>
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

export default ViewConnectModel;