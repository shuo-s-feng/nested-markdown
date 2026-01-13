import type { InlineMdBlockAttributes } from "./types";

export function parseAttributes(attributeText: string): InlineMdBlockAttributes {
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

