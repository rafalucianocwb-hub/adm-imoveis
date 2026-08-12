import React, { useState, useEffect } from "react";
import { Ic, Modal, Avatar, CanalBadge, ContactGrid } from "../components.jsx";
import { fmtBRL, fmtBRLk, ETAPAS } from "../format.js";
import { api } from "../api.js";
import { useRefData } from "../store.js";

function NovoNegocioModal({ onClose, onSave, imoveis, corretores }) {
  const [f, setF] = useState({ cliente: '', tel: '', email: '', imovel: imoveis[0]?.id || '', valor: String(imoveis[0]?.preco || ''), origem: 'Instagram', etapa: 'lead', corretor: corretores[0]?.nome || '', prob: '15', obs: '' });
  const [erro, setErro] = useState('');
  const set = (k) => (e) => setF(s => ({ ...s, [k]: e.target.value }));
  const setImovel = (e) => { const im = imoveis.find(i => i.id === e.target.value); setF(s => ({ ...s, imovel: e.target.value, valor: String(im?.preco || '') })); };
  const campo = (label, el) => React.createElement('div', { className: 'field' }, React.createElement('label', null, label), el);
  const salvar = () => {
    if (!f.cliente.trim()) { setErro('Informe o nome do cliente.'); return; }
    const v = parseFloat(String(f.valor).replace(/\./g, '').replace(',', '.')) || 0;
    onSave({ clienteNome: f.cliente.trim(), telefone: f.tel, email: f.email, imovelId: f.imovel, valor: Math.round(v),
      etapa: f.etapa, origem: f.origem, corretorNome: f.corretor, probabilidade: parseInt(f.prob) || 10, observacao: f.obs || 'Prospect criado manualmente' });
  };
  return React.createElement(Modal, { title: 'Novo negócio', sub: 'Cadastre um prospect para venda no funil', icon: Ic.pipe, onClose,
    footer: React.createElement(React.Fragment, null,
      React.createElement('button', { className: 'btn btn-ghost', onClick: onClose }, 'Cancelar'),
      React.createElement('button', { className: 'btn btn-primary', onClick: salvar }, React.createElement(Ic.check, {}), 'Criar negócio')) },
    React.createElement('div', { className: 'grid', style: { gridTemplateColumns: '1fr 1fr', gap: '0 14px' } },
      campo('Nome do cliente', React.createElement('input', { value: f.cliente, onChange: set('cliente'), placeholder: 'Nome completo', autoFocus: true })),
      campo('Telefone / WhatsApp', React.createElement('input', { value: f.tel, onChange: set('tel'), placeholder: '(48) 9____-____' }))),
    campo('E-mail', React.createElement('input', { type: 'email', value: f.email, onChange: set('email'), placeholder: 'cliente@email.com' })),
    campo('Imóvel de interesse', React.createElement('select', { value: f.imovel, onChange: setImovel }, imoveis.map(im => React.createElement('option', { key: im.id, value: im.id }, im.codigo + ' · ' + im.titulo)))),
    React.createElement('div', { className: 'grid', style: { gridTemplateColumns: '1fr 1fr', gap: '0 14px' } },
      campo('Valor do negócio (R$)', React.createElement('input', { value: f.valor, onChange: set('valor'), inputMode: 'decimal' })),
      campo('Origem do lead', React.createElement('select', { value: f.origem, onChange: set('origem') }, ['Instagram', 'Google', 'Marketplace', 'Indicação', 'Direto'].map(t => React.createElement('option', { key: t }, t))))),
    React.createElement('div', { className: 'grid', style: { gridTemplateColumns: '1fr 1fr 1fr', gap: '0 14px' } },
      campo('Etapa inicial', React.createElement('select', { value: f.etapa, onChange: set('etapa') }, ETAPAS.filter(e => e.id !== 'ganho').map(e => React.createElement('option', { key: e.id, value: e.id }, e.nome)))),
      campo('Probabilidade (%)', React.createElement('input', { value: f.prob, onChange: set('prob'), inputMode: 'numeric' })),
      campo('Corretor', React.createElement('select', { value: f.corretor, onChange: set('corretor') }, corretores.map(c => React.createElement('option', { key: c.nome }, c.nome))))),
    campo('Observação / próxima ação', React.createElement('textarea', { value: f.obs, onChange: set('obs'), rows: 2, placeholder: 'Ex.: Agendar visita, enviar proposta…' })),
    erro && React.createElement('div', { style: { background: 'var(--bad-bg)', color: 'var(--bad)', fontSize: 12.5, fontWeight: 600, padding: '9px 12px', borderRadius: 9, marginTop: 8 } }, erro)
  );
}

export default function ViewPipeline() {
  const { imoveis, corretores, corCorretor } = useRefData();
  const [view, setView] = useState('kanban');
  const [deals, setDeals] = useState([]);
  const [filtro, setFiltro] = useState('Todos');
  const [drag, setDrag] = useState(null);
  const [sel, setSel] = useState(null);
  const [novo, setNovo] = useState(false);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState(null);

  const load = () => api.negocios().then(setDeals).catch(() => {});
  useEffect(() => { load(); }, []);
  useEffect(() => { const h = () => setNovo(true); window.addEventListener('rl-novo', h); return () => window.removeEventListener('rl-novo', h); }, []);

  const abrirSel = (d) => { setSel(d); setForm({ ...d }); setEdit(false); };
  const salvarEdicao = () => {
    const v = parseFloat(String(form.valor).replace(/\./g, '').replace(',', '.')) || 0;
    api.editNegocio(sel.id, { valor: Math.round(v), probabilidade: parseInt(form.prob) || 0, origem: form.origem, corretorNome: form.corretor,
      telefone: form.telefone, email: form.email, endereco: form.endereco, etapa: form.etapa, observacao: form.ultima_atividade })
      .then(atualizado => { setDeals(ds => ds.map(d => d.id === sel.id ? atualizado : d)); setSel(atualizado); setForm(atualizado); setEdit(false); });
  };
  const avancarEtapa = () => {
    const seq = ETAPAS.filter(e => e.id !== 'semretorno');
    const i = seq.findIndex(e => e.id === sel.etapa);
    const prox = seq[Math.min(i + 1, seq.length - 1)];
    api.moverEtapa(sel.id, prox.id).then(atualizado => { setDeals(ds => ds.map(d => d.id === sel.id ? atualizado : d)); setSel(atualizado); setForm(atualizado); });
  };
  const marcarSemRetorno = () => {
    api.semRetorno(sel.id).then(atualizado => { setDeals(ds => ds.map(d => d.id === sel.id ? atualizado : d)); setSel(atualizado); setForm(atualizado); });
  };

  const origens = ['Todos', 'Instagram', 'Google', 'Marketplace', 'Indicação'];
  const fdeals = filtro === 'Todos' ? deals : deals.filter(d => d.origem === filtro);

  const moveTo = (id, etapa) => { setDeals(ds => ds.map(d => d.id === id ? { ...d, etapa } : d)); api.moverEtapa(id, etapa).catch(load); };
  const prob = (p) => p >= 80 ? 'b-ok' : p >= 50 ? 'b-warn' : 'b-info';

  const totalAberto = fdeals.filter(d => d.etapa !== 'ganho').reduce((s, d) => s + d.valor, 0);
  const ganhoTotal = fdeals.filter(d => d.etapa === 'ganho').reduce((s, d) => s + d.valor, 0);

  function KCard({ d }) {
    return React.createElement('div', { className: 'kcard' + (drag === d.id ? ' drag' : ''), draggable: true,
        onDragStart: () => setDrag(d.id), onDragEnd: () => setDrag(null), onClick: () => abrirSel(d) },
      React.createElement('div', { className: 'ktop' },
        React.createElement('div', { style: { flex: 1 } },
          React.createElement('div', { className: 'ktitle' }, d.cliente_nome),
          React.createElement('div', { className: 'ksub' }, d.imovel_titulo || d.imovel_codigo || '—')),
        React.createElement('span', { className: 'badge ' + prob(d.probabilidade), style: { fontSize: 10.5 } }, d.probabilidade, '%')),
      React.createElement('div', { className: 'kval' }, fmtBRL(d.valor)),
      React.createElement('div', { className: 'kmeta' },
        React.createElement(CanalBadge, { canal: d.origem }),
        React.createElement('div', { style: { marginLeft: 'auto' } }, React.createElement(Avatar, { name: d.corretor_nome || '—', cor: corCorretor(d.corretor_nome) }))));
  }

  return React.createElement('div', null,
    React.createElement('div', { className: 'between wrap', style: { marginBottom: 20, gap: 12 } },
      React.createElement('div', { className: 'row wrap', style: { gap: 8 } },
        origens.map(o => React.createElement('button', { key: o, className: 'pill-filter' + (filtro === o ? ' on' : ''), onClick: () => setFiltro(o) },
          o !== 'Todos' && React.createElement(Ic.tag, { width: 13, height: 13 }), o))),
      React.createElement('div', { className: 'row', style: { gap: 12 } },
        React.createElement('div', { className: 'seg' },
          React.createElement('button', { className: view === 'kanban' ? 'on' : '', onClick: () => setView('kanban') }, React.createElement(Ic.board, {}), 'Kanban'),
          React.createElement('button', { className: view === 'lista' ? 'on' : '', onClick: () => setView('lista') }, React.createElement(Ic.list, {}), 'Lista')),
        React.createElement('button', { className: 'btn btn-primary', onClick: () => setNovo(true) }, React.createElement(Ic.plus, {}), 'Novo negócio'))),

    React.createElement('div', { className: 'row', style: { gap: 24, marginBottom: 18, paddingBottom: 16, borderBottom: '1px solid var(--line)' } },
      React.createElement('div', null, React.createElement('div', { className: 'muted', style: { fontSize: 11.5, fontWeight: 600 } }, 'Valor em pipeline'), React.createElement('div', { style: { fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700 } }, fmtBRLk(totalAberto))),
      React.createElement('div', null, React.createElement('div', { className: 'muted', style: { fontSize: 11.5, fontWeight: 600 } }, 'Fechado / ganho'), React.createElement('div', { style: { fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--ok)' } }, fmtBRLk(ganhoTotal))),
      React.createElement('div', null, React.createElement('div', { className: 'muted', style: { fontSize: 11.5, fontWeight: 600 } }, 'Negócios ativos'), React.createElement('div', { style: { fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700 } }, fdeals.filter(d => d.etapa !== 'ganho').length))),

    view === 'kanban' && React.createElement('div', { className: 'kanban' },
      ETAPAS.map(et => {
        const col = fdeals.filter(d => d.etapa === et.id);
        const soma = col.reduce((s, d) => s + d.valor, 0);
        return React.createElement('div', { key: et.id, className: 'kcol',
            onDragOver: e => e.preventDefault(), onDrop: () => { if (drag) moveTo(drag, et.id); setDrag(null); } },
          React.createElement('div', { className: 'kcol-h' },
            React.createElement('span', { className: 'kdot', style: { background: et.cor } }),
            React.createElement('span', { className: 'kt' }, et.nome),
            React.createElement('span', { className: 'kc' }, col.length)),
          React.createElement('div', { style: { padding: '0 13px 6px', fontSize: 11, fontWeight: 700, color: 'var(--ink-3)' } }, soma ? fmtBRLk(soma) : '—'),
          React.createElement('div', { className: 'kcol-b' },
            col.length ? col.map(d => React.createElement(KCard, { key: d.id, d })) : React.createElement('div', { style: { padding: '18px 4px', textAlign: 'center', fontSize: 11.5, color: 'var(--ink-4)' } }, 'Solte aqui')));
      })),

    view === 'lista' && React.createElement('div', { className: 'card' },
      React.createElement('table', { className: 'tbl' },
        React.createElement('thead', null, React.createElement('tr', null,
          ['Negócio', 'Cliente', 'Imóvel', 'Etapa', 'Origem', 'Corretor', 'Prob.', 'Valor'].map(h => React.createElement('th', { key: h, className: h === 'Valor' ? 'right' : '' }, h)))),
        React.createElement('tbody', null,
          fdeals.map(d => { const et = ETAPAS.find(e => e.id === d.etapa);
            return React.createElement('tr', { key: d.id, onClick: () => abrirSel(d), style: { cursor: 'pointer' } },
              React.createElement('td', { className: 'num', style: { color: 'var(--ink-3)' } }, d.codigo),
              React.createElement('td', null, React.createElement('b', null, d.cliente_nome)),
              React.createElement('td', null, d.imovel_titulo || d.imovel_codigo || '—'),
              React.createElement('td', null, React.createElement('span', { className: 'badge b-ink', style: { background: et.cor + '22', color: et.cor } }, React.createElement('span', { className: 'dot' }), et.nome)),
              React.createElement('td', null, React.createElement(CanalBadge, { canal: d.origem })),
              React.createElement('td', null, React.createElement('div', { className: 'row', style: { gap: 7 } }, React.createElement(Avatar, { name: d.corretor_nome || '—', cor: corCorretor(d.corretor_nome) }), React.createElement('span', { style: { fontSize: 12.5 } }, (d.corretor_nome || '—').split(' ')[0]))),
              React.createElement('td', null, React.createElement('span', { className: 'badge ' + prob(d.probabilidade) }, d.probabilidade, '%')),
              React.createElement('td', { className: 'num right' }, fmtBRL(d.valor)));
          }))
      )),

    sel && React.createElement(Modal, { title: sel.cliente_nome, sub: sel.codigo + ' · ' + (sel.imovel_titulo || sel.imovel_codigo || ''), icon: Ic.pipe, onClose: () => setSel(null),
      footer: React.createElement(React.Fragment, null,
        React.createElement('button', { className: 'btn btn-ghost', onClick: () => setSel(null) }, 'Fechar'),
        edit
          ? React.createElement('button', { className: 'btn btn-primary', onClick: salvarEdicao }, React.createElement(Ic.check, {}), 'Salvar')
          : React.createElement(React.Fragment, null,
              sel.etapa !== 'semretorno' && sel.etapa !== 'ganho' && React.createElement('button', { className: 'btn btn-ghost', onClick: marcarSemRetorno }, React.createElement(Ic.clock, {}), 'Sem retorno'),
              React.createElement('button', { className: 'btn btn-ghost', onClick: () => setEdit(true) }, 'Editar'),
              sel.etapa !== 'ganho' && React.createElement('button', { className: 'btn btn-primary', onClick: avancarEtapa }, React.createElement(Ic.arrow, {}), 'Avançar etapa'))) },

      edit
        ? React.createElement('div', null,
            React.createElement('div', { className: 'grid', style: { gridTemplateColumns: '1fr 1fr', gap: '0 14px' } },
              React.createElement('div', { className: 'field' }, React.createElement('label', null, 'Valor do negócio (R$)'), React.createElement('input', { value: form.valor, onChange: e => setForm(f => ({ ...f, valor: e.target.value })) })),
              React.createElement('div', { className: 'field' }, React.createElement('label', null, 'Probabilidade (%)'), React.createElement('input', { value: form.prob ?? form.probabilidade, onChange: e => setForm(f => ({ ...f, prob: e.target.value })) }))),
            React.createElement('div', { className: 'grid', style: { gridTemplateColumns: '1fr 1fr', gap: '0 14px' } },
              React.createElement('div', { className: 'field' }, React.createElement('label', null, 'Origem do lead'), React.createElement('select', { value: form.origem, onChange: e => setForm(f => ({ ...f, origem: e.target.value })) }, ['Instagram', 'Google', 'Marketplace', 'Indicação', 'Direto'].map(t => React.createElement('option', { key: t }, t)))),
              React.createElement('div', { className: 'field' }, React.createElement('label', null, 'Corretor responsável'), React.createElement('select', { value: form.corretor ?? form.corretor_nome, onChange: e => setForm(f => ({ ...f, corretor: e.target.value })) }, corretores.map(c => React.createElement('option', { key: c.nome }, c.nome))))),
            React.createElement('div', { className: 'grid', style: { gridTemplateColumns: '1fr 1fr', gap: '0 14px' } },
              React.createElement('div', { className: 'field' }, React.createElement('label', null, 'Telefone'), React.createElement('input', { value: form.telefone || '', onChange: e => setForm(f => ({ ...f, telefone: e.target.value })) })),
              React.createElement('div', { className: 'field' }, React.createElement('label', null, 'E-mail'), React.createElement('input', { value: form.email || '', onChange: e => setForm(f => ({ ...f, email: e.target.value })) }))),
            React.createElement('div', { className: 'field' }, React.createElement('label', null, 'Endereço'), React.createElement('input', { value: form.endereco || '', onChange: e => setForm(f => ({ ...f, endereco: e.target.value })) })),
            React.createElement('div', { className: 'field' }, React.createElement('label', null, 'Etapa'), React.createElement('select', { value: form.etapa, onChange: e => setForm(f => ({ ...f, etapa: e.target.value })) }, ETAPAS.map(e => React.createElement('option', { key: e.id, value: e.id }, e.nome)))),
            React.createElement('div', { className: 'field' }, React.createElement('label', null, 'Observação / última atividade'), React.createElement('textarea', { rows: 2, value: form.ultima_atividade || '', onChange: e => setForm(f => ({ ...f, ultima_atividade: e.target.value })) })))
        : React.createElement(React.Fragment, null,
      React.createElement('div', { className: 'grid', style: { gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 } },
        [['Valor do negócio', fmtBRL(sel.valor)], ['Probabilidade', sel.probabilidade + '%'], ['Origem do lead', sel.origem], ['Corretor responsável', sel.corretor_nome || '—']].map((r, i) =>
          React.createElement('div', { key: i, style: { background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 10, padding: '11px 13px' } },
            React.createElement('div', { className: 'muted', style: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em' } }, r[0]),
            React.createElement('div', { style: { fontWeight: 700, fontSize: 15, marginTop: 3 } }, r[1])))),
      React.createElement('div', { style: { fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--ink-2)' } }, 'Contato do lead'),
      React.createElement('div', { style: { marginBottom: 18 } }, React.createElement(ContactGrid, { tel: sel.telefone, email: sel.email, endereco: sel.endereco })),
      sel.etapa === 'semretorno'
        ? React.createElement('div', { style: { background: 'var(--bad-bg)', color: 'var(--bad)', borderRadius: 10, padding: '12px 14px', marginBottom: 18, fontWeight: 600, fontSize: 13 } }, 'Este cliente está marcado como Sem Retorno. Use "Editar" para reativar em outra etapa.')
        : React.createElement(React.Fragment, null,
            React.createElement('div', { style: { fontSize: 12, fontWeight: 700, marginBottom: 10, color: 'var(--ink-2)' } }, 'Etapa atual do funil'),
            React.createElement('div', { className: 'fases', style: { marginBottom: 18 } },
              ETAPAS.filter(e => e.id !== 'semretorno').map((e, i) => { const cur = ETAPAS.filter(x => x.id !== 'semretorno').findIndex(x => x.id === sel.etapa);
                return React.createElement('div', { key: e.id, className: 'fase' + (i < cur ? ' done' : i === cur ? ' current' : '') },
                  React.createElement('div', { className: 'ring' }, i < cur ? React.createElement(Ic.check, { width: 14, height: 14, strokeWidth: 3 }) : i + 1),
                  React.createElement('div', { className: 'flbl' }, e.nome)); }))),
      React.createElement('div', { style: { background: 'var(--brand-wash)', border: '1px solid var(--brand-soft)', borderRadius: 10, padding: '12px 14px' } },
        React.createElement('div', { className: 'row', style: { gap: 8 } }, React.createElement(Ic.bell, { width: 15, height: 15 }), React.createElement('b', { style: { fontSize: 12.5 } }, 'Última atividade')),
        React.createElement('div', { style: { fontSize: 13, marginTop: 5 } }, sel.ultima_atividade))
    )),

    novo && React.createElement(NovoNegocioModal, { imoveis, corretores, onClose: () => setNovo(false), onSave: (body) => api.addNegocio(body).then(d => { setDeals(ds => [d, ...ds]); setNovo(false); }) })
  );
}
