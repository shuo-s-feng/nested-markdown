export interface InlineMdBlockAttributes {
  id?: string;
  show?: "preview" | "code" | "both";
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
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
