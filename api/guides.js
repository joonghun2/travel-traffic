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
            console.log('Fetching guides from Supabase...');
            const { data, error } = await supabase
                .from('guides')
                .select('*')
                .order('id', { ascending: true });
            
            if (error) {
                console.error('Supabase GET error:', error);
                throw error;
            }

            res.status(200).json(data);
        } catch (err) {
            console.error('Database read error:', err);
            res.status(500).json({ error: 'Failed to fetch guides', details: err.message });
        }
    } else if (req.method === 'POST') {
        const updatedData = req.body;
        console.log('Received POST request for guides. Count:', Array.isArray(updatedData) ? updatedData.length : 'Not an array');

        if (!updatedData || (Array.isArray(updatedData) && updatedData.length === 0)) {
             res.status(400).json({ error: 'Empty or invalid data body' });
             return;
        }

        try {
            const rows = updatedData.map(g => ({
                id: parseInt(g.id),
                tags: g.tags || [],
                ko: g.ko || {},
                en: g.en || {},
                ja: g.ja || {}
            }));

            console.log('Attempting upsert to Supabase...');
            const { data, error } = await supabase.from('guides').upsert(rows);
            
            if (error) {
                console.error('Supabase upsert error:', error);
                throw error;
            }

            console.log('Successfully saved guides to database');
            res.status(200).json({ message: 'Success (Saved to Database)', count: rows.length });
        } catch (e) {
            console.error('Database write error detailed:', e);
            res.status(400).json({ error: 'Failed to save data to database', details: e.message });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
