import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Tag, PlusCircle, X } from 'lucide-react';

import { useState, useEffect, useRef } from "react";
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
    const titleRef = useRef<HTMLTextAreaElement>(null);
    const editorRef = useRef<any>(null);

    const adjustHeight = () => {
        const textarea = titleRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    };

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
            const newContent = editor.getHTML();
            if (newContent !== note?.content && !(newContent === '<p></p>' && !note?.content)) {
                handleChange("content", editor.getHTML());
            }
        },
        editorProps: {
            attributes: {
                class: 'outline-none flex-1 cursor-text pb-32',
            },

            handleKeyDown(view, event) {
                if (event.key === 'Backspace') {
                    const { state } = view;
                    const { selection } = state;
                    const { $from, empty } = selection;

                    // Detect empty selection at the start of the block
                    if (empty && $from.parentOffset === 0) {
                        const parent = $from.parent;
                        
                        // Detect if current paragraph inside the list item is empty
                        if (parent.content.size === 0) {
                            const grandParent = $from.node(-1);
                            if (grandParent) {
                                if (grandParent.type.name === 'taskItem') {
                                    editorRef.current?.commands.toggleTaskList();
                                    return true;
                                }
                                if (grandParent.type.name === 'listItem') {
                                    const greatGrandParent = $from.node(-2);
                                    if (greatGrandParent) {
                                        if (greatGrandParent.type.name === 'bulletList') {
                                            editorRef.current?.commands.toggleBulletList();
                                            return true;
                                        }
                                        if (greatGrandParent.type.name === 'orderedList') {
                                            editorRef.current?.commands.toggleOrderedList();
                                            return true;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                return false;
            }
        },
    });

    // Update editor content when switching notes
    useEffect(() => {
        if (editor && note && note.content !== editor.getHTML()) {
            editor.commands.setContent(note.content || '');
        }
    }, [editor, note?.id]);

    // Adjust height on note change or title change
    useEffect(() => {
        adjustHeight();
    }, [note?.id, note?.title]);

    // Sync editor ref for keyboard handler closures
    useEffect(() => {
        editorRef.current = editor;
    }, [editor]);

    // Prevent text cursor from showing when clicking checkboxes (runs in native DOM capture phase)
    useEffect(() => {
        if (!editor) return;

        let wasFocused = false;

        const handleCheckboxMouseEvent = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const isCheckboxOrLabel = 
                target.closest('input[type="checkbox"]') || 
                target.closest('li[data-type="taskItem"] > label');

            if (isCheckboxOrLabel) {
                if (e.type === 'mousedown') {
                    wasFocused = editor.isFocused;
                    // Visually hide the vertical blinking caret by making it transparent
                    editor.view.dom.classList.add('hide-caret');
                }

                if (e.type === 'click') {
                    // Let the native click flow so Tiptap toggles the checkbox perfectly!
                    // Then, clean up the focus and restore cursor visibility after the update completes
                    setTimeout(() => {
                        if (!wasFocused) {
                            editorRef.current?.commands.blur();
                        }
                        editorRef.current?.view.dom.classList.remove('hide-caret');
                    }, 150);
                }
            }
        };

        const dom = editor.view.dom;
        dom.addEventListener('mousedown', handleCheckboxMouseEvent, { capture: true });
        dom.addEventListener('mouseup', handleCheckboxMouseEvent, { capture: true });
        dom.addEventListener('click', handleCheckboxMouseEvent, { capture: true });

        return () => {
            dom.removeEventListener('mousedown', handleCheckboxMouseEvent, { capture: true });
            dom.removeEventListener('mouseup', handleCheckboxMouseEvent, { capture: true });
            dom.removeEventListener('click', handleCheckboxMouseEvent, { capture: true });
        };
    }, [editor]);


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

    const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            editor?.commands.focus('start');
        }
    };

    //^ Handle content changes
    const handleChange = (field: "title" | "content", value: string) => {
        onUpdateNote({
            ...note,
            [field]: value,
        });
    };

    //^ Tag handling
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
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
        } else if (e.key === "Escape") {
            setIsAddingTag(false);
            setTagInput("");
        }
    };

    const removeTag = (tagValue: string) => {
        if (!note) return;
        onUpdateNote({
            ...note,
            tags: note.tags.filter(t => t.value !== tagValue),
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
                            key={tag.value}
                            className="px-2.5 py-1 rounded-full bg-slate-800 text-xs font-medium text-slate-300 border border-slate-700 flex items-center gap-1 group hover:bg-slate-700 transition-colors shrink-0"
                        >
                            <Tag className="w-3 h-3 text-emerald-500" />
                            {tag.label}
                            <button
                                onClick={() => removeTag(tag.value)}
                                className="opacity-0 group-hover:opacity-100 ml-1 text-slate-500 hover:text-red-400 transition-opacity"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}

                    {isAddingTag ? (
                        <div className={`flex items-center gap-2 bg-slate-800 border rounded-full px-2.5 py-1 shrink-0 transition-colors ${
                            tagInput.trim() !== "" && note.tags.some(t => t.value === tagInput.trim().toLowerCase())
                                ? 'border-red-500'
                                : 'border-emerald-500'
                        }`}>
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
                                className="bg-transparent text-slate-200 text-xs focus:outline-none w-24"
                                placeholder="Add tag..."
                            />
                            <span className="text-[10px] text-slate-500 font-mono">
                                {tagInput.length}/20
                            </span>
                        </div>
                    ) : note.tags.length < 5 && (
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
            <div className="flex-1 overflow-y-auto w-full flex flex-col">
                <div className="max-w-4xl mx-auto p-8 lg:p-12 lg:pb-0 mt-4 flex-1 flex flex-col w-full">
                    <textarea
                        ref={titleRef}
                        value={note.title}
                        onChange={e => handleChange("title", e.target.value)}
                        onKeyDown={handleTitleKeyDown}
                        rows={1}
                        className="w-full bg-transparent text-4xl font-bold text-slate-100 focus:outline-none placeholder-slate-600 mb-2 resize-none overflow-hidden"
                        placeholder="Note Title"
                    />

                    <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed outline-none flex-1 flex flex-col">
                        <EditorContent editor={editor} className="flex-1 flex flex-col" />
                    </div>
                </div>
            </div>
        </main>
    );
}

export default NoteEditor;