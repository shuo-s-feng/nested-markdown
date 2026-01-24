import { marked } from "marked";
import { findFencedBlocks } from "./blocksFenced";
import { findCommentBlocks } from "./blocksLegacy";
import { generateWrapperHTML } from "./wrapper";

const DEFAULT_RECURSION_LIMIT = 8;

function countTrailingNewlines(value: string): number {
  let count = 0;
  for (let i = value.length - 1; i >= 0; i--) {
    if (value[i] !== "\n") break;
    count++;
  }
  return count;
}

function countLeadingNewlines(value: string): number {
  let count = 0;
  for (let i = 0; i < value.length; i++) {
    if (value[i] !== "\n") break;
    count++;
  }
  return count;
}

function isAtLineStart(markdown: string, index: number): boolean {
  const lineStart = markdown.lastIndexOf("\n", index - 1) + 1;
  const prefix = markdown.slice(lineStart, index);
  return /^[\t ]{0,3}$/.test(prefix);
}

async function expandNestedMarkdownInternal(
  markdown: string,
  depth: number,
  recursionLimit: number,
  defaultShow?: "preview" | "code" | "both",
): Promise<string> {
  if (depth > recursionLimit) return markdown;

  let result = markdown;
  const blocks = [...findFencedBlocks(result), ...findCommentBlocks(result)];

  const reversedBlocks = blocks.sort((a, b) => b.startIndex - a.startIndex);
  for (const block of reversedBlocks) {
    const expandedBody = await expandNestedMarkdownInternal(
      block.nestedMarkdown,
      depth + 1,
      recursionLimit,
      defaultShow,
    );
    const isInlineBlock = !isAtLineStart(result, block.startIndex);
    const resolvedShow = defaultShow || block.attributes.show || "preview";
    const canInlineRender = isInlineBlock && resolvedShow === "preview";
    const renderedHTML = canInlineRender
      ? await marked.parseInline(expandedBody)
      : await marked.parse(expandedBody);
    let wrapperHTML = generateWrapperHTML({
      attributes: block.attributes,
      nestedMarkdown: block.nestedMarkdown,
      renderedHTML,
      inline: canInlineRender,
      defaultShow,
    });

    // Preserve indentation for block-level elements (e.g. inside lists)
    if (!isInlineBlock) {
      const currentBlock = result.slice(block.startIndex, block.endIndex);
      const indentation = currentBlock.match(/^[ \t]*/)?.[0] || "";
      if (indentation) {
        wrapperHTML = indentation + wrapperHTML;
      }
    }

    const after = result.slice(block.endIndex);
    if (isAtLineStart(result, block.startIndex)) {
      const trailing = countTrailingNewlines(wrapperHTML);
      const leading = countLeadingNewlines(after);
      const needed = Math.max(0, 2 - (trailing + leading));
      if (needed > 0) wrapperHTML += "\n".repeat(needed);
    }

    result = result.slice(0, block.startIndex) + wrapperHTML + after;
  }

  return result;
}

export async function expandNestedMarkdown(
  markdown: string,
  options?: {
    recursionLimit?: number;
    defaultShow?: "preview" | "code" | "both";
  },
): Promise<string> {
  const recursionLimit = options?.recursionLimit ?? DEFAULT_RECURSION_LIMIT;
  return expandNestedMarkdownInternal(
    markdown,
    0,
    recursionLimit,
    options?.defaultShow,
  );
}
