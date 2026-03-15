import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables (You must run this with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateBlog() {
    const blogsFile = path.join(__dirname, 'data', 'blogs.json');
    if (!fs.existsSync(blogsFile)) {
        console.error('Error: blogs.json not found.');
        return;
    }

    const blogs = JSON.parse(fs.readFileSync(blogsFile, 'utf8'));
    console.log(`Updating ${blogs.length} blogs in Supabase...`);

    const rows = blogs.map(b => ({
        id: b.id,
        spot_id: b.spotId,
        title: b.title,
        content: b.content,
        author: b.author || 'Admin',
        created_at: b.createdAt
    }));

    const { error } = await supabase.from('blogs').upsert(rows);

    if (error) {
        console.error('Error updating database:', error);
    } else {
        console.log('Successfully updated Supabase blogs.');
    }
}

updateBlog();
