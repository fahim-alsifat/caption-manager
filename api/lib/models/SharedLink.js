import mongoose from 'mongoose';
import crypto from 'crypto';

const SharedLinkSchema = new mongoose.Schema({
    linkId: { type: String, required: true, unique: true, default: () => crypto.randomBytes(8).toString('hex') },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    permission: { type: String, enum: ['view', 'edit'], default: 'view' },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: null }
});

export default mongoose.models.SharedLink || mongoose.model('SharedLink', SharedLinkSchema);
