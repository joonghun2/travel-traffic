const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

export default function handler(req, res) {
    const DATA_FILE = path.join(process.cwd(), 'guides_data.json');
    const BUILD_SCRIPT = 'node generate_guides.js';

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
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            res.status(200).json(JSON.parse(data));
        } catch (err) {
            console.error('Read error:', err);
            res.status(500).json({ error: 'Failed to read data file' });
        }
    } else if (req.method === 'POST') {
        const updatedData = req.body;
        if (!updatedData || (Array.isArray(updatedData) && updatedData.length === 0 && req.headers['content-length'] === '0')) {
             console.error('Empty body received');
             res.status(400).json({ error: 'Empty body' });
             return;
        }

        try {
            fs.writeFileSync(DATA_FILE, JSON.stringify(updatedData, null, 4), 'utf8');

            // Trigger guide regeneration
            // NOTE: This might also fail or have no effect on the served static files in production.
            exec(BUILD_SCRIPT, (execErr, stdout, stderr) => {
                if (execErr) {
                    console.error(`Build error: ${execErr}`);
                    res.status(500).json({ error: 'Failed to regenerate guides', details: stderr });
                    return;
                }
                res.status(200).json({ message: 'Success (Note: Filesystem changes are ephemeral in Vercel)', output: stdout });
            });
        } catch (e) {
            console.error('Write error:', e);
            res.status(400).json({ error: 'Failed to write data' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
