import React from 'react';
import { Trash2 } from 'lucide-react';
import type { Note } from '../../types/note';
import { getSpacedPlainText } from '../../utils/stringUtils';
import { formatDate } from '../../utils/dateUtils';

type Props = {
    note: Note;
    isActive: boolean;
    onSelectNote: (id: string) => void;
    onDeleteNote: (id: string) => void;
};

function NoteListItem({ note, isActive, onSelectNote, onDeleteNote }: Props) {
    // Plain text extraction with correct block element spacing
    const plainText = getSpacedPlainText(note.content);
    const previewText = plainText.length > 50 ? plainText.substring(0, 50) + '...' : plainText;

    return (
        <div
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
                        {note.tags.slice(0, 2).map((tag: { value: string, label: string }) => (
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
                                title={note.tags.slice(2).map((tag: { value: string, label: string }) => `• ${tag.label}`).join("\n")}
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
}

export default React.memo(NoteListItem);
