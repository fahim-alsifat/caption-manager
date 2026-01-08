import { connectDB } from '../lib/mongodb.js';
import Post from '../lib/models/Post.js';

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    await connectDB();

    try {
        if (req.method === 'GET') {
            const posts = await Post.find().sort({ isPinned: -1, order: 1, updatedAt: -1 });
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
            return res.status(200).json(transformedPosts);
        }

        if (req.method === 'POST') {
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
            return res.status(201).json({
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

        return res.status(405).json({ message: 'Method not allowed' });
    } catch (error) {
        console.error('Posts API error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}
