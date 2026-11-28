import { readdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.filter(entry => !entry.name.startsWith(".")).map(async entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? htmlFiles(file) : entry.name.endsWith(".html") ? [file] : [];
  }));
  return files.flat();
}

const attribute = value => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");

// Decorate the published copies only; imported HTML and its relative asset paths stay intact.
export default function staticNotes() {
  let config;
  return {
    name: "static-notes",
    hooks: {
      "astro:config:done": ({ config: resolved }) => { config = resolved; },
      "astro:build:done": async ({ dir, logger }) => {
        const publicRoot = fileURLToPath(config.publicDir);
        const outputRoot = fileURLToPath(dir);
        const base = `/${config.base.split("/").filter(Boolean).join("/")}`.replace(/\/$/, "");
        const localUrl = route => `${base}/${route}`;
        const files = await htmlFiles(publicRoot);
        for (const source of files) {
          const relative = path.relative(publicRoot, source).split(path.sep).join("/");
          const output = path.join(outputRoot, relative);
          let html = await readFile(output, "utf8");
          const route = relative.replace(/(^|\/)index\.html$/, "$1");
          const canonical = new URL(localUrl(route), config.site).href;
          const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
          if (!title) throw new Error(`HTML 笔记缺少 title: ${relative}`);
          html = html.replace(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi, "");
          html = html.replace(/<\/head>/i, `<link rel="canonical" href="${attribute(canonical)}">\n<link rel="stylesheet" href="${localUrl("static-notes.css")}">\n<link rel="icon" href="${localUrl("images/star-favicon.svg")}">\n<meta data-pagefind-meta="title[content]" content="${title.trim().replaceAll('"', "&quot;")}">\n</head>`);
          const navigation = `<nav class="site-note-nav" aria-label="个人网站导航" data-pagefind-ignore><a href="${localUrl("")}">逐光未尽</a><a href="${localUrl("notes/")}">返回笔记列表</a><a href="${localUrl("search/")}">搜索笔记</a></nav>`;
          const contentTag = /<main\b/i.test(html) ? /<main\b([^>]*)>/i : /<body\b([^>]*)>/i;
          html = html.replace(contentTag, (tag, attributes) => `${tag.slice(0, -1)}${/data-pagefind-body/.test(attributes) ? "" : " data-pagefind-body"}>${navigation}`);
          html = html.replace(/<div\b([^>]*class=["'][^"']*\bfooter\b[^"']*["'][^>]*)>/gi, '<div$1 data-pagefind-ignore>');
          html = html.replace(/<table\b/gi, '<div class="site-note-table" role="region" aria-label="表格，可横向滚动" tabindex="0"><table').replace(/<\/table>/gi, "</table></div>");
          await writeFile(output, html, "utf8");
        }
        logger.info(`Prepared ${files.length} HTML notes with site navigation, canonical URLs and search indexing.`);
      },
    },
  };
}
