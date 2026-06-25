import { getAccessToken } from '../auth/tokenStorage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export type Profile = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpdateProfileInput = {
  firstName?: string;
  lastName?: string;
};

function getAuthHeaders(): HeadersInit {
  const accessToken = getAccessToken();

  if (!accessToken) {
    throw new Error('Access token not found');
  }

  return {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };
}

export async function fetchProfile(): Promise<Profile> {
  const response = await fetch(`${API_BASE_URL}/profile`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch profile');
  }

  return response.json();
}

export async function updateProfile(input: UpdateProfileInput): Promise<Profile> {
  const response = await fetch(`${API_BASE_URL}/profile`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error('Failed to update profile');
  }

  return response.json();
}
