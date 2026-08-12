import { Router } from "express";
import { db } from "../db.js";
import { authRequired } from "../auth.js";

export const router = Router();

router.get("/", authRequired, (req, res) => {
  const { usuario, modulo } = req.query;
  let sql = `SELECT * FROM admin_log WHERE 1=1`;
  const params = [];
  if (usuario && usuario !== "Todos") { sql += ` AND usuario = ?`; params.push(usuario); }
  if (modulo && modulo !== "Todos") { sql += ` AND modulo = ?`; params.push(modulo); }
  sql += ` ORDER BY criado_em DESC LIMIT 500`;
  res.json(db.prepare(sql).all(...params));
});
