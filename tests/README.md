# Tests (placeholder)

## Util: expandNestedMarkdown
- Input markdown contains a simple nested block with `show="preview"`
- Expect output to replace the block with a single-line `div[data-nested-md]` wrapper and escaped newlines

## Component: NestedMarkdown
- Render with content including one nested block and a table
- Verify `react-markdown` renders GFM features and sanitized inline HTML

Suggested tooling: `vitest` + `@testing-library/react`. Not included yet.
