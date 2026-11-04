import fs from "node:fs";
import path from "node:path";
const slug = process.argv[2];
if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
  console.error("用法：pnpm new-post my-note（英文小写、数字和连字符）");
  process.exit(1);
}
const date = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());
const file = path.join("src/content/posts", `${slug}.md`);
const content = `---\ntitle: "新笔记"\npublished: ${date}\ndescription: "填写一两句摘要"\ncategory: "日常记录"\ntags: []\ndraft: true\n---\n\n## 从这里开始\n\n写下你的记录。发布前将 draft 改为 false。\n`;
try {
  fs.writeFileSync(file, content, { flag: "wx" });
  console.log(`已创建 ${file}，默认草稿。`);
} catch (error) {
  console.error(
    error.code === "EEXIST" ? "同名笔记已存在，没有覆盖。" : error.message,
  );
  process.exit(1);
}
