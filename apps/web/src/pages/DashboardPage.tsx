import { useEffect, useState, type ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true);
  const [workspaceError, setWorkspaceError] = useState('');

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

    loadWorkspaces();
  }, [navigate]);

  const currentWorkspaceMembership =
    workspaceMemberships.find((membership) => membership.workspaceId === currentWorkspaceId) ??
    null;

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
    <main>
      <h1>Dashboard</h1>
      <p>You are logged in.</p>

      {currentWorkspaceMembership && (
        <section>
          <h2>Current workspace</h2>
          <p>
            <strong>{currentWorkspaceMembership.workspace.name}</strong> —{' '}
            {currentWorkspaceMembership.role}
          </p>

          <label htmlFor="current-workspace">Switch workspace</label>
          <select
            id="current-workspace"
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

      <section>
        <h2>Workspaces</h2>

        <Link to="/workspaces/new">Create workspace</Link>

        {isLoadingWorkspaces && <p>Loading workspaces...</p>}

        {workspaceError && <p>{workspaceError}</p>}

        {!isLoadingWorkspaces && !workspaceError && workspaceMemberships.length === 0 && (
          <p>No workspaces found.</p>
        )}

        {!isLoadingWorkspaces && !workspaceError && workspaceMemberships.length > 0 && (
          <ul>
            {workspaceMemberships.map((membership) => (
              <li key={membership.id}>
                <strong>{membership.workspace.name}</strong> — {membership.role}
              </li>
            ))}
          </ul>
        )}
      </section>

      <button type="button" onClick={handleLogout}>
        Logout
      </button>
    </main>
  );
};

export default DashboardPage;
