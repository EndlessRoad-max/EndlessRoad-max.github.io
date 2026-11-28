import assert from "node:assert/strict";
import { mkdir, readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : "playwright");
const base = process.env.TEST_URL || "http://127.0.0.1:4328/";
const output = "test-results/html-notes";
const pages = JSON.parse(await readFile(new URL("./mysql-files.json", import.meta.url), "utf8")).filter(file => file.endsWith(".html"));
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });

class NotesSite {
  constructor(page) { this.page = page; }
  async open(route) {
    const response = await this.page.goto(new URL(route, base).href);
    assert.equal(response.status(), 200, route);
  }
  async checkLayout() {
    await this.page.getByRole("navigation", { name: "个人网站导航" }).waitFor();
    const position = await this.page.evaluate(() => ({ x: scrollX, y: scrollY }));
    for (const image of await this.page.getByRole("img").all()) {
      await image.scrollIntoViewIfNeeded();
      await image.evaluate(element => element instanceof HTMLImageElement && element.src ? element.decode() : undefined);
    }
    await this.page.evaluate(({ x, y }) => scrollTo({ left: x, top: y, behavior: "instant" }), position);
    const overflow = await this.page.evaluate(() => ({ actual: document.documentElement.scrollWidth, viewport: innerWidth }));
    assert(overflow.actual <= overflow.viewport + 1, `${this.page.url()}: horizontal overflow ${JSON.stringify(overflow)}`);
  }
}

try {
  const results = await Promise.allSettled([390, 1440].map(async width => {
    const context = await browser.newContext({ viewport: { width, height: 950 }, permissions: ["clipboard-read", "clipboard-write"] });
    await context.tracing.start({ screenshots: true, snapshots: true });
    const page = await context.newPage();
    page.setDefaultTimeout(15000);
    page.setDefaultNavigationTimeout(20000);
    const site = new NotesSite(page);
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("response", response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    try {
      await site.open("notes/?category=数据库");
      await page.getByRole("link", { name: "MySQL 学习笔记", exact: true }).click();
      await page.waitForURL(new URL("mysql/", base).href);
      await site.checkLayout();
      await page.screenshot({ path: `${output}/mysql-${width}.png` });
      await page.getByRole("main").getByRole("link", { name: /^主从复制：/ }).click();
      await site.checkLayout();
      assert(decodeURI(page.url()).includes("02-主从复制.html"));
      const copyButtons = await page.getByRole("button", { name: "复制命令", exact: true }).all();
      assert(copyButtons.length > 0, "Command copying was not initialized");
      await copyButtons[0].click();
      await page.getByRole("button", { name: "已复制", exact: true }).waitFor();
      await page.getByRole("link", { name: "返回笔记列表", exact: true }).click();
      await page.waitForURL(new URL("notes/", base).href);
      await page.screenshot({ path: `${output}/notes-${width}.png` });

      for (const file of pages) {
        await site.open(`mysql/${file}`);
        await site.checkLayout();
      }

      await site.open("search/");
      await page.getByPlaceholder("搜索笔记或项目…").fill("主从复制");
      const result = page.getByRole("link", { name: "02 主从复制：原理、搭建与测试 · 运维篇 · MySQL 笔记", exact: true });
      await result.waitFor();
      await page.screenshot({ path: `${output}/search-${width}.png` });
      await result.click();
      await site.checkLayout();
      assert(decodeURI(page.url()).includes("02-主从复制.html"));
      assert.deepEqual(errors, [], "Browser errors or HTTP failures");
      return { width, pages: pages.length, entry: "passed", copyCommand: "passed", returnLink: "passed", search: "passed" };
    } catch (error) {
      await page.screenshot({ path: `${output}/failure-${width}.png`, fullPage: true });
      throw error;
    } finally {
      await context.tracing.stop({ path: `${output}/trace-${width}.zip` });
      await context.close();
    }
  }));
  console.log(JSON.stringify(results.map(result => result.status === "fulfilled" ? result.value : { error: String(result.reason) }), null, 2));
  assert(results.every(result => result.status === "fulfilled"), "HTML note browser checks failed");
} finally { await browser.close(); }
