import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        default: ''
    },
    content: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['pending', 'working', 'done'],
        default: 'pending'
    },
    isPinned: {
        type: Boolean,
        default: false
    },
    tags: {
        type: [String],
        default: []
    },
    order: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update updatedAt on save
PostSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

export default mongoose.model('Post', PostSchema);
