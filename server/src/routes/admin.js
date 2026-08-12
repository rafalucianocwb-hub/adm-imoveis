import { Router } from "express";
import { db } from "../db.js";
import { authRequired, requireRole } from "../auth.js";
import { logAcao } from "../log.js";

export const router = Router();

// Zera todos os dados operacionais (imóveis, negócios, leads, clientes, contratos,
// campanhas, transações, log e interações) para começar o uso real do zero.
// NUNCA apaga usuários/logins. Só Administrador pode chamar.
router.post("/zerar-dados", authRequired, requireRole("Administrador"), (req, res) => {
  const tabelas = [
    "interacoes_lead", "admin_log", "transacoes", "campanhas",
    "contratos", "clientes", "negocios", "leads_angariacao",
    "imoveis", "proprietarios", "sessoes", "site_analytics", "contadores",
  ];
  for (const t of tabelas) db.prepare(`DELETE FROM ${t}`).run();
  db.prepare(`UPDATE modelos_contrato SET usos = 0`).run();
  logAcao(req, "Zerou dados de demonstração", "Sistema", "Reinício para uso real", "alerta");
  res.json({ ok: true });
});
