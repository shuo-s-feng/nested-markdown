import type { InlineMdBlockAttributes } from "./types";
import { escapeHtmlAttr, escapeHtmlText } from "./escape";

const DEFAULT_STYLES = {
  bgColor: "#EEF6FF",
  textColor: "#0F172A",
  borderColor: "#93C5FD",
  show: "preview" as const,
};

export function generateWrapperHTML(params: {
  attributes: InlineMdBlockAttributes;
  nestedMarkdown: string;
  renderedHTML: string;
}): string {
  const { attributes, nestedMarkdown, renderedHTML } = params;

  const styles = {
    bgColor: attributes.bgColor || DEFAULT_STYLES.bgColor,
    textColor: attributes.textColor || DEFAULT_STYLES.textColor,
    borderColor: attributes.borderColor || DEFAULT_STYLES.borderColor,
    show: attributes.show || DEFAULT_STYLES.show,
  };

  const isBoxed = attributes.boxed !== "false";
  let wrapperStyle = "";

  if (isBoxed) {
    wrapperStyle = `display: flex; align-items: baseline; gap: 16px; border-radius: 10px; padding: 16px 20px; margin: 16px 0; background-color: ${styles.bgColor}; color: ${styles.textColor}; border: 1px solid ${styles.borderColor};`;
  } else {
    wrapperStyle = `display: flex; align-items: baseline; gap: 16px; margin: 16px 0; color: ${styles.textColor};`;
  }

  if (attributes.style) {
    wrapperStyle += ` ${attributes.style}`;
  }

  let emojiHTML = "";
  if (attributes.emoji) {
    emojiHTML = `<div style="flex-shrink: 0; font-size: 18px; line-height: 1;">${escapeHtmlText(
      attributes.emoji
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
    bodyHTML = `<div class="nested-md-content">${safeRenderedHTML}</div>`;
  } else if (styles.show === "code") {
    bodyHTML = `<pre style="margin: 0; overflow-x: auto;"><code>${escapedMarkdown}</code></pre>`;
  } else if (styles.show === "both") {
    bodyHTML =
      `<div class="nested-md-content">${safeRenderedHTML}</div>` +
      `<hr style="margin: 16px 0; border: none; border-top: 1px solid ${styles.borderColor};" />` +
      `<pre style="margin: 0; overflow-x: auto;"><code>${escapedMarkdown}</code></pre>`;
  }

  const idAttr = attributes.id
    ? ` data-id="${escapeHtmlAttr(attributes.id)}"`
    : "";

  return `<div data-nested-md="true"${idAttr} style="${escapeHtmlAttr(
    wrapperStyle
  )}">${emojiHTML}<div style="flex-grow: 1; min-width: 0;">${bodyHTML}</div></div>`;
}
