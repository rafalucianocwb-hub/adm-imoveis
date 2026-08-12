import { randomUUID } from "crypto";
import { db } from "./db.js";

export function logAcao(req, acao, modulo, alvo, nivel = "info") {
  db.prepare(
    `INSERT INTO admin_log (id, usuario, acao, modulo, alvo, nivel, ip) VALUES (?,?,?,?,?,?,?)`
  ).run(randomUUID(), req.user?.nome || "Sistema", acao, modulo, alvo, nivel, req.ip);
}
