import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { pathToFileURL } from "node:url";

// Use an installed Playwright package, or supply an existing runtime module.
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE
    ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href
    : "playwright"
);
const base = process.env.TEST_URL || "http://127.0.0.1:4321/";
const output = process.env.TEST_OUTPUT || "test-results";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });
class Site {
  constructor(page) {
    this.page = page;
  }
  async open(route = "") {
    await this.page.goto(new URL(route, base).href);
  }
  async visibleText(text) {
    await this.page
      .getByText(text, { exact: false })
      .first()
      .waitFor({ state: "visible" });
  }
  async noOverflow() {
    const position = await this.page.evaluate(() => ({ x: scrollX, y: scrollY }));
    for (const img of await this.page.locator("img").all()) {
      await img.scrollIntoViewIfNeeded();
      await img.evaluate(element => element.decode());
    }
    await this.page.evaluate(({ x, y }) => scrollTo({ left: x, top: y, behavior: "instant" }), position);
    assert(
      await this.page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      "Horizontal overflow",
    );
    assert(
      await this.page.evaluate(() =>
        [...document.images].every(
          (img) => img.complete && img.naturalWidth > 0,
        ),
      ),
      "Broken image",
    );
  }
}
try {
  const results = await Promise.all(
    [375, 768, 1440].map(async (width) => {
      const context = await browser.newContext({
        viewport: { width, height: 1000 },
        colorScheme: "light",
        permissions: ["clipboard-read", "clipboard-write"],
      });
      await context.tracing.start({ screenshots: true, snapshots: true });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("response", (response) => {
        if (response.status() >= 400)
          errors.push(`${response.status()} ${response.url()}`);
      });
      const site = new Site(page);
      try {
        await site.open();
        await site.noOverflow();
        if (width === 1440) await page.screenshot({ path: `${output}/preview-desktop.png` });
        await page.keyboard.press("Tab");
        assert.equal(await page.evaluate(() => document.activeElement?.textContent), "跳到正文");
        await page.emulateMedia({ reducedMotion: "reduce" });
        assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), "auto");
        await page.screenshot({
          path: `${output}/home-${width}.png`,
          fullPage: true,
        });
        await page.getByRole("button", { name: "切换到深色主题" }).click();
        assert(
          await page.evaluate(() =>
            document.documentElement.classList.contains("dark"),
          ),
        );
        await page.reload();
        await page.getByRole("button", { name: "切换到浅色主题" }).waitFor();
        await page.screenshot({
          path: `${output}/home-dark-${width}.png`,
          fullPage: true,
        });
        await page.getByRole("button", { name: "切换到浅色主题" }).click();
        await page.getByRole("link", { name: "查看项目" }).click();
        await page
          .getByRole("button", { name: "Markdown", exact: true })
          .click();
        await site.visibleText("共 1 个项目");
        await page
          .getByRole("link", { name: "持续生长的学习笔记", exact: true })
          .click();
        await page.reload();
        await page
          .getByRole("heading", { level: 1, name: "持续生长的学习笔记" })
          .waitFor();
        await site.noOverflow();
        assert.equal(
          await page
            .getByRole("link", { name: "查看源码", exact: true })
            .count(),
          0,
        );
        await site.open("notes/");
        await page.getByRole("button", { name: "列表选择", exact: true }).click();
        await page.getByRole("button", { name: "工具与方法 (1)", exact: true }).click();
        await site.visibleText("共 1 篇笔记");
        await page.reload();
        assert.equal(
          new URL(page.url()).searchParams.get("category"),
          "工具与方法",
        );
        await page.getByRole("button", { name: "列表选择", exact: true }).click();
        await page.getByRole("button", { name: "Markdown (1)", exact: true }).click();
        await site.visibleText("共 1 篇笔记");
        await site.open("notes/?category=" + encodeURIComponent("工具与方法") + "&tag=" + encodeURIComponent("随笔"));
        await site.visibleText("还没有符合条件的笔记");
        await page.goBack();
        await site.visibleText("共 1 篇笔记");
        await site.open("posts/markdown-writing/");
        await site.noOverflow();
        await page
          .getByRole("button", { name: "Copy code", exact: true })
          .click();
        await page
          .getByRole("button", { name: "已复制代码", exact: true })
          .waitFor();
        assert(
          (await page.evaluate(() => navigator.clipboard.readText())).includes(
            "const notebook",
          ),
        );
        if (width < 1000) {
          await page
            .getByText("本页目录", { exact: true })
            .filter({ visible: true })
            .click();
          await page
            .getByRole("link", { name: "用表格比较信息", exact: true })
            .filter({ visible: true })
            .click();
        } else {
          await page
            .getByRole("complementary", { name: "文章目录" })
            .getByRole("link", { name: "用表格比较信息", exact: false })
            .click();
        }
        assert(page.url().includes("#"));
        await page.screenshot({
          path: `${output}/article-${width}.png`,
          fullPage: true,
        });
        await site.open("search/");
        const search = page.getByRole("textbox");
        await search.fill("记录");
        await page
          .getByRole("link", {
            name: "从这里开始，留下一页自己的记录",
            exact: true,
          })
          .waitFor();
        const resultLink = await page
          .getByRole("link", {
            name: "从这里开始，留下一页自己的记录",
            exact: true,
          })
          .getAttribute("href");
        assert(
          new URL(resultLink, base).pathname.startsWith(new URL(base).pathname),
        );
        await search.fill("zzzznomatch9827");
        await site.visibleText("没有找到");
        await search.fill("PRIVATE_DRAFT_SENTINEL_7B92");
        await site.visibleText("没有找到");
        await page.screenshot({
          path: `${output}/search-${width}.png`,
          fullPage: true,
        });
        await site.noOverflow();
        await site.open("about/");
        await site.noOverflow();
        assert.deepEqual(errors, [], `Browser errors at ${width}px`);
        return `${width}px: navigation, images, theme persistence, project filter, note filters/history, code copy, TOC, Chinese search, draft isolation passed`;
      } finally {
        await context.tracing.stop({ path: `${output}/trace-${width}.zip` });
        await context.close();
      }
    }),
  );
  results.forEach((result) => console.log(result));
} finally {
  await browser.close();
}
