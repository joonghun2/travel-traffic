const fs = require('fs');
const path = require('path');

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req, res) {
    const UPLOAD_DIR = path.join(process.cwd(), 'img', 'blogs');

    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-File-Name');

    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }

    if (req.method === 'POST') {
        const fileName = req.headers['x-file-name'] || `upload_${Date.now()}.png`;
        const cleanFileName = path.basename(fileName);
        const targetPath = path.join(UPLOAD_DIR, cleanFileName);
        
        // Ensure directory exists (might not work in production)
        if (!fs.existsSync(UPLOAD_DIR)) {
            try {
                fs.mkdirSync(UPLOAD_DIR, { recursive: true });
            } catch (e) {
                console.error('Folder creation failed:', e);
            }
        }

        let chunks = [];
        req.on('data', chunk => { chunks.push(chunk); });
        req.on('end', () => {
            const buffer = Buffer.concat(chunks);
            try {
                fs.writeFileSync(targetPath, buffer);
                res.status(200).json({ 
                    message: 'Success (Note: Local uploads won\'t persist on Vercel)', 
                    url: `img/blogs/${cleanFileName}` 
                });
            } catch (err) {
                console.error('Upload error:', err);
                res.status(500).json({ error: 'Failed to save file' });
            }
        });
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
