## Package Naming
- Library name: `react-nested-markdown`
- Default export component: `NestedMarkdown` (rename from `InlineMdRenderer`)
- Named util export: `expandNestedMarkdown` (rename from `expandInlineMdBlocks`)

## Repo Structure
- `src/`
  - `NestedMarkdown.tsx` (renamed component)
  - `nestedMdExpand.ts` (renamed from `inlineMdExpand.ts`, exports `expandNestedMarkdown`)
  - `index.ts` (default export `NestedMarkdown`, named export `expandNestedMarkdown`)
- `dist/` (build output)
- Root: `package.json`, `tsconfig.json`, `README.md`, `LICENSE`, `.npmignore`

## Build  Types
- Bundle with `tsup` to ESM/CJS and generate `.d.ts`
- Externalize peer deps to keep bundle small
- `tsconfig.json`: `declaration: true`, `jsx: react-jsx`, `moduleResolution: bundler`

## Dependencies
- Peer: `react`, `react-dom`, `@mui/material`, `@emotion/react`, `@emotion/styled`, `antd`
- Deps: `react-markdown`, `remark-gfm`, `rehype-raw`, `rehype-sanitize`, `marked`
- Dev: `typescript`, `tsup`, `@types/react`, `@types/react-dom`

## Exports  Entry
- `package.json` exports `types`, `import`, `require` pointing to `dist`
- `main`: `dist/index.cjs.js`, `module`: `dist/index.esm.js`
- `sideEffects: false`, `files: ["dist"]`

## Security  Sanitization
- Preserve strict sanitize schema allowing only required tags/attributes (incl. `div[data-inline-md]`)

## Documentation
- `README.md` includes install, usage, inline block syntax and attributes (`show`, `title`, `emoji`, `bg`, `text`, `border`, `boxed`, `style`, `id`), and SSR notes
- `LICENSE`: MIT

## Publishing
- Add npm metadata, scripts: `build`, `prepare`, `typecheck`
- Publish via `npm publish --access public` after `npm login`

## Optional Enhancements
- Example app in `examples/` showcasing nested blocks
- Basic tests for `expandNestedMarkdown` and a render snapshot
- CI workflow for build/typecheck

## Sample Usage
- Install: `npm i react-nested-markdown react react-dom @mui/material @emotion/react @emotion/styled antd`
- Import: `import NestedMarkdown, { expandNestedMarkdown } from "react-nested-markdown"`
- Render: `NestedMarkdown content={md} sx={{}} /`

Confirm and I’ll implement the renames, add build config, docs, and verify end-to-end.