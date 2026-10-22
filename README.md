# Portfolio & Interactive CV

## Prerequisites

- Node.js (v18+) or Python 3

## Running the Website Locally

Start a local HTTP server from the repository root:

```bash
# Using Python
python3 -m http.server 8000

# Or using npm
npm run serve
```

Open in your browser:
- Unified Responsive View: http://localhost:8000/
- Desktop 2-Column View: http://localhost:8000/desktop.html
- Smartphone View: http://localhost:8000/mobile.html

## Running the GUI Editor

To launch the local graphical editor to edit profile data, skills, languages, and items:

```bash
# Using npm
npm run gui

# Or using Python
python3 scripts/gui_server.py

# Or using the shell script
./update-data.sh --gui
```

Open http://localhost:3000 in your browser.

## Updating and Synchronizing Data

When editing data.json directly, compile the preloaded script and synchronize HTML metadata:

```bash
# Run once
./update-data.sh
# or: npm run update-data
# or: python3 scripts/update_data.py

# Watch mode (auto-sync on save)
npm run watch
# or: python3 scripts/update_data.py --watch

# Validate schema only
npm run validate
# or: python3 scripts/update_data.py --validate
```
