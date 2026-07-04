import { tracks, resources } from "../data/mock.js";
import type { AssistantAnswer, Citation } from "../data/types.js";
import { askGemini, isConfigured } from "./gemini.js";

/**
 * Grounded Q&A for the Tamakan assistant (PRD §6.3, FR-A2/A3).
 *
 * Hybrid design:
 *  1. Deterministic keyword retrieval scores the approved Tamakan catalog
 *     (tracks/modules/resources) against the question → gives us the clickable
 *     Citations, exactly as before.
 *  2. If a Gemini key is configured (GEMINI_API_KEY), we hand the question plus
 *     a compact catalog to the LLM for the prose answer, it grounds in KOC
 *     content when it can and clearly flags general domain guidance otherwise.
 *  3. If no key is set, or the LLM call fails, we fall back to the original
 *     keyword stub so the app never breaks.
 *
 * The HTTP contract (AssistantAnswer) is unchanged, so the client never moves.
 */

interface Scored {
  citation: Citation;
  score: number;
  blurb: string;
}

const STOP = new Set([
  "the", "a", "an", "of", "to", "in", "on", "for", "and", "or", "is", "are",
  "how", "what", "do", "i", "my", "me", "with", "about", "can", "you", "it",
  "this", "that", "which", "where", "when", "why", "who",
]);

function tokenize(q: string): string[] {
  return q
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP.has(w));
}

function scoreText(text: string, terms: string[]): number {
  const hay = text.toLowerCase();
  let s = 0;
  for (const t of terms) if (hay.includes(t)) s += 1;
  return s;
}

/** Score the approved catalog against the question; return the top hits. */
function retrieve(question: string): Scored[] {
  const terms = tokenize(question);
  const hits: Scored[] = [];

  for (const track of tracks) {
    const base = scoreText(`${track.title}`, terms);
    if (base > 0) {
      hits.push({
        citation: { kind: "track", id: track.id, label: track.title },
        score: base * 2,
        blurb: `the “${track.title}” track`,
      });
    }
    for (const m of track.modules) {
      const s = scoreText(`${m.title}`, terms);
      if (s > 0) {
        hits.push({
          citation: { kind: "module", id: m.id, label: `${track.title} · ${m.title}` },
          score: s,
          blurb: `the module “${m.title}” (in ${track.title})`,
        });
      }
    }
  }

  for (const r of resources) {
    const s = scoreText(`${r.title} ${r.tags.join(" ")}`, terms);
    if (s > 0) {
      hits.push({
        citation: { kind: "resource", id: r.id, label: r.title },
        score: s,
        blurb: `the resource “${r.title}”`,
      });
    }
  }

  hits.sort((a, b) => b.score - a.score);
  return hits;
}

/**
 * Compact, cached catalog string handed to the LLM as grounding context.
 * Built once, the mock content is static for the demo.
 */
let catalogCache: string | null = null;
function catalog(): string {
  if (catalogCache) return catalogCache;
  const trackLines = tracks.map((t) => {
    const mods = t.modules.map((m) => m.title).join("; ");
    return `- TRACK "${t.title}" (${t.department}): modules, ${mods}`;
  });
  const resLines = resources.map(
    (r) => `- RESOURCE "${r.title}" [${r.level}, ${r.type}]: ${r.description}`,
  );
  catalogCache = [...trackLines, ...resLines].join("\n");
  return catalogCache;
}

/** Original deterministic answer, used as the no-key / error fallback. */
function keywordAnswer(question: string): AssistantAnswer {
  const terms = tokenize(question);
  const top = retrieve(question).slice(0, 3);
  const best = top[0]?.score ?? 0;
  const confidence = terms.length === 0 ? 0 : Math.min(1, best / Math.max(2, terms.length));
  const escalate = confidence < 0.34 || top.length === 0;

  let text: string;
  if (top.length === 0) {
    text =
      "I couldn't find approved Tamakan content that covers that. I don't want to " +
      "guess at a KOC procedure, so I'd suggest asking a senior engineer or your " +
      "team lead, you can also refine the question with a tool or workflow name.";
  } else {
    const refs = top.map((h) => h.blurb);
    const list =
      refs.length === 1
        ? refs[0]
        : `${refs.slice(0, -1).join(", ")} and ${refs[refs.length - 1]}`;
    text =
      `Based on approved Tamakan content, the most relevant material is ${list}. ` +
      `Open the cited item${top.length > 1 ? "s" : ""} below to work through the ` +
      `procedure step by step.`;
    if (escalate) {
      text +=
        " I'm only moderately confident this fully answers your question, if it's " +
        "not quite right, please confirm with a senior engineer.";
    }
  }

  return {
    answer: text,
    citations: top.map((h) => h.citation),
    confidence: Number(confidence.toFixed(2)),
    escalate,
  };
}

/**
 * Answer a learner question. Async because it may call the LLM.
 * Falls back to the keyword stub when no key is configured or the call fails.
 */
export async function answer(question: string): Promise<AssistantAnswer> {
  if (!isConfigured()) return keywordAnswer(question);

  try {
    const hits = retrieve(question);
    const citations = hits.slice(0, 3).map((h) => h.citation);
    const reply = await askGemini(question, catalog());

    return {
      answer: reply.answer || keywordAnswer(question).answer,
      // Only surface KOC sources when the answer is actually grounded in them.
      citations: reply.grounded ? citations : [],
      confidence: Number(reply.confidence.toFixed(2)),
      escalate: reply.escalate,
    };
  } catch (err) {
    console.error("[tamakan] Gemini call failed, using keyword fallback:", err);
    return keywordAnswer(question);
  }
}
