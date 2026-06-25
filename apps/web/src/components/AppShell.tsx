import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { removeAccessToken, removeCurrentWorkspaceId } from '../auth/tokenStorage';

export function AppShell() {
  const navigate = useNavigate();

  function handleLogout() {
    removeAccessToken();
    removeCurrentWorkspaceId();
    navigate('/login');
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link to="/dashboard" className="brand">
          SupportMind AI
        </Link>
        <nav className="nav-list">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/inbox">Inbox</NavLink>
          <NavLink to="/knowledge-base">Knowledge Base</NavLink>
          <NavLink to="/ai">AI Assistant</NavLink>
          <NavLink to="/settings/profile">Profile</NavLink>
          <NavLink to="/settings/workspace">Workspace</NavLink>
        </nav>
        <button type="button" onClick={handleLogout} className="secondary-button">
          Logout
        </button>
      </aside>
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}
