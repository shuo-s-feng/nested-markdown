# Tech Design: Fenced Nested Markdown Blocks

## Overview

This project extends Markdown with a block construct that lets authors embed Markdown inside Markdown (“nested Markdown”), and render it as a styled HTML wrapper during rendering.

The recommended authoring syntax is a **custom fenced code block** with an info string:

````markdown
```nested-md title="Note" emoji="💡" show="both"
# Nested content
- This content is parsed as Markdown and rendered inline
```
````

Markdown engines that do not support this extension still render the block as a normal code block, providing graceful fallback.

## Goals

- Preserve valid Markdown as much as possible.
- Provide a syntax that degrades cleanly in “native” Markdown renderers (GitHub/GFM, CommonMark parsers).
- Allow nested blocks (level 2, level 3, …) without ambiguous parsing.
- Support optional attributes on the block (title, display mode, colors, etc.).

## Non-goals

- Extending the Markdown AST via a full custom parser.
- Supporting invalid Markdown constructs that require non-standard parsing rules.

## Syntax

### Block form (recommended)

- Opening fence: backticks or tildes, length \(N \ge 3\)
- Language identifier: `nested-md` (optionally also accept `inline-md` as an alias)
- Attributes: `key="value"` pairs placed on the same line after the identifier
- Closing fence: same character as opening fence, length \(\ge N\) (standard Markdown rule)

Example:

````markdown
```nested-md title="Tip" emoji="✨" show="preview"
You can write normal Markdown here:
- lists
- tables
```
````

### Attributes

The info string supports `key="value"` pairs:

- `title`: string
- `emoji`: string
- `show`: `preview` | `code` | `both`
- `bg`, `text`, `border`: CSS colors
- `boxed`: `"true"` | `"false"`
- `style`: extra inline CSS appended to wrapper
- `id`: copied to `data-id`

## Nesting Rules (Native Markdown Compatibility)

Native Markdown fenced blocks are not “truly nestable” unless the fences are chosen carefully.

### Key rule

Inside a fenced block, a line that starts with a fence of length \(\ge\) the opening length closes the block. Therefore:

- If you use backticks for both outer and inner fences, the **outer fence must be longer** than any inner backtick fence.
- Alternatively, **alternate fence characters** (use `~~~~` outside, ``` inside), which avoids having to increase lengths.

### Level 2 nesting

Valid (outer uses 4 backticks, inner uses 3):

`````markdown
````nested-md title="Outer"
Outer content

```nested-md title="Inner"
Inner content
```
````
`````

### Level 3 nesting

Valid (use increasing lengths, or alternate characters):

``````markdown
`````nested-md title="L1"
Level 1

````nested-md title="L2"
Level 2

```nested-md title="L3"
Level 3
```
`````
``````

## Parsing & Rendering Strategy

### Pipeline

1. Start with raw Markdown source as a string.
2. Preprocess the string:
   - Find `nested-md`/`inline-md` fenced blocks.
   - Extract attributes from the fence info string.
   - Extract the block body as nested Markdown.
3. Convert the nested Markdown body to HTML using a Markdown renderer.
4. Wrap the HTML and/or original source in a generated HTML container (for `show="preview" | "code" | "both"`).
5. Pass the resulting Markdown (which now contains safe HTML wrappers) through the main Markdown renderer with:
   - raw HTML enabled (to render the wrapper),
   - sanitization configured to allow only the needed tags/attributes.

### Fenced block detection

Recommended detection characteristics:

- Match fences at start-of-line (allow up to 3 spaces indentation, per CommonMark).
- Capture the fence delimiter (`````or`~~~`) and require the closing fence to match delimiter type and be at least the same length.
- Accept `nested-md` as the primary info word; optionally accept `inline-md` as an alias for compatibility.

### Attribute parsing

Attributes are parsed from the remainder of the fence line (the “info string”), using a conservative `key="value"` grammar.

### Recursive expansion

To support nested `nested-md` blocks inside the body of another block:

- Before rendering the body Markdown to HTML, run the same preprocessing pass on the body string.
- Apply a recursion limit (recommended) to prevent pathological inputs from causing excessive work.

## Backward Compatibility

If there is an existing legacy syntax (e.g., HTML comment wrappers), recommended migration approach:

- Continue supporting legacy syntax during a transition period.
- Prefer fenced blocks in examples and docs.
- Add linting/validation tooling later to help authors migrate.

## Security Considerations

Because the preprocessing step injects HTML into Markdown:

- The final renderer must sanitize HTML strictly.
- Only allow the minimal set of tags and attributes needed for the wrapper (`div`, `data-*`, `style` if required, etc.).
- Avoid allowing arbitrary HTML/JS execution; do not permit event handler attributes (`on*`) or unsafe URLs.

## Known Limitations & Edge Cases

- Authors must follow the native fenced-block nesting rule (outer fence longer than inner) when nesting by backticks.
- Large documents with deep nesting can be expensive; recursion limits and/or caching can mitigate this.
- Inline CSS via `style` is powerful; keep sanitization rules strict and consider constraining allowed CSS if needed.
