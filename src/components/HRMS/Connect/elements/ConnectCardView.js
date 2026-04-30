import React from 'react';
import NoDataRow from '../../../common/NoDataRow';
import { Priority, Status, Type, Receivers } from './CardUtility';
import Button from '../../../common/formInputs/Button';

const ConnectCardsView = ({ connectData = [], onRecordClick, currentTab, handleEditconnect, loading, onSubmit }) => {

    return (
        <div className="notification-container">
            {connectData.length === 0 ? (
                <div>No Data Found</div>
            ) : (
                connectData.map((connect) => (
                    <div
                        key={connect.id}
                        className={`custom-card ${connect.priority}`}
                    >

                        <div className="custom-card-header custom-card-meta">
                            <span
                                onClick={() => onRecordClick(connect)}
                                        style={{ color: 'blue', textDecoration: 'none', cursor: 'pointer' }}>
                                {connect.title || "Untitled"}
                            </span>
                        </div>

                        <div className="custom-card-meta">
                            {connect.body || "No description"}
                        </div>

                        <div className="custom-card-footer">
                            <div className="footer-left">
                                <Type type={connect.type} />
                                <Priority priority={connect.priority} />
                            </div>

                            {(currentTab === 'receive') && (
                                <div className="custom-card-description">
                                    <Status connect={connect} />
                                </div>
                            )}

                            {(currentTab !== 'receive' && currentTab !== 'draft') && (
                                <div className="custom-card-description">
                                    <Receivers receivers={connect.receiver} currentTab={currentTab}/>
                                </div>
                            )}

                            {currentTab === "draft" && (
                                <div>
                                    <Button
                                        label="Edit"
                                        onClick={() => {
                                            handleEditconnect(connect);
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

export default ConnectCardsView;