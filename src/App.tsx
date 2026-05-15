import { useCallback, useMemo, useState } from "react";
import type { Note } from "./types/note";
import NotesList from "./components/notes/NotesList";
import NoteEditor from "./components/notes/NoteEditor";
import { useNotes } from "./hooks/useNotes";
import { useFilteredNotes } from "./hooks/useFilteredNotes";
import { useAllTags } from "./hooks/useAllTags";


function App() {
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);


  const { notes, setNotes } = useNotes();
  const filteredNotes = useFilteredNotes({
    notes,
    search,
    selectedTags,
  });
  const allTags = useAllTags(notes);


  const activeNote = useMemo(() => {
    return notes.find(n => n.id === activeNoteId) || null;
  }, [notes, activeNoteId]);


  const createNote = useCallback(() => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: "Untitled Note",
      content: "",
      tags: [],
      updatedAt: Date.now(),
    };

    setNotes(prev => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
  }, [setNotes]);

  const updateNote = useCallback((updatedNote: Note) => {
    setNotes(prev =>
      prev.map((note) =>
        note.id === updatedNote.id ? updatedNote : note
      )
    );
  }, [setNotes]);

  const deleteNote = useCallback((id: string) => {
    setNotes(prev => {
      const newNotes = prev.filter((note) => note.id !== id);

      if (id === activeNoteId) {
        setActiveNoteId(newNotes[0]?.id || null);
      }

      return newNotes;
    });
  }, [setNotes, activeNoteId]);


  return (
    <>
      <NotesList
        notes={filteredNotes}
        allTags={allTags}
        activeNoteId={activeNoteId}
        search={search}
        selectedTags={selectedTags}
        onSearchNote={setSearch}
        onSelectNote={setActiveNoteId}
        onCreateNote={createNote}
        onDeleteNote={deleteNote}
        onChangeTags={setSelectedTags}
      />
      <NoteEditor
        note={activeNote}
        onUpdateNote={updateNote}
      />
    </>
  )
}

export default App
