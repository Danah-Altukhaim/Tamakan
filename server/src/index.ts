import app from "./app.js";

// Local development entry point. On Vercel the app is served by the
// serverless function at `/api/index.ts`, which imports the same `app`.
const PORT = Number(process.env.PORT) || 3001;

app.listen(PORT, () => {
  console.log(`[tamakan] API listening on http://localhost:${PORT}`);
});
