import { EditorContent } from '@tiptap/react';
import { Tag } from 'lucide-react';
import { useRef, useEffect } from "react";
import type { Note } from "../../types/note";

import Toolbar from './Toolbar';
import NoteHeader from './NoteHeader';
import { useTiptapEditor } from './useTiptapEditor';

type Props = {
    note: Note | null;
    onUpdateNote: (note: Note) => void;
};

function NoteEditor({ note, onUpdateNote }: Props) {
    const titleRef = useRef<HTMLTextAreaElement>(null);

    const handleChange = (field: "title" | "content", value: string) => {
        if (note) {
            onUpdateNote({
                ...note,
                [field]: value,
            });
        }
    };

    const editor = useTiptapEditor({ note, onChange: handleChange });

    const adjustHeight = () => {
        const textarea = titleRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    };

    // Adjust height on note change or title change
    useEffect(() => {
        adjustHeight();
    }, [note?.id, note?.title]);

    if (!note) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 relative">
                <div className="w-16 h-16 mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Tag className="w-8 h-8 text-slate-400 dark:text-slate-600" />
                </div>
                <p>Select or create a note</p>
            </div>
        );
    }

    const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            editor?.commands.focus('start');
        }
    };

    return (
        <main className="flex-1 flex flex-col bg-white dark:bg-slate-900 relative min-w-0">
            {/* Redesigned Top Bar with Integrated Toolbar */}
            <header className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center px-6 justify-between bg-white/95 dark:bg-slate-900/95 sticky top-0 z-10 backdrop-blur-sm shrink-0">
                {/* Left side: Document Meta / Tags */}
                <NoteHeader note={note} onUpdateNote={onUpdateNote} />

                {/* Center: Minimalist Formatting Toolbar */}
                <div className="flex-shrink-0 ml-4 hidden md:block">
                    <Toolbar editor={editor} />
                </div>
            </header>

            {/* Mobile toolbar */}
            <div className="md:hidden border-b border-slate-200 dark:border-slate-800 p-2 overflow-x-auto bg-white dark:bg-slate-900 shrink-0">
                <Toolbar editor={editor} />
            </div>

            {/* Editor Content */}
            <div className="flex-1 overflow-y-auto w-full flex flex-col">
                <div className="max-w-4xl mx-auto p-8 lg:p-12 lg:pb-0 mt-4 flex-1 flex flex-col w-full">
                    <textarea
                        ref={titleRef}
                        value={note.title}
                        onChange={e => handleChange("title", e.target.value)}
                        onKeyDown={handleTitleKeyDown}
                        rows={1}
                        className="w-full bg-transparent text-4xl font-bold text-slate-900 dark:text-slate-100 focus:outline-none placeholder-slate-300 dark:placeholder-slate-700 mb-2 resize-none overflow-hidden"
                        placeholder="Note Title"
                    />

                    <div className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-300 leading-relaxed outline-none flex-1 flex flex-col">
                        <EditorContent editor={editor} className="flex-1 flex flex-col" />
                    </div>
                </div>
            </div>
        </main>
    );
}

export default NoteEditor;
