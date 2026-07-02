import { tracks, resources } from "../data/mock.js";
import type { AssistantAnswer, Citation } from "../data/types.js";

/**
 * Grounded Q&A stub (PRD §6.3, FR-A2/A3).
 *
 * This is a deliberately transparent keyword-retrieval stand-in for the real
 * retrieval/model backend (TBD — PRD §13.4). It ONLY answers from Tamakan
 * content: it scores tracks/modules/resources against the question, cites what
 * it used, and escalates ("ask a human") when nothing scores well — so it never
 * fabricates a procedure. Swap this module for the real RAG client later; the
 * HTTP contract (AssistantAnswer) stays the same.
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

export function answer(question: string): AssistantAnswer {
  const terms = tokenize(question);
  const hits: Scored[] = [];

  for (const track of tracks) {
    const base = scoreText(`${track.title} ${track.titleAr}`, terms);
    if (base > 0) {
      hits.push({
        citation: { kind: "track", id: track.id, label: track.title },
        score: base * 2,
        blurb: `the “${track.title}” track`,
      });
    }
    for (const m of track.modules) {
      const s = scoreText(`${m.title} ${m.titleAr}`, terms);
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
    const s = scoreText(`${r.title} ${r.titleAr} ${r.tags.join(" ")}`, terms);
    if (s > 0) {
      hits.push({
        citation: { kind: "resource", id: r.id, label: r.title },
        score: s,
        blurb: `the resource “${r.title}”`,
      });
    }
  }

  hits.sort((a, b) => b.score - a.score);
  const top = hits.slice(0, 3);

  // Confidence: normalize best score against the question length, capped.
  const best = top[0]?.score ?? 0;
  const confidence = terms.length === 0 ? 0 : Math.min(1, best / Math.max(2, terms.length));
  const escalate = confidence < 0.34 || top.length === 0;

  let text: string;
  if (top.length === 0) {
    text =
      "I couldn't find approved Tamakan content that covers that. I don't want to " +
      "guess at a KOC procedure, so I'd suggest asking a senior engineer or your " +
      "team lead — you can also refine the question with a tool or workflow name.";
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
        " I'm only moderately confident this fully answers your question — if it's " +
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
