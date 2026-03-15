# MarkPro – Markdown Live Previewer

A fast, feature-rich Markdown editor and previewer built with React, TypeScript, and Vite. Write Markdown on the left, see the rendered result on the right — or switch between any of the specialized views.

**Live Demo:** [mark-pro-xi.vercel.app](https://mark-pro-xi.vercel.app/)

## Features

- **Split View** — side-by-side editor and rendered preview
- **Editor / Preview** — focused single-panel modes
- **Mind Map** — visualize your document as an interactive mind map (powered by Markmap)
- **Slides** — present your Markdown as a slideshow
- **Table of Contents** — jump to any heading with a click and smooth scroll highlight
- **Summary** — condensed document overview
- **Dark / Light mode** — persisted across sessions via localStorage
- **Live word & line count** in the status bar
- **Syntax highlighting** in code blocks via Highlight.js

## Tech Stack

| Layer | Library |
|---|---|
| UI | React 19, TypeScript, Tailwind CSS 4 |
| Build | Vite 7 |
| Markdown parsing | marked |
| Mind maps | markmap |
| Syntax highlighting | highlight.js |
| Sanitization | DOMPurify |
| PDF export | html2pdf.js |
| Icons | lucide-react |

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Build for production
npm run build

# Preview the production build
npm run preview
```

## Support

If you find this project useful, consider giving it a star on GitHub — it helps others discover it and keeps me motivated to improve it!

## Author

**Abdul Hanan Babar**
- GitHub: [@hananbabar98](https://github.com/hananbabar98)
- LinkedIn: [Abdul Hanan Babar](https://www.linkedin.com/in/abdul-hanan-babar-b37811142/)

## License

MIT
