import { Router } from "express";
import { randomUUID } from "crypto";
import { db, proximoCodigo } from "../db.js";
import { authRequired } from "../auth.js";
import { logAcao } from "../log.js";

export const router = Router();

const SELECT = `
  SELECT c.*, i.codigo AS imovel_codigo, i.titulo AS imovel_titulo
  FROM contratos c
  LEFT JOIN imoveis i ON i.id = c.imovel_id
`;

router.get("/", authRequired, (req, res) => {
  res.json(db.prepare(`${SELECT} ORDER BY c.criado_em DESC`).all());
});

router.get("/modelos", authRequired, (req, res) => {
  res.json(db.prepare(`SELECT * FROM modelos_contrato ORDER BY nome`).all());
});

router.post("/", authRequired, (req, res) => {
  const b = req.body || {};
  if (!b.tipo?.trim()) return res.status(400).json({ error: "Informe o tipo de instrumento." });
  const imovel = b.imovelId ? db.prepare(`SELECT * FROM imoveis WHERE id = ?`).get(b.imovelId) : null;
  const id = randomUUID();
  const codigo = proximoCodigo("CT-", 337);
  db.prepare(
    `INSERT INTO contratos (id, codigo, tipo, parte_nome, imovel_id, status, data_assinatura, valor, exclusivo)
     VALUES (?,?,?,?,?,?,?,?,?)`
  ).run(id, codigo, b.tipo.trim(), b.parteNome || null, imovel?.id || null, b.status || "Pendente",
    b.dataAssinatura || null, b.valor || imovel?.preco || 0, b.exclusivo ? 1 : 0);
  logAcao(req, "Gerou contrato", "Contratos", `${codigo} · ${b.tipo.trim()}`, "criacao");
  res.status(201).json(db.prepare(`${SELECT} WHERE c.id = ?`).get(id));
});

router.put("/:id", authRequired, (req, res) => {
  const c = db.prepare(`SELECT * FROM contratos WHERE id = ?`).get(req.params.id);
  if (!c) return res.status(404).json({ error: "Contrato não encontrado" });
  const b = req.body || {};
  db.prepare(`UPDATE contratos SET status=?, data_assinatura=? WHERE id=?`).run(
    b.status ?? c.status, b.dataAssinatura ?? c.data_assinatura, c.id
  );
  logAcao(req, b.status === "Assinado" ? "Assinou contrato" : "Editou contrato", "Contratos", `${c.codigo}`, b.status === "Assinado" ? "criacao" : "edicao");
  res.json(db.prepare(`${SELECT} WHERE c.id = ?`).get(c.id));
});
