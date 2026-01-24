import type { ParsedInlineMdBlock } from "./types";
import { parseAttributes } from "./attributes";

export function findCommentBlocks(markdown: string): ParsedInlineMdBlock[] {
  const blocks: ParsedInlineMdBlock[] = [];
  const startRegex = /<!--\s*nested-md:start(?:\s+([^>]*?))?\s*-->/gi;
  let startMatch;

  while ((startMatch = startRegex.exec(markdown)) !== null) {
    const startIndex = startMatch.index;
    const startComment = startMatch[0];
    const afterStartIndex = startIndex + startComment.length;
    const endRegex = /<!--\s*nested-md:end\s*-->/i;
    const endMatch = endRegex.exec(markdown.slice(afterStartIndex));
    if (!endMatch) continue;

    const endIndex = afterStartIndex + endMatch.index;
    const endComment = endMatch[0];
    const blockContent = markdown.substring(afterStartIndex, endIndex);
    const attributeText = (startMatch[1] || "").trim();
    const attributes = parseAttributes(attributeText);

    const mdFenceRegex = /```md\s*([\s\S]*?)\s*```/i;
    const match = blockContent.match(mdFenceRegex);
    const nestedMarkdown = match ? match[1].trim() : blockContent.trim();
    if (!nestedMarkdown) continue;

    blocks.push({
      startIndex,
      endIndex: endIndex + endComment.length,
      attributes,
      nestedMarkdown,
    });
  }

  return blocks;
}
