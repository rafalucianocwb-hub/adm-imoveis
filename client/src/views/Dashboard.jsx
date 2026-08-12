import React, { useState, useEffect } from "react";
import { Ic, Kpi, HeroBanner, AreaChart } from "../components.jsx";
import { fmtBRLk } from "../format.js";
import { api } from "../api.js";

export default function ViewDashboard({ go }) {
  const [d, setD] = useState(null);

  useEffect(() => { api.dashboard().then(setD).catch(() => {}); }, []);

  if (!d) return React.createElement('div', { className: 'empty' }, 'Carregando…');

  const funMax = d.funilView[0]?.n || 1;

  return React.createElement('div', { className: 'grid', style: { gap: 20 } },
    React.createElement(HeroBanner, { img: '/assets/urban/skyline.jpg', kicker: 'RL Imóveis', title: 'Bem-vindo de volta.' },
      'Você tem ', React.createElement('b', null, d.imoveisMaisProcurados.reduce((s, im) => s + (im.propostas || 0), 0), ' propostas'), ' em imóveis ativos e ',
      React.createElement('b', null, d.pipelineTotal ? fmtBRLk(d.pipelineTotal) : 'R$ 0'), ' em pipeline aberto.'),

    React.createElement('div', { className: 'grid', style: { gridTemplateColumns: 'repeat(4,1fr)' } },
      React.createElement(Kpi, { icon: Ic.money, iconBg: 'var(--brand-soft)', iconColor: 'var(--ink)', label: 'Receita do mês', value: fmtBRLk(d.receitaMes), delta: 'atual', deltaDir: 'flat' }),
      React.createElement(Kpi, { icon: Ic.chart, iconBg: 'var(--ok-bg)', iconColor: 'var(--ok)', label: 'Lucro líquido (mês)', value: fmtBRLk(d.lucroMes), delta: 'atual', deltaDir: 'up' }),
      React.createElement(Kpi, { icon: Ic.pipe, iconBg: 'var(--ocean-soft)', iconColor: 'var(--ocean-deep)', label: 'Pipeline em aberto', value: fmtBRLk(d.pipelineTotal), delta: 'negócios ativos', deltaDir: 'flat' }),
      React.createElement(Kpi, { icon: Ic.home, iconBg: 'var(--magenta-soft)', iconColor: 'var(--magenta)', label: 'Imóveis ativos', value: d.imoveisAtivos, delta: `+${d.imoveisRecentes} recentes`, deltaDir: 'up' })
    ),

    React.createElement('div', { className: 'ministrip' },
      React.createElement('div', { className: 'ministat' },
        React.createElement('div', { className: 'mi', style: { background: 'var(--brand-soft)', color: 'var(--ink)' } }, React.createElement(Ic.users, { width: 21, height: 21 })),
        React.createElement('div', null,
          React.createElement('div', { className: 'mv' }, d.novosLeads7d),
          React.createElement('div', { className: 'ml' }, 'Novos leads · últimos 7 dias'))),
      React.createElement('div', { className: 'ministat' },
        React.createElement('div', { className: 'mi', style: { background: 'var(--ocean-soft)', color: 'var(--ocean-deep)' } }, React.createElement(Ic.pipe, { width: 21, height: 21 })),
        React.createElement('div', null,
          React.createElement('div', { className: 'mv' }, d.emNegociacao),
          React.createElement('div', { className: 'ml' }, 'Em negociação agora'))),
      React.createElement('div', { className: 'ministat' },
        React.createElement('div', { className: 'mi', style: { background: 'var(--warn-bg)', color: 'var(--warn)' } }, React.createElement(Ic.clock, { width: 21, height: 21 })),
        React.createElement('div', null,
          React.createElement('div', { className: 'mv' }, d.clientesSemRetorno7d),
          React.createElement('div', { className: 'ml' }, 'Clientes sem retorno')))
    ),

    React.createElement('div', { className: 'grid', style: { gridTemplateColumns: '1.5fr 1fr' } },
      React.createElement('div', { className: 'card card-pad' },
        React.createElement('div', { className: 'between', style: { marginBottom: 6 } },
          React.createElement('div', { className: 'card-h', style: { margin: 0 } }, React.createElement('h3', null, 'Performance do site'),
            React.createElement('span', { className: 'hint' }, 'Acessos × leads · últimos 14 dias')),
          React.createElement('button', { className: 'btn btn-ghost btn-sm', onClick: () => go('marketing') }, 'Ver detalhes', React.createElement(Ic.arrow, {}))),
        React.createElement(AreaChart, { data: d.siteTrafego, data2: d.siteLeads.map(v => v * 30), color: '#1FA7BD', color2: '#F5C518', h: 170 }),
        React.createElement('div', { className: 'legend', style: { marginTop: 14 } },
          React.createElement('span', null, React.createElement('i', { style: { background: '#1FA7BD' } }), 'Acessos (', (d.siteTrafego.at(-1) || 0).toLocaleString('pt-BR'), '/dia)'),
          React.createElement('span', null, React.createElement('i', { style: { background: '#F5C518' } }), 'Leads gerados (', d.siteLeads.at(-1) || 0, '/dia)'))
      ),
      React.createElement('div', { className: 'card card-pad' },
        React.createElement('div', { className: 'card-h' }, React.createElement('h3', null, 'Funil de conversão'),
          React.createElement('span', { className: 'hint' }, '30 dias')),
        d.funilView.map((f, i) => React.createElement('div', { className: 'funnel-row', key: i },
          React.createElement('div', { className: 'fl' }, f.nome),
          React.createElement('div', { className: 'ftrack' },
            React.createElement('div', { className: 'ffill', style: { width: Math.max(14, f.n / funMax * 100) + '%', background: f.cor } })),
          React.createElement('div', { className: 'fv' }, f.n.toLocaleString('pt-BR'))))
      )
    ),

    React.createElement('div', { className: 'grid', style: { gridTemplateColumns: '1.3fr 1fr' } },
      React.createElement('div', { className: 'card card-pad' },
        React.createElement('div', { className: 'between', style: { marginBottom: 14 } },
          React.createElement('h3', { style: { margin: 0, fontSize: 15, fontWeight: 700 } }, 'Imóveis com mais procura'),
          React.createElement('button', { className: 'btn btn-ghost btn-sm', onClick: () => go('imoveis') }, 'Todos')),
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 2 } },
          d.imoveisMaisProcurados.map(im =>
            React.createElement('div', { key: im.id, className: 'row', style: { padding: '9px 0', borderBottom: '1px solid var(--line-2)', cursor: 'pointer' }, onClick: () => go('imoveis', im.id) },
              React.createElement('img', { src: im.foto_url, className: 'th', style: { width: 50, height: 40, borderRadius: 8, objectFit: 'cover' } }),
              React.createElement('div', { style: { flex: 1, minWidth: 0 } },
                React.createElement('div', { style: { fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, im.titulo),
                React.createElement('div', { className: 'muted', style: { fontSize: 11.5 } }, im.tipo)),
              React.createElement('div', { style: { textAlign: 'right' } },
                React.createElement('div', { className: 'row', style: { gap: 5, justifyContent: 'flex-end', fontSize: 12.5, fontWeight: 700 } }, React.createElement(Ic.eye, { width: 14, height: 14, style: { color: 'var(--ocean-deep)' } }), im.acessos.toLocaleString('pt-BR')),
                React.createElement('div', { className: 'muted', style: { fontSize: 11 } }, im.propostas, ' propostas')))))
      ),
      React.createElement('div', { className: 'card card-pad' },
        React.createElement('h3', { style: { margin: '0 0 14px', fontSize: 15, fontWeight: 700 } }, 'Processo — atenção agora'),
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 11 } },
          [
            { b: 'b-warn', t: 'Confira imóveis próximos do cartório/registro', s: 'Fase 7 do processo' },
            { b: 'b-info', t: 'Negócios em documentação aguardando retorno', s: 'Etapa Documentação' },
            { b: 'b-bad', t: 'Propostas pendentes de resposta', s: 'Verifique o funil de vendas' },
            { b: 'b-ok', t: 'Autorizações de venda assinadas recentemente', s: 'Ver em Contratos' },
          ].map((r, i) => React.createElement('div', { key: i, className: 'row', style: { gap: 11, alignItems: 'flex-start' } },
            React.createElement('span', { className: 'badge ' + r.b, style: { marginTop: 1 } }, React.createElement('span', { className: 'dot' })),
            React.createElement('div', null,
              React.createElement('div', { style: { fontSize: 13, fontWeight: 600, lineHeight: 1.3 } }, r.t),
              React.createElement('div', { className: 'muted', style: { fontSize: 11.5 } }, r.s)))))
      )
    )
  );
}
