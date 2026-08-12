import { Router } from "express";
import { randomUUID } from "crypto";
import { db, proximoCodigo } from "../db.js";
import { authRequired } from "../auth.js";
import { logAcao } from "../log.js";

export const router = Router();

const SELECT = `
  SELECT l.*, u.nome AS corretor_nome
  FROM leads_angariacao l
  LEFT JOIN usuarios u ON u.id = l.corretor_id
`;

function withDraft(l) {
  return { ...l, imovelData: l.imovel_draft_json ? JSON.parse(l.imovel_draft_json) : null };
}

router.get("/", authRequired, (req, res) => {
  const rows = db.prepare(`${SELECT} ORDER BY l.criado_em DESC`).all().map(withDraft);
  res.json(rows);
});

router.post("/", authRequired, (req, res) => {
  const b = req.body || {};
  if (!b.nome?.trim()) return res.status(400).json({ error: "Informe o nome do proprietário." });
  const corretor = b.corretorNome ? db.prepare(`SELECT id FROM usuarios WHERE nome = ?`).get(b.corretorNome) : null;
  const id = randomUUID();
  const codigo = proximoCodigo("P-", 819);
  const draft = {
    titulo: b.titulo || "", tipo: b.tipo || "Casa", bairro: b.bairro || "", area: b.area || 0,
    dorm: b.dormitorios || null, vagas: b.vagas || 0, preco: b.valor || 0, comissao: b.comissaoPct || 5,
    exclusivo: !!b.exclusivo, matricula: b.matricula || "",
  };
  db.prepare(
    `INSERT INTO leads_angariacao (id, codigo, nome, telefone, email, endereco, imovel_draft_json, origem, status, valor_vgv, corretor_id, observacao)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`
  ).run(id, codigo, b.nome.trim(), b.telefone || null, b.email || null, b.endereco || null, JSON.stringify(draft),
    b.origem || "Direto", b.status || "Novo", b.valor || 0, corretor?.id || null, b.observacao || null);
  logAcao(req, "Angariou proprietário", "Angariação", `${codigo} · ${b.nome.trim()}`, "criacao");
  res.status(201).json(withDraft(db.prepare(`${SELECT} WHERE l.id = ?`).get(id)));
});

router.put("/:id", authRequired, (req, res) => {
  const lead = db.prepare(`SELECT * FROM leads_angariacao WHERE id = ?`).get(req.params.id);
  if (!lead) return res.status(404).json({ error: "Lead não encontrado" });
  const b = req.body || {};
  db.prepare(
    `UPDATE leads_angariacao SET nome=?, telefone=?, email=?, endereco=?, origem=?, status=?, valor_vgv=?, observacao=? WHERE id=?`
  ).run(
    b.nome ?? lead.nome, b.telefone ?? lead.telefone, b.email ?? lead.email, b.endereco ?? lead.endereco,
    b.origem ?? lead.origem, b.status ?? lead.status, b.valor ?? lead.valor_vgv, b.observacao ?? lead.observacao, lead.id
  );
  logAcao(req, "Atualizou lead de angariação", "Angariação", `${lead.codigo} · ${b.status ?? lead.status}`, "edicao");
  res.json(withDraft(db.prepare(`${SELECT} WHERE l.id = ?`).get(lead.id)));
});

router.post("/:id/enviar-para-imoveis", authRequired, (req, res) => {
  const lead = db.prepare(`SELECT * FROM leads_angariacao WHERE id = ?`).get(req.params.id);
  if (!lead) return res.status(404).json({ error: "Lead não encontrado" });
  if (lead.enviado_imovel_id) {
    return res.json({ imovelId: lead.enviado_imovel_id, jaEnviado: true });
  }
  if (lead.status !== "Autorização") return res.status(400).json({ error: "O lead precisa estar em Autorização para virar imóvel." });
  const draft = lead.imovel_draft_json ? JSON.parse(lead.imovel_draft_json) : {};

  let proprietario = db.prepare(`SELECT * FROM proprietarios WHERE nome = ?`).get(lead.nome);
  let proprietarioId;
  if (proprietario) proprietarioId = proprietario.id;
  else {
    proprietarioId = randomUUID();
    db.prepare(`INSERT INTO proprietarios (id, nome, telefone, email, endereco) VALUES (?,?,?,?,?)`)
      .run(proprietarioId, lead.nome, lead.telefone, lead.email, lead.endereco);
  }

  const imId = randomUUID();
  const codigo = proximoCodigo("RL-", 109);
  db.prepare(
    `INSERT INTO imoveis (id, codigo, titulo, tipo, bairro, cidade, area, dormitorios, vagas, preco, proprietario_id, corretor_id, exclusivo, comissao_pct, fase, foto_url, matricula, tipo_autorizacao)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).run(
    imId, codigo, draft.titulo || lead.nome + " · imóvel angariado", draft.tipo || "Casa", draft.bairro || null,
    "Florianópolis/SC", draft.area || 0, draft.dorm || null, draft.vagas || 0, draft.preco || lead.valor_vgv || 0,
    proprietarioId, lead.corretor_id, draft.exclusivo ? 1 : 0, draft.comissao || 5, 2,
    "/assets/urban/casa-padrao.jpg", draft.matricula || null, draft.exclusivo ? "Exclusivo" : "Compartilhado"
  );
  db.prepare(`UPDATE leads_angariacao SET enviado_imovel_id = ? WHERE id = ?`).run(imId, lead.id);
  logAcao(req, "Enviou lead para Imóveis", "Angariação", `${lead.codigo} → ${codigo}`, "criacao");
  res.status(201).json({ imovelId: imId, codigo });
});

router.get("/:id/interacoes", authRequired, (req, res) => {
  const lead = db.prepare(`SELECT id FROM leads_angariacao WHERE id = ?`).get(req.params.id);
  if (!lead) return res.status(404).json({ error: "Lead não encontrado" });
  const rows = db.prepare(`SELECT * FROM interacoes_lead WHERE lead_id = ? ORDER BY criado_em DESC`).all(lead.id);
  res.json(rows);
});

router.post("/:id/interacoes", authRequired, (req, res) => {
  const lead = db.prepare(`SELECT * FROM leads_angariacao WHERE id = ?`).get(req.params.id);
  if (!lead) return res.status(404).json({ error: "Lead não encontrado" });
  const b = req.body || {};
  const texto = (b.texto || "").trim();
  if (!texto) return res.status(400).json({ error: "Escreva algo antes de salvar." });
  const tipo = b.tipo === "proximo_passo" ? "proximo_passo" : "conversa";
  const id = randomUUID();
  db.prepare(
    `INSERT INTO interacoes_lead (id, lead_id, tipo, texto, data_prevista, usuario) VALUES (?,?,?,?,?,?)`
  ).run(id, lead.id, tipo, texto, b.dataPrevista || null, req.user?.nome || null);
  logAcao(req, tipo === "proximo_passo" ? "Definiu próximo passo" : "Registrou conversa", "Angariação", `${lead.codigo} · ${lead.nome}`, "edicao");
  res.status(201).json(db.prepare(`SELECT * FROM interacoes_lead WHERE id = ?`).get(id));
});
