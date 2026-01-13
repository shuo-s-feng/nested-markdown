import { useState } from "react";
import { NestedMarkdown } from "nested-markdown";

const initial = `
\`\`\`nested-md show="preview" bgColor="#EEF6FF" textColor="#0F172A" borderColor="#93C5FD" emoji="🔵"

Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. 
\`\`\`

\`\`\`nested-md show="preview" bgColor="#FDE8E8" textColor="#0F172A" borderColor="#F87171" emoji="❌"

Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. 
\`\`\`

\`\`\`nested-md show="preview" bgColor="#F1FAEF" textColor="#0F172A" borderColor="#BBD4B7" emoji="✅"

Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. 

\`\`\`
`;

export default function App() {
  const [md, setMd] = useState(initial);
  const [theme, setTheme] = useState<"auto" | "light" | "dark">("auto");
  return (
    <div className="container" data-theme={theme}>
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
          <div className="toolbar-controls">
            <label className="toolbar-label" htmlFor="theme-select">
              Theme
            </label>
            <select
              id="theme-select"
              value={theme}
              onChange={(e) => setTheme(e.target.value as typeof theme)}
            >
              <option value="auto">Auto</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>
        <div className="preview">
          <NestedMarkdown content={md} theme={theme} />
        </div>
      </div>
    </div>
  );
}
