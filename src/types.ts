export interface Post {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    status: 'pending' | 'done';
    isPinned: boolean;
    tags: string[];
    order: number;
}

export type FilterType = 'all' | 'done' | 'pending';

export interface AppState {
    posts: Post[];
    selectedPostId: string | null;
    filter: FilterType;
    searchQuery: string;
    theme: 'light' | 'dark';
}
