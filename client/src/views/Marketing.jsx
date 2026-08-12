import React, { useState, useEffect } from "react";
import { Ic, Modal, Kpi, CanalBadge, AreaChart, Donut } from "../components.jsx";
import { fmtBRL, fmtBRLk } from "../format.js";
import { api } from "../api.js";

const ORIGENS_TRAFEGO = [
  { fonte: 'Instagram (Orgânico+Ads)', pct: 38, cor: '#B0543C' },
  { fonte: 'Google (Search+Display)', pct: 29, cor: '#2E7D8C' },
  { fonte: 'Direto / WhatsApp', pct: 16, cor: '#13674E' },
  { fonte: 'Marketplaces (ZAP/OLX)', pct: 11, cor: '#C2913C' },
  { fonte: 'Indicação', pct: 6, cor: '#3F8F5B' },
];

export default function ViewMarketing() {
  const [obj, setObj] = useState('Todos');
  const [sel, setSel] = useState(null);
  const [campanhas, setCampanhas] = useState([]);
  const [analytics, setAnalytics] = useState({ trafego: [], leads: [] });

  useEffect(() => { api.campanhas().then(setCampanhas).catch(() => {}); api.siteAnalytics().then(setAnalytics).catch(() => {}); }, []);

  const objetivos = ['Todos', 'Vender Imóveis', 'Angariar Imóveis'];
  const camps = obj === 'Todos' ? campanhas : campanhas.filter(c => c.objetivo === obj);

  const tot = campanhas.reduce((a, c) => ({ gasto: a.gasto + c.gasto, leads: a.leads + c.leads, receita: a.receita + c.receita, conv: a.conv + c.conversoes }), { gasto: 0, leads: 0, receita: 0, conv: 0 });
  const roas = tot.gasto ? tot.receita / tot.gasto : 0;
  const cpl = tot.leads ? tot.gasto / tot.leads : 0;

  const roiPct = (c) => c.receita ? Math.round((c.receita - c.gasto) / c.gasto * 100) : null;
  const cplC = (c) => c.leads ? Math.round(c.gasto / c.leads) : 0;
  const ctr = (c) => c.impressoes ? (c.cliques / c.impressoes * 100) : 0;

  const totalTrafego = analytics.trafego.reduce((a, b) => a + b, 0);
  const totalLeads = analytics.leads.reduce((a, b) => a + b, 0);

  return React.createElement('div', null,
    React.createElement('div', { className: 'grid', style: { gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 20 } },
      React.createElement(Kpi, { icon: Ic.money, iconBg: 'var(--ink)', iconColor: '#fff', label: 'Investimento total', value: fmtBRLk(tot.gasto), delta: 'período atual', deltaDir: 'flat' }),
      React.createElement(Kpi, { icon: Ic.chart, iconBg: 'var(--ok-bg)', iconColor: 'var(--ok)', label: 'ROAS médio', value: roas.toFixed(1) + '×', delta: 'receita / gasto', deltaDir: 'up' }),
      React.createElement(Kpi, { icon: Ic.users, iconBg: 'var(--magenta-soft)', iconColor: 'var(--magenta)', label: 'Leads gerados', value: tot.leads.toLocaleString('pt-BR'), delta: 'CPL R$ ' + Math.round(cpl), deltaDir: 'flat' }),
      React.createElement(Kpi, { icon: Ic.flag, iconBg: 'var(--ocean-soft)', iconColor: 'var(--ocean-deep)', label: 'Conversões (vendas)', value: tot.conv, delta: fmtBRLk(tot.receita) + ' receita', deltaDir: 'up' })),

    React.createElement('div', { className: 'grid', style: { gridTemplateColumns: '1.6fr 1fr', marginBottom: 20 } },
      React.createElement('div', { className: 'card card-pad' },
        React.createElement('div', { className: 'card-h' }, React.createElement('h3', null, 'Acessos ao site & geração de leads'), React.createElement('span', { className: 'hint' }, 'últimos 14 dias')),
        analytics.trafego.length > 0 && React.createElement(AreaChart, { data: analytics.trafego, data2: analytics.leads.map(v => v * 30), color: '#1FA7BD', color2: '#F5C518', h: 180 }),
        React.createElement('div', { className: 'legend', style: { marginTop: 14 } },
          React.createElement('span', null, React.createElement('i', { style: { background: '#1FA7BD' } }), 'Acessos · ', totalTrafego.toLocaleString('pt-BR'), ' no período'),
          React.createElement('span', null, React.createElement('i', { style: { background: '#F5C518' } }), 'Leads · ', totalLeads, ' no período'),
          React.createElement('span', null, React.createElement('i', { style: { background: 'var(--ink-3)' } }), 'Conversão ', totalTrafego ? (totalLeads / totalTrafego * 100).toFixed(1) : '0', '%'))),
      React.createElement('div', { className: 'card card-pad' },
        React.createElement('div', { className: 'card-h' }, React.createElement('h3', null, 'Origem do tráfego')),
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 20 } },
          React.createElement(Donut, { segments: ORIGENS_TRAFEGO, size: 138, thickness: 20, center: React.createElement('div', null, React.createElement('div', { style: { fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700 } }, '18,2k'), React.createElement('div', { className: 'muted', style: { fontSize: 10.5, fontWeight: 600 } }, 'visitas/mês')) }),
          React.createElement('div', { style: { flex: 1, display: 'flex', flexDirection: 'column', gap: 9 } },
            ORIGENS_TRAFEGO.map((o, i) => React.createElement('div', { key: i, className: 'row', style: { gap: 9, fontSize: 12 } },
              React.createElement('span', { style: { width: 9, height: 9, borderRadius: 3, background: o.cor, flex: 'none' } }),
              React.createElement('span', { style: { flex: 1 } }, o.fonte),
              React.createElement('b', null, o.pct, '%'))))))),

    React.createElement('div', { className: 'between', style: { marginBottom: 14 } },
      React.createElement('div', { className: 'row wrap', style: { gap: 8 } },
        objetivos.map(o => React.createElement('button', { key: o, className: 'pill-filter' + (obj === o ? ' on' : ''), onClick: () => setObj(o) }, o))),
      React.createElement('button', { className: 'btn btn-primary' }, React.createElement(Ic.plus, {}), 'Criar campanha')),

    React.createElement('div', { className: 'card' },
      React.createElement('table', { className: 'tbl' },
        React.createElement('thead', null, React.createElement('tr', null, ['Campanha', 'Canal', 'Objetivo', 'Invest.', 'CTR', 'Leads', 'CPL', 'Conv.', 'Receita', 'ROI', ''].map((h, i) => React.createElement('th', { key: i, className: [3, 4, 5, 6, 7, 8, 9].includes(i) ? 'right' : '' }, h)))),
        React.createElement('tbody', null, camps.map(c => { const roi = roiPct(c);
          return React.createElement('tr', { key: c.id, style: { cursor: 'pointer' }, onClick: () => setSel(c) },
            React.createElement('td', null, React.createElement('div', null, React.createElement('div', { style: { fontWeight: 600 } }, c.nome), React.createElement('div', { className: 'muted', style: { fontSize: 11 } }, c.codigo, ' · ', c.periodo))),
            React.createElement('td', null, React.createElement(CanalBadge, { canal: c.canal })),
            React.createElement('td', null, React.createElement('span', { className: 'badge ' + (c.objetivo === 'Vender Imóveis' ? 'b-brand' : 'b-mag') }, c.objetivo)),
            React.createElement('td', { className: 'num right' }, fmtBRLk(c.gasto)),
            React.createElement('td', { className: 'num right' }, ctr(c).toFixed(1), '%'),
            React.createElement('td', { className: 'num right' }, c.leads),
            React.createElement('td', { className: 'num right' }, 'R$ ', cplC(c)),
            React.createElement('td', { className: 'num right' }, c.conversoes),
            React.createElement('td', { className: 'num right' }, c.receita ? fmtBRLk(c.receita) : '—'),
            React.createElement('td', { className: 'right' }, roi !== null ? React.createElement('span', { className: 'badge ' + (roi > 0 ? 'b-ok' : 'b-bad') }, roi > 0 ? '+' : '', roi, '%') : React.createElement('span', { className: 'muted' }, '—')),
            React.createElement('td', null, React.createElement('span', { className: 'badge ' + (c.status === 'Ativa' ? 'b-ok' : c.status === 'Pausada' ? 'b-warn' : 'b-ink') }, c.status)));
        })))),

    sel && React.createElement(Modal, { title: sel.nome, sub: sel.canal + ' · ' + sel.objetivo + ' · ' + sel.periodo, icon: Ic.mega, onClose: () => setSel(null),
      footer: React.createElement(React.Fragment, null,
        React.createElement('button', { className: 'btn btn-ghost', onClick: () => setSel(null) }, 'Fechar'),
        React.createElement('button', { className: 'btn btn-dark', onClick: () => api.editCampanha(sel.id, { status: sel.status === 'Ativa' ? 'Pausada' : 'Ativa' }).then(c => { setCampanhas(cs => cs.map(x => x.id === c.id ? c : x)); setSel(c); }) }, sel.status === 'Ativa' ? 'Pausar campanha' : 'Reativar'),
        React.createElement('button', { className: 'btn btn-primary' }, React.createElement(Ic.chart, {}), 'Otimizar')) },
      React.createElement('div', { className: 'grid', style: { gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 18 } },
        [['Investido', fmtBRL(sel.gasto)], ['Orçamento', fmtBRL(sel.investimento)], ['ROAS', sel.receita ? (sel.receita / sel.gasto).toFixed(1) + '×' : '—'],
         ['Impressões', (sel.impressoes / 1000).toFixed(0) + 'k'], ['Cliques', sel.cliques.toLocaleString('pt-BR')], ['CTR', ctr(sel).toFixed(2) + '%'],
         ['Leads', sel.leads], ['Custo / lead', 'R$ ' + cplC(sel)], ['Conversões', sel.conversoes]].map((r, i) =>
          React.createElement('div', { key: i, style: { background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 10, padding: '11px 13px' } },
            React.createElement('div', { className: 'muted', style: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.03em' } }, r[0]),
            React.createElement('div', { style: { fontWeight: 700, fontSize: 16, marginTop: 3, fontFamily: 'var(--font-display)' } }, r[1])))),
      React.createElement('div', { style: { background: 'var(--brand-wash)', border: '1px solid var(--brand-soft)', borderRadius: 12, padding: '14px 16px' } },
        React.createElement('div', { className: 'row', style: { gap: 8, marginBottom: 6 } }, React.createElement(Ic.chart, { width: 16, height: 16 }), React.createElement('b', { style: { fontSize: 13 } }, 'Retorno sobre investimento')),
        sel.receita ? React.createElement('div', { style: { fontSize: 13, color: 'var(--ink-2)' } }, 'Receita de ', React.createElement('b', null, fmtBRL(sel.receita)), ' a partir de ', React.createElement('b', null, fmtBRL(sel.gasto)), ' investidos — retorno líquido de ', React.createElement('b', { style: { color: 'var(--ok)' } }, fmtBRL(sel.receita - sel.gasto)), ' (ROI ', roiPct(sel), '%).')
          : React.createElement('div', { style: { fontSize: 13, color: 'var(--ink-2)' } }, 'Campanha de captação de proprietários — gerou ', React.createElement('b', null, sel.leads, ' leads'), ' a ', React.createElement('b', null, 'R$ ', cplC(sel)), '/lead, com ', React.createElement('b', null, sel.conversoes, ' imóveis'), ' angariados.')))
  );
}
