import { useEffect, useState, type ChangeEvent, type SubmitEvent } from 'react';
import {
  getCurrentWorkspaceMembers,
  getWorkspaces,
  updateCurrentWorkspace,
  type WorkspaceMemberWithUser,
} from '../api/workspaces';
import { getCurrentWorkspaceId } from '../auth/tokenStorage';

export function WorkspaceSettingsPage() {
  const [workspaceName, setWorkspaceName] = useState('');
  const [members, setMembers] = useState<WorkspaceMemberWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function loadSettings() {
      const currentWorkspaceId = getCurrentWorkspaceId();

      if (!currentWorkspaceId) {
        setError('No workspace selected.');
        setLoading(false);
        return;
      }

      try {
        const [workspaces, workspaceMembers] = await Promise.all([
          getWorkspaces(),
          getCurrentWorkspaceMembers(),
        ]);
        const currentMembership = workspaces.find(
          (membership) => membership.workspaceId === currentWorkspaceId,
        );
        setWorkspaceName(currentMembership?.workspace.name ?? '');
        setMembers(workspaceMembers);
      } catch {
        setError('Workspace settings could not be loaded.');
      } finally {
        setLoading(false);
      }
    }

    void loadSettings();
  }, []);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const updated = await updateCurrentWorkspace({ name: workspaceName });
      setWorkspaceName(updated.name);
      setSuccess('Workspace updated.');
    } catch {
      setError('Workspace could not be updated. You may need owner access.');
    } finally {
      setSaving(false);
    }
  }

  function handleWorkspaceNameChange(event: ChangeEvent<HTMLInputElement>) {
    setWorkspaceName(event.target.value);
  }

  if (loading) {
    return <p>Loading workspace settings...</p>;
  }

  return (
    <section className="page-section">
      <h1>Workspace settings</h1>
      {error && <p className="error-text">{error}</p>}
      {success && <p className="success-text">{success}</p>}

      <form onSubmit={handleSubmit} className="card stack">
        <label htmlFor="workspaceName">Workspace name</label>
        <input id="workspaceName" value={workspaceName} onChange={handleWorkspaceNameChange} />
        <button type="submit" disabled={saving || !workspaceName.trim()}>
          {saving ? 'Saving...' : 'Save workspace'}
        </button>
      </form>

      <section className="card stack">
        <h2>Members</h2>
        {members.length === 0 ? (
          <p>No members found.</p>
        ) : (
          <ul>
            {members.map((member) => (
              <li key={member.id}>
                {member.user.email} — {member.role}
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
