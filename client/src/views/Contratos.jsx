import React, { useState, useEffect } from "react";
import { Ic, Modal, Kpi } from "../components.jsx";
import { fmtBRL } from "../format.js";
import { api } from "../api.js";

const ICON_MAP = { doc: Ic.doc, sign: Ic.sign, split: Ic.split, lock: Ic.lock, hand: Ic.hand };

export default function ViewContratos() {
  const [tab, setTab] = useState('ativos');
  const [contratos, setContratos] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [preview, setPreview] = useState(null);

  useEffect(() => { api.contratos().then(setContratos).catch(() => {}); api.modelosContrato().then(setModelos).catch(() => {}); }, []);

  const stBadge = (s) => s === 'Finalizado' ? 'b-ok' : s === 'Assinado' ? 'b-info' : s === 'Em revisão' ? 'b-warn' : 'b-ink';

  return React.createElement('div', null,
    React.createElement('div', { className: 'tabs' },
      [['ativos', 'Contratos em andamento'], ['modelos', 'Modelos & termos padrão']].map(t =>
        React.createElement('button', { key: t[0], className: tab === t[0] ? 'on' : '', onClick: () => setTab(t[0]) }, t[1]))),

    tab === 'ativos' && React.createElement('div', null,
      React.createElement('div', { className: 'grid', style: { gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 20 } },
        React.createElement(Kpi, { icon: Ic.doc, iconBg: 'var(--brand-soft)', iconColor: 'var(--ink)', label: 'Contratos ativos', value: contratos.length }),
        React.createElement(Kpi, { icon: Ic.check, iconBg: 'var(--ok-bg)', iconColor: 'var(--ok)', label: 'Assinados', value: contratos.filter(c => c.status === 'Assinado' || c.status === 'Finalizado').length }),
        React.createElement(Kpi, { icon: Ic.bell, iconBg: 'var(--warn-bg)', iconColor: 'var(--warn)', label: 'Pendentes / revisão', value: contratos.filter(c => c.status === 'Pendente' || c.status === 'Em revisão').length }),
        React.createElement(Kpi, { icon: Ic.lock, iconBg: 'var(--magenta-soft)', iconColor: 'var(--magenta)', label: 'Com exclusividade', value: contratos.filter(c => c.exclusivo).length })),
      React.createElement('div', { className: 'card' },
        React.createElement('table', { className: 'tbl' },
          React.createElement('thead', null, React.createElement('tr', null, ['Nº', 'Tipo de instrumento', 'Parte', 'Imóvel', 'Assinatura', 'Status', 'Valor', ''].map((h, i) => React.createElement('th', { key: i, className: i === 6 ? 'right' : '' }, h)))),
          React.createElement('tbody', null, contratos.map(c =>
            React.createElement('tr', { key: c.id },
              React.createElement('td', { className: 'num', style: { color: 'var(--ink-3)' } }, c.codigo),
              React.createElement('td', null, React.createElement('div', { className: 'row', style: { gap: 8 } }, React.createElement(Ic.doc, { width: 16, height: 16, style: { color: 'var(--ink-3)' } }), React.createElement('span', { style: { fontWeight: 600 } }, c.tipo))),
              React.createElement('td', null, c.parte_nome),
              React.createElement('td', null, c.imovel_titulo ? React.createElement('span', { title: c.imovel_titulo }, c.imovel_codigo) : '—'),
              React.createElement('td', { className: 'num', style: { fontSize: 12.5 } }, c.data_assinatura || '—'),
              React.createElement('td', null, React.createElement('span', { className: 'badge ' + stBadge(c.status) }, c.status)),
              React.createElement('td', { className: 'num right' }, fmtBRL(c.valor)),
              React.createElement('td', { className: 'right' }, React.createElement('button', { className: 'iconbtn', style: { width: 30, height: 30 }, onClick: () => setPreview(c) }, React.createElement(Ic.eye, { width: 15, height: 15 }))))
          )))
      )),

    tab === 'modelos' && React.createElement('div', null,
      React.createElement('div', { className: 'between', style: { marginBottom: 16 } },
        React.createElement('p', { className: 'muted', style: { margin: 0, maxWidth: 560, fontSize: 13 } }, 'Modelos padronizados. Geram contratos pré-preenchidos a partir dos dados do imóvel.'),
        React.createElement('button', { className: 'btn btn-dark' }, React.createElement(Ic.plus, {}), 'Novo modelo')),
      React.createElement('div', { className: 'grid', style: { gridTemplateColumns: 'repeat(2,1fr)' } },
        modelos.map((m) => React.createElement('div', { key: m.id, className: 'card card-pad', style: { display: 'flex', gap: 14 } },
          React.createElement('div', { style: { width: 46, height: 46, borderRadius: 12, background: 'var(--brand-wash)', border: '1px solid var(--brand-soft)', display: 'grid', placeItems: 'center', color: 'var(--ink)', flex: 'none' } }, React.createElement(ICON_MAP[m.icone] || Ic.doc, { width: 22, height: 22 })),
          React.createElement('div', { style: { flex: 1 } },
            React.createElement('div', { className: 'between' }, React.createElement('h3', { style: { margin: 0, fontSize: 14.5, fontWeight: 700 } }, m.nome), React.createElement('span', { className: 'badge b-ink' }, m.usos, ' usos')),
            React.createElement('p', { className: 'muted', style: { fontSize: 12.5, margin: '7px 0 13px', lineHeight: 1.45 } }, m.descricao),
            React.createElement('div', { className: 'row', style: { gap: 8 } },
              React.createElement('button', { className: 'btn btn-ghost btn-sm', onClick: () => setPreview({ tipo: m.nome, modelo: true }) }, React.createElement(Ic.eye, {}), 'Visualizar'),
              React.createElement('button', { className: 'btn btn-primary btn-sm' }, React.createElement(Ic.doc, {}), 'Gerar')))))
      )),

    preview && React.createElement(Modal, { title: preview.tipo, sub: preview.modelo ? 'Modelo padrão' : preview.codigo + ' · ' + preview.parte_nome, icon: Ic.doc, onClose: () => setPreview(null),
      footer: React.createElement(React.Fragment, null,
        React.createElement('button', { className: 'btn btn-ghost', onClick: () => setPreview(null) }, 'Fechar'),
        React.createElement('button', { className: 'btn btn-primary' }, React.createElement(Ic.sign, {}), 'Enviar para assinatura')) },
      React.createElement('div', { style: { background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 12, padding: '26px 28px', fontFamily: 'var(--font-display)' } },
        React.createElement('div', { style: { textAlign: 'center', marginBottom: 20 } },
          React.createElement('div', { style: { fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '.04em' } }, preview.tipo),
          React.createElement('div', { className: 'muted', style: { fontSize: 12, fontFamily: 'var(--font-ui)', marginTop: 4 } }, 'RL Imóveis · Intermediação Imobiliária · Florianópolis/SC')),
        React.createElement('div', { style: { fontFamily: 'var(--font-ui)', fontSize: 13, lineHeight: 1.7, color: 'var(--ink-2)' } },
          React.createElement('p', null, 'Pelo presente instrumento particular, ', React.createElement('b', null, preview.parte_nome || '[PROPRIETÁRIO]'), ', doravante denominado(a) CONTRATANTE, e a ', React.createElement('b', null, 'RL Imóveis'), ', doravante INTERMEDIADORA, têm entre si justo e acordado o seguinte:'),
          React.createElement('p', null, React.createElement('b', null, 'Cláusula 1ª — Do objeto.'), ' Autorização para intermediação da venda do imóvel ', preview.imovel_titulo || '[IMÓVEL]', ', incluindo a divulgação em portais, redes sociais e a captação de interessados.'),
          React.createElement('p', null, React.createElement('b', null, 'Cláusula 2ª — Da remuneração.'), ' Comissão de intermediação de 5% a 6% sobre o valor efetivo da transação, devida na assinatura do contrato de compra e venda.'),
          React.createElement('p', { className: 'muted' }, '[...] demais cláusulas geradas automaticamente conforme o modelo padrão e os dados do imóvel.')))
    )
  );
}
