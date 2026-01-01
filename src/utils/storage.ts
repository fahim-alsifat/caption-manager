import type { Post } from '../types';

const STORAGE_KEY = 'caption-manager-posts';
const THEME_KEY = 'caption-manager-theme';

export const storage = {
    getPosts: (): Post[] => {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    },

    savePosts: (posts: Post[]): void => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
        } catch (error) {
            console.error('Failed to save posts:', error);
        }
    },

    getTheme: (): 'light' | 'dark' => {
        try {
            const theme = localStorage.getItem(THEME_KEY);
            if (theme === 'light' || theme === 'dark') return theme;
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        } catch {
            return 'light';
        }
    },

    saveTheme: (theme: 'light' | 'dark'): void => {
        try {
            localStorage.setItem(THEME_KEY, theme);
        } catch (error) {
            console.error('Failed to save theme:', error);
        }
    }
};

export const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return date.toLocaleDateString('en-US', { weekday: 'long' });
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
};

export const formatFullDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
};
