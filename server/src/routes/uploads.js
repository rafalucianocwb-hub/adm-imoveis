import { Router } from "express";
import multer from "multer";
import { randomUUID } from "crypto";
import path from "path";
import { authRequired } from "../auth.js";
import { uploadsDir } from "../paths.js";

export const router = Router();

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => cb(null, `${randomUUID()}${path.extname(file.originalname).toLowerCase()}`),
  }),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) return cb(new Error("Envie apenas imagens (JPEG, PNG, WEBP ou GIF)."));
    cb(null, true);
  },
});

router.post("/", authRequired, (req, res) => {
  upload.single("foto")(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: "Nenhum arquivo enviado." });
    res.status(201).json({ url: `/uploads/${req.file.filename}` });
  });
});
