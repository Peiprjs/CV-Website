#!/usr/bin/env python3
"""
gui_server.py

Python 3 lightweight local GUI server for editing data.json and updating HTML files.
Zero external dependencies.
"""

import sys
import os
import json
import subprocess
import webbrowser
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DATA_JSON_PATH = os.path.join(ROOT_DIR, 'data.json')
UPDATE_SCRIPT_PATH = os.path.join(os.path.dirname(__file__), 'update_data.py')

PORT = 3000

class GuiHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT_DIR, **kwargs)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == '/api/data':
            try:
                with open(DATA_JSON_PATH, 'r', encoding='utf-8') as f:
                    content = f.read()
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(content.encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))
            return

        if parsed.path in ['/', '/gui']:
            self.path = '/gui.html'
        super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        content_length = int(self.headers.get('Content-Length', 0))
        post_body = self.rfile.read(content_length).decode('utf-8')

        if parsed.path in ['/api/save', '/api/data']:
            try:
                data = json.loads(post_body)
                with open(DATA_JSON_PATH, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2)
                    f.write('\n')
                self._send_json(200, {'success': True, 'message': 'Saved data.json successfully'})
            except Exception as e:
                self._send_json(400, {'error': f'Invalid JSON: {e}'})
            return

        if parsed.path == '/api/update':
            try:
                proc = subprocess.run([sys.executable, UPDATE_SCRIPT_PATH], capture_output=True, text=True, cwd=ROOT_DIR)
                if proc.returncode == 0:
                    self._send_json(200, {'success': True, 'output': proc.stdout})
                else:
                    self._send_json(500, {'success': False, 'error': proc.stderr or proc.stdout})
            except Exception as e:
                self._send_json(500, {'success': False, 'error': str(e)})
            return

        if parsed.path == '/api/save-and-update':
            try:
                data = json.loads(post_body)
                with open(DATA_JSON_PATH, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2)
                    f.write('\n')
                proc = subprocess.run([sys.executable, UPDATE_SCRIPT_PATH], capture_output=True, text=True, cwd=ROOT_DIR)
                if proc.returncode == 0:
                    self._send_json(200, {'success': True, 'saved': True, 'output': proc.stdout})
                else:
                    self._send_json(500, {'success': False, 'saved': True, 'error': proc.stderr or proc.stdout})
            except Exception as e:
                self._send_json(400, {'error': f'Invalid JSON: {e}'})
            return

        self._send_json(404, {'error': 'API route not found'})

    def _send_json(self, status, payload):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode('utf-8'))

def run_server(port=PORT):
    for p in range(port, port + 10):
        try:
            server = HTTPServer(('127.0.0.1', p), GuiHandler)
            url = f"http://localhost:{p}/gui.html"
            print("======================================================")
            print("🚀 CV Data Studio Local GUI is running (Python)!")
            print(f"👉 Access URL: \033[36m\033[1m{url}\033[0m")
            print("   Press Ctrl+C to stop the server.")
            print("======================================================\n")
            if '--no-open' not in sys.argv:
                webbrowser.open(url)
            server.serve_forever()
            return
        except OSError as e:
            if e.errno == 98 or 'Address already in use' in str(e):
                continue
            raise e

if __name__ == '__main__':
    run_server()
