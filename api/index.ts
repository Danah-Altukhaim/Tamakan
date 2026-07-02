// Vercel serverless entry point for the Tamakan API.
//
// The Vercel build runs `npm run build`, which compiles the server workspace
// to `server/dist`. We import the already-built Express app (plain ESM JS, so
// the bundler resolves its `.js` imports natively) and hand it to Vercel,
// which invokes an Express app as the function handler. The `/api/(.*)` rewrite
// in `vercel.json` funnels every API route into this one function.
import app from "../server/dist/app.js";

export default app;
