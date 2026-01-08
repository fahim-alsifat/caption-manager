import React, { useState, useEffect, useRef } from 'react';
import type { Post, PostStatus } from '../types';
import { shareApi } from '../utils/api';
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
    ),
    share: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
        </svg>
    ),
    link: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
        </svg>
    ),
    check: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    ),
    lock: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
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
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareLink, setShareLink] = useState<string | null>(null);
    const [shareLinkId, setShareLinkId] = useState<string | null>(null);
    const [sharePermission, setSharePermission] = useState<'view' | 'edit'>('view');
    const [isCreatingLink, setIsCreatingLink] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);
    const [isUpdatingPermission, setIsUpdatingPermission] = useState(false);
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
            setShowShareModal(false);
            setShareLink(null);
            setShareLinkId(null);
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

    const handleCreateShareLink = async () => {
        if (!post) return;

        setIsCreatingLink(true);
        try {
            const result = await shareApi.createLink(post.id, sharePermission);
            const fullUrl = `${window.location.origin}/share/${result.linkId}`;
            setShareLink(fullUrl);
            setShareLinkId(result.linkId);
        } catch (error) {
            console.error('Failed to create share link:', error);
        } finally {
            setIsCreatingLink(false);
        }
    };

    const handleCopyShareLink = () => {
        if (shareLink) {
            navigator.clipboard.writeText(shareLink);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        }
    };

    const handleChangePermission = async (newPermission: 'view' | 'edit') => {
        if (!shareLinkId || newPermission === sharePermission) return;

        setIsUpdatingPermission(true);
        try {
            await shareApi.updateLinkPermission(shareLinkId, newPermission);
            setSharePermission(newPermission);
        } catch (error) {
            console.error('Failed to update permission:', error);
        } finally {
            setIsUpdatingPermission(false);
        }
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
                        className="action-btn share-btn"
                        onClick={() => setShowShareModal(true)}
                        title="Share caption"
                    >
                        {Icons.share} Share
                    </button>

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

            {/* Delete Confirmation Modal */}
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

            {/* Share Modal */}
            {showShareModal && (
                <div className="delete-modal-overlay" onClick={() => setShowShareModal(false)}>
                    <div className="share-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>{Icons.share} Share Caption</h3>

                        {!shareLink ? (
                            <>
                                <div className="share-options">
                                    <label className="share-option">
                                        <input
                                            type="radio"
                                            name="permission"
                                            value="view"
                                            checked={sharePermission === 'view'}
                                            onChange={() => setSharePermission('view')}
                                        />
                                        <div className="share-option-content">
                                            <strong>View only</strong>
                                            <span>Others can only view this caption</span>
                                        </div>
                                    </label>
                                    <label className="share-option">
                                        <input
                                            type="radio"
                                            name="permission"
                                            value="edit"
                                            checked={sharePermission === 'edit'}
                                            onChange={() => setSharePermission('edit')}
                                        />
                                        <div className="share-option-content">
                                            <strong>Can edit</strong>
                                            <span>Others can view and edit this caption</span>
                                        </div>
                                    </label>
                                </div>
                                <div className="share-modal-actions">
                                    <button className="cancel-btn" onClick={() => setShowShareModal(false)}>
                                        Cancel
                                    </button>
                                    <button
                                        className="create-link-btn"
                                        onClick={handleCreateShareLink}
                                        disabled={isCreatingLink}
                                    >
                                        {isCreatingLink ? 'Creating...' : 'Create Link'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="share-link-result">
                                    <div className="share-link-box">
                                        {Icons.link}
                                        <input
                                            type="text"
                                            value={shareLink}
                                            readOnly
                                            onClick={(e) => (e.target as HTMLInputElement).select()}
                                        />
                                    </div>

                                    {/* Permission Toggle */}
                                    <div className="permission-toggle">
                                        <span className="permission-label">Permission:</span>
                                        <div className="toggle-buttons">
                                            <button
                                                className={`toggle-btn ${sharePermission === 'view' ? 'active' : ''}`}
                                                onClick={() => handleChangePermission('view')}
                                                disabled={isUpdatingPermission}
                                            >
                                                {Icons.lock} View only
                                            </button>
                                            <button
                                                className={`toggle-btn ${sharePermission === 'edit' ? 'active' : ''}`}
                                                onClick={() => handleChangePermission('edit')}
                                                disabled={isUpdatingPermission}
                                            >
                                                {Icons.edit} Can edit
                                            </button>
                                        </div>
                                        {isUpdatingPermission && <span className="updating-text">Updating...</span>}
                                    </div>
                                </div>
                                <div className="share-modal-actions">
                                    <button className="cancel-btn" onClick={() => setShowShareModal(false)}>
                                        Close
                                    </button>
                                    <button
                                        className={`copy-link-btn ${linkCopied ? 'copied' : ''}`}
                                        onClick={handleCopyShareLink}
                                    >
                                        {linkCopied ? <>{Icons.check} Copied!</> : <>{Icons.copy} Copy Link</>}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}
