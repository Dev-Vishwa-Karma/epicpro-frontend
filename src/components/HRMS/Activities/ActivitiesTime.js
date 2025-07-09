import React, { Component } from 'react';

class ActivitiesTime extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activities: [],
        };
    }

    componentDidUpdate(prevProps)
    {
        if (prevProps.activities !== this.props.activities) {
            this.setState({
                activities: this.props.activities,
            });
        }
    }

    render() {
        const { activities } = this.state;

        return (
            <>        
            <div className="card">
            <div className="card-header bline d-flex justify-content-between align-items-center">
                <h3 className="card-title">Timeline Activity</h3>
            </div>
            <div className="card-body">
                <div className="summernote"></div>
                {activities.length > 0 ? (
                    activities.map((activity, index) => {
                    const profilePic = activity.profile
                        ? `${process.env.REACT_APP_API_URL}/${activity.profile}`
                        : null;
                    // Date Seperation
                    let showSeparator = false;
                    function getDateStr(activity) {
                        const dateTime = activity.complete_in_time || activity.complete_out_time;
                        if (!dateTime) return 'Unknown Date';
                        return dateTime.split(' ')[0];
                    }
                    function getDisplayDateLabel(dateStr, isFirst) {
                        if (!dateStr || dateStr === 'Unknown Date') {
                        return isFirst ? '' : '';
                        }
                        const date = new Date(dateStr);
                        if (isNaN(date.getTime())) {
                        return isFirst ? '' : '';
                        }
                        const today = new Date();
                        const yesterday = new Date();
                        yesterday.setDate(today.getDate() - 1);
                        function stripTime(d) {
                        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
                        }
                        const dateNoTime = stripTime(date);
                        const todayNoTime = stripTime(today);
                        const yesterdayNoTime = stripTime(yesterday);
                        if (dateNoTime.getTime() === todayNoTime.getTime()) return '';
                        if (dateNoTime.getTime() === yesterdayNoTime.getTime()) return 'Yesterday';
                        return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
                    }
                    const currentDateStr = getDateStr(activity);
                    let displayDate = '';
                    if (index > 0) {
                        const prevDateStr = getDateStr(activities[index - 1]);
                        if (currentDateStr !== prevDateStr) {
                        showSeparator = true;
                        displayDate = getDisplayDateLabel(currentDateStr, false);
                        }
                    } else {
                        showSeparator = true;
                        displayDate = getDisplayDateLabel(currentDateStr, true);
                    }
                    return (
                        <>
                        {showSeparator && displayDate && (
                            <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            margin: '32px 0',
                            width: '100%',
                            }}>
                            <div style={{ flex: 1, borderBottom: '1px solid #e5e7eb' }} />
                            <div style={{
                                margin: '0 12px',
                                padding: '6px 12px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '999px',
                                background: '#fff',
                                color: '#4b5563',
                                fontSize: '0.9rem',
                                fontWeight: 500
                            }}>
                                <i className="fa fa-calendar-alt" style={{ marginRight: 6, color: '#9ca3af' }}></i>
                                {displayDate}
                            </div>
                            <div style={{ flex: 1, borderBottom: '1px solid #e5e7eb' }} />
                            </div>
                        )}

                        {/* In Time Entry */}
                        {activity.type === 'Break_in' && (
                            <div className="timeline_item ">
                        {profilePic ? (
                            <img 
                                src={profilePic} 
                                className="avatar avatar-blue add-space tl_avatar" 
                                alt={`${activity.first_name} ${activity.last_name}`}
                                data-toggle="tooltip" 
                                data-placement="top" 
                                title={`${activity.first_name} ${activity.last_name}`}
                                style={{
                                width: '35px', 
                                height: '35px', 
                                borderRadius: '50%', 
                                objectFit: 'cover',
                                border: '2px solid #f5f5f5'
                                }}
                                onError={(e) => {
                                e.target.style.display = 'none';
                                const initialsSpan = document.createElement('span');
                                initialsSpan.className = 'avatar avatar-blue add-space tl_avatar';
                                initialsSpan.setAttribute('data-toggle', 'tooltip');
                                initialsSpan.setAttribute('data-placement', 'top');
                                initialsSpan.setAttribute('title', `${activity.first_name} ${activity.last_name}`);
                                initialsSpan.style.display = 'inline-flex';
                                initialsSpan.style.alignItems = 'center';
                                initialsSpan.style.justifyContent = 'center';
                                initialsSpan.style.width = '35px';
                                initialsSpan.style.height = '35px';
                                initialsSpan.style.borderRadius = '50%';
                                initialsSpan.style.background = '#C5C4C8';
                                initialsSpan.style.color = '#fff';
                                initialsSpan.style.fontWeight = '600';
                                initialsSpan.style.border = '2px solid #f5f5f5';
                                initialsSpan.textContent = 
                                    `${activity.first_name?.charAt(0).toUpperCase() || ''}${activity.last_name?.charAt(0).toUpperCase() || ''}`;
                                e.target.parentNode.appendChild(initialsSpan);
                                }}
                            />
                            ) : (
                            <span
                                className="avatar avatar-blue add-space tl_avatar"
                                data-toggle="tooltip"
                                data-placement="top"
                                title={`${activity.first_name} ${activity.last_name}`}
                                style={{
                                width: '35px',
                                height: '35px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '50%',
                                background: '#C5C4C8',
                                color: '#fff',
                                fontWeight: '600',
                                border: '2px solid #f5f5f5',
                                textTransform: 'uppercase',
                                }}
                            >
                                {`${activity.first_name?.charAt(0).toUpperCase() || ''}${activity.last_name?.charAt(0).toUpperCase() || ''}`}
                            </span>
                            )}
                            <span>
                                <a href="#" style={{fontWeight:"800"}}>{activity.first_name} {activity.last_name}</a>
                                <span className="mx-2">|</span>
                                <span className="text-secondary">Break In</span>
                                <small className="float-right text-right">
                                {activity.in_time}
                                </small>
                            </span>
                            <h6 className="text-secondary">
                                {activity.description}
                            </h6>
                            <div className="msg" style={{marginTop:"-8px"}}>
                                {activity.created_by && (
                                <a href="#" className="mr-20 text-muted"><i className="fa fa-user text-pink"></i> Created by System Admin</a>
                                )}
                            </div>
                            </div>
                        )}
                        {/* Out Time Entry */}
                        {activity.type === 'Break_out' && (
                            <>
                            <div className="timeline_item ">
                        {profilePic ? (
                            <img 
                                src={profilePic} 
                                className="avatar avatar-blue add-space tl_avatar" 
                                alt={`${activity.first_name} ${activity.last_name}`}
                                data-toggle="tooltip" 
                                data-placement="top" 
                                title={`${activity.first_name} ${activity.last_name}`}
                                style={{
                                width: '35px', 
                                height: '35px', 
                                borderRadius: '50%', 
                                objectFit: 'cover',
                                border: '2px solid #f5f5f5'
                                }}
                                onError={(e) => {
                                e.target.style.display = 'none';
                                const initialsSpan = document.createElement('span');
                                initialsSpan.className = 'avatar avatar-blue add-space tl_avatar';
                                initialsSpan.setAttribute('data-toggle', 'tooltip');
                                initialsSpan.setAttribute('data-placement', 'top');
                                initialsSpan.setAttribute('title', `${activity.first_name} ${activity.last_name}`);
                                initialsSpan.style.display = 'inline-flex';
                                initialsSpan.style.alignItems = 'center';
                                initialsSpan.style.justifyContent = 'center';
                                initialsSpan.style.width = '35px';
                                initialsSpan.style.height = '35px';
                                initialsSpan.style.borderRadius = '50%';
                                initialsSpan.style.background = '#C5C4C8';
                                initialsSpan.style.color = '#fff';
                                initialsSpan.style.fontWeight = '600';
                                initialsSpan.style.border = '2px solid #f5f5f5';
                                initialsSpan.textContent = 
                                    `${activity.first_name?.charAt(0).toUpperCase() || ''}${activity.last_name?.charAt(0).toUpperCase() || ''}`;
                                e.target.parentNode.appendChild(initialsSpan);
                                }}
                            />
                            ) : (
                            <span
                                className="avatar avatar-blue add-space tl_avatar"
                                data-toggle="tooltip"
                                data-placement="top"
                                title={`${activity.first_name} ${activity.last_name}`}
                                style={{
                                width: '35px',
                                height: '35px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '50%',
                                background: '#C5C4C8',
                                color: '#fff',
                                fontWeight: '600',
                                border: '2px solid #f5f5f5',
                                textTransform: 'uppercase',
                                }}
                            >
                                {`${activity.first_name?.charAt(0).toUpperCase() || ''}${activity.last_name?.charAt(0).toUpperCase() || ''}`}
                            </span>
                            )}
                                <span>
                                <a style={{fontWeight:"800"}} href="#">{activity.first_name} {activity.last_name}</a>
                                <span className="mx-2">|</span>
                                <span className="text-secondary">Break Out</span>
                                <small className="float-right text-right">
                                    {activity.out_time}
                                </small>
                                </span>
                                <div className="msg" style={{marginTop:"-1px"}}>
                                {activity.updated_by && (
                                    <a href="#" className="mr-20 text-muted"><i className="fa fa-user text-pink"></i> Edited by System Admin</a>
                                )}
                                </div>
                            </div>
                            </>
                        )}

                        {/* In Time Entry Punch */}
                        {activity.type === 'Punch_in' && (
                            <div className="timeline_item ">
                        {profilePic ? (
                            <img 
                                src={profilePic} 
                                className="avatar avatar-blue add-space tl_avatar" 
                                alt={`${activity.first_name} ${activity.last_name}`}
                                data-toggle="tooltip" 
                                data-placement="top" 
                                title={`${activity.first_name} ${activity.last_name}`}
                                style={{
                                width: '35px', 
                                height: '35px', 
                                borderRadius: '50%', 
                                objectFit: 'cover',
                                border: '2px solid #f5f5f5'
                                }}
                                onError={(e) => {
                                e.target.style.display = 'none';
                                const initialsSpan = document.createElement('span');
                                initialsSpan.className = 'avatar avatar-blue add-space tl_avatar';
                                initialsSpan.setAttribute('data-toggle', 'tooltip');
                                initialsSpan.setAttribute('data-placement', 'top');
                                initialsSpan.setAttribute('title', `${activity.first_name} ${activity.last_name}`);
                                initialsSpan.style.display = 'inline-flex';
                                initialsSpan.style.alignItems = 'center';
                                initialsSpan.style.justifyContent = 'center';
                                initialsSpan.style.width = '35px';
                                initialsSpan.style.height = '35px';
                                initialsSpan.style.borderRadius = '50%';
                                initialsSpan.style.background = '#C5C4C8';
                                initialsSpan.style.color = '#fff';
                                initialsSpan.style.fontWeight = '600';
                                initialsSpan.style.border = '2px solid #f5f5f5';
                                initialsSpan.textContent = 
                                    `${activity.first_name?.charAt(0).toUpperCase() || ''}${activity.last_name?.charAt(0).toUpperCase() || ''}`;
                                e.target.parentNode.appendChild(initialsSpan);
                                }}
                            />
                            ) : (
                            <span
                                className="avatar avatar-blue add-space tl_avatar"
                                data-toggle="tooltip"
                                data-placement="top"
                                title={`${activity.first_name} ${activity.last_name}`}
                                style={{
                                width: '35px',
                                height: '35px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '50%',
                                background: '#C5C4C8',
                                color: '#fff',
                                fontWeight: '600',
                                border: '2px solid #f5f5f5',
                                textTransform: 'uppercase',
                                }}
                            >
                                {`${activity.first_name?.charAt(0).toUpperCase() || ''}${activity.last_name?.charAt(0).toUpperCase() || ''}`}
                            </span>
                            )}
                            <span>
                                <a href="#" style={{fontWeight:"800"}}>{activity.first_name} {activity.last_name}</a>
                                <span className="mx-2">|</span>
                                <span className="text-secondary">Punch In</span>
                                <small className="float-right text-right">
                                {activity.in_time}
                                </small>
                            </span>
                            <div className="msg" style={{marginTop:"-8px"}}>
                                {activity.created_by && (
                                <a href={() => false} className="mr-20 text-muted"><i className="fa fa-user text-pink"></i> Created by System Admin</a>
                                )}
                            </div>
                            </div>
                        )}
                        {/* Out Time Entry */}
                        {activity.type === 'Punch_out' && (
                            <div className="timeline_item ">
                        {profilePic ? (
                            <img 
                                src={profilePic} 
                                className="avatar avatar-blue add-space tl_avatar" 
                                alt={`${activity.first_name} ${activity.last_name}`}
                                data-toggle="tooltip" 
                                data-placement="top" 
                                title={`${activity.first_name} ${activity.last_name}`}
                                style={{
                                width: '35px', 
                                height: '35px', 
                                borderRadius: '50%', 
                                objectFit: 'cover',
                                border: '2px solid #f5f5f5'
                                }}
                                onError={(e) => {
                                e.target.style.display = 'none';
                                const initialsSpan = document.createElement('span');
                                initialsSpan.className = 'avatar avatar-blue add-space tl_avatar';
                                initialsSpan.setAttribute('data-toggle', 'tooltip');
                                initialsSpan.setAttribute('data-placement', 'top');
                                initialsSpan.setAttribute('title', `${activity.first_name} ${activity.last_name}`);
                                initialsSpan.style.display = 'inline-flex';
                                initialsSpan.style.alignItems = 'center';
                                initialsSpan.style.justifyContent = 'center';
                                initialsSpan.style.width = '35px';
                                initialsSpan.style.height = '35px';
                                initialsSpan.style.borderRadius = '50%';
                                initialsSpan.style.background = '#C5C4C8';
                                initialsSpan.style.color = '#fff';
                                initialsSpan.style.fontWeight = '600';
                                initialsSpan.style.border = '2px solid #f5f5f5';
                                initialsSpan.textContent = 
                                    `${activity.first_name?.charAt(0).toUpperCase() || ''}${activity.last_name?.charAt(0).toUpperCase() || ''}`;
                                e.target.parentNode.appendChild(initialsSpan);
                                }}
                            />
                            ) : (
                            <span
                                className="avatar avatar-blue add-space tl_avatar"
                                data-toggle="tooltip"
                                data-placement="top"
                                title={`${activity.first_name} ${activity.last_name}`}
                                style={{
                                width: '35px',
                                height: '35px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '50%',
                                background: '#C5C4C8',
                                color: '#fff',
                                fontWeight: '600',
                                border: '2px solid #f5f5f5',
                                textTransform: 'uppercase',
                                }}
                            >
                                {`${activity.first_name?.charAt(0).toUpperCase() || ''}${activity.last_name?.charAt(0).toUpperCase() || ''}`}
                            </span>
                            )}
                            <span>
                                <a href="#" style={{fontWeight:"800"}}>{activity.first_name} {activity.last_name}</a>
                                <span className="mx-2">|</span>
                                <span className="text-secondary">Punch Out</span>
                                <small className="float-right text-right">
                                {activity.out_time}
                                </small>
                            </span>
                            <div className="msg" style={{marginTop:"-5px"}}>
                                {activity.updated_by && (
                                <a href={() => false} className="mr-20 text-muted"><i className="fa fa-user text-pink"></i> Edited by System Admin</a>
                                )}
                            </div>
                            </div>
                        )}
                        </>
                    );
                    })
                ) : (
                    <div className="text-center text-muted py-4">activities not found</div>
                )}
                </div>
            </div>
        </>
        );
    }
}

export default ActivitiesTime;