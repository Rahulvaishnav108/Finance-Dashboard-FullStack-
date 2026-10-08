import { afterEach, describe, expect, it, vi } from 'vitest';
import { getCloseoutUser } from '../auth';
import { readNotes, writeNotes } from './storage';
import type { Note } from './model';

const note: Note = {
  id: 'note-1',
  title: 'Settlement follow-up',
  content: 'Check the card batch.',
  createdAt: '2026-10-03T10:00:00.000Z',
  updatedAt: '2026-10-03T10:00:00.000Z',
};

describe('notes storage', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('keeps FinanceOS accounts in separate local storage workspaces', () => {
    const values = new Map<string, string>();
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
      },
    });
    values.set('user', JSON.stringify({ id: 'finance-user-a', role: 'admin' }));

    expect(writeNotes([note])).toBe(true);
    expect(readNotes()).toEqual([note]);

    values.set('user', JSON.stringify({ id: 'finance-user-b', role: 'analyst' }));
    expect(readNotes()).toEqual([]);

    values.set('user', JSON.stringify({ id: 'finance-user-a', role: 'admin' }));
    expect(readNotes()).toEqual([note]);
  });

  it('does not grant closeout access to missing or viewer sessions', async () => {
    const values = new Map<string, string>();
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) => values.get(key) ?? null,
      },
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: { id: 'viewer-id', role: 'viewer' } }),
    }));

    expect(await getCloseoutUser()).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
    values.set('access_token', 'viewer-token');
    values.set('user', JSON.stringify({ id: 'viewer-id', role: 'viewer' }));
    expect(await getCloseoutUser()).toBeNull();
  });

  it('verifies elevated closeout access against the FinanceOS API', async () => {
    const values = new Map<string, string>([['access_token', 'valid-token']]);
    vi.stubGlobal('window', {
      localStorage: { getItem: (key: string) => values.get(key) ?? null },
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: { id: 'finance-user-a', role: 'analyst' } }),
    }));

    await expect(getCloseoutUser()).resolves.toEqual({ id: 'finance-user-a', role: 'analyst' });
    expect(fetch).toHaveBeenCalledWith('/api/v1/auth/me', {
      headers: { Authorization: 'Bearer valid-token' },
    });
  });
});
