import React, { useState, useEffect } from "react";
import { Ic, Modal, Avatar } from "../components.jsx";
import { fmtBRL, FASES } from "../format.js";
import { api } from "../api.js";
import { useRefData } from "../store.js";

const FOTOS = ['casa-padrao.jpg', 'apto-vista.jpg', 'cobertura.jpg', 'condominio.jpg', 'garden.jpg', 'comercial.jpg', 'casa-praia.jpg'].map(f => `/assets/urban/${f}`);

function AngariarImovelModal({ onClose, onSave, corretores }) {
  const [step, setStep] = useState(1);
  const [f, setF] = useState({
    titulo: '', tipo: 'Casa', bairro: '', cidade: 'Florianópolis/SC', area: '', dorm: '', vagas: '', preco: '', comissao: '6', exclusivo: 'Exclusivo', foto: FOTOS[0],
    proprietario: '', tel: '', email: '', corretor: corretores[0]?.nome || '', matricula: '', obs: ''
  });
  const [erro, setErro] = useState('');
  const set = (k) => (e) => setF(s => ({ ...s, [k]: e.target.value }));
  const campo = (label, el, hint) => React.createElement('div', { className: 'field' }, React.createElement('label', null, label), el, hint && React.createElement('div', { className: 'muted', style: { fontSize: 11, marginTop: 4 } }, hint));

  const salvar = () => {
    if (!f.titulo.trim()) { setErro('Informe o título/anúncio do imóvel.'); setStep(1); return; }
    if (!f.proprietario.trim()) { setErro('Informe o nome do proprietário.'); setStep(2); return; }
    const preco = parseFloat(String(f.preco).replace(/\./g, '').replace(',', '.')) || 0;
    onSave({
      titulo: f.titulo.trim(), tipo: f.tipo, bairro: f.bairro, cidade: f.cidade,
      area: parseInt(f.area) || 0, dormitorios: f.dorm ? parseInt(f.dorm) : null, vagas: parseInt(f.vagas) || 0,
      preco: Math.round(preco), proprietarioNome: f.proprietario.trim(), proprietarioTel: f.tel, proprietarioEmail: f.email,
      corretorNome: f.corretor, exclusivo: f.exclusivo === 'Exclusivo', comissaoPct: parseFloat(f.comissao) || 5,
      fotoUrl: f.foto, matricula: f.matricula,
    });
  };

  const stepDot = (n, label) => React.createElement('div', { className: 'row', style: { gap: 8 } },
    React.createElement('div', { style: { width: 24, height: 24, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 800, flex: 'none',
      background: step >= n ? 'var(--brand)' : 'var(--line-2)', color: step >= n ? '#fff' : 'var(--ink-3)' } }, step > n ? '✓' : n),
    React.createElement('span', { style: { fontSize: 12.5, fontWeight: 700, color: step >= n ? 'var(--ink)' : 'var(--ink-3)' } }, label));

  return React.createElement(Modal, { title: 'Angariar imóvel', sub: 'Cadastro de imóvel e proprietário para venda', icon: Ic.home, onClose,
    footer: React.createElement(React.Fragment, null,
      step === 2 && React.createElement('button', { className: 'btn btn-ghost', onClick: () => { setErro(''); setStep(1); }, style: { marginRight: 'auto' } }, '← Voltar'),
      React.createElement('button', { className: 'btn btn-ghost', onClick: onClose }, 'Cancelar'),
      step === 1
        ? React.createElement('button', { className: 'btn btn-primary', onClick: () => { if (!f.titulo.trim()) { setErro('Informe o título do imóvel.'); return; } setErro(''); setStep(2); } }, 'Continuar', React.createElement(Ic.arrow, {}))
        : React.createElement('button', { className: 'btn btn-primary', onClick: salvar }, React.createElement(Ic.check, {}), 'Angariar imóvel')) },

    React.createElement('div', { className: 'row', style: { gap: 18, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--line)' } },
      stepDot(1, 'Dados do imóvel'),
      React.createElement('div', { style: { flex: 1, height: 2, background: 'var(--line-2)' } }),
      stepDot(2, 'Dados do proprietário')),

    step === 1 && React.createElement('div', null,
      campo('Título do anúncio', React.createElement('input', { value: f.titulo, onChange: set('titulo'), placeholder: 'Ex.: Casa Alto Padrão · 4 suítes', autoFocus: true })),
      React.createElement('div', { className: 'grid', style: { gridTemplateColumns: '1fr 1fr', gap: '0 14px' } },
        campo('Tipo de imóvel', React.createElement('select', { value: f.tipo, onChange: set('tipo') }, ['Casa', 'Apartamento', 'Cobertura', 'Comercial', 'Terreno'].map(t => React.createElement('option', { key: t }, t)))),
        campo('Bairro', React.createElement('input', { value: f.bairro, onChange: set('bairro'), placeholder: 'Ex.: Jurerê Internacional' }))),
      React.createElement('div', { className: 'grid', style: { gridTemplateColumns: '1fr 1fr 1fr', gap: '0 14px' } },
        campo('Área (m²)', React.createElement('input', { value: f.area, onChange: set('area'), inputMode: 'numeric', placeholder: '0' })),
        campo('Dormitórios', React.createElement('input', { value: f.dorm, onChange: set('dorm'), inputMode: 'numeric', placeholder: '0' })),
        campo('Vagas', React.createElement('input', { value: f.vagas, onChange: set('vagas'), inputMode: 'numeric', placeholder: '0' }))),
      React.createElement('div', { className: 'grid', style: { gridTemplateColumns: '1fr 1fr', gap: '0 14px' } },
        campo('Preço de venda (R$)', React.createElement('input', { value: f.preco, onChange: set('preco'), inputMode: 'decimal', placeholder: '0,00' })),
        campo('Comissão (%)', React.createElement('input', { value: f.comissao, onChange: set('comissao'), inputMode: 'decimal' }))),
      React.createElement('div', { className: 'grid', style: { gridTemplateColumns: '1fr 1fr', gap: '0 14px' } },
        campo('Tipo de autorização', React.createElement('select', { value: f.exclusivo, onChange: set('exclusivo') }, ['Exclusivo', 'Compartilhado'].map(t => React.createElement('option', { key: t }, t)))),
        campo('Matrícula do imóvel', React.createElement('input', { value: f.matricula, onChange: set('matricula'), placeholder: 'Nº da matrícula / cartório' }))),
      campo('Imagem de capa', React.createElement('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } },
        FOTOS.map(src => React.createElement('button', { key: src, onClick: () => setF(s => ({ ...s, foto: src })),
          style: { padding: 0, border: f.foto === src ? '2px solid var(--brand)' : '2px solid transparent', borderRadius: 9, overflow: 'hidden', lineHeight: 0, boxShadow: f.foto === src ? '0 0 0 2px var(--brand-soft)' : 'none' } },
          React.createElement('img', { src, style: { width: 62, height: 46, objectFit: 'cover', display: 'block' } }))))) ),

    step === 2 && React.createElement('div', null,
      React.createElement('div', { className: 'grid', style: { gridTemplateColumns: '1fr 1fr', gap: '0 14px' } },
        campo('Nome do proprietário', React.createElement('input', { value: f.proprietario, onChange: set('proprietario'), placeholder: 'Nome completo', autoFocus: true })),
        campo('Telefone / WhatsApp', React.createElement('input', { value: f.tel, onChange: set('tel'), placeholder: '(48) 9____-____' }))),
      campo('E-mail', React.createElement('input', { type: 'email', value: f.email, onChange: set('email'), placeholder: 'proprietario@email.com' })),
      campo('Corretor responsável pela captação', React.createElement('select', { value: f.corretor, onChange: set('corretor') }, corretores.map(c => React.createElement('option', { key: c.nome }, c.nome)))),
      campo('Observações da angariação', React.createElement('textarea', { value: f.obs, onChange: set('obs'), rows: 3, placeholder: 'Motivação da venda, prazo desejado, estado de conservação, pendências documentais…' })),
      React.createElement('div', { style: { background: 'var(--brand-wash)', border: '1px solid var(--brand-soft)', borderRadius: 10, padding: '11px 14px', fontSize: 12.5, color: 'var(--ink-2)' } },
        React.createElement('b', null, 'Próximo passo: '), 'ao angariar, o imóvel entra na fase ', React.createElement('b', null, '1 · Angariação'), ' e você poderá gerar a autorização de venda na ficha do imóvel.')),

    erro && React.createElement('div', { style: { background: 'var(--bad-bg)', color: 'var(--bad)', fontSize: 12.5, fontWeight: 600, padding: '9px 12px', borderRadius: 9, marginTop: 12 } }, erro)
  );
}

export default function ViewImoveis({ initialId, clearInitial }) {
  const { corretores, refresh } = useRefData();
  const [imoveis, setImoveis] = useState([]);
  const [sel, setSel] = useState(null);
  const [tipo, setTipo] = useState('Todos');
  const [view, setView] = useState('grid');
  const [novo, setNovo] = useState(false);

  const load = () => api.imoveis().then(setImoveis).catch(() => {});
  useEffect(() => { load(); }, []);
  useEffect(() => { const h = () => setNovo(true); window.addEventListener('rl-novo', h); return () => window.removeEventListener('rl-novo', h); }, []);
  useEffect(() => { if (initialId) { api.imovel(initialId).then(setSel).catch(() => {}); clearInitial && clearInitial(); } }, [initialId]);

  const tipos = ['Todos', 'Casa', 'Apartamento', 'Cobertura', 'Comercial'];
  const lista = tipo === 'Todos' ? imoveis : imoveis.filter(i => i.tipo === tipo);

  const faseBadge = (f) => { const done = f >= 8; return React.createElement('span', { className: 'badge ' + (done ? 'b-ok' : f >= 5 ? 'b-info' : 'b-brand') }, FASES[f - 1]); };

  if (sel) return React.createElement(ImovelDetalhe, { im: sel, onBack: () => setSel(null), onChange: (upd) => { setSel(upd); setImoveis(list => list.map(i => i.id === upd.id ? upd : i)); },
    onDelete: () => { setSel(null); setImoveis(list => list.filter(i => i.id !== sel.id)); } });

  return React.createElement('div', null,
    React.createElement('div', { className: 'between wrap', style: { marginBottom: 20, gap: 12 } },
      React.createElement('div', { className: 'row wrap', style: { gap: 8 } },
        tipos.map(t => React.createElement('button', { key: t, className: 'pill-filter' + (tipo === t ? ' on' : ''), onClick: () => setTipo(t) }, t))),
      React.createElement('div', { className: 'row', style: { gap: 12 } },
        React.createElement('div', { className: 'seg' },
          React.createElement('button', { className: view === 'grid' ? 'on' : '', onClick: () => setView('grid') }, React.createElement(Ic.board, {}), 'Cards'),
          React.createElement('button', { className: view === 'lista' ? 'on' : '', onClick: () => setView('lista') }, React.createElement(Ic.list, {}), 'Lista')),
        React.createElement('button', { className: 'btn btn-primary', onClick: () => setNovo(true) }, React.createElement(Ic.plus, {}), 'Angariar imóvel'))),

    view === 'grid' && React.createElement('div', { className: 'grid', style: { gridTemplateColumns: 'repeat(3,1fr)' } },
      lista.map(im => React.createElement('div', { key: im.id, className: 'card', style: { overflow: 'hidden', cursor: 'pointer' }, onClick: () => setSel(im) },
        React.createElement('div', { style: { position: 'relative', height: 158 } },
          React.createElement('img', { src: im.foto_url, style: { width: '100%', height: '100%', objectFit: 'cover' } }),
          React.createElement('div', { style: { position: 'absolute', top: 11, left: 11, display: 'flex', gap: 6 } },
            im.exclusivo && React.createElement('span', { className: 'badge b-brand', style: { boxShadow: 'var(--shadow-sm)' } }, React.createElement(Ic.lock, { width: 11, height: 11 }), 'Exclusivo')),
          React.createElement('div', { style: { position: 'absolute', top: 11, right: 11 } }, React.createElement('span', { className: 'badge', style: { background: 'rgba(27,33,30,.82)', color: '#fff' } }, React.createElement(Ic.tag, { width: 11, height: 11 }), im.tipo)),
          React.createElement('div', { style: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 14px 11px', background: 'linear-gradient(transparent,rgba(20,18,12,.82))', color: '#fff' } },
            React.createElement('div', { style: { fontSize: 11, opacity: .85, display: 'flex', alignItems: 'center', gap: 4 } }, React.createElement(Ic.pin, { width: 12, height: 12 }), (im.bairro ? im.bairro + ' · ' : '') + im.cidade))),
        React.createElement('div', { style: { padding: '14px 16px 16px' } },
          React.createElement('div', { className: 'between', style: { alignItems: 'flex-start' } },
            React.createElement('div', { style: { fontWeight: 700, fontSize: 14.5, lineHeight: 1.25, flex: 1 } }, im.titulo),
            React.createElement('span', { className: 'num', style: { fontSize: 11, color: 'var(--ink-3)', fontWeight: 700, marginLeft: 8 } }, im.codigo)),
          React.createElement('div', { className: 'row', style: { gap: 14, margin: '10px 0 12px', color: 'var(--ink-3)', fontSize: 12 } },
            React.createElement('span', null, React.createElement('b', { style: { color: 'var(--ink)' } }, im.area), ' m²'),
            im.dormitorios && React.createElement('span', null, React.createElement('b', { style: { color: 'var(--ink)' } }, im.dormitorios), ' dorm.'),
            React.createElement('span', { className: 'row', style: { gap: 4 } }, React.createElement(Ic.eye, { width: 13, height: 13 }), im.acessos.toLocaleString('pt-BR'))),
          React.createElement('div', { className: 'between', style: { paddingTop: 12, borderTop: '1px solid var(--line-2)' } },
            React.createElement('div', null, React.createElement('div', { style: { fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 700 } }, fmtBRL(im.preco))),
            faseBadge(im.fase))))
      )),

    view === 'lista' && React.createElement('div', { className: 'card' },
      React.createElement('table', { className: 'tbl' },
        React.createElement('thead', null, React.createElement('tr', null, ['Imóvel', 'Proprietário', 'Fase do processo', 'Acessos', 'Propostas', 'Comissão', 'Valor'].map((h, i) => React.createElement('th', { key: h, className: i === 6 ? 'right' : '' }, h)))),
        React.createElement('tbody', null,
          lista.map(im => React.createElement('tr', { key: im.id, style: { cursor: 'pointer' }, onClick: () => setSel(im) },
            React.createElement('td', null, React.createElement('div', { className: 'imovel-cell' }, React.createElement('img', { src: im.foto_url, className: 'th' }), React.createElement('div', null, React.createElement('div', { className: 'tt' }, im.titulo), React.createElement('div', { className: 'ss' }, im.codigo, ' · ', im.tipo)))),
            React.createElement('td', null, im.proprietario_nome || '—'),
            React.createElement('td', null, faseBadge(im.fase)),
            React.createElement('td', { className: 'num' }, im.acessos.toLocaleString('pt-BR')),
            React.createElement('td', { className: 'num' }, im.propostas),
            React.createElement('td', { className: 'num' }, im.comissao_pct, '%'),
            React.createElement('td', { className: 'num right' }, fmtBRL(im.preco)))))
      )),

    novo && React.createElement(AngariarImovelModal, { corretores, onClose: () => setNovo(false), onSave: (body) => api.addImovel(body).then(im => { setImoveis(list => [im, ...list]); setNovo(false); setSel(im); refresh(); }) })
  );
}

function ImovelDetalhe({ im, onBack, onChange, onDelete }) {
  const [tab, setTab] = useState('processo');
  const comissaoVal = im.preco * im.comissao_pct / 100;

  const avancarFase = () => api.avancarFase(im.id).then(onChange);
  const excluirImovel = () => {
    if (!window.confirm(`Excluir o imóvel "${im.titulo}" (${im.codigo})? Essa ação não pode ser desfeita.`)) return;
    api.delImovel(im.id).then(onDelete).catch(e => alert(e.message));
  };

  return React.createElement('div', null,
    React.createElement('button', { className: 'btn btn-ghost btn-sm', style: { marginBottom: 16 }, onClick: onBack },
      React.createElement(Ic.arrow, { style: { transform: 'rotate(180deg)' } }), 'Voltar ao portfólio'),

    React.createElement('div', { className: 'grid', style: { gridTemplateColumns: '1.4fr 1fr', gap: 20, marginBottom: 20 } },
      React.createElement('div', { className: 'card', style: { overflow: 'hidden' } },
        React.createElement('div', { style: { position: 'relative', height: 280 } },
          React.createElement('img', { src: im.foto_url, style: { width: '100%', height: '100%', objectFit: 'cover' } }),
          React.createElement('div', { style: { position: 'absolute', top: 14, left: 14, display: 'flex', gap: 7 } },
            im.exclusivo && React.createElement('span', { className: 'badge b-brand' }, React.createElement(Ic.lock, { width: 11, height: 11 }), 'Exclusivo'),
            React.createElement('span', { className: 'badge', style: { background: 'rgba(27,33,30,.82)', color: '#fff' } }, im.tipo)))),
      React.createElement('div', { className: 'card card-pad' },
        React.createElement('div', { className: 'muted', style: { fontSize: 12, fontWeight: 700 } }, im.codigo, ' · ', im.tipo),
        React.createElement('h2', { style: { fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, margin: '4px 0 8px', lineHeight: 1.15 } }, im.titulo),
        React.createElement('div', { className: 'row muted', style: { gap: 5, fontSize: 13, marginBottom: 16 } }, React.createElement(Ic.pin, { width: 14, height: 14 }), (im.bairro ? im.bairro + ' · ' : '') + im.cidade),
        React.createElement('div', { style: { fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, marginBottom: 4 } }, fmtBRL(im.preco)),
        React.createElement('div', { className: 'muted', style: { fontSize: 12.5, marginBottom: 18 } }, 'Comissão ', im.comissao_pct, '% · ', React.createElement('b', { style: { color: 'var(--ink)' } }, fmtBRL(comissaoVal))),
        React.createElement('div', { className: 'grid', style: { gridTemplateColumns: '1fr 1fr', gap: 10 } },
          [['Área', im.area + ' m²'], ['Dormitórios', im.dormitorios || '—'], ['Vagas', im.vagas || '—'], ['Acessos no site', im.acessos.toLocaleString('pt-BR')]].map((r, i) =>
            React.createElement('div', { key: i, style: { background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 10, padding: '10px 12px' } },
              React.createElement('div', { className: 'muted', style: { fontSize: 11, fontWeight: 700 } }, r[0]),
              React.createElement('div', { style: { fontWeight: 700, fontSize: 15, marginTop: 2 } }, r[1]))),
          React.createElement('div', { style: { gridColumn: '1/3', background: 'var(--brand-wash)', border: '1px solid var(--brand-soft)', borderRadius: 10, padding: '10px 12px' } },
            React.createElement('div', { className: 'muted', style: { fontSize: 11, fontWeight: 700 } }, 'Propostas ativas'),
            React.createElement('div', { style: { fontWeight: 700, fontSize: 14, marginTop: 2 } }, React.createElement(Ic.hand, { width: 14, height: 14, style: { verticalAlign: '-2px', marginRight: 4 } }), im.propostas, ' propostas · ', im.favoritos, ' favoritaram'))),
        React.createElement('div', { className: 'row', style: { gap: 9, marginTop: 18 } },
          React.createElement('button', { className: 'btn btn-primary', style: { flex: 1, justifyContent: 'center' } }, React.createElement(Ic.mega, {}), 'Anunciar'),
          im.fase < 8 && React.createElement('button', { className: 'btn btn-dark', style: { flex: 1, justifyContent: 'center' }, onClick: avancarFase }, React.createElement(Ic.arrow, {}), 'Avançar fase')),
        React.createElement('button', { className: 'btn btn-ghost', style: { width: '100%', justifyContent: 'center', marginTop: 9, color: 'var(--bad)' }, onClick: excluirImovel }, React.createElement(Ic.x, {}), 'Excluir imóvel')
      )),

    React.createElement('div', { className: 'tabs' },
      [['processo', 'Fases do processo'], ['proprietario', 'Proprietário'], ['atividade', 'Atividade & propostas']].map(t =>
        React.createElement('button', { key: t[0], className: tab === t[0] ? 'on' : '', onClick: () => setTab(t[0]) }, t[1]))),

    tab === 'processo' && React.createElement('div', { className: 'card card-pad' },
      React.createElement('div', { className: 'between', style: { marginBottom: 22 } },
        React.createElement('h3', { style: { margin: 0, fontSize: 15, fontWeight: 700 } }, 'Ciclo de venda — da angariação à finalização'),
        React.createElement('span', { className: 'badge b-info' }, 'Fase ', im.fase, '/8 · ', FASES[im.fase - 1])),
      React.createElement('div', { className: 'fases', style: { marginBottom: 26 } },
        FASES.map((f, i) => { const n = i + 1; const cls = n < im.fase ? 'done' : n === im.fase ? 'current' : '';
          return React.createElement('div', { key: f, className: 'fase ' + cls },
            React.createElement('div', { className: 'ring' }, n < im.fase ? React.createElement(Ic.check, { width: 14, height: 14, strokeWidth: 3 }) : n),
            React.createElement('div', { className: 'flbl' }, f)); })),
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 0 } },
        FASES.map((f, i) => { const n = i + 1; const st = n < im.fase ? 'concluída' : n === im.fase ? 'em andamento' : 'pendente';
          const desc = [
            'Lead do proprietário captado e qualificado pela equipe.',
            'Autorização de venda assinada pelo proprietário.',
            'Anúncio publicado no site, Instagram e marketplaces.',
            'Interessados enviaram propostas formais de compra.',
            'Negociação de valor e condições com o comprador.',
            'Conferência de certidões, matrícula e documentação.',
            'Lavratura de escritura e registro no cartório.',
            'Venda concluída, comissão recebida e cliente integrado.'
          ][i];
          return React.createElement('div', { key: f, className: 'row', style: { gap: 13, padding: '12px 0', borderBottom: i < 8 ? '1px solid var(--line-2)' : 'none', opacity: n > im.fase ? .55 : 1 } },
            React.createElement('div', { style: { width: 26, height: 26, borderRadius: '50%', flex: 'none', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 800,
              background: n < im.fase ? 'var(--ink)' : n === im.fase ? 'var(--brand)' : 'var(--line-2)', color: n <= im.fase ? (n === im.fase ? 'var(--ink)' : '#fff') : 'var(--ink-3)' } }, n < im.fase ? '✓' : n),
            React.createElement('div', { style: { flex: 1 } },
              React.createElement('div', { style: { fontWeight: 700, fontSize: 13.5 } }, f),
              React.createElement('div', { className: 'muted', style: { fontSize: 12 } }, desc)),
            React.createElement('span', { className: 'badge ' + (st === 'concluída' ? 'b-ok' : st === 'em andamento' ? 'b-warn' : 'b-ink') }, st)); }))
    ),

    tab === 'proprietario' && React.createElement('div', { className: 'card card-pad' },
      React.createElement('div', { className: 'row', style: { gap: 14, marginBottom: 20 } },
        React.createElement('div', { style: { width: 54, height: 54, borderRadius: '50%', background: 'var(--ink)', color: '#fff', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 } }, (im.proprietario_nome || '—').split(' ').map(w => w[0]).slice(0, 2).join('')),
        React.createElement('div', null,
          React.createElement('div', { style: { fontWeight: 700, fontSize: 17 } }, im.proprietario_nome || '—'),
          React.createElement('div', { className: 'muted', style: { fontSize: 13 } }, 'Proprietário · corretor responsável ', im.corretor_nome || '—'))),
      React.createElement('div', { style: { marginBottom: 18 } }, React.createElement(ContactGridLocal, { tel: im.proprietario_tel, email: im.proprietario_email })),
      React.createElement('div', { className: 'grid', style: { gridTemplateColumns: 'repeat(3,1fr)', gap: 12 } },
        [['Autorização de venda', im.exclusivo ? 'Exclusiva' : 'Compartilhada'], ['Comissão acordada', im.comissao_pct + '%'], ['Matrícula', im.matricula || '—']].map((r, i) =>
          React.createElement('div', { key: i, style: { background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 10, padding: '13px 15px' } },
            React.createElement('div', { className: 'muted', style: { fontSize: 11, fontWeight: 700 } }, r[0]),
            React.createElement('div', { style: { fontWeight: 700, fontSize: 15, marginTop: 3 } }, r[1])))) ),

    tab === 'atividade' && React.createElement('div', { className: 'card card-pad' },
      React.createElement('h3', { style: { margin: '0 0 16px', fontSize: 15, fontWeight: 700 } }, im.propostas, ' propostas · ', im.favoritos, ' favoritaram'),
      im.propostas > 0 ? React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 11 } },
        Array.from({ length: im.propostas }).map((_, i) => React.createElement('div', { key: i, className: 'between', style: { padding: '12px 14px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 10 } },
          React.createElement('div', { className: 'row', style: { gap: 11 } }, React.createElement(Avatar, { name: ['Eduardo B', 'Juliana R', 'Ana B', 'Rafael D', 'Marcos T', 'Carla S'][i % 6], cor: ['#1FA7BD', '#E03B72', '#3F8F5B'][i % 3] }),
            React.createElement('div', null, React.createElement('div', { style: { fontWeight: 600, fontSize: 13 } }, ['Eduardo Brandão', 'Juliana Reis', 'Ana Beatriz', 'Rafael Diniz', 'Marcos T.', 'Carla S.'][i % 6]),
              React.createElement('div', { className: 'muted', style: { fontSize: 11.5 } }, 'Proposta há ', i + 1, ' dia(s) · via ', ['Instagram', 'Google', 'Marketplace'][i % 3]))),
          React.createElement('div', { className: 'row', style: { gap: 10 } }, React.createElement('b', null, fmtBRL(Math.round(im.preco * (0.9 + i * 0.02)))),
            React.createElement('span', { className: 'badge ' + (i === 0 ? 'b-warn' : 'b-ink') }, i === 0 ? 'Em análise' : 'Recebida'))))
        ) : React.createElement('div', { className: 'empty' }, 'Nenhuma proposta recebida ainda. Imóvel recém-anunciado.'))
  );
}

function ContactGridLocal({ tel, email }) {
  return React.createElement('div', { className: 'contato-grid' },
    [{ ic: Ic.phone, l: 'Telefone', v: tel || '—' }, { ic: Ic.mail, l: 'E-mail', v: email || '—' }].map((it, i) =>
      React.createElement('div', { key: i, className: 'contato-item' },
        React.createElement('div', { className: 'ci' }, React.createElement(it.ic, { width: 16, height: 16 })),
        React.createElement('div', { style: { minWidth: 0 } }, React.createElement('div', { className: 'cl' }, it.l), React.createElement('div', { className: 'cv' }, it.v)))));
}
