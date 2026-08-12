import { Router } from "express";
import { db } from "../db.js";
import { authRequired } from "../auth.js";

export const router = Router();

router.get("/", authRequired, (req, res) => {
  const financeiroMensal = mesesFinanceiro();
  const mesAtual = financeiroMensal[financeiroMensal.length - 1];
  const lucro = mesAtual.receita - mesAtual.despesa;

  const negocios = db.prepare(`SELECT * FROM negocios`).all();
  const pipelineTotal = negocios.filter((n) => n.etapa !== "ganho").reduce((s, n) => s + n.valor, 0);

  const imoveisAtivos = db.prepare(`SELECT COUNT(*) n FROM imoveis`).get().n;
  const imoveisRecentes = db.prepare(`SELECT COUNT(*) n FROM imoveis WHERE criado_em >= datetime('now','-14 days')`).get().n;

  const analytics = db.prepare(`SELECT * FROM site_analytics ORDER BY data ASC`).all();
  const siteTrafego = analytics.map((a) => a.acessos);
  const siteLeads = analytics.map((a) => a.leads);

  const clientesSemRetorno7d = db.prepare(`SELECT COUNT(*) n FROM clientes WHERE status = 'Sem retorno'`).get().n;
  const emNegociacao = negocios.filter((n) => ["negoc", "proposta", "doc"].includes(n.etapa)).length;

  const imoveisMaisProcurados = db
    .prepare(`SELECT id, codigo, titulo, tipo, foto_url, acessos, propostas FROM imoveis ORDER BY acessos DESC LIMIT 4`)
    .all();

  // Contagem cumulativa: negócios que já passaram por cada etapa (ou além dela).
  const cumulativo = (...etapas) => negocios.filter((n) => etapas.includes(n.etapa)).length;
  const funilView = [
    { nome: "Leads gerados", n: siteLeads.reduce((a, b) => a + b, 0), cor: "#9A968A" },
    { nome: "Contatos / Visitas", n: cumulativo("contato", "visita", "proposta", "negoc", "doc", "assinado", "ganho"), cor: "#1FA7BD" },
    { nome: "Propostas enviadas", n: cumulativo("proposta", "negoc", "doc", "assinado", "ganho"), cor: "#D98A0B" },
    { nome: "Em negociação", n: cumulativo("negoc", "doc", "assinado", "ganho"), cor: "#E3B000" },
    { nome: "Vendas fechadas", n: cumulativo("ganho"), cor: "#2E9E5B" },
  ];

  res.json({
    receitaMes: mesAtual.receita,
    lucroMes: lucro,
    pipelineTotal,
    imoveisAtivos,
    imoveisRecentes,
    novosLeads7d: siteLeads.slice(-7).reduce((a, b) => a + b, 0),
    emNegociacao,
    clientesSemRetorno7d,
    siteTrafego,
    siteLeads,
    funilView,
    imoveisMaisProcurados,
  });
});

export function mesesFinanceiro() {
  const rows = db.prepare(`SELECT strftime('%Y-%m', criado_em) ym, SUM(CASE WHEN sinal='+' THEN valor ELSE 0 END) receita, SUM(CASE WHEN sinal='-' THEN valor ELSE 0 END) despesa FROM transacoes GROUP BY ym ORDER BY ym`).all();
  if (rows.length) return rows.map((r) => ({ mes: r.ym, receita: r.receita || 0, despesa: r.despesa || 0 }));
  return [{ mes: "Atual", receita: 0, despesa: 0 }];
}
