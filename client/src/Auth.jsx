import React, { useState } from "react";
import { Ic, SurflandMark } from "./components.jsx";
import { api, setToken } from "./api.js";

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('ricardo@rlimoveis.com.br');
  const [senha, setSenha] = useState('demo1234');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = (e) => {
    e && e.preventDefault();
    if (!email.trim() || !senha.trim()) { setErro('Preencha e-mail e senha.'); return; }
    setErro(''); setLoading(true);
    api.login(email.trim(), senha)
      .then((data) => { setToken(data.token); onLogin(data.user, data.sessionId); })
      .catch((err) => setErro(err.message || 'Não foi possível entrar.'))
      .finally(() => setLoading(false));
  };

  return React.createElement('div', { style: { minHeight: '100vh', display: 'grid', gridTemplateColumns: '1.05fr .95fr', background: 'var(--bg)' } },
    React.createElement('div', { style: { position: 'relative', overflow: 'hidden', background: 'linear-gradient(160deg,#0E4F3C,#13674E 55%,#0E4434)', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '46px 50px' } },
      React.createElement('div', { className: 'row', style: { gap: 13 } },
        React.createElement(SurflandMark, { size: 46 }),
        React.createElement('div', null,
          React.createElement('div', { style: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 25, lineHeight: 1, whiteSpace: 'nowrap' } }, 'RL Imóveis'),
          React.createElement('div', { style: { fontSize: 9.5, letterSpacing: '.24em', color: 'var(--gold)', fontWeight: 700, marginTop: 4 } }, 'INTERMEDIAÇÃO'))),
      React.createElement('div', { style: { position: 'relative', zIndex: 2 } },
        React.createElement('div', { style: { fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--gold)', marginBottom: 14 } }, 'Plataforma de Gestão Imobiliária'),
        React.createElement('h1', { style: { fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 700, lineHeight: 1.1, margin: '0 0 16px', maxWidth: 420 } }, 'Capte, gerencie e venda imóveis em um só lugar.'),
        React.createElement('p', { style: { fontSize: 14.5, lineHeight: 1.6, opacity: .86, maxWidth: 400, margin: 0 } }, 'Funil de vendas, angariação, contratos, marketing e financeiro — toda a operação da sua imobiliária com performance em tempo real.')),
      React.createElement('div', { style: { position: 'relative', zIndex: 2, display: 'flex', gap: 26, fontSize: 12.5, opacity: .85 } },
        ['Funil & Kanban', 'Campanhas & ROI', 'Contratos digitais'].map(t =>
          React.createElement('span', { key: t, className: 'row', style: { gap: 7 } }, React.createElement(Ic.check, { width: 15, height: 15, style: { color: 'var(--gold)' } }), t))),
      React.createElement('img', { src: '/assets/urban/skyline.jpg', alt: '', style: { position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%', height: 200, objectFit: 'cover', opacity: .18, mixBlendMode: 'luminosity' } })),

    React.createElement('div', { style: { display: 'grid', placeItems: 'center', padding: '40px' } },
      React.createElement('form', { onSubmit: submit, style: { width: '100%', maxWidth: 360 } },
        React.createElement('h2', { style: { fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, margin: '0 0 6px' } }, 'Acesse sua conta'),
        React.createElement('p', { className: 'muted', style: { margin: '0 0 28px', fontSize: 13.5 } }, 'Bem-vindo de volta. Entre com suas credenciais.'),
        React.createElement('div', { className: 'field' },
          React.createElement('label', null, 'E-mail'),
          React.createElement('input', { type: 'email', value: email, onChange: e => setEmail(e.target.value), placeholder: 'voce@rlimoveis.com.br', autoFocus: true })),
        React.createElement('div', { className: 'field' },
          React.createElement('div', { className: 'between' },
            React.createElement('label', { style: { marginBottom: 0 } }, 'Senha'),
            React.createElement('a', { href: '#', onClick: e => e.preventDefault(), style: { fontSize: 11.5, color: 'var(--ocean-deep)', fontWeight: 700 } }, 'Esqueci a senha')),
          React.createElement('input', { type: 'password', value: senha, onChange: e => setSenha(e.target.value), placeholder: '••••••••', style: { marginTop: 6 } })),
        erro && React.createElement('div', { style: { background: 'var(--bad-bg)', color: 'var(--bad)', fontSize: 12.5, fontWeight: 600, padding: '9px 12px', borderRadius: 9, marginBottom: 14 } }, erro),
        React.createElement('label', { className: 'row', style: { gap: 8, fontSize: 12.5, color: 'var(--ink-2)', margin: '2px 0 18px', cursor: 'pointer' } },
          React.createElement('input', { type: 'checkbox', defaultChecked: true, style: { width: 15, height: 15, accentColor: 'var(--brand)' } }), 'Manter-me conectado'),
        React.createElement('button', { type: 'submit', className: 'btn btn-primary', style: { width: '100%', justifyContent: 'center', padding: '12px', fontSize: 14, opacity: loading ? .7 : 1 } },
          loading ? 'Entrando…' : React.createElement(React.Fragment, null, React.createElement(Ic.lock, { width: 16, height: 16 }), 'Entrar')),
        React.createElement('div', { style: { textAlign: 'center', marginTop: 22, fontSize: 12.5, color: 'var(--ink-3)' } },
          'Problemas para acessar? ', React.createElement('a', { href: '#', onClick: e => e.preventDefault(), style: { color: 'var(--ocean-deep)', fontWeight: 700 } }, 'Fale com o suporte')),
        React.createElement('div', { style: { marginTop: 30, padding: '11px 14px', background: 'var(--brand-wash)', border: '1px solid var(--brand-soft)', borderRadius: 10, fontSize: 11.5, color: 'var(--ink-2)' } },
          React.createElement('b', null, 'Demonstração: '), 'use as credenciais já preenchidas e clique em Entrar.')))
  );
}
