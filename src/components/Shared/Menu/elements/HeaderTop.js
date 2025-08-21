import React from 'react';
import { NavLink } from 'react-router-dom';

const HeaderTop = ({
  darkMinSidebar,
  user,
  toggleLeftMenu,
  toggleRightSidebar,
  istoggleLeftMenu,
  handler
}) => {
  return (
    <div id="header_top" className={`header_top ${darkMinSidebar && 'dark'}`}>
      <div className="container">
        <div className="hleft">
          <NavLink to="/" onClick={() => handler('hr', 'dashboard')} className="header-brand">
            <i className="fe fe-command brand-logo" />
          </NavLink>
          <div className="dropdown">
            <NavLink to="/hr-events" className="nav-link icon app_inbox">
              <i className="fa fa-calendar" />
            </NavLink>
          </div>
        </div>
        <div className="hright">
          <div className="dropdown">
              <div>
                <span className="nav-link icon settingbar" onClick={toggleRightSidebar}>
                  <i
                    className="fa fa-gear fa-spin"
                    data-toggle="tooltip"
                    data-placement="right"
                    title="Settings"
                  />
                </span>
              </div>
            <p className="nav-link icon menu_toggle" onClick={() => toggleLeftMenu(!istoggleLeftMenu)}>
              <i className="fa fa-align-left" />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderTop;
