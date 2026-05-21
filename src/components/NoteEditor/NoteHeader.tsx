import React, { useState } from 'react';
import { Tag, PlusCircle, X, Check } from 'lucide-react';
import type { Note } from '../../types/note';

type Props = {
    note: Note;
    onUpdateNote: (note: Note) => void;
};

export default function NoteHeader({ note, onUpdateNote }: Props) {
    const [tagInput, setTagInput] = useState("");
    const [isAddingTag, setIsAddingTag] = useState(false);

    const handleAddTag = () => {
        const cleaned = tagInput.trim();
        const normalized = cleaned.toLowerCase();
        if (!normalized) {
            setIsAddingTag(false);
            return;
        }

        // Constraints: Max 20 chars, Max 5 tags
        if (normalized.length > 20) {
            alert("Tag cannot exceed 20 characters");
            return;
        }

        if (note.tags.length >= 5) {
            alert("Maximum 5 tags allowed per note");
            setIsAddingTag(false);
            setTagInput("");
            return;
        }

        const isExist = note.tags.find(tag => tag.value === normalized);

        if (!isExist) {
            onUpdateNote({
                ...note,
                tags: [...note.tags, { value: normalized, label: cleaned }],
            });
        }
        setTagInput("");
        setIsAddingTag(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddTag();
        } else if (e.key === "Escape") {
            setIsAddingTag(false);
            setTagInput("");
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleAddTag();
    };

    const removeTag = (tagValue: string) => {
        if (!note) return;
        onUpdateNote({
            ...note,
            tags: note.tags.filter(t => t.value !== tagValue),
        });
    };

    return (
        <div className="flex items-center gap-2 min-w-[120px] overflow-x-auto no-scrollbar py-2">
            {note.tags.map(tag => (
                <span
                    key={tag.value}
                    className="px-2.5 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 flex items-center gap-1 group md:hover:bg-slate-200 dark:md:hover:bg-slate-700 transition-colors shrink-0"
                >
                    <Tag className="w-3 h-3 text-emerald-500" />
                    {tag.label}
                    <button
                        onClick={() => removeTag(tag.value)}
                        className="opacity-100 md:opacity-0 md:group-hover:opacity-100 ml-1 text-slate-400 dark:text-slate-500 md:hover:text-red-500 dark:md:hover:text-red-400 transition-opacity"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </span>
            ))}

            {isAddingTag ? (
                <form
                    onSubmit={handleSubmit}
                    className={`flex items-center gap-2 bg-slate-100 dark:bg-slate-800 border rounded-full px-2.5 py-1 shrink-0 transition-colors ${
                        tagInput.trim() !== "" && note.tags.some(t => t.value === tagInput.trim().toLowerCase())
                            ? 'border-red-500'
                            : 'border-emerald-500'
                    }`}
                >
                    <input
                        autoFocus
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        maxLength={20}
                        onBlur={() => {
                            if (!tagInput.trim()) {
                                setIsAddingTag(false);
                                setTagInput("");
                            }
                        }}
                        className="bg-transparent text-slate-800 dark:text-slate-200 text-xs focus:outline-none w-24"
                        placeholder="Add tag..."
                    />
                    {tagInput.trim() && (
                        <button
                            type="submit"
                            onMouseDown={(e) => e.preventDefault()}
                            className="text-emerald-500 md:hover:text-emerald-600 dark:text-emerald-400 dark:md:hover:text-emerald-300 p-0.5 rounded-full md:hover:bg-slate-200 dark:md:hover:bg-slate-700 transition-colors shrink-0 flex md:hidden items-center justify-center"
                            title="Confirm tag"
                        >
                            <Check className="w-3.5 h-3.5" />
                        </button>
                    )}
                    <span className="text-[10px] text-slate-500 font-mono">
                        {tagInput.length}/20
                    </span>
                </form>
            ) : note.tags.length < 5 && (
                <button
                    onClick={() => setIsAddingTag(true)}
                    className="px-2 py-1 rounded-full text-xs font-medium text-slate-500 md:hover:text-slate-800 dark:md:hover:text-slate-300 cursor-pointer flex items-center gap-1 shrink-0"
                    title="Add Tag"
                >
                    <PlusCircle className="w-4 h-4" /> Add tag
                </button>
            )}
        </div>
    );
}
