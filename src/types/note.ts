export type Tag = {
    value: string;
    label: string;
}
export type Note = {
    id: string;
    title: string;
    content: string;
    tags: Tag[];
    updatedAt: number;
}