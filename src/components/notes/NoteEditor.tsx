import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Tag, PlusCircle, X } from 'lucide-react';

import { useState, useEffect } from "react";
import type { Note } from "../../types/note";

import Toolbar from './Toolbar';

const CustomTaskList = TaskList.extend({
    addAttributes() {
        return {
            strikethrough: {
                default: false,
                parseHTML: element => element.hasAttribute('data-strikethrough'),
                renderHTML: attributes => {
                    if (!attributes.strikethrough) {
                        return {};
                    }
                    return {
                        'data-strikethrough': 'true',
                        class: 'strikethrough-list',
                    };
                },
            },
        };
    },
});

type Props = {
    note: Note | null;
    onUpdateNote: (note: Note) => void;
};

function NoteEditor({ note, onUpdateNote }: Props) {
    const [tagInput, setTagInput] = useState("");
    const [isAddingTag, setIsAddingTag] = useState(false);

    //^ Initialize Tiptap editor
    const editor = useEditor({
        extensions: [
            StarterKit,
            CustomTaskList,
            TaskItem.configure({
                nested: true,
            }),
            TextStyle,
            Color,
        ],
        content: note?.content,
        onUpdate({ editor }) {
            handleChange("content", editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'outline-none min-h-[500px] cursor-text',
            },
        },
    });

    // Update editor content when switching notes
    useEffect(() => {
        if (editor && note && note.content !== editor.getHTML()) {
            editor.commands.setContent(note.content || '');
        }
    }, [editor, note?.id]);


    if (!note) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-900 text-slate-500 relative">
                <div className="w-16 h-16 mb-4 rounded-full bg-slate-800 flex items-center justify-center">
                    <Tag className="w-8 h-8 text-slate-600" />
                </div>
                <p>Select or create a note</p>
            </div>
        );
    }

    //^ Handle content changes
    const handleChange = (field: "title" | "content", value: string) => {
        onUpdateNote({
            ...note,
            [field]: value,
            updatedAt: Date.now(),
        });
    };

    //^ Tag handling
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const value = tagInput.trim();
            if (!value) {
                setIsAddingTag(false);
                return;
            }

            if (!note.tags.includes(value)) {
                onUpdateNote({
                    ...note,
                    tags: [...note.tags, value],
                    updatedAt: Date.now(),
                });
            }
            setTagInput("");
            setIsAddingTag(false);
        } else if (e.key === "Escape") {
            setIsAddingTag(false);
            setTagInput("");
        }
    };

    const removeTag = (tag: string) => {
        if (!note) return;
        onUpdateNote({
            ...note,
            tags: note.tags.filter(t => t !== tag),
            updatedAt: Date.now(),
        });
    };

    return (
        <main className="flex-1 flex flex-col bg-slate-900 relative min-w-0">
            {/* Redesigned Top Bar with Integrated Toolbar */}
            <header className="h-14 border-b border-slate-800 flex items-center px-6 justify-between bg-slate-900/95 sticky top-0 z-10 backdrop-blur-sm shrink-0">

                {/* Left side: Document Meta / Tags */}
                <div className="flex items-center gap-2 min-w-[120px] overflow-x-auto no-scrollbar py-2">
                    {note.tags.map(tag => (
                        <span
                            key={tag}
                            className="px-2.5 py-1 rounded-full bg-slate-800 text-xs font-medium text-slate-300 border border-slate-700 flex items-center gap-1 group hover:bg-slate-700 transition-colors shrink-0"
                        >
                            <Tag className="w-3 h-3 text-emerald-500" />
                            {tag}
                            <button
                                onClick={() => removeTag(tag)}
                                className="opacity-0 group-hover:opacity-100 ml-1 text-slate-500 hover:text-red-400 transition-opacity"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}

                    {isAddingTag ? (
                        <input
                            autoFocus
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={() => {
                                setIsAddingTag(false);
                                setTagInput("");
                            }}
                            className="bg-slate-800 border border-emerald-500 text-slate-200 text-xs rounded-full px-2.5 py-1 focus:outline-none w-24 shrink-0"
                            placeholder="Add tag..."
                        />
                    ) : (
                        <button
                            onClick={() => setIsAddingTag(true)}
                            className="px-2 py-1 rounded-full text-xs font-medium text-slate-500 hover:text-slate-300 cursor-pointer flex items-center gap-1 shrink-0"
                            title="Add Tag"
                        >
                            <PlusCircle className="w-4 h-4" /> Add tag
                        </button>
                    )}
                </div>

                {/* Center: Minimalist Formatting Toolbar */}
                <div className="flex-shrink-0 ml-4 hidden md:block">
                    <Toolbar editor={editor} />
                </div>
            </header>

            {/* Mobile toolbar */}
            <div className="md:hidden border-b border-slate-800 p-2 overflow-x-auto bg-slate-900 shrink-0">
                <Toolbar editor={editor} />
            </div>

            {/* Editor Content */}
            <div className="flex-1 overflow-y-auto w-full">
                <div className="max-w-4xl mx-auto p-8 lg:p-12 lg:pb-0 mt-4">
                    <input
                        type="text"
                        value={note.title}
                        onChange={e => handleChange("title", e.target.value)}
                        className="w-full bg-transparent text-4xl font-bold text-slate-100 focus:outline-none placeholder-slate-600 mb-2"
                        placeholder="Note Title"
                    />

                    <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed outline-none">
                        <EditorContent editor={editor} />
                    </div>
                </div>
            </div>
        </main>
    );
}

export default NoteEditor;