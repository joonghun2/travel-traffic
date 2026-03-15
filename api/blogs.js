const fs = require('fs');
const path = require('path');

export default function handler(req, res) {
    const BLOGS_FILE = path.join(process.cwd(), 'data', 'blogs.json');

    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Password');

    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }

    const ADMIN_PASSWORD = '4898';
    const authPassword = req.headers['x-admin-password'];

    if (req.method === 'POST' && authPassword !== ADMIN_PASSWORD) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    if (req.method === 'GET') {
        try {
            if (!fs.existsSync(BLOGS_FILE)) {
                res.status(200).json([]);
                return;
            }
            const data = fs.readFileSync(BLOGS_FILE, 'utf8');
            res.status(200).json(JSON.parse(data));
        } catch (err) {
            console.error('Read error:', err);
            res.status(500).json({ error: 'Failed to read blogs file' });
        }
    } else if (req.method === 'POST') {
        // NOTE: In Vercel production, this filesystem write will NOT persist.
        try {
            const updatedBlogs = req.body;
            fs.writeFileSync(BLOGS_FILE, JSON.stringify(updatedBlogs, null, 4), 'utf8');
            res.status(200).json({ message: 'Success (Note: Filesystem changes are ephemeral in Vercel)' });
        } catch (e) {
            console.error('Write error:', e);
            res.status(400).json({ error: 'Failed to write blogs' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
