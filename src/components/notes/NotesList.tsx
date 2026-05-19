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

// Helper function to extract text contents from HTML, adding space between block elements and filtering raw empty tags
const getSpacedPlainText = (html: string): string => {
    if (!html) return 'No content';

    // Remove empty paragraph blocks (e.g. <p></p> or <p> </p>) to prevent raw HTML leak
    const cleanHtml = html.replace(/<p>\s*<\/p>/g, '').trim();
    if (!cleanHtml) return 'No content';

    const doc = new DOMParser().parseFromString(cleanHtml, 'text/html');

    const walk = (node: Node): string => {
        if (node.nodeType === Node.TEXT_NODE) {
            return node.textContent || '';
        }

        let text = '';
        const children = node.childNodes;
        for (let i = 0; i < children.length; i++) {
            const childText = walk(children[i]);
            if (childText.trim()) {
                const nodeName = children[i].nodeName;
                const isBlock = ['P', 'LI', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'UL', 'OL'].includes(nodeName);
                if (isBlock && text) {
                    text += ' ' + childText.trim();
                } else {
                    text += childText;
                }
            }
        }
        return text;
    };

    return walk(doc.body).trim() || 'No content';
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
        <aside className="w-80 bg-slate-50 border-r border-slate-200 dark:bg-slate-850 dark:border-slate-800 flex flex-col z-20 shrink-0">
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
                        className="w-full bg-white border border-slate-300 text-sm rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder-slate-400 text-slate-800 dark:bg-slate-900 dark:border-slate-700 dark:placeholder-slate-500 dark:text-slate-200"
                    />
                </div>

                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wider relative" ref={dropdownRef}>
                    <span>Recent Notes</span>

                    <div className="ml-auto flex items-center gap-1">
                        {selectedTags.length > 0 && (
                            <span className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded text-[10px]">
                                {selectedTags.length}
                            </span>
                        )}
                        <button onClick={() => setIsOpen(!isOpen)} className="hover:text-slate-800 dark:hover:text-slate-300">
                            <Filter className="w-3 h-3 cursor-pointer" />
                        </button>
                    </div>

                    {/* Tags Dropdown */}
                    {isOpen && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-700 rounded-lg shadow-xl p-2 z-30">
                            <div className="flex justify-between items-center mb-2 px-1">
                                <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">Filter by tags</span>
                                {selectedTags.length > 0 && (
                                    <button
                                        onClick={() => onChangeTags([])}
                                        className="text-[10px] text-red-500 hover:text-red-400 dark:text-red-400 dark:hover:text-red-300 capitalize"
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
                                            className="flex items-center gap-2 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded cursor-pointer transition-colors"
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
                                                className="w-3.5 h-3.5 text-emerald-500 bg-white border-slate-300 dark:bg-slate-900 dark:border-slate-600 rounded focus:ring-emerald-500 focus:ring-offset-slate-800"
                                            />
                                            <span className="text-sm text-slate-700 dark:text-slate-300 capitalize">{tag}</span>
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

                    // Plain text extraction with correct block element spacing
                    const plainText = getSpacedPlainText(note.content);
                    const previewText = plainText.length > 50 ? plainText.substring(0, 50) + '...' : plainText;

                    return (
                        <div
                            key={note.id}
                            onClick={() => onSelectNote(note.id)}
                            className={`p-3 rounded-lg cursor-pointer group transition-colors border ${isActive
                                ? "bg-emerald-50/80 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20"
                                : "hover:bg-slate-200/50 dark:hover:bg-slate-800 border-transparent"
                                }`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <h3 className={`font-medium truncate pr-4 ${isActive ? "text-emerald-700 dark:text-emerald-400" : "text-slate-800 dark:text-slate-200"}`}>
                                    {note.title || "Untitled Note"}
                                </h3>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteNote(note.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-all shrink-0"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <p className={`text-xs truncate ${isActive ? "text-slate-600 dark:text-slate-400" : "text-slate-500"}`}>
                                {previewText}
                            </p>
                            <div className="flex items-center mt-2 gap-2 w-full min-w-0">
                                {note.tags.length > 0 && (
                                    <div className="flex gap-1 items-center flex-nowrap overflow-hidden min-w-0 flex-1">
                                        {note.tags.slice(0, 2).map(tag => (
                                            <span
                                                key={tag.value}
                                                className={`px-2 py-0.5 rounded-full text-[9px] font-medium border flex items-center shrink min-w-0 max-w-[80px] ${isActive
                                                    ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30"
                                                    : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                                                    }`}
                                            >
                                                <span className="truncate">{tag.label}</span>
                                            </span>
                                        ))}
                                        {note.tags.length > 2 && (
                                            <span
                                                className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium border shrink-0 ${isActive
                                                    ? "bg-emerald-100 text-emerald-750 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30"
                                                    : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700"
                                                    }`}
                                                title={note.tags.slice(2).map(tag => `• ${tag.label}`).join("\n")}
                                            >
                                                +{note.tags.length - 2}
                                            </span>
                                        )}
                                    </div>
                                )}
                                <div className={`text-[10px] whitespace-nowrap ml-auto shrink-0 ${isActive ? "text-slate-600 dark:text-slate-400" : "text-slate-550 dark:text-slate-500"}`}>
                                    {formatDate(note.updatedAt)}
                                </div>
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