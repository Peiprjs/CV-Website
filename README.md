# Interactive CV & Portfolio Web Application

A modern, responsive, single-page interactive CV and portfolio web application built with **HTML5**, **Tailwind CSS (CDN)**, and **Vanilla JavaScript**. Designed for engineers, researchers, and technical leaders who need a fast, zero-dependency portfolio with JSON data customization and granular link-based filtering.

---

## 🎨 JSON-Based Customization

All website content, profile metadata, categories, and the accent color palette can be edited in [`data.json`](file:///home/peipr/gits/new_website/data.json).

### 1. Changing the Colour Palette
Open [`data.json`](file:///home/peipr/gits/new_website/data.json) and set the `theme.palette` property:

```json
{
  "theme": {
    "palette": "emerald"
  }
}
```

#### Available Built-In Palettes:
- `"indigo"` (Modern tech / AI aesthetic - Default)
- `"emerald"` (Clean green / sustainable tech)
- `"blue"` (Ocean / classic academic & corporate)
- `"violet"` (Creative / modern purple)
- `"rose"` (Bold crimson / ruby)
- `"amber"` (Warm gold / energetic)
- `"cyan"` (High-tech / cyber cyan)

#### Custom Hex Palette:
You can also set `palette` to any custom Hex code (e.g. `"#0284c7"`), or define precise custom shades:
```json
{
  "theme": {
    "palette": "#0ea5e9"
  }
}
```
The application dynamically computes the entire 50–950 tint and shade scale and applies it across all buttons, badges, gradients, and focus rings.

You can also test palettes on the fly or via URL parameter (e.g. `?palette=emerald`).

---

### 2. Customizing CV Items
Entries in [`data.json`](file:///home/peipr/gits/new_website/data.json) under `items` adhere to the clean schema:

```json
{
  "id": "work-staff-ai-systems",
  "category": "work",
  "title": "Staff AI Systems Engineer & Tech Lead",
  "organization": "Cerebral Systems Labs",
  "date": "2023 – Present",
  "location": "Zurich, CH / Hybrid",
  "description": "Leading the distributed systems team...",
  "tags": ["Python", "Rust", "Distributed Systems", "vLLM"],
  "featured": true,
  "link": "https://example.com"
}
```

#### Categories Supported:
1. `work` (Professional experience)
2. `projects` (Key projects & technical builds)
3. `learning` (Education & academic courses)
4. `certifications` (Credentials & licenses)
5. `volunteering` (Volunteer work & community involvement)
6. `hobbies` (Personal interests & pursuits)

---

### 3. In-Browser Palette & JSON Modal
In the top header, click **"Palette & JSON"** (or **"Theme"** on mobile) to:
- Instantly switch between color palettes and see changes live.
- Upload any `.json` file from your computer to preview new data immediately.
- Inspect and tweak the JSON in the live in-browser editor and click **"Apply JSON Changes"**.
- Download the current configuration as a new `data.json` file.

---

## 🔗 Granular Link-Based Filtering

- **URL Parameter Engine:**
  - Filter by Categories: `?categories=work,projects`
  - Filter by Item IDs: `?ids=work-staff-ai-systems,project-omniagent-runtime`
  - Tailored Recipient Banner: `?recipient=DeepMind&context=Staff+Research+Engineer`
  - Tag & Featured Filters: `?tag=Rust`, `?featured=true`
  - Palette Override: `?palette=emerald`
- **Tailored View Banner:** Automatically activates when URL parameters are present, displaying a personalized header with quick buttons to modify filters or reset to the full CV.

---

## 🌓 Dark / Light / System Theme

- Supports **Light**, **Dark**, and **System** preference.
- Stored in `localStorage`.
- Includes an early `<script>` in `<head>` to prevent Flash of Unstyled Content (FOUC).
- Synchronizes with native `<meta name="color-scheme">` for browser controls and scrollbars.

---

## 🖨️ Print & PDF Export

- Dedicated `@media print` stylesheet.
- Strips interactive controls (modals, search bars, theme toggles, buttons).
- Formats cards with `page-break-inside: avoid` for clean, professional 1-2 page PDF export.
- Preserves whatever customized selection is currently active on the page.

---

## 🚀 Local Preview & GitHub Pages Deployment

### Local Preview:
```bash
python3 -m http.server 8000
```
Open `http://localhost:8000/` in your browser.

### Deploy to GitHub Pages:
1. Push this repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: customize content and palette via JSON"
   git push origin main
   ```
2. In your GitHub repository:
   - Go to **Settings** > **Pages**.
   - Under **Source**, select **Deploy from a branch** (`main` / `/ (root)`).
   - Click **Save**.
