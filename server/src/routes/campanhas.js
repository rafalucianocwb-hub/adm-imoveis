import { Router } from "express";
import { randomUUID } from "crypto";
import { db, proximoCodigo } from "../db.js";
import { authRequired } from "../auth.js";
import { logAcao } from "../log.js";

export const router = Router();

router.get("/", authRequired, (req, res) => {
  res.json(db.prepare(`SELECT * FROM campanhas ORDER BY periodo DESC, nome`).all());
});

router.get("/site-analytics", authRequired, (req, res) => {
  const rows = db.prepare(`SELECT * FROM site_analytics ORDER BY data ASC`).all();
  res.json({ trafego: rows.map((r) => r.acessos), leads: rows.map((r) => r.leads) });
});

router.post("/", authRequired, (req, res) => {
  const b = req.body || {};
  if (!b.nome?.trim()) return res.status(400).json({ error: "Informe o nome da campanha." });
  const id = randomUUID();
  const codigo = proximoCodigo("C-", 9);
  db.prepare(
    `INSERT INTO campanhas (id, codigo, nome, canal, objetivo, status, investimento, gasto, impressoes, cliques, leads, conversoes, receita, periodo)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).run(id, codigo, b.nome.trim(), b.canal || "Instagram", b.objetivo || "Vender Imóveis", b.status || "Ativa",
    b.investimento || 0, b.gasto || 0, b.impressoes || 0, b.cliques || 0, b.leads || 0, b.conversoes || 0,
    b.receita || 0, b.periodo || new Date().toLocaleDateString("pt-BR", { month: "short", year: "numeric" }));
  logAcao(req, "Criou campanha", "Marketing", `${codigo} · ${b.nome.trim()}`, "criacao");
  res.status(201).json(db.prepare(`SELECT * FROM campanhas WHERE id = ?`).get(id));
});

router.put("/:id", authRequired, (req, res) => {
  const c = db.prepare(`SELECT * FROM campanhas WHERE id = ?`).get(req.params.id);
  if (!c) return res.status(404).json({ error: "Campanha não encontrada" });
  const b = req.body || {};
  db.prepare(`UPDATE campanhas SET status=?, gasto=?, leads=?, conversoes=?, receita=? WHERE id=?`).run(
    b.status ?? c.status, b.gasto ?? c.gasto, b.leads ?? c.leads, b.conversoes ?? c.conversoes, b.receita ?? c.receita, c.id
  );
  logAcao(req, "Editou campanha", "Marketing", `${c.codigo}`, "edicao");
  res.json(db.prepare(`SELECT * FROM campanhas WHERE id = ?`).get(c.id));
});
