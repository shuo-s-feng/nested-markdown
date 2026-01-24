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
      '````nested-md show="preview"',
      "Outer content",
      "",
      '```nested-md show="preview"',
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

  it("adds dark-mode-compatible colors for custom styles", async () => {
    const input = [
      '```nested-md bgColor="#ff0000" textColor="#1d4ed8" borderColor="#22c55e" show="both"',
      "Hello",
      "```",
      "",
    ].join("\n");

    const output = await expandNestedMarkdown(input);
    expect(output).toContain("--nmd-inline-bg-dark:");
    expect(output).toMatch(/--nmd-inline-bg-dark:\s*(?:rgba|rgb)\(/);
    expect(output).toContain("--nmd-inline-text-dark:");
    expect(output).toContain("--nmd-inline-border-dark:");
  });

  it("does not swallow following markdown without a blank line", async () => {
    const input = [
      '```nested-md show="preview"',
      "Block content",
      "```",
      "![Welcome Page](https://example.com/image.png)",
      "",
    ].join("\n");

    const output = await expandNestedMarkdown(input);
    expect(output).toMatch(
      /data-nested-md="true"[\s\S]*?\n\n!\[Welcome Page\]\(/
    );
  });

  it("does not inject blank lines for inline legacy blocks", async () => {
    const input = [
      "| col |",
      "| --- |",
      '| <!-- nested-md:start show="preview" -->hello<!-- nested-md:end --> ![A](https://example.com/a.png) |',
      "",
    ].join("\n");

    const output = await expandNestedMarkdown(input);
    expect(output).toMatch(/<\/span> !\[A\]\(https:\/\/example\.com\/a\.png\)/);
    expect(output).not.toMatch(/<\/span>\n\n !\[A\]/);
  });

  it("renders inline legacy preview blocks as a span wrapper", async () => {
    const input = [
      'before <!-- nested-md:start show="preview" -->**x**<!-- nested-md:end --> after',
      "",
    ].join("\n");

    const output = await expandNestedMarkdown(input);
    expect(output).toContain('<span data-nested-md="true"');
    expect(output).toContain("<strong>x</strong>");
  });

  it("uses updated padding and margin for nested-md blocks", async () => {
    const input = ['```nested-md show="preview"', "Block content", "```"].join(
      "\n"
    );

    const output = await expandNestedMarkdown(input);
    expect(output).toContain("padding: 0.857em 1em");
    expect(output).toContain("margin: 0.5em 0");
    expect(output).toContain("border-radius: 0.714em");
  });
});
