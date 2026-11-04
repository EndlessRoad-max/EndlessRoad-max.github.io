# 拾页 · 个人展示与笔记

基于 [Fuwari](https://github.com/saicaca/fuwari) 的个人网站：展示首页、项目集、Markdown 笔记、中文全文搜索、明暗主题，静态部署到 GitHub Pages。

## 本地运行

使用 Node.js 24 LTS、pnpm 9.14.4（package.json 已声明），在项目根目录运行：

```sh
pnpm install --frozen-lockfile
pnpm dev
```

访问终端输出的本地地址。完整搜索需要生产索引：

```sh
pnpm check
pnpm build
node scripts/check-build.mjs
pnpm preview
```

开发模式没有 Pagefind 构建索引，搜索页会提示使用 build + preview。不要把它误认为线上搜索故障。受限环境可设置 `ASTRO_TELEMETRY_DISABLED=1`，避免 Astro 写入用户遥测配置。

## 换成你的信息

编辑 `src/portfolio.config.ts`：昵称、站点名、首页副标题、介绍、头像、GitHub 地址、邮箱和关注方向。空的 GitHub/邮箱不显示。

- 头像：`public/images/avatar.svg`。
- 界面参考 Astro Sphere：黑白灰配色、居中首屏、窄内容栏和文字列表。首页星点及弧面背景由 CSS 绘制，不加载插画或动画脚本。
- 主题及响应式样式：`src/styles/portfolio.css`。
- 首页最多显示 4 个精选项目、6 篇最近更新笔记。
- 初始化内容明确标为示例，请发布个人站点前替换，不代表真实个人经历。

## 写笔记

```sh
pnpm new-post my-first-note
```

会生成 `src/content/posts/my-first-note.md`，默认草稿，不覆盖同名文件。文件名就是稳定 URL 的一部分，不要用修改文件名的方式改标题。

```yaml
---
title: 我的第一篇笔记
published: 2026-11-04
updated: 2026-11-05 # 可选，更新后用于首页和笔记列表排序
description: 用一两句话说明笔记的内容
category: 开发实践
tags: [TypeScript, 学习]
image: /images/my-cover.webp # 可选，放在 public/images 中
draft: false
---
```

正文使用 Markdown。支持表格、代码高亮、复制和自动目录。封面使用相对 public 的绝对路径或 HTTPS 地址；正文图片优先放在笔记同级目录，用 `![描述](./image.png)` 引用，Astro 会处理子路径及资源构建。正文跨文章链接用相对路径，例如 `../markdown-writing/`，不要硬编码站点根路径。

草稿在本地和生产都不生成页面，不进入 RSS、站点地图、搜索或分类列表。想预览正文时可临时设为 false，发布前恢复。**公开仓库中的草稿源文件仍然公开；私人笔记不要提交。**

笔记列表 `/notes/` 按分类和标签联合筛选，每页 10 篇；筛选和页码保留在 URL，支持刷新、分享和浏览器前进后退。关闭 JavaScript 时显示全部笔记。

## 添加项目

在 `src/content/projects/` 新建英文文件名 Markdown：

```yaml
---
title: 项目名称
description: 解决的问题和主要功能
tags: [Astro, TypeScript]
status: 进行中
image: /images/project-site.svg
source: https://github.com/your-name/your-project
demo: https://your-name.github.io/your-project/
featured: true
order: 1
draft: false
---
```

正文建议包含问题、功能、实现思路和复盘。`source`、`demo` 不存在就删掉对应行，不填空字符串。列表采用简洁文字卡片，封面仅在详情页显示，未配置则隐藏。`featured: true` 进入首页，按 `order` 升序排列。

## 发布到 GitHub Pages

部署仓库：`EndlessRoad-max/EndlessRoad-max.github.io`。推送到 `main` 后触发自动检查与部署；首次发布需要在仓库设置中启用 GitHub Pages。

1. 在自己的 GitHub 账户创建公开仓库。个人站点建议命名 `<用户名>.github.io`；普通项目仓库也支持。
2. 将本项目推送到自己仓库的 `main` 分支。若使用 Git clone 得到本项目，先检查 `git remote -v`，不要推送到 Fuwari 上游；使用 `git remote set-url origin <自己的仓库地址>` 修改来源。
3. 仓库 Settings → Pages → Build and deployment → Source 选择 **GitHub Actions**。
4. 查看 Actions 中的 `Check and deploy to GitHub Pages`。检查、构建和产物验证通过后才会发布；PR 只检查，不部署。
5. 从部署任务提供的网址打开站点，确认项目、笔记、图片、搜索和 RSS 正常。

工作流自动读取 `GITHUB_REPOSITORY`：个人站点使用 `/`，普通仓库使用 `/<仓库名>/`。无需在组件里改链接。若需要覆盖，设置仓库 Actions 变量 `SITE_URL`（如 `https://name.github.io`）、`BASE_PATH`（如 `/notes-site/`）。不设置时使用自动识别。首次发布不需要购买域名。

本地测试子路径（PowerShell）：

```powershell
$env:SITE_URL = 'https://example.github.io'
$env:BASE_PATH = '/portfolio/'
pnpm build
node scripts/check-build.mjs
pnpm preview
# 访问 http://localhost:4321/portfolio/
Remove-Item Env:SITE_URL, Env:BASE_PATH
```

构建失败不会替换已有线上版本；撤销错误内容可回退对应提交后重新构建。`dist/` 是生成目录，不提交。依赖版本由 `pnpm-lock.yaml` 锁定。

## 验证与许可

- `pnpm check`：Astro/TypeScript 检查。
- `pnpm build`：生成静态页面和 Pagefind 中文索引。
- `node scripts/check-build.mjs`：验证路由、站内链接、资源、canonical 和示例草稿隔离。
- 浏览器检查：375 / 768 / 1440px，主题持久化、目录、复制、中文搜索、项目筛选与笔记分页。

浏览器验收脚本为 `scripts/browser-check.mjs` 和 `scripts/check-fixtures.mjs`，需要可用的 Playwright/Chromium。可通过 `PLAYWRIGHT_MODULE` 指定已有 Playwright 的 `index.mjs`，`PLAYWRIGHT_BROWSERS_PATH` 指定浏览器目录；未指定模块时使用当前环境安装的 `playwright`。前者检查运行中的预览站点（默认 `http://127.0.0.1:4321/`，可用 `TEST_URL` 覆盖）；后者临时创建边界测试内容，测试子路径与分页，并在结束后清理测试内容、恢复正常构建。截图与 trace 保存在忽略提交的 `test-results/`。

保留 Fuwari 的 MIT 许可证，来源及改动见 `UPSTREAM.md`。旧版多语言说明和未使用的组件供上游参考，本 README 是当前站点维护入口。
