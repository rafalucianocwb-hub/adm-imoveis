import { Router } from "express";
import { randomUUID } from "crypto";
import { db, proximoCodigo } from "../db.js";
import { authRequired } from "../auth.js";
import { logAcao } from "../log.js";

export const router = Router();

const SELECT = `
  SELECT n.*, u.nome AS corretor_nome, i.codigo AS imovel_codigo, i.titulo AS imovel_titulo
  FROM negocios n
  LEFT JOIN usuarios u ON u.id = n.corretor_id
  LEFT JOIN imoveis i ON i.id = n.imovel_id
`;

router.get("/", authRequired, (req, res) => {
  res.json(db.prepare(`${SELECT} ORDER BY n.criado_em DESC`).all());
});

router.post("/", authRequired, (req, res) => {
  const b = req.body || {};
  if (!b.clienteNome?.trim()) return res.status(400).json({ error: "Informe o nome do cliente." });
  const imovel = b.imovelId ? db.prepare(`SELECT * FROM imoveis WHERE id = ?`).get(b.imovelId) : null;
  const corretor = b.corretorNome ? db.prepare(`SELECT id FROM usuarios WHERE nome = ?`).get(b.corretorNome) : null;
  const id = randomUUID();
  const codigo = proximoCodigo("N-", 2055);
  db.prepare(
    `INSERT INTO negocios (id, codigo, cliente_nome, telefone, email, endereco, imovel_id, valor, etapa, origem, corretor_id, probabilidade, ultima_atividade)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).run(id, codigo, b.clienteNome.trim(), b.telefone || null, b.email || null, b.endereco || null,
    imovel?.id || null, b.valor || imovel?.preco || 0, b.etapa || "lead", b.origem || "Direto",
    corretor?.id || null, b.probabilidade ?? 10, b.observacao || "Prospect criado manualmente");
  logAcao(req, "Criou negócio", "Funil", `${codigo} · ${b.clienteNome.trim()}`, "criacao");
  res.status(201).json(db.prepare(`${SELECT} WHERE n.id = ?`).get(id));
});

router.put("/:id", authRequired, (req, res) => {
  const n = db.prepare(`SELECT * FROM negocios WHERE id = ?`).get(req.params.id);
  if (!n) return res.status(404).json({ error: "Negócio não encontrado" });
  const b = req.body || {};
  const corretor = b.corretorNome ? db.prepare(`SELECT id FROM usuarios WHERE nome = ?`).get(b.corretorNome) : null;
  db.prepare(
    `UPDATE negocios SET valor=?, probabilidade=?, origem=?, corretor_id=?, telefone=?, email=?, endereco=?, etapa=?, ultima_atividade=? WHERE id=?`
  ).run(
    b.valor ?? n.valor, b.probabilidade ?? n.probabilidade, b.origem ?? n.origem, corretor?.id ?? n.corretor_id,
    b.telefone ?? n.telefone, b.email ?? n.email, b.endereco ?? n.endereco, b.etapa ?? n.etapa,
    b.observacao ?? n.ultima_atividade, n.id
  );
  logAcao(req, "Editou negócio", "Funil", `${n.codigo}`, "edicao");
  res.json(db.prepare(`${SELECT} WHERE n.id = ?`).get(n.id));
});

router.post("/:id/etapa", authRequired, (req, res) => {
  const n = db.prepare(`SELECT * FROM negocios WHERE id = ?`).get(req.params.id);
  if (!n) return res.status(404).json({ error: "Negócio não encontrado" });
  const etapa = req.body?.etapa;
  if (!etapa) return res.status(400).json({ error: "Informe a etapa." });
  db.prepare(`UPDATE negocios SET etapa = ? WHERE id = ?`).run(etapa, n.id);
  logAcao(req, "Moveu negócio", "Funil", `${n.codigo} → ${etapa}`, "edicao");
  res.json(db.prepare(`${SELECT} WHERE n.id = ?`).get(n.id));
});

router.post("/:id/sem-retorno", authRequired, (req, res) => {
  const n = db.prepare(`SELECT * FROM negocios WHERE id = ?`).get(req.params.id);
  if (!n) return res.status(404).json({ error: "Negócio não encontrado" });
  db.prepare(`UPDATE negocios SET etapa = 'semretorno' WHERE id = ?`).run(n.id);
  logAcao(req, "Marcou negócio sem retorno", "Funil", `${n.codigo}`, "edicao");
  res.json(db.prepare(`${SELECT} WHERE n.id = ?`).get(n.id));
});
