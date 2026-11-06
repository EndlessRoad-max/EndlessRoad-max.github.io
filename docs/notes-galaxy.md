# 笔记页银河导航

笔记页使用两层导航：笔记本 → 分类 → 分类内标签。数据直接来自已发布文章，标签数量按当前分类统计；文章列表继续在地图下方显示。

## 使用

- 点击分类进入主题，点击标签筛选，再次点击标签或中心圆清除标签筛选。
- “全部主题”和“清除筛选”返回全部笔记。“列表选择”提供不依赖动态图的同等入口。
- 背景旋臂和节点约 240 秒公转一周。鼠标进入、焦点进入时暂停；触摸后保持暂停，按“继续公转”恢复。
- 减少动态效果默认暂停。页面隐藏或地图离开视口时停止动画。
- 桌面每组 6 个节点，手机每组 4 个，可翻组。分类、标签和文章分页沿用 `category`、`tag`、`page` 地址参数。

## 实现

`GalaxyNavigator.astro` 提供导航结构，`src/scripts/notes-galaxy.ts` 管理筛选、历史记录、Canvas 和节点。`src/styles/notes-galaxy.css` 隔离地图样式。

旋臂是固定种子的程序绘图，离屏缓存只在尺寸改变时生成，动画帧旋转缓存并更新 HTML 按钮位置。没有新增第三方图形依赖或远程素材请求。这是视觉化导航，并非天体物理模拟。

不支持 Canvas 时保留节点和列表选择；禁用 JavaScript 时保留完整文章列表。旧的仅标签链接仍跨分类筛选，无效分类/标签显示可清除的空结果。

## 验证

- `pnpm check`、`pnpm build`、`pnpm check:build`。
- `scripts/check-note-filters.mjs`：多尺寸亮暗主题、分类和标签、历史记录、旧链接、完整公转几何、暂停、触摸、键盘及降级行为。
- `scripts/check-galaxy-pagination.mjs`：注入仅用于测试的文章，检查文章分页、刷新恢复、筛选重置页码和移动端节点翻组。
- `scripts/browser-check.mjs`：整站导航、搜索、文章功能和笔记筛选回归。
- 测试复用现有 Playwright，可设置 `PLAYWRIGHT_MODULE` 为本地模块绝对路径，`CHROMIUM_PATH` 为浏览器路径；专项测试地址使用 `CHECK_URL`，整站测试使用 `TEST_URL`。
- 截图和 trace 写入已忽略的 `test-results/galaxy/`。
