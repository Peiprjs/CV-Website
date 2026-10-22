#!/usr/bin/env node

/**
 * gui-server.js
 * 
 * Lightweight local GUI server for editing data.json and updating HTML files.
 * Zero external dependencies — runs on standard Node.js libraries.
 * 
 * Features:
 *  - Serves local GUI editor at http://localhost:3000
 *  - REST API to read and save data.json directly to disk
 *  - REST API to execute data synchronization (update-data.js)
 *  - Auto-launches default web browser
 * 
 * Usage:
 *   node scripts/gui-server.js
 *   npm run gui
 *   ./update-data.sh --gui
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_JSON_PATH = path.join(ROOT_DIR, 'data.json');
const UPDATE_SCRIPT_PATH = path.join(__dirname, 'update-data.js');

let PORT = 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

function handleApi(req, res, url) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  // GET /api/data
  if (req.method === 'GET' && url.pathname === '/api/data') {
    try {
      const content = fs.readFileSync(DATA_JSON_PATH, 'utf8');
      return sendJson(res, 200, JSON.parse(content));
    } catch (e) {
      return sendJson(res, 500, { error: 'Failed to read data.json: ' + e.message });
    }
  }

  // POST /api/save
  if (req.method === 'POST' && (url.pathname === '/api/save' || url.pathname === '/api/data')) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        fs.writeFileSync(DATA_JSON_PATH, JSON.stringify(parsed, null, 2) + '\n', 'utf8');
        return sendJson(res, 200, { success: true, message: 'Saved data.json successfully' });
      } catch (e) {
        return sendJson(res, 400, { error: 'Invalid JSON: ' + e.message });
      }
    });
    return;
  }

  // POST /api/update
  if (req.method === 'POST' && url.pathname === '/api/update') {
    exec(`node "${UPDATE_SCRIPT_PATH}"`, { cwd: ROOT_DIR }, (err, stdout, stderr) => {
      if (err) {
        return sendJson(res, 500, {
          success: false,
          error: err.message,
          output: stderr || stdout
        });
      }
      return sendJson(res, 200, {
        success: true,
        output: stdout
      });
    });
    return;
  }

  // POST /api/save-and-update
  if (req.method === 'POST' && url.pathname === '/api/save-and-update') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        fs.writeFileSync(DATA_JSON_PATH, JSON.stringify(parsed, null, 2) + '\n', 'utf8');
        
        exec(`node "${UPDATE_SCRIPT_PATH}"`, { cwd: ROOT_DIR }, (err, stdout, stderr) => {
          if (err) {
            return sendJson(res, 500, {
              success: false,
              saved: true,
              error: err.message,
              output: stderr || stdout
            });
          }
          return sendJson(res, 200, {
            success: true,
            saved: true,
            output: stdout
          });
        });
      } catch (e) {
        return sendJson(res, 400, { error: 'Invalid JSON: ' + e.message });
      }
    });
    return;
  }

  return sendJson(res, 404, { error: 'API route not found' });
}

function handleStatic(req, res, url) {
  let reqPath = url.pathname;
  if (reqPath === '/' || reqPath === '/gui') {
    reqPath = '/gui.html';
  }

  // Prevent directory traversal
  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(ROOT_DIR, safePath);

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    return res.end('404 Not Found');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  res.writeHead(200, {
    'Content-Type': contentType,
    'Cache-Control': 'no-cache'
  });
  fs.createReadStream(filePath).pipe(res);
}

function openBrowser(targetUrl) {
  const start = process.platform === 'darwin' ? 'open' :
                process.platform === 'win32' ? 'start' : 'xdg-open';
  exec(`${start} ${targetUrl}`, () => {});
}

function startServer(port) {
  const server = http.createServer((req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    if (parsedUrl.pathname.startsWith('/api/')) {
      handleApi(req, res, parsedUrl);
    } else {
      handleStatic(req, res, parsedUrl);
    }
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is in use, trying ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });

  server.listen(port, () => {
    const url = `http://localhost:${port}/gui.html`;
    console.log(`\n======================================================`);
    console.log(`🚀 CV Data Studio Local GUI is running!`);
    console.log(`👉 Access URL: \x1b[36m\x1b[1m${url}\x1b[0m`);
    console.log(`   Press Ctrl+C to stop the server.`);
    console.log(`======================================================\n`);

    if (!process.argv.includes('--no-open')) {
      openBrowser(url);
    }
  });
}

startServer(PORT);
