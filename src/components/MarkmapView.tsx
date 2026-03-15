import { useEffect, useRef, useState, useCallback } from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  GitBranch,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface MarkmapViewProps {
  source: string;
}

const PALETTE = [
  "#6366f1","#8b5cf6","#06b6d4","#10b981",
  "#f59e0b","#ef4444","#ec4899","#14b8a6",
  "#3b82f6","#84cc16",
];

// Correct CDN URLs (verified from package.json "jsdelivr" fields)
const CDN = {
  d3:          "https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js",
  markmapView: "https://cdn.jsdelivr.net/npm/markmap-view@0.17.0/dist/browser/index.js",
  markmapLib:  "https://cdn.jsdelivr.net/npm/markmap-lib@0.17.0/dist/browser/index.iife.js",
};

export default function MarkmapView({ source }: MarkmapViewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [nodeCount, setNodeCount] = useState(0);
  const [depth, setDepth] = useState(-1);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDark = () => document.documentElement.classList.contains("dark");

  const buildSrcdoc = useCallback(
    (md: string, dark: boolean, expandDepth: number) => {
      const depthVal = expandDepth === -1 ? 999 : expandDepth;
      const bg        = dark ? "#030712" : "#f8fafc";
      const textColor = dark ? "#e2e8f0" : "#1e293b";
      const linkColor = dark ? "#4b5563" : "#9ca3af";
      const nodeLine  = dark ? "#374151" : "#d1d5db";

      // Safely embed markdown into a JS template literal inside the HTML
      const safeMd = md
        .replace(/\\/g, "\\\\")
        .replace(/`/g, "\\`")
        .replace(/\$/g, "\\$");

      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 100%; height: 100%; overflow: hidden; background: ${bg}; }
  #mindmap { width: 100%; height: 100vh; display: block; }
  .markmap-node text {
    fill: ${textColor} !important;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 13px;
  }
  .markmap-node > line { stroke: ${nodeLine} !important; }
  .markmap-link { stroke: ${linkColor} !important; stroke-opacity: 0.7; fill: none; }
  .markmap-node circle { stroke-width: 2px; }
  #status {
    position: fixed; top: 50%; left: 50%;
    transform: translate(-50%,-50%);
    font-family: system-ui; font-size: 14px;
    color: ${textColor}; text-align: center;
    pointer-events: none;
  }
  #err {
    display: none; position: fixed; top: 50%; left: 50%;
    transform: translate(-50%,-50%);
    background: #fee2e2; color: #991b1b;
    padding: 16px 24px; border-radius: 8px;
    font-family: monospace; font-size: 12px;
    max-width: 85%; word-break: break-all; z-index: 999;
  }
</style>
</head>
<body>
<svg id="mindmap"></svg>
<div id="status">Loading…</div>
<div id="err"></div>
<script>
(function() {
  var statusEl = document.getElementById('status');
  var errEl    = document.getElementById('err');

  function showErr(msg) {
    errEl.style.display = 'block';
    errEl.textContent   = msg;
    statusEl.style.display = 'none';
    window.parent.postMessage({ type: 'mm-error', message: msg }, '*');
  }

  function setStatus(msg) { statusEl.textContent = msg; }

  function loadScript(src, cb) {
    setStatus('Loading ' + src.split('/').pop() + '…');
    var s  = document.createElement('script');
    s.src  = src;
    s.onload  = cb;
    s.onerror = function() { showErr('Failed to load CDN script:\\n' + src); };
    document.head.appendChild(s);
  }

  // Sequential load: d3 → markmap-view → markmap-lib → render
  loadScript('${CDN.d3}', function() {
    loadScript('${CDN.markmapView}', function() {
      // Stub katex so markmap-lib does not crash when katex is absent
      window.katex = window.katex || { renderToString: function(s){ return s; } };
      loadScript('${CDN.markmapLib}', function() {
        setStatus('Rendering…');
        try {
          var mm = window.markmap;
          if (!mm || !mm.Transformer || !mm.Markmap) {
            showErr('window.markmap not available after loading scripts.');
            return;
          }

          var transformer = new mm.Transformer();
          var result      = transformer.transform(\`${safeMd}\`);
          var root        = result.root;

          try {
            var assets = transformer.getUsedAssets(result.features);
            if (assets.styles)  mm.loadCSS(assets.styles);
            if (assets.scripts) mm.loadJS(assets.scripts, { getMarkmap: function(){ return window.markmap; } });
          } catch(e) { /* non-fatal */ }

          var count = 0;
          (function walk(n){ count++; (n.children||[]).forEach(walk); })(root);

          var PALETTE = ${JSON.stringify(PALETTE)};

          var map = mm.Markmap.create('#mindmap', {
            autoFit:            true,
            duration:           400,
            nodeMinHeight:      22,
            paddingX:           20,
            spacingVertical:    10,
            spacingHorizontal:  140,
            fitRatio:           0.95,
            initialExpandLevel: ${depthVal},
            color: function(node) {
              var d = node.state && node.state.depth != null ? node.state.depth : 0;
              return PALETTE[d % PALETTE.length];
            }
          }, root);

          window.__mm = map;
          statusEl.style.display = 'none';

          setTimeout(function() {
            try { map.fit(); } catch(e) {}
            window.parent.postMessage({ type: 'mm-ready', nodeCount: count }, '*');
          }, 350);

          window.addEventListener('message', function(e) {
            var m = window.__mm;
            if (!e.data || !e.data.cmd || !m) return;
            try {
              if (e.data.cmd === 'zoomIn')  m.rescale(m.state.scale * 1.3);
              if (e.data.cmd === 'zoomOut') m.rescale(m.state.scale / 1.3);
              if (e.data.cmd === 'fit')     m.fit();
              if (e.data.cmd === 'reset')   { m.rescale(1); setTimeout(function(){ m.fit(); }, 50); }
            } catch(ex) {}
          });

        } catch(err) {
          showErr('Render error: ' + (err && err.message ? err.message : String(err)));
        }
      });
    });
  });
})();
</script>
</body>
</html>`;
    },
    []
  );

  // Rebuild srcdoc on source / depth change
  useEffect(() => {
    setReady(false);
    setError(null);
    const iframe = iframeRef.current;
    if (!iframe) return;
    iframe.srcdoc = buildSrcdoc(source, isDark(), depth);
  }, [source, depth, buildSrcdoc]);

  // Messages from iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "mm-ready") {
        setNodeCount(e.data.nodeCount ?? 0);
        setReady(true);
        setError(null);
      }
      if (e.data?.type === "mm-error") {
        console.error("Markmap:", e.data.message);
        setError(e.data.message);
        setReady(true);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  // Rebuild on dark/light toggle
  useEffect(() => {
    const obs = new MutationObserver(() => {
      setReady(false);
      const iframe = iframeRef.current;
      if (iframe) iframe.srcdoc = buildSrcdoc(source, isDark(), depth);
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, [source, depth, buildSrcdoc]);

  const sendCmd = (cmd: string) =>
    iframeRef.current?.contentWindow?.postMessage({ cmd }, "*");

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)] bg-white dark:bg-gray-900 flex-shrink-0">
        <div className="flex items-center gap-2">
          <GitBranch size={15} className="text-indigo-500" />
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
            Mind Map
          </span>
          {ready && !error && nodeCount > 0 && (
            <span className="ml-2 text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-medium">
              {nodeCount} nodes
            </span>
          )}
          {error && (
            <span className="ml-2 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-medium">
              Error — check console
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-400 dark:text-gray-500 mr-1">Depth:</span>
          <button
            onClick={() => setDepth((d) => (d === -1 ? 6 : Math.max(1, d - 1)))}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
            title="Collapse one level"
          >
            <ChevronDown size={14} />
          </button>
          <span className="text-xs font-mono w-8 text-center text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5">
            {depth === -1 ? "All" : depth}
          </span>
          <button
            onClick={() => setDepth((d) => (d >= 6 ? -1 : d === -1 ? -1 : d + 1))}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
            title="Expand one level"
          >
            <ChevronUp size={14} />
          </button>

          <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />

          <button onClick={() => sendCmd("zoomIn")}  className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors" title="Zoom In"><ZoomIn size={15} /></button>
          <button onClick={() => sendCmd("zoomOut")} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors" title="Zoom Out"><ZoomOut size={15} /></button>
          <button onClick={() => sendCmd("fit")}     className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors" title="Fit to screen"><Maximize2 size={15} /></button>
          <button onClick={() => sendCmd("reset")}   className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors" title="Reset view"><RotateCcw size={15} /></button>
        </div>
      </div>

      {/* Canvas area */}
      <div className="relative flex-1 overflow-hidden">
        {!ready && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 gap-4 pointer-events-none">
            <div className="relative">
              <div className="w-12 h-12 border-2 border-indigo-200 dark:border-indigo-900 rounded-full" />
              <div className="absolute inset-0 w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Rendering mind map…</span>
              <span className="text-xs text-gray-400 dark:text-gray-500">Fetching markmap from CDN</span>
            </div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          title="Markmap Mind Map"
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin"
          style={{ display: "block" }}
        />
      </div>

      <div className="flex items-center justify-center px-4 py-1.5 border-t border-[var(--border)] bg-white dark:bg-gray-900 flex-shrink-0">
        <span className="text-xs text-gray-400 dark:text-gray-500">
          Scroll to zoom · Drag to pan · Click nodes to collapse/expand
        </span>
      </div>
    </div>
  );
}
