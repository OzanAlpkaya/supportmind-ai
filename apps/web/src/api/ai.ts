import { getAccessToken, getCurrentWorkspaceId } from '../auth/tokenStorage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export type AiSource = {
  chunkId: string;
  documentId: string;
  documentTitle: string;
  content: string;
  distance: number;
  similarityScore: number;
};

export type AiAnswerResponse = {
  answer: string;
  sources: AiSource[];
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
    'Content-Type': 'application/json',
    'x-workspace-id': workspaceId,
  };
}

export async function askAi(question: string): Promise<AiAnswerResponse> {
  const response = await fetch(`${API_BASE_URL}/ai/answer`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ question }),
  });

  if (!response.ok) {
    throw new Error('Failed to ask AI');
  }

  return response.json();
}

export async function suggestConversationReply(
  conversationId: string,
): Promise<AiAnswerResponse> {
  const response = await fetch(
    `${API_BASE_URL}/conversations/${conversationId}/ai-suggest-reply`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error('Failed to suggest AI reply');
  }

  return response.json();
}
