import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Em produção (Railway), UPLOADS_DIR deve apontar para dentro do volume
// persistente (ex.: /data/uploads), senão as fotos somem a cada deploy.
export const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, "..", "data", "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });
