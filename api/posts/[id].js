import { connectDB } from '../lib/mongodb.js';
import Post from '../lib/models/Post.js';
import { authenticateRequest } from '../lib/auth.js';

export default async function handler(req, res) {
    // Authenticate user
    const userId = await authenticateRequest(req, res);
    if (!userId) return; // Response already sent

    const { id } = req.query;

    await connectDB();

    try {
        // Find post and verify ownership
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if user owns this post
        if (post.userId.toString() !== userId) {
            return res.status(403).json({ message: 'You do not have permission to modify this post' });
        }

        if (req.method === 'PUT') {
            const { title, content, status, isPinned, tags, order } = req.body;
            if (title !== undefined) post.title = title;
            if (content !== undefined) post.content = content;
            if (status !== undefined) post.status = status;
            if (isPinned !== undefined) post.isPinned = isPinned;
            if (tags !== undefined) post.tags = tags;
            if (order !== undefined) post.order = order;

            await post.save();

            return res.status(200).json({
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
        }

        if (req.method === 'DELETE') {
            await Post.findByIdAndDelete(id);
            return res.status(200).json({ message: 'Post deleted' });
        }

        return res.status(405).json({ message: 'Method not allowed' });
    } catch (error) {
        console.error('Post API error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}
