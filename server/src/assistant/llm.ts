/**
 * Provider-neutral LLM plumbing shared by every backend (Gemini, Groq, …).
 *
 * Nassour asks each provider for a PLAIN-TEXT Markdown answer with a
 * machine-readable metadata footer on the last line; this module owns that
 * footer's shape and parsing so the providers stay thin.
 */

/** Parsed reply the assistant engine consumes, identical across providers. */
export interface LlmReply {
  /** Markdown answer, footer already stripped. */
  answer: string;
  /** true when the answer leans on the provided Tamakan catalog. */
  grounded: boolean;
  /** 0–1 self-assessed confidence. */
  confidence: number;
  /** true when the user should confirm with a senior engineer. */
  escalate: boolean;
}

const META_RE =
  /\[\[META\s+grounded=(true|false)\s+confidence=([0-9]*\.?[0-9]+)\s+escalate=(true|false)\s*\]\]/i;

/**
 * Pull the metadata footer out of a raw model reply and strip it (plus any
 * trailing code fences) from the visible answer. If the model omitted the
 * footer, fall back to sensible defaults.
 */
export function parseReply(raw: string): LlmReply {
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
