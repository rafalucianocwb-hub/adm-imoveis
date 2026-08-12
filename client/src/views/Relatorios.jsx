import React, { useState, useEffect } from "react";
import { Ic, CanalBadge, exportCSV } from "../components.jsx";
import { fmtBRL, fmtBRLk, ETAPAS } from "../format.js";
import { api } from "../api.js";

export default function ViewRelatorios() {
  const [periodo, setPeriodo] = useState('Últimos 6 meses');
  const [r, setR] = useState(null);

  useEffect(() => { api.relatorios().then(setR).catch(() => {}); }, []);
  if (!r) return React.createElement('div', { className: 'empty' }, 'Carregando…');

  const finRows = r.financeiroMensal.map(m => [m.mes, m.receita, m.despesa, m.receita - m.despesa, m.receita ? ((m.receita - m.despesa) / m.receita * 100).toFixed(0) + '%' : '0%']);
  const vendasRows = r.negocios.map(n => { const et = ETAPAS.find(e => e.id === n.etapa);
    return [n.codigo, n.cliente_nome, n.imovel_titulo || n.imovel_codigo || '—', et?.nome || n.etapa, n.origem, n.corretor_nome, n.probabilidade + '%', n.valor]; });
  const tempoMax = Math.max(...r.tempoEtapas.map(t => t.dias));

  const ReportCard = ({ icon, color, bg, titulo, sub, onExport, children }) =>
    React.createElement('div', { className: 'report-card' },
      React.createElement('div', { className: 'rh' },
        React.createElement('div', { className: 'ri', style: { background: bg, color: color } }, React.createElement(icon, { width: 20, height: 20 })),
        React.createElement('div', { style: { flex: 1 } },
          React.createElement('h3', { style: { margin: 0, fontSize: 15, fontWeight: 700 } }, titulo),
          sub && React.createElement('div', { className: 'muted', style: { fontSize: 12, marginTop: 1 } }, sub)),
        React.createElement('button', { className: 'btn btn-ghost btn-sm', onClick: onExport }, React.createElement(Ic.dl, {}), 'Exportar Excel')),
      React.createElement('div', { style: { padding: '18px 20px' } }, children));

  return React.createElement('div', { className: 'grid', style: { gap: 20 } },
    React.createElement('div', { className: 'between' },
      React.createElement('div', { className: 'row', style: { gap: 8 } },
        ['Últimos 6 meses', 'Este mês', 'Este ano'].map(p => React.createElement('button', { key: p, className: 'pill-filter' + (periodo === p ? ' on' : ''), onClick: () => setPeriodo(p) }, React.createElement(Ic.cal, { width: 13, height: 13 }), p))),
      React.createElement('button', { className: 'btn btn-dark', onClick: () => {
        exportCSV('relatorio_consolidado_rl',
          ['Indicador', 'Valor'],
          [['Receita acumulada', r.totReceita], ['Despesa acumulada', r.totDespesa], ['Lucro líquido', r.totReceita - r.totDespesa],
           ['Negócios no funil', r.negocios.length], ['Vendas fechadas', r.ganhos],
           ['Tempo médio do lead (dias)', r.tempoTotal.toFixed(1)], ['Ticket médio comissão', 8240]]);
      } }, React.createElement(Ic.dl, {}), 'Exportar consolidado')),

    React.createElement(ReportCard, { icon: Ic.money, color: 'var(--ink)', bg: 'var(--brand-soft)', titulo: 'Relatório Financeiro', sub: 'Receita, despesa, lucro e margem por mês',
      onExport: () => exportCSV('relatorio_financeiro', ['Mês', 'Receita', 'Despesa', 'Lucro', 'Margem'], finRows) },
      React.createElement('div', { className: 'row', style: { gap: 28, marginBottom: 18 } },
        React.createElement('div', { className: 'bigstat' }, React.createElement('span', { className: 'bv' }, fmtBRLk(r.totReceita)), React.createElement('span', { className: 'bl' }, 'Receita acumulada')),
        React.createElement('div', { className: 'bigstat' }, React.createElement('span', { className: 'bv' }, fmtBRLk(r.totDespesa)), React.createElement('span', { className: 'bl' }, 'Despesa acumulada')),
        React.createElement('div', { className: 'bigstat' }, React.createElement('span', { className: 'bv', style: { color: 'var(--ok)' } }, fmtBRLk(r.totReceita - r.totDespesa)), React.createElement('span', { className: 'bl' }, 'Lucro líquido')),
        React.createElement('div', { className: 'bigstat' }, React.createElement('span', { className: 'bv' }, r.totReceita ? ((r.totReceita - r.totDespesa) / r.totReceita * 100).toFixed(0) + '%' : '0%'), React.createElement('span', { className: 'bl' }, 'Margem média'))),
      React.createElement('table', { className: 'tbl' },
        React.createElement('thead', null, React.createElement('tr', null, ['Mês', 'Receita', 'Despesa', 'Lucro', 'Margem'].map((h, i) => React.createElement('th', { key: h, className: i ? 'right' : '' }, h)))),
        React.createElement('tbody', null, r.financeiroMensal.map(m => React.createElement('tr', { key: m.mes },
          React.createElement('td', null, React.createElement('b', null, m.mes)),
          React.createElement('td', { className: 'num right' }, fmtBRL(m.receita)),
          React.createElement('td', { className: 'num right' }, fmtBRL(m.despesa)),
          React.createElement('td', { className: 'num right', style: { color: 'var(--ok)', fontWeight: 700 } }, fmtBRL(m.receita - m.despesa)),
          React.createElement('td', { className: 'num right' }, m.receita ? ((m.receita - m.despesa) / m.receita * 100).toFixed(0) : 0, '%'))))) ),

    React.createElement(ReportCard, { icon: Ic.pipe, color: 'var(--ocean-deep)', bg: 'var(--ocean-soft)', titulo: 'Relatório de Vendas', sub: r.negocios.length + ' negócios · ' + r.ganhos + ' fechados',
      onExport: () => exportCSV('relatorio_vendas', ['Negócio', 'Cliente', 'Imóvel', 'Etapa', 'Origem', 'Corretor', 'Prob.', 'Valor'], vendasRows) },
      React.createElement('table', { className: 'tbl' },
        React.createElement('thead', null, React.createElement('tr', null, ['Negócio', 'Cliente', 'Imóvel', 'Etapa', 'Origem', 'Valor'].map((h, i) => React.createElement('th', { key: h, className: i === 5 ? 'right' : '' }, h)))),
        React.createElement('tbody', null, r.negocios.slice(0, 8).map(n => { const et = ETAPAS.find(e => e.id === n.etapa);
          return React.createElement('tr', { key: n.id },
            React.createElement('td', { className: 'num', style: { color: 'var(--ink-3)' } }, n.codigo),
            React.createElement('td', null, React.createElement('b', null, n.cliente_nome)),
            React.createElement('td', null, n.imovel_titulo || n.imovel_codigo || '—'),
            React.createElement('td', null, React.createElement('span', { className: 'badge', style: { background: (et?.cor || '#999') + '22', color: et?.cor } }, et?.nome || n.etapa)),
            React.createElement('td', null, React.createElement(CanalBadge, { canal: n.origem })),
            React.createElement('td', { className: 'num right' }, fmtBRL(n.valor)));
        }))),
      React.createElement('div', { className: 'muted', style: { fontSize: 12, marginTop: 10 } }, 'Exibindo 8 de ', r.negocios.length, ' · exporte para ver todos.')),

    React.createElement('div', { className: 'grid', style: { gridTemplateColumns: '1fr 1fr' } },
      React.createElement(ReportCard, { icon: Ic.clock, color: 'var(--warn)', bg: 'var(--warn-bg)', titulo: 'Tempo do Lead', sub: 'Ciclo médio: ' + r.tempoTotal.toFixed(1) + ' dias do lead ao fechamento',
        onExport: () => exportCSV('tempo_do_lead', ['Transição', 'Dias médios'], r.tempoEtapas.map(t => [t.etapa, t.dias])) },
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 11 } },
          r.tempoEtapas.map((t, i) => React.createElement('div', { key: i, className: 'funnel-row', style: { marginBottom: 0 } },
            React.createElement('div', { className: 'fl', style: { width: 200, fontSize: 11.5 } }, t.etapa),
            React.createElement('div', { className: 'ftrack', style: { height: 24 } }, React.createElement('div', { className: 'ffill', style: { width: (t.dias / tempoMax * 100) + '%', background: 'var(--brand)', color: 'var(--ink)', fontSize: 11.5 } }, t.dias + 'd')))))),
      React.createElement(ReportCard, { icon: Ic.target, color: 'var(--magenta)', bg: 'var(--magenta-soft)', titulo: 'Conversão por Canal', sub: 'Leads → vendas por origem',
        onExport: () => exportCSV('conversao_por_canal', ['Canal', 'Leads', 'Vendas', 'Taxa de conversão'], r.convCanal.map(c => [c.canal, c.leads, c.vendas, c.taxa.toFixed(1) + '%'])) },
        React.createElement('table', { className: 'tbl' },
          React.createElement('thead', null, React.createElement('tr', null, ['Canal', 'Leads', 'Vendas', 'Conversão'].map((h, i) => React.createElement('th', { key: h, className: i ? 'right' : '' }, h)))),
          React.createElement('tbody', null, r.convCanal.map(c => React.createElement('tr', { key: c.canal },
            React.createElement('td', null, React.createElement(CanalBadge, { canal: c.canal })),
            React.createElement('td', { className: 'num right' }, c.leads.toLocaleString('pt-BR')),
            React.createElement('td', { className: 'num right' }, c.vendas),
            React.createElement('td', { className: 'num right' }, React.createElement('span', { className: 'badge ' + (c.taxa >= 4 ? 'b-ok' : 'b-warn') }, c.taxa.toFixed(1), '%')))))))
    )
  );
}
