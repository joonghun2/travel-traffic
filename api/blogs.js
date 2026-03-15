import { supabase } from './lib/supabase.js';

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
                .from('blogs')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;

            // Map database fields to JSON fields if different
            const formattedData = data.map(b => ({
                id: b.id,
                spotId: b.spot_id,
                title: b.title,
                content: b.content,
                author: b.author,
                createdAt: b.created_at
            }));

            res.status(200).json(formattedData);
        } catch (err) {
            console.error('Database read error:', err);
            res.status(500).json({ error: 'Failed to fetch blogs from database' });
        }
    } else if (req.method === 'POST') {
        const updatedBlogs = req.body;
        if (!updatedBlogs || (Array.isArray(updatedBlogs) && updatedBlogs.length === 0 && req.headers['content-length'] === '0')) {
             res.status(400).json({ error: 'Empty body' });
             return;
        }

        try {
            // Upsert all blogs. Note: In a real app, you'd insert/update individual records.
            // For now, mirroring the JSON-overwrite logic.
            const rows = updatedBlogs.map(b => ({
                id: b.id,
                spot_id: b.spotId,
                title: b.title,
                content: b.content,
                author: b.author || 'Admin',
                created_at: b.createdAt
            }));

            const { error } = await supabase.from('blogs').upsert(rows);
            if (error) throw error;

            res.status(200).json({ message: 'Success (Saved to Database)' });
        } catch (e) {
            console.error('Database write error:', e);
            res.status(400).json({ error: 'Failed to save blogs to database', details: e.message });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
