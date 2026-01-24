import { useEffect, useState, useId } from "react";
import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: false,
  theme: "default",
  securityLevel: "loose",
});

export interface MermaidProps {
  chart: string;
  theme?: "light" | "dark";
}

export const Mermaid = ({ chart, theme }: MermaidProps) => {
  const id = useId().replace(/:/g, "");
  const [svg, setSvg] = useState("");

  useEffect(() => {
    const renderChart = async () => {
      try {
        // Determine the actual theme to use
        let mermaidTheme: "default" | "dark" = "default";
        if (theme === "dark") {
          mermaidTheme = "dark";
        } else if (theme === "light") {
          mermaidTheme = "default";
        } else {
          // Auto detection
          mermaidTheme = window.matchMedia("(prefers-color-scheme: dark)")
            .matches
            ? "dark"
            : "default";
        }

        // Re-initialize mermaid with the selected theme
        mermaid.initialize({
          startOnLoad: false,
          theme: mermaidTheme,
          securityLevel: "loose",
          suppressErrorRendering: true,
        });

        const { svg } = await mermaid.render(`mermaid-${id}`, chart);
        setSvg(svg);
      } catch (error) {
        console.error("Failed to render mermaid chart:", error);
        setSvg(
          `<pre class="mermaid-error" style="color: var(--nmd-error, #ef4444); padding: 8px; background: var(--nmd-error-bg, #fee2e2); border-radius: 4px;">Mermaid syntax error</pre>`,
        );
      }
    };

    if (chart) {
      renderChart();
    }
  }, [chart, id, theme]);

  return <div className="mermaid" dangerouslySetInnerHTML={{ __html: svg }} />;
};
