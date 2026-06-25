import { useEffect, useState, type ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchDashboardSummary, type DashboardSummary } from '../api/dashboard';
import {
  getStoredCurrentWorkspaceId,
  getWorkspaces,
  removeStoredCurrentWorkspaceId,
  setStoredCurrentWorkspaceId,
  type WorkspaceMembership,
} from '../api/workspaces';
import { removeAccessToken } from '../auth/tokenStorage';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string | null>(null);
  const [workspaceMemberships, setWorkspaceMemberships] = useState<WorkspaceMembership[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [workspaceError, setWorkspaceError] = useState('');
  const [summaryError, setSummaryError] = useState('');

  useEffect(() => {
    async function loadWorkspaces() {
      try {
        const data = await getWorkspaces();
        setWorkspaceMemberships(data);

        if (data.length === 0) {
          navigate('/workspaces/new');
          return;
        }

        const storedWorkspaceId = getStoredCurrentWorkspaceId();
        const storedWorkspaceExists = data.some(
          (membership) => membership.workspaceId === storedWorkspaceId,
        );

        if (storedWorkspaceId && storedWorkspaceExists) {
          setCurrentWorkspaceId(storedWorkspaceId);
          return;
        }

        const firstWorkspaceId = data[0]?.workspaceId ?? null;
        setCurrentWorkspaceId(firstWorkspaceId);

        if (firstWorkspaceId) {
          setStoredCurrentWorkspaceId(firstWorkspaceId);
        }
      } catch {
        setWorkspaceError('Workspaces could not be loaded.');
      } finally {
        setIsLoadingWorkspaces(false);
      }
    }

    void loadWorkspaces();
  }, [navigate]);

  useEffect(() => {
    async function loadSummary() {
      if (!currentWorkspaceId) {
        return;
      }

      setIsLoadingSummary(true);
      setSummaryError('');

      try {
        const data = await fetchDashboardSummary();
        setSummary(data);
      } catch {
        setSummaryError('Dashboard summary could not be loaded.');
      } finally {
        setIsLoadingSummary(false);
      }
    }

    void loadSummary();
  }, [currentWorkspaceId]);

  const currentWorkspaceMembership =
    workspaceMemberships.find((membership) => membership.workspaceId === currentWorkspaceId) ?? null;

  const handleCurrentWorkspaceChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextWorkspaceId = event.target.value;
    setCurrentWorkspaceId(nextWorkspaceId);
    setStoredCurrentWorkspaceId(nextWorkspaceId);
  };

  const handleLogout = () => {
    removeAccessToken();
    removeStoredCurrentWorkspaceId();
    navigate('/login');
  };

  return (
    <section className="page-section">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Workspace overview and recent support activity.</p>
        </div>
        <button type="button" onClick={handleLogout} className="secondary-button">
          Logout
        </button>
      </div>

      {currentWorkspaceMembership && (
        <section className="card stack">
          <h2>Current workspace</h2>
          <p>
            {currentWorkspaceMembership.workspace.name} — {currentWorkspaceMembership.role}
          </p>
          <label htmlFor="workspace-select">Switch workspace</label>
          <select
            id="workspace-select"
            value={currentWorkspaceId ?? ''}
            onChange={handleCurrentWorkspaceChange}
          >
            {workspaceMemberships.map((membership) => (
              <option key={membership.id} value={membership.workspaceId}>
                {membership.workspace.name}
              </option>
            ))}
          </select>
        </section>
      )}

      {workspaceError && <p className="error-text">{workspaceError}</p>}
      {summaryError && <p className="error-text">{summaryError}</p>}

      {isLoadingWorkspaces || isLoadingSummary ? (
        <p>Loading dashboard...</p>
      ) : summary ? (
        <>
          <section className="stats-grid">
            <div className="stat-card"><span>Customers</span><strong>{summary.totals.customers}</strong></div>
            <div className="stat-card"><span>Conversations</span><strong>{summary.totals.conversations}</strong></div>
            <div className="stat-card"><span>Open</span><strong>{summary.totals.openConversations}</strong></div>
            <div className="stat-card"><span>Pending</span><strong>{summary.totals.pendingConversations}</strong></div>
            <div className="stat-card"><span>Resolved</span><strong>{summary.totals.resolvedConversations}</strong></div>
            <div className="stat-card"><span>Documents</span><strong>{summary.totals.documents}</strong></div>
          </section>

          <section className="two-column-grid">
            <div className="card stack">
              <h2>Recent conversations</h2>
              {summary.recentConversations.length === 0 ? (
                <p>No conversations yet.</p>
              ) : (
                <ul>
                  {summary.recentConversations.map((conversation) => (
                    <li key={conversation.id}>
                      <Link to={`/conversations/${conversation.id}`}>
                        {conversation.subject ?? conversation.customer.email}
                      </Link>{' '}
                      — {conversation.status}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="card stack">
              <h2>Recent documents</h2>
              {summary.recentDocuments.length === 0 ? (
                <p>No documents yet.</p>
              ) : (
                <ul>
                  {summary.recentDocuments.map((document) => (
                    <li key={document.id}>
                      <Link to={`/knowledge-base/${document.id}`}>{document.title}</Link> —{' '}
                      {document.status}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </>
      ) : null}

      <section className="quick-actions">
        <Link to="/inbox">Open support inbox</Link>
        <Link to="/knowledge-base">Open knowledge base</Link>
        <Link to="/ai">Ask AI</Link>
        <Link to="/workspaces/new">Create workspace</Link>
      </section>
    </section>
  );
};

export default DashboardPage;
