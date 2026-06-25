import { getAccessToken } from '../auth/tokenStorage';
import type { AiAnswerResponse } from './ai';
import type { Customer } from './customers';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export type ConversationStatus = 'OPEN' | 'PENDING' | 'RESOLVED' | 'CLOSED';
export type MessageSender = 'CUSTOMER' | 'AGENT' | 'SYSTEM';
export type MessageType = 'TEXT' | 'NOTE';

export type Message = {
  id: string;
  body: string;
  sender: MessageSender;
  type: MessageType;
  conversationId: string;
  createdAt: string;
  updatedAt: string;
};

export type Conversation = {
  id: string;
  subject: string | null;
  status: ConversationStatus;
  workspaceId: string;
  customerId: string;
  createdAt: string;
  updatedAt: string;
};

export type ConversationWithCustomer = Conversation & {
  customer: Customer;
};

export type ConversationListItem = ConversationWithCustomer & {
  messages: Message[];
};

export type ConversationDetail = ConversationWithCustomer & {
  messages: Message[];
};

export type CreateConversationInput = {
  customerId: string;
  subject?: string;
};

export type CreateMessageInput = {
  body: string;
  sender: MessageSender;
  type?: MessageType;
};

function getAuthHeaders(workspaceId: string): HeadersInit {
  const token = getAccessToken();

  if (!token) {
    throw new Error('Access token is missing');
  }

  return {
    Authorization: `Bearer ${token}`,
    'x-workspace-id': workspaceId,
  };
}

export async function fetchConversations(
  workspaceId: string,
): Promise<ConversationListItem[]> {
  const response = await fetch(`${API_BASE_URL}/conversations`, {
    headers: getAuthHeaders(workspaceId),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch conversations');
  }

  return response.json() as Promise<ConversationListItem[]>;
}

export async function fetchConversation(
  workspaceId: string,
  conversationId: string,
): Promise<ConversationDetail> {
  const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}`, {
    headers: getAuthHeaders(workspaceId),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch conversation');
  }

  return response.json() as Promise<ConversationDetail>;
}

export async function createConversation(
  workspaceId: string,
  input: CreateConversationInput,
): Promise<ConversationWithCustomer> {
  const response = await fetch(`${API_BASE_URL}/conversations`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(workspaceId),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error('Failed to create conversation');
  }

  return response.json() as Promise<ConversationWithCustomer>;
}

export async function updateConversationStatus(
  workspaceId: string,
  conversationId: string,
  status: ConversationStatus,
): Promise<ConversationDetail> {
  const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/status`, {
    method: 'PATCH',
    headers: {
      ...getAuthHeaders(workspaceId),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error('Failed to update conversation status');
  }

  return response.json() as Promise<ConversationDetail>;
}

export async function suggestAiReply(
  workspaceId: string,
  conversationId: string,
): Promise<AiAnswerResponse> {
  const response = await fetch(
    `${API_BASE_URL}/conversations/${conversationId}/ai-suggest-reply`,
    {
      method: 'POST',
      headers: getAuthHeaders(workspaceId),
    },
  );

  if (!response.ok) {
    throw new Error('Failed to suggest AI reply');
  }

  return response.json() as Promise<AiAnswerResponse>;
}

export async function createMessage(
  workspaceId: string,
  conversationId: string,
  input: CreateMessageInput,
): Promise<Message> {
  const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(workspaceId),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error('Failed to create message');
  }

  return response.json() as Promise<Message>;
}
