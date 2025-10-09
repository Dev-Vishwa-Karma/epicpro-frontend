import React, { Component } from 'react';
import { getToday } from '../../../../utils';
import { getService } from '../../../../services/getService';
import BlankState from '../../../common/BlankState';

class RightSidebar extends Component {
    constructor(props) {
      super(props);
      this.state = {
        activities: [],
        loading:false,
        show_todo: true,
        show_project: true,
        global_show_todo: true,
        global_show_project: true
      };
    }

  componentDidMount() {
      this.getTodayActivity();
      this.getDashboardPreferences();
      this.getGlobalDashboardPreferences();
  }

  componentDidUpdate(prevProps) {
      if (!prevProps.isOpenRightSidebar && this.props.isOpenRightSidebar) {
          this.getTodayActivity();
          this.getDashboardPreferences();
          this.getGlobalDashboardPreferences();
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
            this.setState({ activities: data.data, loading: false });
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

  getDashboardPreferences = () => {
    getService.getCall('Settings.php', {
      action: 'get-dashboard-preferences',
      user_id: window.user.id
    })
    .then((data) => {
      if (data.status === "success") {
        this.setState({
          show_todo: data.data.show_todo,
          show_project: data.data.show_project
        });
      }
    })
    .catch((err) => {
      console.error('Failed to fetch preferences:', err);
    });
  };

  getGlobalDashboardPreferences = () => {
    getService.getCall('Settings.php', {
      action: 'get-global-dashboard-preferences'
    })
    .then((data) => {
      if (data.status === "success") {
        this.setState({
          global_show_todo: data.data.show_todo,
          global_show_project: data.data.show_project
        });
      }
    })
    .catch((err) => {
      console.error('Failed to fetch global preferences:', err);
    });
  };

  handlePreferenceChange = (preferenceType, value) => {
    this.setState({ [preferenceType]: value }, () => {
      // Update preference on server
      getService.editCall('Settings.php', 'update-dashboard-preferences', { [preferenceType]: value, user_id: window.user.id })
      .then((data) => {
        if (data.status === "success") {
          console.log('Preference updated successfully');
          // Dispatch custom event to update dashboard
          window.dispatchEvent(new CustomEvent('dashboardPrefsChanged', {
            detail: {
              show_todo: this.state.show_todo,
              show_project: this.state.show_project
            }
          }));
        } else {
          console.error('Failed to update preference:', data.message);
        }
      })
      .catch((err) => {
        console.error('Failed to update preference:', err);
      });
    });
  };

  handleGlobalPreferenceChange = (preferenceType, value) => {
    this.setState({ [preferenceType]: value }, () => {
      // Update global preference on server
      getService.editCall('Settings.php', 'update-global-dashboard-preferences', { [preferenceType.replace('global_', '')]: value })
      .then((data) => {
        if (data.status === "success") {
          console.log('Global preference updated successfully');
          // Dispatch custom event to update dashboard
          window.dispatchEvent(new CustomEvent('globalDashboardPrefsChanged', {
            detail: {
              show_todo: this.state.global_show_todo,
              show_project: this.state.global_show_project
            }
          }));
        } else {
          console.error('Failed to update global preference:', data.message);
        }
      })
      .catch((err) => {
        console.error('Failed to update global preference:', err);
      });
    });
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
    const { activities, loading, show_todo, show_project, global_show_todo, global_show_project} = this.state;

    return (
      <div id="rightsidebar" className={`right_sidebar ${isOpenRightSidebar ? 'open' : ''}`}>
        <span className="p-3 settingbar float-right" onClick={() => { toggleRightSidebar(); this.getTodayActivity(); }}>
          <i className="fa fa-close" />
        </span>
        <ul className="nav nav-tabs" role="tablist">
           <li className="nav-item">
             <a className="nav-link active" data-toggle="tab" href="#Settings" aria-expanded="true">
               Settings
             </a>
           </li>
           {(window.user.role === 'employee') && (
           <li className="nav-item">
             <a className="nav-link" data-toggle="tab" href="#activity" aria-expanded="false">
               Today Activity
             </a>
           </li>
           )}
         </ul>
        <div className="tab-content">
          <div role="tabpanel" className="tab-pane vivify fadeIn active" id="Settings" aria-expanded="true">
            {/* Dashboard Setting */}
            <div className="mb-4">
                <h6 className="font-14 font-weight-bold text-muted">Dashboard Setting</h6>
                <div className="setting-list list-unstyled mt-1 setting_switch">
                  <li>
                    <label className="custom-checkbox">
                      <input
                        type="checkbox"
                        checked={show_todo}
                        onChange={(e) => this.handlePreferenceChange('show_todo', e.target.checked)}
                      />
                      <span className="checkmark"></span>
                      <span className="custom-checkbox-description">Show Todos</span>
                    </label>
                  </li>
                  <li>
                    <label className="custom-checkbox">
                      <input
                        type="checkbox"
                        checked={show_project}
                        onChange={(e) => this.handlePreferenceChange('show_project', e.target.checked)}
                      />
                      <span className="checkmark"></span>
                      <span className="custom-checkbox-description">Show Projects</span>
                    </label>
                </li>
                  {/* Global Hide  and show Todos and Projects */}
                  {(window.user.role === 'admin' || window.user.role === 'super_admin') && (
                    <>
                      {/* <li>
                        <label className="custom-checkbox">
                          <input
                            type="checkbox"
                            checked={global_show_todo}
                            onChange={(e) => this.handleGlobalPreferenceChange('global_show_todo', e.target.checked)}
                          />
                          <span className="checkmark"></span>
                          <span className="custom-checkbox-description">Global Show Todos</span>
                        </label>
                      </li>
                      <li>
                        <label className="custom-checkbox">
                          <input
                            type="checkbox"
                            checked={global_show_project}
                            onChange={(e) => this.handleGlobalPreferenceChange('global_show_project', e.target.checked)}
                          />
                          <span className="checkmark"></span>
                          <span className="custom-checkbox-description">Global Show Projects</span>
                        </label>
                      </li> */}
                    </>
                  )}
                </div>
            </div>

              {(window.user.role === 'admin' || window.user.role === 'super_admin') && (
                <div>
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
          </div>
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
