
import { NavLink } from "react-router-dom";
import { LogOut } from "lucide-react";
import { sidebarMenu } from "../../constants/sidebarMenu";
import "./Sidebar.css";

function Sidebar() {
  return (
    <aside className="sidebar">
      {/* Logo / Brand */}
      <div className="sidebar-brand">
        <div className="brand-content">
          {/* Logo Mark */}
          <div className="brand-logo">K</div>

          {/* Brand */}
          <div className="brand-text">
            <h1>Kachuli</h1>
            <p>Community Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-navigation">
        <div className="sidebar-sections">
          {sidebarMenu.map((group, index) => (
            <div
              key={group.section || `main-${index}`}
              className="sidebar-section"
            >
              {/* Section Title */}
              {group.section && (
                <p className="section-title">{group.section}</p>
              )}

              {/* Menu Items */}
              <div className="sidebar-items">
                {group.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `sidebar-link ${isActive ? "active" : ""}`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {/* Active Indicator */}
                          <span className="active-indicator" />

                          {/* Icon */}
                          <Icon
                            size={21}
                            strokeWidth={isActive ? 2.2 : 1.9}
                            className="sidebar-icon"
                          />

                          {/* Title */}
                          <span className="sidebar-link-title">
                            {item.title}
                          </span>
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* Logout */}
      <div className="sidebar-logout">
        <button type="button" className="logout-button">
          <LogOut size={21} strokeWidth={1.9} className="logout-icon" />

          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;

