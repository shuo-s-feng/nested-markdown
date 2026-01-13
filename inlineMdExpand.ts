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

function parseAttributes(comment: string): InlineMdBlockAttributes {
  const attributes: InlineMdBlockAttributes = {};

  // Extract key="value" pairs
  const attributeRegex = /(\w+)="([^"]*)"/g;
  let match;

  while ((match = attributeRegex.exec(comment)) !== null) {
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

function extractNestedMarkdown(content: string): string | null {
  // Look for ```md fence with optional whitespace and robust newline handling
  // Matches:
  // 1. ```md
  // 2. optional whitespace/newlines
  // 3. content (captured)
  // 4. optional whitespace/newlines
  // 5. ```
  const mdFenceRegex = /```md\s*([\s\S]*?)\s*```/i;
  const match = content.match(mdFenceRegex);
  if (match) {
    return match[1].trim();
  }

  // If no code fence is found, return the content directly (trimmed)
  // This supports using inline-md without wrapping content in ```md
  const trimmed = content.trim();
  return trimmed.length > 0 ? trimmed : null;
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
    emojiHTML = `<div style="flex-shrink: 0; font-size: 18px; line-height: 1; margin-top: 2px;">${attributes.emoji}</div>`;
  }

  let titleHTML = "";
  if (attributes.title) {
    titleHTML = `<div style="font-weight: 600; margin-bottom: 8px;">${attributes.title}</div>`;
  }

  let bodyHTML = "";
  const escapedMarkdown = nestedMarkdown
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "&#10;");

  // Replace newlines in renderedHTML to ensure the whole block can be on one line
  // This is important for embedding inside markdown tables
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

  const idAttr = attributes.id ? ` data-id="${attributes.id}"` : "";

  return `<div data-inline-md="true"${idAttr} style="${wrapperStyle}">${emojiHTML}<div style="flex-grow: 1; min-width: 0;">${titleHTML}${bodyHTML}</div></div>`;
}

export async function expandInlineMdBlocks(markdown: string): Promise<string> {
  let result = markdown;
  const blocks: ParsedInlineMdBlock[] = [];

  // Find all inline-md blocks
  const startRegex = /<!--\s*inline-md:start\s+([^>]+)-->/gi;
  let startMatch;

  while ((startMatch = startRegex.exec(markdown)) !== null) {
    const startIndex = startMatch.index;
    const startComment = startMatch[0];
    const endIndex = markdown.indexOf(
      "<!-- inline-md:end -->",
      startIndex + startComment.length
    );

    if (endIndex === -1) {
      // No matching end comment, skip this block
      continue;
    }

    const endComment = "<!-- inline-md:end -->";
    const blockContent = markdown.substring(
      startIndex + startComment.length,
      endIndex
    );
    // Extract attributes from start comment
    const attributes = parseAttributes(startComment);

    // Extract nested markdown
    const nestedMarkdown = extractNestedMarkdown(blockContent);

    if (nestedMarkdown) {
      blocks.push({
        startIndex,
        endIndex: endIndex + endComment.length,
        attributes,
        nestedMarkdown,
      });
    }
  }

  // Replace blocks from end to start to maintain indices
  const reversedBlocks = blocks.reverse();
  for (const block of reversedBlocks) {
    const renderedHTML = await marked.parse(block.nestedMarkdown);
    const wrapperHTML = generateWrapperHTML(
      block.attributes,
      block.nestedMarkdown,
      renderedHTML
    );
    result =
      result.substring(0, block.startIndex) +
      wrapperHTML +
      result.substring(block.endIndex);
  }

  return result;
}
