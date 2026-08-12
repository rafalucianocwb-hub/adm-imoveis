import React, { useState, useEffect } from "react";
import { Ic, Modal, Kpi, BarsChart, Donut } from "../components.jsx";
import { fmtBRL, fmtBRLk } from "../format.js";
import { api } from "../api.js";
import { useRefData } from "../store.js";

const DESPESA_CATS = [
  { g: 'Marketing', tipo: 'Marketing', subs: ['Instagram Ads', 'Google Ads', 'Marketplace (ZAP/OLX)', 'Material gráfico', 'Influenciador / Parceria', 'Brindes', 'Outros'] },
  { g: 'Cartório e Registro', tipo: 'Cartório', subs: ['Escritura', 'Registro de imóvel', 'Certidões', 'Reconhecimento de firma', 'ITBI', 'Outros'] },
  { g: 'Deslocamento', tipo: 'Deslocamento', subs: ['Combustível', 'Pedágio', 'Estacionamento', 'App de transporte', 'Passagem / Viagem', 'Hospedagem', 'Alimentação em visita'] },
  { g: 'Operacional', tipo: 'Operacional', subs: ['Aluguel do escritório', 'Energia / Água', 'Internet / Telefone', 'Material de escritório', 'Limpeza / Manutenção', 'Outros'] },
  { g: 'Equipe e Comissões', tipo: 'Equipe', subs: ['Comissão de corretor', 'Salários', 'Pró-labore', 'Encargos / INSS', 'Treinamento', 'Benefícios'] },
  { g: 'Financeiro', tipo: 'Financeiro', subs: ['Taxas bancárias', 'Impostos', 'Juros / IOF', 'Contabilidade', 'Tarifa de cartão', 'Empréstimo'] },
  { g: 'Plataformas e Ferramentas', tipo: 'Plataforma', subs: ['CRM / Sistema', 'Portal de imóveis', 'Assinaturas / Software', 'Hospedagem de site', 'Outros'] },
  { g: 'Jurídico', tipo: 'Jurídico', subs: ['Honorários advocatícios', 'Custas processuais', 'Assessoria', 'Outros'] },
  { g: 'Outros', tipo: 'Outros', subs: ['Diversos'] },
];

const DESP_COMP = [
  { fonte: 'Investimento em marketing', pct: 54, cor: '#B0543C' },
  { fonte: 'Operacional & cartório', pct: 23, cor: '#2E7D8C' },
  { fonte: 'Equipe & comissões', pct: 16, cor: '#13674E' },
  { fonte: 'Plataformas & ferramentas', pct: 7, cor: '#C2913C' },
];

function NovaDespesaModal({ onClose, onSave, imoveis }) {
  const hoje = new Date().toISOString().slice(0, 10);
  const [cat, setCat] = useState(DESPESA_CATS[0].g);
  const [sub, setSub] = useState(DESPESA_CATS[0].subs[0]);
  const [desc, setDesc] = useState('');
  const [imovel, setImovel] = useState('');
  const [data, setData] = useState(hoje);
  const [pgto, setPgto] = useState('PIX');
  const [valor, setValor] = useState('');
  const [recorrente, setRecorrente] = useState(false);
  const [obs, setObs] = useState('');
  const [erro, setErro] = useState('');

  const catObj = DESPESA_CATS.find(c => c.g === cat);
  const trocaCat = (g) => { setCat(g); const c = DESPESA_CATS.find(x => x.g === g); setSub(c.subs[0]); };

  const salvar = () => {
    const v = parseFloat(String(valor).replace(/\./g, '').replace(',', '.'));
    if (!v || v <= 0) { setErro('Informe um valor válido.'); return; }
    const [y, m, d] = data.split('-');
    onSave({
      data: d + '/' + m, descricao: (desc.trim() ? desc.trim() : sub) + (recorrente ? ' · recorrente' : ''),
      subcategoria: sub, imovelId: imovel || null, formaPagamento: pgto, categoria: catObj.tipo,
      valor: Math.round(v), sinal: '-', observacao: obs, recorrente,
    });
  };

  const field = (label, el) => React.createElement('div', { className: 'field' }, React.createElement('label', null, label), el);

  return React.createElement(Modal, { title: 'Nova despesa', sub: 'Registre qualquer custo da RL Imóveis', icon: Ic.money, onClose,
    footer: React.createElement(React.Fragment, null,
      React.createElement('button', { className: 'btn btn-ghost', onClick: onClose }, 'Cancelar'),
      React.createElement('button', { className: 'btn btn-primary', onClick: salvar }, React.createElement(Ic.check, {}), 'Lançar despesa')) },
    React.createElement('div', { className: 'grid', style: { gridTemplateColumns: '1fr 1fr', gap: '0 14px' } },
      field('Categoria', React.createElement('select', { value: cat, onChange: e => trocaCat(e.target.value) }, DESPESA_CATS.map(c => React.createElement('option', { key: c.g }, c.g)))),
      field('Subcategoria', React.createElement('select', { value: sub, onChange: e => setSub(e.target.value) }, catObj.subs.map(s => React.createElement('option', { key: s }, s))))),
    field('Descrição', React.createElement('input', { value: desc, onChange: e => setDesc(e.target.value), placeholder: 'Ex.: Impulsionamento campanha de captação · maio' })),
    React.createElement('div', { className: 'grid', style: { gridTemplateColumns: '1fr 1fr', gap: '0 14px' } },
      field('Valor (R$)', React.createElement('input', { value: valor, onChange: e => setValor(e.target.value), inputMode: 'decimal', placeholder: '0,00' })),
      field('Data', React.createElement('input', { type: 'date', value: data, onChange: e => setData(e.target.value) }))),
    React.createElement('div', { className: 'grid', style: { gridTemplateColumns: '1fr 1fr', gap: '0 14px' } },
      field('Forma de pagamento', React.createElement('select', { value: pgto, onChange: e => setPgto(e.target.value) }, ['PIX', 'Cartão de crédito', 'Cartão de débito', 'Boleto', 'Transferência', 'Dinheiro'].map(p => React.createElement('option', { key: p }, p)))),
      field('Imóvel vinculado (opcional)', React.createElement('select', { value: imovel, onChange: e => setImovel(e.target.value) },
        React.createElement('option', { value: '' }, '— Despesa geral —'),
        imoveis.map(im => React.createElement('option', { key: im.id, value: im.id }, im.codigo + ' · ' + im.titulo))))),
    field('Observação', React.createElement('textarea', { value: obs, onChange: e => setObs(e.target.value), rows: 2, placeholder: 'Anotações, nº da nota fiscal, fornecedor…' })),
    React.createElement('label', { className: 'row', style: { gap: 8, fontSize: 12.5, color: 'var(--ink-2)', cursor: 'pointer', marginTop: 2 } },
      React.createElement('input', { type: 'checkbox', checked: recorrente, onChange: e => setRecorrente(e.target.checked), style: { width: 15, height: 15, accentColor: 'var(--brand)' } }),
      'Despesa recorrente (mensal)'),
    erro && React.createElement('div', { style: { background: 'var(--bad-bg)', color: 'var(--bad)', fontSize: 12.5, fontWeight: 600, padding: '9px 12px', borderRadius: 9, marginTop: 12 } }, erro)
  );
}

export default function ViewFinanceiro() {
  const { imoveis } = useRefData();
  const [tab, setTab] = useState('negocio');
  const [trans, setTrans] = useState([]);
  const [resumo, setResumo] = useState(null);
  const [rentabilidade, setRentabilidade] = useState([]);
  const [novo, setNovo] = useState(false);

  const load = () => {
    api.transacoes().then(setTrans).catch(() => {});
    api.resumoFinanceiro().then(setResumo).catch(() => {});
    api.rentabilidadePorImovel().then(setRentabilidade).catch(() => {});
  };
  useEffect(() => { load(); }, []);
  useEffect(() => { const h = () => setNovo(true); window.addEventListener('rl-novo', h); return () => window.removeEventListener('rl-novo', h); }, []);

  const tipoCor = (t) => ({ 'Comissão': 'b-ok', 'Taxa': 'b-info', 'Marketing': 'b-mag', 'Cartório': 'b-warn', 'Deslocamento': 'b-info', 'Operacional': 'b-ink', 'Equipe': 'b-brand', 'Financeiro': 'b-warn', 'Plataforma': 'b-ink', 'Jurídico': 'b-info', 'Outros': 'b-ink' }[t] || 'b-ink');

  const addDespesa = (body) => api.addTransacao(body).then(() => { setNovo(false); load(); });

  if (!resumo) return React.createElement('div', { className: 'empty' }, 'Carregando…');
  const margem = resumo.totReceita ? (resumo.lucro / resumo.totReceita * 100).toFixed(0) : '0';
  const mesAtual = resumo.financeiroMensal[resumo.financeiroMensal.length - 1] || { receita: 0, despesa: 0 };

  return React.createElement('div', null,
    React.createElement('div', { className: 'between', style: { marginBottom: 0 } },
      React.createElement('div', { className: 'tabs', style: { flex: 1 } },
        [['negocio', 'Financeiro do negócio'], ['imovel', 'Rentabilidade por imóvel']].map(t =>
          React.createElement('button', { key: t[0], className: tab === t[0] ? 'on' : '', onClick: () => setTab(t[0]) }, t[1]))),
      React.createElement('button', { className: 'btn btn-primary', style: { marginBottom: 10 }, onClick: () => setNovo(true) }, React.createElement(Ic.plus, {}), 'Nova despesa')),

    tab === 'negocio' && React.createElement('div', null,
      React.createElement('div', { className: 'grid', style: { gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 20 } },
        React.createElement(Kpi, { icon: Ic.money, iconBg: 'var(--brand-soft)', iconColor: 'var(--brand-deep)', label: 'Receita acumulada', value: fmtBRLk(resumo.totReceita), delta: 'todos os meses', deltaDir: 'up' }),
        React.createElement(Kpi, { icon: Ic.chart, iconBg: 'var(--ok-bg)', iconColor: 'var(--ok)', label: 'Lucro líquido', value: fmtBRLk(resumo.lucro), delta: 'margem ' + margem + '%', deltaDir: 'up' }),
        React.createElement(Kpi, { icon: Ic.mega, iconBg: 'var(--magenta-soft)', iconColor: 'var(--magenta)', label: 'Despesa total', value: fmtBRLk(resumo.totDespesa), delta: 'todas as categorias', deltaDir: 'flat' }),
        React.createElement(Kpi, { icon: Ic.flag, iconBg: 'var(--ocean-soft)', iconColor: 'var(--ocean-deep)', label: 'Ticket médio (comissão)', value: fmtBRLk(8240), delta: 'por venda', deltaDir: 'flat' })),

      React.createElement('div', { className: 'grid', style: { gridTemplateColumns: '1.6fr 1fr', marginBottom: 20 } },
        React.createElement('div', { className: 'card card-pad' },
          React.createElement('div', { className: 'card-h' }, React.createElement('h3', null, 'Receita × Despesa'), React.createElement('span', { className: 'hint' }, 'por mês')),
          React.createElement(BarsChart, { data: resumo.financeiroMensal, h: 200 }),
          React.createElement('div', { className: 'legend', style: { marginTop: 14 } },
            React.createElement('span', null, React.createElement('i', { style: { background: 'var(--brand)' } }), 'Receita'),
            React.createElement('span', null, React.createElement('i', { style: { background: 'var(--ink)' } }), 'Despesa'),
            React.createElement('span', null, React.createElement('i', { style: { background: 'var(--ok)' } }), 'Lucro do mês · ', fmtBRL(mesAtual.receita - mesAtual.despesa)))),
        React.createElement('div', { className: 'card card-pad' },
          React.createElement('div', { className: 'card-h' }, React.createElement('h3', null, 'Composição das despesas')),
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 18 } },
            React.createElement(Donut, { segments: DESP_COMP, size: 132, thickness: 20, center: React.createElement('div', null, React.createElement('div', { style: { fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 700 } }, fmtBRLk(resumo.totDespesa)), React.createElement('div', { className: 'muted', style: { fontSize: 10, fontWeight: 600 } }, 'total')) }),
            React.createElement('div', { style: { flex: 1, display: 'flex', flexDirection: 'column', gap: 10 } },
              DESP_COMP.map((d, i) => React.createElement('div', { key: i, className: 'row', style: { gap: 8, fontSize: 12 } },
                React.createElement('span', { style: { width: 9, height: 9, borderRadius: 3, background: d.cor, flex: 'none' } }),
                React.createElement('span', { style: { flex: 1, lineHeight: 1.25 } }, d.fonte),
                React.createElement('b', null, d.pct, '%')))))) ),

      React.createElement('div', { className: 'card' },
        React.createElement('div', { className: 'between card-pad', style: { paddingBottom: 4 } },
          React.createElement('h3', { style: { margin: 0, fontSize: 15, fontWeight: 700 } }, 'Movimentações recentes'),
          React.createElement('button', { className: 'btn btn-ghost btn-sm', onClick: () => setNovo(true) }, React.createElement(Ic.plus, {}), 'Lançar despesa')),
        React.createElement('table', { className: 'tbl', style: { marginTop: 8 } },
          React.createElement('thead', null, React.createElement('tr', null, ['Data', 'Descrição', 'Imóvel', 'Categoria', 'Valor'].map((h, i) => React.createElement('th', { key: h, className: i === 4 ? 'right' : '' }, h)))),
          React.createElement('tbody', null, trans.map(t => React.createElement('tr', { key: t.id },
            React.createElement('td', { className: 'num', style: { color: 'var(--ink-3)' } }, t.data),
            React.createElement('td', null, React.createElement('span', { style: { fontWeight: 600 } }, t.descricao),
              t.subcategoria && t.subcategoria !== t.descricao ? React.createElement('span', { className: 'muted', style: { fontSize: 11.5, display: 'block' } }, t.subcategoria) : null),
            React.createElement('td', { className: 'num', style: { color: 'var(--ink-3)', fontSize: 12.5 } }, t.imovel_codigo || '—'),
            React.createElement('td', null, React.createElement('span', { className: 'badge ' + tipoCor(t.categoria) }, t.categoria)),
            React.createElement('td', { className: 'num right', style: { fontWeight: 700, color: t.sinal === '+' ? 'var(--ok)' : 'var(--bad)' } }, t.sinal, ' ', fmtBRL(t.valor))))))) ),

    tab === 'imovel' && React.createElement('div', null,
      React.createElement('p', { className: 'muted', style: { margin: '0 0 16px', fontSize: 13, maxWidth: 620 } }, 'Resultado por imóvel: comissão potencial ou realizada, custo de marketing atribuído (acessos + propostas) e retorno sobre o investimento de divulgação.'),
      React.createElement('div', { className: 'card' },
        React.createElement('table', { className: 'tbl' },
          React.createElement('thead', null, React.createElement('tr', null, ['Imóvel', 'Status', 'Valor de venda', 'Comissão', 'Custo mkt', 'Resultado', 'ROI mkt'].map((h, i) => React.createElement('th', { key: h, className: i > 1 ? 'right' : '' }, h)))),
          React.createElement('tbody', null, rentabilidade.map(r => React.createElement('tr', { key: r.imovel.id },
            React.createElement('td', null, React.createElement('div', { className: 'imovel-cell' }, React.createElement('img', { src: r.imovel.foto_url, className: 'th' }), React.createElement('div', null, React.createElement('div', { className: 'tt' }, r.imovel.titulo), React.createElement('div', { className: 'ss' }, r.imovel.codigo)))),
            React.createElement('td', null, React.createElement('span', { className: 'badge ' + (r.realizado ? 'b-ok' : 'b-ink') }, r.realizado ? 'Realizado' : 'Em carteira')),
            React.createElement('td', { className: 'num right' }, fmtBRL(r.imovel.preco)),
            React.createElement('td', { className: 'num right', style: { color: 'var(--ok)', fontWeight: 700 } }, fmtBRL(r.comissao)),
            React.createElement('td', { className: 'num right', style: { color: 'var(--bad)' } }, '- ', fmtBRL(r.mkt)),
            React.createElement('td', { className: 'num right', style: { fontWeight: 700 } }, fmtBRL(r.lucro)),
            React.createElement('td', { className: 'num right' }, React.createElement('span', { className: 'badge ' + (r.roi > 200 ? 'b-ok' : 'b-warn') }, r.roi, '%'))))))) ),

    novo && React.createElement(NovaDespesaModal, { imoveis, onClose: () => setNovo(false), onSave: addDespesa })
  );
}
