import { readdir, readFile, access } from "node:fs/promises";
import assert from "node:assert/strict";
import path from "node:path";
const root = path.resolve("dist");
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((e) =>
        e.isDirectory() ? walk(path.join(dir, e.name)) : path.join(dir, e.name),
      ),
    )
  ).flat();
}
const files = await walk(root);
for (const route of [
  "index.html",
  "notes/index.html",
  "projects/index.html",
  "about/index.html",
  "search/index.html",
  "404.html",
  "rss.xml",
  "pagefind/pagefind.js",
])
  await access(path.join(root, route));
let pages = 0;
const home = await readFile(path.join(root, "index.html"), "utf8");
const base = new URL(home.match(/rel="canonical" href="([^"]+)"/)[1]).pathname;
for (const file of files.filter((f) => /\.(html|xml|json)$/.test(f))) {
  const text = await readFile(file, "utf8");
  assert(
    !text.includes("PRIVATE_DRAFT_SENTINEL_7B92"),
    `Draft leaked into ${file}`,
  );
  assert(
    !text.includes("unpublished-example"),
    `Draft URL leaked into ${file}`,
  );
  if (!file.endsWith(".html")) continue;
  pages++;
  const canonical = text.match(/rel="canonical" href="([^"]+)"/);
  assert(canonical, `Missing canonical: ${file}`);
  const markup = text.replace(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi, "");
  for (const [, target] of markup.matchAll(/(?:href|src)=["']([^"']+)["']/g)) {
    if (target.startsWith("#") || /^(?:mailto:|tel:|data:)/i.test(target)) continue;
    assert(!/^(?:file:|[a-z]:\\)/i.test(target), `Local computer path in ${file}`);
    const link = new URL(target.replaceAll("&amp;", "&"), canonical[1]);
    if (link.origin !== new URL(canonical[1]).origin) continue;
    assert(link.pathname.startsWith(base), `Link escapes base: ${target} in ${file}`);
    const relative = decodeURIComponent(link.pathname.slice(base.length));
    const resolved = path.join(
      root,
      relative.endsWith("/") || !relative ? `${relative}index.html` : relative,
    );
    await access(resolved).catch(() =>
      assert.fail(`Broken local link ${target} in ${file}`),
    );
  }
}
const mysqlFiles = files.filter(file => file.startsWith(path.join(root, "mysql") + path.sep));
assert(mysqlFiles.some(file => file.endsWith("index.html")), "Missing MySQL topic");
for (const file of mysqlFiles) {
  assert(!/[\\/]\.[^\\/]+|_template\.html|\.py$/.test(path.relative(root, file)), `Working file published: ${file}`);
  if (!file.endsWith(".html")) continue;
  const html = await readFile(file, "utf8");
  assert(html.includes("data-pagefind-body"), `HTML note excluded from search: ${file}`);
  assert(html.includes('aria-label="个人网站导航"'), `Missing return navigation: ${file}`);
}
const notes = await readFile(path.join(root, "notes/index.html"), "utf8");
assert(notes.includes(`href="${base}mysql/"`), "HTML topic missing from note list");
assert(!notes.includes(`${base}posts/mysql-notes/`), "HTML note links to a Markdown route");
console.log(
  `Verified ${pages} HTML pages: routes, local links, assets, canonical URLs, and draft exclusion.`,
);
