/**
 * cleaning.api.ts
 * Location: src/features/cleaning/api/cleaning.api.ts
 *
 * This file defines canonical types and endpoint stubs for the cleaning feature.
 * Placeholder responses are returned while the backend is not available.
 * When the real service is ready, uncomment the fetchAPI line in each endpoint.
 */

import type { AxiosRequestConfig } from 'axios';
import { apiClient } from '../../../shared/services/apiClient';

// ─── Generic response wrapper ─────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ─── Fetch helper ─────────────────────────────────────────────
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
      if (typeof unknownErr['message'] === 'string') errorStr = unknownErr['message'] as string;
    }

    console.error(`[Cleaning API] ${endpoint}:`, errorStr);
    return { success: false, error: String(errorStr) };
  }
}

// ─── Types ───────────────────────────────────────────────────
export interface CleaningMetric {
  label: string;
  value: string;
  color: string;
}

export interface FloorTable {
  id: number;
  label: string;
  status: string;
  tone: string;
}

export interface DiningTable {
  id: number;
  number: number;
  label: string;
  status: string;
}

export interface KitchenTable {
  id: number;
  number: number;
  label: string;
  status: string;
}

export interface Washroom {
  id: number;
  label: string;
  status: string;
}

export interface KitchenWashroom {
  id: number;
  label: string;
  status: string;
}

export interface UrgentTask {
  id: string;
  title: string;
  subtitle: string;
  priority: string;
  badgeColor: string;
  badgeBg?: string;
  waiting: string;
  tableNumber?: string;
  seats?: number;
  area?: string;
  section?: string;
  floor?: number;
}

export interface CleaningStaffMember {
  id: number;
  initials: string;
  name: string;
  status: string;
  place: string;
  color: string;
  phone?: string;
  role?: string;
  joinDate?: string;
  avatarUrl?: string | null;
}

export interface ActiveJob {
  id: number;
  title: string;
  detail: string;
  staff: string;
  color: string;
}

export interface RecentActivity {
  id: number;
  label: string;
  time: string;
  actor: string;
  color: string;
}

export interface WeeklyRequestPoint {
  day: string;
  count: number;
}

export interface JobStatusSegment {
  label: string;
  value: number;
  color: string;
}

export interface CleaningDashboardResponse {
  metrics: CleaningMetric[];
  floorTables: FloorTable[];
  urgentTasks: UrgentTask[];
  staffMembers: CleaningStaffMember[];
  activeJobs: ActiveJob[];
  recentActivity: RecentActivity[];
  weeklyRequests: WeeklyRequestPoint[];
  jobStatus: JobStatusSegment[];
}

export interface CleaningTask {
  _id: string;
  tableId: string;
  priority: string;
  status: string;
  startedBy?: string | null;
  completedBy?: string | null;
  verifiedBy?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  verifiedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CleaningTasksResponse {
  tasks: CleaningTask[];
  meta: {
    count: number;
    filters: {
      status: string | null;
      priority: string | null;
    };
  };
}

// ─── API endpoint functions ───────────────────────────────────
export const cleaningAPI = {
  getDashboard: async (): Promise<ApiResponse<CleaningDashboardResponse>> => {
    // A cleaning dashboard endpoint is not currently implemented in the backend.
    // Keep this stub until a dedicated dashboard route exists.
    return Promise.resolve({ success: true, data: undefined });
  },

  getTasks: async (query?: { status?: string; priority?: string }): Promise<ApiResponse<CleaningTasksResponse>> => {
    const params = new URLSearchParams();
    if (query?.status) params.append('status', query.status);
    if (query?.priority) params.append('priority', query.priority);
    const endpoint = params.toString() ? `/cleaning/tasks?${params.toString()}` : '/cleaning/tasks';
    return fetchAPI<CleaningTasksResponse>(endpoint);
  },

  getTask: async (taskId: string): Promise<ApiResponse<{ task: CleaningTask }>> => {
    return fetchAPI<{ task: CleaningTask }>(`/cleaning/tasks/${taskId}`);
  },

  assignTask: async (taskId: string, staffId?: string): Promise<ApiResponse<void>> => {
    return fetchAPI<void>(`/cleaning/tasks/${taskId}/start`, {
      method: 'PATCH',
      body: JSON.stringify({ staffId }),
    });
  },

  startTask: async (taskId: string, staffId?: string): Promise<ApiResponse<void>> => {
    return fetchAPI<void>(`/cleaning/tasks/${taskId}/start`, {
      method: 'PATCH',
      body: JSON.stringify({ staffId }),
    });
  },

  completeTask: async (taskId: string, staffId?: string): Promise<ApiResponse<void>> => {
    return fetchAPI<void>(`/cleaning/tasks/${taskId}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ staffId }),
    });
  },

  verifyTask: async (taskId: string, verifiedBy?: string): Promise<ApiResponse<void>> => {
    return fetchAPI<void>(`/cleaning/tasks/${taskId}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ verifiedBy }),
    });
  },

  updateJobStatus: async (_jobId: number, _status: string): Promise<ApiResponse<void>> => {
    // This method is not part of the documented cleaning tasks API, but is retained for compatibility.
    return Promise.resolve({ success: true });
  },

  addDiningTable: async (_tableNumber: number): Promise<ApiResponse<void>> => {
    return Promise.resolve({ success: true });
  },

  deleteDiningTable: async (_tableId: number): Promise<ApiResponse<void>> => {
    return Promise.resolve({ success: true });
  },

  addWashroom: async (_label: string): Promise<ApiResponse<void>> => {
    return Promise.resolve({ success: true });
  },

  deleteWashroom: async (_washroomId: number): Promise<ApiResponse<void>> => {
    return Promise.resolve({ success: true });
  },

  addKitchenTable: async (_tableNumber: number): Promise<ApiResponse<void>> => {
    return Promise.resolve({ success: true });
  },

  deleteKitchenTable: async (_tableId: number): Promise<ApiResponse<void>> => {
    return Promise.resolve({ success: true });
  },

  addKitchenWashroom: async (_label: string): Promise<ApiResponse<void>> => {
    return Promise.resolve({ success: true });
  },

  deleteKitchenWashroom: async (_washroomId: number): Promise<ApiResponse<void>> => {
    return Promise.resolve({ success: true });
  },

  addStaffMember: async (_member: CleaningStaffMember): Promise<ApiResponse<void>> => {
    return Promise.resolve({ success: true });
  },

  updateStaffMember: async (_memberId: number, _updates: Partial<CleaningStaffMember>): Promise<ApiResponse<void>> => {
    return Promise.resolve({ success: true });
  },

  deleteStaffMember: async (_memberId: number): Promise<ApiResponse<void>> => {
    return Promise.resolve({ success: true });
  },
};
