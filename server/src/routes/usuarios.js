import { Router } from "express";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { db, proximoCodigo } from "../db.js";
import { authRequired, requireRole } from "../auth.js";
import { logAcao } from "../log.js";

export const router = Router();

function publicUser(u) {
  const { senha_hash, ...rest } = u;
  return rest;
}

router.get("/", authRequired, requireRole("Administrador"), (req, res) => {
  res.json(db.prepare(`SELECT * FROM usuarios ORDER BY criado_em DESC`).all().map(publicUser));
});

const PALETA_CORRETOR = ["#2E7D8C", "#B0543C", "#3F8F5B", "#6B61C9", "#C2913C", "#1F5E6B", "#A2762B"];
function corPara(nome) {
  let h = 0;
  for (const c of nome) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return PALETA_CORRETOR[h % PALETA_CORRETOR.length];
}

// Lista leve de usuários ativos (nome/perfil/cor) para seletores e avatares — qualquer usuário autenticado pode ler.
router.get("/corretores", authRequired, (req, res) => {
  const rows = db.prepare(`SELECT id, nome, perfil FROM usuarios WHERE status = 'Ativo' ORDER BY nome`).all();
  res.json(rows.map((u) => ({ ...u, cor: corPara(u.nome) })));
});

router.post("/", authRequired, requireRole("Administrador"), (req, res) => {
  const b = req.body || {};
  if (!b.nome?.trim()) return res.status(400).json({ error: "Informe o nome do usuário." });
  if (!b.email?.trim()) return res.status(400).json({ error: "Informe o e-mail." });
  if (!b.username?.trim()) return res.status(400).json({ error: "Informe o nome de usuário." });
  if (!b.senha || b.senha.length < 6) return res.status(400).json({ error: "A senha deve ter ao menos 6 caracteres." });
  const id = randomUUID();
  const codigo = proximoCodigo("U-", 8);
  try {
    db.prepare(
      `INSERT INTO usuarios (id, codigo, nome, telefone, email, username, senha_hash, perfil, status)
       VALUES (?,?,?,?,?,?,?,?,?)`
    ).run(id, codigo, b.nome.trim(), b.telefone || null, b.email.trim().toLowerCase(), b.username.trim(),
      bcrypt.hashSync(b.senha, 10), b.perfil || "Corretor", b.status || "Ativo");
  } catch (e) {
    return res.status(400).json({ error: "E-mail ou nome de usuário já cadastrado." });
  }
  logAcao(req, "Criou usuário", "Usuários", `${b.nome.trim()} · ${b.perfil || "Corretor"}`, "criacao");
  res.status(201).json(publicUser(db.prepare(`SELECT * FROM usuarios WHERE id = ?`).get(id)));
});

router.put("/:id", authRequired, requireRole("Administrador"), (req, res) => {
  const u = db.prepare(`SELECT * FROM usuarios WHERE id = ?`).get(req.params.id);
  if (!u) return res.status(404).json({ error: "Usuário não encontrado" });
  const b = req.body || {};
  db.prepare(
    `UPDATE usuarios SET nome=?, telefone=?, email=?, username=?, perfil=?, status=? WHERE id=?`
  ).run(
    b.nome ?? u.nome, b.telefone ?? u.telefone, (b.email ?? u.email).toLowerCase(), b.username ?? u.username,
    b.perfil ?? u.perfil, b.status ?? u.status, u.id
  );
  if (b.status && b.status !== u.status) logAcao(req, "Alterou status do usuário", "Usuários", `${u.nome} → ${b.status}`, "alerta");
  if (b.perfil && b.perfil !== u.perfil) logAcao(req, "Alterou permissão", "Sistema", `${u.nome} → ${b.perfil}`, "alerta");
  res.json(publicUser(db.prepare(`SELECT * FROM usuarios WHERE id = ?`).get(u.id)));
});

router.put("/:id/senha", authRequired, requireRole("Administrador"), (req, res) => {
  const u = db.prepare(`SELECT * FROM usuarios WHERE id = ?`).get(req.params.id);
  if (!u) return res.status(404).json({ error: "Usuário não encontrado" });
  const senha = req.body?.senha;
  if (!senha || senha.length < 6) return res.status(400).json({ error: "A senha deve ter ao menos 6 caracteres." });
  db.prepare(`UPDATE usuarios SET senha_hash = ? WHERE id = ?`).run(bcrypt.hashSync(senha, 10), u.id);
  logAcao(req, "Redefiniu senha de usuário", "Usuários", u.nome, "edicao");
  res.json({ ok: true });
});

router.delete("/:id", authRequired, requireRole("Administrador"), (req, res) => {
  const u = db.prepare(`SELECT * FROM usuarios WHERE id = ?`).get(req.params.id);
  if (!u) return res.status(404).json({ error: "Usuário não encontrado" });
  if (u.id === req.user.id) return res.status(400).json({ error: "Você não pode excluir o próprio usuário." });
  // Desvincula o corretor de qualquer registro existente antes de excluir,
  // pra não travar em restrição de chave estrangeira.
  for (const t of ["imoveis", "leads_angariacao", "negocios", "clientes"]) {
    db.prepare(`UPDATE ${t} SET corretor_id = NULL WHERE corretor_id = ?`).run(u.id);
  }
  db.prepare(`DELETE FROM usuarios WHERE id = ?`).run(u.id);
  logAcao(req, "Excluiu usuário", "Usuários", `${u.nome} · ${u.perfil}`, "exclusao");
  res.json({ ok: true });
});
