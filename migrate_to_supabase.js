import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables (ensure these are set in your terminal or .env)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
    console.log('Starting migration...');

    // 1. Migrate Spots
    const spotsFile = path.join(__dirname, 'data', 'spots.json');
    if (fs.existsSync(spotsFile)) {
        const spots = JSON.parse(fs.readFileSync(spotsFile, 'utf8'));
        console.log(`Migrating ${spots.length} spots...`);
        const { error: spotsError } = await supabase.from('spots').upsert(spots);
        if (spotsError) console.error('Error migrating spots:', spotsError);
        else console.log('Spots migrated successfully.');
    }

    // 2. Migrate Blogs
    const blogsFile = path.join(__dirname, 'data', 'blogs.json');
    if (fs.existsSync(blogsFile)) {
        const blogs = JSON.parse(fs.readFileSync(blogsFile, 'utf8'));
        console.log(`Migrating ${blogs.length} blogs...`);
        // Map created_at if needed, or use default
        const { error: blogsError } = await supabase.from('blogs').upsert(blogs.map(b => ({
            id: b.id,
            spot_id: b.spotId,
            lang: b.lang,
            title: b.title,
            content: b.content,
            author: b.author || 'Admin',
            created_at: b.createdAt
        })));
        if (blogsError) console.error('Error migrating blogs:', blogsError);
        else console.log('Blogs migrated successfully.');
    }

    // 3. Migrate Guides
    const guidesFile = path.join(__dirname, 'guides_data.json');
    if (fs.existsSync(guidesFile)) {
        const guides = JSON.parse(fs.readFileSync(guidesFile, 'utf8'));
        console.log(`Migrating ${guides.length} guides...`);
        const { error: guidesError } = await supabase.from('guides').upsert(guides.map(g => ({
            id: g.id,
            tags: g.tags,
            ko: g.ko,
            en: g.en,
            ja: g.ja
        })));
        if (guidesError) console.error('Error migrating guides:', guidesError);
        else console.log('Guides migrated successfully.');
    }

    console.log('Migration finished.');
}

migrate();

