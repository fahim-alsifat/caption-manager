import express from 'express';
import Post from '../models/Post.js';

const router = express.Router();

// GET all posts
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().sort({ isPinned: -1, order: 1, updatedAt: -1 });
        // Transform MongoDB _id to id for frontend compatibility
        const transformedPosts = posts.map(post => ({
            id: post._id.toString(),
            title: post.title,
            content: post.content,
            status: post.status,
            isPinned: post.isPinned,
            tags: post.tags,
            order: post.order,
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString()
        }));
        res.json(transformedPosts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST create new post
router.post('/', async (req, res) => {
    try {
        const { title, content, status, isPinned, tags, order } = req.body;
        const post = new Post({
            title: title || '',
            content: content || '',
            status: status || 'pending',
            isPinned: isPinned || false,
            tags: tags || [],
            order: order || 0
        });
        await post.save();
        res.status(201).json({
            id: post._id.toString(),
            title: post.title,
            content: post.content,
            status: post.status,
            isPinned: post.isPinned,
            tags: post.tags,
            order: post.order,
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString()
        });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT update post
router.put('/:id', async (req, res) => {
    try {
        const { title, content, status, isPinned, tags, order } = req.body;
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (title !== undefined) post.title = title;
        if (content !== undefined) post.content = content;
        if (status !== undefined) post.status = status;
        if (isPinned !== undefined) post.isPinned = isPinned;
        if (tags !== undefined) post.tags = tags;
        if (order !== undefined) post.order = order;

        await post.save();

        res.json({
            id: post._id.toString(),
            title: post.title,
            content: post.content,
            status: post.status,
            isPinned: post.isPinned,
            tags: post.tags,
            order: post.order,
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString()
        });
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE post
router.delete('/:id', async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json({ message: 'Post deleted' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
