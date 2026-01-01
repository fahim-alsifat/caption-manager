import type { Post, FilterType } from '../types';
import { formatDate } from '../utils/storage';

interface SidebarProps {
    posts: Post[];
    selectedPostId: string | null;
    filter: FilterType;
    searchQuery: string;
    onSelectPost: (id: string) => void;
    onNewPost: () => void;
    onFilterChange: (filter: FilterType) => void;
    onSearchChange: (query: string) => void;
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
}

export function Sidebar({
    posts,
    selectedPostId,
    filter,
    searchQuery,
    onSelectPost,
    onNewPost,
    onFilterChange,
    onSearchChange,
    theme,
    onToggleTheme
}: SidebarProps) {
    const filteredPosts = posts
        .filter(post => {
            if (filter === 'done') return post.status === 'done';
            if (filter === 'pending') return post.status === 'pending';
            return true;
        })
        .filter(post => {
            if (!searchQuery) return true;
            const query = searchQuery.toLowerCase();
            return (
                post.title.toLowerCase().includes(query) ||
                post.content.toLowerCase().includes(query) ||
                post.tags.some(tag => tag.toLowerCase().includes(query))
            );
        })
        .sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });

    const counts = {
        all: posts.length,
        done: posts.filter(p => p.status === 'done').length,
        pending: posts.filter(p => p.status === 'pending').length
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h1 className="app-title">
                    <span className="app-icon">📝</span>
                    Caption Manager
                </h1>
                <button className="theme-toggle" onClick={onToggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
                    {theme === 'dark' ? '☀️' : '🌙'}
                </button>
            </div>

            <button className="new-post-btn" onClick={onNewPost}>
                <span className="plus-icon">+</span>
                New Caption
            </button>

            <div className="search-container">
                <span className="search-icon">🔍</span>
                <input
                    type="text"
                    placeholder="Search captions..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="search-input"
                />
                {searchQuery && (
                    <button className="clear-search" onClick={() => onSearchChange('')}>×</button>
                )}
            </div>

            <div className="filter-tabs">
                {(['all', 'pending', 'done'] as FilterType[]).map(f => (
                    <button
                        key={f}
                        className={`filter-tab ${filter === f ? 'active' : ''}`}
                        onClick={() => onFilterChange(f)}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                        <span className="count">{counts[f]}</span>
                    </button>
                ))}
            </div>

            <div className="posts-list">
                {filteredPosts.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-icon">📭</span>
                        <p>{searchQuery ? 'No captions found' : 'No captions yet'}</p>
                    </div>
                ) : (
                    filteredPosts.map(post => (
                        <div
                            key={post.id}
                            className={`post-card ${selectedPostId === post.id ? 'selected' : ''} ${post.isPinned ? 'pinned' : ''}`}
                            onClick={() => onSelectPost(post.id)}
                        >
                            <div className="post-card-header">
                                <h3 className="post-title">
                                    {post.isPinned && <span className="pin-indicator">📌</span>}
                                    {post.title || 'Untitled'}
                                </h3>
                                <span className={`status-badge ${post.status}`}>
                                    {post.status === 'done' ? '✓' : '○'}
                                </span>
                            </div>
                            <p className="post-preview">
                                {post.content.slice(0, 80) || 'No content'}
                                {post.content.length > 80 && '...'}
                            </p>
                            <div className="post-meta">
                                <span className="post-date">{formatDate(post.updatedAt)}</span>
                                {post.tags.length > 0 && (
                                    <div className="post-tags">
                                        {post.tags.slice(0, 2).map(tag => (
                                            <span key={tag} className="tag-preview">#{tag}</span>
                                        ))}
                                        {post.tags.length > 2 && (
                                            <span className="tag-more">+{post.tags.length - 2}</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </aside>
    );
}
