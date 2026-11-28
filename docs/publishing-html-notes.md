# 发布 HTML 专题与其他格式的笔记

Markdown 文章继续放在 `src/content/posts/`，无需修改原有文章。

## 更新 MySQL 专题

在网站仓库根目录运行：

```powershell
node scripts/sync-html-notes.mjs 'E:\mysql笔记' mysql
pnpm check
pnpm build
pnpm check:build
```

同步脚本保留章节、样式、图片和脚本的相对目录；排除隐藏目录、模板、生成图片的 Python 脚本等工作文件。只清理上次同步清单中已经从源目录移除的文件。原始笔记不会被修改。

检查变更后提交 `public/mysql/`、`scripts/mysql-files.json` 和需要更新的笔记简介，再推送 `main`。GitHub Actions 会构建并发布。修改本地原始笔记不会自动触发线上更新。

网站构建时为 HTML 的发布副本增加个人网站导航、规范网址和搜索正文标记，不会把这些内容写回源文件。搜索正文取 `<main>`；没有 `<main>` 时使用 `<body>`。HTML 应包含 `<title>` 和准确的 `<html lang="zh-CN">`。独立 HTML 保留自己的配色，不自动跟随主站主题。

## 添加其他专题

```powershell
node scripts/sync-html-notes.mjs 'E:\其他笔记' another-topic
```

再在 `src/content/posts/` 新增一条 Markdown 格式的目录信息（正文不需要转换）：

```yaml
---
title: 专题名称
published: 2026-11-28
description: 专题简介
category: 数据库
tags: [MySQL]
format: html
target: /another-topic/
---
```

目录信息进入首页、笔记列表、分类、标签和 RSS，点击标题直接打开 `target`。HTML 正文由 Pagefind 索引，搜索结果直接指向具体章节。该目录项不生成空白的 `/posts/` 阅读页。

`format` 默认为 `markdown`；还支持 `html`、`pdf`、`file`。后三种必须有站内 `target`，文件放进 `public/`。`pdf` 打开文件交给浏览器阅读，`file` 提供下载。PDF 和 Office 附件正文没有接入全文搜索或格式转换。

只有准备公开发布的 HTML 才应放入 `public/`；其中的 JavaScript 会作为网页脚本执行。
