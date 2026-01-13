import type { ParsedInlineMdBlock } from "./types";
import { parseAttributes } from "./attributes";

function buildLineStartIndices(markdown: string): number[] {
  const starts: number[] = [0];
  for (let i = 0; i < markdown.length; i++) {
    if (markdown[i] === "\n") starts.push(i + 1);
  }
  return starts;
}

function trimSingleTrailingNewline(value: string): string {
  return value.endsWith("\n") ? value.slice(0, -1) : value;
}

export function findFencedBlocks(markdown: string): ParsedInlineMdBlock[] {
  const blocks: ParsedInlineMdBlock[] = [];
  const lineStarts = buildLineStartIndices(markdown);

  for (let i = 0; i < lineStarts.length; i++) {
    const lineStart = lineStarts[i];
    const lineEnd =
      i + 1 < lineStarts.length ? lineStarts[i + 1] : markdown.length;
    const rawLine = markdown.slice(lineStart, lineEnd).replace(/\n$/, "");

    const openMatch = rawLine.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (!openMatch) continue;

    const fence = openMatch[1];
    const fenceChar = fence[0];
    const fenceLen = fence.length;
    const afterFence = openMatch[2].trimStart();

    const infoMatch = afterFence.match(/^(nested-md)\b(.*)$/);
    if (!infoMatch) continue;

    const attributeText = (infoMatch[2] || "").trim();
    const attributes = parseAttributes(attributeText);

    let closeLineIndex = -1;
    for (let j = i + 1; j < lineStarts.length; j++) {
      const closeStart = lineStarts[j];
      const closeEnd =
        j + 1 < lineStarts.length ? lineStarts[j + 1] : markdown.length;
      const closeLine = markdown.slice(closeStart, closeEnd).replace(/\n$/, "");
      const closeRegex = new RegExp(
        `^ {0,3}${fenceChar === "`" ? "`" : "~"}{${fenceLen},}\\s*$`
      );
      if (closeRegex.test(closeLine)) {
        closeLineIndex = j;
        break;
      }
    }

    if (closeLineIndex === -1) continue;

    const bodyStart = i + 1 < lineStarts.length ? lineStarts[i + 1] : lineEnd;
    const bodyEnd = lineStarts[closeLineIndex];
    const bodyRaw = markdown.slice(bodyStart, bodyEnd);
    const nestedMarkdown = trimSingleTrailingNewline(bodyRaw);

    const closeLineEnd =
      closeLineIndex + 1 < lineStarts.length
        ? lineStarts[closeLineIndex + 1]
        : markdown.length;

    blocks.push({
      startIndex: lineStart,
      endIndex: closeLineEnd,
      attributes,
      nestedMarkdown,
    });

    i = closeLineIndex;
  }

  return blocks;
}
