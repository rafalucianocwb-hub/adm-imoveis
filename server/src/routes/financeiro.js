import { Router } from "express";
import { randomUUID } from "crypto";
import { db, proximoCodigo } from "../db.js";
import { authRequired, requireRole } from "../auth.js";
import { logAcao } from "../log.js";
import { mesesFinanceiro } from "./dashboard.js";

export const router = Router();

router.get("/transacoes", authRequired, (req, res) => {
  const rows = db.prepare(`
    SELECT t.*, i.codigo AS imovel_codigo
    FROM transacoes t LEFT JOIN imoveis i ON i.id = t.imovel_id
    ORDER BY t.criado_em DESC
  `).all();
  res.json(rows);
});

router.post("/transacoes", authRequired, requireRole("Administrador", "Financeiro"), (req, res) => {
  const b = req.body || {};
  const valor = Number(b.valor);
  if (!valor || valor <= 0) return res.status(400).json({ error: "Informe um valor válido." });
  const imovel = b.imovelId ? db.prepare(`SELECT id FROM imoveis WHERE id = ?`).get(b.imovelId) : null;
  const id = randomUUID();
  const codigo = proximoCodigo("T-", 511);
  const hoje = new Date();
  const data = b.data || `${String(hoje.getDate()).padStart(2, "0")}/${String(hoje.getMonth() + 1).padStart(2, "0")}`;
  db.prepare(
    `INSERT INTO transacoes (id, codigo, data, descricao, categoria, subcategoria, imovel_id, valor, sinal, forma_pagamento, recorrente, observacao)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`
  ).run(id, codigo, data, b.descricao?.trim() || b.subcategoria || "Despesa", b.categoria || "Outros",
    b.subcategoria || null, imovel?.id || null, Math.round(valor), b.sinal || "-", b.formaPagamento || null,
    b.recorrente ? 1 : 0, b.observacao || null);
  logAcao(req, "Lançou despesa", "Financeiro", `${codigo} · ${b.categoria || "Outros"}`, "criacao");
  res.status(201).json(db.prepare(`SELECT * FROM transacoes WHERE id = ?`).get(id));
});

router.get("/resumo", authRequired, (req, res) => {
  const financeiroMensal = mesesFinanceiro();
  const totReceita = financeiroMensal.reduce((s, m) => s + m.receita, 0);
  const totDespesa = financeiroMensal.reduce((s, m) => s + m.despesa, 0);
  res.json({ financeiroMensal, totReceita, totDespesa, lucro: totReceita - totDespesa });
});

router.get("/rentabilidade-por-imovel", authRequired, (req, res) => {
  const imoveis = db.prepare(`SELECT * FROM imoveis`).all();
  const porImovel = imoveis.map((im) => {
    const comissao = Math.round((im.preco * im.comissao_pct) / 100);
    const mkt = Math.round(im.acessos * 2.4 + im.propostas * 340);
    const realizado = im.fase >= 8;
    return { imovel: im, comissao, mkt, lucro: comissao - mkt, realizado, roi: mkt ? Math.round(((comissao - mkt) / mkt) * 100) : 0 };
  });
  res.json(porImovel);
});
