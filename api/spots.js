const fs = require('fs');
const path = require('path');

export default function handler(req, res) {
    const SPOTS_FILE = path.join(process.cwd(), 'data', 'spots.json');

    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }

    if (req.method === 'GET') {
        try {
            const data = fs.readFileSync(SPOTS_FILE, 'utf8');
            res.status(200).json(JSON.parse(data));
        } catch (err) {
            console.error('Read error:', err);
            res.status(500).json({ error: 'Failed to read spots file' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
