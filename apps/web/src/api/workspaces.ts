import {
  getAccessToken,
  getCurrentWorkspaceId,
  removeCurrentWorkspaceId,
  saveCurrentWorkspaceId,
} from '../auth/tokenStorage';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

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

export type WorkspaceMemberWithUser = WorkspaceMembership & {
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
};

export type CreateWorkspaceInput = {
  name: string;
};

export type UpdateWorkspaceInput = {
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

function getWorkspaceHeaders(): HeadersInit {
  const workspaceId = getCurrentWorkspaceId();

  if (!workspaceId) {
    throw new Error('Current workspace id not found');
  }

  return {
    'x-workspace-id': workspaceId,
  };
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

  return response.json() as Promise<Workspace>;
}

export async function getWorkspaces(): Promise<WorkspaceMembership[]> {
  const response = await authorizedFetch('/workspaces');

  if (!response.ok) {
    throw new Error('Failed to fetch workspaces');
  }

  return response.json() as Promise<WorkspaceMembership[]>;
}

export async function getCurrentWorkspace(): Promise<WorkspaceMembership | null> {
  const response = await authorizedFetch('/workspaces/current');

  if (!response.ok) {
    throw new Error('Failed to fetch current workspace');
  }

  return response.json() as Promise<WorkspaceMembership | null>;
}

export async function updateCurrentWorkspace(
  input: UpdateWorkspaceInput,
): Promise<Workspace> {
  const response = await authorizedFetch('/workspaces/current', {
    method: 'PATCH',
    headers: getWorkspaceHeaders(),
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error('Failed to update workspace');
  }

  return response.json() as Promise<Workspace>;
}

export async function getCurrentWorkspaceMembers(): Promise<WorkspaceMemberWithUser[]> {
  const response = await authorizedFetch('/workspaces/current/members', {
    headers: getWorkspaceHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch workspace members');
  }

  return response.json() as Promise<WorkspaceMemberWithUser[]>;
}

export function getStoredCurrentWorkspaceId() {
  return getCurrentWorkspaceId();
}

export function setStoredCurrentWorkspaceId(workspaceId: string) {
  saveCurrentWorkspaceId(workspaceId);
}

export function removeStoredCurrentWorkspaceId() {
  removeCurrentWorkspaceId();
}
