import { readdir, readFile, writeFile, mkdir, copyFile, unlink } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const [sourceArgument, topic] = process.argv.slice(2);
if (!sourceArgument || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(topic || "")) {
  throw new Error('Usage: node scripts/sync-html-notes.mjs "E:\\mysql笔记" mysql');
}
const source = path.resolve(sourceArgument);
const repository = fileURLToPath(new URL("../", import.meta.url));
const target = path.join(repository, "public", topic);
if (source === target || source.startsWith(target + path.sep)) throw new Error("Source must be separate from the published topic.");
const extensions = new Set([".html", ".css", ".js", ".png", ".jpg", ".jpeg", ".svg", ".webp", ".gif", ".avif", ".ico", ".woff", ".woff2", ".pdf"]);
const files = [];
async function collect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name.startsWith("_") || entry.name === "node_modules") continue;
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) await collect(file);
    else if (entry.isFile() && extensions.has(path.extname(file).toLowerCase())) files.push(path.relative(source, file).split(path.sep).join("/"));
  }
}
await collect(source);
if (!files.includes("index.html")) throw new Error("Topic must include index.html.");
const manifestPath = path.join(repository, "scripts", `${topic}-files.json`);
let previous = [];
try { previous = JSON.parse(await readFile(manifestPath, "utf8")); } catch (error) { if (error.code !== "ENOENT") throw error; }
function destination(relative) {
  const resolved = path.resolve(target, relative);
  if (!resolved.startsWith(target + path.sep)) throw new Error(`Path escapes topic: ${relative}`);
  return resolved;
}
for (const relative of files) {
  const output = destination(relative);
  await mkdir(path.dirname(output), { recursive: true });
  await copyFile(path.join(source, relative), output);
}
for (const relative of previous.filter(file => !files.includes(file))) {
  await unlink(destination(relative)).catch(error => { if (error.code !== "ENOENT") throw error; });
}
await writeFile(manifestPath, JSON.stringify(files.sort(), null, 2) + "\n");
console.log(`Synced ${files.length} reading files to public/${topic}/; local working files and templates excluded.`);
