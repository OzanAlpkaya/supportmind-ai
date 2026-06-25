import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { removeAccessToken, removeCurrentWorkspaceId } from '../auth/tokenStorage';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '⌘' },
  { to: '/inbox', label: 'Inbox', icon: '✦' },
  { to: '/knowledge-base', label: 'Knowledge Base', icon: '◈' },
  { to: '/ai', label: 'AI Assistant', icon: '✧' },
  { to: '/settings/profile', label: 'Profile', icon: '◌' },
  { to: '/settings/workspace', label: 'Workspace', icon: '▣' },
];

export function AppShell() {
  const navigate = useNavigate();

  function handleLogout() {
    removeAccessToken();
    removeCurrentWorkspaceId();
    navigate('/login', { replace: true });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">SM</div>
          <div>
            <span>SupportMind</span>
            <small>AI Support OS</small>
          </div>
        </div>

        <nav className="nav-list" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className="nav-link">
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-status">
            <span className="status-dot" />
            <span>Workspace active</span>
          </div>
          <button type="button" onClick={handleLogout} className="button button-secondary full-width">
            Logout
          </button>
        </div>
      </aside>

      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}
