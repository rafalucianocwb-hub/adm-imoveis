# RL Imóveis — sistema real

Sistema completo de administração e intermediação imobiliária, recriado a partir do
protótipo de design (`Downloads/Administração - Imoveis (Angariação e Venda)`) como uma
aplicação real: backend Node/Express com banco SQLite, autenticação real (bcrypt + JWT) e
os módulos do handoff (dashboard, funil de vendas, imóveis, angariação, clientes,
contratos, marketing, financeiro, relatórios, log e usuários). O módulo de Comunicação
(inbox de WhatsApp/e-mail) foi removido do sistema.

## Estrutura
- `server/` — API Express + SQLite (better-sqlite3) + autenticação
- `client/` — Frontend React + Vite, fiel ao design do protótipo (styles.css, tokens, telas)

## Como rodar

### 1. Backend
```
cd server
npm install
cp .env.example .env
npm run seed       # popula o banco com usuários, imóveis, negócios, clientes, etc. de demonstração
npm run dev         # inicia em http://localhost:4100
```

### 2. Frontend
```
cd client
npm install
npm run dev         # inicia em http://localhost:5273 (proxy automático para a API em :4100)
```

Abra http://localhost:5273

## Login
- rafaluciano.cwb@gmail.com — Administrador — senha `Rafa2026`
- almirpyp@gmail.com — Administrador — senha `Almir2026`
- marina@rlimoveis.com.br — Corretor Sênior — senha `demo1234`
- andre@rlimoveis.com.br — Corretor — senha `demo1234`
- paulo@rlimoveis.com.br — Corretor Sênior — senha `demo1234`
- camila@rlimoveis.com.br — Corretor — senha `demo1234`
- fernanda@rlimoveis.com.br — Marketing — senha `demo1234`
- bruno@rlimoveis.com.br — Financeiro (inativo) — senha `demo1234`

**Atenção:** `npm run seed` apaga e repopula o banco do zero, incluindo os usuários —
rodar de novo restaura a conta do Administrador para `ricardo@rlimoveis.com.br` /
`demo1234` e remove o usuário Almir. Só rode `seed` de novo se quiser resetar os dados de
demonstração.

## O que é real (não fictício)
- Autenticação com hash de senha (bcrypt) + JWT — senhas nunca trafegam nem são
  devolvidas em texto puro pela API (usuários existentes só podem ter a senha redefinida,
  nunca revelada)
- Banco de dados SQLite real (arquivo em `server/data/rl-imoveis.db`)
- CRUD completo de imóveis, angariação, funil de vendas, clientes, contratos, campanhas,
  financeiro — tudo persistido
- Log de administração gerado automaticamente pelo backend a cada ação relevante
- RBAC: módulo Usuários restrito a Administrador; Financeiro restrito a
  Administrador/Financeiro

## O que ainda é stub (fora do escopo combinado)
- **Deploy:** roda local por enquanto. Sugestão: frontend em Vercel/Netlify, backend +
  banco em serviço com Postgres gerenciado ou tudo num VPS (trocando SQLite por Postgres
  se for multiusuário concorrente).
