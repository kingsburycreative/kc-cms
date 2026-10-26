// Dashboard mockup behaviour. The page reads fully without this file; it only adds motion and the toggle.
//
// How the real build does each one (cards 38 to 40):
// - Line draw-in, range crossfade, crosshair and tooltip: uPlot. The crosshair and tooltip are uPlot's
//   own cursor plus a setCursor hook that moves a positioned tooltip; the range swap is setData() with
//   the chart wrapper fading opacity; the draw-in is a CSS clip-path on the chart wrapper, run once.
// - Ring fill, staggered bars, publishing pulse, skeleton crossfade: CSS only, as here, in the
//   dashboard components (Tailwind classes plus motion-reduce:animate-none).
// - Count-up: a small client island on the three numbers, run once on mount.
// Every one of them is skipped under prefers-reduced-motion.
(() => {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;

  // Phone menu: the sidebar slides over the page.
  const menuBtn = document.querySelector('.menu-btn');
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.querySelector('.backdrop');
  const setMenu = (open) => {
    menuBtn.setAttribute('aria-expanded', String(open));
    sidebar.classList.toggle('is-open', open);
    backdrop.hidden = !open;
    if (open) requestAnimationFrame(() => requestAnimationFrame(() => sidebar.querySelector('a').focus()));
  };
  menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
  backdrop.addEventListener('click', () => setMenu(false));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('is-open')) { setMenu(false); menuBtn.focus(); }
  });

  // Chart data and drawing.
  const { end, series } = JSON.parse(document.getElementById('series').textContent);
  const endDate = new Date(end + 'T12:00:00');
  const fmt = (d) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const sum = (a) => a.reduce((x, y) => x + y, 0);
  const plot = document.getElementById('chart-plot');
  const svg = plot.querySelector('.chart-svg');
  const lineEl = svg.querySelector('.chart-line');
  const areaEl = svg.querySelector('.chart-area');
  const prevEl = svg.querySelector('.chart-prev');
  const grid = plot.querySelectorAll('.gridline span');
  const cross = plot.querySelector('.crosshair');
  const marker = plot.querySelector('.marker');
  const tip = plot.querySelector('.tip');
  const xAxis = document.querySelector('.chart-x');
  let state = null;

  const build = (range) => {
    const cur = series.slice(-range);
    const before = series.slice(-range * 2, -range);
    const max = Math.ceil((Math.max(...cur, ...before) * 1.15) / 10) * 10;
    const pts = (vals) => vals.map((v, i) => [(i * 600) / (vals.length - 1), 200 - (v / max) * 200]);
    const d = (p) => 'M' + p.map((q) => q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join(' L');
    const p = pts(cur);
    const dates = cur.map((_, i) => { const t = new Date(endDate); t.setDate(t.getDate() - (range - 1 - i)); return t; });
    return { range, cur, before, max, p, line: d(p), area: d(p) + ' L600 200 L0 200 Z', prev: d(pts(before)), dates };
  };

  const point = (i) => {
    const [x, y] = state.p[i];
    const pos = (el) => { el.style.setProperty('--x', (x / 6) + '%'); el.style.setProperty('--y', (y / 2) + '%'); };
    pos(cross); pos(marker); pos(tip);
    tip.innerHTML = fmt(state.dates[i]) + '<strong>' + state.cur[i] + (state.cur[i] === 1 ? ' visit' : ' visits') + '</strong>';
  };

  const render = (range) => {
    state = build(range);
    lineEl.setAttribute('d', state.line);
    areaEl.setAttribute('d', state.area);
    prevEl.setAttribute('d', state.prev);
    grid[0].textContent = state.max;
    grid[1].textContent = Math.round((state.max * 2) / 3);
    grid[2].textContent = Math.round(state.max / 3);
    const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => state.dates[Math.round(f * (range - 1))]);
    xAxis.innerHTML = ticks.map((t) => '<span>' + fmt(t) + '</span>').join('');
    const now = sum(state.cur), was = sum(state.before);
    const change = Math.round(((now - was) / was) * 100);
    document.getElementById('visits-total').textContent = now.toLocaleString('en-CA');
    const delta = document.getElementById('visits-delta');
    delta.className = 'delta ' + (change >= 0 ? 'up' : 'down');
    delta.innerHTML = '<span aria-hidden="true">' + (change >= 0 ? '&#9650;' : '&#9660;') + '</span> ' + Math.abs(change) +
      '%<span class="visually-hidden"> on the period before</span>';
    document.getElementById('visits-note').textContent = 'Last ' + range + ' days. ' + was + ' the ' + range + ' days before.';
    const peak = state.cur.indexOf(Math.max(...state.cur));
    document.getElementById('chart').setAttribute('aria-label', 'Visits per day from ' + fmt(state.dates[0]) + ' to ' +
      fmt(state.dates[range - 1]) + '. ' + now + ' in total. Busiest day ' + fmt(state.dates[peak]) + ' with ' + state.cur[peak] + ' visits.');
    point(peak);
  };
  state = build(30);

  // Range toggle: fade the plot out, swap the data, fade back in.
  document.querySelectorAll('.range-btn').forEach((btn) => btn.addEventListener('click', () => {
    if (btn.getAttribute('aria-pressed') === 'true') return;
    document.querySelectorAll('.range-btn').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    const range = Number(btn.dataset.range);
    if (still) { render(range); return; }
    plot.classList.add('is-swapping');
    setTimeout(() => { render(range); plot.classList.remove('is-swapping'); }, 160);
  }));

  // Crosshair and tooltip follow the pointer.
  plot.addEventListener('pointermove', (e) => {
    const box = plot.getBoundingClientRect();
    const f = Math.min(1, Math.max(0, (e.clientX - box.left) / box.width));
    point(Math.round(f * (state.range - 1)));
    plot.classList.add('is-hovering');
  });
  plot.addEventListener('pointerleave', () => plot.classList.remove('is-hovering'));

  if (still) return;

  // Once per visit: skeletons stand in for the data panels, then crossfade out and the motion starts.
  const panels = document.querySelectorAll('[data-skeleton]');
  root.classList.add('is-loading');
  panels.forEach((panel) => {
    const skel = document.createElement('div');
    skel.className = 'panel-skel';
    skel.setAttribute('aria-hidden', 'true');
    skel.innerHTML = '<span class="skeleton sk-num"></span><span class="skeleton sk-chart"></span><span class="skeleton sk-line"></span>';
    panel.append(skel);
  });

  const countUp = (el) => {
    const target = Number(el.dataset.count);
    const start = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - start) / 700);
      el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3))).toLocaleString('en-CA');
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  setTimeout(() => {
    root.classList.remove('is-loading');
    root.classList.add('is-ready');
    document.querySelectorAll('[data-count]').forEach(countUp);
    setTimeout(() => document.querySelectorAll('.panel-skel').forEach((s) => s.remove()), 400);
  }, 700);
})();
