import React, { useState, useEffect } from "react";
import { Ic, Modal, Kpi, Avatar } from "../components.jsx";
import { api } from "../api.js";
import { useRefData } from "../store.js";

const PERFIS = ['Administrador', 'Corretor Sênior', 'Corretor', 'Marketing', 'Financeiro'];

function gerarSenha() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let s = ''; for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function NovoUsuarioModal({ onClose, onSave, editing }) {
  const [f, setF] = useState(editing ? { ...editing, senha: '' } : { nome: '', tel: '', email: '', usuario: '', senha: gerarSenha(), perfil: 'Corretor', status: 'Ativo' });
  const [verSenha, setVerSenha] = useState(false);
  const [erro, setErro] = useState('');
  const set = (k) => (e) => setF(s => ({ ...s, [k]: e.target.value }));
  const campo = (label, el) => React.createElement('div', { className: 'field' }, React.createElement('label', null, label), el);

  const autoUsuario = (nome) => nome.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]+/g, '.').replace(/^\.+|\.+$/g, '');
  const setNome = (e) => setF(s => ({ ...s, nome: e.target.value, usuario: s.usuario && s.usuario !== autoUsuario(s.nome) ? s.usuario : autoUsuario(e.target.value) }));

  const salvar = () => {
    if (!f.nome.trim()) { setErro('Informe o nome do usuário.'); return; }
    if (!f.email.trim()) { setErro('Informe o e-mail.'); return; }
    if (!f.usuario.trim()) { setErro('Informe o nome de usuário.'); return; }
    if (!editing && (!f.senha || f.senha.length < 6)) { setErro('A senha deve ter ao menos 6 caracteres.'); return; }
    onSave({ nome: f.nome, telefone: f.tel, email: f.email, username: f.usuario, senha: f.senha, perfil: f.perfil, status: f.status });
  };

  return React.createElement(Modal, { title: editing ? 'Editar usuário' : 'Novo usuário', sub: 'Cadastro de acesso ao sistema RL Imóveis', icon: Ic.users, onClose,
    footer: React.createElement(React.Fragment, null,
      React.createElement('button', { className: 'btn btn-ghost', onClick: onClose }, 'Cancelar'),
      React.createElement('button', { className: 'btn btn-primary', onClick: salvar }, React.createElement(Ic.check, {}), editing ? 'Salvar alterações' : 'Criar usuário')) },

    campo('Nome completo', React.createElement('input', { value: f.nome, onChange: setNome, placeholder: 'Nome e sobrenome', autoFocus: true })),
    React.createElement('div', { className: 'grid', style: { gridTemplateColumns: '1fr 1fr', gap: '0 14px' } },
      campo('Telefone / WhatsApp', React.createElement('input', { value: f.tel || f.telefone || '', onChange: set('tel'), placeholder: '(48) 9____-____' })),
      campo('E-mail', React.createElement('input', { type: 'email', value: f.email, onChange: set('email'), placeholder: 'nome@rlimoveis.com.br' }))),

    React.createElement('div', { style: { height: 8 } }),
    React.createElement('div', { style: { fontSize: 11, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--brand-deep)', margin: '6px 0 12px', paddingBottom: 7, borderBottom: '1px solid var(--line)' } }, 'Acesso ao sistema'),
    React.createElement('div', { className: 'grid', style: { gridTemplateColumns: '1fr 1fr', gap: '0 14px' } },
      campo('Nome de usuário', React.createElement('input', { value: f.usuario, onChange: set('usuario'), placeholder: 'usuario.sistema' })),
      campo('Perfil de acesso', React.createElement('select', { value: f.perfil, onChange: set('perfil') }, PERFIS.map(p => React.createElement('option', { key: p }, p))))),

    campo(editing ? 'Nova senha (deixe em branco para manter)' : 'Senha', React.createElement('div', { className: 'row', style: { gap: 8 } },
      React.createElement('input', { type: verSenha ? 'text' : 'password', value: f.senha, onChange: set('senha'), placeholder: 'Mínimo 6 caracteres', style: { flex: 1 } }),
      React.createElement('button', { type: 'button', className: 'iconbtn', onClick: () => setVerSenha(v => !v), title: 'Mostrar/ocultar' }, React.createElement(Ic.eye, { width: 16, height: 16 })),
      React.createElement('button', { type: 'button', className: 'btn btn-ghost btn-sm', onClick: () => setF(s => ({ ...s, senha: gerarSenha() })) }, 'Gerar'))),

    React.createElement('div', { className: 'grid', style: { gridTemplateColumns: '1fr 1fr', gap: '0 14px' } },
      campo('Status', React.createElement('select', { value: f.status, onChange: set('status') }, ['Ativo', 'Inativo'].map(s => React.createElement('option', { key: s }, s)))),
      React.createElement('div')),

    erro && React.createElement('div', { style: { background: 'var(--bad-bg)', color: 'var(--bad)', fontSize: 12.5, fontWeight: 600, padding: '9px 12px', borderRadius: 9, marginTop: 8 } }, erro)
  );
}

export default function ViewUsuarios() {
  const { corCorretor, refresh } = useRefData();
  const [usuarios, setUsuarios] = useState([]);
  const [novo, setNovo] = useState(false);
  const [editar, setEditar] = useState(null);

  const load = () => api.usuarios().then(setUsuarios).catch(() => {});
  useEffect(() => { load(); }, []);
  useEffect(() => { const h = () => setNovo(true); window.addEventListener('rl-novo', h); return () => window.removeEventListener('rl-novo', h); }, []);

  const toggleStatus = (u) => api.editUsuario(u.id, { status: u.status === 'Ativo' ? 'Inativo' : 'Ativo' }).then(atualizado => { setUsuarios(us => us.map(x => x.id === u.id ? atualizado : x)); refresh(); });

  const perfilBadge = (p) => ({ 'Administrador': 'b-brand', 'Corretor Sênior': 'b-ok', 'Corretor': 'b-info', 'Marketing': 'b-mag', 'Financeiro': 'b-warn' }[p] || 'b-ink');
  const ativos = usuarios.filter(u => u.status === 'Ativo').length;

  const salvar = (body) => {
    if (editar) {
      const { senha, ...resto } = body;
      const p1 = api.editUsuario(editar.id, resto);
      const p2 = senha ? api.setSenha(editar.id, senha) : Promise.resolve();
      return Promise.all([p1, p2]).then(([atualizado]) => { setUsuarios(us => us.map(x => x.id === editar.id ? atualizado : x)); setNovo(false); setEditar(null); refresh(); });
    }
    return api.addUsuario(body).then(u => { setUsuarios(us => [u, ...us]); setNovo(false); setEditar(null); refresh(); });
  };

  return React.createElement('div', null,
    React.createElement('div', { className: 'grid', style: { gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 20 } },
      React.createElement(Kpi, { icon: Ic.users, iconBg: 'var(--brand-soft)', iconColor: 'var(--brand-deep)', label: 'Usuários cadastrados', value: usuarios.length }),
      React.createElement(Kpi, { icon: Ic.check, iconBg: 'var(--ok-bg)', iconColor: 'var(--ok)', label: 'Ativos', value: ativos }),
      React.createElement(Kpi, { icon: Ic.x, iconBg: 'var(--bad-bg)', iconColor: 'var(--bad)', label: 'Inativos', value: usuarios.length - ativos }),
      React.createElement(Kpi, { icon: Ic.lock, iconBg: 'var(--ocean-soft)', iconColor: 'var(--ocean-deep)', label: 'Perfis distintos', value: new Set(usuarios.map(u => u.perfil)).size })),

    React.createElement('div', { className: 'between', style: { marginBottom: 16 } },
      React.createElement('h3', { style: { margin: 0, fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700 } }, 'Usuários do sistema'),
      React.createElement('button', { className: 'btn btn-primary', onClick: () => setNovo(true) }, React.createElement(Ic.plus, {}), 'Novo usuário')),

    React.createElement('div', { className: 'card' },
      React.createElement('table', { className: 'tbl' },
        React.createElement('thead', null, React.createElement('tr', null, ['Usuário', 'Contato', 'Login', 'Perfil', 'Status', 'Último acesso', ''].map(h => React.createElement('th', { key: h }, h)))),
        React.createElement('tbody', null,
          usuarios.map(u => React.createElement('tr', { key: u.id },
            React.createElement('td', null, React.createElement('div', { className: 'row', style: { gap: 9 } }, React.createElement(Avatar, { name: u.nome, cor: corCorretor(u.nome) }),
              React.createElement('div', null, React.createElement('div', { style: { fontWeight: 700 } }, u.nome), React.createElement('div', { className: 'muted', style: { fontSize: 11.5 } }, u.email)))),
            React.createElement('td', { style: { fontSize: 12.5 } }, u.telefone),
            React.createElement('td', null, React.createElement('div', { style: { fontSize: 12.5, fontWeight: 600 } }, '@', u.username)),
            React.createElement('td', null, React.createElement('span', { className: 'badge ' + perfilBadge(u.perfil) }, u.perfil)),
            React.createElement('td', null, React.createElement('span', { className: 'badge ' + (u.status === 'Ativo' ? 'b-ok' : 'b-bad') }, React.createElement('span', { className: 'dot' }), u.status)),
            React.createElement('td', { className: 'muted', style: { fontSize: 12 } }, u.ultimo_acesso || 'nunca acessou'),
            React.createElement('td', null, React.createElement('div', { className: 'row', style: { gap: 6 } },
              React.createElement('button', { className: 'btn btn-ghost btn-sm', onClick: () => setEditar(u) }, 'Editar'),
              React.createElement('button', { className: 'btn btn-ghost btn-sm', onClick: () => toggleStatus(u) }, u.status === 'Ativo' ? 'Desativar' : 'Ativar')))))))
    ),

    (novo || editar) && React.createElement(NovoUsuarioModal, { editing: editar, onClose: () => { setNovo(false); setEditar(null); }, onSave: salvar })
  );
}
