import { marked } from "marked";
import hljs from "highlight.js/lib/core";

// Register only the most common languages to keep bundle small
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import bash from "highlight.js/lib/languages/bash";
import css from "highlight.js/lib/languages/css";
import xml from "highlight.js/lib/languages/xml"; // html
import json from "highlight.js/lib/languages/json";
import markdown from "highlight.js/lib/languages/markdown";
import sql from "highlight.js/lib/languages/sql";
import rust from "highlight.js/lib/languages/rust";
import go from "highlight.js/lib/languages/go";
import java from "highlight.js/lib/languages/java";
import cpp from "highlight.js/lib/languages/cpp";
import yaml from "highlight.js/lib/languages/yaml";
import plaintext from "highlight.js/lib/languages/plaintext";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("js", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("ts", typescript);
hljs.registerLanguage("python", python);
hljs.registerLanguage("py", python);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("sh", bash);
hljs.registerLanguage("shell", bash);
hljs.registerLanguage("css", css);
hljs.registerLanguage("html", xml);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("json", json);
hljs.registerLanguage("markdown", markdown);
hljs.registerLanguage("md", markdown);
hljs.registerLanguage("sql", sql);
hljs.registerLanguage("rust", rust);
hljs.registerLanguage("rs", rust);
hljs.registerLanguage("go", go);
hljs.registerLanguage("java", java);
hljs.registerLanguage("cpp", cpp);
hljs.registerLanguage("c", cpp);
hljs.registerLanguage("yaml", yaml);
hljs.registerLanguage("yml", yaml);
hljs.registerLanguage("plaintext", plaintext);
hljs.registerLanguage("txt", plaintext);

/**
 * Shared slug generator.
 * Used by BOTH the markdown heading renderer AND extractToc so IDs always match.
 * Input is the RAW heading text (may contain markdown formatting like **bold**).
 */
export function makeSlug(raw: string): string {
  return raw
    .replace(/\*\*|__|\*|_|~~|`/g, "") // strip bold/italic/code markers
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")           // remove non-word chars (except spaces & hyphens)
    .replace(/\s+/g, "-")               // spaces → hyphens
    .replace(/-{2,}/g, "-")             // collapse consecutive hyphens
    .replace(/^-+|-+$/g, "");           // trim leading/trailing hyphens
}

// Configure marked
marked.setOptions({ breaks: true, gfm: true });

const renderer = new marked.Renderer();

renderer.code = function ({ text, lang }: { text: string; lang?: string }) {
  const language = lang && hljs.getLanguage(lang) ? lang : "plaintext";
  const highlighted = hljs.highlight(text, { language }).value;
  return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`;
};

renderer.heading = function ({
  text,
  depth,
}: {
  text: string;
  depth: number;
}) {
  // `text` here may still contain HTML from inline tokens (e.g. <strong>),
  // so strip HTML tags before slugging.
  const rawText = text.replace(/<[^>]*>/g, "");
  const slug = makeSlug(rawText);
  return `<h${depth} id="heading-${slug}">${text}</h${depth}>`;
};

marked.use({ renderer });

export function parseMarkdown(source: string): string {
  const result = marked(source);
  return typeof result === "string" ? result : "";
}

export interface TocItem {
  level: number;
  text: string;
  slug: string;
}

export function extractToc(source: string): TocItem[] {
  const items: TocItem[] = [];
  const lines = source.split("\n");
  for (const line of lines) {
    // Skip lines inside fenced code blocks
    const match = line.match(/^(#{1,6})\s+(.+)/);
    if (match) {
      const level = match[1].length;
      if (level > 4) continue; // only show h1–h4 in TOC
      const rawText = match[2].trim();
      // Display text: strip markdown inline formatting for readability
      const text = rawText.replace(/\*\*|__|\*|_|~~|`/g, "");
      // Slug MUST use makeSlug on rawText — same as the renderer above
      const slug = makeSlug(rawText);
      items.push({ level, text, slug });
    }
  }
  return items;
}

export function extractSlides(source: string): string[] {
  const parts = source.split(/\n---\n/);
  return parts.map((p) => p.trim()).filter(Boolean);
}

export function countWords(source: string): number {
  return source
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "")
    .replace(/[#*_~>\[\]!()]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export function generateSummary(source: string): string {
  const lines = source.split("\n").filter((l) => l.trim());
  const headings: string[] = [];
  const paragraphs: string[] = [];

  for (const line of lines) {
    if (line.startsWith("#")) {
      headings.push(line.replace(/^#+\s*/, "").trim());
    } else if (
      !line.startsWith("```") &&
      !line.startsWith(">") &&
      !line.startsWith("|") &&
      !line.startsWith("!") &&
      line.length > 40
    ) {
      const clean = line
        .replace(/\*\*|__|\*|_|~~|`/g, "")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .trim();
      if (clean) paragraphs.push(clean);
    }
  }

  const title = headings[0] || "Document";
  const sections = headings.slice(1, 6);
  const excerpt = paragraphs
    .slice(0, 3)
    .map((p) => p.substring(0, 120))
    .join(" … ");

  let summary = `## Summary: ${title}\n\n`;
  if (sections.length > 0) {
    summary += `**Sections covered:** ${sections.join(" · ")}\n\n`;
  }
  if (excerpt) {
    summary += `**Overview:** ${excerpt}${excerpt.length >= 120 ? "…" : ""}\n\n`;
  }
  summary += `**Stats:** ${countWords(source).toLocaleString()} words · ${headings.length} headings · ${
    source.split("\n").length
  } lines`;

  return summary;
}
