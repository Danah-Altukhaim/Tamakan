import { Fragment, type ReactNode } from "react";

/**
 * Tiny, dependency-free Markdown renderer for assistant answers.
 * Supports the subset the model is prompted to produce: short paragraphs,
 * '### ' sub-headings, '- '/'* ' bullet lists, '1.' numbered lists, and inline
 * **bold**, *italic*, and `code`. RTL-safe (logical padding via `ps-*`).
 */

const BULLET = /^\s*[-*•]\s+(.*)$/;
const NUMBERED = /^\s*\d+[.)]\s+(.*)$/;
const HEADING = /^\s*(#{1,3})\s+(.*)$/;

/** Render inline **bold**, *italic*, and `code` within a line of text. */
function renderInline(text: string, keyBase: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|`([^`]+)`|\*([^*]+)\*|_([^_]+)_/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const key = `${keyBase}-${i++}`;
    if (m[1] !== undefined) nodes.push(<strong key={key} className="font-semibold">{m[1]}</strong>);
    else if (m[2] !== undefined)
      nodes.push(
        <code key={key} className="rounded bg-black/[0.06] px-1 py-0.5 text-[0.85em]">
          {m[2]}
        </code>,
      );
    else if (m[3] !== undefined) nodes.push(<em key={key}>{m[3]}</em>);
    else if (m[4] !== undefined) nodes.push(<em key={key}>{m[4]}</em>);
    last = re.lastIndex;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function Markdown({ text }: { text: string }) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Blank line → skip (paragraph separator).
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Heading.
    const h = line.match(HEADING);
    if (h) {
      blocks.push(
        <p key={key++} className="mb-1 mt-3 font-semibold first:mt-0">
          {renderInline(h[2], `h${key}`)}
        </p>,
      );
      i++;
      continue;
    }

    // Bullet list, consume consecutive bullet lines.
    if (BULLET.test(line)) {
      const items: ReactNode[] = [];
      while (i < lines.length && BULLET.test(lines[i])) {
        const content = lines[i].match(BULLET)![1];
        items.push(
          <li key={items.length} className="leading-relaxed">
            {renderInline(content, `b${key}-${items.length}`)}
          </li>,
        );
        i++;
      }
      blocks.push(
        <ul key={key++} className="my-2 list-disc space-y-1 ps-5 first:mt-0 last:mb-0">
          {items}
        </ul>,
      );
      continue;
    }

    // Numbered list, consume consecutive numbered lines.
    if (NUMBERED.test(line)) {
      const items: ReactNode[] = [];
      while (i < lines.length && NUMBERED.test(lines[i])) {
        const content = lines[i].match(NUMBERED)![1];
        items.push(
          <li key={items.length} className="leading-relaxed">
            {renderInline(content, `n${key}-${items.length}`)}
          </li>,
        );
        i++;
      }
      blocks.push(
        <ol key={key++} className="my-2 list-decimal space-y-1 ps-5 first:mt-0 last:mb-0">
          {items}
        </ol>,
      );
      continue;
    }

    // Paragraph, join consecutive plain lines until a blank/structural line.
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !BULLET.test(lines[i]) &&
      !NUMBERED.test(lines[i]) &&
      !HEADING.test(lines[i])
    ) {
      para.push(lines[i].trim());
      i++;
    }
    blocks.push(
      <p key={key++} className="my-2 leading-relaxed first:mt-0 last:mb-0">
        {renderInline(para.join(" "), `p${key}`)}
      </p>,
    );
  }

  return <Fragment>{blocks}</Fragment>;
}
