import { useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Note } from "../../types/note";
import React from "react";
import { useTheme } from "../../context/useTheme";
import { Plus, Search, Filter, Trash2, Sun, Moon } from "lucide-react";

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

function NotesList({
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
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Format date logic
    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return `Today, ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
        }
    };

    return (
        <aside className="w-80 bg-slate-850 border-r border-slate-800 flex flex-col z-20 shrink-0">
            {/* Sidebar Header */}
            <div className="p-4 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center font-bold text-white">S</div>
                    <h1 className="font-semibold text-lg tracking-wide text-slate-100">Syntax</h1>
                </div>
                <button
                    onClick={toggleTheme}
                    className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
                >
                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
            </div>

            {/* Actions */}
            <div className="p-4 space-y-4">
                <button
                    onClick={onCreateNote}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    New Note
                </button>

                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search notes..."
                        value={search}
                        onChange={(e) => onSearchNote(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 text-sm rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder-slate-500 text-slate-200"
                    />
                </div>

                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wider relative" ref={dropdownRef}>
                    <span>Recent Notes</span>

                    <div className="ml-auto flex items-center gap-1">
                        {selectedTags.length > 0 && (
                            <span className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded text-[10px]">
                                {selectedTags.length}
                            </span>
                        )}
                        <button onClick={() => setIsOpen(!isOpen)} className="hover:text-slate-300">
                            <Filter className="w-3 h-3 cursor-pointer" />
                        </button>
                    </div>

                    {/* Tags Dropdown */}
                    {isOpen && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-2 z-30">
                            <div className="flex justify-between items-center mb-2 px-1">
                                <span className="text-xs text-slate-400 capitalize">Filter by tags</span>
                                {selectedTags.length > 0 && (
                                    <button
                                        onClick={() => onChangeTags([])}
                                        className="text-[10px] text-red-400 hover:text-red-300 capitalize"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                            {allTags.length === 0 ? (
                                <p className="text-slate-500 text-xs p-1">No tags available</p>
                            ) : (
                                <div className="max-h-40 overflow-y-auto space-y-1">
                                    {allTags.map(tag => (
                                        <label
                                            key={tag}
                                            className="flex items-center gap-2 p-1.5 hover:bg-slate-700 rounded cursor-pointer transition-colors"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedTags.includes(tag)}
                                                onChange={() => {
                                                    onChangeTags((prev: string[]) =>
                                                        prev.includes(tag)
                                                            ? prev.filter(t => t !== tag)
                                                            : [...prev, tag]
                                                    );
                                                }}
                                                className="w-3.5 h-3.5 text-emerald-500 bg-slate-900 border-slate-600 rounded focus:ring-emerald-500 focus:ring-offset-slate-800"
                                            />
                                            <span className="text-sm text-slate-300 capitalize">{tag}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Notes List */}
            <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
                {notes.map(note => {
                    const isActive = note.id === activeNoteId;

                    // Plain text extraction
                    const doc = new DOMParser().parseFromString(note.content, 'text/html');
                    const plainText = doc.body.textContent || note.content || 'No content';
                    const previewText = plainText.length > 50 ? plainText.substring(0, 50) + '...' : plainText;

                    return (
                        <div
                            key={note.id}
                            onClick={() => onSelectNote(note.id)}
                            className={`p-3 rounded-lg cursor-pointer group transition-colors border ${isActive
                                ? "bg-emerald-500/10 border-emerald-500/20"
                                : "hover:bg-slate-800 border-transparent"
                                }`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <h3 className={`font-medium truncate pr-4 ${isActive ? "text-emerald-400" : "text-slate-200"}`}>
                                    {note.title || "Untitled Note"}
                                </h3>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteNote(note.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all shrink-0"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <p className={`text-xs truncate ${isActive ? "text-slate-400" : "text-slate-500"}`}>
                                {previewText}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                                <div className={`text-[10px] ${isActive ? "text-slate-500" : "text-slate-600"}`}>
                                    {formatDate(note.updatedAt)}
                                </div>
                                {note.tags.length > 0 && (
                                    <div className="flex gap-1">
                                        {note.tags.slice(0, 2).map(tag => (
                                            <span key={tag.value} className="w-1.5 h-1.5 rounded-full bg-slate-600" title={tag.label} />
                                        ))}
                                        {note.tags.length > 2 && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-700" title={`+${note.tags.length - 2} more`} />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
                {notes.length === 0 && (
                    <div className="text-center p-4 text-slate-500 text-sm">
                        No notes found.
                    </div>
                )}
            </div>
        </aside>
    )
}

export default React.memo(NotesList);