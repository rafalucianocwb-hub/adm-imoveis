import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import { router as authRouter } from "./routes/auth.js";
import { router as dashboardRouter } from "./routes/dashboard.js";
import { router as imoveisRouter } from "./routes/imoveis.js";
import { router as proprietariosRouter } from "./routes/proprietarios.js";
import { router as negociosRouter } from "./routes/negocios.js";
import { router as clientesRouter } from "./routes/clientes.js";
import { router as contratosRouter } from "./routes/contratos.js";
import { router as campanhasRouter } from "./routes/campanhas.js";
import { router as financeiroRouter } from "./routes/financeiro.js";
import { router as relatoriosRouter } from "./routes/relatorios.js";
import { router as logRouter } from "./routes/log.js";
import { router as usuariosRouter } from "./routes/usuarios.js";
import { db } from "./db.js";

// Primeiro boot num banco vazio (ex.: volume novo no Railway) — popula
// automaticamente com os dados de demonstração. Nunca roda se já houver
// usuários cadastrados, então não apaga dados reais em restarts/deploys.
if (db.prepare("SELECT COUNT(*) n FROM usuarios").get().n === 0) {
  console.log("Banco vazio — populando com dados de demonstração...");
  await import("./seed.js");
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));

app.use("/api/auth", authRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/imoveis", imoveisRouter);
app.use("/api/proprietarios", proprietariosRouter);
app.use("/api/negocios", negociosRouter);
app.use("/api/clientes", clientesRouter);
app.use("/api/contratos", contratosRouter);
app.use("/api/campanhas", campanhasRouter);
app.use("/api/financeiro", financeiroRouter);
app.use("/api/relatorios", relatoriosRouter);
app.use("/api/log", logRouter);
app.use("/api/usuarios", usuariosRouter);

// Em produção, o build do frontend (client/dist) é servido pelo próprio
// Express, como um único serviço — não precisa de um servidor separado.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.join(__dirname, "..", "..", "client", "dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (req, res) => res.sendFile(path.join(clientDist, "index.html")));
}

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Erro interno do servidor" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`RL Imóveis API rodando em http://localhost:${PORT}`));
