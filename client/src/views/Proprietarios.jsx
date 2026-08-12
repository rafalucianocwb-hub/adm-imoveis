import React, { useState, useEffect } from "react";
import { Ic, Modal, Kpi, CanalBadge, ContactGrid, segView } from "../components.jsx";
import { fmtBRL, fmtBRLk } from "../format.js";
import { api } from "../api.js";
import { useRefData } from "../store.js";

const STATUS = [
  { id: 'Novo', cor: '#9A968A' },
  { id: 'Qualificado', cor: '#2E7D8C' },
  { id: 'Reunião', cor: '#C2913C' },
  { id: 'Autorização', cor: '#2E9E5B' },
  { id: 'Perdido', cor: '#D24B3E' },
];

function NovoProprietarioModal({ onClose, onSave, corretores }) {
  const [f, setF] = useState({ nome: '', tel: '', email: '', origem: 'Instagram', status: 'Novo', corretor: corretores[0]?.nome || '',
    titulo: '', tipo: 'Casa', bairro: '', area: '', dorm: '', vagas: '', valor: '', comissao: '6', exclusivo: 'Exclusivo', matricula: '', obs: '' });
  const [erro, setErro] = useState('');
  const set = (k) => (e) => setF(s => ({ ...s, [k]: e.target.value }));
  const campo = (label, el) => React.createElement('div', { className: 'field' }, React.createElement('label', null, label), el);
  const secTitle = (t) => React.createElement('div', { style: { fontSize: 11, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--brand-deep)', margin: '6px 0 12px', paddingBottom: 7, borderBottom: '1px solid var(--line)' } }, t);
  const salvar = () => {
    if (!f.nome.trim()) { setErro('Informe o nome do proprietário.'); return; }
    const v = parseFloat(String(f.valor).replace(/\./g, '').replace(',', '.')) || 0;
    onSave({
      nome: f.nome.trim(), telefone: f.tel, email: f.email, origem: f.origem, status: f.status, corretorNome: f.corretor,
      titulo: f.titulo.trim() || (f.tipo + (f.bairro ? ' · ' + f.bairro : '')), tipo: f.tipo, bairro: f.bairro,
      area: parseInt(f.area) || 0, dormitorios: f.dorm ? parseInt(f.dorm) : null, vagas: parseInt(f.vagas) || 0,
      valor: Math.round(v), comissaoPct: parseFloat(f.comissao) || 5, exclusivo: f.exclusivo === 'Exclusivo', matricula: f.matricula,
    });
  };
  return React.createElement(Modal, { title: 'Novo proprietário', sub: 'Cadastre o proprietário e os dados do imóvel', icon: Ic.users, onClose,
    footer: React.createElement(React.Fragment, null,
      React.createElement('button', { className: 'btn btn-ghost', onClick: onClose }, 'Cancelar'),
      React.createElement('button', { className: 'btn btn-primary', onClick: salvar }, React.createElement(Ic.check, {}), 'Cadastrar angariação')) },

    secTitle('Dados do proprietário'),
    React.createElement('div', { className: 'grid', style: { gridTemplateColumns: '1fr 1fr', gap: '0 14px' } },
      campo('Nome do proprietário', React.createElement('input', { value: f.nome, onChange: set('nome'), placeholder: 'Nome completo', autoFocus: true })),
      campo('Telefone / WhatsApp', React.createElement('input', { value: f.tel, onChange: set('tel'), placeholder: '(48) 9____-____' }))),
    campo('E-mail', React.createElement('input', { type: 'email', value: f.email, onChange: set('email'), placeholder: 'proprietario@email.com' })),
    React.createElement('div', { className: 'grid', style: { gridTemplateColumns: '1fr 1fr', gap: '0 14px' } },
      campo('Origem do lead', React.createElement('select', { value: f.origem, onChange: set('origem') }, ['Instagram', 'Google', 'Marketplace', 'Indicação', 'Direto'].map(t => React.createElement('option', { key: t }, t)))),
      campo('Corretor responsável', React.createElement('select', { value: f.corretor, onChange: set('corretor') }, corretores.map(c => React.createElement('option', { key: c.nome }, c.nome))))),

    React.createElement('div', { style: { height: 8 } }),
    secTitle('Dados do imóvel'),
    campo('Título / descrição do imóvel', React.createElement('input', { value: f.titulo, onChange: set('titulo'), placeholder: 'Ex.: Casa Alto Padrão · 4 suítes' })),
    React.createElement('div', { className: 'grid', style: { gridTemplateColumns: '1fr 1fr', gap: '0 14px' } },
      campo('Tipo de imóvel', React.createElement('select', { value: f.tipo, onChange: set('tipo') }, ['Casa', 'Apartamento', 'Cobertura', 'Comercial', 'Terreno', 'Portfólio'].map(t => React.createElement('option', { key: t }, t)))),
      campo('Bairro / localização', React.createElement('input', { value: f.bairro, onChange: set('bairro'), placeholder: 'Ex.: Jurerê Internacional' }))),
    React.createElement('div', { className: 'grid', style: { gridTemplateColumns: '1fr 1fr 1fr', gap: '0 14px' } },
      campo('Área (m²)', React.createElement('input', { value: f.area, onChange: set('area'), inputMode: 'numeric', placeholder: '0' })),
      campo('Dormitórios', React.createElement('input', { value: f.dorm, onChange: set('dorm'), inputMode: 'numeric', placeholder: '0' })),
      campo('Vagas', React.createElement('input', { value: f.vagas, onChange: set('vagas'), inputMode: 'numeric', placeholder: '0' }))),
    React.createElement('div', { className: 'grid', style: { gridTemplateColumns: '1fr 1fr', gap: '0 14px' } },
      campo('Valor de venda / VGV (R$)', React.createElement('input', { value: f.valor, onChange: set('valor'), inputMode: 'decimal', placeholder: '0,00' })),
      campo('Comissão (%)', React.createElement('input', { value: f.comissao, onChange: set('comissao'), inputMode: 'decimal' }))),
    React.createElement('div', { className: 'grid', style: { gridTemplateColumns: '1fr 1fr', gap: '0 14px' } },
      campo('Tipo de autorização', React.createElement('select', { value: f.exclusivo, onChange: set('exclusivo') }, ['Exclusivo', 'Compartilhado'].map(t => React.createElement('option', { key: t }, t)))),
      campo('Matrícula do imóvel', React.createElement('input', { value: f.matricula, onChange: set('matricula'), placeholder: 'Nº da matrícula / cartório' }))),
    React.createElement('div', { className: 'grid', style: { gridTemplateColumns: '1fr 1fr', gap: '0 14px' } },
      campo('Status da angariação', React.createElement('select', { value: f.status, onChange: set('status') }, ['Novo', 'Qualificado', 'Reunião', 'Autorização'].map(t => React.createElement('option', { key: t }, t)))),
      React.createElement('div')),
    campo('Observação', React.createElement('textarea', { value: f.obs, onChange: set('obs'), rows: 2, placeholder: 'Motivação da venda, prazo, estado de conservação, pendências documentais…' })),
    erro && React.createElement('div', { style: { background: 'var(--bad-bg)', color: 'var(--bad)', fontSize: 12.5, fontWeight: 600, padding: '9px 12px', borderRadius: 9, marginTop: 8 } }, erro)
  );
}

function InteracoesLead({ leadId }) {
  const [itens, setItens] = useState([]);
  const [tipo, setTipo] = useState('conversa');
  const [texto, setTexto] = useState('');
  const [dataPrevista, setDataPrevista] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  const load = () => api.interacoesLead(leadId).then(setItens).catch(() => {});
  useEffect(() => { load(); }, [leadId]);

  const salvar = () => {
    if (!texto.trim()) { setErro('Escreva algo antes de salvar.'); return; }
    setErro(''); setSalvando(true);
    api.addInteracaoLead(leadId, { tipo, texto: texto.trim(), dataPrevista: tipo === 'proximo_passo' ? (dataPrevista || null) : null })
      .then(() => { setTexto(''); setDataPrevista(''); load(); })
      .catch(e => setErro(e.message))
      .finally(() => setSalvando(false));
  };

  const fmtData = (iso) => { const d = new Date(iso.replace(' ', 'T') + 'Z'); return d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); };
  const fmtDataPrevista = (s) => { const [y, m, d] = s.split('-'); return `${d}/${m}/${y}`; };

  return React.createElement('div', null,
    React.createElement('div', { style: { fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--ink-2)' } }, 'Conversas e próximos passos'),
    React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14, maxHeight: 220, overflowY: 'auto' } },
      itens.length === 0 && React.createElement('div', { style: { fontSize: 12.5, color: 'var(--ink-3)', padding: '10px 0' } }, 'Nenhum registro ainda.'),
      itens.map(it => React.createElement('div', { key: it.id, style: { background: it.tipo === 'proximo_passo' ? 'var(--brand-wash)' : 'var(--surface-2)', border: '1px solid ' + (it.tipo === 'proximo_passo' ? 'var(--brand-soft)' : 'var(--line)'), borderRadius: 10, padding: '9px 12px' } },
        React.createElement('div', { className: 'row', style: { gap: 8, marginBottom: 3, flexWrap: 'wrap' } },
          React.createElement('span', { className: 'badge ' + (it.tipo === 'proximo_passo' ? 'b-brand' : 'b-ink') },
            React.createElement(it.tipo === 'proximo_passo' ? Ic.arrow : Ic.mega, { width: 11, height: 11 }),
            it.tipo === 'proximo_passo' ? 'Próximo passo' : 'Conversa'),
          it.data_prevista && React.createElement('span', { className: 'muted', style: { fontSize: 11 } }, 'previsto para ', fmtDataPrevista(it.data_prevista)),
          React.createElement('span', { className: 'muted', style: { fontSize: 11, marginLeft: 'auto' } }, it.usuario, ' · ', fmtData(it.criado_em))),
        React.createElement('div', { style: { fontSize: 13, lineHeight: 1.4 } }, it.texto)))),
    React.createElement('div', { className: 'row', style: { gap: 8, marginBottom: 8 } },
      React.createElement('select', { value: tipo, onChange: e => setTipo(e.target.value), style: { maxWidth: 160 } },
        React.createElement('option', { value: 'conversa' }, 'Conversa'),
        React.createElement('option', { value: 'proximo_passo' }, 'Próximo passo')),
      tipo === 'proximo_passo' && React.createElement('input', { type: 'date', value: dataPrevista, onChange: e => setDataPrevista(e.target.value), style: { maxWidth: 160 } })),
    React.createElement('div', { className: 'row', style: { gap: 8, alignItems: 'flex-start' } },
      React.createElement('textarea', { value: texto, onChange: e => setTexto(e.target.value), rows: 2, style: { flex: 1 },
        placeholder: tipo === 'proximo_passo' ? 'Ex.: Ligar para confirmar interesse na proposta…' : 'Resumo da conversa com o cliente…' }),
      React.createElement('button', { className: 'btn btn-primary btn-sm', onClick: salvar, disabled: salvando, style: { flex: 'none' } }, React.createElement(Ic.plus, {}), 'Adicionar')),
    erro && React.createElement('div', { style: { background: 'var(--bad-bg)', color: 'var(--bad)', fontSize: 12, fontWeight: 600, padding: '7px 10px', borderRadius: 8, marginTop: 8 } }, erro)
  );
}

export default function ViewProprietarios({ go }) {
  const { corretores } = useRefData();
  const [leads, setLeads] = useState([]);
  const [drag, setDrag] = useState(null);
  const [view, setView] = useState('kanban');
  const [sel, setSel] = useState(null);
  const [novo, setNovo] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const load = () => api.leadsAngariacao().then(setLeads).catch(() => {});
  useEffect(() => { load(); }, []);
  useEffect(() => { const h = () => setNovo(true); window.addEventListener('rl-novo', h); return () => window.removeEventListener('rl-novo', h); }, []);

  const move = (id, status) => { setLeads(ls => ls.map(l => l.id === id ? { ...l, status } : l)); api.editLeadAngariacao(id, { status }).catch(load); };
  const totalPotencial = leads.filter(l => l.status !== 'Perdido').reduce((s, l) => s + l.valor_vgv, 0);
  const assinados = leads.filter(l => l.status === 'Autorização').length;

  const abrirSel = (l) => { setSel(l); };

  const enviarParaImoveis = () => {
    if (!sel || enviando) return;
    setEnviando(true);
    api.enviarParaImoveis(sel.id).then(({ imovelId }) => {
      setLeads(ls => ls.map(l => l.id === sel.id ? { ...l, enviado_imovel_id: imovelId } : l));
      setSel(s => ({ ...s, enviado_imovel_id: imovelId }));
      setEnviando(false);
      setSel(null);
      go && go('imoveis', imovelId);
    }).catch(() => setEnviando(false));
  };

  return React.createElement('div', null,
    React.createElement('div', { className: 'grid', style: { gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 22 } },
      React.createElement(Kpi, { icon: Ic.users, iconBg: 'var(--magenta-soft)', iconColor: 'var(--magenta)', label: 'Leads de proprietários', value: leads.length }),
      React.createElement(Kpi, { icon: Ic.check, iconBg: 'var(--ok-bg)', iconColor: 'var(--ok)', label: 'Em autorização', value: assinados }),
      React.createElement(Kpi, { icon: Ic.home, iconBg: 'var(--brand-soft)', iconColor: 'var(--ink)', label: 'Imóveis potenciais (VGV)', value: fmtBRLk(totalPotencial), delta: 'em captação', deltaDir: 'flat' }),
      React.createElement(Kpi, { icon: Ic.mega, iconBg: 'var(--ocean-soft)', iconColor: 'var(--ocean-deep)', label: 'Leads ativos', value: leads.filter(l => l.status !== 'Perdido').length })),

    React.createElement('div', { className: 'between', style: { marginBottom: 16 } },
      React.createElement('h3', { style: { margin: 0, fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700 } }, 'Esteira de angariação'),
      React.createElement('div', { className: 'row', style: { gap: 12 } },
        segView(view, setView),
        React.createElement('button', { className: 'btn btn-primary', onClick: () => setNovo(true) }, React.createElement(Ic.plus, {}), 'Novo proprietário'))),

    view === 'kanban' && React.createElement('div', { className: 'kanban' },
      STATUS.map(st => { const col = leads.filter(l => l.status === st.id);
        return React.createElement('div', { key: st.id, className: 'kcol', onDragOver: e => e.preventDefault(), onDrop: () => { if (drag) move(drag, st.id); setDrag(null); } },
          React.createElement('div', { className: 'kcol-h' }, React.createElement('span', { className: 'kdot', style: { background: st.cor } }), React.createElement('span', { className: 'kt' }, st.id), React.createElement('span', { className: 'kc' }, col.length)),
          React.createElement('div', { className: 'kcol-b' },
            col.map(l => React.createElement('div', { key: l.id, className: 'kcard' + (drag === l.id ? ' drag' : ''), draggable: true, onDragStart: () => setDrag(l.id), onDragEnd: () => setDrag(null), onClick: () => abrirSel(l) },
              React.createElement('div', { className: 'ktitle' }, l.nome),
              React.createElement('div', { className: 'ksub' }, l.imovelData?.titulo || '—'),
              React.createElement('div', { className: 'kval' }, fmtBRLk(l.valor_vgv)),
              React.createElement('div', { className: 'kmeta' },
                React.createElement(CanalBadge, { canal: l.origem }),
                React.createElement('span', { style: { marginLeft: 'auto', fontSize: 10.5, color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 3 } }, React.createElement(Ic.phone, { width: 11, height: 11 }), l.telefone)))),
            !col.length && React.createElement('div', { style: { padding: '16px 4px', textAlign: 'center', fontSize: 11.5, color: 'var(--ink-4)' } }, '—'))); })),

    view === 'lista' && React.createElement('div', { className: 'card' },
      React.createElement('table', { className: 'tbl' },
        React.createElement('thead', null, React.createElement('tr', null, ['Proprietário', 'Imóvel oferecido', 'Telefone', 'E-mail', 'Origem', 'Status', 'VGV estimado'].map((h, i) => React.createElement('th', { key: h, className: i === 6 ? 'right' : '' }, h)))),
        React.createElement('tbody', null, leads.map(l => { const st = STATUS.find(s => s.id === l.status);
          return React.createElement('tr', { key: l.id, style: { cursor: 'pointer' }, onClick: () => abrirSel(l) },
            React.createElement('td', null, React.createElement('b', null, l.nome)),
            React.createElement('td', null, l.imovelData?.titulo || '—'),
            React.createElement('td', { className: 'num', style: { fontSize: 12.5 } }, l.telefone),
            React.createElement('td', { style: { fontSize: 12.5, color: 'var(--ink-3)' } }, l.email),
            React.createElement('td', null, React.createElement(CanalBadge, { canal: l.origem })),
            React.createElement('td', null, React.createElement('span', { className: 'badge', style: { background: st.cor + '22', color: st.cor } }, React.createElement('span', { className: 'dot' }), l.status)),
            React.createElement('td', { className: 'num right' }, fmtBRL(l.valor_vgv)));
        }))) ),

    sel && React.createElement(Modal, { title: sel.nome, sub: sel.codigo + ' · ' + (sel.imovelData?.titulo || ''), icon: Ic.users, onClose: () => setSel(null),
      footer: React.createElement(React.Fragment, null,
        React.createElement('button', { className: 'btn btn-ghost', onClick: () => setSel(null) }, 'Fechar'),
        sel.status === 'Autorização' && React.createElement('button', { className: 'btn btn-primary', disabled: enviando || !!sel.enviado_imovel_id, onClick: enviarParaImoveis },
          React.createElement(Ic.home, {}), sel.enviado_imovel_id ? 'Enviado ao portfólio' : 'Enviar para Imóveis'),
        sel.status !== 'Autorização' && React.createElement('button', { className: 'btn btn-primary', onClick: () => { move(sel.id, 'Autorização'); setSel(s => ({ ...s, status: 'Autorização' })); } }, React.createElement(Ic.arrow, {}), 'Avançar status')) },
      React.createElement('div', { className: 'grid', style: { gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 } },
        [['VGV estimado', fmtBRL(sel.valor_vgv)], ['Origem do lead', sel.origem], ['Status', sel.status], ['Corretor', sel.corretor_nome || '—']].map((r, i) =>
          React.createElement('div', { key: i, style: { background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 10, padding: '11px 13px' } },
            React.createElement('div', { className: 'muted', style: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em' } }, r[0]),
            React.createElement('div', { style: { fontWeight: 700, fontSize: 15, marginTop: 3 } }, r[1])))),
      React.createElement('div', { style: { fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--ink-2)' } }, 'Imóvel oferecido'),
      sel.imovelData
        ? React.createElement('div', { style: { marginBottom: 18, background: 'var(--brand-wash)', border: '1px solid var(--brand-soft)', borderRadius: 12, padding: '13px 15px' } },
            React.createElement('div', { style: { fontWeight: 700, fontSize: 14.5, marginBottom: 8 } }, sel.imovelData.titulo),
            React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '8px 18px', fontSize: 12.5, color: 'var(--ink-2)' } },
              [['Tipo', sel.imovelData.tipo], ['Área', (sel.imovelData.area || '—') + ' m²'], ['Dorm.', sel.imovelData.dorm || '—'], ['Vagas', sel.imovelData.vagas || '—'], ['Comissão', sel.imovelData.comissao + '%'], ['Autorização', sel.imovelData.exclusivo ? 'Exclusiva' : 'Compartilhada'], ['Matrícula', sel.imovelData.matricula || '—']]
                .map((r, i) => React.createElement('span', { key: i }, React.createElement('span', { className: 'muted' }, r[0], ': '), React.createElement('b', null, r[1])))))
        : null,
      React.createElement('div', { style: { fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--ink-2)' } }, 'Contato do proprietário'),
      React.createElement('div', { style: { marginBottom: 18 } }, React.createElement(ContactGrid, { tel: sel.telefone, email: sel.email, endereco: sel.endereco })),
      React.createElement(InteracoesLead, { key: sel.id, leadId: sel.id })
    ),

    novo && React.createElement(NovoProprietarioModal, { corretores, onClose: () => setNovo(false), onSave: (body) => api.addLeadAngariacao(body).then(l => { setLeads(ls => [l, ...ls]); setNovo(false); }) })
  );
}
