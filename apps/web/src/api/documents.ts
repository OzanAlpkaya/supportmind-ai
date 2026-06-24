import { getAccessToken, getCurrentWorkspaceId } from '../auth/tokenStorage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export type DocumentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type Document = {
  id: string;
  title: string;
  content: string;
  status: DocumentStatus;
  createdAt: string;
  updatedAt: string;
  workspaceId: string;
};

export type CreateDocumentInput = {
  title: string;
  content: string;
  status?: DocumentStatus;
};

export type UpdateDocumentInput = {
  title?: string;
  content?: string;
  status?: DocumentStatus;
};

function getAuthHeaders() {
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

export async function createDocument(input: CreateDocumentInput): Promise<Document> {
  const response = await fetch(`${API_BASE_URL}/documents`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error('Failed to create document');
  }

  return response.json();
}

export async function getDocuments(): Promise<Document[]> {
  const response = await fetch(`${API_BASE_URL}/documents`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch documents');
  }

  return response.json();
}

export async function getDocument(documentId: string): Promise<Document> {
  const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch document');
  }

  return response.json();
}

export async function updateDocument(
  documentId: string,
  input: UpdateDocumentInput,
): Promise<Document> {
  const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error('Failed to update document');
  }

  return response.json();
}

export async function deleteDocument(documentId: string): Promise<Document> {
  const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to delete document');
  }

  return response.json();
}
