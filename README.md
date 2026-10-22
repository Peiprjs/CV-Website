# Interactive CV & Portfolio Web Application

A modern, responsive, single-page interactive CV and portfolio web application built with **HTML5**, **Tailwind CSS (CDN)**, and **Vanilla JavaScript**. Designed for engineers, researchers, and technical leaders who need a fast, zero-dependency portfolio with JSON data customization, granular link-based filtering, and dedicated device-optimized layouts.

---

## 📱 Two Purpose-Built Editions

The application provides dedicated layouts tailored for both smartphones and wide desktop displays:

| Edition | File | Best For | Architecture & Highlights |
| :--- | :--- | :--- | :--- |
| **🖥️ Desktop Edition** | [`desktop.html`](file:///home/peipr/gits/new_website/desktop.html) | Desktops, laptops & ultrawide monitors | **Full-width 2-column layout:**<br>• **Left Column:** Sticky sidebar with profile hero, contacts, metrics, search, and vertical category navigation.<br>• **Right Column:** Spacious responsive card grid making full use of horizontal space. |
| **📱 Smartphone Edition** | [`mobile.html`](file:///home/peipr/gits/new_website/mobile.html) | Mobile phones & small viewports | **Touch-first mobile ergonomics:**<br>• Compact sticky top bar and expandable bio (`Read more...`).<br>• Sticky horizontal category scroll pill bar.<br>• Floating bottom action bar within thumb reach for instant link sharing. |
| **⚡ Responsive Unified** | [`index.html`](file:///home/peipr/gits/new_website/index.html) | Universal browsing | Automatically adapts between mobile and desktop with an interactive view switcher in the header. |

> All three editions read directly from the same [`data.json`](file:///home/peipr/gits/new_website/data.json) file. Changing your data or palette updates all editions simultaneously.

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
- Or any custom Hex color e.g. `"#0ea5e9"`.

---

### 2. Customizing CV Items
Entries in [`data.json`](file:///home/peipr/gits/new_website/data.json) under `items` adhere to the schema:

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

### 3. Customizing Skills Matrix (Hard & Soft Skills)
Skills are rated on an accessible 5-dot visual scale (`● ● ● ● ○`), with a clear architectural distinction between technical **Hard Skills** and leadership/interpersonal **Soft Skills**:

```json
{
  "skills": {
    "hard": [
      { "name": "Distributed Systems & Consensus", "level": 5, "tag": "Architecture" },
      { "name": "Python, PyTorch & vLLM", "level": 5, "tag": "AI / ML" },
      { "name": "Rust & Low-Level Systems", "level": 4, "tag": "Systems" }
    ],
    "soft": [
      { "name": "Technical Leadership & Architecture Strategy", "level": 5, "tag": "Leadership" },
      { "name": "Engineering Mentorship & Talent Growth", "level": 5, "tag": "People" },
      { "name": "Cross-Functional Product Collaboration", "level": 4, "tag": "Communication" }
    ]
  }
}
```
- `name`: Competency title.
- `level`: Integer from `1` to `5` controlling the filled 5-dot visual indicators. The active color palette (`theme.palette` or live switcher) dynamically themes the filled dots.
- `tag`: Optional domain or specialty chip (e.g., `#Architecture`, `#Leadership`).

---

## 🔗 Granular Link-Based Filtering

- **URL Parameter Engine:**
  - Filter by Categories: `?categories=work,projects`
  - Filter by Item IDs: `?ids=work-staff-ai-systems,project-omniagent-runtime`
  - Tailored Recipient Banner: `?recipient=DeepMind&context=Staff+Research+Engineer`
  - Tag & Featured Filters: `?tag=Rust`, `?featured=true`
  - Palette Override: `?palette=emerald`

---

## 🚀 Local Preview & GitHub Pages Deployment

### Local Preview:
Run a local server from the project directory:
```bash
python3 -m http.server 8000
```
Open any of the versions in your browser:
- **Responsive / Unified:** `http://localhost:8000/`
- **Desktop (2-Column Full-Width):** `http://localhost:8000/desktop.html`
- **Smartphone Edition:** `http://localhost:8000/mobile.html`

### Deploy to GitHub Pages:
1. Push this repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: add smartphone edition and full-width two-column desktop edition"
   git push origin main
   ```
2. In your GitHub repository:
   - Go to **Settings** > **Pages**.
   - Under **Source**, select **Deploy from a branch** (`main` / `/ (root)`).
   - Click **Save**.
