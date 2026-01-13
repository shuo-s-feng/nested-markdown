import { describe, expect, it } from "vitest";
import { expandNestedMarkdown } from "./nestedMdExpand";

describe("expandNestedMarkdown", () => {
  it("expands a fenced nested-md block", async () => {
    const input = [
      "before",
      '```nested-md emoji="💡" show="both"',
      "# Nested content",
      "- Item",
      "```",
      "after",
      "",
    ].join("\n");

    const output = await expandNestedMarkdown(input);
    expect(output).toContain('data-nested-md="true"');
    expect(output).not.toContain("```nested-md");
  });

  it("expands nested fenced blocks recursively", async () => {
    const input = [
      "````nested-md show=\"preview\"",
      "Outer content",
      "",
      "```nested-md show=\"preview\"",
      "Inner content",
      "```",
      "````",
      "",
    ].join("\n");

    const output = await expandNestedMarkdown(input);
    const occurrences = output.match(/data-nested-md="true"/g)?.length ?? 0;
    expect(occurrences).toBe(2);
  });

  it("keeps legacy HTML comment nested-md blocks working", async () => {
    const input = [
      "before",
      '<!-- nested-md:start show="preview" -->',
      "```md",
      "legacy content",
      "```",
      "<!-- nested-md:end -->",
      "after",
      "",
    ].join("\n");

    const output = await expandNestedMarkdown(input);
    expect(output).toContain('data-nested-md="true"');
    expect(output).toContain("legacy content");
  });
});
