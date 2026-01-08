import { useState, useEffect, useCallback } from 'react';
import { Sidebar, PostEditor } from './components';
import { SharedView } from './components/SharedView';
import type { Post, FilterType, AppState, PostStatus } from './types';
import { storage } from './utils/storage';
import { postsApi } from './utils/api';
import { useKeyboardShortcuts } from './hooks/hooks';
import './App.css';

function App() {
  const [state, setState] = useState<AppState>(() => ({
    posts: [],
    selectedPostId: null,
    filter: 'all',
    searchQuery: '',
    theme: storage.getTheme()
  }));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if this is a shared view
  const isSharedView = window.location.pathname.startsWith('/share/');
  const shareLinkId = isSharedView ? window.location.pathname.split('/share/')[1] : null;

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
    storage.saveTheme(state.theme);
  }, [state.theme]);

  // Load posts from API on mount
  useEffect(() => {
    if (isSharedView) return; // Don't load all posts for shared view

    const loadPosts = async () => {
      try {
        setIsLoading(true);
        const posts = await postsApi.getAll();
        setState(prev => ({ ...prev, posts }));
        setError(null);
      } catch (err) {
        setError('Failed to load posts. Make sure the server is running.');
        console.error('Load posts error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadPosts();
  }, [isSharedView]);

  const selectedPost = state.posts.find(p => p.id === state.selectedPostId) || null;

  const handleNewPost = useCallback(async () => {
    try {
      const newPost = await postsApi.create({
        title: '',
        content: '',
        status: 'pending',
        isPinned: false,
        tags: [],
        order: state.posts.length
      });
      setState(prev => ({
        ...prev,
        posts: [newPost, ...prev.posts],
        selectedPostId: newPost.id
      }));
    } catch (err) {
      console.error('Create post error:', err);
    }
  }, [state.posts.length]);

  const handleSelectPost = useCallback((id: string) => {
    setState(prev => ({ ...prev, selectedPostId: id }));
  }, []);

  const handleSavePost = useCallback(async (updates: Partial<Post>) => {
    if (!updates.id) return;

    // Optimistic update
    setState(prev => ({
      ...prev,
      posts: prev.posts.map(post =>
        post.id === updates.id
          ? { ...post, ...updates, updatedAt: new Date().toISOString() }
          : post
      )
    }));

    try {
      await postsApi.update(updates.id, updates);
    } catch (err) {
      console.error('Save post error:', err);
      // Reload posts on error
      const posts = await postsApi.getAll();
      setState(prev => ({ ...prev, posts }));
    }
  }, []);

  const handleDeletePost = useCallback(async (id: string) => {
    try {
      await postsApi.delete(id);
      setState(prev => ({
        ...prev,
        posts: prev.posts.filter(post => post.id !== id),
        selectedPostId: prev.selectedPostId === id ? null : prev.selectedPostId
      }));
    } catch (err) {
      console.error('Delete post error:', err);
    }
  }, []);

  const handleTogglePin = useCallback(async (id: string) => {
    const post = state.posts.find(p => p.id === id);
    if (!post) return;

    const newIsPinned = !post.isPinned;
    setState(prev => ({
      ...prev,
      posts: prev.posts.map(p =>
        p.id === id
          ? { ...p, isPinned: newIsPinned, updatedAt: new Date().toISOString() }
          : p
      )
    }));

    try {
      await postsApi.update(id, { isPinned: newIsPinned });
    } catch (err) {
      console.error('Toggle pin error:', err);
    }
  }, [state.posts]);

  const handleToggleStatus = useCallback(async (id: string) => {
    const post = state.posts.find(p => p.id === id);
    if (!post) return;

    const nextStatus: PostStatus = post.status === 'pending' ? 'working'
      : post.status === 'working' ? 'done'
        : 'pending';

    setState(prev => ({
      ...prev,
      posts: prev.posts.map(p =>
        p.id === id
          ? { ...p, status: nextStatus, updatedAt: new Date().toISOString() }
          : p
      )
    }));

    try {
      await postsApi.update(id, { status: nextStatus });
    } catch (err) {
      console.error('Toggle status error:', err);
    }
  }, [state.posts]);

  const handleFilterChange = useCallback((filter: FilterType) => {
    setState(prev => ({ ...prev, filter }));
  }, []);

  const handleSearchChange = useCallback((searchQuery: string) => {
    setState(prev => ({ ...prev, searchQuery }));
  }, []);

  const handleToggleTheme = useCallback(() => {
    setState(prev => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark'
    }));
  }, []);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    'mod+n': handleNewPost,
    'mod+d': () => state.selectedPostId && handleToggleStatus(state.selectedPostId),
  });

  // Render shared view if on share URL
  if (isSharedView && shareLinkId) {
    return <SharedView linkId={shareLinkId} theme={state.theme} onToggleTheme={handleToggleTheme} />;
  }

  if (isLoading) {
    return (
      <div className="app loading-screen">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app error-screen">
        <div className="error-content">
          <h2>Connection Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Sidebar
        posts={state.posts}
        selectedPostId={state.selectedPostId}
        filter={state.filter}
        searchQuery={state.searchQuery}
        onSelectPost={handleSelectPost}
        onNewPost={handleNewPost}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
        theme={state.theme}
        onToggleTheme={handleToggleTheme}
      />
      <PostEditor
        post={selectedPost}
        onSave={handleSavePost}
        onDelete={handleDeletePost}
        onTogglePin={handleTogglePin}
        onToggleStatus={handleToggleStatus}
        onChangeStatus={(id: string, status: PostStatus) => {
          setState(prev => ({
            ...prev,
            posts: prev.posts.map(post =>
              post.id === id
                ? { ...post, status, updatedAt: new Date().toISOString() }
                : post
            )
          }));
          postsApi.update(id, { status }).catch(console.error);
        }}
      />
    </div>
  );
}

export default App;
