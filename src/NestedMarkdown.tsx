import { useState, useEffect } from "react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { Box, SxProps, Theme } from "@mui/material";
import { Image } from "antd";
import { expandNestedMarkdown } from "./nestedMdExpand";
import { PluggableList } from "unified";

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
  sx?: SxProps<Theme>;
}

export const NestedMarkdown: React.FC<NestedMarkdownProps> = ({
  content,
  className,
  components,
  sx,
}) => {
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
    table: ({ node, ...props }) => (
      <div style={{ overflowX: "auto", marginBottom: "16px" }}>
        <table
          style={{
            borderCollapse: "collapse",
            width: "100%",
            border: "1px solid #e0e0e0",
          }}
          {...props}
        />
      </div>
    ),
    th: ({ node, ...props }) => (
      <th
        style={{
          border: "1px solid #e0e0e0",
          padding: "8px 16px",
          backgroundColor: "#f5f5f5",
          fontWeight: 600,
          textAlign: "left",
          verticalAlign: "top",
        }}
        {...props}
      />
    ),
    td: ({ node, ...props }) => (
      <td
        style={{
          border: "1px solid #e0e0e0",
          padding: "8px 16px",
          verticalAlign: "top",
        }}
        {...props}
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
            maxHeight: "400px",
            width: "auto",
            height: "auto",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
          wrapperStyle={{
            maxWidth: "80%",
            width: "fit-content",
            display: "block",
            margin: "16px 0",
          }}
        />
      );
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    blockquote: ({ node, ...props }: any) => (
      <Box
        component="blockquote"
        sx={{
          borderLeft: "4px solid #e0e0e0",
          pl: 2,
          ml: 0,
          my: 2,
          color: "text.secondary",
          fontStyle: "italic",
          "& h1, & h2, & h3, & h4, & h5, & h6": {
            color: "rgba(0, 0, 0, 0.6)",
          },
          "& ul": { pl: 2, mb: 1.5, listStyleType: "disc" },
          "& ol": { pl: 2, mb: 1.5, listStyleType: "decimal" },
          "& li": { mb: 0.5 },
          "& > *:last-child": { mb: 0 },
        }}
        {...props}
      />
    ),
  };

  const mergedComponents = { ...defaultComponents, ...components };

  return (
    <Box
      className={className}
      sx={{
        fontSize: "14px",
        lineHeight: 1.6,
        color: "#000000",
        "& > *:first-child": { mt: 0 },
        "& .nested-md-content > *:first-child": { mt: 0 },
        "& .nested-md-content > *:last-child": { mb: 0 },
        "& > *:last-child": { mb: 0 },
        "& p": { mb: 0.5 },
        "& h1, & h2, & h3, & h4, & h5, & h6": {
          color: "text.primary",
          fontWeight: 600,
          mt: 2,
          mb: 1,
          display: "block",
        },
        "& h1": { fontSize: "24px" },
        "& h2": { fontSize: "20px" },
        "& h3": { fontSize: "18px" },
        "& h4": { fontSize: "16px" },
        "& strong, & b": {
          color: "text.primary",
          fontWeight: 600,
        },
        "& ul": { pl: 2, mb: 0.5, listStyleType: "disc" },
        "& ol": { pl: 2, mb: 0.5, listStyleType: "decimal" },
        "& li > ul, & li > ol": { mt: 0.5 },
        "& li": {
          mb: 0.5,
        },
        "& code": {
          bgcolor: "#f5f5f5",
          px: 0.5,
          py: 0.2,
          borderRadius: 1,
          fontFamily: "monospace",
        },
        "& mark": {
          backgroundColor: "#ffeb3b",
          color: "inherit",
          padding: "0.1em 0.3em",
          borderRadius: "2px",
        },
        ...sx,
      }}
    >
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
    </Box>
  );
};

export default NestedMarkdown;
