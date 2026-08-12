import { Router } from "express";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { db } from "../db.js";
import { sign, authRequired } from "../auth.js";
import { logAcao } from "../log.js";

export const router = Router();

function publicUser(u) {
  const { senha_hash, ...rest } = u;
  return rest;
}

router.post("/login", (req, res) => {
  const { email, senha } = req.body || {};
  const u = db.prepare(`SELECT * FROM usuarios WHERE email = ?`).get((email || "").toLowerCase().trim());
  if (!u || u.status !== "Ativo" || !bcrypt.compareSync(senha || "", u.senha_hash)) {
    return res.status(401).json({ error: "E-mail ou senha inválidos" });
  }
  const sessId = randomUUID();
  db.prepare(`INSERT INTO sessoes (id, usuario_id) VALUES (?,?)`).run(sessId, u.id);
  db.prepare(`UPDATE usuarios SET ultimo_acesso = datetime('now') WHERE id = ?`).run(u.id);
  const token = sign(u);
  db.prepare(`INSERT INTO admin_log (id, usuario, acao, modulo, alvo, nivel, ip) VALUES (?,?,?,?,?,?,?)`)
    .run(randomUUID(), u.nome, "Login", "Sistema", "Sessão iniciada", "info", req.ip);
  res.json({ token, sessionId: sessId, user: publicUser(u) });
});

router.post("/logout", authRequired, (req, res) => {
  const { sessionId } = req.body || {};
  if (sessionId) db.prepare(`UPDATE sessoes SET fim = datetime('now') WHERE id = ?`).run(sessionId);
  logAcao(req, "Logout", "Sistema", "Sessão encerrada", "info");
  res.json({ ok: true });
});

router.get("/me", authRequired, (req, res) => {
  const u = db.prepare(`SELECT * FROM usuarios WHERE id = ?`).get(req.user.id);
  if (!u) return res.status(404).json({ error: "Usuário não encontrado" });
  res.json(publicUser(u));
});
