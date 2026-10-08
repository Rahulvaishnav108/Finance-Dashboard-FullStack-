import { useEffect, useState } from 'react';
import type { Note } from './model';
import { readNotes, writeNotes } from './storage';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>(readNotes);
  const [storageError, setStorageError] = useState(false);

  useEffect(() => {
    setStorageError(!writeNotes(notes));
  }, [notes]);

  const addNote = (title: string, content: string) => {
    const now = new Date().toISOString();
    const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setNotes((current) => [{ id, title: title.trim(), content: content.trim(), createdAt: now, updatedAt: now }, ...current]);
  };

  const updateNote = (id: string, title: string, content: string) => {
    const updatedAt = new Date().toISOString();
    setNotes((current) => current.map((note) => note.id === id
      ? { ...note, title: title.trim(), content: content.trim(), updatedAt }
      : note));
  };

  const deleteNote = (id: string) => {
    setNotes((current) => current.filter((note) => note.id !== id));
  };

  return { notes, storageError, addNote, updateNote, deleteNote };
}