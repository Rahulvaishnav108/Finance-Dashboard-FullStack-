export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export const MAX_NOTE_TITLE = 100;
export const MAX_NOTE_CONTENT = 5000;

export function validateNote(title: string, content: string): string | null {
  if (!title.trim() || !content.trim()) return 'Add both a title and note content.';
  if (title.trim().length > MAX_NOTE_TITLE) return `Keep the title under ${MAX_NOTE_TITLE} characters.`;
  if (content.trim().length > MAX_NOTE_CONTENT) return `Keep the note under ${MAX_NOTE_CONTENT} characters.`;
  return null;
}

export function filterNotes(notes: Note[], query: string): Note[] {
  const normalized = query.trim().toLocaleLowerCase();
  return notes
    .filter((note) => !normalized || `${note.title}\n${note.content}`.toLocaleLowerCase().includes(normalized))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}