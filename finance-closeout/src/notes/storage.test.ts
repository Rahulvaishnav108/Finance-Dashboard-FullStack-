import { afterEach, describe, expect, it, vi } from 'vitest';
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
      location: { search: '?account=finance-user-a' },
      localStorage: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
      },
    });

    expect(writeNotes([note])).toBe(true);
    expect(readNotes()).toEqual([note]);

    window.location.search = '?account=finance-user-b';
    expect(readNotes()).toEqual([]);

    window.location.search = '?account=finance-user-a';
    expect(readNotes()).toEqual([note]);
  });
});
