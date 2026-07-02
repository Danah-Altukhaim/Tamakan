/**
 * Loads server/.env for local development (zero-dependency, Node built-in).
 *
 * On Vercel this file's load is a no-op: there is no .env on the deploy, and
 * GEMINI_API_KEY is supplied via the project's Environment Variables instead.
 * Imported first by the local dev entry (index.ts) so keys are present before
 * any request is handled.
 */
try {
  // Node 20.12+/22: reads KEY=VALUE lines from ./.env into process.env.
  (process as unknown as { loadEnvFile?: (p?: string) => void }).loadEnvFile?.(
    ".env",
  );
} catch {
  // No .env file present (e.g. on Vercel or first run) — that's fine.
}
