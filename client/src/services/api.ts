import type { ApiResponse } from '@/types';
import { auth } from '@/lib/firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const user = auth.currentUser;
  if (!user) return {};

  const token = await user.getIdToken();
  return {
    Authorization: `Bearer ${token}`,
  };
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const authHeaders = await getAuthHeaders();

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data: ApiResponse<T> = await response.json();

  if (!response.ok) {
    throw new ApiError(data.message || 'An unexpected error occurred', response.status, data.errors);
  }

  return data;
}

export class ApiError extends Error {
  status: number;
  errors: string[] | null;

  constructor(message: string, status: number, errors: string[] | null = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),

  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),

  upload: async <T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> => {
    const authHeaders = await getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        ...authHeaders,
      },
      body: formData,
    });

    const data: ApiResponse<T> = await response.json();

    if (!response.ok) {
      throw new ApiError(data.message || 'Upload failed', response.status, data.errors);
    }

    return data;
  },
};

export default api;
