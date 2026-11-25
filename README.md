# Vedant Chauhan — Portfolio

Personal portfolio of a data analyst. Light, editorial "data story" theme:
serif headlines, annotated charts and case studies instead of a wall of dashboards.

Plain HTML, CSS and JavaScript. No build step, no dependencies.

```
index.html            all page content
assets/css/style.css  theme (colours and fonts are at the top in :root)
assets/js/main.js     scroll reveals, menu, Fig. 1 chart, Fig. 2 before/after slider
```

## Editing content

Everything you need to change is marked with `<!-- EDIT: ... -->` comments in `index.html`.
The chart numbers in Fig. 1 are at the `// EDIT:` comment in `assets/js/main.js`.

- **Photo:** add `assets/img/photo.jpg` and swap it in where the About section says so.
- **Résumé:** add `assets/resume.pdf` and point the Résumé link at it.
- **Certificates:** copy one `<article class="cert">` block per certificate and
  remove the `placeholder` class.

## Preview locally

Open `index.html` in a browser, or run:

```bash
python3 -m http.server 8000
```

## Publish on GitHub Pages

Repository → Settings → Pages → Deploy from a branch → `main` / root.
