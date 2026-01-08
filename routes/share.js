import express from 'express';
import Post from '../models/Post.js';
import SharedLink from '../models/SharedLink.js';

const router = express.Router();

// POST create shared link
router.post('/', async (req, res) => {
    try {
        const { postId, permission } = req.body;

        // Verify post exists
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Create shared link
        const sharedLink = new SharedLink({
            postId,
            permission: permission || 'view'
        });
        await sharedLink.save();

        res.status(201).json({
            linkId: sharedLink.linkId,
            permission: sharedLink.permission,
            url: `/share/${sharedLink.linkId}`
        });
    } catch (error) {
        console.error('Error creating shared link:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET shared post by link ID
router.get('/:linkId', async (req, res) => {
    try {
        const sharedLink = await SharedLink.findOne({ linkId: req.params.linkId });

        if (!sharedLink) {
            return res.status(404).json({ message: 'Shared link not found' });
        }

        // Check if expired
        if (sharedLink.expiresAt && new Date() > sharedLink.expiresAt) {
            return res.status(410).json({ message: 'Shared link has expired' });
        }

        const post = await Post.findById(sharedLink.postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json({
            permission: sharedLink.permission,
            post: {
                id: post._id.toString(),
                title: post.title,
                content: post.content,
                status: post.status,
                isPinned: post.isPinned,
                tags: post.tags,
                order: post.order,
                createdAt: post.createdAt.toISOString(),
                updatedAt: post.updatedAt.toISOString()
            }
        });
    } catch (error) {
        console.error('Error fetching shared post:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT update shared post (only if permission is 'edit')
router.put('/:linkId', async (req, res) => {
    try {
        const sharedLink = await SharedLink.findOne({ linkId: req.params.linkId });

        if (!sharedLink) {
            return res.status(404).json({ message: 'Shared link not found' });
        }

        if (sharedLink.permission !== 'edit') {
            return res.status(403).json({ message: 'You do not have permission to edit' });
        }

        // Check if expired
        if (sharedLink.expiresAt && new Date() > sharedLink.expiresAt) {
            return res.status(410).json({ message: 'Shared link has expired' });
        }

        const post = await Post.findById(sharedLink.postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const { title, content, status, isPinned, tags } = req.body;
        if (title !== undefined) post.title = title;
        if (content !== undefined) post.content = content;
        if (status !== undefined) post.status = status;
        if (isPinned !== undefined) post.isPinned = isPinned;
        if (tags !== undefined) post.tags = tags;

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
        console.error('Error updating shared post:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
