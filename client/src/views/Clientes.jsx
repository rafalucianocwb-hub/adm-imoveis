import React, { useState, useEffect } from "react";
import { Ic, Modal, Kpi, Avatar, CanalBadge, ContactGrid, segView, exportCSV } from "../components.jsx";
import { fmtBRL, fmtBRLk } from "../format.js";
import { api } from "../api.js";
import { useRefData } from "../store.js";

const STATUS = [
  { id: 'Comprou', cor: '#2E9E5B' },
  { id: 'Em processo', cor: '#1FA7BD' },
  { id: 'Sem retorno', cor: '#D98A0B' },
  { id: 'Desistiu', cor: '#D24B3E' },
];

function NovoClienteModal({ onClose, onSave, imoveis, corretores }) {
  const [f, setF] = useState({ nome: '', tel: '', email: '', status: 'Em processo', imovel: imoveis[0]?.id || '', valor: String(imoveis[0]?.preco || ''), origem: 'Instagram', corretor: corretores[0]?.nome || '', obs: '' });
  const [erro, setErro] = useState('');
  const set = (k) => (e) => setF(s => ({ ...s, [k]: e.target.value }));
  const setImovel = (e) => { const im = imoveis.find(i => i.id === e.target.value); setF(s => ({ ...s, imovel: e.target.value, valor: String(im?.preco || '') })); };
  const campo = (label, el) => React.createElement('div', { className: 'field' }, React.createElement('label', null, label), el);
  const salvar = () => {
    if (!f.nome.trim()) { setErro('Informe o nome do cliente.'); return; }
    const v = parseFloat(String(f.valor).replace(/\./g, '').replace(',', '.')) || 0;
    onSave({ nome: f.nome.trim(), telefone: f.tel, email: f.email, status: f.status, imovelId: f.imovel, valor: Math.round(v), origem: f.origem, corretorNome: f.corretor, observacao: f.obs || 'Cliente cadastrado manualmente.' });
  };
  return React.createElement(Modal, { title: 'Novo cliente', sub: 'Cadastre um cliente na carteira', icon: Ic.heart, onClose,
    footer: React.createElement(React.Fragment, null,
      React.createElement('button', { className: 'btn btn-ghost', onClick: onClose }, 'Cancelar'),
      React.createElement('button', { className: 'btn btn-primary', onClick: salvar }, React.createElement(Ic.check, {}), 'Cadastrar cliente')) },
    React.createElement('div', { className: 'grid', style: { gridTemplateColumns: '1fr 1fr', gap: '0 14px' } },
      campo('Nome do cliente', React.createElement('input', { value: f.nome, onChange: set('nome'), placeholder: 'Nome completo', autoFocus: true })),
      campo('Telefone / WhatsApp', React.createElement('input', { value: f.tel, onChange: set('tel'), placeholder: '(48) 9____-____' }))),
    campo('E-mail', React.createElement('input', { type: 'email', value: f.email, onChange: set('email'), placeholder: 'cliente@email.com' })),
    React.createElement('div', { className: 'grid', style: { gridTemplateColumns: '1fr 1fr', gap: '0 14px' } },
      campo('Status', React.createElement('select', { value: f.status, onChange: set('status') }, ['Comprou', 'Em processo', 'Sem retorno', 'Desistiu'].map(t => React.createElement('option', { key: t }, t)))),
      campo('Origem', React.createElement('select', { value: f.origem, onChange: set('origem') }, ['Instagram', 'Google', 'Marketplace', 'Indicação', 'Direto'].map(t => React.createElement('option', { key: t }, t))))),
    React.createElement('div', { className: 'grid', style: { gridTemplateColumns: '1.4fr 1fr', gap: '0 14px' } },
      campo('Imóvel relacionado', React.createElement('select', { value: f.imovel, onChange: setImovel }, imoveis.map(im => React.createElement('option', { key: im.id, value: im.id }, im.codigo + ' · ' + im.titulo)))),
      campo('Valor (R$)', React.createElement('input', { value: f.valor, onChange: set('valor'), inputMode: 'decimal' }))),
    campo('Corretor responsável', React.createElement('select', { value: f.corretor, onChange: set('corretor') }, corretores.map(c => React.createElement('option', { key: c.nome }, c.nome)))),
    campo('Observação', React.createElement('textarea', { value: f.obs, onChange: set('obs'), rows: 2, placeholder: 'Histórico, preferências, próximos passos…' })),
    erro && React.createElement('div', { style: { background: 'var(--bad-bg)', color: 'var(--bad)', fontSize: 12.5, fontWeight: 600, padding: '9px 12px', borderRadius: 9, marginTop: 8 } }, erro)
  );
}

export default function ViewClientes() {
  const { imoveis, corretores, corCorretor } = useRefData();
  const [clientes, setClientes] = useState([]);
  const [view, setView] = useState('kanban');
  const [drag, setDrag] = useState(null);
  const [sel, setSel] = useState(null);
  const [novo, setNovo] = useState(false);

  const load = () => api.clientes().then(setClientes).catch(() => {});
  useEffect(() => { load(); }, []);
  useEffect(() => { const h = () => setNovo(true); window.addEventListener('rl-novo', h); return () => window.removeEventListener('rl-novo', h); }, []);

  const move = (id, status) => { setClientes(cs => cs.map(c => c.id === id ? { ...c, status } : c)); api.editCliente(id, { status }).catch(load); };
  const stCor = (s) => (STATUS.find(x => x.id === s) || {}).cor;
  const stBadge = (s) => s === 'Comprou' ? 'b-ok' : s === 'Em processo' ? 'b-info' : s === 'Sem retorno' ? 'b-warn' : 'b-bad';

  const ativos = clientes.filter(c => c.status === 'Comprou').length;
  const carteira = clientes.filter(c => c.status === 'Comprou').reduce((s, c) => s + c.valor, 0);

  const abrirSel = (c) => { setSel(c); };

  const exportar = () => exportCSV('clientes_rl_imoveis',
    ['ID', 'Nome', 'Status', 'Imóvel', 'Valor', 'Origem', 'Corretor', 'Telefone', 'E-mail', 'Endereço', 'Último contato'],
    clientes.map(c => [c.codigo, c.nome, c.status, c.imovel_titulo || c.imovel_codigo, c.valor, c.origem, c.corretor_nome, c.telefone, c.email, c.endereco, c.ultimo_contato]));

  return React.createElement('div', null,
    React.createElement('div', { className: 'grid', style: { gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 22 } },
      React.createElement(Kpi, { icon: Ic.users, iconBg: 'var(--brand-soft)', iconColor: 'var(--ink)', label: 'Total de clientes', value: clientes.length, delta: 'base ativa', deltaDir: 'flat' }),
      React.createElement(Kpi, { icon: Ic.check, iconBg: 'var(--ok-bg)', iconColor: 'var(--ok)', label: 'Compraram', value: ativos, delta: fmtBRLk(carteira) + ' em carteira', deltaDir: 'up' }),
      React.createElement(Kpi, { icon: Ic.clock, iconBg: 'var(--warn-bg)', iconColor: 'var(--warn)', label: 'Sem retorno', value: clientes.filter(c => c.status === 'Sem retorno').length, delta: 'reativar', deltaDir: 'down' }),
      React.createElement(Kpi, { icon: Ic.x, iconBg: 'var(--bad-bg)', iconColor: 'var(--bad)', label: 'Desistências', value: clientes.filter(c => c.status === 'Desistiu').length, delta: 'churn', deltaDir: 'flat' })),

    React.createElement('div', { className: 'between', style: { marginBottom: 16 } },
      React.createElement('h3', { style: { margin: 0, fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700 } }, 'Carteira de clientes'),
      React.createElement('div', { className: 'row', style: { gap: 12 } },
        segView(view, setView),
        React.createElement('button', { className: 'btn btn-ghost', onClick: exportar }, React.createElement(Ic.dl, {}), 'Exportar Excel'),
        React.createElement('button', { className: 'btn btn-primary', onClick: () => setNovo(true) }, React.createElement(Ic.plus, {}), 'Novo cliente'))),

    view === 'kanban' && React.createElement('div', { className: 'kanban' },
      STATUS.map(st => { const col = clientes.filter(c => c.status === st.id);
        return React.createElement('div', { key: st.id, className: 'kcol', style: { flex: '0 0 256px' }, onDragOver: e => e.preventDefault(), onDrop: () => { if (drag) move(drag, st.id); setDrag(null); } },
          React.createElement('div', { className: 'kcol-h' }, React.createElement('span', { className: 'kdot', style: { background: st.cor } }), React.createElement('span', { className: 'kt' }, st.id), React.createElement('span', { className: 'kc' }, col.length)),
          React.createElement('div', { className: 'kcol-b' },
            col.map(c => React.createElement('div', { key: c.id, className: 'kcard' + (drag === c.id ? ' drag' : ''), draggable: true, onDragStart: () => setDrag(c.id), onDragEnd: () => setDrag(null), onClick: () => abrirSel(c) },
              React.createElement('div', { className: 'ktop' },
                React.createElement(Avatar, { name: c.nome, cor: stCor(c.status) }),
                React.createElement('div', { style: { flex: 1, minWidth: 0 } },
                  React.createElement('div', { className: 'ktitle' }, c.nome),
                  React.createElement('div', { className: 'ksub' }, c.imovel_titulo || c.imovel_codigo || '—'))),
              React.createElement('div', { className: 'kmeta' },
                React.createElement(CanalBadge, { canal: c.origem }),
                React.createElement('span', { style: { marginLeft: 'auto', fontSize: 10.5, color: 'var(--ink-3)' } }, c.ultimo_contato)))),
            !col.length && React.createElement('div', { style: { padding: '16px 4px', textAlign: 'center', fontSize: 11.5, color: 'var(--ink-4)' } }, '—'))); })),

    view === 'lista' && React.createElement('div', { className: 'card' },
      React.createElement('table', { className: 'tbl' },
        React.createElement('thead', null, React.createElement('tr', null, ['Cliente', 'Status', 'Imóvel', 'Telefone', 'E-mail', 'Origem', 'Último contato', 'Valor'].map((h, i) => React.createElement('th', { key: h, className: i === 7 ? 'right' : '' }, h)))),
        React.createElement('tbody', null, clientes.map(c => React.createElement('tr', { key: c.id, style: { cursor: 'pointer' }, onClick: () => abrirSel(c) },
          React.createElement('td', null, React.createElement('div', { className: 'row', style: { gap: 9 } }, React.createElement(Avatar, { name: c.nome, cor: stCor(c.status) }), React.createElement('b', null, c.nome))),
          React.createElement('td', null, React.createElement('span', { className: 'badge ' + stBadge(c.status) }, c.status)),
          React.createElement('td', null, c.imovel_titulo || c.imovel_codigo || '—'),
          React.createElement('td', { className: 'num', style: { fontSize: 12.5 } }, c.telefone),
          React.createElement('td', { style: { fontSize: 12.5, color: 'var(--ink-3)' } }, c.email),
          React.createElement('td', null, React.createElement(CanalBadge, { canal: c.origem })),
          React.createElement('td', { style: { fontSize: 12.5, color: 'var(--ink-3)' } }, c.ultimo_contato),
          React.createElement('td', { className: 'num right' }, fmtBRL(c.valor)))))
      )),

    sel && React.createElement(Modal, { title: sel.nome, sub: sel.codigo + ' · cliente desde ' + sel.desde, icon: Ic.users, onClose: () => setSel(null),
      footer: React.createElement(React.Fragment, null,
        React.createElement('button', { className: 'btn btn-ghost', onClick: () => setSel(null) }, 'Fechar'),
        React.createElement('button', { className: 'btn btn-primary' }, React.createElement(Ic.whats, {}), 'Abrir WhatsApp')) },
      React.createElement('div', { className: 'row', style: { gap: 10, marginBottom: 16 } },
        React.createElement('span', { className: 'badge ' + stBadge(sel.status) }, sel.status),
        React.createElement('span', { className: 'muted', style: { fontSize: 12.5 } }, 'Imóvel: ', sel.imovel_titulo || sel.imovel_codigo, ' · ', fmtBRL(sel.valor))),
      React.createElement('div', { style: { fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--ink-2)' } }, 'Contato'),
      React.createElement('div', { style: { marginBottom: 16 } }, React.createElement(ContactGrid, { tel: sel.telefone, email: sel.email, endereco: sel.endereco })),
      React.createElement('div', { style: { background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 12, padding: '13px 15px', marginBottom: 16 } },
        React.createElement('div', { className: 'muted', style: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 5 } }, 'Observações'),
        React.createElement('div', { style: { fontSize: 13.5, lineHeight: 1.5 } }, sel.observacao))
    ),

    novo && React.createElement(NovoClienteModal, { imoveis, corretores, onClose: () => setNovo(false), onSave: (body) => api.addCliente(body).then(c => { setClientes(cs => [c, ...cs]); setNovo(false); }) })
  );
}
