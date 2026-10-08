import type { Note } from './model';

const getStorageKey = () => {
  const account = new URLSearchParams(window.location.search).get('account');
  return account ? `restaurant-closeout.notes.v1:${account}` : 'restaurant-closeout.notes.v1';
};

const validDate = (value: unknown, fallback: string) =>
  typeof value === 'string' && Number.isFinite(Date.parse(value)) ? value : fallback;

export function readNotes(): Note[] {
  try {
    const raw = window.localStorage.getItem(getStorageKey());
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.flatMap((value): Note[] => {
      if (!value || typeof value !== 'object') return [];
      const note = value as Record<string, unknown>;
      if (typeof note.title !== 'string' || typeof note.content !== 'string' || !note.title.trim() || !note.content.trim()) return [];
      const createdAt = validDate(note.createdAt ?? note.timestamp, new Date(0).toISOString());
      return [{
        id: String(note.id ?? `${createdAt}-${Math.random().toString(36).slice(2)}`),
        title: note.title.slice(0, 100),
        content: note.content.slice(0, 5000),
        createdAt,
        updatedAt: validDate(note.updatedAt, createdAt),
      }];
    });
  } catch {
    return [];
  }
}

export function writeNotes(notes: Note[]): boolean {
  try {
    window.localStorage.setItem(getStorageKey(), JSON.stringify(notes));
    return true;
  } catch {
    return false;
  }
}