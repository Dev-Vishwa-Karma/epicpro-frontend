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
    return (
        <div className="bg-white border-top shadow-sm" style={{ zIndex: 10, borderRadius: '0 0 12px 12px' }}>
            {editingComment && (
                <div className="d-flex align-items-start justify-content-between p-2 px-3 bg-light border-bottom overflow-hidden">
                    <div className="d-flex flex-column border-start border-4 border-primary ps-2 flex-grow-1 overflow-hidden me-3" style={{ minWidth: 0 }}>
                        <small className="text-primary fw-bold">Editing message</small>
                        <span className="text-muted preview-text w-100" style={{ fontSize: '0.85rem' }} dangerouslySetInnerHTML={{ __html: editingComment.message }}></span>
                    </div>
                    <Button
                        className="btn-sm btn-link text-muted p-0 flex-shrink-0"
                        onClick={() => { setEditingComment(null); setInputText(''); }}
                        icon="fa fa-times fs-5"
                    />
                </div>
            )}
            {replyingTo && (
                <div className="d-flex align-items-start justify-content-between p-2 px-3 bg-light border-bottom overflow-hidden">
                    <div className="d-flex flex-column border-start border-4 border-success ps-2 flex-grow-1 overflow-hidden me-3" style={{ minWidth: 0 }}>
                        <small className="text-success fw-bold">Replying to {checkIsCurrentUser(currentUser, replyingTo.commented_by) ? 'You' : replyingTo.commented_by?.first_name}</small>
                        <span className="text-muted preview-text w-100" style={{ fontSize: '0.85rem' }} dangerouslySetInnerHTML={{ __html: replyingTo.message }}></span>
                    </div>
                    <Button
                        className="btn-sm btn-link text-muted p-0 flex-shrink-0"
                        onClick={() => setReplyingTo(null)}
                        icon="fa fa-times fs-5"
                    />
                </div>
            )}

            <form noValidate onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }} className="p-3 d-flex align-items-end">
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <TextEditor
                        value={inputText}
                        onChange={(value) => setInputText(value)}
                        placeholder={"Type your message here..."}
                        minHeight="60px"
                    />
                </div>
                <div className="d-flex flex-column gap-2 ml-2">
                    <Button
                        type="submit"
                        className="btn-primary d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm send-btn"
                        style={{ width: '65px', height: '40px', borderRadius: '10px', transition: 'all 0.2s ease-in-out' }}
                        disabled={!inputText || inputText === '<p><br></p>' || inputText === '<p>&nbsp;</p>' || inputText === '<p></p>'}
                        label="Send"
                        title="Send"
                    />
                </div>
            </form >

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
        </div >
    );
};

export default CommentInput;
