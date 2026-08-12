import React, { useState, useEffect, useCallback } from "react";
import { Ic, SurflandMark } from "./components.jsx";
import { api, getToken, setToken } from "./api.js";
import { RefProvider } from "./store.js";
import LoginScreen from "./Auth.jsx";

import ViewDashboard from "./views/Dashboard.jsx";
import ViewPipeline from "./views/Pipeline.jsx";
import ViewImoveis from "./views/Imoveis.jsx";
import ViewProprietarios from "./views/Proprietarios.jsx";
import ViewClientes from "./views/Clientes.jsx";
import ViewContratos from "./views/Contratos.jsx";
import ViewMarketing from "./views/Marketing.jsx";
import ViewFinanceiro from "./views/Financeiro.jsx";
import ViewRelatorios from "./views/Relatorios.jsx";
import ViewLog from "./views/Log.jsx";
import ViewUsuarios from "./views/Usuarios.jsx";

function AppShell() {
  const [user, setUser] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [checking, setChecking] = useState(true);
  const [route, setRoute] = useState('dashboard');
  const [imovelId, setImovelId] = useState(null);
  const [counts, setCounts] = useState({ negociosAbertos: 0, leadsAtivos: 0, imoveis: 0 });

  useEffect(() => {
    if (!getToken()) { setChecking(false); return; }
    api.me().then(setUser).catch(() => setToken(null)).finally(() => setChecking(false));
  }, []);

  const refreshCounts = useCallback(() => {
    Promise.all([api.negocios(), api.leadsAngariacao(), api.imoveis()])
      .then(([negocios, leads, imoveis]) => {
        setCounts({
          negociosAbertos: negocios.filter(n => n.etapa !== 'ganho').length,
          leadsAtivos: leads.filter(l => l.status !== 'Perdido' && l.status !== 'Autorização').length,
          imoveis: imoveis.length,
        });
      }).catch(() => {});
  }, []);

  useEffect(() => { if (user) refreshCounts(); }, [user, route, refreshCounts]);

  const login = (u, sid) => { setUser(u); setSessionId(sid); };
  const logout = () => { api.logout(sessionId).catch(() => {}); setToken(null); setUser(null); setRoute('dashboard'); };

  const go = (r, id = null) => { setRoute(r); if (id) setImovelId(id); window.scrollTo(0, 0); const m = document.querySelector('.main'); if (m) m.scrollTop = 0; };

  if (checking) return null;
  if (!user) return React.createElement(LoginScreen, { onLogin: login });

  const nav = [
    { grp: 'Visão geral', items: [
      { id: 'dashboard', label: 'Dashboard', icon: Ic.dash },
      { id: 'pipeline', label: 'Funil de Vendas', icon: Ic.pipe, count: counts.negociosAbertos },
    ]},
    { grp: 'Imóveis & Captação', items: [
      { id: 'imoveis', label: 'Imóveis', icon: Ic.home, count: counts.imoveis },
      { id: 'proprietarios', label: 'Angariação', icon: Ic.users, count: counts.leadsAtivos },
      { id: 'clientes', label: 'Clientes', icon: Ic.heart },
      { id: 'contratos', label: 'Contratos & Termos', icon: Ic.doc },
    ]},
    { grp: 'Crescimento', items: [
      { id: 'marketing', label: 'Marketing & Campanhas', icon: Ic.mega },
      { id: 'financeiro', label: 'Financeiro', icon: Ic.money },
      { id: 'relatorios', label: 'Relatórios', icon: Ic.chart },
    ]},
    { grp: 'Sistema', items: [
      ...(user.perfil === 'Administrador' ? [{ id: 'usuarios', label: 'Usuários', icon: Ic.users }] : []),
      { id: 'log', label: 'Log de Administração', icon: Ic.list },
    ]},
  ];

  const titles = {
    dashboard: ['Dashboard', 'Visão geral do negócio · RL Imóveis'],
    pipeline: ['Funil de Vendas', 'Do lead à assinatura do contrato'],
    imoveis: ['Imóveis', 'Portfólio e fases do processo de venda'],
    proprietarios: ['Angariação de Imóveis', 'Captação de imóveis para venda'],
    clientes: ['Gestão de Clientes', 'Compradores, em processo, sem retorno e desistências'],
    contratos: ['Contratos & Termos', 'Instrumentos e modelos padrão'],
    marketing: ['Marketing & Campanhas', 'Instagram, Google e marketplaces · ROI'],
    financeiro: ['Financeiro', 'Resultado do negócio e por imóvel'],
    relatorios: ['Relatórios', 'Financeiro, vendas, tempo do lead e conversão'],
    log: ['Log de Administração', 'Registro de atividades e auditoria dos usuários'],
    usuarios: ['Usuários', 'Cadastro de nome, telefone, e-mail e senha de acesso'],
  };

  const views = {
    dashboard: () => React.createElement(ViewDashboard, { go }),
    pipeline: () => React.createElement(ViewPipeline, null),
    imoveis: () => React.createElement(ViewImoveis, { initialId: imovelId, clearInitial: () => setImovelId(null) }),
    proprietarios: () => React.createElement(ViewProprietarios, { go }),
    clientes: () => React.createElement(ViewClientes, null),
    contratos: () => React.createElement(ViewContratos, null),
    marketing: () => React.createElement(ViewMarketing, null),
    financeiro: () => React.createElement(ViewFinanceiro, null),
    relatorios: () => React.createElement(ViewRelatorios, null),
    log: () => React.createElement(ViewLog, null),
    usuarios: () => React.createElement(ViewUsuarios, { currentUserId: user.id }),
  };

  const [t1, t2] = titles[route];
  const iniciais = user.nome.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  return React.createElement(RefProvider, null, React.createElement('div', { className: 'app' },
    React.createElement('aside', { className: 'sidebar' },
      React.createElement('div', { className: 'side-brand' },
        React.createElement(SurflandMark, { size: 36 }),
        React.createElement('div', null,
          React.createElement('div', { className: 'wm' }, 'RL Imóveis'),
          React.createElement('div', { className: 'tg' }, 'INTERMEDIAÇÃO'))),
      React.createElement('div', { className: 'side-scroll' },
        nav.map((g, gi) => React.createElement('div', { key: gi },
          React.createElement('div', { className: 'nav-group-label' }, g.grp),
          g.items.map(it => React.createElement('button', { key: it.id, className: 'nav-item' + (route === it.id ? ' active' : ''), onClick: () => go(it.id) },
            React.createElement(it.icon, {}),
            React.createElement('span', null, it.label),
            it.count != null && it.count > 0 && React.createElement('span', { className: 'count' }, it.count)))))),
      React.createElement('div', { className: 'side-foot' },
        React.createElement('div', { className: 'av' }, iniciais),
        React.createElement('div', { style: { flex: 1, minWidth: 0 } },
          React.createElement('div', { className: 'nm' }, user.nome),
          React.createElement('div', { className: 'rl' }, user.perfil, ' · RL Imóveis')),
        React.createElement('button', { className: 'iconbtn', style: { width: 30, height: 30, background: 'transparent', border: 'none', color: 'var(--ink-4)' }, onClick: logout, title: 'Sair' }, React.createElement(Ic.ext, { width: 18, height: 18 })))),

    React.createElement('main', { className: 'main' },
      React.createElement('div', { className: 'topbar' },
        React.createElement('div', null,
          React.createElement('h1', null, t1),
          React.createElement('div', { className: 'sub' }, t2)),
        React.createElement('div', { className: 'spacer' }),
        React.createElement('div', { className: 'searchbox' }, React.createElement(Ic.search, { width: 16, height: 16 }), React.createElement('input', { placeholder: 'Buscar imóvel, lead, contrato…' })),
        React.createElement('button', { className: 'iconbtn' }, React.createElement(Ic.bell, { width: 18, height: 18 })),
        React.createElement('button', { className: 'btn btn-dark', onClick: () => { window.dispatchEvent(new CustomEvent('rl-novo', { detail: route })); } }, React.createElement(Ic.plus, {}), 'Novo')),
      React.createElement('div', { className: 'page' }, views[route]())
    )
  ));
}

export default function App() {
  return React.createElement(AppShell, null);
}
