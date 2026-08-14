import { Router } from "express";
import { randomUUID } from "crypto";
import { db, proximoCodigo } from "../db.js";
import { authRequired } from "../auth.js";
import { logAcao } from "../log.js";

export const router = Router();

const SELECT = `
  SELECT c.*, u.nome AS corretor_nome, i.codigo AS imovel_codigo, i.titulo AS imovel_titulo
  FROM clientes c
  LEFT JOIN usuarios u ON u.id = c.corretor_id
  LEFT JOIN imoveis i ON i.id = c.imovel_id
`;

router.get("/", authRequired, (req, res) => {
  res.json(db.prepare(`${SELECT} ORDER BY c.desde DESC, c.rowid DESC`).all());
});

router.post("/", authRequired, (req, res) => {
  const b = req.body || {};
  if (!b.nome?.trim()) return res.status(400).json({ error: "Informe o nome do cliente." });
  const imovel = b.imovelId ? db.prepare(`SELECT * FROM imoveis WHERE id = ?`).get(b.imovelId) : null;
  const corretor = b.corretorNome ? db.prepare(`SELECT id FROM usuarios WHERE nome = ?`).get(b.corretorNome) : null;
  const id = randomUUID();
  const codigo = proximoCodigo("CL-", 11);
  const hoje = new Date().toLocaleDateString("pt-BR");
  db.prepare(
    `INSERT INTO clientes (id, codigo, nome, telefone, email, endereco, status, imovel_id, valor, origem, corretor_id, observacao, desde, ultimo_contato)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).run(id, codigo, b.nome.trim(), b.telefone || null, b.email || null, b.endereco || null, b.status || "Em processo",
    imovel?.id || null, b.valor || imovel?.preco || 0, b.origem || "Direto", corretor?.id || null,
    b.observacao || "Cliente cadastrado manualmente.", hoje, "agora");
  logAcao(req, "Cadastrou cliente", "Clientes", `${codigo} · ${b.nome.trim()}`, "criacao");
  res.status(201).json(db.prepare(`${SELECT} WHERE c.id = ?`).get(id));
});

router.put("/:id", authRequired, (req, res) => {
  const c = db.prepare(`SELECT * FROM clientes WHERE id = ?`).get(req.params.id);
  if (!c) return res.status(404).json({ error: "Cliente não encontrado" });
  const b = req.body || {};
  db.prepare(
    `UPDATE clientes SET nome=?, telefone=?, email=?, endereco=?, status=?, valor=?, origem=?, observacao=?, ultimo_contato=? WHERE id=?`
  ).run(
    b.nome ?? c.nome, b.telefone ?? c.telefone, b.email ?? c.email, b.endereco ?? c.endereco,
    b.status ?? c.status, b.valor ?? c.valor, b.origem ?? c.origem, b.observacao ?? c.observacao,
    b.status && b.status !== c.status ? "agora" : c.ultimo_contato, c.id
  );
  logAcao(req, "Atualizou cliente", "Clientes", `${c.codigo} · ${b.status ?? c.status}`, "edicao");
  res.json(db.prepare(`${SELECT} WHERE c.id = ?`).get(c.id));
});

router.delete("/:id", authRequired, (req, res) => {
  const c = db.prepare(`SELECT * FROM clientes WHERE id = ?`).get(req.params.id);
  if (!c) return res.status(404).json({ error: "Cliente não encontrado" });
  db.prepare(`DELETE FROM clientes WHERE id = ?`).run(c.id);
  logAcao(req, "Excluiu cliente", "Clientes", `${c.codigo} · ${c.nome}`, "exclusao");
  res.json({ ok: true });
});
