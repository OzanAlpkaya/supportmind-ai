import { getAccessToken, getCurrentWorkspaceId } from '../auth/tokenStorage';
import type { ConversationListItem } from './conversations';
import type { Document } from './documents';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export type DashboardSummary = {
  totals: {
    customers: number;
    conversations: number;
    openConversations: number;
    pendingConversations: number;
    resolvedConversations: number;
    documents: number;
  };
  recentConversations: ConversationListItem[];
  recentDocuments: Document[];
};

function getAuthHeaders(): HeadersInit {
  const accessToken = getAccessToken();
  const workspaceId = getCurrentWorkspaceId();

  if (!accessToken) {
    throw new Error('Access token not found');
  }

  if (!workspaceId) {
    throw new Error('Current workspace id not found');
  }

  return {
    Authorization: `Bearer ${accessToken}`,
    'x-workspace-id': workspaceId,
  };
}

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const response = await fetch(`${API_BASE_URL}/dashboard/summary`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch dashboard summary');
  }

  return response.json();
}
