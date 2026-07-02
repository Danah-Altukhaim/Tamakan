import express from "express";
import cors from "cors";
import { tracks, users, resources, weeklyActivity } from "./data/mock.js";
import * as progress from "./store/progress.js";
import { answer } from "./assistant/engine.js";
import type { StoredModuleState } from "./data/types.js";

/**
 * Builds the Tamakan Express app without binding a port, so it can be reused
 * both by the local dev server (`index.ts`) and by the Vercel serverless
 * function (`/api/index.ts`).
 */
const app = express();

app.use(cors());
app.use(express.json());

// --- Content -------------------------------------------------------------
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "tamakan-api", version: "0.1.0" });
});

app.get("/api/tracks", (_req, res) => {
  res.json(tracks);
});

app.get("/api/tracks/:id", (req, res) => {
  const track = tracks.find((t) => t.id === req.params.id);
  if (!track) return res.status(404).json({ error: "Track not found" });
  res.json(track);
});

app.get("/api/resources", (_req, res) => {
  res.json(resources);
});

// --- Users / team --------------------------------------------------------
app.get("/api/users", (_req, res) => {
  res.json(users);
});

app.get("/api/users/:id", (req, res) => {
  const user = users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

app.get("/api/activity/:userId", (req, res) => {
  // Single seeded activity series for the demo; keyed by user for realism.
  void req.params.userId;
  res.json(weeklyActivity);
});

// --- Progress ------------------------------------------------------------
app.get("/api/progress", (_req, res) => {
  res.json(progress.getAll());
});

app.get("/api/progress/:userId", (req, res) => {
  res.json(progress.getForUser(req.params.userId));
});

app.post("/api/progress", (req, res) => {
  const { userId, moduleId, state } = req.body ?? {};
  const valid: StoredModuleState[] = ["completed", "in-progress"];
  if (!userId || !moduleId || !valid.includes(state)) {
    return res.status(400).json({
      error: "Body must be { userId, moduleId, state: 'completed' | 'in-progress' }",
    });
  }
  const rec = progress.upsert(userId, moduleId, state);
  res.status(201).json(rec);
});

// --- AI assistant --------------------------------------------------------
app.post("/api/assistant", (req, res) => {
  const { question } = req.body ?? {};
  if (typeof question !== "string" || question.trim().length === 0) {
    return res.status(400).json({ error: "Body must be { question: string }" });
  }
  res.json(answer(question));
});

export default app;
