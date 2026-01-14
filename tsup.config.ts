import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  sourcemap: true,
  skipNodeModulesBundle: false,
  noExternal: [
    "chroma-js",
    "marked",
    "react-markdown",
    "rehype-raw",
    "rehype-sanitize",
    "remark-gfm",
    "unified",
  ],
  external: ["react", "react-dom"],
});
