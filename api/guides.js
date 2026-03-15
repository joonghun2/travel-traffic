const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

export default function handler(req, res) {
    const DATA_FILE = path.join(process.cwd(), 'guides_data.json');
    const BUILD_SCRIPT = 'node generate_guides.js';

    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(204).end();
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
        // NOTE: In Vercel production, this filesystem write will NOT persist.
        // It will only work during local development (vercel dev).
        try {
            const updatedData = req.body;
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
