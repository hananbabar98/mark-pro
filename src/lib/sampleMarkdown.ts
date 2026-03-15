export const SAMPLE_MARKDOWN = `# MarkPro – Professional Markdown Previewer

> **Welcome!** Edit this document on the left, or start fresh. Use the toolbar above to switch views.

---

## Features Overview

MarkPro is a **professional Markdown editor** with real-time preview, mind maps, slide view, table of contents, and more.

### Core Capabilities

- **Live Preview** – See your formatted document as you type
- **Mind Map** – Visualize structure as an interactive markmap
- **Slide View** – Present content slide-by-slide (separate with \`---\`)
- **Table of Contents** – Auto-generated from headings
- **Document Summary** – Stats + AI-style overview
- **Export PDF** – One-click professional export
- **Word Count** – Always visible in the toolbar

---

## Markdown Showcase

### Text Formatting

You can use **bold**, *italic*, ~~strikethrough~~, and \`inline code\` anywhere.

Combine them: **_bold italic_**, or \`**code bold**\` in code blocks.

### Code Blocks

\`\`\`typescript
interface Document {
  title: string;
  content: string;
  wordCount: number;
}

function parseDocument(md: string): Document {
  return {
    title: extractTitle(md),
    content: md,
    wordCount: md.split(/\\s+/).length,
  };
}
\`\`\`

\`\`\`python
def word_count(text: str) -> int:
    """Count words in a markdown document."""
    import re
    clean = re.sub(r'\`\`\`.*?\`\`\`', '', text, flags=re.DOTALL)
    return len(clean.split())
\`\`\`

---

## Data Table

| Feature | Status | Priority |
|---|---|---|
| Live Preview | ✅ Done | High |
| Mind Map | ✅ Done | High |
| Slide View | ✅ Done | Medium |
| Table of Contents | ✅ Done | Medium |
| PDF Export | ✅ Done | High |
| Dark Mode | ✅ Done | Medium |

---

## Blockquotes & Lists

> "The best writing tool is the one that gets out of your way."
> — *MarkPro Philosophy*

### Ordered List

1. Write your Markdown in the editor
2. See the preview update in real-time
3. Toggle views using the toolbar
4. Export to PDF when ready

### Nested List

- **Views**
  - Split editor + preview
  - Full-screen preview
  - Mind map visualization
  - Slide presentation
- **Analysis**
  - Table of contents
  - Document summary
  - Word & character count

---

## Mind Map Preview

Switch to **Mindmap** view to see this document's structure as an interactive tree diagram. You can zoom, pan, and expand nodes.

---

## Slide Mode

Switch to **Slides** view to present each section as a slide card.

---

## Getting Started

1. **Edit** – Modify the markdown in the left panel
2. **View** – Use toolbar buttons to switch views
3. **Export** – Click *Export PDF* for a polished document
4. **Toggle** – Switch between light and dark mode

---

*Built with React, Vite, Tailwind CSS, marked, markmap, and highlight.js*
`;
