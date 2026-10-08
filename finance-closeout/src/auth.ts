export type CloseoutRole = 'admin' | 'analyst';

export interface CloseoutUser {
  id: string;
  role: CloseoutRole;
}

export function getStoredCloseoutUser(): CloseoutUser | null {
  try {
    const raw = window.localStorage.getItem('user');
    if (!raw) return null;

    const user: unknown = JSON.parse(raw);
    if (!user || typeof user !== 'object') return null;

    const candidate = user as Record<string, unknown>;
    if (
      typeof candidate.id !== 'string' ||
      !candidate.id ||
      (candidate.role !== 'admin' && candidate.role !== 'analyst')
    ) {
      return null;
    }

    return { id: candidate.id, role: candidate.role };
  } catch {
    return null;
  }
}

export async function getCloseoutUser(): Promise<CloseoutUser | null> {
  const token = window.localStorage.getItem('access_token');
  if (!token) return null;

  const response = await fetch('/api/v1/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (response.status === 401 || response.status === 403) return null;
  if (!response.ok) {
    throw new Error(`FinanceOS access check failed (${response.status}). Reload and try again.`);
  }

  const result: unknown = await response.json();
  if (!result || typeof result !== 'object') {
    throw new Error('FinanceOS returned an invalid access-check response.');
  }

  const data = (result as Record<string, unknown>).data;
  if (!data || typeof data !== 'object') {
    throw new Error('FinanceOS returned an invalid access-check response.');
  }

  const user = data as Record<string, unknown>;
  if (
    typeof user.id !== 'string' ||
    !user.id ||
    (user.role !== 'admin' && user.role !== 'analyst')
  ) {
    return null;
  }

  return { id: user.id, role: user.role };
}
