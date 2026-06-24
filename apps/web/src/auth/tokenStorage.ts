const ACCESS_TOKEN_KEY = 'supportmind_access_token';
const CURRENT_WORKSPACE_ID_KEY = 'supportmind_current_workspace_id';

export const saveAccessToken = (token: string) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const getAccessToken = () => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const removeAccessToken = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
};

export function saveCurrentWorkspaceId(workspaceId: string) {
  localStorage.setItem(CURRENT_WORKSPACE_ID_KEY, workspaceId);
}

export function getCurrentWorkspaceId() {
  return localStorage.getItem(CURRENT_WORKSPACE_ID_KEY);
}

export function removeCurrentWorkspaceId() {
  localStorage.removeItem(CURRENT_WORKSPACE_ID_KEY);
}
