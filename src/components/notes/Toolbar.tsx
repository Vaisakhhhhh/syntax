import { useState, useEffect, type ReactNode } from 'react';
import { type Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  CheckSquare,
  ListChecks,
  Palette
} from 'lucide-react';

interface ToolbarProps {
  editor: Editor | null;
}

const ToolbarButton = ({ 
  onClick, 
  isActive = false, 
  children, 
  title 
}: { 
  onClick: () => void, 
  isActive?: boolean, 
  children: ReactNode,
  title: string 
}) => (
  <button
    type="button"
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    title={title}
    className={`p-1.5 rounded-md transition-colors ${
      isActive
        ? 'bg-slate-800 text-slate-200'
        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
    }`}
  >
    {children}
  </button>
);

const Toolbar = ({ editor }: ToolbarProps) => {
  const [, forceUpdate] = useState({});
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const handleUpdate = () => {
      forceUpdate({});
    };

    editor.on('transaction', handleUpdate);
    editor.on('selectionUpdate', handleUpdate);

    return () => {
      editor.off('transaction', handleUpdate);
      editor.off('selectionUpdate', handleUpdate);
    };
  }, [editor]);

  if (!editor) {
    return null;
  }


  const colors = [
    { name: 'Black', value: '#000000' },
    { name: 'White', value: '#ffffff' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Rose', value: '#f43f5e' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Gray', value: '#64748b' }
  ];

  const toggleColorPicker = () => {
    setIsColorPickerOpen(!isColorPickerOpen);
  };

  const handleColorChange = (color: string) => {
    editor.chain().focus().setColor(color).run();
    setIsColorPickerOpen(false);
  };

  const handleNormalTaskList = () => {
    if (editor.isActive('taskList', { strikethrough: true })) {
      editor.chain().focus().updateAttributes('taskList', { strikethrough: false }).run();
    } else {
      editor.chain().focus().toggleTaskList().run();
    }
  };

  const handleStrikethroughTaskList = () => {
    if (editor.isActive('taskList', { strikethrough: false })) {
      editor.chain().focus().updateAttributes('taskList', { strikethrough: true }).run();
    } else if (editor.isActive('taskList', { strikethrough: true })) {
      editor.chain().focus().toggleTaskList().run();
    } else {
      editor.chain().focus().toggleTaskList().updateAttributes('taskList', { strikethrough: true }).run();
    }
  };

  return (
    <div className="flex items-center gap-1">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        title="Bold"
      >
        <Bold size={16} />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        title="Italic"
      >
        <Italic size={16} />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
        title="Strikethrough"
      >
        <Strikethrough size={16} />
      </ToolbarButton>

      <div className="w-px h-4 bg-slate-700 mx-2"></div>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive('heading', { level: 1 })}
        title="Heading 1"
      >
        <Heading1 size={16} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
        title="Heading 2"
      >
        <Heading2 size={16} />
      </ToolbarButton>

      <div className="w-px h-4 bg-slate-700 mx-2"></div>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        title="Bullet List"
      >
        <List size={16} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        title="Ordered List"
      >
        <ListOrdered size={16} />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={handleNormalTaskList}
        isActive={editor.isActive('taskList', { strikethrough: false })}
        title="Normal Task List"
      >
        <CheckSquare size={16} />
      </ToolbarButton>

      <ToolbarButton
        onClick={handleStrikethroughTaskList}
        isActive={editor.isActive('taskList', { strikethrough: true })}
        title="Strikethrough Task List"
      >
        <ListChecks size={16} />
      </ToolbarButton>

      <div className="w-px h-4 bg-slate-700 mx-2"></div>

      {/* Color Picker */}
      <div className="relative">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={toggleColorPicker}
          title="Text Color"
          className="p-1.5 rounded-md transition-colors text-slate-400 hover:bg-slate-800 hover:text-slate-200 flex items-center gap-1"
        >
          <Palette size={16} />
        </button>

        {isColorPickerOpen && (
          <div className="absolute top-full mt-2 right-0 z-50 bg-slate-800 border border-slate-700 shadow-xl rounded-lg p-2 flex gap-1">
            {colors.map((color) => (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                key={color.value}
                onClick={() => handleColorChange(color.value)}
                className="w-5 h-5 rounded-full border border-slate-600 hover:scale-110 transition-transform"
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
            <button 
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().unsetColor().run()}
                className="w-5 h-5 rounded-full border border-slate-600 bg-slate-900 hover:scale-110 transition-transform flex items-center justify-center text-[10px] text-slate-400"
                title="Reset Color"
            >
                ✕
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default Toolbar;
