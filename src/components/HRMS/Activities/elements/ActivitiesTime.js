import React, { Component } from 'react';
import BlankState from '../../../common/BlankState';
import Avatar from '../../../common/Avatar';

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
                    // Date Seperation
                    let showSeparator = false;
                    let displayDate = '';
                    // activity.date from backend for date separation
                    const currentDateStr = activity.date ? activity.date.split(' ')[0] : null;
                    if (index === 0) {
                      showSeparator = true;
                    } else {
                      const prevDateStr = activities[index - 1].date ? activities[index - 1].date.split(' ')[0] : null;
                      if (currentDateStr !== prevDateStr) {
                        showSeparator = true;
                      }
                    }
                    if (showSeparator && currentDateStr) {
                      const dateObj = new Date(currentDateStr);
                      const today = new Date();
                      const yesterday = new Date();
                      yesterday.setDate(today.getDate() - 1);
                      function stripTime(d) {
                        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
                      }
                      const dateNoTime = stripTime(dateObj);
                      const todayNoTime = stripTime(today);
                      const yesterdayNoTime = stripTime(yesterday);
                      if (dateNoTime.getTime() === todayNoTime.getTime()) {
                        displayDate = '';
                      } else if (dateNoTime.getTime() === yesterdayNoTime.getTime()) {
                        displayDate = 'Yesterday';
                      } else {
                        displayDate = dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
                      }
                    }
                    const key = activity.id || index;
                    return (
                        <React.Fragment key={key}>
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
                            <Avatar
                                profile={activity.profile}
                                first_name={activity.first_name}
                                last_name={activity.last_name}
                                size={35}
                                className="avatar avatar-blue add-space tl_avatar"
                                style={{
                                    width: '35px', 
                                    height: '35px', 
                                    borderRadius: '50%', 
                                    objectFit: 'cover',
                                    border: '2px solid #f5f5f5'
                                }}
                            />
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
                            <Avatar
                                profile={activity.profile}
                                first_name={activity.first_name}
                                last_name={activity.last_name}
                                size={35}
                                className="avatar avatar-blue add-space tl_avatar"
                                style={{
                                    width: '35px', 
                                    height: '35px', 
                                    borderRadius: '50%', 
                                    objectFit: 'cover',
                                    border: '2px solid #f5f5f5'
                            }}
                            />
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
                             <Avatar
                                profile={activity.profile}
                                first_name={activity.first_name}
                                last_name={activity.last_name}
                                size={35}
                                className="avatar avatar-blue add-space tl_avatar"
                                style={{
                                    width: '35px', 
                                    height: '35px', 
                                    borderRadius: '50%', 
                                    objectFit: 'cover',
                                    border: '2px solid #f5f5f5'
                                }}
                            />
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
                            <Avatar
                                    profile={activity.profile}
                                    first_name={activity.first_name}
                                    last_name={activity.last_name}
                                    size={35}
                                    className="avatar avatar-blue add-space tl_avatar"
                                    style={{
                                        width: '35px', 
                                        height: '35px', 
                                        borderRadius: '50%', 
                                        objectFit: 'cover',
                                        border: '2px solid #f5f5f5'
                                    }}
                                />
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

                        </React.Fragment>
                    );
                    })
                ) : (
                    <BlankState message="Activities not found" />
                )}
                </div>
            </div>
        </>
        );
    }
}

export default ActivitiesTime;