const { supabase } = require('./lib/supabase');

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Password');

    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }

    if (!supabase) {
        res.status(500).json({ error: 'Supabase credentials not configured' });
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
            const { data, error } = await supabase
                .from('guides')
                .select('*')
                .order('id', { ascending: true });
            
            if (error) throw error;

            res.status(200).json(data);
        } catch (err) {
            console.error('Database read error:', err);
            res.status(500).json({ error: 'Failed to fetch guides' });
        }
    } else if (req.method === 'POST') {
        const updatedData = req.body;
        if (!updatedData || (Array.isArray(updatedData) && updatedData.length === 0 && req.headers['content-length'] === '0')) {
             res.status(400).json({ error: 'Empty body' });
             return;
        }

        try {
            const { error } = await supabase.from('guides').upsert(updatedData.map(g => ({
                id: g.id,
                tags: g.tags,
                ko: g.ko,
                en: g.en,
                ja: g.ja
            })));
            if (error) throw error;

            res.status(200).json({ message: 'Success (Saved to Database)' });
        } catch (e) {
            console.error('Database write error:', e);
            res.status(400).json({ error: 'Failed to save data' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
