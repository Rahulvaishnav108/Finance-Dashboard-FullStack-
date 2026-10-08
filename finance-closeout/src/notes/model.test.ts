import { describe, expect, it } from 'vitest';
import { filterNotes, validateNote } from './model';
import type { Note } from './model';

const notes: Note[] = [
  { id: '1', title: 'Card settlement', content: 'Call the provider', createdAt: '2026-10-03T10:00:00.000Z', updatedAt: '2026-10-03T10:00:00.000Z' },
  { id: '2', title: 'Opening checklist', content: 'Restock receipt paper', createdAt: '2026-10-04T10:00:00.000Z', updatedAt: '2026-10-04T10:00:00.000Z' },
];

describe('notes model', () => {
  it('requires title and content and enforces field limits', () => {
    expect(validateNote(' ', 'content')).toContain('title');
    expect(validateNote('Title', ' ')).toContain('content');
    expect(validateNote('x'.repeat(101), 'content')).toContain('title');
    expect(validateNote('Title', 'x'.repeat(5001))).toContain('note');
    expect(validateNote(' Title ', ' Content ')).toBeNull();
  });

  it('searches title and content without case sensitivity and sorts recent first', () => {
    expect(filterNotes(notes, 'PROVIDER').map((note) => note.id)).toEqual(['1']);
    expect(filterNotes(notes, '').map((note) => note.id)).toEqual(['2', '1']);
  });
});