import React, { useState, useEffect, useRef } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { Search, Filter } from 'lucide-react';

type Props = {
    search: string;
    onSearchNote: (value: string) => void;
    selectedTags: string[];
    allTags: string[];
    onChangeTags: Dispatch<SetStateAction<string[]>>;
};

function NotesFilter({ search, onSearchNote, selectedTags, allTags, onChangeTags }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

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

    return (
        <>
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

            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wider relative mt-4" ref={dropdownRef}>
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
        </>
    );
}

export default React.memo(NotesFilter);
