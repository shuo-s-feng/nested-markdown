# nested-markdown

React renderer for extended markdown with inline nested markdown blocks.

## Demo

Try out the [live demo](https://shuo-s-feng.github.io/nested-markdown/).

## Install

```bash
npm i nested-markdown
```

or

```
yarn add nested-markdown
```

Peer dependencies:

- `react` / `react-dom` (>= 17)

## Quick Start

````tsx
import NestedMarkdown from "nested-markdown";

const content = [
  "This is normal markdown.",
  "",
  '```nested-md emoji="💡" show="both" bgColor="#F8FFEE" textColor="#0F172A" borderColor="#A5D6A7"',
  "# Nested content",
  "",
  "- Supports GFM (tables, lists, etc.)",
  "- Can show preview and/or the original code",
  "```",
  "",
].join("\n");

export default function App() {
  return <NestedMarkdown content={content} theme="auto" />;
}
````

## Component API

- `NestedMarkdown`
  - `content?: string` — Markdown source (alias: `children?: string`)
  - `className?: string` — Class for outer container
  - `components?: Components` — `react-markdown` overrides merged with defaults
  - `style?: React.CSSProperties` — Inline styles for the outer container
  - `theme?: "light" | "dark" | "auto"` — Color theme (default `"auto"`)
  - Also accepts most `react-markdown` props (e.g. `remarkPlugins`, `rehypePlugins`, `allowedElements`, `skipHtml`)
- `expandNestedMarkdown(markdown: string): Promise<string>` — Preprocesses nested blocks into safe HTML

## Nested Block Syntax

- Preferred (fenced) syntax:

  ````md
  ```nested-md key="value" ...
  ...markdown body...
  ```
  ````

- Legacy (HTML comment) syntax:
  - Start: `<!-- nested-md:start key="value" ... -->`
  - End: `<!-- nested-md:end -->`
- Body:
  - For fenced blocks: markdown between the fences
  - For legacy blocks: either raw markdown or an inner fenced ` ```md ... ``` `

### Attributes

- `id?: string` — Copied to `data-id` on wrapper
- `show?: "preview" | "code" | "both"` — Display mode
- `bgColor?: string`, `textColor?: string`, `borderColor?: string` — Colors
- `emoji?: string` — Emoji/icon column
- `boxed?: "true" | "false"` — Boxed UI (default true)
- `style?: string` — Extra inline styles for wrapper

## Styling Defaults

- Tables are wrapped with horizontal scroll and basic table styles
- Images render with a normal `<img>` and normalize relative `src` paths
- Inline `code` and `mark` have gentle defaults

## Security

- `rehype-raw` is enabled to render the preprocessed HTML
- Strict `rehype-sanitize` schema allows only needed tags/attributes including `div[data-nested-md]`

## SSR

- Designed to work with SSR setups; ensure peer deps (`react`) are present in the host app

## License

- MIT
