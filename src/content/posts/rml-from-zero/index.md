---
title: "RML 从零看懂：从 Excel 单元格到 RDF 三元组"
published: 2026-11-07
description: "用一个四行 Excel 示例理解 Turtle、逻辑源、主语与谓词宾语映射，以及相对和绝对单元格引用。"
category: Excel 数据抽取
tags: [Excel, RML, RDF, 知识图谱, 论文精读]
lang: zh-CN
draft: false
---

 **Excel → RDF 阅读系列** ：[① RML 从零看懂](/posts/rml-from-zero/) · [② Excel-RML 论文精读](/posts/excel-rml-reading-guide/) · [③ Excel-RML 中文译注](/posts/excel-rml-translation/)

本系列整理自个人阅读资料，原论文为 Markus Schröder、Christian Jilek、Andreas Dengel 的 [Mapping Spreadsheets to RDF: Supporting Excel in RML](https://arxiv.org/abs/2104.13600)（2021，KGC Workshop，CEUR Vol.2873）。译文为学习整理，非官方译本；导读、示例和批注属于阅读笔记。文中“目前”“尚不支持”等措辞以论文发表时为准，不代表当前工具或规范的状态。

## 0 · 一句话：RML 到底是什么

RML 是一种 **声明式 RDF 映射语言** ，不是学习模型。使用者把“从哪里取值、怎样生成主语、谓词和宾语”写成映射文件，映射引擎按规则生成 RDF。把映射文件类比为配置文件，有助于入门，但不能把语言本身等同于某一份配置。

 **Excel 文件 → RML 映射规则 → RDF 三元组**

 **一个比喻**

 把它想成 **邮件合并（mail merge）** ：模板里写着 `亲爱的 {姓名}`，工具读一行通讯录，把 `{姓名}` 换成「张三」，生成一封信。RML 里的 `{address}`、`(2,0).valueNumeric` 就是这种 **占位符** ，RML Mapper 就是那个批量替换工具。 **这个例子不要求引擎自动推断业务含义** ，语义对应关系由映射作者定义。

这里需要区分“自动执行已有规则”和“自动发现映射规则”：论文实现了前者，未证明后者。

## 1 · 30 秒看懂 Turtle 语法

RML 文件用 Turtle 写。看着像天书，其实只用认 5 个符号：

| 符号 | 意思 | 例子 |
| --- | --- | --- |
| `@prefix rr:` | 给长网址起缩写 | `rr:template` = `<http://www.w3.org/ns/r2rml#template>` |
| `a` | 「是……类型」 | `<#PaperMap> a rr:TriplesMap` = 这条规则是一个三元组映射 |
| `;` / `.` | 分号＝同一主语接着写；句号＝写完 | 避免反复写同一个主语 |
| `[ ... ]` | 不用起名字的中间节点 | `rr:subjectMap [ rr:template "..." ]` —— 主语映射懒得命名 |
| `"..."` / `<...>` | 字符串字面量 / URI | `"A2:A5"`、`<http://example.org/A2>` |

 **最容易卡住的一点**

 `{...}` 里的东西 **不是**  Turtle 语法，是 RML 自己定义的 **占位符** 。Turtle 解析器只把它当普通字符串；真正去解释、去取值的是 RML Mapper。`rml:reference` 后面的字符串同理。

## 2 · 教学实例：从一张表到四条三元组

### 第 1 步 · 源数据

`workbook.xlsx` 里的 `Papers` 工作表：

|  | A | B | C |
| --- | --- | --- | --- |
| 1 | Title | Status | Year |
| 2 | Knowledge Graph | published | 2019 |
| 3 | Excel2RDF | draft | 2021 |
| 4 | Sheet2RDF | published | 2015 |
| 5 | XLWrap | archived | 2009 |

我们打算：对 `A2:A5` 每个格子生成一条「这篇论文的发表年份」三元组。

### 第 2 步 · 写 RML 映射文件（这就是全文的核心）

```turtle
# ① 前缀：缩写，省得写长 URI
@prefix rr:  <http://www.w3.org/ns/r2rml#> .
@prefix rml: <http://semweb.mmlab.be/ns/rml#> .
@prefix ql:  <http://semweb.mmlab.be/ns/ql#> .
@prefix ss:  <http://www.dfki.uni-kl.de/~mschroeder/ld/ss#> .

# ② 一条规则，起名 PaperMap（不起名也行）
<#PaperMap> a rr:TriplesMap ;

  # ③ 数据从哪来 —— 逻辑源
  rml:logicalSource [
    a rml:LogicalSource ;
    rml:source [
      a ss:Workbook ;                       # 论文新增：源是一个 Excel 工作簿
      ss:url "workbook.xlsx" ;            # 文件名
      ss:sheetName "Papers" ;             # 哪个工作表
      ss:range "A2:A5"                     # 迭代哪几个格子
    ] ;
    rml:referenceFormulation ql:Spreadsheet  # 论文新增：按「电子表格语法」解释引用
  ] ;

  # ④ 主语怎么造
  rr:subjectMap [
    rr:template "http://example.org/{address}"   # {address} = 当前格子地址，如 A2
  ] ;

  # ⑤ 谓词 + 宾语怎么造
  rr:predicateObjectMap [
    rr:predicateMap [
      rr:template "http://example.org/{[2,0].valueString}"  # 绝对引用 C1 → "Year"
    ] ;
    rr:objectMap [
      rml:reference "(2,0).valueNumeric"   # 相对引用：右移 2 列 → C2/C3/C4/C5
    ]
  ] .
```

注：论文清单 1.1 只截取了 ③ 那一块、清单 1.2 只截取了 ④⑤ 那一块，都没有外壳，所以单看论文会觉得没头没尾。这里补成完整文件。

### 第 3 步 · 工具怎么执行

 **执行逻辑（就三步，没有别的）**

1. 读 `ss:range "A2:A5"`，得到 4 个格子， **逐个** 迭代（不是按行）。
2. 对每个格子，把模板里的占位符 **求值并替换** 。
3. 拼出「主语 谓词 宾语 .」写进输出。完事。

| 迭代到 | `{address}` → 主语 | `[2,0].valueString` → 谓词 | `(2,0).valueNumeric` → 宾语 |
| --- | --- | --- | --- |
|  **A2**  | `.../A2` | C1 = "Year" → `.../Year` | C2 =  **2019**  |
|  **A3**  | `.../A3` | C1 = "Year" → `.../Year` | C3 =  **2021**  |
|  **A4**  | `.../A4` | C1 = "Year" → `.../Year` | C4 =  **2015**  |
|  **A5**  | `.../A5` | C1 = "Year" → `.../Year` | C5 =  **2009**  |

 **关键对照** ：`(2,0)` 圆括号＝ **相对** ，从当前格子右移 2 列，所以每行指向不同的 C 格；`[2,0]` 方括号＝ **绝对** ，永远固定指 C1，所以四行的谓词都一样。清单 1.2 用绝对引用取表头当谓词名、用相对引用取数据当宾语，是典型搭配。

### 第 4 步 · 输出

```turtle
<http://example.org/A2> <http://example.org/Year> 2019 .
<http://example.org/A3> <http://example.org/Year> 2021 .
<http://example.org/A4> <http://example.org/Year> 2015 .
<http://example.org/A5> <http://example.org/Year> 2009 .
```

实际输出里数值会带类型标注（如 `xsd:double`），这里简写。四条三元组合起来就是一张最小的「知识图谱」——四个主语资源各自通过 `Year` 谓词连接到对应的年份字面量。

 **可选：那行 JavaScript 过滤器干了什么**

 论文清单 1.1 里的 `ss:javaScriptFilter "/Know\\w*/.test(valueString)"`，是在第 1 步之前先筛一遍：只保留内容匹配 `/Know\w*/` 的格子。本例里只有 `A2 = "Knowledge Graph"` 命中，于是输出 **只剩第 1 条** 。它就是个 `if` 条件，用 JS 写而已，没有别的魔法。

## 3 · 前缀速查：这些冒号到底是什么

| 前缀 | 来自哪 | 管什么 |
| --- | --- | --- |
| `rr:` | R2RML（W3C 标准，2012） |  **三元组怎么造** ：`TriplesMap`、`subjectMap`、`predicateObjectMap`、`template` |
| `rml:` | RML（R2RML 的超集） |  **数据从哪来** ：`logicalSource`、`source`、`reference`、`referenceFormulation` |
| `ql:` | 引用语法词汇表 | 声明用哪套语法解释引用：`ql:CSV`、`ql:XPath`、`ql:JSONPath`，以及 **论文新增的**  `ql:Spreadsheet` |
| `ss:` |  **论文自己造的小本体**  | 描述 Excel 源：`Workbook`、`url`、`sheetName`、`range`、`javaScriptFilter`；2.1 还加了 `zip`、`Graph` |

 **现在再看论文的贡献，就一句话**

  **RML 本来就支持 CSV、XML、JSON 等来源；论文补充的是原生 Excel 访问。** 作者做的事是：让 `rml:source` 能填一个 `ss:Workbook`（于是工具用 Apache POI 去读 xlsx、按工作表 + 区域取格子），并让占位符里能写 `(2,0).valueNumeric`、`backgroundColor` 这类 **取单元格及其元数据的表达式** 。除了 `ql:Spreadsheet` 和 `ss:` 这些新词，上面整份文件其余部分都是现成的标准 RML。 **它不是新语言，是给旧语言加了一种输入格式。**

## 4 · 四个常见困惑

<details>
<summary>清单 1.1 为什么没头没尾，方括号里套方括号？</summary>

因为它是 **片段** ，只截取了完整文件里 `rml:logicalSource` 后面那个节点。外层 `[ a rml:LogicalSource ; ... ]` 是「逻辑源」，内层 `[ a ss:Workbook ; ... ]` 是「具体源文件描述」。两者是「规则 → 数据来源 → 文件」的嵌套关系，不是特殊语法。本页第 2 步给了完整版，对照着看就通了。

</details>

<details>
<summary>(2,0) 和 [2,0] 里那个 0 是什么意思？</summary>

两个数字分别是 **列偏移 / 列索引** 和 **行偏移 / 行索引** 。`(2,0)` = 相对当前格子「右移 2 列、下移 0 行」；`[2,0]` = 绝对坐标（0 起算）第 2 列第 0 行，也就是 C1。所以这里的 0 不是「第 0 行不存在」，而是「不往下移」或「从 0 开始数」。

</details>

<details>
<summary>为什么这叫「知识图谱」，明明只是四行数据？</summary>

因为 RDF 的三元组天然是一张有向图：URI 是节点，谓词是带类型的边，字面量是叶子。四行也是图。语义网社区把「结构化数据 → RDF 图」这一步就叫 *knowledge graph construction*；这描述的是图的构建过程；是否自动理解表格和生成规则，是另外的能力维度。

</details>

<details>
<summary>那 valueNumeric、backgroundColor 这些变量从哪来的？</summary>

是作者用 Apache POI 读 xlsx 时，把每个格子能拿到的信息封装成了一组变量：值（`valueString` / `valueNumeric` / `valueBoolean` / `valueFormula` / `valueError` / `value` / `json`）、位置（`address`、列行索引）、外观（`backgroundColor` / `foregroundColor` / `fontColor` / `fontName` / `fontSize` / `valueRichText`）。这份清单基本就是 POI 能力的一层薄封装 —— 把它们暴露给模板，就能写进三元组。

</details>

## 5 · 现在回去读论文，每章在说什么

| 章节 | 用这一页的语言翻译一遍 |
| --- | --- |
| 摘要 / 引言 | 论文发表时，RML 已支持 CSV、XML、JSON 等格式，但缺少论文所述的 Excel 原生访问能力；工业界大量数据在 Excel 里，先转 CSV 会丢掉工作表和样式。所以要让 `rml:source` 能直接填 xlsx。 |
| 第 2 章 | 就是本页第 2 步那份完整映射文件：新增 `ss:` 本体描述工作簿、新增 `ql:Spreadsheet`、定义迭代粒度为格子、列出一整套可填进模板的元数据变量。 |
| 2.1 | 现实中一格常有多个值或实体，需要表达配对关系或返回多条相关三元组。作者提议 `ss:zip`（把谓词列表和值列表一一配对）和 `ss:Graph`（让外部函数返回一整段子图），并明说这需要改 RML 规范。 |
| 第 3 章 | 论文比较了若干专用语言与预标注方案；本文复用 RML 的主要概念，并加入 Excel 扩展。 |
| 第 4 章 | 代码放在 GitHub fork、做了个在线 demo；还没进规范，也没做性能 / 一致性测试。 |

整篇论文压缩成一句人话： **给一份「Excel → 三元组」的填空模板，多开了一个能读 xlsx 的入口，并让模板里能填颜色、字体、公式这些原本够不着的格子信息。**

## 示例的使用边界

本页数据为教学构造，映射文件依据所提供阅读资料中的论文清单 1.1 / 1.2 补全。这里只解释执行语义，未运行论文 fork；不能直接据此认定任意版本 RML Mapper 都可执行。数值输出是概念示意，实际字面量类型取决于映射与引擎。跨文件或工作表使用时，应将业务主键或来源信息纳入 URI 设计，不能只依赖单元格地址。

---

 **Excel → RDF 阅读系列** ：[① RML 从零看懂](/posts/rml-from-zero/) · [② Excel-RML 论文精读](/posts/excel-rml-reading-guide/) · [③ Excel-RML 中文译注](/posts/excel-rml-translation/)
