import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Em produção (Railway), DB_PATH deve apontar para dentro do volume persistente
// montado (ex.: /data/rl-imoveis.db). Em dev, cai no arquivo local em server/data/.
const DB_PATH = process.env.DB_PATH || path.join(__dirname, "..", "data", "rl-imoveis.db");
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

export const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS usuarios (
  id TEXT PRIMARY KEY,
  codigo TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  telefone TEXT,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,
  perfil TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Ativo',
  criado_em TEXT NOT NULL DEFAULT (datetime('now')),
  ultimo_acesso TEXT
);

CREATE TABLE IF NOT EXISTS sessoes (
  id TEXT PRIMARY KEY,
  usuario_id TEXT NOT NULL REFERENCES usuarios(id),
  inicio TEXT NOT NULL DEFAULT (datetime('now')),
  fim TEXT
);

CREATE TABLE IF NOT EXISTS proprietarios (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  endereco TEXT
);

CREATE TABLE IF NOT EXISTS imoveis (
  id TEXT PRIMARY KEY,
  codigo TEXT UNIQUE NOT NULL,
  titulo TEXT NOT NULL,
  tipo TEXT NOT NULL,
  bairro TEXT,
  cidade TEXT DEFAULT 'Florianópolis/SC',
  area REAL,
  dormitorios INTEGER,
  vagas INTEGER,
  preco REAL NOT NULL,
  proprietario_id TEXT REFERENCES proprietarios(id),
  corretor_id TEXT REFERENCES usuarios(id),
  exclusivo INTEGER NOT NULL DEFAULT 0,
  comissao_pct REAL NOT NULL DEFAULT 5,
  fase INTEGER NOT NULL DEFAULT 1,
  foto_url TEXT,
  foto_url_2 TEXT,
  acessos INTEGER NOT NULL DEFAULT 0,
  propostas INTEGER NOT NULL DEFAULT 0,
  favoritos INTEGER NOT NULL DEFAULT 0,
  matricula TEXT,
  tipo_autorizacao TEXT,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS leads_angariacao (
  id TEXT PRIMARY KEY,
  codigo TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  endereco TEXT,
  imovel_draft_json TEXT,
  origem TEXT,
  status TEXT NOT NULL DEFAULT 'Novo',
  valor_vgv REAL,
  corretor_id TEXT REFERENCES usuarios(id),
  observacao TEXT,
  enviado_imovel_id TEXT REFERENCES imoveis(id),
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS interacoes_lead (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL REFERENCES leads_angariacao(id),
  tipo TEXT NOT NULL DEFAULT 'conversa',
  texto TEXT NOT NULL,
  data_prevista TEXT,
  usuario TEXT,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS negocios (
  id TEXT PRIMARY KEY,
  codigo TEXT UNIQUE NOT NULL,
  cliente_nome TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  endereco TEXT,
  imovel_id TEXT REFERENCES imoveis(id),
  valor REAL,
  etapa TEXT NOT NULL DEFAULT 'lead',
  origem TEXT,
  corretor_id TEXT REFERENCES usuarios(id),
  probabilidade INTEGER DEFAULT 10,
  ultima_atividade TEXT,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS clientes (
  id TEXT PRIMARY KEY,
  codigo TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  endereco TEXT,
  status TEXT NOT NULL DEFAULT 'Em processo',
  imovel_id TEXT REFERENCES imoveis(id),
  valor REAL,
  origem TEXT,
  corretor_id TEXT REFERENCES usuarios(id),
  observacao TEXT,
  desde TEXT,
  ultimo_contato TEXT
);

CREATE TABLE IF NOT EXISTS contratos (
  id TEXT PRIMARY KEY,
  codigo TEXT UNIQUE NOT NULL,
  tipo TEXT NOT NULL,
  parte_nome TEXT,
  imovel_id TEXT REFERENCES imoveis(id),
  status TEXT NOT NULL DEFAULT 'Pendente',
  data_assinatura TEXT,
  valor REAL,
  exclusivo INTEGER NOT NULL DEFAULT 0,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS modelos_contrato (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  icone TEXT,
  usos INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS campanhas (
  id TEXT PRIMARY KEY,
  codigo TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  canal TEXT NOT NULL,
  objetivo TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Ativa',
  investimento REAL DEFAULT 0,
  gasto REAL DEFAULT 0,
  impressoes INTEGER DEFAULT 0,
  cliques INTEGER DEFAULT 0,
  leads INTEGER DEFAULT 0,
  conversoes INTEGER DEFAULT 0,
  receita REAL DEFAULT 0,
  periodo TEXT
);

CREATE TABLE IF NOT EXISTS transacoes (
  id TEXT PRIMARY KEY,
  codigo TEXT UNIQUE NOT NULL,
  data TEXT NOT NULL,
  descricao TEXT NOT NULL,
  categoria TEXT,
  subcategoria TEXT,
  imovel_id TEXT REFERENCES imoveis(id),
  valor REAL NOT NULL,
  sinal TEXT NOT NULL DEFAULT '-',
  forma_pagamento TEXT,
  recorrente INTEGER NOT NULL DEFAULT 0,
  observacao TEXT,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS admin_log (
  id TEXT PRIMARY KEY,
  usuario TEXT,
  acao TEXT NOT NULL,
  modulo TEXT NOT NULL,
  alvo TEXT,
  nivel TEXT NOT NULL DEFAULT 'info',
  ip TEXT,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS site_analytics (
  data TEXT PRIMARY KEY,
  acessos INTEGER NOT NULL,
  leads INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS contadores (
  prefixo TEXT PRIMARY KEY,
  valor INTEGER NOT NULL DEFAULT 0
);
`);

// Migração leve para bancos já existentes (criados antes desta coluna existir).
const colunasImoveis = db.prepare(`PRAGMA table_info(imoveis)`).all().map((c) => c.name);
if (!colunasImoveis.includes("foto_url_2")) {
  db.exec(`ALTER TABLE imoveis ADD COLUMN foto_url_2 TEXT`);
}

export function proximoCodigo(prefixo, inicio = 1) {
  const row = db.prepare(`SELECT valor FROM contadores WHERE prefixo = ?`).get(prefixo);
  const proximo = row ? row.valor + 1 : inicio;
  db.prepare(
    `INSERT INTO contadores (prefixo, valor) VALUES (?,?)
     ON CONFLICT(prefixo) DO UPDATE SET valor = excluded.valor`
  ).run(prefixo, proximo);
  return `${prefixo}${proximo}`;
}
