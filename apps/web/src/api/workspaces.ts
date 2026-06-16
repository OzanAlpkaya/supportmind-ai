import { getAccessToken } from '../auth/tokenStorage';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

const CURRENT_WORKSPACE_ID_KEY = 'supportmind_current_workspace_id';

export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export type Workspace = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type WorkspaceMembership = {
  id: string;
  role: WorkspaceRole;
  createdAt: string;
  updatedAt: string;
  userId: string;
  workspaceId: string;
  workspace: Workspace;
};

export type CreateWorkspaceInput = {
  name: string;
};

async function authorizedFetch(path: string, options: RequestInit = {}) {
  const token = getAccessToken();

  if (!token) {
    throw new Error('Missing access token');
  }

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
}

export async function createWorkspace(
  input: CreateWorkspaceInput,
): Promise<Workspace> {
  const response = await authorizedFetch('/workspaces', {
    method: 'POST',
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error('Failed to create workspace');
  }

  return response.json();
}

export async function getWorkspaces(): Promise<WorkspaceMembership[]> {
  const response = await authorizedFetch('/workspaces');

  if (!response.ok) {
    throw new Error('Failed to fetch workspaces');
  }

  return response.json();
}

export async function getCurrentWorkspace(): Promise<WorkspaceMembership | null> {
  const response = await authorizedFetch('/workspaces/current');

  if (!response.ok) {
    throw new Error('Failed to fetch current workspace');
  }

  return response.json();
}

export function getStoredCurrentWorkspaceId() {
  return localStorage.getItem(CURRENT_WORKSPACE_ID_KEY);
}

export function setStoredCurrentWorkspaceId(workspaceId: string) {
  localStorage.setItem(CURRENT_WORKSPACE_ID_KEY, workspaceId);
}

export function removeStoredCurrentWorkspaceId() {
  localStorage.removeItem(CURRENT_WORKSPACE_ID_KEY);
}
