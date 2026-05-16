import { useMemo } from "react";
import type { Note } from "../types/note";

export function useAllTags(notes: Note[]) {
    return useMemo(() => {
        return [...new Set(notes.flatMap(note => note.tags.map(tag => tag.value)))]
            .sort();
    }, [notes]);
};