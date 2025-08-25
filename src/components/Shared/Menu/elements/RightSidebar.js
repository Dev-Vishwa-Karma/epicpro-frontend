import React, { Component } from 'react';
import { getToday,shortformatDate } from '../../../../utils';
import { getService } from '../../../../services/getService';
import BlankState from '../../../common/BlankState';

class RightSidebar extends Component {
    constructor(props) {
    super(props);
    this.state = {
      activities: [],
      loading:false
    };
  }

  componentDidMount() {
      this.getTodayActivity()
  }

  componentDidUpdate(prevProps) {
      if (!prevProps.isOpenRightSidebar && this.props.isOpenRightSidebar) {
          this.getTodayActivity();
      }
  }

  getTodayActivity = () => {
   if (window.user.role === 'employee'){
      this.setState({ loading: true });
      getService.getCall('activities.php', {
        action: 'view',
        user_id: window.user.id,
        from_date: getToday(),
        to_date: getToday(),
        is_timeline: true
      })
        .then((data) => {
          if (data.status === "success") {
            this.setState({ activities: Array.isArray(data.data.activities) ? data.data.activities : [], loading: false });
          } else {
            this.setState({ activities: [], loading: false, error: data.message });
          }
        })
        .catch((err) => {
          console.error(err);
          this.setState({ loading: false, error: err && err.message ? err.message : 'Failed to fetch activities' });
        });
     }
  };

  render() {
    const { 
      isOpenRightSidebar, 
      toggleRightSidebar, 
      handleFont, 
      handleMenuIcon, 
      handleSubMenuIcon, 
      handleDarkMode, 
      handleFixNavbar, 
      handleDarkHeader, 
      handleMinSidebar, 
      handleSidebar,  
      handleGradientColor,  
    } = this.props;
    const { activities,loading} = this.state;

    return (
      <div id="rightsidebar" className={`right_sidebar ${isOpenRightSidebar ? 'open' : ''}`}>
        <span className="p-3 settingbar float-right" onClick={() => { toggleRightSidebar(); this.getTodayActivity(); }}>
          <i className="fa fa-close" />
        </span>
        <ul className="nav nav-tabs" role="tablist">
          {(window.user.role === 'admin' || window.user.role === 'super_admin') && (
          <li className="nav-item">
            <a className="nav-link active" data-toggle="tab" href="#Settings" aria-expanded="true">
              Settings
            </a>
          </li>
          )}
          {(window.user.role === 'employee') && (
          <li className="nav-item">
            <a className="nav-link active" data-toggle="tab" href="#activity" aria-expanded="false">
              Today Activity
            </a>
          </li>
          )}
        </ul>
        <div className="tab-content">
          {(window.user.role === 'admin' || window.user.role === 'super_admin') && (
          <div role="tabpanel" className="tab-pane vivify fadeIn active" id="Settings" aria-expanded="true">
            <div className="mb-4">
              <h6 className="font-14 font-weight-bold text-muted">Font Style</h6>
              <div className="custom-controls-stacked font_setting">
                {['font-opensans', 'font-montserrat', 'font-roboto'].map(font => (
                  <label className="custom-control custom-radio custom-control-inline" key={font}>
                    <input
                      type="radio"
                      className="custom-control-input"
                      name="font"
                      defaultValue={font}
                      onChange={() => handleFont(font)}
                    />
                    <span className="custom-control-label">{font.replace('font-', '').replace('-', ' ').toUpperCase()}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <h6 className="font-14 font-weight-bold text-muted">Selected Menu Icon</h6>
              <div className="custom-controls-stacked arrow_option">
                {['list-a', 'list-b', 'list-c'].map(icon => (
                  <label className="custom-control custom-radio custom-control-inline" key={icon}>
                    <input
                      type="radio"
                      className="custom-control-input"
                      name="marrow"
                      defaultValue={icon}
                      onChange={() => handleMenuIcon(icon)}
                    />
                    <span className="custom-control-label">{icon.toUpperCase()}</span>
                  </label>
                ))}
              </div>

              <h6 className="font-14 font-weight-bold mt-4 text-muted">SubMenu List Icon</h6>
              <div className="custom-controls-stacked list_option">
                {['list-a', 'list-b', 'list-c'].map(icon => (
                  <label className="custom-control custom-radio custom-control-inline" key={icon}>
                    <input
                      type="radio"
                      className="custom-control-input"
                      name="listicon"
                      defaultValue={icon}
                      onChange={() => handleSubMenuIcon(icon)}
                    />
                    <span className="custom-control-label">{icon.toUpperCase()}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h6 className="font-14 font-weight-bold mt-4 text-muted">General Settings</h6>
              <ul className="setting-list list-unstyled mt-1 setting_switch">
                {[
                  { label: 'Night Mode', onChange: handleDarkMode },
                  { label: 'Fix Navbar top', onChange: handleFixNavbar },
                  { label: 'Header Dark', onChange: handleDarkHeader },
                  { label: 'Min Sidebar Dark', onChange: handleMinSidebar },
                  { label: 'Sidebar Dark', onChange: handleSidebar },
                  { label: 'Gradient Color', onChange: handleGradientColor },
                  //{ label: 'RTL Support', onChange: handleRtl }
                ].map((setting, index) => (
                  <li key={index}>
                    <label className="custom-switch">
                      <span className="custom-switch-description">{setting.label}</span>
                      <input
                        type="checkbox"
                        name="custom-switch-checkbox"
                        className="custom-switch-input"
                        onChange={setting.onChange}
                      />
                      <span className="custom-switch-indicator" />
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          )}
          {(window.user.role === 'employee' ) && (
          <div role="tabpanel" className="tab-pane vivify fadeIn active" id="activity" aria-expanded="false">
              <ul className="new_timeline mt-3">
                  {this.state.loading && (
                      <li>
                          <div className="desc">
                              <h4>Loading...</h4>
                          </div>
                      </li>
                  )}
                  {!this.state.loading && this.state.activities.length === 0 && (
                      <li>
                          <div className="desc">
                              <BlankState message="No activities found" />
                          </div>
                      </li>
                  )}
                  {this.state.activities.map((activity, idx) => {
                      const type = activity.type;
                      const bullet = (type === 'Punch_in' || type === 'Break_in') ? 'green' : (type === 'Punch_out' || type === 'Break_out') ? 'pink' : '';
                      const label = (type === 'Punch_in') ? 'Punch In' : (type === 'Punch_out') ? 'Punch Out' : (type === 'Break_in') ? 'Break In' : 'Break Out';
                      const time = (type === 'Punch_in' || type === 'Break_in') ? activity.in_time : activity.out_time;
                      return (
                          <li key={activity.id || idx}>
                              <div className={`bullet ${bullet}`} />
                              <div className="time">{time}</div>
                              <div className="desc">
                                  <h3>{label}</h3>
                              </div>
                          </li>
                      );
                  })}
              </ul>
          </div>
          )}
          </div>
        </div>
      
    );
  }
}

export default RightSidebar;
