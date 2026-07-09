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

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const ENDPOINT = (key: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`;

export function isConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

/** Parsed reply the engine consumes. */
export interface GeminiReply {
  /** Markdown answer, footer already stripped. */
  answer: string;
  /** true when the answer leans on the provided Tamakan catalog. */
  grounded: boolean;
  /** 0–1 self-assessed confidence. */
  confidence: number;
  /** true when the user should confirm with a senior engineer. */
  escalate: boolean;
}

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
  "GROUNDING:\n" +
  "  • You are given a catalog of APPROVED Tamakan content. When the question " +
  "maps to it, ground your answer in that content (grounded=true).\n" +
  "  • For general petroleum-engineering questions NOT in the catalog, you may " +
  "answer from established domain knowledge, but note it is general guidance, " +
  "not an approved KOC procedure (grounded=false).\n" +
  "  • NEVER fabricate KOC-specific procedures, field/well names, or numeric " +
  "thresholds. If you don't know a KOC-specific detail, say so (escalate=true).\n" +
  "  • escalate=true for safety-critical actions or whenever you are unsure.\n\n" +
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

const META_RE =
  /\[\[META\s+grounded=(true|false)\s+confidence=([0-9]*\.?[0-9]+)\s+escalate=(true|false)\s*\]\]/i;

/**
 * Ask Gemini for a grounded answer. `catalog` is the compact list of approved
 * Tamakan content; `question` is the learner's question. Throws on any network
 * or API error so the engine can fall back.
 */
export async function askGemini(
  question: string,
  catalog: string,
  system: string = buildSystem(),
): Promise<GeminiReply> {
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

  const res = await fetch(ENDPOINT(key), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Gemini ${res.status}: ${detail.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) throw new Error("Gemini returned no content");

  // Pull the metadata footer, then strip it (and any trailing fences) from the
  // visible answer. If the model omitted it, fall back to sensible defaults.
  const meta = raw.match(META_RE);
  const answer = raw
    .replace(META_RE, "")
    .replace(/```+\s*$/g, "")
    .trim();

  return {
    answer,
    grounded: meta ? meta[1].toLowerCase() === "true" : false,
    confidence: meta ? Math.max(0, Math.min(1, Number(meta[2]))) : 0.8,
    escalate: meta ? meta[3].toLowerCase() === "true" : false,
  };
}
