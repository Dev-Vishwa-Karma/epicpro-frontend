import React from 'react';

const RightSidebar = ({ 
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
  handleIconColor, 
  handleGradientColor, 
  handleRtl 
}) => {
  return (
    <div id="rightsidebar" className={`right_sidebar ${isOpenRightSidebar ? 'open' : ''}`}>
      <span className="p-3 settingbar float-right" onClick={toggleRightSidebar}>
        <i className="fa fa-close" />
      </span>
      <ul className="nav nav-tabs" role="tablist">
        <li className="nav-item">
          <a className="nav-link active" data-toggle="tab" href="#Settings" aria-expanded="true">
            Settings
          </a>
        </li>
        <li className="nav-item">
          <a className="nav-link" data-toggle="tab" href="#activity" aria-expanded="false">
            Activity
          </a>
        </li>
      </ul>
      <div className="tab-content">
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
                //{ label: 'Icon Color', onChange: handleIconColor },
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

        <div role="tabpanel" className="tab-pane vivify fadeIn" id="activity" aria-expanded="false">
          <ul className="new_timeline mt-3">
            {/* Example of activity */}
            <li>
              <div className="bullet pink" />
              <div className="time">11:00am</div>
              <div className="desc">
                <h3>Attendance</h3>
                <h4>Computer Class</h4>
              </div>
            </li>
            {/* Repeat other activities as needed */}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
