export type PostStatus = 'pending' | 'working' | 'done';

export interface Post {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    status: PostStatus;
    isPinned: boolean;
    tags: string[];
    order: number;
}

export type FilterType = 'all' | 'pending' | 'working' | 'done';

export interface AppState {
    posts: Post[];
    selectedPostId: string | null;
    filter: FilterType;
    searchQuery: string;
    theme: 'light' | 'dark';
}
