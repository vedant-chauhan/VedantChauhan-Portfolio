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

  /* ---------- header state + reading progress ---------- */
  const head = $('.site-head');
  const bar = $('.progress span');
  const onScroll = () => {
    const y = scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    head.classList.toggle('scrolled', y > 8);
    bar.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
  };
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

  /* ---------- Fig. 1: annotated bar chart ---------- */
  // EDIT: replace with your own numbers
  const DATA = [34, 38, 41, 45, 52, 30, 27, 26, 29, 33];
  const LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
  const HIGHLIGHT = 5;                 // index of the bar the story is about
  const NOTE = ['Pricing change', 'goes live here'];

  function drawChart() {
    const host = $('#fig1');
    if (!host) return;
    const W = Math.max(280, Math.round(host.clientWidth));
    const H = Math.round(Math.min(330, Math.max(230, W * 0.52)));
    const m = { l: 28, r: 6, t: 22, b: 28 };
    const iw = W - m.l - m.r, ih = H - m.t - m.b, max = 60, n = DATA.length, bw = iw / n;
    const gap = Math.max(5, bw * 0.24), w = bw - gap, r = Math.min(4, w / 2);
    const y = v => m.t + ih * (1 - v / max);
    const every = bw < 30 ? 2 : 1;

    let s = '';
    for (let v = 0; v <= max; v += 20) {
      s += `<line class="grid" x1="${m.l}" x2="${W - m.r}" y1="${y(v)}" y2="${y(v)}"/>`;
      s += `<text x="${m.l - 6}" y="${y(v) + 4}" text-anchor="end">${v}</text>`;
    }
    DATA.forEach((v, i) => {
      const x = m.l + i * bw + gap / 2, top = y(v), base = y(0);
      s += `<path class="bar${i === HIGHLIGHT ? ' hi' : ''}" data-i="${i}" d="M${x},${top + r} Q${x},${top} ${x + r},${top} L${x + w - r},${top} Q${x + w},${top} ${x + w},${top + r} L${x + w},${base} L${x},${base} Z"/>`;
      if (i % every === 0) s += `<text x="${x + w / 2}" y="${H - 8}" text-anchor="middle">${LABELS[i]}</text>`;
    });
    s += `<line class="base" x1="${m.l}" x2="${W - m.r}" y1="${y(0)}" y2="${y(0)}"/>`;

    // annotation + hand-drawn arrow pointing at the highlighted bar
    const cx = m.l + HIGHLIGHT * bw + bw / 2, ty = y(56);
    s += `<text class="ann" x="${cx + 26}" y="${ty}">${NOTE[0]}</text><text class="ann" x="${cx + 26}" y="${ty + 18}">${NOTE[1]}</text>`;
    const tipY = y(DATA[HIGHLIGHT]) - 8;
    s += `<path class="arrow" d="M${cx + 22},${ty - 4} C${cx + 6},${ty} ${cx + 2},${ty + 20} ${cx + 2},${tipY}"/>`;
    s += `<path class="arrow" d="M${cx + 2},${tipY} l-5,-8 M${cx + 2},${tipY} l6,-7"/>`;

    host.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Bar chart of monthly active customers in thousands, January to October. It rises to 52 in May, then drops to 30 in June after a pricing change.">${s}</svg><div class="tip"></div>`;

    const svg = $('svg', host), tip = $('.tip', host), bars = $$('.bar', svg);
    const show = p => {
      const i = +p.dataset.i, rect = svg.getBoundingClientRect(), k = rect.width / W;
      bars.forEach(o => (o.style.opacity = o === p ? 1 : 0.5));
      tip.innerHTML = `${LABELS[i]}<b>${DATA[i]}k customers</b>`;
      tip.style.left = `${(m.l + i * bw + bw / 2) * k}px`;
      tip.style.top = `${y(DATA[i]) * k}px`;
      tip.style.opacity = 1;
    };
    const hide = () => { bars.forEach(o => (o.style.opacity = 1)); tip.style.opacity = 0; };
    bars.forEach(p => {
      p.addEventListener('pointerenter', () => show(p));
      p.addEventListener('pointerdown', () => show(p));
      p.addEventListener('pointerleave', hide);
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

  /* ---------- Fig. 2: before / after slider ---------- */
  const ba = $('#ba');
  if (ba) {
    const range = $('input', ba);
    const set = () => ba.style.setProperty('--p', `${range.value}%`);
    range.addEventListener('input', set);
    set();
  }
})();
