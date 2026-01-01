import type { Post, FilterType } from '../types';
import { formatDate } from '../utils/storage';

// SVG Icons
const Icons = {
    caption: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
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
    search: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
    ),
    pin: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 4a4 4 0 0 0-8 0v4H4v2l2 2v4l-2 2h8v4h4v-4h8l-2-2v-4l2-2V8h-8V4z" />
        </svg>
    ),
    empty: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 8V21H3V8"></path>
            <path d="M23 3H1V8H23V3Z"></path>
            <path d="M10 12H14"></path>
        </svg>
    ),
    pending: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"></circle>
        </svg>
    ),
    working: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 6v6l4 2"></path>
        </svg>
    ),
    done: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
    )
};

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
            if (filter === 'working') return post.status === 'working';
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
        pending: posts.filter(p => p.status === 'pending').length,
        working: posts.filter(p => p.status === 'working').length,
        done: posts.filter(p => p.status === 'done').length
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'done': return Icons.done;
            case 'working': return Icons.working;
            default: return Icons.pending;
        }
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h1 className="app-title">
                    <span className="app-icon">{Icons.caption}</span>
                    Caption Manager
                </h1>
                <button className="theme-toggle" onClick={onToggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
                    {theme === 'dark' ? Icons.sun : Icons.moon}
                </button>
            </div>

            <button className="new-post-btn" onClick={onNewPost}>
                <span className="plus-icon">+</span>
                New Caption
            </button>

            <div className="search-container">
                <span className="search-icon">{Icons.search}</span>
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
                {(['all', 'pending', 'working', 'done'] as FilterType[]).map(f => (
                    <button
                        key={f}
                        className={`filter-tab ${filter === f ? 'active' : ''} filter-${f}`}
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
                        <span className="empty-icon">{Icons.empty}</span>
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
                                    {post.isPinned && <span className="pin-indicator">{Icons.pin}</span>}
                                    {post.title || 'Untitled'}
                                </h3>
                                <span className={`status-badge ${post.status}`}>
                                    {getStatusIcon(post.status)}
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

