import React, { useState, useEffect, useRef } from 'react';
import type { Post, PostStatus } from '../types';
import { shareApi } from '../utils/api';
import { formatFullDate } from '../utils/storage';

// SVG Icons
const Icons = {
    pending: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"></circle>
        </svg>
    ),
    working: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 6v6l4 2"></path>
        </svg>
    ),
    done: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
    ),
    sun: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
    ),
    moon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
    ),
    lock: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
    ),
    edit: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
    )
};

const STATUS_CONFIG: Record<PostStatus, { label: string; icon: React.ReactNode }> = {
    pending: { label: 'Pending', icon: Icons.pending },
    working: { label: 'Working', icon: Icons.working },
    done: { label: 'Done', icon: Icons.done }
};

interface SharedViewProps {
    linkId: string;
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
}

export function SharedView({ linkId, theme, onToggleTheme }: SharedViewProps) {
    const [post, setPost] = useState<Post | null>(null);
    const [permission, setPermission] = useState<'view' | 'edit'>('view');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    useEffect(() => {
        const loadSharedPost = async () => {
            try {
                setIsLoading(true);
                const result = await shareApi.getSharedPost(linkId);
                setPost(result.post);
                setPermission(result.permission);
                setTitle(result.post.title);
                setContent(result.post.content);
                setTags(result.post.tags);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load shared post');
            } finally {
                setIsLoading(false);
            }
        };
        loadSharedPost();
    }, [linkId]);

    // Auto-save for edit permission
    useEffect(() => {
        if (permission !== 'edit' || !post) return;
        if (title === post.title && content === post.content && JSON.stringify(tags) === JSON.stringify(post.tags)) return;

        const timer = setTimeout(async () => {
            setIsSaving(true);
            try {
                const updated = await shareApi.updateSharedPost(linkId, { title, content, tags });
                setPost(updated);
            } catch (err) {
                console.error('Failed to save:', err);
            } finally {
                setIsSaving(false);
            }
        }, 800);

        return () => clearTimeout(timer);
    }, [title, content, tags, permission, post, linkId]);

    const handleAddTag = () => {
        const newTag = tagInput.trim().toLowerCase();
        if (newTag && !tags.includes(newTag)) {
            setTags([...tags, newTag]);
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleTagKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            handleAddTag();
        }
    };

    if (isLoading) {
        return (
            <div className="shared-view-container">
                <div className="loading-content">
                    <div className="loading-spinner"></div>
                    <p>Loading shared caption...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="shared-view-container">
                <div className="error-content">
                    <h2>Unable to Load</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (!post) return null;

    const canEdit = permission === 'edit';

    return (
        <div className="shared-view-container">
            <header className="shared-view-header">
                <div className="shared-view-info">
                    <span className={`permission-badge ${permission}`}>
                        {permission === 'view' ? Icons.lock : Icons.edit}
                        {permission === 'view' ? 'View Only' : 'Can Edit'}
                    </span>
                    {isSaving && <span className="saving-indicator">Saving...</span>}
                </div>
                <div className="shared-view-actions">
                    <span className={`status-badge ${post.status}`}>
                        {STATUS_CONFIG[post.status].icon}
                        {STATUS_CONFIG[post.status].label}
                    </span>
                    <button className="theme-toggle" onClick={onToggleTheme}>
                        {theme === 'dark' ? Icons.sun : Icons.moon}
                    </button>
                </div>
            </header>

            <main className="shared-view-content">
                {canEdit ? (
                    <input
                        type="text"
                        className="shared-title-input"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Caption title..."
                    />
                ) : (
                    <h1 className="shared-title">{title || 'Untitled Caption'}</h1>
                )}

                <div className="shared-meta">
                    Last updated: {formatFullDate(post.updatedAt)}
                </div>

                {canEdit ? (
                    <textarea
                        ref={textareaRef}
                        className="shared-content-textarea"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write your caption here..."
                    />
                ) : (
                    <div className="shared-content">
                        {content || 'No content'}
                    </div>
                )}

                <div className="shared-tags-section">
                    {canEdit ? (
                        <div className="tags-input-container">
                            <span className="tags-label">Tags:</span>
                            <div className="tags-wrapper">
                                {tags.map(tag => (
                                    <span key={tag} className="tag">
                                        #{tag}
                                        <button className="tag-remove" onClick={() => handleRemoveTag(tag)}>×</button>
                                    </span>
                                ))}
                                <input
                                    type="text"
                                    className="tag-input"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleTagKeyDown}
                                    onBlur={handleAddTag}
                                    placeholder="Add tag..."
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="shared-tags">
                            {tags.map(tag => (
                                <span key={tag} className="tag">#{tag}</span>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <footer className="shared-view-footer">
                <p>Shared via Caption Manager</p>
            </footer>
        </div>
    );
}
