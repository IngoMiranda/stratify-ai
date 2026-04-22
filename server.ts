import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import db from "./server/db.ts";
import { v4 as uuidv4 } from "uuid";
import { geminiService } from "./server/gemini.service.ts";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/competitors", (req, res) => {
    const competitors = db.prepare("SELECT * FROM competitors ORDER BY created_at DESC").all();
    res.json(competitors);
  });

  app.post("/api/competitors", (req, res) => {
    const { name, website, social_media, positioning, offerings } = req.body;
    const id = uuidv4();
    db.prepare("INSERT INTO competitors (id, name, website, social_media, positioning, offerings) VALUES (?, ?, ?, ?, ?, ?)")
      .run(id, name, website, social_media, positioning, offerings);
    res.json({ id, name, website });
  });

  app.get("/api/analyses/:competitorId", (req, res) => {
    const analyses = db.prepare("SELECT * FROM analyses WHERE competitor_id = ? ORDER BY created_at DESC").all(req.params.competitorId);
    res.json(analyses);
  });

  app.post("/api/analyses", (req, res) => {
    const { competitorId, type, content } = req.body;
    const id = uuidv4();
    db.prepare("INSERT INTO analyses (id, competitor_id, type, content) VALUES (?, ?, ?, ?)")
      .run(id, competitorId, type, content);
    res.json({ id, content });
  });

  app.get("/api/strategies", (req, res) => {
    const strategies = db.prepare("SELECT * FROM strategies ORDER BY created_at DESC").all();
    res.json(strategies);
  });

  app.post("/api/strategies", (req, res) => {
    const { title, goal, plan } = req.body;
    const id = uuidv4();
    db.prepare("INSERT INTO strategies (id, title, goal, plan) VALUES (?, ?, ?, ?)")
      .run(id, title, goal, plan);
    res.json({ id, title });
  });

  // AI Endpoints
  app.get("/api/ai/status", (req, res) => {
    res.json(geminiService.getStatus());
  });

  app.post("/api/ai/generate-analysis", async (req, res) => {
    try {
      const { competitorData } = req.body;
      const prompt = `Analise o seguinte concorrente com base no posicionamento, ofertas e comunicação: \n${JSON.stringify(competitorData)}`;
      const analysis = await geminiService.generateContent(prompt);
      res.json({ result: analysis });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to generate analysis" });
    }
  });

  app.post("/api/ai/generate-strategy", async (req, res) => {
    try {
      const { objective } = req.body;
      const prompt = `Gere uma estratégia de crescimento, ideias de conteúdo e diferenciação para o objetivo: ${objective}`;
      const strategy = await geminiService.generateContent(prompt);
      res.json({ result: strategy });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to generate strategy" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
