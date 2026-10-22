# Interactive CV & Portfolio Web Application

A modern, high-performance, single-page interactive CV and portfolio web application built with **HTML5**, **Tailwind CSS (CDN)**, and **Vanilla JavaScript**. Designed for researchers, engineers, and technical leaders who need a fast, zero-dependency portfolio with JSON data customization, 5-dot hard/soft skills showcase, granular URL-based filtering, and dedicated device-optimized layouts.

**Live Data Profile:** [Mar Roca Cugat](https://github.com/peiprjs) — *Biomedical Sciences Researcher & AI Systems Developer*

---

## 📱 Three Purpose-Built Layout Editions

The application provides dedicated layouts tailored for any screen form factor, cross-linked with an intuitive switcher:

| Edition | File | Best For | Architecture & Highlights |
| :--- | :--- | :--- | :--- |
| **🖥️ Desktop Edition** | [`desktop.html`](file:///home/peipr/gits/new_website/desktop.html) | Desktops, laptops & wide displays | **Full-width 2-column layout:**<br>• **Left Column:** Sticky sidebar with profile hero, contacts, metrics, search, hard & soft skills matrix, and vertical category navigation.<br>• **Right Column:** Spacious multi-column card grid making full use of horizontal screen real estate. |
| **📱 Smartphone Edition** | [`mobile.html`](file:///home/peipr/gits/new_website/mobile.html) | Mobile phones & small viewports | **Touch-first mobile ergonomics:**<br>• Compact sticky top bar and expandable bio (`Read more...`).<br>• Horizontal category pill scroll bar.<br>• Collapsible 5-dot skills section.<br>• Floating bottom action bar within thumb reach for instant link sharing. |
| **⚡ Responsive Unified** | [`index.html`](file:///home/peipr/gits/new_website/index.html) | Universal browsing | Automatically adapts between mobile, tablet, and desktop viewports with a view switcher in the header. |

> All three editions read directly from the same [`data.json`](file:///home/peipr/gits/new_website/data.json) (and preloaded [`data.js`](file:///home/peipr/gits/new_website/data.js)) dataset. Modifying the data or palette updates all editions simultaneously.

---

## 🎨 JSON-Based Customization

All website content, profile metadata, categories, skills, and the accent color palette are configured in [`data.json`](file:///home/peipr/gits/new_website/data.json).

### 1. Changing the Colour Palette
Open [`data.json`](file:///home/peipr/gits/new_website/data.json) and set the `theme.palette` property:

```json
{
  "theme": {
    "palette": "indigo"
  }
}
```

#### Available Built-In Palettes:
- `"indigo"` (Modern tech / AI aesthetic - Default)
- `"emerald"` (Clean green / sustainable tech & life sciences)
- `"blue"` (Ocean / classic academic & clinical)
- `"violet"` (Creative / modern purple)
- `"rose"` (Bold crimson / ruby)
- `"amber"` (Warm gold / energetic)
- `"cyan"` (High-tech / cyber cyan)
- Or any custom Hex color e.g. `"#0ea5e9"`.

---

### 2. Customizing Skills Matrix (Hard & Soft Skills)
Skills are rated on an accessible 5-dot visual scale (`● ● ● ● ○`), with an architectural distinction between technical **Hard Skills** and leadership/communication **Soft Skills**:

```json
{
  "skills": {
    "hard": [
      { "name": "Python & Bio-Image Informatics", "level": 5, "tag": "Bioinformatics" },
      { "name": "Genomics Data Pipelines (TCGA, NGS)", "level": 4, "tag": "Genomics" },
      { "name": "Multi-Agent AI Pipelines (CrewAI & Local LLMs)", "level": 4, "tag": "AI Systems" },
      { "name": "Laboratory Wet-Lab Techniques & Protocols", "level": 4, "tag": "Wet Lab" }
    ],
    "soft": [
      { "name": "Academic Governance & Faculty Representation", "level": 5, "tag": "Governance" },
      { "name": "Educational Leadership & Teaching Assistance", "level": 5, "tag": "Education" },
      { "name": "Hackathon Management & Event Orchestration", "level": 5, "tag": "Management" },
      { "name": "Scientific Protocol Writing & Documentation", "level": 4, "tag": "Communication" }
    ]
  }
}
```
- `name`: Competency title.
- `level`: Integer from `1` to `5` controlling the filled 5-dot visual indicators. The active color palette dynamically themes the filled dots.
- `tag`: Optional domain or specialty chip (e.g., `#Bioinformatics`, `#Governance`).

---

### 3. Customizing CV Items
Entries in [`data.json`](file:///home/peipr/gits/new_website/data.json) under `items` adhere to the schema:

```json
{
  "id": "work-um-lab-ta",
  "category": "work",
  "title": "Laboratory and Teaching Assistant",
  "organization": "Maastricht University (Onderwijsinstituut FHML)",
  "date": "Sep 2024 – Present",
  "location": "Maastricht, NL",
  "description": "Assisting in practical laboratory sessions, guiding undergraduate students in biomedical techniques, and digitizing standardized experimental protocols.",
  "tags": ["Biomedical Sciences", "Laboratory Instruction", "Wet Lab", "Protocols.io"],
  "featured": true,
  "link": "https://www.maastrichtuniversity.nl"
}
```

#### Supported Categories:
1. `work` (Professional experience & academic roles)
2. `projects` (Key projects, software builds & published works)
3. `learning` (Degrees, academic coursework & universities)
4. `certifications` (Credentials, awards & distinctions)
5. `volunteering` (Community, student governance & hackathon leadership)
6. `hobbies` (Personal interests, sports & creative pursuits)

---

## ⚡ Zero-Latency Paint & Offline Dual Data Architecture

To ensure instant first paint without network roundtrip delay and to support opening files directly via the browser `file://` protocol (where browsers block `fetch` due to CORS), the project employs a dual-source strategy:

1. **Preloaded Script (`data.js`):** Exposes `window.CV_DEFAULT_DATA` directly in `<head>`. This renders the entire CV immediately at 0ms with zero layout shifts (CLS).
2. **Dynamic Live Fetch (`./data.json`):** When served over HTTP/HTTPS, `loadExternalConfig()` fetches `./data.json` with `{ cache: 'no-cache' }`, so any edits to `data.json` or hot-reloading in production reflect instantly without rebuilding.

---

## 🔄 Automatic Data Update Script

Whenever you make changes to [`data.json`](file:///home/peipr/gits/new_website/data.json), run the update script to synchronize the embedded dataset, validate schema integrity, and update static HTML metadata across all editions:

### Quick Run:
```bash
./update-data.sh
```
*(Automatically detects and uses Node.js or Python 3)*

### Or via NPM / Node:
```bash
# Update once and synchronize data.js + HTML metadata
npm run update-data
# or: node scripts/update-data.js

# Watch mode: automatically re-sync whenever you save data.json
npm run watch
# or: node scripts/update-data.js --watch

# Validate schema without writing files
npm run validate
```

### Or via Python:
```bash
python3 scripts/update_data.py            # Run once
python3 scripts/update_data.py --watch    # Watch mode
python3 scripts/update_data.py --validate # Validate only
```

### What the Script Does Automatically:
1. **Schema & Integrity Validation:** Verifies JSON syntax, checks for duplicate item IDs, validates categories, and ensures skill levels are between 1 and 5.
2. **Generates Preload Dataset ([`data.js`](file:///home/peipr/gits/new_website/data.js)):** Compiles `window.CV_DEFAULT_DATA` for zero-latency 0ms first-paint and offline/`file://` browsing.
3. **Synchronizes HTML Metadata:** Keeps `<title>`, `<meta name="description">`, `<meta name="author">`, and `<meta property="og:*">` tags aligned across `index.html`, `desktop.html`, `mobile.html`, and `404.html`.
4. **CI/CD Integration:** Runs automatically during GitHub Pages builds in [`.github/workflows/deploy.yml`](file:///home/peipr/gits/new_website/.github/workflows/deploy.yml) so your live site is always updated even if you edit `data.json` on GitHub.

---

## 🌐 GitHub Pages Compatibility & Deployment

The website is 100% compatible with GitHub Pages, whether hosted at the domain root (`https://username.github.io/`), a repository subpath (`https://username.github.io/repo-name/`), or a custom domain (`https://cv.peiphy.xyz`):

### Key Compatibility Features:
- **`.nojekyll` Included:** A root `.nojekyll` file prevents GitHub Pages from running Jekyll transformations, ensuring raw asset delivery and unhindered file serving.
- **Subpath Safe Relative Paths:** All assets, links, and API fetches use `./` relative paths (`./data.json`, `desktop.html`, `mobile.html`, `index.html`) so routing never breaks when deployed to subdirectories.
- **Dedicated `404.html`:** A responsive error page guides visitors back to Unified, Desktop, or Smartphone editions.
- **Automated GitHub Actions CI/CD:** A ready-to-use workflow is included at [`.github/workflows/deploy.yml`](file:///home/peipr/gits/new_website/.github/workflows/deploy.yml).

### Deployment Options:

#### Option A: Automated GitHub Actions (Recommended)
1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: deploy portfolio to github pages"
   git push origin main
   ```
2. In your GitHub repository:
   - Navigate to **Settings** > **Pages**.
   - Under **Build and deployment** > **Source**, select **GitHub Actions**.
   - The included workflow will automatically build and publish your site upon every push to `main`.

#### Option B: Deploy from Branch
1. Navigate to **Settings** > **Pages**.
2. Under **Build and deployment** > **Source**, choose **Deploy from a branch**.
3. Select branch **`main`** and folder **`/ (root)`**, then click **Save**.

---

## 🔗 Granular URL Parameter Filtering

Share personalized views of your CV with recruiters, admissions boards, or collaborators:
- **Filter by Categories:** `?categories=work,projects`
- **Filter by Item IDs:** `?ids=work-um-lab-ta,proj-biomedical-ai`
- **Personalized Header Banner:** `?recipient=EMBL&context=Research+Assistant`
- **Tag Filtering:** `?tag=Bioinformatics`
- **Featured Items Only:** `?featured=true`
- **Dynamic Palette Override:** `?palette=emerald`

---

## 💻 Local Development & Testing

Run a lightweight HTTP server in the repository root:
```bash
python3 -m http.server 8000
```
Open in your browser:
- **Responsive Unified:** `http://localhost:8000/`
- **Desktop 2-Column Edition:** `http://localhost:8000/desktop.html`
- **Smartphone Edition:** `http://localhost:8000/mobile.html`
