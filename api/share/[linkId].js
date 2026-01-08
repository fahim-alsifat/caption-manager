import { connectDB } from '../lib/mongodb.js';
import Post from '../lib/models/Post.js';
import SharedLink from '../lib/models/SharedLink.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { linkId } = req.query;

    await connectDB();

    try {
        if (req.method === 'GET') {
            const sharedLink = await SharedLink.findOne({ linkId });

            if (!sharedLink) {
                return res.status(404).json({ message: 'Shared link not found' });
            }

            if (sharedLink.expiresAt && new Date() > sharedLink.expiresAt) {
                return res.status(410).json({ message: 'Shared link has expired' });
            }

            const post = await Post.findById(sharedLink.postId);
            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }

            return res.status(200).json({
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
        }

        if (req.method === 'PUT') {
            const sharedLink = await SharedLink.findOne({ linkId });

            if (!sharedLink) {
                return res.status(404).json({ message: 'Shared link not found' });
            }

            if (sharedLink.permission !== 'edit') {
                return res.status(403).json({ message: 'You do not have permission to edit' });
            }

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

        return res.status(405).json({ message: 'Method not allowed' });
    } catch (error) {
        console.error('Share link API error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}
