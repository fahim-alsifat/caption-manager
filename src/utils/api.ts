import type { Post } from '../types';

// Use relative path - works on both localhost and Vercel production
const API_BASE = '/api';

// Helper to get auth headers
function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
}

// Posts API (requires authentication)
export const postsApi = {
    getAll: async (): Promise<Post[]> => {
        const response = await fetch(`${API_BASE}/posts`, {
            headers: getAuthHeaders()
        });
        if (response.status === 401) throw new Error('Not authenticated');
        if (!response.ok) throw new Error('Failed to fetch posts');
        return response.json();
    },

    create: async (post: Partial<Post>): Promise<Post> => {
        const response = await fetch(`${API_BASE}/posts`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(post)
        });
        if (response.status === 401) throw new Error('Not authenticated');
        if (!response.ok) throw new Error('Failed to create post');
        return response.json();
    },

    update: async (id: string, updates: Partial<Post>): Promise<Post> => {
        const response = await fetch(`${API_BASE}/posts/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(updates)
        });
        if (response.status === 401) throw new Error('Not authenticated');
        if (!response.ok) throw new Error('Failed to update post');
        return response.json();
    },

    delete: async (id: string): Promise<void> => {
        const response = await fetch(`${API_BASE}/posts/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (response.status === 401) throw new Error('Not authenticated');
        if (!response.ok) throw new Error('Failed to delete post');
    }
};

// Share API
export interface ShareLinkResponse {
    linkId: string;
    permission: 'view' | 'edit';
    url: string;
}

export interface SharedPostResponse {
    permission: 'view' | 'edit';
    post: Post;
}

export const shareApi = {
    createLink: async (postId: string, permission: 'view' | 'edit'): Promise<ShareLinkResponse> => {
        const response = await fetch(`${API_BASE}/share`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ postId, permission })
        });
        if (!response.ok) throw new Error('Failed to create share link');
        return response.json();
    },

    getSharedPost: async (linkId: string): Promise<SharedPostResponse> => {
        const response = await fetch(`${API_BASE}/share/${linkId}`);
        if (!response.ok) {
            if (response.status === 404) throw new Error('Link not found');
            if (response.status === 410) throw new Error('Link expired');
            throw new Error('Failed to fetch shared post');
        }
        return response.json();
    },

    updateSharedPost: async (linkId: string, updates: Partial<Post>): Promise<Post> => {
        const response = await fetch(`${API_BASE}/share/${linkId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        if (!response.ok) {
            if (response.status === 403) throw new Error('No edit permission');
            throw new Error('Failed to update shared post');
        }
        return response.json();
    },

    updateLinkPermission: async (linkId: string, permission: 'view' | 'edit'): Promise<{ linkId: string; permission: string }> => {
        const response = await fetch(`${API_BASE}/share/${linkId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ permission })
        });
        if (!response.ok) throw new Error('Failed to update permission');
        return response.json();
    },

    deleteLink: async (linkId: string): Promise<void> => {
        const response = await fetch(`${API_BASE}/share/${linkId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete link');
    }
};
