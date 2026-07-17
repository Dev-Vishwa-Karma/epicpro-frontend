import { getFileUrl } from '../../../../utils';
import React, { Component } from "react";
import Avatar from "../../../common/Avatar";
import TableSkeleton from '../../../common/skeletons/TableSkeleton';
import { formatDateTimeAMPM, shortformatDate } from "../../../../utils";
import InputField from '../../../common/formInputs/InputField';
import CommentModule from "../../Comment/CommentModule";
import ImagePreview from "../../../common/ImagePreview";

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
        const url = getFileUrl(file);
        if (isImage(ext)) {
            if (filePath === file && showPreview) {
                setShowPreview(false);
                setFilePath(null);
            } else {
                setFilePath(file);
                setShowPreview(true);
            }
        } else {
            window.open(getFileUrl(file), "_blank");
        }
    }
    const toggleEditStatus = () => {
        setEditStatus(prev => !prev);
    };

    if (!show) return null;
    return (
        <>
            {show && (

                <div className="modal fade show d-block full-modal-mobile" id={1} tabIndex={-1} role="dialog" aria-modal="true">
                    <div className="modal-dialog modal-dialog-scrollable modal-xxl" role="document">
                        <div className="modal-content section-body" style={{ maxHeight: "90vh" }}>
                            <div className="modal-header">
                                <h5 className="modal-title" style={{ display: "flex", alignItems: "center" }}>
                                    <span style={{ fontSize: "18px", fontWeight: "500", color: "#6e7687" }}>
                                        Connect - #{selectedConnect.id} : {selectedConnect.title}
                                    </span>
                                </h5>
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
                                                                profile={getFileUrl(user.profile)}
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
                                                    <ul className="list-group" style={{ overflow: "aito" }}>
                                                        <li className="list-group-item">
                                                            <small className="text-muted">Description: </small>
                                                            <p className="mb-0" style={{ height: "180px", overflow: "auto" }} dangerouslySetInnerHTML={{ __html: selectedConnect.body }}></p>
                                                        </li>
                                                        {currentTab === 'receive' && (
                                                            <li className="list-group-item">
                                                                <div className="mb-0 d-flex align-items-center justify-content-between">
                                                                    <div className="d-flex align-items-center">
                                                                        <small className="text-muted me-2">Status: </small>
                                                                        {!editStatus ? (
                                                                            <span
                                                                                className={`ml-1 tag ${selectedConnect?.read === "1" || selectedConnect?.read === "read"
                                                                                    ? "tag-blue"
                                                                                    : selectedConnect?.read === "0" || selectedConnect?.read === "unread"
                                                                                        ? "tag-red"
                                                                                        : selectedConnect?.read === "ready_to_discuss"
                                                                                            ? "tag-warning"
                                                                                            : selectedConnect?.read === "completed"
                                                                                                ? "tag-danger"
                                                                                                : ""
                                                                                    }`}
                                                                            >
                                                                                {selectedConnect?.read === '1' || selectedConnect?.read === 'read' ? 'Read' : selectedConnect?.read === '0' || selectedConnect?.read === 'unread' ? 'Unread' : selectedConnect?.read === 'ready_to_discuss' ? 'Ready To Discuss' : selectedConnect?.read === 'completed' ? 'Completed' : selectedConnect?.read}
                                                                            </span>
                                                                        ) : (
                                                                            <div className="ml-2">
                                                                                <InputField
                                                                                    name="status"
                                                                                    type="select"
                                                                                    containerClassName="mb-0"
                                                                                    value={selectedConnect?.read}
                                                                                    onChange={(e) => {
                                                                                        onChange(e);
                                                                                        setEditStatus(false); // Hide dropdown after selecting
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
                                                                    </div>
                                                                    <i className="fa fa-pencil" onClick={toggleEditStatus} style={{ cursor: "pointer" }} />
                                                                </div>
                                                            </li>
                                                        )}

                                                        {currentTab === "sent" && Array.isArray(receiver) && receiver.length > 0 && (
                                                            <li className="list-group-item">
                                                                <div className="connect-table-container table-responsive">

                                                                    <table className="table table-sm table-borderless">
                                                                        <thead>
                                                                            <tr>
                                                                                <th className="w-50"><small className="text-muted">Status</small></th>
                                                                                <th className="w-50"><small className="text-muted">Receiver</small></th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {receiver.map((connect) => (
                                                                                <tr key={connect.employee_id}>
                                                                                    <td>
                                                                                        <span
                                                                                            className={`tag ${connect.read === "1" || connect.read === "read"
                                                                                                ? "tag-blue"
                                                                                                : connect.read === "0" || connect.read === "unread"
                                                                                                    ? "tag-red"
                                                                                                    : connect.read === "ready_to_discuss"
                                                                                                        ? "tag-warning"
                                                                                                        : connect.read === "completed"
                                                                                                            ? "tag-danger"
                                                                                                            : ""
                                                                                                }`}
                                                                                        >
                                                                                            {connect.read === 'unread' ? 'Unread' : connect.read === 'read' ? 'Read' : connect.read === 'ready_to_discuss' ? 'Ready To Discuss' : connect.read === 'completed' ? 'Completed' : connect.read}
                                                                                        </span>
                                                                                    </td>
                                                                                    <td>{connect.receiver_name}</td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </li>
                                                        )}

                                                        <li className="list-group-item">
                                                            <span>
                                                                <small className="text-muted">Type: </small>
                                                                <span className="">
                                                                    {selectedConnect.type === 'todo' ? 'Todo' : selectedConnect.type === 'information' ? 'Information' : selectedConnect.type === 'need_discussion' ? 'Need Discussion' : 'Completed'}
                                                                </span>
                                                            </span>
                                                        </li>
                                                        <li className="list-group-item">
                                                            <span>
                                                                <small className="text-muted">Sender: </small>
                                                                <span className="">
                                                                    {JSON.parse(selectedConnect?.sender || '{}')?.name || ''}
                                                                </span>
                                                            </span>
                                                        </li>
                                                        <li className="list-group-item">
                                                            <span>
                                                                <small className="text-muted">Created Date: </small>
                                                                {selectedConnect.created_at && (new Date(selectedConnect.created_at) < new Date()) ? '' : <span className="tag over-due-ticket">New</span>}
                                                                <span className="mb-0">{selectedConnect.created_at ? formatDate(selectedConnect.created_at) : '--/--/--'}</span>
                                                            </span>
                                                        </li>


                                                    </ul>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-lg-8 col-md-12">
                                        <div className="card shadow-sm border-0 pe-3 d-flex flex-column mb-3 h-110" style={{ maxHeight: "355px" }}>
                                            <div className="card-header bg-white border-bottom py-3" style={{ borderRadius: '12px 12px 0 0' }}>
                                                <h6 className="mb-0 fw-bold">Attached Files</h6>
                                            </div>
                                            <div className="card-body flex-grow-1 overflow-auto position-relative p-0 custom-scrollbar">
                                                <div className="table-responsive">
                                                    <table className="table table-hover table-vcenter mb-0 table_custom text-nowrap">
                                                        <tbody>
                                                            {Array.isArray(files) && files.length > 0 ? (
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
                                                                                        src={getFileUrl(file)}
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
                                                                                        href={`${process.env.REACT_APP_API_URL}/download.php?file=${file}`}
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
                                            </div>
                                        </div>
                                        {selectedConnect && selectedConnect.id && (
                                            <CommentModule moduleType="connect" moduleId={selectedConnect?.id} height="45vh" />
                                        )}

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div >
            )}

            {
                showPreview && (
                    <ImagePreview
                        imageUrl={getFileUrl(filePath)}
                        downloadUrl={`${process.env.REACT_APP_API_URL}/download.php?file=${filePath}`}
                        onClose={() => setShowPreview(false)}
                    />
                )
            }

            {show && <div className="modal-backdrop fade show" />}
        </>
    );

};

export default ViewConnectModel;