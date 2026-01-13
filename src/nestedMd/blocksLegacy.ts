import type { ParsedInlineMdBlock } from "./types";
import { parseAttributes } from "./attributes";

export function findCommentBlocks(markdown: string): ParsedInlineMdBlock[] {
  const blocks: ParsedInlineMdBlock[] = [];
  const startRegex = /<!--\s*inline-md:start(?:\s+([^>]*?))?\s*-->/gi;
  let startMatch;

  while ((startMatch = startRegex.exec(markdown)) !== null) {
    const startIndex = startMatch.index;
    const startComment = startMatch[0];
    const endIndex = markdown.indexOf(
      "<!-- inline-md:end -->",
      startIndex + startComment.length
    );
    if (endIndex === -1) continue;

    const endComment = "<!-- inline-md:end -->";
    const blockContent = markdown.substring(
      startIndex + startComment.length,
      endIndex
    );
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

