import React, { useRef, useState } from 'react';
import { checkIsCurrentUser } from '../CommentModule';
import TextEditor from '../../../common/TextEditor';
import Button from '../../../common/formInputs/Button';

const CommentInput = ({
    inputText, setInputText,
    handleSubmit,
    editingComment, setEditingComment,
    replyingTo, setReplyingTo,
    currentUser
}) => {
    const fileInputRef = useRef(null);
    const [attachments, setAttachments] = useState([]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = [];
            for (let i = 0; i < e.target.files.length; i++) {
                newFiles.push(e.target.files[i]);
            }
            setAttachments(prev => {
                const updated = [...prev];
                newFiles.forEach(newFile => {
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
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } else {
            setAttachments(prev => prev.filter((_, idx) => idx !== indexToRemove));
        }
    };
    return (
        <div className="bg-white border-top shadow-sm" style={{ zIndex: 10 }}>
            {editingComment && (
                <div className="d-flex align-items-center justify-content-between p-2 px-3 bg-light border-bottom overflow-hidden">
                    <div className="d-flex flex-column border-start border-4 border-primary ps-2 flex-grow-1 overflow-hidden me-3" style={{ minWidth: 0 }}>
                        <small className="text-primary fw-bold">Editing message</small>
                        <span className="text-muted text-truncate w-100" style={{ fontSize: '0.85rem' }} dangerouslySetInnerHTML={{ __html: editingComment.message }}></span>
                    </div>
                    <Button
                        className="btn-sm btn-link text-muted p-0 flex-shrink-0"
                        onClick={() => { setEditingComment(null); setInputText(''); }}
                        icon="fa fa-times fs-5"
                    />
                </div>
            )}
            {replyingTo && (
                <div className="d-flex align-items-center justify-content-between p-2 px-3 bg-light border-bottom overflow-hidden">
                    <div className="d-flex flex-column border-start border-4 border-success ps-2 flex-grow-1 overflow-hidden me-3" style={{ minWidth: 0 }}>
                        <small className="text-success fw-bold">Replying to {checkIsCurrentUser(currentUser, replyingTo.commented_by) ? 'You' : replyingTo.commented_by?.first_name}</small>
                        <span className="text-muted text-truncate w-100" style={{ fontSize: '0.85rem' }} dangerouslySetInnerHTML={{ __html: replyingTo.message }}></span>
                    </div>
                    <Button
                        className="btn-sm btn-link text-muted p-0 flex-shrink-0"
                        onClick={() => setReplyingTo(null)}
                        icon="fa fa-times fs-5"
                    />
                </div>
            )}

            <form noValidate onSubmit={(e) => { e.preventDefault(); handleSubmit(e, attachments); clearAttachment(); }} className="p-3">
                {attachments.length > 0 && (
                    <div className="mb-2 d-flex flex-wrap gap-2">
                        {attachments.map((file, idx) => (
                            <div key={idx} className="d-flex align-items-center bg-light p-2 rounded border" style={{ maxWidth: '300px' }}>
                                <i className="fa fa-paperclip text-muted me-2"></i>
                                <span className="text-truncate flex-grow-1" style={{ fontSize: '0.85rem' }}>{file.name}</span>
                                <Button className="btn-sm btn-link text-danger p-0 ms-2" onClick={() => clearAttachment(idx)} icon="fa fa-times" />
                            </div>
                        ))}
                    </div>
                )}
                <div className="d-flex align-items-end gap-3">
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                        <TextEditor
                            value={inputText}
                            onChange={(value) => setInputText(value)}
                            placeholder={"Type your message here..."}
                            height="80px"
                        />
                    </div>
                    <div className="d-flex flex-column gap-2 ml-2">
                        {/* <Button
                            type="button"
                            className="btn-light d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm border mb-2"
                            style={{ width: '40px', height: '40px', backgroundColor: '#f8f9fa', alignSelf: 'center' }}
                            onClick={(e) => { e.preventDefault(); if (fileInputRef.current) fileInputRef.current.click(); }}
                            title="Attach file"
                            icon="fa fa-paperclip fs-6 text-muted"
                        />
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            multiple
                            onChange={handleFileChange}
                        /> */}
                        <Button
                            type="submit"
                            className="btn-primary d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm send-btn"
                            style={{ width: '50px', height: '50px', transition: 'all 0.2s ease-in-out' }}
                            disabled={(!inputText || inputText === '<p><br></p>') && attachments.length === 0}
                            icon="fa fa-paper-plane"
                            title="Send"
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
                `}
            </style>
        </div>
    );
};

export default CommentInput;
