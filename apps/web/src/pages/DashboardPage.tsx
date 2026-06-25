import { useEffect, useState, type ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchDashboardSummary, type DashboardSummary } from '../api/dashboard';
import {
  getStoredCurrentWorkspaceId,
  getWorkspaces,
  setStoredCurrentWorkspaceId,
  type WorkspaceMembership,
} from '../api/workspaces';

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

  function handleCurrentWorkspaceChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextWorkspaceId = event.target.value;
    setCurrentWorkspaceId(nextWorkspaceId);
    setStoredCurrentWorkspaceId(nextWorkspaceId);
  }

  return (
    <section className="page-section">
      <header className="page-header hero-header">
        <div>
          <div className="eyebrow">Command center</div>
          <h1>Dashboard</h1>
          <p>Workspace overview, recent support activity, and quick access to the AI workflow.</p>
        </div>

        {currentWorkspaceMembership && (
          <div className="workspace-switcher">
            <span>{currentWorkspaceMembership.workspace.name}</span>
            <select value={currentWorkspaceId ?? ''} onChange={handleCurrentWorkspaceChange}>
              {workspaceMemberships.map((membership) => (
                <option key={membership.id} value={membership.workspaceId}>
                  {membership.workspace.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </header>

      {workspaceError && <p className="alert alert-error">{workspaceError}</p>}
      {summaryError && <p className="alert alert-error">{summaryError}</p>}

      {isLoadingWorkspaces || isLoadingSummary ? (
        <div className="skeleton-card">Loading dashboard...</div>
      ) : summary ? (
        <>
          <div className="stats-grid dashboard-stats">
            <div className="stat-card"><span>Customers</span><strong>{summary.totals.customers}</strong></div>
            <div className="stat-card"><span>Conversations</span><strong>{summary.totals.conversations}</strong></div>
            <div className="stat-card accent"><span>Open</span><strong>{summary.totals.openConversations}</strong></div>
            <div className="stat-card"><span>Pending</span><strong>{summary.totals.pendingConversations}</strong></div>
            <div className="stat-card"><span>Resolved</span><strong>{summary.totals.resolvedConversations}</strong></div>
            <div className="stat-card"><span>Documents</span><strong>{summary.totals.documents}</strong></div>
          </div>

          <div className="two-column-grid">
            <section className="panel-card">
              <div className="panel-heading">
                <div><h2>Recent conversations</h2><p>Latest customer threads.</p></div>
                <Link to="/inbox" className="subtle-link">View all</Link>
              </div>
              {summary.recentConversations.length === 0 ? (
                <div className="empty-state compact">No conversations yet.</div>
              ) : (
                <div className="compact-list">
                  {summary.recentConversations.map((conversation) => (
                    <Link key={conversation.id} to={`/conversations/${conversation.id}`}>
                      <span>{conversation.subject ?? conversation.customer.email}</span>
                      <small>{conversation.status}</small>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section className="panel-card">
              <div className="panel-heading">
                <div><h2>Recent documents</h2><p>Fresh KB content.</p></div>
                <Link to="/knowledge-base" className="subtle-link">View all</Link>
              </div>
              {summary.recentDocuments.length === 0 ? (
                <div className="empty-state compact">No documents yet.</div>
              ) : (
                <div className="compact-list">
                  {summary.recentDocuments.map((document) => (
                    <Link key={document.id} to={`/knowledge-base/${document.id}`}>
                      <span>{document.title}</span>
                      <small>{document.status}</small>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>
        </>
      ) : null}

      <div className="quick-actions">
        <Link to="/inbox" className="button button-secondary">Open inbox</Link>
        <Link to="/knowledge-base" className="button button-secondary">Open knowledge base</Link>
        <Link to="/ai" className="button button-primary">Ask AI</Link>
        <Link to="/workspaces/new" className="button button-secondary">Create workspace</Link>
      </div>
    </section>
  );
};

export default DashboardPage;
