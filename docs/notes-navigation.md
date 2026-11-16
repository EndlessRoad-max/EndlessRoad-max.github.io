# 笔记分类与标签导航

笔记页顶部使用两组平铺按钮：分类和标签，直接筛选下方文章。没有星系地图、动画或第三方图形依赖。

## 使用

- 分类全部展示，篇数按已发布文章统计，按篇数降序、同篇数按中文名称排序。
- 标签根据当前分类统计；未选分类时可跨分类筛选。桌面显示前 10 个，600px 及以下显示前 6 个，可展开全部或收起。选中标签始终可见。
- 分类和标签均为单选；切换分类清除标签。再次点击标签或标签组的“全部”取消标签筛选，分类组的“全部”和“清除筛选”恢复全部笔记。
- 筛选变化返回第一页，每页 10 篇；仅多页结果显示分页。正文搜索入口始终可用。
- `category`、`tag`、`page` 地址参数保持兼容，可分享、刷新和使用前进后退。无效筛选显示空结果，可清除；超范围页码限制在有效范围。
- 按钮支持键盘及 `aria-pressed` 状态，结果数通过 live region 通知。禁用 JavaScript 时展示完整文章列表及搜索入口，隐藏筛选控件。

## 实现

`NotesNavigator.astro` 提供分组结构，`src/scripts/notes-navigation.ts` 从已渲染的文章读取数据，管理筛选、标签折叠和历史记录；`src/styles/notes-navigation.css` 使用全站主题变量。

## 验证

- `pnpm check`、`pnpm build`、`pnpm check:build`。
- `scripts/check-note-filters.mjs`：4 种宽度、亮暗主题、分类与标签组合、展开收起、历史记录、旧链接、空结果、键盘、触摸和无 JavaScript 展示。
- `scripts/check-notes-pagination.mjs`：仅拦截测试响应注入文章，验证分页、刷新、筛选重置页码、折叠中的选中标签、焦点、长标签和响应式显示数量。
- `scripts/browser-check.mjs`：整站导航、搜索、文章功能和笔记筛选回归。`scripts/check-fixtures.mjs` 验证子路径部署和临时内容。
- 测试复用已有 Playwright，可设置 `PLAYWRIGHT_MODULE` 为本地模块路径、`CHROMIUM_PATH` 为浏览器路径；专项测试地址使用 `CHECK_URL`，整站测试使用 `TEST_URL`。
- 截图与 trace 写入已忽略的 `test-results/notes/`。
