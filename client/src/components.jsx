import React from "react";

/* ---------- ÍCONES (stroke, herda currentColor) ---------- */
export const Ic = {};
const mk = (path, fill) => (p = {}) => React.createElement('svg', {
  viewBox: '0 0 24 24', fill: fill ? 'currentColor' : 'none', stroke: fill ? 'none' : 'currentColor',
  strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', ...p,
  dangerouslySetInnerHTML: { __html: path }
});
Ic.dash   = mk('<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>');
Ic.pipe   = mk('<rect x="3" y="4" width="4" height="16" rx="1"/><rect x="10" y="4" width="4" height="11" rx="1"/><rect x="17" y="4" width="4" height="7" rx="1"/>');
Ic.home   = mk('<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5"/><path d="M9.5 21v-6h5v6"/>');
Ic.users  = mk('<circle cx="9" cy="8" r="3.2"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><path d="M16 5.2a3 3 0 0 1 0 5.6"/><path d="M17.5 20a5.2 5.2 0 0 0-2.4-4.4"/>');
Ic.doc    = mk('<path d="M6 3h8l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M14 3v4h4"/><path d="M8.5 12h7M8.5 16h7"/>');
Ic.mega   = mk('<path d="M4 10v4a1 1 0 0 0 1 1h2l8 4V5L7 9H5a1 1 0 0 0-1 1Z"/><path d="M19 9a4 4 0 0 1 0 6"/>');
Ic.money  = mk('<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9.5v5M18 9.5v5"/>');
Ic.chart  = mk('<path d="M4 4v16h16"/><path d="M7 14l3-3 3 2 4-6"/>');
Ic.search = mk('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/>');
Ic.plus   = mk('<path d="M12 5v14M5 12h14"/>');
Ic.bell   = mk('<path d="M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8Z"/><path d="M10.5 21a2 2 0 0 0 3 0"/>');
Ic.list   = mk('<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>');
Ic.board  = mk('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16M15 4v16"/>');
Ic.up     = mk('<path d="M7 14l5-5 5 5"/>');
Ic.down   = mk('<path d="M7 10l5 5 5-5"/>');
Ic.dots   = mk('<circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/>', true);
Ic.x      = mk('<path d="M6 6l12 12M18 6 6 18"/>');
Ic.check  = mk('<path d="M5 13l4 4L19 7"/>');
Ic.eye    = mk('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="2.6"/>');
Ic.heart  = mk('<path d="M12 20s-7-4.3-9.3-8.5C1 8 2.8 4.5 6.2 4.5c2 0 3.2 1.2 3.8 2.2C10.6 5.7 11.8 4.5 13.8 4.5c3.4 0 5.2 3.5 3.5 7C19 15.7 12 20 12 20Z"/>');
Ic.tag    = mk('<path d="M3 12V5a2 2 0 0 1 2-2h7l9 9-9 9-9-9Z"/><circle cx="8" cy="8" r="1.3" fill="currentColor"/>');
Ic.pin    = mk('<path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z"/><circle cx="12" cy="10" r="2.4"/>');
Ic.cal    = mk('<rect x="3.5" y="5" width="17" height="16" rx="2"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/>');
Ic.phone  = mk('<path d="M5 3h3l2 5-2.5 1.5a12 12 0 0 0 6 6L17 13l5 2v3a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2Z"/>');
Ic.filter = mk('<path d="M3 5h18l-7 8v6l-4-2v-4L3 5Z"/>');
Ic.arrow  = mk('<path d="M5 12h14M13 6l6 6-6 6"/>');
Ic.flag   = mk('<path d="M5 21V4M5 4h11l-2 3 2 3H5"/>');
Ic.split  = mk('<path d="M6 3v6a4 4 0 0 0 4 4h8M6 21v-4"/><path d="M18 9l3-3-3-3M18 17l3-3"/>');
Ic.lock   = mk('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>');
Ic.hand   = mk('<path d="M8 11V5.5a1.5 1.5 0 0 1 3 0V10m0-1.5a1.5 1.5 0 0 1 3 0V11m0-1a1.5 1.5 0 0 1 3 0v4a6 6 0 0 1-6 6h-1.5a5 5 0 0 1-4-2L5 14a1.6 1.6 0 0 1 2.4-2L8 13"/>');
Ic.sign   = mk('<path d="M3 19c3-1 4-9 6-9s2 6 4 6 2-4 4-4 2 2 4 2"/><path d="M3 21h18"/>');
Ic.insta  = mk('<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.1" fill="currentColor"/>');
Ic.google = mk('<path d="M21 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.1a4.4 4.4 0 0 1-1.9 2.9v2.4h3.1c1.8-1.7 2.7-4.1 2.7-7.1Z"/><path d="M12 22c2.6 0 4.8-.9 6.4-2.4l-3.1-2.4c-.9.6-2 .9-3.3.9-2.5 0-4.7-1.7-5.4-4H3.4v2.5A10 10 0 0 0 12 22Z"/><path d="M6.6 14.1A6 6 0 0 1 6.6 9.9V7.4H3.4a10 10 0 0 0 0 9.2Z"/><path d="M12 6c1.4 0 2.7.5 3.7 1.4l2.7-2.7A10 10 0 0 0 3.4 7.4l3.2 2.5C7.3 7.7 9.5 6 12 6Z"/>');
Ic.store  = mk('<path d="M4 9 5 4h14l1 5M4 9h16M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9M9 20v-5h6v5"/>');
Ic.wave   = mk('<path d="M2 16c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2"/><path d="M2 11c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2"/>');
Ic.ext    = mk('<path d="M14 4h6v6M20 4l-8 8M9 5H5a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1v-4"/>');
Ic.whats  = mk('<path d="M3 21l1.6-4.4A8 8 0 1 1 8.4 19.4L3 21Z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5.6 0 1-.4 1-.6 0-.5-1.4-1.2-1.8-1.2-.5 0-.7.7-1 .7-.7 0-2.6-1.9-2.6-2.6 0-.3.7-.5.7-1 0-.4-.7-1.8-1.2-1.8-.3 0-.8.4-.8 1Z"/>');
Ic.mail   = mk('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6 8.5-6"/>');
Ic.send   = mk('<path d="M4 12l16-7-7 16-2.5-6.5L4 12Z"/>');
Ic.dl     = mk('<path d="M12 4v11m0 0 4-4m-4 4-4-4M5 20h14"/>');
Ic.clock  = mk('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>');
Ic.target = mk('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>');

/* ---------- LOGO MARK (monograma RL Imóveis) ---------- */
export function SurflandMark({ size = 34 }) {
  return React.createElement('svg', { width: size, height: size, viewBox: '0 0 48 48', fill: 'none' },
    React.createElement('rect', { x: 2, y: 2, width: 44, height: 44, rx: 11, fill: '#13674E' }),
    React.createElement('path', { d: 'M14 34V15.5h7.2c3.4 0 5.6 1.9 5.6 4.9 0 2.2-1.2 3.8-3.2 4.5l3.8 9.1h-3.9l-3.3-8.2H17.4V34H14Zm3.4-10.7h3.4c1.6 0 2.6-.9 2.6-2.4s-1-2.4-2.6-2.4h-3.4v4.8Z', fill: '#fff' }),
    React.createElement('path', { d: 'M28.5 34V15.5h3.4v15.4H38V34h-9.5Z', fill: '#C2913C' })
  );
}

/* ---------- AVATAR ---------- */
export function Avatar({ name, cor }) {
  const ini = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  return React.createElement('div', { className: 'avatar', style: { background: cor || '#1C1B16' } }, ini);
}

/* ---------- BADGES de canal / status ---------- */
export function CanalBadge({ canal }) {
  const map = {
    'Instagram': { ic: Ic.insta, bg: 'linear-gradient(135deg,#E03B72,#F5C518)' },
    'Google':    { ic: Ic.google, bg: '#1FA7BD' },
    'Marketplace': { ic: Ic.store, bg: '#1C1B16' },
    'Indicação': { ic: Ic.users, bg: '#3F8F5B' },
    'Direto':    { ic: Ic.pin,   bg: '#6B675B' },
  };
  const m = map[canal] || map['Direto'];
  return React.createElement('span', { className: 'chan' },
    React.createElement('span', { className: 'ci', style: { background: m.bg } }, React.createElement(m.ic, { width: 12, height: 12, strokeWidth: 2.2 })),
    canal);
}

/* ---------- SPARKLINE / AREA ---------- */
export function AreaChart({ data, w = 560, h = 160, color = '#1FA7BD', fill = 'rgba(31,167,189,.14)', data2, color2 = '#F5C518' }) {
  const all = data2 ? data.concat(data2) : data;
  const max = Math.max(...all) * 1.12, min = Math.min(...all) * .85;
  const pts = (arr) => arr.map((v, i) => [(i / (arr.length - 1)) * w, h - ((v - min) / (max - min)) * h]);
  const line = (p) => p.map((q, i) => (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join(' ');
  const area = (p) => line(p) + ` L ${w} ${h} L 0 ${h} Z`;
  const p1 = pts(data);
  return React.createElement('svg', { className: 'spark', viewBox: `0 0 ${w} ${h}`, preserveAspectRatio: 'none', style: { height: h } },
    React.createElement('defs', null,
      React.createElement('linearGradient', { id: 'ag', x1: 0, y1: 0, x2: 0, y2: 1 },
        React.createElement('stop', { offset: '0%', stopColor: color, stopOpacity: .22 }),
        React.createElement('stop', { offset: '100%', stopColor: color, stopOpacity: 0 }))),
    React.createElement('path', { d: area(p1), fill: 'url(#ag)' }),
    React.createElement('path', { d: line(p1), fill: 'none', stroke: color, strokeWidth: 2.4, strokeLinecap: 'round', strokeLinejoin: 'round' }),
    data2 && React.createElement('path', { d: line(pts(data2)), fill: 'none', stroke: color2, strokeWidth: 2.2, strokeDasharray: '4 4', strokeLinecap: 'round' }),
    p1.map((q, i) => i === p1.length - 1 && React.createElement('circle', { key: i, cx: q[0], cy: q[1], r: 4, fill: color }))
  );
}

/* ---------- BAR CHART (receita x despesa) ---------- */
export function BarsChart({ data, h = 190 }) {
  const max = Math.max(...data.map(d => d.receita)) * 1.1 || 1;
  return React.createElement('div', { style: { display: 'flex', alignItems: 'flex-end', gap: 18, height: h, padding: '0 4px' } },
    data.map((d, i) => React.createElement('div', { key: i, style: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%' } },
      React.createElement('div', { style: { flex: 1, display: 'flex', alignItems: 'flex-end', gap: 5, width: '100%', justifyContent: 'center' } },
        React.createElement('div', { title: 'Receita', style: { width: '42%', height: (d.receita / max * 100) + '%', background: 'var(--brand)', borderRadius: '5px 5px 0 0', minHeight: 4 } }),
        React.createElement('div', { title: 'Despesa', style: { width: '42%', height: (d.despesa / max * 100) + '%', background: 'var(--ink)', borderRadius: '5px 5px 0 0', minHeight: 4 } })),
      React.createElement('div', { style: { fontSize: 11, fontWeight: 700, color: 'var(--ink-3)' } }, d.mes)))
  );
}

/* ---------- DONUT ---------- */
export function Donut({ segments, size = 150, thickness = 22, center }) {
  const r = (size - thickness) / 2, c = size / 2, circ = 2 * Math.PI * r;
  let off = 0;
  return React.createElement('div', { style: { position: 'relative', width: size, height: size } },
    React.createElement('svg', { width: size, height: size, style: { transform: 'rotate(-90deg)' } },
      React.createElement('circle', { cx: c, cy: c, r: r, fill: 'none', stroke: 'var(--line-2)', strokeWidth: thickness }),
      segments.map((s, i) => {
        const len = s.pct / 100 * circ;
        const el = React.createElement('circle', { key: i, cx: c, cy: c, r: r, fill: 'none', stroke: s.cor, strokeWidth: thickness,
          strokeDasharray: `${len} ${circ - len}`, strokeDashoffset: -off, strokeLinecap: 'butt' });
        off += len; return el;
      })),
    center && React.createElement('div', { style: { position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' } }, center)
  );
}

/* ---------- KPI CARD ---------- */
export function Kpi({ icon, iconBg, iconColor, label, value, delta, deltaDir }) {
  const dirCls = deltaDir === 'up' ? 'up' : deltaDir === 'down' ? 'down' : 'flat';
  return React.createElement('div', { className: 'kpi' },
    React.createElement('div', { className: 'ic', style: { background: iconBg, color: iconColor } }, React.createElement(icon, {})),
    React.createElement('div', { className: 'lbl' }, label),
    React.createElement('div', { className: 'val' }, value),
    delta && React.createElement('span', { className: 'delta ' + dirCls },
      deltaDir === 'up' ? React.createElement(Ic.up, { width: 12, height: 12, strokeWidth: 2.6 }) : deltaDir === 'down' ? React.createElement(Ic.down, { width: 12, height: 12, strokeWidth: 2.6 }) : null,
      delta)
  );
}

/* ---------- MODAL ---------- */
export function Modal({ title, sub, onClose, children, footer, icon }) {
  return React.createElement('div', { className: 'modal-scrim', onClick: onClose },
    React.createElement('div', { className: 'modal', onClick: e => e.stopPropagation() },
      React.createElement('div', { className: 'modal-h' },
        icon && React.createElement('div', { style: { width: 38, height: 38, borderRadius: 10, background: 'var(--brand-soft)', display: 'grid', placeItems: 'center', color: 'var(--ink)' } }, React.createElement(icon, { width: 19, height: 19 })),
        React.createElement('div', { style: { flex: 1 } },
          React.createElement('div', { style: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 } }, title),
          sub && React.createElement('div', { className: 'muted', style: { fontSize: 12.5, marginTop: 1 } }, sub)),
        React.createElement('button', { className: 'iconbtn', onClick: onClose }, React.createElement(Ic.x, { width: 18, height: 18 }))),
      React.createElement('div', { className: 'modal-b' }, children),
      footer && React.createElement('div', { className: 'modal-f' }, footer))
  );
}

/* ---------- PAGE HERO BANNER ---------- */
export function HeroBanner({ img, kicker, title, children }) {
  return React.createElement('div', { className: 'hero-banner' },
    React.createElement('img', { src: img, alt: '' }),
    React.createElement('div', { className: 'scrim' }),
    React.createElement('div', { className: 'hb-in' },
      kicker && React.createElement('div', { style: { fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--gold)', marginBottom: 7 } }, kicker),
      React.createElement('div', { style: { fontFamily: 'var(--font-display)', fontSize: 27, fontWeight: 700, lineHeight: 1.1, maxWidth: 560 } }, title),
      children && React.createElement('div', { style: { marginTop: 10, fontSize: 13.5, opacity: .92, maxWidth: 520 } }, children))
  );
}

/* ---------- CONTATO ---------- */
export function ContactGrid({ tel, email, endereco }) {
  const items = [
    { ic: Ic.phone, l: 'Telefone', v: tel || '—' },
    { ic: Ic.mail,  l: 'E-mail',   v: email || '—' },
    { ic: Ic.pin,   l: 'Endereço', v: endereco || '—' },
  ];
  return React.createElement('div', { className: 'contato-grid' },
    items.map((it, i) => React.createElement('div', { key: i, className: 'contato-item' },
      React.createElement('div', { className: 'ci' }, React.createElement(it.ic, { width: 16, height: 16 })),
      React.createElement('div', { style: { minWidth: 0 } },
        React.createElement('div', { className: 'cl' }, it.l),
        React.createElement('div', { className: 'cv' }, it.v)))));
}

/* ---------- SEG VIEW TOGGLE (Lista / Kanban) ---------- */
export function segView(view, setView) {
  return React.createElement('div', { className: 'seg' },
    React.createElement('button', { className: view === 'kanban' ? 'on' : '', onClick: () => setView('kanban') }, React.createElement(Ic.board, {}), 'Kanban'),
    React.createElement('button', { className: view === 'lista' ? 'on' : '', onClick: () => setView('lista') }, React.createElement(Ic.list, {}), 'Lista'));
}

/* ---------- EXPORTAR CSV (abre no Excel) ---------- */
export function exportCSV(filename, headers, rows) {
  const esc = (v) => { v = v == null ? '' : String(v); return /[";\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
  const sep = ';';
  const lines = [headers.map(esc).join(sep), ...rows.map(r => r.map(esc).join(sep))];
  const csv = '﻿' + lines.join('\r\n');
  const blob = new Blob([csv], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename.replace(/\.(xlsx?|csv)$/i, '') + '.csv';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
