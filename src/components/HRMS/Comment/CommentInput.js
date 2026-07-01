import React from 'react';
import { checkIsCurrentUser } from './CommentModule';
import Button from '../../common/formInputs/Button';
import TextEditor from '../../common/TextEditor';

const CommentInput = ({
    inputText, setInputText,
    handleSubmit,
    editingComment, setEditingComment,
    replyingTo, setReplyingTo,
    currentUser
}) => {
    return (
        <div className="card">
            {editingComment && (
                <div className="d-flex align-items-center justify-content-between p-2 px-3 border-bottom" style={{ backgroundColor: '#f0f2f5' }}>
                    <div className="d-flex flex-column border-start border-4 border-primary ps-2">
                        <small className="text-primary fw-bold">Editing message</small>
                        <span className="text-muted text-truncate" style={{ fontSize: '0.85rem', maxWidth: '300px' }} dangerouslySetInnerHTML={{ __html: editingComment.message }}></span>
                    </div>
                    <button type="button" className="btn btn-sm btn-link text-muted p-0" onClick={() => { setEditingComment(null); setInputText(''); }}>
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" /></svg>
                    </button>
                </div>
            )}
            {replyingTo && (
                <div className="d-flex align-items-center justify-content-between p-2 px-3 border-bottom" style={{ backgroundColor: '#f0f2f5' }}>
                    <div className="d-flex flex-column border-start border-4 border-success ps-2">
                        <small className="text-success fw-bold">Replying to {checkIsCurrentUser(currentUser, replyingTo.commented_by) ? 'You' : replyingTo.commented_by?.first_name}</small>
                        <span className="text-muted text-truncate" style={{ fontSize: '0.85rem', maxWidth: '300px' }} dangerouslySetInnerHTML={{ __html: replyingTo.message }}></span>
                    </div>
                    <button type="button" className="btn btn-sm btn-link text-muted p-0" onClick={() => setReplyingTo(null)}>
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" /></svg>
                    </button>
                </div>
            )}
            <div className='align-items-end border-top-2' >
                <form noValidate onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                    <div className="card-body">
                        <TextEditor
                            value={inputText}
                            onChange={(value) => setInputText(value)}
                            placeholder={"Add a comment..."}
                            height="100px"
                        />
                        <div style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "10px",
                        }} className="mt-1 " >
                            <Button
                                type="submit"
                                icon="fa fa-send"
                                disabled={!inputText || inputText === '<p><br></p>'}
                                className="btn-primary"
                            />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CommentInput;
