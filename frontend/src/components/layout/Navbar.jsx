import { useLocation } from "react-router-dom";
import { Bell, ChevronDown, UserCircle } from "lucide-react";
import "./Navbar.css";

const pageTitles = {
  "/dashboard": "Dashboard",
  "/groups": "Groups",
  "/subgroups": "Subgroups",
  "/members": "Members",
  "/savings": "Savings",
  "/loans": "Loans",
  "/installments": "Installments",
  "/expenses": "Expenses",
  "/reports": "Reports",
  "/settings": "Settings",
};

function Navbar() {
  const location = useLocation();

  const title = pageTitles[location.pathname] || "Kachuli";

  return (
    <header className="navbar">
      {/* Page Title */}
      <div className="navbar-title">
        {/* <h2>{title}</h2>

        <p>Community Management System</p> */}
      </div>

      {/* Right Side */}
      <div className="navbar-actions">
        {/* Notifications */}
        <button type="button" className="notification-button">
          <Bell size={20} strokeWidth={1.8} />

          {/* Notification Dot */}
          <span className="notification-dot" />
        </button>

        {/* Divider */}
        <div className="navbar-divider" />

        {/* Admin */}
        <button type="button" className="admin-button">
          {/* Avatar */}
          <div className="admin-avatar">
            <UserCircle size={23} strokeWidth={1.8} />
          </div>

          {/* User Info */}
          <div className="admin-info">
            <p>Admin</p>
            <span>Administrator</span>
          </div>

          <ChevronDown size={16} className="admin-chevron" />
        </button>
      </div>
    </header>
  );
}

export default Navbar;

