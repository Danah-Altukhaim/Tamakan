// Vercel serverless entry point for the Tamakan API.
//
// The Vercel build runs `npm run build`, which compiles the server workspace
// to `server/dist` (ESM). Vercel compiles this file to CommonJS, so we can't
// statically `import` the ESM app — we lazily `import()` it (which works from
// CommonJS) and hand the resulting Express app to Vercel as the request
// handler. The `/api/(.*)` rewrite in `vercel.json` funnels every API route
// into this one function; Express does the internal routing.
import type { IncomingMessage, ServerResponse } from "http";

type Handler = (req: IncomingMessage, res: ServerResponse) => void;

let appPromise: Promise<Handler> | null = null;

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (!appPromise) {
    appPromise = import("../server/dist/app.js").then(
      (m) => m.default as unknown as Handler,
    );
  }
  const app = await appPromise;
  return app(req, res);
}
