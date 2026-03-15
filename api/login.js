const ADMIN_PASSWORD = '4898';

export default function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }

    if (req.method === 'POST') {
        try {
            const { password } = req.body;
            if (password === ADMIN_PASSWORD) {
                res.status(200).json({ success: true });
            } else {
                res.status(401).json({ error: 'Invalid password' });
            }
        } catch (e) {
            res.status(400).json({ error: 'Invalid request' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
