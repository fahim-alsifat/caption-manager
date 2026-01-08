import { connectDB } from '../lib/mongodb.js';
import Post from '../lib/models/Post.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { id } = req.query;

    await connectDB();

    try {
        if (req.method === 'PUT') {
            const post = await Post.findById(id);
            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }

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
            const post = await Post.findByIdAndDelete(id);
            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }
            return res.status(200).json({ message: 'Post deleted' });
        }

        return res.status(405).json({ message: 'Method not allowed' });
    } catch (error) {
        console.error('Post API error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}
