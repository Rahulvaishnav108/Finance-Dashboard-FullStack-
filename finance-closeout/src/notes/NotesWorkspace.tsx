import { useMemo, useState } from 'react';
import { Check, Clock3, Pencil, Plus, Search, StickyNote, Trash2, X } from 'lucide-react';
import { filterNotes, MAX_NOTE_CONTENT, MAX_NOTE_TITLE, validateNote } from './model';
import type { Note } from './model';
import { useNotes } from './useNotes';

function NoteCard({ note, index, onUpdate, onDelete }: {
  note: Note;
  index: number;
  onUpdate: (id: string, title: string, content: string) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [error, setError] = useState('');

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    const validation = validateNote(title, content);
    if (validation) { setError(validation); return; }
    onUpdate(note.id, title, content);
    setEditing(false);
    setError('');
  };

  const cancel = () => {
    setTitle(note.title);
    setContent(note.content);
    setError('');
    setEditing(false);
  };

  return (
    <article className="note-card" style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}>
      {editing ? (
        <form className="note-edit-form" onSubmit={save}>
          <label>Title<input value={title} maxLength={MAX_NOTE_TITLE} onChange={(event) => setTitle(event.target.value)} /></label>
          <label>Note<textarea value={content} maxLength={MAX_NOTE_CONTENT} rows={5} onChange={(event) => setContent(event.target.value)} /></label>
          {error && <p className="msg err" role="alert">{error}</p>}
          <div className="note-actions">
            <button type="submit"><Check size={16} aria-hidden="true" /> Save</button>
            <button type="button" className="ghost" onClick={cancel}><X size={16} aria-hidden="true" /> Cancel</button>
          </div>
        </form>
      ) : (
        <>
          <header className="note-card-head">
            <h3>{note.title}</h3>
            <div className="note-icon-actions">
              <button className="icon-button" type="button" aria-label={`Edit ${note.title}`} title="Edit note" onClick={() => setEditing(true)}><Pencil size={16} /></button>
              <button className="icon-button danger" type="button" aria-label={`Delete ${note.title}`} title="Delete note" onClick={() => onDelete(note.id)}><Trash2 size={16} /></button>
            </div>
          </header>
          <p className="note-content">{note.content}</p>
          <footer className="note-date"><Clock3 size={13} aria-hidden="true" /> Updated {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(note.updatedAt))}</footer>
        </>
      )}
    </article>
  );
}

export default function NotesWorkspace() {
  const { notes, storageError, addNote, updateNote, deleteNote } = useNotes();
  const [query, setQuery] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const visibleNotes = useMemo(() => filterNotes(notes, query), [notes, query]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const validation = validateNote(title, content);
    if (validation) { setError(validation); setMessage(''); return; }
    addNote(title, content);
    setTitle('');
    setContent('');
    setError('');
    setMessage('Note saved on this device.');
  };

  const addWithShortcut = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <main className="notes-page">
      <section className="notes-intro" aria-labelledby="notes-title">
        <div>
          <p className="eyebrow">04 / TEAM WORKSPACE</p>
          <h2 id="notes-title">Shift notes</h2>
          <p className="muted">Keep handoffs, follow-ups, and closeout context together.</p>
        </div>
        <span className="notes-total"><StickyNote size={17} aria-hidden="true" /> {notes.length} {notes.length === 1 ? 'note' : 'notes'}</span>
      </section>

      {storageError && <p className="msg err" role="alert">Notes could not be saved in this browser. Check local storage settings or available space.</p>}

      <form className="notes-compose" onSubmit={submit}>
        <div className="compose-title"><span className="compose-icon"><Plus size={18} aria-hidden="true" /></span><div><h3>Write a note</h3><p>Notes stay in this browser on this device.</p></div></div>
        <label htmlFor="new-note-title">Title</label>
        <input id="new-note-title" value={title} maxLength={MAX_NOTE_TITLE} placeholder="e.g. Follow up on card settlement" onChange={(event) => setTitle(event.target.value)} />
        <label htmlFor="new-note-content">Details</label>
        <textarea id="new-note-content" value={content} maxLength={MAX_NOTE_CONTENT} rows={4} placeholder="Add a handoff, reminder, or context for the next closeout..." onChange={(event) => setContent(event.target.value)} onKeyDown={addWithShortcut} />
        <div className="compose-footer">
          <span className="muted">{content.length}/{MAX_NOTE_CONTENT} · Ctrl/⌘ + Enter to save</span>
          <button type="submit"><Plus size={16} aria-hidden="true" /> Add note</button>
        </div>
        {error && <p className="msg err" role="alert">{error}</p>}
        {message && <p className="msg ok" role="status">{message}</p>}
      </form>

      <section className="notes-list-section" aria-label="Saved notes">
        <div className="notes-toolbar">
          <div><p className="eyebrow">NOTES LOG</p><h3>Recent notes</h3></div>
          <label className="notes-search"><Search size={17} aria-hidden="true" /><span className="sr-only">Search notes</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search notes" /></label>
        </div>
        {visibleNotes.length > 0 ? (
          <div className="notes-grid">{visibleNotes.map((note, index) => <NoteCard key={note.id} note={note} index={index} onUpdate={updateNote} onDelete={deleteNote} />)}</div>
        ) : (
          <div className="notes-empty"><StickyNote size={25} aria-hidden="true" /><p>{query ? 'No notes match your search.' : 'No notes yet. Add the first shift note above.'}</p></div>
        )}
      </section>
    </main>
  );
}