import { Router } from "express";
import { randomUUID } from "crypto";
import { db, proximoCodigo } from "../db.js";
import { authRequired } from "../auth.js";
import { logAcao } from "../log.js";

export const router = Router();

const SELECT = `
  SELECT i.*, p.nome AS proprietario_nome, p.telefone AS proprietario_tel, p.email AS proprietario_email,
         u.nome AS corretor_nome
  FROM imoveis i
  LEFT JOIN proprietarios p ON p.id = i.proprietario_id
  LEFT JOIN usuarios u ON u.id = i.corretor_id
`;

function withCounts(im) {
  const propostas = db.prepare(`SELECT COUNT(*) n FROM negocios WHERE imovel_id = ? AND etapa IN ('proposta','negoc','doc')`).get(im.id).n;
  return { ...im, exclusivo: !!im.exclusivo, propostas: Math.max(im.propostas, propostas) };
}

router.get("/", authRequired, (req, res) => {
  const { tipo } = req.query;
  let sql = SELECT;
  const params = [];
  if (tipo && tipo !== "Todos") {
    sql += ` WHERE i.tipo = ?`;
    params.push(tipo);
  }
  sql += ` ORDER BY i.criado_em DESC`;
  const rows = db.prepare(sql).all(...params).map(withCounts);
  res.json(rows);
});

router.get("/:id", authRequired, (req, res) => {
  const im = db.prepare(`${SELECT} WHERE i.id = ?`).get(req.params.id);
  if (!im) return res.status(404).json({ error: "Imóvel não encontrado" });
  res.json(withCounts(im));
});

router.post("/", authRequired, (req, res) => {
  const b = req.body || {};
  if (!b.titulo?.trim()) return res.status(400).json({ error: "Informe o título do imóvel." });
  if (!b.proprietarioNome?.trim()) return res.status(400).json({ error: "Informe o nome do proprietário." });

  let proprietario = db.prepare(`SELECT * FROM proprietarios WHERE nome = ?`).get(b.proprietarioNome.trim());
  let proprietarioId;
  if (proprietario) {
    proprietarioId = proprietario.id;
    db.prepare(`UPDATE proprietarios SET telefone=?, email=? WHERE id=?`).run(b.proprietarioTel || null, b.proprietarioEmail || null, proprietarioId);
  } else {
    proprietarioId = randomUUID();
    db.prepare(`INSERT INTO proprietarios (id, nome, telefone, email) VALUES (?,?,?,?)`).run(proprietarioId, b.proprietarioNome.trim(), b.proprietarioTel || null, b.proprietarioEmail || null);
  }

  const corretor = b.corretorNome ? db.prepare(`SELECT id FROM usuarios WHERE nome = ?`).get(b.corretorNome) : null;

  const id = randomUUID();
  const codigo = proximoCodigo("RL-", 109);
  db.prepare(
    `INSERT INTO imoveis (id, codigo, titulo, tipo, bairro, cidade, area, dormitorios, vagas, preco, proprietario_id, corretor_id, exclusivo, comissao_pct, fase, foto_url, matricula, tipo_autorizacao)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).run(
    id, codigo, b.titulo.trim(), b.tipo || "Casa", b.bairro || null, b.cidade || "Florianópolis/SC",
    b.area || 0, b.dormitorios || null, b.vagas || 0, b.preco || 0, proprietarioId, corretor?.id || null,
    b.exclusivo ? 1 : 0, b.comissaoPct || 5, 1, b.fotoUrl || "/assets/urban/casa-padrao.jpg", b.matricula || null,
    b.exclusivo ? "Exclusivo" : "Compartilhado"
  );
  logAcao(req, "Criou imóvel", "Imóveis", `${codigo} · ${b.titulo.trim()}`, "criacao");
  res.status(201).json(withCounts(db.prepare(`${SELECT} WHERE i.id = ?`).get(id)));
});

router.put("/:id", authRequired, (req, res) => {
  const im = db.prepare(`SELECT * FROM imoveis WHERE id = ?`).get(req.params.id);
  if (!im) return res.status(404).json({ error: "Imóvel não encontrado" });
  const b = req.body || {};
  db.prepare(
    `UPDATE imoveis SET titulo=?, tipo=?, bairro=?, area=?, dormitorios=?, vagas=?, preco=?, exclusivo=?, comissao_pct=?, matricula=? WHERE id=?`
  ).run(
    b.titulo ?? im.titulo, b.tipo ?? im.tipo, b.bairro ?? im.bairro, b.area ?? im.area, b.dormitorios ?? im.dormitorios,
    b.vagas ?? im.vagas, b.preco ?? im.preco, b.exclusivo != null ? (b.exclusivo ? 1 : 0) : im.exclusivo,
    b.comissaoPct ?? im.comissao_pct, b.matricula ?? im.matricula, im.id
  );
  logAcao(req, "Editou imóvel", "Imóveis", `${im.codigo}`, "edicao");
  res.json(withCounts(db.prepare(`${SELECT} WHERE i.id = ?`).get(im.id)));
});

router.post("/:id/fase", authRequired, (req, res) => {
  const im = db.prepare(`SELECT * FROM imoveis WHERE id = ?`).get(req.params.id);
  if (!im) return res.status(404).json({ error: "Imóvel não encontrado" });
  const fase = Math.min(8, Math.max(1, req.body?.fase ?? im.fase + 1));
  db.prepare(`UPDATE imoveis SET fase = ? WHERE id = ?`).run(fase, im.id);
  logAcao(req, "Avançou fase do imóvel", "Imóveis", `${im.codigo} → fase ${fase}`, "edicao");
  res.json(withCounts(db.prepare(`${SELECT} WHERE i.id = ?`).get(im.id)));
});

router.delete("/:id", authRequired, (req, res) => {
  const im = db.prepare(`SELECT * FROM imoveis WHERE id = ?`).get(req.params.id);
  if (!im) return res.status(404).json({ error: "Imóvel não encontrado" });
  db.prepare(`DELETE FROM imoveis WHERE id = ?`).run(im.id);
  logAcao(req, "Excluiu imóvel", "Imóveis", `${im.codigo}`, "exclusao");
  res.json({ ok: true });
});
