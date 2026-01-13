# Examples

## Basic usage (Vite + React)
```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import NestedMarkdown from "react-nested-markdown";

const md = `
Hello

<!-- nested-md:start title="Tip" emoji="✨" show="preview" -->
```md
You can nest markdown blocks inline.
```
<!-- nested-md:end -->
`;

function App() {
  return <NestedMarkdown content={md} />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
```

Install peers:
- `react`, `react-dom`, `@mui/material`, `@emotion/react`, `@emotion/styled`, `antd`
