import { getAccessToken } from '../auth/tokenStorage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export type Customer = {
  id: string;
  email: string;
  name: string | null;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateCustomerInput = {
  email: string;
  name?: string;
};

export async function fetchCustomers(workspaceId: string): Promise<Customer[]> {
  const token = getAccessToken();

  if (!token) {
    throw new Error('Access token is missing');
  }

  const response = await fetch(`${API_BASE_URL}/customers`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'x-workspace-id': workspaceId,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch customers');
  }

  return response.json() as Promise<Customer[]>;
}

export async function createCustomer(
  workspaceId: string,
  input: CreateCustomerInput,
): Promise<Customer> {
  const token = getAccessToken();

  if (!token) {
    throw new Error('Access token is missing');
  }

  const response = await fetch(`${API_BASE_URL}/customers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-workspace-id': workspaceId,
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error('Failed to create customer');
  }

  return response.json() as Promise<Customer>;
}
