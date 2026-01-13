import { useState, useEffect, type CSSProperties } from "react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { Image } from "antd";
import { expandNestedMarkdown } from "./nestedMdExpand";
import { PluggableList } from "unified";

type CssDeclarations = Record<string, string | number>;

function toKebabCase(propertyName: string): string {
  if (propertyName.startsWith("--")) return propertyName;
  if (propertyName.startsWith("Webkit")) {
    return (
      "-webkit-" +
      propertyName
        .slice("Webkit".length)
        .replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)
        .replace(/^-/, "")
    );
  }
  if (propertyName.startsWith("Moz")) {
    return (
      "-moz-" +
      propertyName
        .slice("Moz".length)
        .replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)
        .replace(/^-/, "")
    );
  }
  if (propertyName.startsWith("ms")) {
    return (
      "-ms-" +
      propertyName
        .slice("ms".length)
        .replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)
        .replace(/^-/, "")
    );
  }
  return propertyName.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

function cssFromRules(rules: Record<string, CssDeclarations>): string {
  const blocks: string[] = [];
  for (const [selector, declarations] of Object.entries(rules)) {
    const lines: string[] = [];
    for (const [propertyName, value] of Object.entries(declarations)) {
      if (value === undefined || value === null || value === "") continue;
      lines.push(`${toKebabCase(propertyName)}: ${String(value)};`);
    }
    blocks.push(`${selector} { ${lines.join(" ")} }`);
  }
  return blocks.join("\n");
}

const customSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    div: [
      ...(defaultSchema.attributes?.div || []),
      ["data-nested-md"],
      ["data-id"],
      ["style"],
      ["className"],
    ],
    a: [
      ...(defaultSchema.attributes?.a || []),
      ["href"],
      ["title"],
      ["target"],
      ["rel"],
    ],
    span: [...(defaultSchema.attributes?.span || []), ["style"]],
    pre: [...(defaultSchema.attributes?.pre || []), ["style"]],
    blockquote: [["style"]],
    code: [...(defaultSchema.attributes?.code || []), ["style"]],
    hr: [...(defaultSchema.attributes?.hr || []), ["style"]],
  },
  tagNames: [
    ...(defaultSchema.tagNames || []),
    "div",
    "span",
    "pre",
    "code",
    "hr",
    "blockquote",
    "mark",
  ],
};

export interface NestedMarkdownProps {
  content: string;
  className?: string;
  components?: Components;
  style?: CSSProperties;
}

export const NestedMarkdown = ({
  content,
  className,
  components,
  style,
}: NestedMarkdownProps) => {
  const [expandedMarkdown, setExpandedMarkdown] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const process = async () => {
      try {
        const expanded = await expandNestedMarkdown(content || "");
        if (mounted) {
          setExpandedMarkdown(expanded);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          console.error("Markdown expansion error:", err);
          setExpandedMarkdown(content || "");
        }
      }
    };
    process();
    return () => {
      mounted = false;
    };
  }, [content]);

  const defaultComponents: Components = {
    a: ({ node, ...props }) => (
      <a
        {...props}
        rel={props.target === "_blank" ? "noopener noreferrer" : props.rel}
      />
    ),
    table: ({ node, ...props }) => (
      <div className="nmd-table-wrap">
        <table className="nmd-table" {...props} />
      </div>
    ),
    th: ({ node, ...props }) => <th className="nmd-th" {...props} />,
    td: ({ node, ...props }) => <td className="nmd-td" {...props} />,
    pre: ({ node, ...props }) => <pre className="nmd-pre" {...props} />,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    code: ({ node, inline, className, ...props }: any) => (
      <code
        {...props}
        className={[className, inline ? "nmd-code-inline" : "nmd-code-block"]
          .filter(Boolean)
          .join(" ")}
      />
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    img: ({ node, ...props }: any) => {
      let src = props.src;
      if (
        src &&
        !src.startsWith("http") &&
        !src.startsWith("/") &&
        !src.startsWith("data:")
      ) {
        src = `/${src}`;
      }
      return (
        <Image
          {...props}
          src={src}
          style={{
            maxWidth: "100%",
            maxHeight: "420px",
            width: "auto",
            height: "auto",
            borderRadius: "8px",
          }}
          wrapperStyle={{
            maxWidth: "100%",
            width: "fit-content",
            display: "block",
            margin: "16px 0",
          }}
        />
      );
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    blockquote: ({ node, ...props }: any) => (
      <blockquote className="nmd-blockquote" {...props} />
    ),
  };

  const mergedComponents = { ...defaultComponents, ...components };

  const stylesheet = cssFromRules({
    ".nmd-root": {
      "--nmd-font":
        '-apple-system, "system-ui", "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
      "--nmd-text": "#0f172a",
      "--nmd-muted": "#475569",
      "--nmd-border": "rgba(15, 23, 42, 0.12)",
      "--nmd-bg": "#ffffff",
      "--nmd-code-bg": "rgba(2, 6, 23, 0.06)",
      "--nmd-code-border": "rgba(15, 23, 42, 0.12)",
      "--nmd-quote-bg": "rgba(2, 6, 23, 0.04)",
      "--nmd-link": "#2563eb",
      "--nmd-link-hover": "#1d4ed8",
      fontFamily: "var(--nmd-font)",
      fontSize: "14px",
      lineHeight: "1.7",
      color: "var(--nmd-text)",
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale",
    },
    ".nmd-root > *:first-child": { marginTop: 0 },
    ".nmd-root > *:last-child": { marginBottom: 0 },
    ".nmd-root .nested-md-content > *:first-child": { marginTop: 0 },
    ".nmd-root .nested-md-content > *:last-child": { marginBottom: 0 },
    ".nmd-root p": { margin: "1em 0" },
    ".nmd-root h1, .nmd-root h2, .nmd-root h3, .nmd-root h4, .nmd-root h5, .nmd-root h6":
      {
        fontWeight: 600,
        display: "block",
        letterSpacing: "-0.01em",
      },
    ".nmd-root h1": { fontSize: "26px", lineHeight: "1.25" },
    ".nmd-root h2": { fontSize: "22px", lineHeight: "1.3" },
    ".nmd-root h3": { fontSize: "18px", lineHeight: "1.35" },
    ".nmd-root h4": { fontSize: "16px", lineHeight: "1.4" },
    ".nmd-root h5": { fontSize: "14px", lineHeight: "1.45" },
    ".nmd-root h6": {
      fontSize: "14px",
      lineHeight: "1.45",
      color: "var(--nmd-muted)",
    },
    ".nmd-root strong, .nmd-root b": { fontWeight: 600 },
    ".nmd-root a": {
      color: "var(--nmd-link)",
      textDecoration: "underline",
      textDecorationColor: "rgba(37, 99, 235, 0.35)",
      textUnderlineOffset: "2px",
    },
    ".nmd-root a:hover": {
      color: "var(--nmd-link-hover)",
      textDecorationColor: "rgba(29, 78, 216, 0.6)",
    },
    ".nmd-root ul": {
      paddingLeft: "1.5em",
      margin: "1em 0",
      listStyleType: "disc",
    },
    ".nmd-root ol": {
      paddingLeft: "1.5em",
      margin: "1em 0",
      listStyleType: "decimal",
    },
    ".nmd-root li": { margin: "0.5em 0" },
    ".nmd-root li > ul, .nmd-root li > ol": { marginTop: "0.5em" },
    ".nmd-root hr": {
      border: "none",
      borderTop: "1px solid var(--nmd-border)",
      margin: "2em 0",
    },
    ".nmd-root .nmd-pre": {
      margin: "16px 0",
      padding: "12px 14px",
      borderRadius: "10px",
      border: "1px solid var(--nmd-code-border)",
      backgroundColor: "var(--nmd-bg)",
      overflowX: "auto",
      lineHeight: "1.55",
    },
    ".nmd-root .nmd-code-inline": {
      backgroundColor: "var(--nmd-code-bg)",
      border: "1px solid rgba(15, 23, 42, 0.08)",
      padding: "0.12em 0.35em",
      borderRadius: "8px",
      fontSize: "0.92em",
    },
    ".nmd-root .nmd-code-block": {
      backgroundColor: "transparent",
      border: "none",
      padding: 0,
    },
    ".nmd-root .nmd-table-wrap": {
      overflowX: "auto",
      margin: "16px 0",
      borderRadius: "10px",
      border: "1px solid var(--nmd-border)",
      backgroundColor: "var(--nmd-bg)",
    },
    ".nmd-root .nmd-table": {
      width: "100%",
      borderCollapse: "separate",
      borderSpacing: 0,
    },
    ".nmd-root .nmd-th": {
      backgroundColor: "rgba(2, 6, 23, 0.04)",
      fontWeight: 600,
      textAlign: "left",
      padding: "10px 12px",
      borderBottom: "1px solid var(--nmd-border)",
      verticalAlign: "top",
    },
    ".nmd-root .nmd-td": {
      padding: "10px 12px",
      borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
      verticalAlign: "top",
    },
    ".nmd-root .nmd-table tr:last-child .nmd-td": { borderBottom: "none" },
    ".nmd-root .nmd-blockquote": {
      margin: "16px 0",
      padding: "12px 14px",
      borderLeft: "4px solid var(--nmd-border)",
      borderRadius: "10px",
      backgroundColor: "var(--nmd-quote-bg)",
      color: "var(--nmd-muted)",
    },
    ".nmd-root .nmd-blockquote > *:first-child": { marginTop: 0 },
    ".nmd-root .nmd-blockquote > *:last-child": { marginBottom: 0 },
    ".nmd-root mark": {
      backgroundColor: "#ffeb3b",
      color: "inherit",
      padding: "0.1em 0.3em",
      borderRadius: "2px",
    },
  });

  return (
    <div
      className={["nmd-root", className].filter(Boolean).join(" ")}
      style={style}
    >
      <style>{stylesheet}</style>
      <ReactMarkdown
        remarkPlugins={[remarkGfm] as unknown as PluggableList}
        rehypePlugins={
          [
            rehypeRaw,
            [rehypeSanitize, customSchema],
          ] as unknown as PluggableList
        }
        components={mergedComponents}
      >
        {expandedMarkdown}
      </ReactMarkdown>
    </div>
  );
};

export default NestedMarkdown;
