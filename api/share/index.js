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

    await connectDB();

    try {
        if (req.method === 'POST') {
            const { postId, permission } = req.body;

            const post = await Post.findById(postId);
            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }

            const sharedLink = new SharedLink({
                postId,
                permission: permission || 'view'
            });
            await sharedLink.save();

            return res.status(201).json({
                linkId: sharedLink.linkId,
                permission: sharedLink.permission,
                url: `/share/${sharedLink.linkId}`
            });
        }

        return res.status(405).json({ message: 'Method not allowed' });
    } catch (error) {
        console.error('Share API error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}
