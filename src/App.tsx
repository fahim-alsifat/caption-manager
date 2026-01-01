import { useState, useEffect, useCallback } from 'react';
import { Sidebar, PostEditor } from './components';
import type { Post, FilterType, AppState, PostStatus } from './types';
import { storage, generateId } from './utils/storage';
import { useKeyboardShortcuts } from './hooks/hooks';
import './App.css';

function App() {
  const [state, setState] = useState<AppState>(() => ({
    posts: storage.getPosts(),
    selectedPostId: null,
    filter: 'all',
    searchQuery: '',
    theme: storage.getTheme()
  }));

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
    storage.saveTheme(state.theme);
  }, [state.theme]);

  // Save posts to storage
  useEffect(() => {
    storage.savePosts(state.posts);
  }, [state.posts]);

  const selectedPost = state.posts.find(p => p.id === state.selectedPostId) || null;

  const handleNewPost = useCallback(() => {
    const now = new Date().toISOString();
    const newPost: Post = {
      id: generateId(),
      title: '',
      content: '',
      createdAt: now,
      updatedAt: now,
      status: 'pending',
      isPinned: false,
      tags: [],
      order: state.posts.length
    };
    setState(prev => ({
      ...prev,
      posts: [newPost, ...prev.posts],
      selectedPostId: newPost.id
    }));
  }, [state.posts.length]);

  const handleSelectPost = useCallback((id: string) => {
    setState(prev => ({ ...prev, selectedPostId: id }));
  }, []);

  const handleSavePost = useCallback((updates: Partial<Post>) => {
    setState(prev => ({
      ...prev,
      posts: prev.posts.map(post =>
        post.id === updates.id
          ? { ...post, ...updates, updatedAt: new Date().toISOString() }
          : post
      )
    }));
  }, []);

  const handleDeletePost = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      posts: prev.posts.filter(post => post.id !== id),
      selectedPostId: prev.selectedPostId === id ? null : prev.selectedPostId
    }));
  }, []);

  const handleTogglePin = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      posts: prev.posts.map(post =>
        post.id === id
          ? { ...post, isPinned: !post.isPinned, updatedAt: new Date().toISOString() }
          : post
      )
    }));
  }, []);

  const handleToggleStatus = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      posts: prev.posts.map(post => {
        if (post.id !== id) return post;
        const nextStatus = post.status === 'pending' ? 'working'
          : post.status === 'working' ? 'done'
            : 'pending';
        return {
          ...post,
          status: nextStatus,
          updatedAt: new Date().toISOString()
        };
      })
    }));
  }, []);

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
        }}
      />
    </div>
  );
}

export default App;
