/**
 * Minimal Groq REST client (no SDK, global fetch) — Nassour's fallback LLM.
 *
 * Groq's free tier is far more generous than Gemini's (thousands of req/day vs
 * ~20), so when Gemini is quota-throttled the engine ropes in Groq and Nassour
 * still answers instead of deflecting to the keyword stub. Groq exposes an
 * OpenAI-compatible Chat Completions API. Reads its key from GROQ_API_KEY; if
 * absent, `isGroqConfigured()` is false and the engine skips this provider.
 *
 * The system prompt (identity + no-deflect rules + metadata footer) and the
 * footer parsing are shared with the Gemini path via `buildSystem` / `llm.ts`,
 * so both providers behave identically.
 */

import { type LlmReply, parseReply } from "./llm.js";

const MODELS = (process.env.GROQ_MODEL || "llama-3.3-70b-versatile")
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);

const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

export function isGroqConfigured(): boolean {
  return Boolean(process.env.GROQ_API_KEY);
}

/**
 * Ask Groq for a grounded answer. Same contract as `askGemini`: tries each
 * model in the chain, throws only when all fail so the engine can fall further.
 */
export async function askGroq(
  question: string,
  catalog: string,
  system: string,
): Promise<LlmReply> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY not set");

  const userPrompt =
    `APPROVED TAMAKAN CONTENT CATALOG:\n${catalog}\n\n` +
    `LEARNER QUESTION:\n${question}`;

  let lastErr: unknown;
  for (const model of MODELS) {
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0.4,
          max_tokens: 1400,
          messages: [
            { role: "system", content: system },
            { role: "user", content: userPrompt },
          ],
        }),
      });

      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        throw new Error(`Groq ${model} ${res.status}: ${detail.slice(0, 160)}`);
      }

      const data = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const raw = data.choices?.[0]?.message?.content;
      if (!raw) throw new Error(`Groq ${model} returned no content`);

      return parseReply(raw);
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr ?? new Error("Groq: all models failed");
}
