import type { InlineMdBlockAttributes } from "./types";
import { escapeHtmlAttr, escapeHtmlText } from "./escape";
import { toDarkBgColor, toDarkBorderColor, toDarkTextColor } from "./colors";

const DEFAULT_STYLES = {
  bgColor: "var(--nmd-nested-bg, #EEF6FF)",
  textColor: "var(--nmd-nested-text, #0F172A)",
  borderColor: "var(--nmd-nested-border, #93C5FD)",
  show: "preview" as const,
};

export function generateWrapperHTML(params: {
  attributes: InlineMdBlockAttributes;
  nestedMarkdown: string;
  renderedHTML: string;
  inline?: boolean;
  defaultShow?: "preview" | "code" | "both";
}): string {
  const { attributes, nestedMarkdown, renderedHTML, inline, defaultShow } = params;

  const lightBgColor = attributes.bgColor || DEFAULT_STYLES.bgColor;
  const lightTextColor = attributes.textColor || DEFAULT_STYLES.textColor;
  const lightBorderColor = attributes.borderColor || DEFAULT_STYLES.borderColor;

  const darkBgColor = attributes.bgColor
    ? toDarkBgColor(lightBgColor)
    : lightBgColor;
  const darkTextColor = attributes.textColor
    ? toDarkTextColor(lightTextColor)
    : lightTextColor;
  const darkBorderColor = attributes.borderColor
    ? toDarkBorderColor(lightBorderColor)
    : lightBorderColor;

  const styles = {
    bgColor: lightBgColor,
    textColor: lightTextColor,
    borderColor: lightBorderColor,
    show: defaultShow || attributes.show || DEFAULT_STYLES.show,
  };

  const isBoxed = attributes.boxed !== "false";
  const isInline = inline === true;
  let wrapperStyle = "";

  const colorVars = `--nmd-inline-bg-light: ${styles.bgColor}; --nmd-inline-bg-dark: ${darkBgColor}; --nmd-inline-text-light: ${styles.textColor}; --nmd-inline-text-dark: ${darkTextColor}; --nmd-inline-border-light: ${styles.borderColor}; --nmd-inline-border-dark: ${darkBorderColor};`;

  if (isInline) {
    if (isBoxed) {
      wrapperStyle = `display: inline-flex; align-items: baseline; gap: 0.5em; border-radius: 0.5em; padding: 0.125em 0.625em; ${colorVars} background-color: var(--nmd-inline-bg-light); color: var(--nmd-inline-text-light); border: 1px solid var(--nmd-inline-border-light);`;
    } else {
      wrapperStyle = `display: inline-flex; align-items: baseline; gap: 0.375em; ${colorVars} color: var(--nmd-inline-text-light);`;
    }
  } else {
    if (isBoxed) {
      wrapperStyle = `display: flex; align-items: baseline; gap: 1em; border-radius: 0.714em; padding: 0.857em 1em; margin: 0.5em 0; ${colorVars} background-color: var(--nmd-inline-bg-light); color: var(--nmd-inline-text-light); border: 1px solid var(--nmd-inline-border-light);`;
    } else {
      wrapperStyle = `display: flex; align-items: baseline; gap: 1em; margin: 0.5em 0; ${colorVars} color: var(--nmd-inline-text-light);`;
    }
  }

  if (attributes.style) {
    wrapperStyle += ` ${attributes.style}`;
  }

  let emojiHTML = "";
  if (attributes.emoji) {
    const emojiTag = isInline ? "span" : "div";
    emojiHTML = `<${emojiTag} style="flex-shrink: 0; font-size: 1.125em; line-height: 1;">${escapeHtmlText(
      attributes.emoji
    )}</${emojiTag}>`;
  }

  let bodyHTML = "";
  const escapedMarkdown = nestedMarkdown
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "&#10;");

  const safeRenderedHTML = renderedHTML.replace(/\n/g, "&#10;");

  if (styles.show === "preview") {
    bodyHTML = isInline
      ? `<span class="nested-md-content">${safeRenderedHTML}</span>`
      : `<div class="nested-md-content">${safeRenderedHTML}</div>`;
  } else if (styles.show === "code") {
    bodyHTML = `<pre style="margin: 0; overflow-x: auto;"><code>${escapedMarkdown}</code></pre>`;
  } else if (styles.show === "both") {
    bodyHTML =
      `<div class="nested-md-content">${safeRenderedHTML}</div>` +
      `<hr style="margin: 1em 0; border: none; border-top: 1px solid var(--nmd-inline-border-light);" />` +
      `<pre style="margin: 0; overflow-x: auto;"><code>${escapedMarkdown}</code></pre>`;
  }

  const idAttr = attributes.id
    ? ` data-id="${escapeHtmlAttr(attributes.id)}"`
    : "";

  const boxedAttr = isBoxed ? ` data-boxed="true"` : "";

  const wrapperTag = isInline ? "span" : "div";
  const contentTag = isInline ? "span" : "div";

  return `<${wrapperTag} data-nested-md="true"${idAttr}${boxedAttr} style="${escapeHtmlAttr(
    wrapperStyle
  )}">${emojiHTML}<${contentTag} style="flex-grow: 1; min-width: 0;">${bodyHTML}</${contentTag}></${wrapperTag}>`;
}
