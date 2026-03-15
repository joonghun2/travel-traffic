import http from 'http';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = 3000;
const ADMIN_PASSWORD = '4898';
const DATA_FILE = path.join(__dirname, 'guides_data.json');
const BLOGS_FILE = path.join(__dirname, 'data', 'blogs.json');
const SPOTS_FILE = path.join(__dirname, 'data', 'spots.json');
const UPLOAD_DIR = path.join(__dirname, 'img', 'blogs');
const BUILD_SCRIPT = 'node generate_guides.js';

// Ensure required directories exist
if (!fs.existsSync(path.join(__dirname, 'data'))) fs.mkdirSync(path.join(__dirname, 'data'));
if (!fs.existsSync(path.join(__dirname, 'img', 'blogs'))) fs.mkdirSync(path.join(__dirname, 'img', 'blogs'), { recursive: true });

const server = http.createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-File-Name, X-Admin-Password');

    console.log(`[API] ${req.method} ${req.url}`);
    if (req.headers['x-admin-password']) {
        console.log(`[AUTH] Password Header Present`);
    } else {
        console.log(`[AUTH] No Password Header`);
    }

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // Auth Middleware for API
    const authPassword = req.headers['x-admin-password'];
    const isApiRequest = req.url.startsWith('/api/');

    if (isApiRequest && req.url !== '/api/login' && authPassword !== ADMIN_PASSWORD) {
        console.warn(`Unauthorized API request: ${req.url}`);
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Unauthorized' }));
        return;
    }

    if (req.url === '/' || req.url === '/admin') {
        fs.readFile(path.join(__dirname, 'admin.html'), (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading admin.html');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(data);
        });
    } else if (req.url === '/api/login' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const { password } = JSON.parse(body);
                if (password === ADMIN_PASSWORD) {
                    console.log('Login successful');
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true }));
                } else {
                    console.warn('Invalid login attempt');
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid password' }));
                }
            } catch (e) {
                res.writeHead(400);
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
    } else if (req.url === '/api/guides' && req.method === 'GET') {
        fs.readFile(DATA_FILE, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: 'Failed to read data file' }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
        });
    } else if (req.url === '/api/spots' && req.method === 'GET') {
        fs.readFile(SPOTS_FILE, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: 'Failed to read spots file' }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
        });
    } else if (req.url === '/api/guides' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const updatedData = JSON.parse(body);
                console.log(`[GUIDES] Received ${updatedData.length || 0} guides`);
                fs.writeFile(DATA_FILE, JSON.stringify(updatedData, null, 4), 'utf8', (err) => {
                    if (err) {
                        res.writeHead(500);
                        res.end(JSON.stringify({ error: 'Failed to write data file' }));
                        return;
                    }

                    // Trigger guide regeneration
                    exec(BUILD_SCRIPT, (execErr, stdout, stderr) => {
                        if (execErr) {
                            console.error(`Build error: ${execErr}`);
                            res.writeHead(500);
                            res.end(JSON.stringify({ error: 'Failed to regenerate guides', details: stderr }));
                            return;
                        }
                        console.log(`Build output: ${stdout}`);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Success', output: stdout }));
                    });
                });
            } catch (e) {
                res.writeHead(400);
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
    } else if (req.url === '/api/blogs' && req.method === 'GET') {
        fs.readFile(BLOGS_FILE, 'utf8', (err, data) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end('[]');
                } else {
                    res.writeHead(500);
                    res.end(JSON.stringify({ error: 'Failed to read blogs file' }));
                }
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
        });
    } else if (req.url === '/api/blogs' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const updatedBlogs = JSON.parse(body);
                console.log(`[BLOGS] Received ${updatedBlogs.length} blogs`);
                fs.writeFile(BLOGS_FILE, JSON.stringify(updatedBlogs, null, 4), 'utf8', (err) => {
                    if (err) {
                        res.writeHead(500);
                        res.end(JSON.stringify({ error: 'Failed to write blogs file' }));
                        return;
                    }
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Success' }));
                });
            } catch (e) {
                res.writeHead(400);
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
    } else if (req.url === '/api/upload' && req.method === 'POST') {
        const fileName = req.headers['x-file-name'] || `upload_${Date.now()}.png`;
        const cleanFileName = path.basename(fileName);
        const targetPath = path.join(UPLOAD_DIR, cleanFileName);
        
        let chunks = [];
        req.on('data', chunk => { chunks.push(chunk); });
        req.on('end', () => {
            const buffer = Buffer.concat(chunks);
            fs.writeFile(targetPath, buffer, (err) => {
                if (err) {
                    res.writeHead(500);
                    res.end(JSON.stringify({ error: 'Failed to save file' }));
                    return;
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Success', url: `img/blogs/${cleanFileName}` }));
            });
        });
    } else {
        // Serve static files
        let urlPath = req.url.split('?')[0];
        let filePath = '.' + urlPath;
        if (filePath === './' || filePath === './admin') filePath = './admin.html';
        if (filePath === './admin_blog') filePath = './admin_blog.html';

        const extname = String(path.extname(filePath)).toLowerCase();
        const mimeTypes = {
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.wav': 'audio/wav',
            '.mp4': 'video/mp4',
            '.woff': 'application/font-woff',
            '.ttf': 'application/font-ttf',
            '.eot': 'application/vnd.ms-fontobject',
            '.otf': 'application/font-otf',
            '.wasm': 'application/wasm'
        };

        const contentType = mimeTypes[extname] || 'application/octet-stream';

        fs.readFile(path.join(__dirname, filePath), (error, content) => {
            if (error) {
                if (error.code == 'ENOENT') {
                    res.writeHead(404);
                    res.end('File not found');
                } else {
                    res.writeHead(500);
                    res.end('Internal server error: ' + error.code);
                }
            } else {
                res.writeHead(200, { 'Content-Type': contentType + '; charset=utf-8' });
                res.end(content, 'utf-8');
            }
        });
    }
});

server.listen(PORT, () => {
    console.log(`Admin server running at http://localhost:${PORT}`);
});
