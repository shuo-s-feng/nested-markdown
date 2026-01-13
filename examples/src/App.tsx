import { useState } from "react";
import { NestedMarkdown } from "nested-markdown";

const initial = `# Nested Markdown Playground

Type markdown on the left. Rendered output appears on the right.

<!-- nested-md:start emoji="✨" show="both" -->
\`\`\`md
- You can include tables, lists, images
- Use show="preview" | "code" | "both"
\`\`\`
<!-- nested-md:end -->

| Feature | Status |
| --- | --- |
| GFM | ✅ |
| Inline Blocks | ✅ |
`;

export default function App() {
  const [md, setMd] = useState(initial);
  return (
    <div className="container">
      <div className="pane left">
        <div className="toolbar">
          <span>Markdown</span>
          <button onClick={() => setMd(initial)}>Reset</button>
        </div>
        <textarea
          value={md}
          onChange={(e) => setMd(e.target.value)}
          spellCheck={false}
        />
      </div>
      <div className="divider" />
      <div className="pane right">
        <div className="toolbar">
          <span>Preview</span>
        </div>
        <div className="preview">
          <NestedMarkdown content={md} />
        </div>
      </div>
    </div>
  );
}
