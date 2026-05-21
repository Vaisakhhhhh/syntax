import React from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Note } from "../../types/note";
import { useTheme } from "../../context/useTheme";
import { Plus, Sun, Moon } from "lucide-react";
import NoteListItem from "./NoteListItem";
import NotesFilter from "./NotesFilter";

type Props = {
    notes: Note[];
    allTags: string[];
    activeNoteId: string | null;
    search: string;
    selectedTags: string[];
    onSearchNote: (id: string) => void;
    onSelectNote: (id: string) => void;
    onCreateNote: () => void;
    onDeleteNote: (id: string) => void;
    onChangeTags: Dispatch<SetStateAction<string[]>>;
};

function NotesSidebar({
    notes,
    allTags,
    activeNoteId,
    search,
    selectedTags,
    onSearchNote,
    onSelectNote,
    onCreateNote,
    onDeleteNote,
    onChangeTags,
}: Props) {
    const { theme, toggleTheme } = useTheme();

    return (
        <aside className={`w-full md:w-80 bg-slate-50 border-r border-slate-200 dark:bg-slate-850 dark:border-slate-800 flex-col z-20 shrink-0 overflow-hidden ${activeNoteId ? "hidden md:flex" : "flex"}`}>
            {/* Sidebar Header */}
            <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                    <img src="/logo.png" alt="logo" className="w-7" />
                    <h1 className="font-bold text-lg tracking-wide text-emerald-600 dark:text-slate-100">Syntax</h1>
                </div>
                <button
                    onClick={toggleTheme}
                    className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg transition-colors"
                >
                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
            </div>

            {/* Actions */}
            <div className="p-4 flex flex-col">
                <button
                    onClick={onCreateNote}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm mb-4"
                >
                    <Plus className="w-4 h-4" />
                    New Note
                </button>

                <NotesFilter
                    search={search}
                    onSearchNote={onSearchNote}
                    selectedTags={selectedTags}
                    allTags={allTags}
                    onChangeTags={onChangeTags}
                />
            </div>

            {/* Notes List */}
            <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
                {notes.map(note => (
                    <NoteListItem
                        key={note.id}
                        note={note}
                        isActive={note.id === activeNoteId}
                        onSelectNote={onSelectNote}
                        onDeleteNote={onDeleteNote}
                    />
                ))}
                {notes.length === 0 && (
                    <div className="text-center p-4 text-slate-500 text-sm">
                        No notes found.
                    </div>
                )}
            </div>
        </aside>
    )
}

export default React.memo(NotesSidebar);
