import React, { useRef, useState, useEffect } from 'react';
import { checkIsCurrentUser } from './commentTreeHelpers';
import TextEditor from '../../../common/TextEditor';
import Button from '../../../common/formInputs/Button';

const CommentInput = ({
    inputText, setInputText,
    handleSubmit,
    editingComment, setEditingComment,
    replyingTo, setReplyingTo,
    currentUser,
    isSubmitting
}) => {
    const fileInputRef = useRef(null);
    const containerRef = useRef(null);
    const [attachments, setAttachments] = useState([]);
    const [existingAttachments, setExistingAttachments] = useState([]);
    const [errorMsg, setErrorMsg] = useState(null);
    const timeoutRef = useRef(null);

    const textByteSize = inputText ? new Blob([inputText]).size : 0;
    const isTextTooLong = textByteSize > 4096;

    const showError = (msg) => {
        setErrorMsg(msg);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setErrorMsg(null), 5000);
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = [];
            for (let i = 0; i < e.target.files.length; i++) {
                newFiles.push(e.target.files[i]);
            }
            setAttachments(prev => {
                const updated = [...prev];
                let hasLimitError = false;
                newFiles.forEach(newFile => {
                    if (newFile.size > 5 * 1024 * 1024) {
                        showError(`File ${newFile.name} exceeds the 5MB size limit.`);
                        return;
                    }
                    if (updated.length + existingAttachments.length >= 5) {
                        if (!hasLimitError) {
                            showError(`Maximum of 5 attachments allowed per comment.`);
                            hasLimitError = true;
                        }
                        return;
                    }
                    // Prevent adding duplicates based on file name and size
                    if (!updated.some(existing => existing.name === newFile.name && existing.size === newFile.size)) {
                        updated.push(newFile);
                    }
                });
                return updated;
            });
            // Clear input so the same file (or another) can be selected without issues
            e.target.value = '';
        }
    };

    const clearAttachment = (indexToRemove = -1) => {
        if (indexToRemove === -1) {
            setAttachments([]);
            setExistingAttachments([]);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } else {
            setAttachments(prev => prev.filter((_, idx) => idx !== indexToRemove));
        }
    };

    const clearExistingAttachment = (idToRemove) => {
        setExistingAttachments(prev => prev.filter(att => att.id !== idToRemove));
    };

    const handlePaste = (e) => {
        if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
            e.preventDefault();
            e.stopPropagation();
            const newFiles = Array.from(e.clipboardData.files);
            setAttachments(prev => {
                const updated = [...prev];
                let hasLimitError = false;
                newFiles.forEach(newFile => {
                    if (newFile.size > 5 * 1024 * 1024) {
                        showError(`Pasted file exceeds the 5MB size limit.`);
                        return;
                    }
                    if (updated.length + existingAttachments.length >= 5) {
                        if (!hasLimitError) {
                            showError(`Maximum of 5 attachments allowed per comment.`);
                            hasLimitError = true;
                        }
                        return;
                    }
                    if (!updated.some(existing => existing.name === newFile.name && existing.size === newFile.size)) {
                        updated.push(newFile);
                    }
                });
                return updated;
            });
        }
    };

    useEffect(() => {
        const el = containerRef.current;
        if (el) {
            el.addEventListener('paste', handlePaste, true);
        }
        return () => {
            if (el) el.removeEventListener('paste', handlePaste, true);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (editingComment && editingComment.attachments && editingComment.attachments.length > 0) {
            setExistingAttachments(editingComment.attachments);
        } else {
            setExistingAttachments([]);
        }
    }, [editingComment]);

    return (
        <div ref={containerRef} className="bg-white border-top shadow-sm" style={{ zIndex: 10, borderRadius: '0 0 12px 12px' }}>
            {editingComment && (
                <div className="d-flex align-items-start justify-content-between p-2 px-3 bg-light border-bottom overflow-hidden">
                    <div className="d-flex flex-column border-start border-4 border-primary ps-2 flex-grow-1 overflow-hidden me-3" style={{ minWidth: 0 }}>
                        <small className="text-primary fw-bold">Editing message</small>
                        <span className="text-muted preview-text w-100" style={{ fontSize: '0.85rem' }} dangerouslySetInnerHTML={{ __html: editingComment.message }}></span>
                    </div>
                    <Button
                        className="btn-sm btn-link text-muted p-0 flex-shrink-0"
                        onClick={() => { setEditingComment(null); setInputText(''); setExistingAttachments([]); }}
                        icon="fa fa-times fs-5"
                    />
                </div>
            )}
            {replyingTo && (
                <div className="d-flex align-items-start justify-content-between p-2 px-3 bg-light border-bottom overflow-hidden">
                    <div className="d-flex flex-column border-start border-4 border-success ps-2 flex-grow-1 overflow-hidden me-3" style={{ minWidth: 0 }}>
                        <small className="text-success fw-bold">Replying to {checkIsCurrentUser(currentUser, replyingTo.commented_by) ? 'You' : replyingTo.commented_by?.first_name}</small>
                        <div className="d-flex align-items-center text-muted preview-text w-100 mt-1" style={{ fontSize: '0.85rem' }}>
                            {replyingTo.message && typeof replyingTo.message === 'string' && replyingTo.message.replace(/(<([^>]+)>)/gi, "").replace(/&nbsp;/gi, "").trim() !== '' && (
                                <div className="text-truncate me-2" dangerouslySetInnerHTML={{ __html: replyingTo.message }}></div>
                            )}
                            {replyingTo.attachments && replyingTo.attachments.length > 0 && (
                                <div className="d-flex align-items-center gap-1 flex-shrink-0">
                                    {replyingTo.attachments.map((att, idx) => {
                                        if (!att || !att.source) return null;
                                        const isImage = att.source_type && att.source_type.startsWith('image/');
                                        const fileName = att.source.split('/').pop();
                                        return isImage ? (
                                            <img key={att.id || idx} src={`${process.env.REACT_APP_API_URL}/${att.source}`} alt="preview" style={{ width: '30px', height: '30px', objectFit: 'cover', borderRadius: '4px' }} />
                                        ) : (
                                            <span key={att.id || idx} className="badge bg-light text-dark border text-truncate" style={{ maxWidth: '100px' }}><i className="fa fa-file me-1"></i>{fileName}</span>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                    <Button
                        className="btn-sm btn-link text-muted p-0 flex-shrink-0"
                        onClick={() => setReplyingTo(null)}
                        icon="fa fa-times fs-5"
                    />
                </div>
            )}

            {errorMsg && (
                <div className="alert alert-danger mx-3 mt-3 mb-0 py-2 d-flex justify-content-between align-items-center shadow-sm" role="alert" style={{ fontSize: '0.85rem' }}>
                    <span className="me-2"><i className="fa fa-exclamation-circle me-1"></i> {errorMsg}</span>
                    <Button
                        className="btn-sm btn-link text-danger p-0 flex-shrink-0"
                        onClick={() => setErrorMsg(null)}
                        icon="fa fa-times"
                        style={{ textDecoration: 'none' }}
                    />
                </div>
            )}

            <form
                noValidate
                onSubmit={(e) => {
                    e.preventDefault();
                    if (isTextTooLong) {
                        showError("Text limit of 4096 bytes exceeded.");
                        return;
                    }
                    handleSubmit(e, attachments, existingAttachments);
                    clearAttachment();
                }}
                className="p-3"
            >
                {(attachments.length > 0 || existingAttachments.length > 0) && (
                    <div className="mb-2 d-flex flex-wrap gap-2">
                        {existingAttachments.map((file, idx) => {
                            const isImage = file.source_type && file.source_type.startsWith('image/');
                            const fileName = file.source.split('/').pop();
                            const fileUrl = `${process.env.REACT_APP_API_URL}/${file.source}`;
                            return (
                                <div key={`exist-${file.id || idx}`} className="d-flex align-items-center bg-light p-2 rounded border" style={{ maxWidth: '300px' }}>
                                    {isImage ? (
                                        <img
                                            src={fileUrl}
                                            alt="preview"
                                            className="me-2 rounded border"
                                            style={{ width: '36px', height: '36px', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <i className="fa fa-paperclip text-muted me-2" style={{ fontSize: '1.2rem' }}></i>
                                    )}
                                    <span className="text-truncate flex-grow-1" style={{ fontSize: '0.85rem' }} title={fileName}>
                                        {fileName}
                                    </span>
                                    <Button className="btn-sm btn-link text-danger p-0" style={{ marginTop: '-2pc', marginRight: '-6px' }} onClick={() => clearExistingAttachment(file.id)} icon="fa fa-times" />
                                </div>
                            );
                        })}
                        {attachments.map((file, idx) => {
                            const isImage = file.type && file.type.startsWith('image/');
                            return (
                                <div key={idx} className="d-flex align-items-center bg-light p-2 rounded border" style={{ maxWidth: '300px' }}>
                                    {isImage ? (
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt="preview"
                                            className="me-2 rounded border"
                                            style={{ width: '36px', height: '36px', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <i className="fa fa-paperclip text-muted me-2" style={{ fontSize: '1.2rem' }}></i>
                                    )}
                                    <span className="text-truncate flex-grow-1" style={{ fontSize: '0.85rem' }} title={file.name}>
                                        {file.name || 'Pasted Image'}
                                    </span>
                                    <Button className="btn-sm btn-link text-danger p-0" style={{ marginTop: '-2pc', marginRight: '-6px' }} onClick={() => clearAttachment(idx)} icon="fa fa-times" />
                                </div>
                            );
                        })}
                    </div>
                )}
                <div className="d-flex align-items-center gap-3">
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                        <TextEditor
                            value={inputText}
                            onChange={(value) => {
                                setInputText(value);
                                if (value && new Blob([value]).size > 4096) {
                                    showError("Text limit of 4096 bytes exceeded.");
                                }
                            }}
                            placeholder={"Type your message here..."}
                            minHeight="60px"
                            onEnter={() => {
                                if (isSubmitting || ((!inputText || inputText === '<p><br></p>') && attachments.length === 0 && existingAttachments.length === 0)) return;
                                if (inputText && new Blob([inputText]).size > 4096) {
                                    showError("Text limit of 4096 bytes exceeded.");
                                    return;
                                }
                                handleSubmit(null, attachments, existingAttachments);
                                clearAttachment();
                            }}
                        />
                        {(
                            // isTextTooLong && (
                            <div className={`text-end ${isTextTooLong ? 'text-danger fw-bold' : 'text-muted'}`} style={{ fontSize: '0.75rem' }}>
                                {textByteSize}/4096 bytes
                            </div>
                            // )
                        )}

                    </div>
                    <div className="d-flex align-items-center justify-content-end gap-2 ml-2">
                        <Button
                            type="button"
                            className="btn-light d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm rounded"
                            style={{ width: '40px', height: '40px' }}
                            onClick={(e) => { e.preventDefault(); if (fileInputRef.current) fileInputRef.current.click(); }}
                            title="Attach file"
                            icon="fa fa-solid fa-plus"
                        />
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            multiple
                            onChange={handleFileChange}
                        />
                        <Button
                            type="submit"
                            className="btn-primary d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm send-btn ml-2"
                            style={{ width: '65px', height: '40px', borderRadius: '10px', transition: 'all 0.2s ease-in-out' }}
                            disabled={(!inputText || inputText === '<p><br></p>') && attachments.length === 0 && existingAttachments.length === 0 || isSubmitting || isTextTooLong}
                            loading={isSubmitting}
                            icon="fa fa-paper-plane"
                        />
                    </div>
                </div>
            </form>

            <style>
                {`
                .ck.ck-editor {
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                }
                .ck.ck-toolbar {
                    border: none !important;
                    background: #f8f9fa !important;
                    border-bottom: 1px solid #e9ecef !important;
                }
                .ck.ck-editor__main > .ck-editor__editable {
                    border: none !important;
                    background: #ffffff !important;
                }
                .ck.ck-editor__main > .ck-editor__editable.ck-focused {
                    box-shadow: none !important;
                }
                .send-btn:hover:not(:disabled) {
                    transform: scale(1.05);
                }
                .preview-text {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .preview-text p {
                    margin: 0 !important;
                    display: inline !important;
                }
                .preview-text img {
                    max-height: 35px !important;
                    max-width: 35px !important;
                    object-fit: cover !important;
                    border-radius: 4px !important;
                    vertical-align: middle !important;
                    margin-left: 5px;
                }
                `}
            </style>
        </div >
    );
};

export default CommentInput;
