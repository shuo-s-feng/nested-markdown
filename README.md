# react-nested-markdown

React renderer for extended markdown with inline nested markdown blocks.

## Install
- `npm i react-nested-markdown react react-dom @mui/material @emotion/react @emotion/styled antd`

## Quick Start
```tsx
import NestedMarkdown, { expandNestedMarkdown } from "react-nested-markdown";

const md = `
This is normal markdown.

<!-- nested-md:start title="Note" emoji="💡" show="both" bg="#F8FFEE" text="#0F172A" border="#A5D6A7" -->
```md
- Supports GFM, tables, lists
- Renders preview and/or original code
```
<!-- nested-md:end -->
`;

export default function App() {
  return <NestedMarkdown content={md} />;
}
```

## Component API
- `NestedMarkdown`
  - `content: string` — Markdown source
  - `className?: string` — Class for outer container
  - `components?: Components` — `react-markdown` overrides merged with defaults
  - `sx?: SxProps<Theme>` — MUI `Box` styles
- `expandNestedMarkdown(markdown: string): Promise<string>` — Preprocesses nested blocks into safe HTML

## Nested Block Syntax
- Wrap nested blocks with:
  - Start: `<!-- nested-md:start key="value" ... -->`
  - End: `<!-- nested-md:end -->`
- Body can be:
  - Fenced: ```md ... ```
  - Raw markdown text (no fence)

### Attributes
- `id?: string` — Copied to `data-id` on wrapper
- `title?: string` — Title above the content
- `show?: "preview" | "code" | "both"` — Display mode
- `bg?: string`, `text?: string`, `border?: string` — Colors
- `emoji?: string` — Emoji/icon column
- `boxed?: "true" | "false"` — Boxed UI (default true)
- `style?: string` — Extra inline styles for wrapper

## Styling Defaults
- Tables are wrapped with horizontal scroll and basic table styles
- Images render via `antd` `Image` and normalize relative `src` paths
- Blockquotes use MUI `Box` with tuned typography
- Inline `code` and `mark` have gentle defaults

## Security
- `rehype-raw` is enabled to render the preprocessed HTML
- Strict `rehype-sanitize` schema allows only needed tags/attributes including `div[data-nested-md]`

## SSR
- Designed to work with SSR setups; ensure peer deps (`react`, `@mui/material`, `@emotion/*`, `antd`) are present in the host app

## License
- MIT © Contributors
