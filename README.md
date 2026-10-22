# Interactive CV & Portfolio Web Application

A modern, responsive, single-page interactive CV and portfolio web application built with **HTML5**, **Tailwind CSS (CDN)**, and **Vanilla JavaScript**. Designed for engineers, researchers, and technical leaders who need a fast, zero-dependency portfolio with granular link-based filtering.

---

## 🚀 Key Features

### 1. Centralized, Clean Data Store
- All CV entries are stored in a single, well-documented JavaScript array (`CV_DATA`) at the top of the main script in [`index.html`](file:///home/peipr/gits/new_website/index.html).
- Supports 6 distinct categories:
  - `work` (Professional experience)
  - `projects` (Key projects & technical builds)
  - `learning` (Education & academic courses)
  - `certifications` (Credentials & licenses)
  - `volunteering` (Volunteer work & community involvement)
  - `hobbies` (Personal interests & pursuits)
- Each entry strictly implements the requested schema:
  ```javascript
  {
    id: "work-staff-ai-systems",
    category: "work",
    title: "Staff AI Systems Engineer & Tech Lead",
    organization: "Cerebral Systems Labs",
    date: "2023 – Present",
    location: "Zurich, CH / Hybrid",
    description: "Leading the distributed systems team...",
    tags: ["Python", "Rust", "Distributed Systems", "vLLM"],
    featured: true,
    link: "https://example.com"
  }
  ```

### 2. Granular Link-Based Filtering
- **URL Parameter Engine:** The application reads search query parameters on load to display only the requested items or categories:
  - Filter by Categories: `?categories=work,projects`
  - Filter by Item IDs: `?ids=work-staff-ai-systems,project-omniagent-runtime`
  - Filter by Recipient / Context: `?recipient=DeepMind&context=Staff+Research+Engineer`
  - Filter by Tag: `?tag=Rust`
  - Filter by Featured: `?featured=true`
- **Tailored View Banner:** When filtered parameters are present in the URL, a prominent banner is automatically shown (e.g., *"Custom CV View for DeepMind (Staff Research Engineer)"*), with one-click buttons to adjust the selection or reset to the full CV.

### 3. Dynamic "Share Custom View" Builder Modal
- Click **"Share Custom View"** in the top navigation or banner to open the builder drawer/modal.
- **Master category & individual item checklists:** Select or deselect specific roles, projects, and certifications.
- **Quick Presets:** Instant 1-click presets:
  - *Select All* / *Clear All*
  - *★ Featured Only*
  - *Code & Tech (Work + Projects)*
  - *Research & Edu (Learning + Certifications)*
  - *Leadership & Volunteering (Work + Volunteering)*
- **Live URL Generator:** Dynamically compiles a clean, shareable URL with real-time copy button and instant clipboard feedback.

### 4. Tri-State Light / Dark / System Theme System
- Smooth manual toggle in the header supporting **Light**, **Dark**, and **System** preference.
- Saves preference to `localStorage`.
- Includes an early `<script>` in `<head>` to prevent Flash of Unstyled Content (FOUC).
- Configured with Tailwind's `darkMode: 'class'` and updates native `<meta name="color-scheme">` for consistent scrollbars and browser controls.

### 5. Print & PDF Export Optimized
- Dedicated `@media print` stylesheet.
- Strips interactive UI controls (search bars, theme switches, buttons, modals, toasts).
- Formats cards with `page-break-inside: avoid` for clean, professional 1-2 page PDF export via the browser's print dialog.
- Preserves the active filtered view so you can generate tailored PDFs for specific job applications.

---

## 🛠️ How to Customize

1. Open [`index.html`](file:///home/peipr/gits/new_website/index.html).
2. Locate the `PROFILE_DATA` and `CV_DATA` array:
   - Edit personal details (name, email, social links, metrics).
   - Add, edit, or remove items from the `CV_DATA` array.
3. Save the file. No build tools, Webpack, or npm dependencies are required.

---

## 🌐 Instant GitHub Pages Deployment

1. Push this repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: initial interactive CV release"
   git push origin main
   ```
2. In your GitHub repository:
   - Go to **Settings** > **Pages**.
   - Under **Source**, choose **Deploy from a branch**.
   - Select the `main` branch and `/ (root)` folder.
   - Click **Save**.
3. Your interactive CV will be live at `https://<your-username>.github.io/<repo-name>/`.
