import { useState, useEffect, type CSSProperties } from "react";
import ReactMarkdown, { type Components, type Options } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { expandNestedMarkdown } from "./nestedMdExpand";
import { PluggableList } from "unified";
import { Mermaid } from "./Mermaid";

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
      // Allow the HAST property names for data-* attributes in the sanitize schema
      ["data-nested-md"],
      ["dataNestedMd"],
      ["data-boxed"],
      ["dataBoxed"],
      ["data-id"],
      ["dataId"],
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
    span: [
      ...(defaultSchema.attributes?.span || []),
      ["data-nested-md"],
      ["dataNestedMd"],
      ["data-boxed"],
      ["dataBoxed"],
      ["data-id"],
      ["dataId"],
      ["style"],
      ["className"],
    ],
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const remarkForceLooseLists = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (tree: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const visit = (node: any) => {
      if (node.type === "list") {
        node.spread = true;
      }
      if (node.type === "listItem") {
        node.spread = true;
      }
      if (node.children) {
        node.children.forEach(visit);
      }
    };
    visit(tree);
  };
};

export interface NestedMarkdownProps extends Omit<Options, "children"> {
  content?: string;
  children?: string;
  className?: string;
  components?: Components;
  style?: CSSProperties;
  theme?: "light" | "dark" | "auto";
  defaultShow?: "preview" | "code" | "both";
}

export const NestedMarkdown = ({
  content,
  children,
  className,
  components,
  remarkPlugins,
  rehypePlugins,
  style,
  theme = "auto",
  defaultShow,
  ...reactMarkdownProps
}: NestedMarkdownProps) => {
  const [expandedMarkdown, setExpandedMarkdown] = useState("");

  useEffect(() => {
    let mounted = true;
    const process = async () => {
      try {
        const markdownSource = content ?? children ?? "";
        const expanded = await expandNestedMarkdown(markdownSource, {
          defaultShow,
        });
        if (mounted) setExpandedMarkdown(expanded);
      } catch (err) {
        if (mounted) {
          console.error("Markdown expansion error:", err);
          setExpandedMarkdown(content ?? children ?? "");
        }
      }
    };
    process();
    return () => {
      mounted = false;
    };
  }, [content, children, defaultShow]);

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
    code: ({ node, inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || "");
      const isMermaid = match && match[1] === "mermaid";

      if (!inline && isMermaid) {
        return (
          <Mermaid
            chart={String(children).replace(/\n$/, "")}
            theme={theme === "auto" ? undefined : theme}
          />
        );
      }

      return (
        <code
          {...props}
          className={[className, "nmd-code"].filter(Boolean).join(" ")}
        >
          {children}
        </code>
      );
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    img: ({ node, ...props }: any) => {
      const { className, style, ...imgProps } = props;
      let src = imgProps.src;
      if (
        src &&
        !src.startsWith("http") &&
        !src.startsWith("/") &&
        !src.startsWith("data:")
      ) {
        src = `/${src}`;
      }
      return (
        <img
          {...imgProps}
          src={src}
          className={["nmd-img", className].filter(Boolean).join(" ")}
          style={style}
        />
      );
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    blockquote: ({ node, ...props }: any) => (
      <blockquote className="nmd-blockquote" {...props} />
    ),
  };

  const mergedComponents = { ...defaultComponents, ...components };
  const mergedRemarkPlugins = [
    remarkGfm,
    remarkForceLooseLists,
    ...(remarkPlugins ? remarkPlugins : []),
  ] as unknown as PluggableList;
  const mergedRehypePlugins = [
    rehypeRaw,
    ...(rehypePlugins ? rehypePlugins : []),
    [rehypeSanitize, customSchema],
  ] as unknown as PluggableList;

  const darkThemeVars: CssDeclarations = {
    "--nmd-text": "#d4d4d4",
    "--nmd-muted": "#a0a0a0",
    "--nmd-border": "#3e3e3e",
    "--nmd-bg": "#1e1e1e",
    "--nmd-code-bg": "rgba(255, 255, 255, 0.06)",
    "--nmd-code-border": "rgba(255, 255, 255, 0.18)",
    "--nmd-quote-bg": "#252526",
    "--nmd-link": "#3794ff",
    "--nmd-link-hover": "#5ea6ff",
    "--nmd-mark-bg": "rgba(250, 204, 21, 0.22)",
    "--nmd-mark-text": "#e2e8f0",
    "--nmd-nested-bg": "#252526",
    "--nmd-nested-text": "#d4d4d4",
    "--nmd-nested-border": "#3e3e3e",
    colorScheme: "dark",
  };

  const stylesheet = cssFromRules({
    ".nmd-root": {
      "--nmd-font":
        '-apple-system, "system-ui", "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
      "--nmd-text": "#0f172a",
      "--nmd-muted": "#475569",
      "--nmd-border": "rgba(15, 23, 42, 0.12)",
      "--nmd-bg": "#ffffff",
      "--nmd-code-bg": "rgba(2, 6, 23, 0.04)",
      "--nmd-code-border": "rgba(15, 23, 42, 0.10)",
      "--nmd-quote-bg": "rgba(2, 6, 23, 0.04)",
      "--nmd-link": "#2563eb",
      "--nmd-link-hover": "#1d4ed8",
      "--nmd-mark-bg": "#ffeb3b",
      "--nmd-mark-text": "inherit",
      "--nmd-nested-bg": "#eef6ff",
      "--nmd-nested-text": "#0f172a",
      "--nmd-nested-border": "#93c5fd",
      "--nmd-font-mono":
        "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
      fontFamily: "var(--nmd-font)",
      fontSize: "1rem",
      lineHeight: "1.5",
      color: "var(--nmd-text)",
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale",
      colorScheme: "light",
    },
    ".nmd-root[data-theme='dark']": darkThemeVars,
    ".nmd-root[data-theme='dark'] [data-nested-md]": {
      color:
        "var(--nmd-inline-text-dark, var(--nmd-inline-text-light)) !important",
    },
    ".nmd-root[data-theme='dark'] [data-nested-md][data-boxed='true']": {
      backgroundColor:
        "var(--nmd-inline-bg-dark, var(--nmd-inline-bg-light)) !important",
      borderColor:
        "var(--nmd-inline-border-dark, var(--nmd-inline-border-light)) !important",
    },
    ".nmd-root[data-theme='dark'] [data-nested-md] hr": {
      borderTopColor:
        "var(--nmd-inline-border-dark, var(--nmd-inline-border-light)) !important",
    },
    ".nmd-root > *:first-child": { marginTop: 0 },
    ".nmd-root > *:last-child": { marginBottom: 0 },
    ".nmd-root .nested-md-content > *:first-child": { marginTop: 0 },
    ".nmd-root .nested-md-content > *:last-child": { marginBottom: 0 },
    ".nmd-root p": { margin: "0.5em 0" },
    ".nmd-root h1, .nmd-root h2, .nmd-root h3, .nmd-root h4, .nmd-root h5, .nmd-root h6":
      {
        fontWeight: 600,
        display: "block",
        letterSpacing: "-0.01em",
        marginTop: "1em",
        marginBottom: "0.5em",
      },
    ".nmd-root h1": { fontSize: "1.857em", lineHeight: "1.25" },
    ".nmd-root h2": { fontSize: "1.571em", lineHeight: "1.3" },
    ".nmd-root h3": { fontSize: "1.286em", lineHeight: "1.35" },
    ".nmd-root h4": { fontSize: "1.143em", lineHeight: "1.4" },
    ".nmd-root h5": { fontSize: "1em", lineHeight: "1.45" },
    ".nmd-root h6": {
      fontSize: "1em",
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
      paddingLeft: "2em",
      margin: "0.5em 0",
      listStyleType: "disc",
    },
    ".nmd-root ol": {
      paddingLeft: "2em",
      margin: "0.5em 0",
      listStyleType: "decimal",
    },
    ".nmd-root li": { margin: "0.25em 0" },
    ".nmd-root ul > li:first-child, .nmd-root ol > li:first-child": {
      marginTop: 0,
    },
    ".nmd-root ul > li:last-child, .nmd-root ol > li:last-child": {
      marginBottom: 0,
    },
    ".nmd-root li > *:first-child": { marginTop: "0 !important" },
    ".nmd-root li > *:last-child": { marginBottom: "0 !important" },
    ".nmd-root li > ul, .nmd-root li > ol": { marginTop: "0.5em" },
    ".nmd-root li > p": { marginBottom: 0 },
    ".nmd-root hr": {
      border: "none",
      borderTop: "1px solid var(--nmd-border)",
      margin: "2em 0",
    },
    ".nmd-root .nmd-img": {
      maxWidth: "100%",
      maxHeight: "420px",
      width: "auto",
      height: "auto",
      borderRadius: "0.571em",
      display: "block",
      margin: "0.5em 0",
    },
    ".nmd-root .nmd-pre": {
      margin: "0.5em 0",
      padding: "0.857em 1.5em",
      borderRadius: "0.714em",
      border: "1px solid var(--nmd-code-border)",
      backgroundColor: "var(--nmd-code-bg)",
      overflowX: "auto",
      fontSize: "0.9em",
      lineHeight: "1.55",
      fontFamily: "var(--nmd-font-mono)",
    },
    ".nmd-root pre": { fontSize: "0.9em" },
    ".nmd-root code": {
      backgroundColor: "var(--nmd-code-bg)",
      border: "1px solid var(--nmd-code-border)",
      padding: "0.12em 0.35em",
      borderRadius: "0.25em",
      fontFamily: "var(--nmd-font-mono)",
    },
    ".nmd-root .nmd-code": { fontSize: "0.9em" },
    ".nmd-root .nmd-pre code": {
      backgroundColor: "transparent",
      border: "none",
      padding: 0,
      borderRadius: 0,
      fontSize: "inherit",
      fontFamily: "inherit",
      color: "inherit",
    },
    ".nmd-root .nmd-table-wrap": {
      overflowX: "auto",
      margin: "0.5em 0",
      borderRadius: "0.714em",
      border: "1px solid var(--nmd-border)",
      backgroundColor: "var(--nmd-bg)",
    },
    ".nmd-root .nmd-table": {
      width: "100%",
      borderCollapse: "separate",
      borderSpacing: 0,
    },
    ".nmd-root .nmd-table .nmd-th:first-child, .nmd-root .nmd-table .nmd-td:first-child":
      {
        whiteSpace: "nowrap",
      },
    ".nmd-root .nmd-th": {
      backgroundColor: "rgba(2, 6, 23, 0.04)",
      fontWeight: 600,
      textAlign: "left",
      padding: "0.714em 0.857em",
      borderBottom: "1px solid var(--nmd-border)",
      verticalAlign: "top",
    },
    ".nmd-root .nmd-th > *:first-child, .nmd-root .nmd-td > *:first-child": {
      marginTop: 0,
    },
    ".nmd-root .nmd-th > *:last-child, .nmd-root .nmd-td > *:last-child": {
      marginBottom: 0,
    },
    ".nmd-root .nmd-td": {
      padding: "0.714em 0.857em",
      borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
      verticalAlign: "top",
    },
    ".nmd-root .nmd-table tr:last-child .nmd-td": { borderBottom: "none" },
    ".nmd-root .nmd-blockquote": {
      margin: "0.5em 0",
      padding: "0.857em 1em",
      borderLeft: "4px solid var(--nmd-border)",
      borderRadius: "0.714em",
      backgroundColor: "var(--nmd-quote-bg)",
      color: "var(--nmd-muted)",
    },
    ".nmd-root .nmd-blockquote > *:first-child": { marginTop: 0 },
    ".nmd-root .nmd-blockquote > *:last-child": { marginBottom: 0 },
    ".nmd-root mark": {
      backgroundColor: "var(--nmd-mark-bg)",
      color: "var(--nmd-mark-text)",
      padding: "0.1em 0.3em",
      borderRadius: "0.143em",
    },
  });

  const autoDarkStylesheet = `@media (prefers-color-scheme: dark) { ${cssFromRules(
    {
      ".nmd-root[data-theme='auto']": darkThemeVars,
      ".nmd-root[data-theme='auto'] [data-nested-md]": {
        color:
          "var(--nmd-inline-text-dark, var(--nmd-inline-text-light)) !important",
      },
      ".nmd-root[data-theme='auto'] [data-nested-md][data-boxed='true']": {
        backgroundColor:
          "var(--nmd-inline-bg-dark, var(--nmd-inline-bg-light)) !important",
        borderColor:
          "var(--nmd-inline-border-dark, var(--nmd-inline-border-light)) !important",
      },
      ".nmd-root[data-theme='auto'] [data-nested-md] hr": {
        borderTopColor:
          "var(--nmd-inline-border-dark, var(--nmd-inline-border-light)) !important",
      },
    },
  )} }`;

  return (
    <div
      className={["nmd-root", className].filter(Boolean).join(" ")}
      style={style}
      data-theme={theme}
    >
      <style>{`${stylesheet}\n${autoDarkStylesheet}`}</style>
      <ReactMarkdown
        {...(reactMarkdownProps as Omit<Options, "children">)}
        remarkPlugins={mergedRemarkPlugins}
        rehypePlugins={mergedRehypePlugins}
        components={mergedComponents}
      >
        {expandedMarkdown}
      </ReactMarkdown>
    </div>
  );
};

export default NestedMarkdown;
