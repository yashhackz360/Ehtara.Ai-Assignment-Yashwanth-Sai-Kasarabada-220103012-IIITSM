import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineViewGrid,
  HiOutlineFolder,
  HiOutlineLogout,
  HiOutlineMenuAlt2,
  HiOutlineX,
} from 'react-icons/hi';
import './Layout.css';

const NAV_ITEMS = [
  { to: '/', icon: HiOutlineViewGrid, label: 'Dashboard', end: true },
  { to: '/projects', icon: HiOutlineFolder, label: 'Projects' },
];

function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const getInitials = (name) =>
    name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  const getAvatarColor = (name) => {
    const colors = ['#9d4300', '#006b5f', '#6d3bd7', '#c25300', '#005048', '#5516be'];
    let hash = 0;
    for (let i = 0; i < name.length; i++)
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const getPageTitle = () => {
    if (location.pathname === '/') return 'Dashboard';
    if (location.pathname.startsWith('/projects/')) return 'Project';
    if (location.pathname === '/projects') return 'Projects';
    return 'TaskFlow';
  };

  return (
    <div className="layout">
      {/* ── Sidebar ── */}
      <aside className={`sidebar ${collapsed ? 'sidebar-hidden' : ''}`}>
        <div className="sidebar-logo-wrap">
          <div className="sidebar-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" />
            </svg>
          </div>
          <span className="sidebar-logo-text">TaskFlow</span>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
              }
            >
              <item.icon className="sidebar-link-icon" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div
              className="avatar"
              style={{ background: getAvatarColor(user?.name || 'U') }}
            >
              {getInitials(user?.name || 'User')}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user?.name}</span>
              <span className="sidebar-user-email">{user?.email}</span>
            </div>
          </div>
          <button className="sidebar-logout-btn" onClick={handleLogout}>
            <HiOutlineLogout />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main wrapper — grows to fill remaining space ── */}
      <div className="main-wrapper">
        {/* Sticky top bar */}
        <header className="top-bar">
          <div className="top-bar-left">
            <button
              className="top-bar-toggle"
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? 'Open navigation' : 'Close navigation'}
              aria-label="Toggle sidebar"
            >
              {collapsed ? <HiOutlineMenuAlt2 /> : <HiOutlineX />}
            </button>
            <div className="top-bar-divider" />
            <span className="top-bar-page">{getPageTitle()}</span>
          </div>
          <div className="top-bar-right">
            <div className="top-bar-user">
              <div
                className="avatar avatar-sm"
                style={{ background: getAvatarColor(user?.name || 'U') }}
              >
                {getInitials(user?.name || 'User')}
              </div>
              <span className="top-bar-username">{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="main-content">
          <div className="page-container">
            <Outlet />
          </div>

          {/* Attribution Footer */}
          <footer className="app-footer">
            <div className="app-footer-inner">
              <div className="app-footer-badge">
                <span className="app-footer-name">Yashwanth Sai Kasarabada</span>
              </div>
              <span className="app-footer-roll">Roll No: 220103012</span>
              <span className="app-footer-inst">Indian Institute of Information Technology Senapati, Manipur</span>
              <span className="app-footer-assign">
                Hiring Assignment — <strong>Team Task Manager</strong> &nbsp;·&nbsp; ethara.ai &middot; AI Full Stack Developer
              </span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default Layout;
