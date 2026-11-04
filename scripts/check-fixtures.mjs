import { writeFile, unlink, readFile, mkdir } from "node:fs/promises";
import { spawn, spawnSync } from "node:child_process";
import { resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import assert from "node:assert/strict";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE
    ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href
    : "playwright"
);
const created = [];
const env = {
  ...process.env,
  ASTRO_TELEMETRY_DISABLED: "1",
  SITE_URL: "https://example.github.io",
  BASE_PATH: "/portfolio/",
};
let server, browser;
async function fixture(relative, content) {
  const filename = resolve(relative);
  assert(filename.startsWith(resolve("src/content") + sep));
  await writeFile(filename, content, { flag: "wx" });
  created.push(filename);
}
function build(buildEnv) {
  const result = spawnSync(
    process.execPath,
    ["node_modules/astro/astro.js", "build"],
    { env: buildEnv, encoding: "utf8" },
  );
  assert.equal(result.status, 0, result.stdout + result.stderr);
  const index = spawnSync(
    process.execPath,
    ["node_modules/pagefind/lib/runner/bin.cjs", "--site", "dist"],
    { env: buildEnv, encoding: "utf8" },
  );
  assert.equal(index.status, 0, index.stdout + index.stderr);
  const check = spawnSync(process.execPath, ["scripts/check-build.mjs"], {
    encoding: "utf8",
  });
  assert.equal(check.status, 0, check.stdout + check.stderr);
}
try {
  await fixture(
    "src/content/posts/qa-inline.svg",
    '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="80"><rect width="100" height="80" fill="blue"/></svg>',
  );
  for (let i = 1; i <= 11; i++) {
    await fixture(
      `src/content/posts/qa-check-${i}.md`,
      `---\ntitle: "验收 ${i} ${i === 1 ? "长标题".repeat(35) : "分页笔记"}"\npublished: 2026-11-01\nupdated: 2099-01-01\ndescription: "用于验证新增内容和布局"\ncategory: "验收分类"\ntags: [验收标签]\ndraft: false\n---\n\n## 测试内容\n\n![相对路径图片](./qa-inline.svg)\n\n${i === 1 ? "|" + Array(15).fill("宽表格").join("|") + "|\n|" + Array(15).fill("---").join("|") + "|\n|" + Array(15).fill("长单元格内容").join("|") + "|\n\n```typescript\nconst longValue = '" + "longvalue".repeat(80) + "';\n```" : "新的记录应该自动进入列表、分类和搜索。"}`,
    );
  }
  await fixture(
    "src/content/projects/qa-no-cover.md",
    "---\ntitle: 无封面项目验收\ndescription: 无封面和链接的项目仍可阅读\ntags: [验收标签]\n---\n\n## 测试\n\n不配置源码和演示按钮。",
  );
  await fixture(
    "src/content/projects/qa-draft.md",
    "---\ntitle: 项目草稿\ndescription: PRIVATE_DRAFT_SENTINEL_7B92\ndraft: true\n---\n\nPRIVATE_DRAFT_SENTINEL_7B92",
  );
  build(env);
  const home = await readFile("dist/index.html", "utf8");
  assert(home.includes("qa-check-"), "Updated notes must appear on home");
  const rss = await readFile("dist/rss.xml", "utf8");
  assert(rss.includes("/portfolio/posts/qa-check-1/"));
  server = spawn(
    process.execPath,
    [
      "node_modules/astro/astro.js",
      "preview",
      "--host",
      "127.0.0.1",
      "--port",
      "4322",
    ],
    { env, stdio: ["ignore", "pipe", "pipe"], windowsHide: true },
  );
  await new Promise((done, fail) => {
    const timer = setTimeout(
      () => fail(new Error("Preview did not start")),
      20000,
    );
    server.stdout.on("data", (data) => {
      if (data.toString().includes("4322")) {
        clearTimeout(timer);
        done();
      }
    });
    server.on("error", fail);
  });
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 375, height: 900 } });
  const base = "http://127.0.0.1:4322/portfolio/";
  await page.goto(base + "notes/");
  assert.equal(await page.locator("[data-note]:visible").count(), 10);
  await page.getByRole("button", { name: "下一页" }).click();
  assert.equal(await page.locator("[data-note]:visible").count(), 4);
  assert(page.url().includes("page=2"));
  await page.reload();
  assert.equal(await page.locator("[data-note]:visible").count(), 4);
  await page.getByLabel("按分类阅读").selectOption("验收分类");
  assert.equal(await page.locator("[data-note]:visible").count(), 10);
  assert(!page.url().includes("page=2"));
  await page.getByRole("button", { name: "下一页" }).click();
  assert.equal(await page.locator("[data-note]:visible").count(), 1);
  await page.goto(base + "posts/qa-check-1/");
  await page.reload();
  assert(
    await page
      .getByRole("img", { name: "相对路径图片" })
      .evaluate((img) => img.complete && img.naturalWidth > 0),
  );
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
    "Long content overflow",
  );
  await mkdir("test-results", { recursive: true });
  await page.screenshot({
    path: "test-results/long-content-375.png",
    fullPage: true,
  });
  await page.goto(base + "projects/");
  for (const image of await page.locator("img").all()) {
    await image.scrollIntoViewIfNeeded();
    await image.evaluate((img) => img.decode());
  }
  assert(
    await page.evaluate(() =>
      [...document.images].every((img) => img.complete && img.naturalWidth > 0),
    ),
  );
  await page.getByRole("link", { name: "无封面项目验收", exact: true }).click();
  assert.equal(
    await page.getByRole("link", { name: "查看源码", exact: true }).count(),
    0,
  );
  await page.goto(base + "search/");
  await page.getByRole("textbox").fill("无封面");
  await page
    .getByRole("link", { name: "无封面项目验收", exact: true })
    .waitFor();
  await page.getByRole("link", { name: "无封面项目验收", exact: true }).click();
  assert(
    page.url().includes("/portfolio/projects/qa-no-cover/"),
    "Search result must preserve base",
  );
  console.log(
    "Passed: /portfolio/ deployment, 14-note pagination, URL refresh, new content/search, updated sorting, relative images, long title/code/table, no-cover project, draft project exclusion.",
  );
} finally {
  await browser?.close();
  server?.kill();
  for (const filename of created) await unlink(filename);
  // Always restore the ordinary site, without test fixtures or a test base path.
  const restored = { ...process.env, ASTRO_TELEMETRY_DISABLED: "1" };
  delete restored.BASE_PATH;
  delete restored.SITE_URL;
  build(restored);
}
