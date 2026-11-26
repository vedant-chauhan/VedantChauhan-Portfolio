/* Vedant Chauhan — portfolio interactions (no dependencies) */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const now = new Date();

  /* ---------- scroll reveal ---------- */
  const reveal = $$('.rv');
  if (reduce || !('IntersectionObserver' in window)) {
    reveal.forEach(el => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveal.forEach(el => io.observe(el));
  }

  /* headline underline and margin note draw themselves once the page has loaded */
  const mark = $('.mark');
  if (mark) requestAnimationFrame(() => requestAnimationFrame(() => mark.classList.add('drawn')));

  /* ---------- header border once scrolled ---------- */
  const head = $('.site-head');
  const onScroll = () => head.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  const btn = $('.menu-btn');
  const nav = $('#nav');
  const setMenu = open => {
    nav.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
    btn.textContent = open ? 'Close' : 'Menu';
  };
  btn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  $$('a', nav).forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- active nav link ---------- */
  const links = new Map($$('a[href^="#"]', nav).map(a => [a.getAttribute('href').slice(1), a]));
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(e => {
        const a = links.get(e.target.id);
        if (!a) return;
        if (e.isIntersecting) {
          links.forEach(l => l.classList.remove('active'));
          a.classList.add('active');
        } else {
          a.classList.remove('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });
  }

  /* ---------- durations, counted like LinkedIn (inclusive months) ---------- */
  const ym = s => { const [y, m] = s.split('-').map(Number); return y * 12 + (m - 1); };
  const thisMonth = now.getFullYear() * 12 + now.getMonth();
  const durLabel = months => {
    const y = Math.floor(months / 12), m = months % 12;
    return [y && `${y} yr${y > 1 ? 's' : ''}`, m && `${m} mo${m > 1 ? 's' : ''}`].filter(Boolean).join(' ');
  };
  $$('.dur[data-start]').forEach(el => {
    el.textContent = durLabel((el.dataset.end ? ym(el.dataset.end) : thisMonth) - ym(el.dataset.start) + 1);
  });

  /* ---------- Fig. 1: career line (metro map) ---------- */
  // EDIT: stations on the map. `to` (optional) is the card or section a station links to.
  const ST = {
    start: { date: '2021', name: 'Started B.E.', sub: 'CVM University' },
    flu: { date: 'MAY 2024', name: 'Flutter intern', sub: 'TechnoGuide · 1 mo' },
    int: { date: 'JAN 2025', name: 'Data Analyst Intern', sub: 'Inkey IT Solutions', to: '#xp-ase' },
    grad: { date: '2025', name: 'Graduated', sub: 'B.E. Computer Engineering' },
    ft: { date: 'AUG 2025', name: 'Full-time at Inkey', sub: 'Associate Software Engineer', to: '#xp-ase' },
    vsc: { date: '2026', name: 'Co-founded vscodelabs', sub: 'Web & app projects, team of 3–4', to: '#xp-vsc' },
    dp8: { date: 'JUL 2026', name: 'DP-800 certified', sub: 'SQL AI Developer', to: '#certificates' },
    dp6: { date: 'OCT 2026', name: 'DP-600 certified', sub: 'Fabric Analytics Engineer', to: '#certificates' },
  };
  const FULL_TIME_START = '2025-08';   // drives the "Now" duration
  const metro = $('#metro');

  const stn = (k, inner) => ST[k].to
    ? `<a class="stn" href="${ST[k].to}" aria-label="${ST[k].date}: ${ST[k].name}, ${ST[k].sub}">${inner}</a>`
    : `<g>${inner}</g>`;
  const circ = (x, y, cls, r = 8) => `<circle class="st ${cls}" cx="${x}" cy="${y}" r="${r}"/>`;
  const dia = (x, y, r = 10) => `<path class="dia" d="M${x},${y - r} l${r},${r} l${-r},${r} l${-r},${-r} z"/>`;
  const terminal = (x, y, cls, r, pulse) => `${pulse && !reduce ? `<circle class="ring" cx="${x}" cy="${y}" r="${r}"/>` : ''}<circle class="${cls}" cx="${x}" cy="${y}" r="${r}"/><circle cx="${x}" cy="${y}" r="${r * 0.4}" fill="#fffdf7"/>`;
  const sinceFullTime = () => durLabel(thisMonth - ym(FULL_TIME_START) + 1);

  // wide screens: lines run left to right
  function metroWide(W) {
    const H = 400, pl = 40, pr = 84, X = f => pl + (W - pl - pr) * f;
    const eduY = 100, carY = 214, frY = 318;
    const label = (x, y, s) => `<text class="sd" x="${x}" y="${y}">${s.date}</text><text class="sn" x="${x}" y="${y + 19}">${s.name}</text><text class="ss" x="${x}" y="${y + 35}">${s.sub}</text>`;
    const eEnd = X(.42), merge = X(.5), br = X(.6), bEnd = X(.655), tX = X(1);
    let s = '';
    s += `<path class="ln ln-edu" d="M${X(0)},${eduY} L${eEnd},${eduY} C ${eEnd + 40},${eduY} ${merge - 40},${carY} ${merge},${carY}"/>`;
    s += `<path class="ln ln-int" d="M${X(.335)},${carY} L${X(.54)},${carY}"/>`;
    s += `<path class="ln ln-car" d="M${X(.54)},${carY} L${tX},${carY}"/>`;
    s += `<path class="ln ln-free" d="M${br},${carY} C ${br + 30},${carY} ${bEnd - 30},${frY} ${bEnd},${frY} L${tX},${frY}"/>`;
    [['start', X(0), 'st-edu'], ['flu', X(.2), 'st-int'], ['grad', eEnd, 'st-edu']].forEach(([k, x, cls]) => {
      s += stn(k, circ(x, eduY, cls) + label(x - 8, eduY - 72, ST[k]));
    });
    s += stn('int', circ(X(.335), carY, 'st-int') + label(X(.335) - 8, carY + 32, ST.int));
    s += stn('ft', circ(X(.54), carY, 'st-car') + label(X(.54) - 8, carY - 66, ST.ft));
    s += stn('dp8', dia(X(.75), carY) + label(X(.75) - 8, carY - 66, ST.dp8));
    s += stn('dp6', dia(X(.88), carY) + label(X(.88) - 8, carY + 32, ST.dp6));
    s += stn('vsc', circ(bEnd + 8, frY, 'st-free') + label(bEnd, frY + 32, ST.vsc));
    s += terminal(tX, carY, 'term', 11, true) + `<text class="sd" x="${tX + 20}" y="${carY - 4}">NOW</text><text class="ss" x="${tX + 20}" y="${carY + 12}">${sinceFullTime()}</text>`;
    s += terminal(tX, frY, 'term-free', 9, false) + `<text class="sd" x="${tX + 20}" y="${frY + 4}">NOW</text>`;
    return [H, s];
  }

  // phones and tablets: the same map, top (2021) to bottom (now)
  function metroTall() {
    const lx = 104, eduX = 26, carX = 50, frX = 76;
    const y = { start: 34, flu: 112, int: 190, grad: 268, ft: 360, vsc: 450, dp8: 530, dp6: 608, now: 694 };
    const H = y.now + 40;
    const label = (yy, s) => `<text class="sd" x="${lx}" y="${yy - 8}">${s.date}</text><text class="sn" x="${lx}" y="${yy + 10}">${s.name}</text><text class="ss" x="${lx}" y="${yy + 26}">${s.sub}</text>`;
    const lead = (x, yy) => `<line class="lead" x1="${x + 11}" x2="${lx - 8}" y1="${yy}" y2="${yy}"/>`;
    let s = '';
    s += `<path class="ln ln-edu" d="M${eduX},${y.start} L${eduX},${y.grad} C ${eduX},${y.grad + 40} ${carX},${y.ft - 60} ${carX},${y.ft - 22}"/>`;
    s += `<path class="ln ln-int" d="M${carX},${y.int} L${carX},${y.ft}"/>`;
    s += `<path class="ln ln-car" d="M${carX},${y.ft} L${carX},${y.now}"/>`;
    s += `<path class="ln ln-free" d="M${carX},${y.vsc - 50} C ${carX},${y.vsc - 22} ${frX},${y.vsc - 30} ${frX},${y.vsc} L${frX},${y.now}"/>`;
    s += stn('start', circ(eduX, y.start, 'st-edu', 7.5) + lead(eduX, y.start) + label(y.start, ST.start));
    s += stn('flu', circ(eduX, y.flu, 'st-int', 7.5) + lead(eduX, y.flu) + label(y.flu, ST.flu));
    s += stn('int', circ(carX, y.int, 'st-int', 7.5) + lead(carX, y.int) + label(y.int, ST.int));
    s += stn('grad', circ(eduX, y.grad, 'st-edu', 7.5) + lead(eduX, y.grad) + label(y.grad, ST.grad));
    s += stn('ft', circ(carX, y.ft, 'st-car', 7.5) + lead(carX, y.ft) + label(y.ft, ST.ft));
    s += stn('vsc', circ(frX, y.vsc, 'st-free', 7.5) + lead(frX, y.vsc) + label(y.vsc, ST.vsc));
    s += stn('dp8', dia(carX, y.dp8, 9) + lead(carX, y.dp8) + label(y.dp8, ST.dp8));
    s += stn('dp6', dia(carX, y.dp6, 9) + lead(carX, y.dp6) + label(y.dp6, ST.dp6));
    s += terminal(carX, y.now, 'term', 10, true) + terminal(frX, y.now, 'term-free', 8.5, false);
    s += `<text class="sd" x="${lx}" y="${y.now - 6}">NOW</text><text class="ss" x="${lx}" y="${y.now + 11}">${sinceFullTime()} at Inkey</text>`;
    return [H, s];
  }

  function drawMetro() {
    if (!metro) return;
    const W = Math.round(metro.clientWidth);
    if (!W) return;
    const [H, s] = W >= 1000 ? metroWide(W) : metroTall();
    metro.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="group" aria-label="Career line from 2021 to today: B.E. studies, Flutter internship, Data Analyst internship, full-time at Inkey IT Solutions, vscodelabs and two Microsoft certifications">${s}</svg>`;
  }
  drawMetro();
  let lastWidth = innerWidth, resizeTimer;
  addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { if (innerWidth !== lastWidth) { lastWidth = innerWidth; drawMetro(); } }, 150);
  });

  // clicking a station jumps to its card and briefly highlights it
  if (metro) metro.addEventListener('click', e => {
    const a = e.target.closest('a.stn');
    const card = a && document.querySelector(a.getAttribute('href'));
    if (card && card.classList.contains('xp-card')) {
      card.classList.remove('flash');
      void card.offsetWidth;
      card.classList.add('flash');
    }
  });

  /* ---------- live Power BI reports: on-page viewer (new tab on phones) ---------- */
  const viewer = $('#report-viewer');
  $$('[data-embed]').forEach(el => el.addEventListener('click', () => {
    const url = el.dataset.embed, title = el.dataset.title;
    if (!viewer || typeof viewer.showModal !== 'function' || innerWidth < 640) { window.open(url, '_blank', 'noopener'); return; }
    $('.viewer-title', viewer).textContent = title;
    $('.viewer-ext', viewer).href = url;
    const frame = $('iframe', viewer);
    frame.title = `${title} (live Power BI report)`;
    frame.src = url;
    viewer.showModal();
  }));
  if (viewer) {
    viewer.addEventListener('close', () => { $('iframe', viewer).src = 'about:blank'; });
    viewer.addEventListener('click', e => { if (e.target === viewer) viewer.close(); });
  }

  /* ---------- certifications: "Active" label + certificate viewer ---------- */
  $$('.cert[data-expires]').forEach(c => {
    const st = $('.cert-status', c);
    if (st && new Date(`${c.dataset.expires}T23:59:59`) >= now) st.classList.add('on');
  });
  const lb = $('#lightbox');
  $$('.cert-view').forEach(b => b.addEventListener('click', () => {
    if (!lb || typeof lb.showModal !== 'function') { window.open(b.dataset.full, '_blank', 'noopener'); return; }
    const img = $('img', lb);
    img.src = b.dataset.full;
    img.alt = b.dataset.alt;
    $('.lb-cap', lb).textContent = b.dataset.alt;
    lb.showModal();
  }));
  if (lb) lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });
})();
