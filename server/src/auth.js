import jwt from "jsonwebtoken";

export const JWT_SECRET = process.env.JWT_SECRET || "rl-imoveis-dev-secret-change-me";

export function sign(user) {
  return jwt.sign(
    { id: user.id, nome: user.nome, email: user.email, perfil: user.perfil },
    JWT_SECRET,
    { expiresIn: "30d" }
  );
}

export function authRequired(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Não autenticado" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Sessão inválida ou expirada" });
  }
}

export function requireRole(...perfis) {
  return (req, res, next) => {
    if (!req.user || !perfis.includes(req.user.perfil)) {
      return res.status(403).json({ error: "Sem permissão para esta ação" });
    }
    next();
  };
}
