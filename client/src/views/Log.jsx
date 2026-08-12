import React, { useState, useEffect } from "react";
import { Ic, Kpi, Avatar, exportCSV } from "../components.jsx";
import { api } from "../api.js";
import { useRefData } from "../store.js";

export default function ViewLog() {
  const { corCorretor } = useRefData();
  const [user, setUser] = useState('Todos');
  const [modulo, setModulo] = useState('Todos');
  const [logs, setLogs] = useState([]);
  const [todosLogs, setTodosLogs] = useState([]);

  useEffect(() => { api.log().then(setTodosLogs).catch(() => {}); }, []);
  useEffect(() => { api.log({ usuario: user, modulo }).then(setLogs).catch(() => {}); }, [user, modulo]);

  const usuarios = ['Todos', ...Array.from(new Set(todosLogs.map(l => l.usuario)))];
  const modulos = ['Todos', ...Array.from(new Set(todosLogs.map(l => l.modulo)))];

  const nivelBadge = (n) => ({ info: 'b-ink', criacao: 'b-ok', edicao: 'b-info', exclusao: 'b-bad', alerta: 'b-warn' }[n] || 'b-ink');
  const nivelLabel = (n) => ({ info: 'Info', criacao: 'Criação', edicao: 'Edição', exclusao: 'Exclusão', alerta: 'Alerta' }[n] || n);
  const acaoIcon = (n) => ({ info: Ic.eye, criacao: Ic.plus, edicao: Ic.doc, exclusao: Ic.x, alerta: Ic.bell }[n] || Ic.dots);

  const exportar = () => exportCSV('log_administracao_rl',
    ['ID', 'Data', 'Usuário', 'Ação', 'Módulo', 'Alvo', 'Nível'],
    todosLogs.map(l => [l.id, l.criado_em, l.usuario, l.acao, l.modulo, l.alvo, nivelLabel(l.nivel)]));

  const hojeStr = new Date().toISOString().slice(0, 10);
  const hoje = todosLogs.filter(l => (l.criado_em || '').startsWith(hojeStr)).length;
  const alertas = todosLogs.filter(l => l.nivel === 'alerta').length;

  const fmtData = (iso) => { const d = new Date(iso.replace(' ', 'T') + 'Z'); return { data: d.toLocaleDateString('pt-BR'), hora: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }; };

  return React.createElement('div', null,
    React.createElement('div', { className: 'grid', style: { gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 20 } },
      React.createElement(Kpi, { icon: Ic.list, iconBg: 'var(--brand-soft)', iconColor: 'var(--brand-deep)', label: 'Eventos registrados', value: todosLogs.length }),
      React.createElement(Kpi, { icon: Ic.clock, iconBg: 'var(--ocean-soft)', iconColor: 'var(--ocean-deep)', label: 'Atividades hoje', value: hoje }),
      React.createElement(Kpi, { icon: Ic.users, iconBg: 'var(--gold-soft)', iconColor: 'var(--gold-deep)', label: 'Usuários ativos', value: usuarios.length - 1 }),
      React.createElement(Kpi, { icon: Ic.bell, iconBg: 'var(--warn-bg)', iconColor: 'var(--warn)', label: 'Alertas de segurança', value: alertas, delta: 'revisar', deltaDir: 'down' })),

    React.createElement('div', { className: 'between wrap', style: { marginBottom: 16, gap: 12 } },
      React.createElement('div', { className: 'row wrap', style: { gap: 8 } },
        React.createElement('div', { className: 'field', style: { margin: 0 } },
          React.createElement('select', { value: user, onChange: e => setUser(e.target.value), style: { minWidth: 170 } }, usuarios.map(u => React.createElement('option', { key: u }, u)))),
        React.createElement('div', { className: 'field', style: { margin: 0 } },
          React.createElement('select', { value: modulo, onChange: e => setModulo(e.target.value), style: { minWidth: 150 } }, modulos.map(m => React.createElement('option', { key: m }, m))))),
      React.createElement('button', { className: 'btn btn-ghost', onClick: exportar }, React.createElement(Ic.dl, {}), 'Exportar Excel')),

    React.createElement('div', { className: 'card' },
      React.createElement('table', { className: 'tbl' },
        React.createElement('thead', null, React.createElement('tr', null, ['Data / Hora', 'Usuário', 'Ação', 'Módulo', 'Detalhe', 'Nível'].map(h => React.createElement('th', { key: h }, h)))),
        React.createElement('tbody', null,
          logs.map(l => { const { data, hora } = fmtData(l.criado_em);
            return React.createElement('tr', { key: l.id },
              React.createElement('td', { className: 'num', style: { whiteSpace: 'nowrap' } }, React.createElement('b', null, hora), React.createElement('span', { className: 'muted', style: { fontSize: 11.5, marginLeft: 6 } }, data)),
              React.createElement('td', null, React.createElement('div', { className: 'row', style: { gap: 8 } }, React.createElement(Avatar, { name: l.usuario, cor: corCorretor(l.usuario) }), React.createElement('span', { style: { fontWeight: 600 } }, l.usuario))),
              React.createElement('td', null, React.createElement('div', { className: 'row', style: { gap: 7 } },
                React.createElement('span', { style: { width: 24, height: 24, borderRadius: 7, display: 'grid', placeItems: 'center', flex: 'none', background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--ink-3)' } }, React.createElement(acaoIcon(l.nivel), { width: 13, height: 13 })),
                React.createElement('span', { style: { fontWeight: 600 } }, l.acao))),
              React.createElement('td', null, React.createElement('span', { className: 'badge b-ink' }, l.modulo)),
              React.createElement('td', { style: { color: 'var(--ink-2)' } }, l.alvo),
              React.createElement('td', null, React.createElement('span', { className: 'badge ' + nivelBadge(l.nivel) }, React.createElement('span', { className: 'dot' }), nivelLabel(l.nivel))));
          })),
        logs.length === 0 && React.createElement('div', { className: 'empty' }, 'Nenhum evento para os filtros selecionados.'))
    )
  );
}
