import { marked } from "marked";

interface InlineMdBlockAttributes {
  id?: string;
  title?: string;
  show?: "preview" | "code" | "both";
  bg?: string;
  text?: string;
  border?: string;
  emoji?: string;
  boxed?: "true" | "false";
  style?: string;
}

interface ParsedInlineMdBlock {
  startIndex: number;
  endIndex: number;
  attributes: InlineMdBlockAttributes;
  nestedMarkdown: string;
}

const DEFAULT_STYLES = {
  bg: "#EEF6FF",
  text: "#0F172A",
  border: "#93C5FD",
  show: "preview" as const,
};

const DEFAULT_RECURSION_LIMIT = 8;

function escapeHtmlText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeHtmlAttr(value: string): string {
  return escapeHtmlText(value);
}

function parseAttributes(attributeText: string): InlineMdBlockAttributes {
  const attributes: InlineMdBlockAttributes = {};

  const attributeRegex = /(\w+)="([^"]*)"/g;
  let match;

  while ((match = attributeRegex.exec(attributeText)) !== null) {
    const [, key, value] = match;
    if (key === "show") {
      if (value === "preview" || value === "code" || value === "both") {
        attributes.show = value;
      }
    } else if (key === "boxed") {
      if (value === "true" || value === "false") {
        attributes.boxed = value;
      }
    } else if (
      key === "id" ||
      key === "title" ||
      key === "bg" ||
      key === "text" ||
      key === "border" ||
      key === "emoji" ||
      key === "style"
    ) {
      attributes[
        key as Exclude<keyof InlineMdBlockAttributes, "show" | "boxed">
      ] = value;
    }
  }

  return attributes;
}

function trimSingleTrailingNewline(value: string): string {
  return value.endsWith("\n") ? value.slice(0, -1) : value;
}

function generateWrapperHTML(
  attributes: InlineMdBlockAttributes,
  nestedMarkdown: string,
  renderedHTML: string
): string {
  const styles = {
    bg: attributes.bg || DEFAULT_STYLES.bg,
    text: attributes.text || DEFAULT_STYLES.text,
    border: attributes.border || DEFAULT_STYLES.border,
    show: attributes.show || DEFAULT_STYLES.show,
  };

  const isBoxed = attributes.boxed !== "false";
  let wrapperStyle = "";

  if (isBoxed) {
    wrapperStyle = `display: flex; align-items: flex-start; gap: 16px; border-radius: 10px; padding: 16px 20px; margin: 16px 0; background-color: ${styles.bg}; color: ${styles.text}; border: 1px solid ${styles.border};`;
  } else {
    wrapperStyle = `display: flex; align-items: flex-start; gap: 16px; margin: 16px 0; color: ${styles.text};`;
  }

  if (attributes.style) {
    wrapperStyle += ` ${attributes.style}`;
  }

  let emojiHTML = "";
  if (attributes.emoji) {
    emojiHTML = `<div style="flex-shrink: 0; font-size: 18px; line-height: 1; margin-top: 2px;">${escapeHtmlText(
      attributes.emoji
    )}</div>`;
  }

  let titleHTML = "";
  if (attributes.title) {
    titleHTML = `<div style="font-weight: 600; margin-bottom: 8px;">${escapeHtmlText(
      attributes.title
    )}</div>`;
  }

  let bodyHTML = "";
  const escapedMarkdown = nestedMarkdown
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "&#10;");

  const safeRenderedHTML = renderedHTML.replace(/\n/g, "&#10;");

  if (styles.show === "preview") {
    bodyHTML = `<div class="inline-md-content">${safeRenderedHTML}</div>`;
  } else if (styles.show === "code") {
    bodyHTML = `<pre style="margin: 0; overflow-x: auto;"><code>${escapedMarkdown}</code></pre>`;
  } else if (styles.show === "both") {
    bodyHTML =
      `<div class="inline-md-content">${safeRenderedHTML}</div>` +
      `<hr style="margin: 16px 0; border: none; border-top: 1px solid ${styles.border};" />` +
      `<pre style="margin: 0; overflow-x: auto;"><code>${escapedMarkdown}</code></pre>`;
  }

  const idAttr = attributes.id
    ? ` data-id="${escapeHtmlAttr(attributes.id)}"`
    : "";

  return `<div data-inline-md="true" data-nested-md="true"${idAttr} style="${escapeHtmlAttr(
    wrapperStyle
  )}">${emojiHTML}<div style="flex-grow: 1; min-width: 0;">${titleHTML}${bodyHTML}</div></div>`;
}

function buildLineStartIndices(markdown: string): number[] {
  const starts: number[] = [0];
  for (let i = 0; i < markdown.length; i++) {
    if (markdown[i] === "\n") starts.push(i + 1);
  }
  return starts;
}

function findFencedBlocks(markdown: string): ParsedInlineMdBlock[] {
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

    const infoMatch = afterFence.match(/^(nested-md|inline-md)\b(.*)$/);
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

function findCommentBlocks(markdown: string): ParsedInlineMdBlock[] {
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
    const wrapperHTML = generateWrapperHTML(
      block.attributes,
      block.nestedMarkdown,
      renderedHTML
    );
    result =
      result.slice(0, block.startIndex) +
      wrapperHTML +
      result.slice(block.endIndex);
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
