import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'caption-manager-secret-key-change-in-production';

// Generate JWT token
export function generateToken(userId) {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
}

// Verify JWT token and extract userId
export function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded.userId;
    } catch (error) {
        return null;
    }
}

// Middleware to get userId from request
export function getUserIdFromRequest(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.split(' ')[1];
    return verifyToken(token);
}

// Add CORS and check auth - returns userId or sends error response
export async function authenticateRequest(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return null;
    }

    const userId = getUserIdFromRequest(req);
    if (!userId) {
        res.status(401).json({ message: 'Not authenticated' });
        return null;
    }

    return userId;
}
