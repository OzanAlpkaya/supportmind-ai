import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import {
  getStoredCurrentWorkspaceId,
  getWorkspaces,
  setStoredCurrentWorkspaceId,
  type WorkspaceMembership,
} from '../api/workspaces';

export function WorkspaceSettingsPage() {
  const [memberships, setMemberships] = useState<WorkspaceMembership[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(
    getStoredCurrentWorkspaceId(),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadWorkspaces() {
      try {
        setErrorMessage(null);

        const workspaceMemberships = await getWorkspaces();
        setMemberships(workspaceMemberships);

        const storedWorkspaceId = getStoredCurrentWorkspaceId();
        const fallbackWorkspaceId = workspaceMemberships[0]?.workspace.id ?? null;

        if (!storedWorkspaceId && fallbackWorkspaceId) {
          setStoredCurrentWorkspaceId(fallbackWorkspaceId);
          setSelectedWorkspaceId(fallbackWorkspaceId);
        }
      } catch {
        setErrorMessage('Failed to load workspace settings.');
      } finally {
        setIsLoading(false);
      }
    }

    void loadWorkspaces();
  }, []);

  const selectedMembership = useMemo(() => {
    return (
      memberships.find((membership) => membership.workspace.id === selectedWorkspaceId) ??
      memberships[0] ??
      null
    );
  }, [memberships, selectedWorkspaceId]);

  function handleWorkspaceChange(event: ChangeEvent<HTMLSelectElement>) {
    const workspaceId = event.target.value;

    setStoredCurrentWorkspaceId(workspaceId);
    setSelectedWorkspaceId(workspaceId);
  }

  if (isLoading) {
    return (
      <section className="page-section">
        <p className="muted-text">Loading workspace settings...</p>
      </section>
    );
  }

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Workspace</p>
          <h1>Workspace Settings</h1>
          <p className="page-description">
            Manage the active workspace context used by SupportMind AI.
          </p>
        </div>
      </div>

      {errorMessage && <div className="alert alert-error">{errorMessage}</div>}

      <div className="settings-grid">
        <article className="panel-card">
          <div className="panel-header">
            <div>
              <h2>Active workspace</h2>
              <p>Select which workspace the app should use for inbox, knowledge base and AI.</p>
            </div>
          </div>

          {memberships.length === 0 ? (
            <p className="muted-text">No workspaces found.</p>
          ) : (
            <div className="form-stack">
              <label className="form-field">
                <span>Workspace</span>
                <select
                  value={selectedMembership?.workspace.id ?? ''}
                  onChange={handleWorkspaceChange}
                >
                  {memberships.map((membership) => (
                    <option key={membership.id} value={membership.workspace.id}>
                      {membership.workspace.name}
                    </option>
                  ))}
                </select>
              </label>

              {selectedMembership && (
                <div className="details-list">
                  <div>
                    <span>Name</span>
                    <strong>{selectedMembership.workspace.name}</strong>
                  </div>
                  <div>
                    <span>Your role</span>
                    <strong>{selectedMembership.role}</strong>
                  </div>
                  <div>
                    <span>Workspace ID</span>
                    <strong>{selectedMembership.workspace.id}</strong>
                  </div>
                </div>
              )}
            </div>
          )}
        </article>

        <article className="panel-card">
          <div className="panel-header">
            <div>
              <h2>Members</h2>
              <p>Member management will be added after the backend members API is implemented.</p>
            </div>
          </div>

          <div className="empty-state">
            <strong>Read-only for now</strong>
            <p>
              The current frontend API does not expose workspace members yet. This page avoids
              calling non-existing endpoints.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
