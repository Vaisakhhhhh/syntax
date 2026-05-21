import { useCallback, useMemo, useState } from "react";
import type { Note } from "./types/note";
import NotesSidebar from "./components/NotesSidebar/NotesSidebar";
import NoteEditor from "./components/NoteEditor/NoteEditor";
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
    let newId = "";
    try {
      newId = window.crypto.randomUUID();
    } catch (e) {
      newId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }

    const newNote: Note = {
      id: newId,
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
      prev.map((note) => {
        if (note.id === updatedNote.id) {
          const hasChanged =
            note.title !== updatedNote.title ||
            note.content !== updatedNote.content ||
            JSON.stringify(note.tags) !== JSON.stringify(updatedNote.tags);

          return hasChanged
            ? { ...updatedNote, updatedAt: Date.now() }
            : note;
        }
        return note;
      })
    );
  }, [setNotes]);

  const deleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter((note) => note.id !== id));

    if (id === activeNoteId) {
      const remainingVisibleNotes = filteredNotes.filter(note => note.id !== id);
      setActiveNoteId(remainingVisibleNotes[0]?.id || null);
    }
  }, [setNotes, activeNoteId, filteredNotes]);


  return (
    <>
      <NotesSidebar
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
        onBack={() => setActiveNoteId(null)}
      />
    </>
  )
}

export default App
