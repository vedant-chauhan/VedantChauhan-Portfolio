/* Vedant Chauhan — portfolio interactions (no dependencies) */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  /* headline underline draws itself once the page has loaded */
  const mark = $('.mark');
  if (mark) requestAnimationFrame(() => requestAnimationFrame(() => mark.classList.add('drawn')));

  /* ---------- header state ---------- */
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

  /* ---------- Fig. 1: hours per sales review, by hand vs dashboard ---------- */
  // EDIT: numbers from the case study, in hours
  const ROWS = [
    { label: 'By hand', min: 5, max: 10, value: '5–10 hours', tip: 'By hand: 5–10 hours of manual analysis' },
    { label: 'Dashboard', min: 0, max: 10 / 60, value: 'under 10 minutes', tip: 'With the dashboard: under 10 minutes', hi: true },
  ];
  const AXIS_MAX = 10;

  // horizontal bar anchored at the axis, rounded only at its far end
  const hbar = (x, y, w, h, cls, round) => {
    const r = round ? Math.min(4, w / 2, h / 2) : 0;
    return `<path class="${cls}" d="M${x},${y} L${x + w - r},${y} Q${x + w},${y} ${x + w},${y + r} L${x + w},${y + h - r} Q${x + w},${y + h} ${x + w - r},${y + h} L${x},${y + h} Z"/>`;
  };

  function drawChart() {
    const host = $('#fig1');
    if (!host) return;
    const W = Math.max(280, Math.round(host.clientWidth));
    const narrow = W < 460;
    const m = { l: narrow ? 80 : 96, r: narrow ? 12 : 20, t: 30, b: 30 };
    const rowH = narrow ? 70 : 78, barH = narrow ? 24 : 28;
    const H = m.t + ROWS.length * rowH + m.b;
    const iw = W - m.l - m.r;
    const x = v => m.l + iw * (v / AXIS_MAX);

    let s = `<defs><pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" class="hatch-bg"/><line x1="0" y1="0" x2="0" y2="7" class="hatch-ln"/></pattern></defs>`;
    for (let v = 0; v <= AXIS_MAX; v += 2) {
      s += `<line class="grid" x1="${x(v)}" x2="${x(v)}" y1="${m.t - 12}" y2="${H - m.b}"/>`;
      s += `<text x="${x(v)}" y="${H - 10}" text-anchor="middle">${v}${v === AXIS_MAX ? ' h' : ''}</text>`;
    }
    ROWS.forEach((r, i) => {
      const cy = m.t + i * rowH + rowH / 2, y0 = cy - barH / 2;
      s += `<text class="rl" x="${m.l - 12}" y="${cy + 5}" text-anchor="end">${r.label}</text>`;
      if (r.min > 0) {
        // solid up to the low end of the range, hatched across the range (2px gap between)
        s += hbar(x(0), y0, x(r.min) - x(0) - 1, barH, 'bar', false);
        s += hbar(x(r.min) + 1, y0, x(r.max) - x(r.min) - 1, barH, 'bar range', true);
        s += `<text class="vl" x="${x(r.max)}" y="${y0 - 8}" text-anchor="end">${r.value}</text>`;
      } else {
        const w = Math.max(5, x(r.max) - x(0));
        s += hbar(x(0), y0, w, barH, 'bar hi', true);
        s += `<text class="ann" x="${x(0) + w + 10}" y="${cy + 5}">${r.value}</text>`;
      }
      s += `<rect class="hit" data-i="${i}" x="${m.l}" y="${cy - rowH / 2}" width="${iw}" height="${rowH}" fill="transparent"/>`;
    });
    s += `<line class="base" x1="${x(0)}" x2="${x(0)}" y1="${m.t - 12}" y2="${H - m.b}"/>`;

    host.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Bar chart: one sales review took 5 to 10 hours by hand, and under 10 minutes with the Power BI dashboard.">${s}</svg><div class="tip"></div>`;

    const svg = $('svg', host), tip = $('.tip', host);
    const show = el => {
      const i = +el.dataset.i, r = ROWS[i], k = svg.getBoundingClientRect().width / W;
      const cy = m.t + i * rowH + rowH / 2;
      tip.textContent = r.tip;
      tip.style.left = `${Math.min(x(r.max), W - 120) * k}px`;
      tip.style.top = `${(cy - barH / 2) * k}px`;
      tip.style.opacity = 1;
    };
    $$('.hit', svg).forEach(h => {
      h.addEventListener('pointerenter', () => show(h));
      h.addEventListener('pointerdown', () => show(h));
      h.addEventListener('pointerleave', () => (tip.style.opacity = 0));
    });
  }
  drawChart();
  let rw = innerWidth, t;
  addEventListener('resize', () => {
    clearTimeout(t);
    t = setTimeout(() => { if (innerWidth !== rw) { rw = innerWidth; drawChart(); } }, 150);
  });

  /* ---------- certifications: "Active" label + full-size viewer ---------- */
  const now = new Date();
  $$('.cert[data-expires]').forEach(c => {
    const st = $('.cert-status', c);
    if (st && new Date(`${c.dataset.expires}T23:59:59`) >= now) st.classList.add('on');
  });
  const lb = $('#lightbox');
  $$('.cert-img').forEach(btn => {
    const thumb = $('img', btn);
    btn.setAttribute('aria-label', `View full size: ${thumb.alt}`);
    btn.addEventListener('click', () => {
      if (!lb || typeof lb.showModal !== 'function') { window.open(btn.dataset.full, '_blank', 'noopener'); return; }
      const big = $('img', lb);
      big.src = btn.dataset.full;
      big.alt = thumb.alt;
      $('.lb-cap', lb).textContent = thumb.alt;
      lb.showModal();
    });
  });
  if (lb) lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });

  /* ---------- experience: durations, counted like LinkedIn (inclusive months) ---------- */
  const ym = s => { const [y, m] = s.split('-').map(Number); return y * 12 + (m - 1); };
  const thisMonth = now.getFullYear() * 12 + now.getMonth();
  $$('.dur[data-start]').forEach(el => {
    const months = (el.dataset.end ? ym(el.dataset.end) : thisMonth) - ym(el.dataset.start) + 1;
    const y = Math.floor(months / 12), m = months % 12;
    el.textContent = [y && `${y} yr${y > 1 ? 's' : ''}`, m && `${m} mo${m > 1 ? 's' : ''}`].filter(Boolean).join(' ');
  });

  /* ---------- Fig. 2: before / after slider ---------- */
  const ba = $('#ba');
  if (ba) {
    const range = $('input', ba);
    const set = () => ba.style.setProperty('--p', `${range.value}%`);
    range.addEventListener('input', set);
    set();
  }
})();
