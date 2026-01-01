import React, { useState, useEffect, useRef } from 'react';
import type { Post, PostStatus } from '../types';
import { formatFullDate } from '../utils/storage';

// SVG Icons
const Icons = {
    pin: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 4a4 4 0 0 0-8 0v4H4v2l2 2v4l-2 2h8v4h4v-4h8l-2-2v-4l2-2V8h-8V4z" />
        </svg>
    ),
    copy: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
    ),
    trash: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
    ),
    edit: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
    ),
    bold: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
            <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
        </svg>
    ),
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
    chevronDown: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
    )
};

const STATUS_CONFIG: Record<PostStatus, { label: string; icon: React.ReactNode }> = {
    pending: { label: 'Pending', icon: Icons.pending },
    working: { label: 'Working', icon: Icons.working },
    done: { label: 'Done', icon: Icons.done }
};

interface PostEditorProps {
    post: Post | null;
    onSave: (post: Partial<Post>) => void;
    onDelete: (id: string) => void;
    onTogglePin: (id: string) => void;
    onToggleStatus: (id: string) => void;
    onChangeStatus?: (id: string, status: PostStatus) => void;
}

export function PostEditor({ post, onSave, onDelete, onTogglePin, onToggleStatus, onChangeStatus }: PostEditorProps) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showStatusMenu, setShowStatusMenu] = useState(false);
    const titleRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const statusMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (post) {
            setTitle(post.title);
            setContent(post.content);
            setTags(post.tags);
            setTagInput('');
            setShowDeleteConfirm(false);
            setShowStatusMenu(false);
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

    // Close status menu on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (statusMenuRef.current && !statusMenuRef.current.contains(e.target as Node)) {
                setShowStatusMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

    const handleBoldText = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = content.substring(start, end);

        if (selectedText) {
            const beforeText = content.substring(0, start);
            const afterText = content.substring(end);
            const boldText = `**${selectedText}**`;
            setContent(beforeText + boldText + afterText);

            // Restore cursor position after state update
            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(start, end + 4);
            }, 0);
        }
    };

    const handleStatusChange = (newStatus: PostStatus) => {
        if (post && onChangeStatus) {
            onChangeStatus(post.id, newStatus);
        }
        setShowStatusMenu(false);
    };

    if (!post) {
        return (
            <main className="editor-empty">
                <div className="empty-editor-content">
                    <span className="empty-editor-icon">{Icons.edit}</span>
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
                        {Icons.pin}
                    </button>

                    {/* Status Dropdown */}
                    <div className="status-dropdown" ref={statusMenuRef}>
                        <button
                            className={`action-btn status-btn ${post.status}`}
                            onClick={() => onChangeStatus ? setShowStatusMenu(!showStatusMenu) : onToggleStatus(post.id)}
                            title="Change status"
                        >
                            {STATUS_CONFIG[post.status].icon}
                            <span>{STATUS_CONFIG[post.status].label}</span>
                            {onChangeStatus && Icons.chevronDown}
                        </button>

                        {showStatusMenu && onChangeStatus && (
                            <div className="status-menu">
                                {(Object.keys(STATUS_CONFIG) as PostStatus[]).map(status => (
                                    <button
                                        key={status}
                                        className={`status-option ${post.status === status ? 'active' : ''}`}
                                        onClick={() => handleStatusChange(status)}
                                    >
                                        {STATUS_CONFIG[status].icon}
                                        <span>{STATUS_CONFIG[status].label}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        className="action-btn copy-btn"
                        onClick={handleCopyContent}
                        title="Copy to clipboard"
                    >
                        {Icons.copy} Copy
                    </button>
                    <button
                        className="action-btn delete-btn"
                        onClick={() => setShowDeleteConfirm(true)}
                        title="Delete caption"
                    >
                        {Icons.trash}
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

                {/* Text Formatting Toolbar */}
                <div className="editor-toolbar">
                    <button
                        className="toolbar-btn"
                        onClick={handleBoldText}
                        title="Bold (Select text first)"
                    >
                        {Icons.bold}
                    </button>
                </div>

                <textarea
                    ref={textareaRef}
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

