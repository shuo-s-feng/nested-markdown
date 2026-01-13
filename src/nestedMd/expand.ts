import { marked } from "marked";
import { findFencedBlocks } from "./blocksFenced";
import { findCommentBlocks } from "./blocksLegacy";
import { generateWrapperHTML } from "./wrapper";

const DEFAULT_RECURSION_LIMIT = 8;

async function expandNestedMarkdownInternal(
  markdown: string,
  depth: number,
  recursionLimit: number
): Promise<string> {
  if (depth > recursionLimit) return markdown;

  let result = markdown;
  const blocks = [...findFencedBlocks(result), ...findCommentBlocks(result)];

  const reversedBlocks = blocks.sort((a, b) => b.startIndex - a.startIndex);
  for (const block of reversedBlocks) {
    const expandedBody = await expandNestedMarkdownInternal(
      block.nestedMarkdown,
      depth + 1,
      recursionLimit
    );
    const renderedHTML = await marked.parse(expandedBody);
    const wrapperHTML = generateWrapperHTML({
      attributes: block.attributes,
      nestedMarkdown: block.nestedMarkdown,
      renderedHTML,
    });
    result = result.slice(0, block.startIndex) + wrapperHTML + result.slice(block.endIndex);
  }

  return result;
}

export async function expandNestedMarkdown(
  markdown: string,
  options?: { recursionLimit?: number }
): Promise<string> {
  const recursionLimit = options?.recursionLimit ?? DEFAULT_RECURSION_LIMIT;
  return expandNestedMarkdownInternal(markdown, 0, recursionLimit);
}

