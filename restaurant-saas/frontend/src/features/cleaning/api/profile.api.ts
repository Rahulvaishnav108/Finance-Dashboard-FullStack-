import type { AxiosRequestConfig } from 'axios';
import { apiClient } from '../../../shared/services/apiClient';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ProfileMetric {
  label: string;
  value: string;
  delta: string;
  tone?: 'purple' | 'amber' | 'blue' | 'green';
}

export interface ProfileArea {
  label: string;
  tone?: 'purple' | 'pink' | 'amber' | 'orange' | 'green';
}

export interface ProfileShiftItem {
  label: string;
  value: string;
  tone?: 'success' | 'default';
}

export interface ProfilePerformanceItem {
  label: string;
  value: string;
  tone?: 'green' | 'amber' | 'red';
}

export interface ProfileActivityItem {
  time: string;
  action: string;
  badge: string;
  tone?: 'slate' | 'teal' | 'red' | 'green';
}

export interface ProfileData {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  phone: string;
  joinDate?: string;
  employeeId?: string;
  avatarUrl?: string | null;
  metrics?: ProfileMetric[];
  areas?: ProfileArea[];
  shift?: ProfileShiftItem[];
  performance?: ProfilePerformanceItem[];
  activity?: ProfileActivityItem[];
}

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const config: AxiosRequestConfig = {
      url: endpoint,
      method: (options.method as AxiosRequestConfig['method']) || 'GET',
      headers: options.headers ? (options.headers as AxiosRequestConfig['headers']) : undefined,
      data: options.body ? JSON.parse(options.body as string) : undefined,
    };

    const response = await apiClient.request<{ success: boolean; data: T; error?: string }>(config);
    const payload = response.data;
    if (!payload.success) {
      return { success: false, error: payload.error ?? 'Unknown error' };
    }
    return { success: true, data: payload.data };
  } catch (err) {
    const isObj = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === 'object';
    const unknownErr = err as unknown;
    let errorStr = 'Unknown error';
    if (isObj(unknownErr)) {
      const resp = unknownErr['response'];
      if (isObj(resp)) {
        const data = resp['data'];
        if (isObj(data)) {
          const e = data['error'];
          if (typeof e === 'string') errorStr = e;
          else if (isObj(e) && typeof e['message'] === 'string') errorStr = e['message'] as string;
        }
      }
      if (typeof unknownErr['message'] === 'string') {
        errorStr = unknownErr['message'] as string;
      }
    }
    console.error(`[Cleaning Profile API] ${endpoint}:`, errorStr);
    return { success: false, error: String(errorStr) };
  }
}

type ProfilePayload = { profile?: ProfileData } & Partial<ProfileData>;

export const profileAPI = {
  getProfile: async (): Promise<ApiResponse<ProfileData>> => {
    const res = await fetchAPI<ProfilePayload>('/auth/me');
    return {
      success: res.success,
      data: res.data?.profile ?? (res.data as ProfileData | undefined),
      error: res.error,
    };
  },

  updateProfile: async (updates: Partial<ProfileData>): Promise<ApiResponse<ProfileData>> => {
    const res = await fetchAPI<ProfilePayload>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return {
      success: res.success,
      data: res.data?.profile ?? (res.data as ProfileData | undefined),
      error: res.error,
    };
  },
};
