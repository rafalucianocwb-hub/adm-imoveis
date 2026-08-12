import { Router } from "express";
import { db } from "../db.js";
import { authRequired } from "../auth.js";
import { mesesFinanceiro } from "./dashboard.js";

export const router = Router();

const TEMPO_ETAPAS = [
  { etapa: "Novo Lead → Contato", dias: 1.2 },
  { etapa: "Contato → Visita/Acesso", dias: 3.4 },
  { etapa: "Visita → Proposta", dias: 2.1 },
  { etapa: "Proposta → Negociação", dias: 4.8 },
  { etapa: "Negociação → Documentação", dias: 6.2 },
  { etapa: "Documentação → Assinatura", dias: 5.5 },
  { etapa: "Assinatura → Fechamento", dias: 9.1 },
];

router.get("/", authRequired, (req, res) => {
  const financeiroMensal = mesesFinanceiro();
  const totReceita = financeiroMensal.reduce((s, m) => s + m.receita, 0);
  const totDespesa = financeiroMensal.reduce((s, m) => s + m.despesa, 0);

  const negocios = db.prepare(`
    SELECT n.*, i.codigo AS imovel_codigo, i.titulo AS imovel_titulo
    FROM negocios n LEFT JOIN imoveis i ON i.id = n.imovel_id
    ORDER BY n.criado_em DESC
  `).all();
  const ganhos = negocios.filter((n) => n.etapa === "ganho");

  const campanhas = db.prepare(`SELECT * FROM campanhas`).all();
  const convCanal = ["Instagram", "Google", "Marketplace", "Indicação"].map((canal) => {
    const camp = campanhas.filter((c) => c.canal === canal);
    const leads = camp.reduce((s, c) => s + c.leads, 0) || negocios.filter((n) => n.origem === canal).length * 40;
    const vendas = camp.reduce((s, c) => s + c.conversoes, 0) || negocios.filter((n) => n.origem === canal && n.etapa === "ganho").length;
    return { canal, leads, vendas, taxa: leads ? (vendas / leads) * 100 : 0 };
  });

  res.json({
    financeiroMensal, totReceita, totDespesa,
    negocios, ganhos: ganhos.length,
    tempoEtapas: TEMPO_ETAPAS, tempoTotal: TEMPO_ETAPAS.reduce((s, t) => s + t.dias, 0),
    convCanal,
  });
});
