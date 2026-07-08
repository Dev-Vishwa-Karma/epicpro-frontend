import React from 'react';
import { NavLink } from 'react-router-dom';

const HeaderTop = ({
  darkMinSidebar,
  user,
  toggleLeftMenu,
  toggleRightSidebar,
  istoggleLeftMenu,
  handler,
  content
}) => {
  return (
    <div id="header_top" className={`header_top ${darkMinSidebar && 'dark'}`}>
      <div className="container">
        <div className="hleft">
          <NavLink to="/" onClick={() => handler('hr', 'dashboard')} className="header-brand">
            <i className="fe fe-command brand-logo" />
          </NavLink>
          <div className="header-menu-icons">
            {content && content.flatMap(section => section.content || []).map((item, index) => (
              <div className="dropdown" key={item.id || index} title={item.label}>
                <NavLink
                  exact={item.to === '/'}
                  to={item.to || "#!"}
                  className="nav-link icon"
                  onClick={() => {
                    if (handler && item.to && item.to !== '#!') {
                      const links = item.to.substring(1).split(/-(.+)/);
                      handler(links[0], links[1] || '');
                    }
                  }}
                >
                  <i className={item.icon || "fa fa-circle-o"} />
                </NavLink>
              </div>
            ))}
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
