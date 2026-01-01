import { useState, useEffect, useRef } from 'react';
import type { Post } from '../types';
import { formatFullDate } from '../utils/storage';

interface PostEditorProps {
    post: Post | null;
    onSave: (post: Partial<Post>) => void;
    onDelete: (id: string) => void;
    onTogglePin: (id: string) => void;
    onToggleStatus: (id: string) => void;
}

export function PostEditor({ post, onSave, onDelete, onTogglePin, onToggleStatus }: PostEditorProps) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const titleRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (post) {
            setTitle(post.title);
            setContent(post.content);
            setTags(post.tags);
            setTagInput('');
            setShowDeleteConfirm(false);
        }
    }, [post?.id]);

    useEffect(() => {
        if (post && (title !== post.title || content !== post.content || JSON.stringify(tags) !== JSON.stringify(post.tags))) {
            const timer = setTimeout(() => {
                onSave({ id: post.id, title, content, tags });
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [title, content, tags]);

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

    const handleCopyContent = () => {
        const textToCopy = `${title}\n\n${content}\n\n${tags.map(t => '#' + t).join(' ')}`;
        navigator.clipboard.writeText(textToCopy);
    };

    if (!post) {
        return (
            <main className="editor-empty">
                <div className="empty-editor-content">
                    <span className="empty-editor-icon">✍️</span>
                    <h2>Select a caption</h2>
                    <p>Choose a caption from the sidebar or create a new one</p>
                </div>
            </main>
        );
    }

    return (
        <main className="editor">
            <header className="editor-header">
                <div className="editor-actions">
                    <button
                        className={`action-btn pin-btn ${post.isPinned ? 'active' : ''}`}
                        onClick={() => onTogglePin(post.id)}
                        title={post.isPinned ? 'Unpin' : 'Pin'}
                    >
                        📌
                    </button>
                    <button
                        className={`action-btn status-btn ${post.status}`}
                        onClick={() => onToggleStatus(post.id)}
                        title={post.status === 'done' ? 'Mark as pending' : 'Mark as done'}
                    >
                        {post.status === 'done' ? '✓ Done' : '○ Pending'}
                    </button>
                    <button
                        className="action-btn copy-btn"
                        onClick={handleCopyContent}
                        title="Copy to clipboard"
                    >
                        📋 Copy
                    </button>
                    <button
                        className="action-btn delete-btn"
                        onClick={() => setShowDeleteConfirm(true)}
                        title="Delete caption"
                    >
                        🗑️
                    </button>
                </div>
                <div className="editor-meta">
                    <span>Last updated: {formatFullDate(post.updatedAt)}</span>
                </div>
            </header>

            <div className="editor-content">
                <input
                    ref={titleRef}
                    type="text"
                    className="editor-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Caption title..."
                />

                <textarea
                    className="editor-textarea"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your caption here..."
                />

                <div className="tags-section">
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
                </div>
            </div>

            {showDeleteConfirm && (
                <div className="delete-modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Delete Caption?</h3>
                        <p>This action cannot be undone.</p>
                        <div className="delete-modal-actions">
                            <button className="cancel-btn" onClick={() => setShowDeleteConfirm(false)}>
                                Cancel
                            </button>
                            <button className="confirm-delete-btn" onClick={() => onDelete(post.id)}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
