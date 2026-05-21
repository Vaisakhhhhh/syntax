import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { useEffect, useRef } from "react";
import type { Note } from "../../types/note";

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

type UseTiptapEditorProps = {
    note: Note | null;
    onChange: (field: "title" | "content", value: string) => void;
};

export const useTiptapEditor = ({ note, onChange }: UseTiptapEditorProps) => {
    const editorRef = useRef<any>(null);

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
                onChange("content", editor.getHTML());
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

    // Sync editor ref for keyboard handler closures
    useEffect(() => {
        editorRef.current = editor;
    }, [editor]);

    // Prevent text cursor from showing when clicking checkboxes
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

    return editor;
};
