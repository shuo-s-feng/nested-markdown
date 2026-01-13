export interface InlineMdBlockAttributes {
  id?: string;
  title?: string;
  show?: "preview" | "code" | "both";
  bg?: string;
  text?: string;
  border?: string;
  emoji?: string;
  boxed?: "true" | "false";
  style?: string;
}

export interface ParsedInlineMdBlock {
  startIndex: number;
  endIndex: number;
  attributes: InlineMdBlockAttributes;
  nestedMarkdown: string;
}

