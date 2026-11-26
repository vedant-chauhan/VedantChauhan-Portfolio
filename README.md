# Vedant Chauhan — Portfolio

Personal portfolio of a data analyst and Power BI developer. Light, editorial theme
built to say a lot with few words: four headline numbers, live reports as proof, and
one chart of the career.

Plain HTML, CSS and JavaScript. No build step, no dependencies.

```
index.html             all page content
assets/css/style.css   theme (colours and fonts are at the top in :root)
assets/js/main.js      menu, career-line map, report and certificate viewers
assets/img/reports/    screenshots of the live Power BI reports
assets/img/certs/      certificate images and the Microsoft badge
assets/docs/           résumé PDF
```

## Page order

1. **Opening screen**: headline, one-line intro, four numbers
2. **Work**: five live Power BI reports
3. **Experience**: career-line map (Fig. 1) and two role cards
4. **Credentials**: Microsoft certifications and blog articles
5. **About**: short story and three tool groups
6. **Contact**

## Editing content

Every place to change is marked with an `<!-- EDIT: ... -->` comment in `index.html`.

- **Headline numbers:** the `<ul class="stats">` list on the opening screen.
- **Power BI reports:** copy one `<article class="report">` block. Put a screenshot in
  `assets/img/reports/` and set both `data-embed` attributes to the report's public
  "Publish to web" link. It opens in an on-page viewer on desktop, a new tab on phones.
- **Career-line map:** the stations are the `ST` list under `// EDIT` in `assets/js/main.js`.
  A station with `to` links to a card or section.
- **Certifications:** copy one `<article class="cert">` block and set `data-expires`
  (YYYY-MM-DD) so the "Active" label hides itself once it lapses.
- **Writing:** one `<li>` per article, newest first.
- **Photo:** add `assets/img/photo.jpg` and swap it in where the About section says so.

Colour rule: red is only for the headline word, the key numbers and the career line.

## Preview locally

```bash
python3 -m http.server 8000
```
