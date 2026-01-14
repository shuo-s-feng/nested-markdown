import { useEffect, useRef, useState } from "react";
import { NestedMarkdown } from "nested-markdown";

const STORAGE_KEY = "nested-markdown:example-md";
const THEME_STORAGE_KEY = "nested-markdown:example-theme";
const FALLBACK_URL = "./example.md";

const inlineFallbackMd = `
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
  const hasInitialMdRef = useRef(false);
  const fallbackMdRef = useRef<string>(inlineFallbackMd);
  const copyStatusResetTimeoutIdRef = useRef<number | null>(null);

  const [md, setMd] = useState(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        hasInitialMdRef.current = true;
        return stored;
      }
    } catch {
      hasInitialMdRef.current = false;
    }
    return "";
  });
  const [theme, setTheme] = useState<"auto" | "light" | "dark">(() => {
    try {
      const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === "auto" || stored === "light" || stored === "dark") {
        return stored;
      }
    } catch {
      return "auto";
    }
    return "auto";
  });
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">(
    "idle"
  );

  useEffect(() => {
    let cancelled = false;

    const loadFallback = async () => {
      try {
        const response = await fetch(FALLBACK_URL);
        if (!response.ok) {
          throw new Error(
            `Failed to load fallback markdown: ${response.status}`
          );
        }
        const text = await response.text();
        if (cancelled) return;
        fallbackMdRef.current = text;
        if (!hasInitialMdRef.current) {
          hasInitialMdRef.current = true;
          setMd(text);
        }
      } catch {
        if (cancelled) return;
        if (!hasInitialMdRef.current) {
          hasInitialMdRef.current = true;
          setMd(fallbackMdRef.current);
        }
      }
    };

    void loadFallback();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (copyStatusResetTimeoutIdRef.current !== null) {
        window.clearTimeout(copyStatusResetTimeoutIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!hasInitialMdRef.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, md);
    } catch {
      return;
    }
  }, [md]);

  useEffect(() => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      return;
    }
  }, [theme]);

  const copyMarkdown = async () => {
    if (copyStatusResetTimeoutIdRef.current !== null) {
      window.clearTimeout(copyStatusResetTimeoutIdRef.current);
      copyStatusResetTimeoutIdRef.current = null;
    }

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(md);
      } else {
        const el = document.createElement("textarea");
        el.value = md;
        el.setAttribute("readonly", "");
        el.style.position = "fixed";
        el.style.top = "0";
        el.style.left = "-9999px";
        document.body.appendChild(el);
        el.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(el);
        if (!ok) {
          throw new Error("Copy failed");
        }
      }

      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }

    copyStatusResetTimeoutIdRef.current = window.setTimeout(() => {
      setCopyStatus("idle");
    }, 1500);
  };

  return (
    <div className="container" data-theme={theme}>
      <div className="pane left">
        <div className="toolbar">
          <span>Markdown</span>
          <div className="toolbar-controls">
            <button type="button" onClick={copyMarkdown}>
              {copyStatus === "copied"
                ? "Copied"
                : copyStatus === "failed"
                ? "Copy failed"
                : "Copy"}
            </button>
            <button type="button" onClick={() => setMd(fallbackMdRef.current)}>
              Reset
            </button>
          </div>
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
            <button type="button" onClick={() => window.print()}>
              Export PDF
            </button>
          </div>
        </div>
        <div className="preview">
          <NestedMarkdown content={md} theme={theme} />
        </div>
      </div>
    </div>
  );
}
