import { useEffect, useRef, useState } from "react";
import { NestedMarkdown } from "nested-markdown";

const STORAGE_KEY = "nested-markdown:example-md";
const THEME_STORAGE_KEY = "nested-markdown:example-theme";
const VIEW_MODE_STORAGE_KEY = "nested-markdown:example-view-mode";
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
    "idle",
  );
  const [viewMode, setViewMode] = useState<"split" | "editor" | "preview">(
    () => {
      try {
        const stored = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY);
        if (stored === "split" || stored === "editor" || stored === "preview") {
          return stored;
        }
      } catch {
        return "split";
      }
      return "split";
    },
  );

  useEffect(() => {
    let cancelled = false;

    const loadFallback = async () => {
      try {
        const response = await fetch(FALLBACK_URL);
        if (!response.ok) {
          throw new Error(
            `Failed to load fallback markdown: ${response.status}`,
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

  useEffect(() => {
    try {
      window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode);
    } catch {
      return;
    }
  }, [viewMode]);

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
    <div className="app-root" data-theme={theme}>
      <header className="header">
        <span className="title">Nested Markdown</span>
        <div className="header-controls">
          <div className="button-group">
            <button
              className={viewMode === "editor" ? "active" : ""}
              onClick={() => setViewMode("editor")}
            >
              Editor
            </button>
            <button
              className={viewMode === "split" ? "active" : ""}
              onClick={() => setViewMode("split")}
            >
              Split
            </button>
            <button
              className={viewMode === "preview" ? "active" : ""}
              onClick={() => setViewMode("preview")}
            >
              Preview
            </button>
          </div>
          <div className="separator" />
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
          <div className="separator" />
          <select
            className="theme-select"
            value={theme}
            onChange={(e) => setTheme(e.target.value as typeof theme)}
          >
            <option value="auto">Auto</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
          <button type="button" className="export-btn" onClick={() => window.print()}>
            Export PDF
          </button>
        </div>
      </header>
      <div className="workspace">
        {viewMode !== "preview" && (
          <div className="pane left">
            <textarea
              value={md}
              onChange={(e) => setMd(e.target.value)}
              spellCheck={false}
            />
          </div>
        )}
        {viewMode === "split" && <div className="divider" />}
        {viewMode !== "editor" && (
          <div className="pane right">
            <div className="preview">
              <NestedMarkdown content={md} theme={theme} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
