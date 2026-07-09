/**
 * Minimal Google Gemini REST client (no SDK dependency, uses global fetch).
 *
 * The real LLM backend for the Tamakan assistant (PRD §13.4). Reads its key
 * from GEMINI_API_KEY. If the key is absent, `isConfigured()` is false and the
 * engine falls back to the deterministic keyword stub, so the app still runs
 * with zero config.
 *
 * We ask for a PLAIN-TEXT Markdown answer (not JSON): Gemini's JSON-schema mode
 * collapses multi-line Markdown into a terse single sentence. To still get the
 * grounded/confidence/escalate signals, the model appends a machine-readable
 * metadata footer on the last line, which we parse out and strip.
 */

/**
 * Ordered list of models to try. GEMINI_MODEL may be a comma-separated chain,
 * e.g. "gemini-2.5-flash,gemini-2.5-flash-lite,gemini-2.0-flash". When a model
 * is throttled (429) or briefly unavailable (503) we fall through to the next
 * one rather than deflecting to the keyword stub. The keyword fallback only
 * fires if EVERY model in the chain fails.
 */
const MODELS = (process.env.GEMINI_MODEL || "gemini-2.5-flash")
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);

const ENDPOINT = (model: string, key: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

export function isConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

import { type LlmReply, parseReply } from "./llm.js";

const IDENTITY =
  "You are Nassour, the AI learning assistant for Kuwait Oil Company (KOC), " +
  "Engineering & Reservoir department. You help petroleum and reservoir " +
  "engineers with technical questions: reservoir simulation, well test / PTA, " +
  "SBHP & PGOR validation, PIPESIM/nodal analysis, completions, stimulation, " +
  "field operations and safety, and related topics.\n\n" +
  "IDENTITY: Your name is Nassour. Whenever you refer to yourself or are asked " +
  "who or what you are, always say 'I am Nassour' — never call yourself just " +
  "'an AI assistant'. Keep this name in refusals and off-topic replies too. You " +
  "route questions to your internal discipline desks, but you are always one " +
  "assistant named Nassour — never mention the desk name to the user.\n\n";

const STYLE =
  "ANSWER STYLE, format every answer as clean, professional Markdown with two " +
  "parts; never a single flat block and never just one sentence:\n" +
  "  • PART 1: one lead sentence that directly answers the question.\n" +
  "  • PART 2 (REQUIRED, never omit): break the specifics into a Markdown list, " +
  "a bulleted list ('- ') for causes/factors/options, or a numbered list ('1.') " +
  "for ordered steps/procedures. Give 3–6 items.\n" +
  "  • Bold the key term at the start of each item, e.g. '- **Liquid loading:** " +
  "water builds up in the wellbore and raises hydrostatic head.'\n" +
  "  • One tight sentence per item, no filler, no restating the question. Use " +
  "'### ' sub-headings only for long, multi-section answers. You may end with a " +
  "single bold takeaway line.\n\n" +
  "ALWAYS ANSWER — NEVER DEFLECT:\n" +
  "  • Every question gets a real, substantive technical answer. NEVER reply " +
  "with only 'open the cited items', 'work through the procedure', 'refer to the " +
  "track', or 'ask a senior engineer' — those are deflections, not answers. " +
  "Explain the concept, method, or procedure yourself, in full, from established " +
  "petroleum- and reservoir-engineering knowledge.\n" +
  "  • When the question maps to the approved catalog, ground your answer in it " +
  "(grounded=true) AND still explain it fully. When it doesn't map, answer from " +
  "domain knowledge (grounded=false). Either way you always explain — citations " +
  "are a supplement to your answer, never a replacement for it.\n" +
  "  • Do not invent KOC-specific EXACT numeric thresholds, field/well names, or " +
  "proprietary step numbers. Explain the general method completely; if a specific " +
  "KOC value is required, give the engineering basis for it and add one brief line " +
  "to confirm the exact figure locally — as a supplement, never instead of the " +
  "answer.\n" +
  "  • Keep escalate=false by default. Set escalate=true ONLY when the question is " +
  "safety-critical and acting on a wrong answer could cause harm — and even then, " +
  "answer the question first, then add the caution.\n\n" +
  "METADATA FOOTER, after the answer, output NOTHING but this as the very last " +
  "line, on its own line, exactly in this form:\n" +
  "[[META grounded=<true|false> confidence=<0..1> escalate=<true|false>]]\n" +
  "Do not wrap it in code fences or add text after it.";

/**
 * Compose Nassour's full system prompt. `focus` is an optional discipline-desk
 * specialization inserted between the identity and the answer rules; when
 * omitted, Nassour answers as a generalist.
 */
export function buildSystem(focus?: string): string {
  return focus ? `${IDENTITY}${focus}\n\n${STYLE}` : `${IDENTITY}${STYLE}`;
}

/**
 * Ask Gemini for a grounded answer. `catalog` is the compact list of approved
 * Tamakan content; `question` is the learner's question. Tries each model in
 * the MODELS chain in order; a 429/503 on one model falls through to the next.
 * Throws only when EVERY model fails, so the engine can move to the next
 * provider (Groq) and only then the keyword stub.
 */
export async function askGemini(
  question: string,
  catalog: string,
  system: string = buildSystem(),
): Promise<LlmReply> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY not set");

  const prompt =
    `APPROVED TAMAKAN CONTENT CATALOG:\n${catalog}\n\n` +
    `LEARNER QUESTION:\n${question}`;

  const body = {
    systemInstruction: { parts: [{ text: system }] },
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 1400,
      // Disable "thinking" so the token budget goes to the answer, not hidden
      // reasoning, faster replies on 2.5-flash.
      thinkingConfig: { thinkingBudget: 0 },
    },
  };

  let lastErr: unknown;
  for (const model of MODELS) {
    try {
      const res = await fetch(ENDPOINT(model, key), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        throw new Error(`Gemini ${model} ${res.status}: ${detail.slice(0, 160)}`);
      }

      const data = (await res.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!raw) throw new Error(`Gemini ${model} returned no content`);

      return parseReply(raw);
    } catch (err) {
      lastErr = err;
      // Try the next model in the chain (e.g. on 429 quota / 503 overload).
    }
  }
  throw lastErr ?? new Error("Gemini: all models failed");
}
