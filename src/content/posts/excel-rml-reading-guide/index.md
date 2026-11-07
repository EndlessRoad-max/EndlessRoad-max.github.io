---
title: "Excel-RML 论文精读：中英对照、映射机制与研究边界"
published: 2026-11-07
description: "逐章阅读 Mapping Spreadsheets to RDF，结合中英对照、代码解析、元数据速查与自测，理解 Excel 原生映射和实验性扩展。"
category: Excel 数据抽取
tags: [Excel, RML, RDF, 知识图谱, 论文精读]
lang: zh-CN
draft: false
---

 **Excel → RDF 阅读系列** ：[① RML 从零看懂](/posts/rml-from-zero/) · [② Excel-RML 论文精读](/posts/excel-rml-reading-guide/) · [③ Excel-RML 中文译注](/posts/excel-rml-translation/)

本系列整理自个人阅读资料，原论文为 Markus Schröder、Christian Jilek、Andreas Dengel 的 [Mapping Spreadsheets to RDF: Supporting Excel in RML](https://arxiv.org/abs/2104.13600)（2021，KGC Workshop，CEUR Vol.2873）。译文为学习整理，非官方译本；导读、示例和批注属于阅读笔记。文中“目前”“尚不支持”等措辞以论文发表时为准，不代表当前工具或规范的状态。

 **阅读方式** ：中文译文默认展开，英文原文与自测答案可按需展开。

## 阅读路线图

这不是一篇需要从头啃到尾的长论文。按下面顺序读，先建立"问题—方案—边界"的骨架，再钻进第 2 章的技术细节。

 **先读这个 · 如果 RML 还看不懂**

本手册默认你已知道 RML 长什么样。如果 `rr:template`、`rml:logicalSource`、`(2,0).valueNumeric` 这些还是天书， **先别往下读** ，阅读 [RML 从零看懂](/posts/rml-from-zero/)：用一个 4 行的 Excel 小表 + 一份完整映射文件，把「格子 → 三元组」逐步跑通，含逐行注释、执行过程表和四个常见困惑。10 分钟后再回来，第 2 章会完全不一样。

一句话预告： **RML 是声明式映射语言，映射文件可类比为一份取值与生成规则** ，工具照着模板把格子内容填进三元组，其中语义对应关系由映射作者定义。

| 阅读顺序 | 重点 | 建议用时 |
| --- | --- | --- |
| 标题与摘要 | 缺口、做法、贡献 | 3 分钟 |
| 引言 | 原生 Excel 支持的价值 | 10 分钟 |
| 核心方案 | 逻辑源、坐标引用、元数据、两段代码清单 | 30 分钟 |
| 实验性功能 | `ss:zip` 与 `ss:Graph` 的边界 | 10 分钟 |
| 相关工作 | 与其他映射方案的区别 | 6 分钟 |
| 结论与批判性阅读 | 已实现的能力及尚待验证的问题 | 8 分钟 |

 **读之前先定准位置：这是人工规则驱动的 RDF 提升**

 这篇论文做的是  **RDF 提升（lifting / materialization）** ：把 Excel 里 **已经写明** 的数据（含颜色、字体、批注这类元数据），按 **人工编写的 RML 规则** 重新编码成图结构。它 **不负责自动推断表格结构与业务语义** ——「什么是什么」全部来自映射文档，业务含义由规则作者依据表格及业务知识确定。

规则方法也可以用于信息抽取。这里要区分的是 **机器执行人工规则** 与 **机器自动生成规则** ：本文主要解决前者，没有证明后者。具体讨论见文末“它与知识抽取是什么关系？”。

## 0 · 摘要与关键词

一句话概括：RML 规范支持 CSV 却漏掉了 Excel，作者给 RML Mapper 加了一个 Excel 读取扩展，让映射规则能直接引用单元格及其样式等元数据。

 **怎么读这一章**

摘要可按以下信息位拆解，读的时候逐句拆：

-  **第 1 句**  → 现状：RML 能映射 CSV 到 RDF。
-  **第 2 句**  → 缺口（*Unfortunately*）：规范与主流实现都忽略了电子表格。
-  **第 3 句**  → 做法 + 验证方式：扩展 RML Mapper + 在线交互演示。
-  **第 4–6 句**  → 两个贡献点：可访问单元格元数据；提供实验性扩展；代码开源在 GitHub fork。

留意措辞 `one of the tools` / `experimental features` / `fork`——都在暗示这是一份 **工程实现型短文** ，不是标准化成果，也没有量化评估。

<details>
<summary>查看英文原文</summary>

The RDF Mapping Language (RML) enables, among other formats, the mapping of tabular data as Comma-Separated Values (CSV) files to RDF graphs. Unfortunately, the widely used spreadsheet format is currently neglected by its specification and well-known implementations. Therefore, we extended one of the tools which is RML Mapper to support Microsoft Excel spreadsheet files and demonstrate its capabilities in an interactive online demo. Our approach allows to access various meta data of spreadsheet cells in typical RML maps. Some experimental features for more specific use cases are also provided. The implementation code is publicly available in a GitHub fork.

</details>

 **译文**

RDF 映射语言（RML）能够在它所支持的多种格式中，把 CSV（逗号分隔值）这类表格数据映射为 RDF 图。遗憾的是，使用极为广泛的电子表格格式，目前却被 RML 规范以及知名的实现工具所忽略。为此，我们对其中的一款工具 —— RML Mapper —— 做了扩展，使其支持 Microsoft Excel 电子表格文件，并用一个交互式在线演示来展示其能力。我们的方法允许在常规的 RML 映射中访问电子表格单元格的各类元数据。此外还提供了若干面向更特定场景的实验性功能。实现代码已在一个 GitHub fork 中公开。

<details>
<summary>查看英文原文</summary>

Keywords: Spreadsheet · Excel · RML · RDF · Knowledge Graph

</details>

 **译文**

 **关键词：** 电子表格 · Excel · RML · RDF · 知识图谱

 **划重点**

 论文的三层贡献可以记成一句话： **补格式缺口（Excel 作为逻辑源）**  +  **开元数据通道（颜色、字体、公式、富文本都能进规则）**  +  **试规范边界（两个需要改 RML 规范才成立的功能）** 。

## 1 · 引言 Introduction

一句话概括：Excel 比 CSV 复杂得多（多工作表、富元数据、随意排布、无格式约束），所以主流 RML 工具都不支持它；原生支持能省掉预处理、让规则更易沟通、让已有 RML 用户以较低学习成本上手。

 **怎么读这一章**

两段，分别回答两个问题：

-  **第 1 段** ：为什么把 Excel 映射成 RDF 是 **难事** ？（注意作者列出的三个层次：格式复杂 → 元数据丰富 → 填写无约束）
-  **第 2 段** ：为什么值得 **原生** 支持，而不是先转 CSV？（四点好处，是全文的论证支点）

读到 `R2RML`、`RML`、`Triples Map` 若卡住，先跳到文末「背景知识补给」，再回来读。

### 第 1 段 · 问题背景与难点

<details>
<summary>查看英文原文</summary>

As soon as knowledge graphs have to be constructed from given data, the use of mapping languages is a common practice. Such languages let users define declarative rules to map various input data formats to a complex interconnected graph. In the Semantic Web community such graphs are usually modeled with the Resource Description Framework (RDF) [11] and (semi-)structured data is mapped with the RDF Mapping Language (RML) [2] – a superset of the W3C-recommended mapping language R2RML [10]. The specification of RML [1] describes how semi-structured data, like XML or JSON, and tables in form of Comma-Separated Values (CSV) can be mapped properly. However, tabular data can also be found in other file types, prominently in spreadsheets. Since the spreadsheet methodology enables a well understood, easy and fast possibility to enter data, they are widely used by knowledge workers, especially in the industrial sector. In contrast to simply structured CSV files, spreadsheets can model complex workbooks containing multiple sheets with meta data rich cells. Besides it content, a single cell may store additional information like its appearance (colors, styles and borders) or cell comments. How these cells should be filled or styled by users is not predetermined by spreadsheet applications in general. As a consequence, in practice, cells can contain inconsistent and unstructured content which can be arbitrarily arranged in a sheet. That is why a mapping of such data to RDF can become a challenging task.

</details>

 **译文**

只要需要从给定数据构建知识图谱，使用映射语言就是一种常见做法。这类语言让用户以 **声明式规则** ，把各种输入数据格式映射为复杂的互联图结构。在语义网社区中，这类图通常用 **资源描述框架（RDF）** [11] 来建模，而（半）结构化数据则通过  **RDF 映射语言（RML）** [2] 来映射 —— RML 是 W3C 推荐标准  **R2RML**  [10] 的超集。RML 规范 [1] 描述了如何正确映射半结构化数据（如 XML、JSON）以及 CSV 形式的表格。

然而，表格数据也存在于其他文件类型中，最突出的就是 **电子表格** 。由于电子表格提供了一套易于理解、简单快速的数据录入方式，它被知识工作者广泛使用，在工业界尤其如此。与结构简单的 CSV 文件相比，电子表格能够表达 **复杂的工作簿** ：包含多个工作表，单元格还带有丰富的元数据。除了内容本身之外，一个单元格还可能存储外观信息（颜色、样式、边框）或单元格批注。

一般来说，电子表格软件 **并不预先规定** 用户应当如何填写单元格、如何设置样式。其结果是，在实践中单元格里可能包含不一致、非结构化的内容，并且可以在工作表中任意排布。正因如此，把这类数据映射到 RDF 会变成一项颇具挑战的任务。

 **精读批注**

  **「难」到底难在哪？** 作者其实给了三层递进：① 结构层 —— 工作簿 / 多 sheet / 合并单元格 / 任意排布；② 信息层 —— 值之外还有颜色、字体、批注、公式、富文本，这些 **可能承载业务语义** （比如「红底 = 已废弃」）；③ 规范层 —— 没有 schema 约束，人怎么填都行。第 ② 层正是本文后面 `backgroundColor`、`valueRichText` 等变量存在的理由；第 ③ 层则解释了为什么本文采用人工规则；自动生成规则是另一个需要研究的问题。

### 第 2 段 · 现有工具的缺口与原生支持的价值

<details>
<summary>查看英文原文</summary>

Although, spreadsheets are frequently used in industry, well-known RML supporting tools like RML Mapper³, CARML⁴, RocketRML [9], SDM-RDFizer [4] or Mapeathor [5] currently do not support them natively. To fix this issue, we extended RML Mapper to support Microsoft Excel spreadsheet files. We have chosen RML Mapper because its code structure let us easy embed our new code. Natively supporting spreadsheets in RML has several advantages. There is no need anymore to preprocess and transform spreadsheets in a format that can be handled by a mapping tool (e.g. CSV). This removes the otherwise additional effort for mapping experts and let them focus on defining proper rules. Having RML rules that directly refer to spreadsheet data makes interpretation of rule definitions straightforward. Thus, it becomes easier to communicate to a data provider how their spreadsheets will be mapped to a knowledge graph. Additionally, practitioners of RML who already learned the language become able to map spreadsheets with almost no extra effort. In the next section we describe in detail how we realized the Excel support in RML.

</details>

 **译文**

尽管电子表格在工业界被频繁使用，但知名的 RML 支持工具 —— 如  **RML Mapper³、CARML⁴、RocketRML [9]、SDM-RDFizer [4]、Mapeathor [5]**  —— 目前都还没有原生支持它。为弥补这一缺口，我们扩展了 RML Mapper，使其支持 Microsoft Excel 电子表格文件。选择 RML Mapper，是因为它的代码结构便于我们嵌入新代码。

在 RML 中 **原生** 支持电子表格有若干好处：不再需要把电子表格预处理、转换成映射工具能处理的格式（例如 CSV）。这省去了映射专家额外的工夫，让他们能专注于定义恰当的规则。RML 规则直接引用电子表格数据，使规则定义的解读变得直观；因而也更容易向数据提供方说明「他们的表格将如何被映射成知识图谱」。此外，已经掌握 RML 的从业者几乎不需要额外学习，就能映射电子表格。下一节我们将详细描述如何在 RML 中实现 Excel 支持。

 **划重点 · 原生支持的四点理由**

1.  **免预处理** ：不用先导出 CSV，省掉一步 ETL，也避免转换中丢失样式与公式。
2.  **专家聚焦** ：映射工程师的精力回到「定义规则」本身。
3.  **可沟通性** ：规则直接指向 Excel 里的位置 / 属性，业务方能看懂、能确认。
4.  **较低迁移成本** ：RML 用户不用另学一门 DSL —— 这一点正是第 3 章「相关工作」的伏笔。

<details>
<summary>自测：如果先把 Excel 另存为 CSV 再映射，会丢掉什么？</summary>

丢掉的正是本文要利用的东西：多工作表结构、单元格颜色 / 字体 / 边框、批注、公式与公式错误码、富文本分段格式、数据类型差异，以及合并单元格带来的布局信息。另外还会引入一个额外的、需要维护的转换步骤，且 Excel 里「同一列混填不同类型」的问题在 CSV 里依然存在。

</details>

## 2 · 在 RML 中支持 Excel

一句话概括：用 Apache POI 读 xlsx，设计一个前缀为 `ss` 的小本体来描述「工作簿 / 工作表 / 单元格区域」，再让 RML 规则能像引用 CSV 列一样引用单元格及其元数据。

 **怎么读这一章（全文重心，建议慢读）**

本章可以切成四个技术动作，按这个顺序理解：

-  **① 读** ：Apache POI 负责解析 Excel 二进制 / OOXML。
-  **② 描述** ：新增 `ss:` 本体 + `ql:Spreadsheet` 引用形式，把「一个工作簿的某个区域」变成逻辑源。
-  **③ 迭代** ：Triples Map 在指定区域上 **逐单元格** 迭代（注意：不是逐行，这跟 CSV 的心智模型不同）。
-  **④ 取值** ：用 `(列偏移,行偏移)` / `[绝对列,绝对行]` 定位，再接 `.valueString`、`.backgroundColor` 等变量取元数据。

两段代码清单是本章的题眼，务必逐行对上文字说明。

### 2.0.1 · 总体实现与逻辑源定义（清单 1.1）

<details>
<summary>查看英文原文</summary>

Our approach is implemented as an extension to the RML Mapper tool in a separate GitHub fork⁵. For demonstration purpose, we additionally provide an interactive demo page⁶ where visitors can try various mapping examples. At its core, our component utilizes the Apache POI⁷ library to read Microsoft Excel spreadsheets. In order to refer to spreadsheet contents as a logical source, a small spreadsheet ontology⁸ (usually prefixed with ss) was designed. As demonstrated in Listing 1.1, using a spreadsheet reference formulation (Line 2), a workbook source should name a spreadsheet file (Line 5), a referring sheet by name (Line 6) and a range of cells in the sheet (Line 7). A triples map that uses this logical source will iterate over single cells in the given range.

</details>

 **译文**

我们的方法以扩展的形式实现在 RML Mapper 工具中，代码放在一个独立的  **GitHub fork** ⁵ 里。为便于演示，我们还提供了一个 **交互式演示页面** ⁶，访问者可以试用各种映射示例。该组件的核心使用  **Apache POI** ⁷ 库来读取 Microsoft Excel 电子表格。

为了把电子表格内容当作 **逻辑源（logical source）** 来引用，我们设计了一个小型的 **电子表格本体** ⁸（前缀通常为 `ss`）。如代码清单 1.1 所示：使用 **电子表格引用形式** （第 2 行）时，一个工作簿源需要给出电子表格文件名（第 5 行）、按名称指定的目标工作表（第 6 行），以及该工作表中的 **单元格区域** （第 7 行）。使用这个逻辑源的  **Triples Map**  会在给定区域内 **逐单元格** 迭代。

```turtle
# 代码清单 1.1：把电子表格文件定义为逻辑源的 RML 示例
[ a rml:LogicalSource ;
  rml:referenceFormulation ql:Spreadsheet ;
  rml:source [
    a ss:Workbook ;
    ss:url "workbook.xlsx" ;
    ss:sheetName "Papers" ;
    ss:range "A2:A5" ;
    ss:javaScriptFilter "/Know\\w*/.test(valueString)"  # 可选
  ]
]
```

注：PDF 文本提取把代码字符拆散了，此处按语义还原为标准 Turtle 写法；`ql:Spreadsheet` 是本文新增的引用形式。

| Line 2 | `rml:referenceFormulation ql:Spreadsheet` —— 告诉解释器「按电子表格语法来解析引用」。RML 原本有 `ql:CSV`、`ql:JSONPath`、`ql:XPath` 等；这里是新加的一种。 |
| --- | --- |
| Line 3–4 | `rml:source [ a ss:Workbook ... ]` —— 用一个匿名节点描述数据源，类型为自定义本体里的 `ss:Workbook`。 |
| Line 5 | `ss:url "workbook.xlsx"` —— 工作簿文件路径。 |
| Line 6 | `ss:sheetName "Papers"` —— 按名称选工作表（Excel 支持多 sheet，这是 CSV 没有的维度）。 |
| Line 7 | `ss:range "A2:A5"` —— 迭代区域。本例是 A 列第 2 到 5 行，共 4 个单元格。 |
| Line 8 | `ss:javaScriptFilter` —— 可选过滤器，用 JS 表达式决定哪些单元格参与迭代。 |

<details>
<summary>查看英文原文</summary>

Optionally, a filter can be added that picks certain cells based on a JavaScript program (Line 8). Regarding our example, a regular expression is used to iterate over only those cells which contain the phrase “Know”. Using the expressive script language and variables that represent cell meta data, appropriate filter procedures can be realized.

</details>

 **译文**

>  **代码说明** ：清单是映射片段，不是可单独运行的完整文件。Turtle 字符串中的 `\\w` 在解析后得到 JavaScript 正则中的 `\w`；本次整理修正了这一转义写法，未运行论文引擎。

（可选）还可以添加一个 **过滤器** ，用一段 JavaScript 程序挑出特定单元格（第 8 行）。在我们的例子里，用正则表达式 `/Know\w*/` 让迭代只覆盖包含 "Know" 这一词组的单元格。借助这门表达能力强的脚本语言，以及代表单元格元数据的变量，可以实现各种恰当的过滤逻辑。

 **精读批注**

  **这里藏着一个设计取向。** 电子表格没有 schema，作者没有去发明一套「表格结构描述语言」，而是直接塞进一段  **JavaScript 过滤器** ：灵活性拉满，代价是规则不再纯粹声明式、可移植性与安全性（执行任意脚本）都成问题。这是后面批判性阅读可以追问的点。另外注意 `valueString` 在过滤器里可以直接当变量用 —— 它和下一段的元数据变量是同一套机制。

### 2.0.2 · 单元格元数据的引用方式（清单 1.2）

```turtle
# 代码清单 1.2：演示如何在 RML 映射中访问单元格元数据
rr:subjectMap [
  rr:template "http://example.org/{address}"
] ;
rr:predicateObjectMap [
  rr:predicateMap [
    rr:template "http://example.org/{[2,0].valueString}"
  ] ;
  rr:objectMap [
    rml:reference "(2,0).valueNumeric"
  ]
]
```

注：`rr:` 是 R2RML 命名空间，`rml:` 是 RML 命名空间；圆括号 = 相对引用，方括号 = 绝对引用。

<details>
<summary>查看英文原文</summary>

In various RML maps, meta data of the currently iterated cell can be retrieved, as demonstrated in Listing 1.2. For example in Line 2, a template expression inserts the cell's address (like “A2”) to form a unique URI for a subject resource. However, often it is required to refer to nearby cells in order to construct appropriate statements. To refer to other cells relatively from the current cell, we introduce a parenthesis notation, like (column,row). A column shift (x-axis of the sheet) and a row shift (y-axis of the sheet) allows to reach any cell relative to the cell representing the subject resource. Regarding Line 9 of our example, numeric values which are located two columns away on the right are used as objects in the mapped statements. In a similar way, cells can be referenced absolutely by using square brackets (Line 6). As already mentioned, spreadsheet cells have several meta data values that need to be retrievable in a mapping through variables. A cell's location in a sheet can be accessed either as a usual spreadsheet address or as column and row indices. Since a cell (if not empty) stores either a string value or a numeric value, various possibilities are given to access its content: valueNumeric retrieves a floating point value (valueInt an integer value), valueBoolean a boolean value, valueFormula if a cell contains a formula (valueError to get its possible error code) and valueString retrieves its text content. Besides content, one could also be interested in the appearance of a cell in a sheet: since it can be colored, backgroundColor and foregroundColor can be queried as a hexadecimal RGB value. Regarding the used font, fontColor, fontName and fontSize are available. On a more fine-grained level, cells can also store formatted text which is returned by valueRichText. The formatted text is represented in an HTML-like syntax, for example, “&lt;b>&lt;i>&lt;font face='Arial' color='#ff0000'>red, italic and bold&lt;/font>&lt;/i>&lt;/b>”. If spreadsheets were completed in an inconsistent manner, it happens that cells were unintentionally filled with different data types. For such cases, one can use the value variable to always obtain a string representation of a cell's content regardless of its cell type. However, if this is not sufficient because more details

</details>

 **译文**

在各种 RML 映射中，都可以取到 **当前迭代单元格** 的元数据，如代码清单 1.2 所示。例如第 2 行，模板表达式把单元格地址（如 "A2"）插入进去，为主语资源生成一个唯一 URI。

不过，为了构造恰当的三元组，常常还需要引用 **邻近** 的单元格。为此我们引入了一种圆括号记法 `(column, row)`，用于相对当前单元格引用其他单元格：列偏移（工作表的 x 轴）与行偏移（y 轴）组合起来，可以到达相对于「代表主语资源的那个单元格」的任意单元格。例子中第 9 行取的是 **右侧相隔两列** 的数值，作为所映射三元组的宾语。类似地，用 **方括号** （第 6 行）可以 **绝对** 引用单元格。

如前所述，电子表格单元格有多种元数据值，需要在映射中通过变量获取（下文以等宽字体表示）。单元格在工作表中的位置，既可以按常见的电子表格地址（如 A2）取得，也可以按列、行索引取得。由于一个非空单元格存储的要么是字符串值、要么是数值，因此提供了多种访问其内容的方式：`valueNumeric` 取浮点值（`valueInt` 取整数值），`valueBoolean` 取布尔值，`valueFormula` 用于单元格含公式的情况（`valueError` 取可能出现的错误码），`valueString` 取其文本内容。

除内容之外，使用者也可能关心单元格在表中的 **外观** ：因为单元格可以着色，所以可以用 `backgroundColor`、`foregroundColor` 查询十六进制 RGB 值；关于所用字体，则有 `fontColor`、`fontName`、`fontSize` 可用。在更细的粒度上，单元格还可以存储 **富文本** 格式，由 `valueRichText` 返回。富文本以类 HTML 的语法表示，例如 `<b><i><font face='Arial' color='#ff0000'>red, italic and bold</font></i></b>`。

如果表格填写得不规范，常会出现单元格被无意填成不同数据类型的情况；对此可以用 `value` 变量， **无论单元格类型如何** 都始终取得其内容的字符串表示。若这还不够、需要更多细节……（跨页，接下段）

<details>
<summary>查看英文原文</summary>

are needed, the json variable could be used to retrieve a JavaScript Object Notation (JSON) representation of a cell. The JSON object contains, besides the cell type, various data types mentioned above.

</details>

 **译文**

……则可以使用 `json` 变量获取该单元格的  **JSON** （JavaScript Object Notation）表示。这个 JSON 对象除单元格类型外，还包含上面提到的各种数据类型。

>  **整理补充** ：上文为论文译述。实际 Excel 单元格还区分布尔、错误等类型；不能把“非空单元格只有字符串或数值”当作完整的 Excel 类型定义。

### 单元格元数据变量速查

| 类别 | 变量 | 含义 / 用途 |
| --- | --- | --- |
| 位置 | `address` | 电子表格地址，如 `A2`；常用于拼唯一 URI |
| 位置 | 列索引 / 行索引 | 以数字形式取得单元格坐标 |
| 内容 | `valueString` | 文本内容 |
| 内容 | `valueNumeric` / `valueInt` | 浮点值 / 整数值 |
| 内容 | `valueBoolean` | 布尔值 |
| 内容 | `valueFormula` / `valueError` | 公式本身 / 公式的错误码 |
| 内容 | `value` / `json` | 统一字符串表示 / 完整 JSON 对象（含单元格类型） |
| 外观 | `backgroundColor` / `foregroundColor` | 十六进制 RGB 颜色 |
| 外观 | `fontColor` / `fontName` / `fontSize` | 字体颜色、名称、字号 |
| 外观 | `valueRichText` | 带格式的富文本，类 HTML 语法 |

 **划重点 · 本章最该带走的两件事**

 **1. 迭代粒度是「单元格」，不是「行」。** CSV 的 RML 映射按行迭代、用列名取值；这里按单元格迭代，靠`(列偏移,行偏移)` 去"够"旁边的格子。这支持按位置引用邻近值，但不等于自动处理复杂表头或合并单元格；依赖坐标的规则可能随版式变化而失效。

 **2. 元数据被当成一等公民。** 颜色、字体、公式、富文本都能写进 RDF。这打开了一类实用场景：业务人员长期用「红色 = 有问题」「加粗 = 已审核」这类视觉约定承载语义，现在这些约定可以被显式地映射成三元组，而不必人工清洗。

<details>
<summary>自测：清单 1.2 里 (2,0) 和 [2,0] 有什么区别？</summary>

`(2,0)` 是 **相对** 引用：从当前迭代的单元格出发，向右偏移 2 列、向下偏移 0 行；所以表格里每迭代到一个新单元格，它指向的格子跟着变。`[2,0]` 是 **绝对** 引用：固定指向工作表中坐标为 (2,0) 的那个格子，不随迭代变化，适合放表头、常量或全局配置。清单 1.2 用绝对引用取谓词名（表头），用相对引用取宾语值（数据），是很典型的搭配。

</details>

<details>
<summary>自测：它与自动知识抽取有什么区别？</summary>

本文让机器执行人工定义的取值与转换规则，但没有自动生成这些规则。规则抽取同样属于抽取方法；是否自动理解结构和语义，需要另外验证。

</details>

## 2.1 · 实验性功能 Experimental Features

一句话概括：针对「一个格子里塞了多条信息」和「一个格子里塞了多个实体」两种真实脏数据，作者提了两个需要修改 RML 规范才能成立的扩展语法。

 **怎么读这一章**

这一节是 **提案** ，不是已标准化的功能。读的时候重点不是记语法，而是理解作者遇到的两类「单元格 ≠ 原子值」的现实问题，以及他为什么必须动 RML 规范才能解决。第一遍读可以只抓标题，回头再细看。

<details>
<summary>查看英文原文</summary>

We also would like to propose some experimental features that we found useful in our use cases. However, the official introduction of these extensions would require to change the RML specification on some points.

</details>

 **译文**

我们还想提出一些在我们的用例中觉得有用的 **实验性功能** 。不过，要把这些扩展正式纳入，需要在若干地方修改 RML 规范。

### 功能一 · 一个单元格里的多个不同属性

<details>
<summary>查看英文原文</summary>

Multiple Different Properties in a Cell. In our use cases, we frequently experienced that users record multiple information in one cell. Each piece of information iⱼ ∈ I then corresponded to a different property pⱼ ∈ P. Following the current RML specification, one has to define for each pⱼ ∈ P a separate predicate object map. Instead, we propose a shortcut such that only one predicate-object map is needed. This is done by allowing that an RDF list of properties pⱼ ∈ P can be passed in a predicate map. By implementing a suitable Function Ontology (FnO) [7] procedure, we extract information pieces iⱼ ∈ I from a cell's content and return them as an object list oⱼ ∈ O. Usually, RML provides that a Cartesian product is formed between predicates and objects which is P × O. However, in our case we need to zip predicate and object lists such that the following set is made: {(pⱼ, oⱼ)}. Thus, instead of all possible pairs of the P × O matrix, only the diagonal ones are selected. This new behavior is activated by adding a `ss:zip true` statement to a predicate-object map.

</details>

 **译文**

 **一个单元格中的多个不同属性。** 在我们的用例中，经常遇到用户把 **多条信息记在同一个单元格** 里。每一条信息 iⱼ ∈ I 各自对应一个不同的属性 pⱼ ∈ P。按照现行 RML 规范，必须为每个 pⱼ ∈ P  **单独定义一个谓词-宾语映射** 。我们则提议一种简写，只需要一个谓词-宾语映射即可：允许在 **谓词映射** 中传入一个由属性 pⱼ ∈ P 组成的  **RDF 列表** 。

通过实现一个合适的 **函数本体（FnO）** [7] 过程，我们从单元格内容中抽取各条信息 iⱼ ∈ I，并以 **对象列表**  oⱼ ∈ O 返回。RML 通常会在谓词与宾语之间做 **笛卡尔积** ，即 P × O；但在我们的场景中，需要把谓词列表与宾语列表「 **拉链** 」式配对，得到集合 {(pⱼ, oⱼ)}。也就是说，不是取 P × O 矩阵中所有可能的组合，而 **只取对角线上的那些** 。给谓词-宾语映射加上 `ss:zip true` 语句即可启用这一新行为。

 **举个例子帮你看懂「拉链」**

 假设某单元格写着 `张三; 2019; 北京`，你希望得到 `姓名→张三`、`年份→2019`、`地点→北京`。FnO 函数拆出宾语列表 `[张三, 2019, 北京]`，谓词列表是 `[姓名, 年份, 地点]`。按 RML 默认规则会得到 3×3 = 9 条三元组（含「年份→张三」这样的错误配对）；加了 `ss:zip true` 后只保留一一对应的 3 条。 **这才是「只取对角线」的意思。**

### 功能二 · 一个单元格里的多个复杂实体

<details>
<summary>查看英文原文</summary>

Multiple Complex Entities in a Cell. Similarly to the previous observation, we often discovered that users mention several entities in a single cell. A prominent example is a list of persons having first and last names, for instance book authors. Represented as an RDF graph, such complex entities potentially require several statements to be fully expressed. An FnO function that is able to perform entity extraction would need to return an arbitrary large RDF graph in a certain serialization format (e.g. Turtle) instead of a single value. In order to integrate such a return value in an object map, we define a new term type `ss:Graph`. Once this term type is chosen, the returning RDF graph is parsed and added to the emerging knowledge graph. By using a special `ss:SelectedObjects` resource together with `rr:object` statements, only selected objects will be mapped in an object map.

</details>

 **译文**

 **一个单元格中的多个复杂实体。** 与上一观察类似，我们还常发现用户在单个单元格里提及 **若干实体** 。典型的例子是由名和姓组成的人员列表，比如一本书的作者。若用 RDF 图表示，这类复杂实体可能需要 **多条三元组** 才能完整表达。一个能做实体抽取的 FnO 函数，就需要返回某种序列化格式（如 Turtle）下 **任意大小的 RDF 图** ，而不是单个值。

为了把这样的返回值接入 object map，我们定义了一个新的 **词项类型（term type）**  `ss:Graph`。一旦选用该词项类型，返回的 RDF 图会被解析并 **并入** 正在生成的知识图谱。配合特殊的 `ss:SelectedObjects` 资源和 `rr:object` 语句，可以在 object map 中只映射 **被选中的对象** 。

 **划重点**

 两个功能分别打破了 RML 的两条默认假设： **①**  谓词与宾语做笛卡尔积 → 改成按位置拉链配对； **②**  常规 object map 生成 RDF 词项 → 改成能吞下一整张子图。它们共同指向同一个现实： **Excel 单元格常常不是原子值，而是一段需要再解析的文本** 。这也正是「Excel 知识抽取」研究的主战场 —— 作者用 FnO 把这一步 **外挂** 给外部函数，本文没有提供通用抽取算法或评估其质量。

## 3 · 相关工作 Related Work

一句话概括：把 Excel 映射到 RDF 的工具早已有五六种，但它们各用各的领域特定语言（DSL）；本文的差异化在于「复用已经标准化、已经有人会的 RML」。

 **怎么读这一章**

按「每个工具 = 一种自定义语言」的表格去读，最后一句才是重点：作者把自己的贡献定位成 **生态整合** 而非 **语言创新** 。这也解释了为什么本篇没有算法实验 —— 它要证明的是「可行性 + 兼容性」，不是「效果更好」。

<details>
<summary>查看英文原文</summary>

In the past, several similar approaches were implemented that map spreadsheets to RDF using a language. Domain specific languages (DSL) other than RML are provided to let knowledge engineers express how input data shall be mapped to a graph structure. Spread2RDF⁹ uses a Ruby-internal language while M2 (Mapping Master) [8] builds upon a compact syntax for OWL ontologies (Manchester syntax).

</details>

 **译文**

过去已有若干类似工作，用某种语言把电子表格映射为 RDF。它们提供的是  **RML 之外的领域特定语言（DSL）** ，让知识工程师表达输入数据应如何映射成图结构。 **Spread2RDF** ⁹ 使用 Ruby 内部 DSL，而  **M2（Mapping Master）** [8] 建立在面向 OWL 本体的紧凑语法（ **Manchester 语法** ）之上。

<details>
<summary>查看英文原文</summary>

Sheet2RDF [3] uses a special ProjEction of Annotations Rule Language (PEARL), whereas XLWrap [6] utilizes template graphs together with a special expression language to refer to contents of sheets. A different approach is followed by TabLinker¹⁰ which requires that input spreadsheets are annotated in advance with certain styles. With our implementation, we combine the feature of mapping spreadsheets with the advantages of the well specified RML approach. Those who already used the language and need to process spreadsheets do not have to look for an alternative anymore.

</details>

 **译文**

 **Sheet2RDF**  [3] 使用一种专门的  **PEARL** （ProjEction of Annotations Rule Language，标注规则投影语言）； **XLWrap**  [6] 则使用 **模板图** 配合专门的表达式语言来引用工作表内容。 **TabLinker** ¹⁰ 走了另一条路：它要求 **事先** 用特定样式对输入电子表格做标注。

通过我们的实现，我们把「映射电子表格」这一能力与 **规范完备的 RML 方案** 的优势结合了起来：已经在使用这门语言、又需要处理电子表格的人，不必再去另找替代方案。

| 工具 | 映射表达方式 | 与本文的关键差别 |
| --- | --- | --- |
| Spread2RDF | Ruby 内部 DSL | 绑定 Ruby，非标准映射语言 |
| M2 / Mapping Master | 基于 OWL 的 Manchester 语法 | 面向本体建模，非 RML 生态 |
| Sheet2RDF | PEARL 规则语言 | 自定义语言，需另学 |
| XLWrap | 模板图 + 专用表达式语言 | 思路接近，但语言不通用 |
| TabLinker | 预先用特定样式标注表格 | 要求改造源数据；本文反过来「读取」样式 |
|  **本文**  |  **标准 RML + `ss:` 扩展**  |  **复用 RML 并学习扩展，复用既有 RML 工具链与技能**  |

 **精读批注**

 特别留意  **TabLinker 与本文的对照** ：TabLinker 要求人先用样式 **标注** 表格，再按标注映射；本文则是直接把现实中已经存在的颜色 / 字体 **当作可读元数据** 。两者都承认「视觉样式承载语义」，但一个要求改造数据，一个要求迁就数据 —— 后者更贴合工业界存量表格的现实。

## 4 · 结论与展望 Conclusion and Outlook

一句话概括：交付了一个 RML Mapper 的 Excel 扩展 + 在线演示；未来要把它写进 RML 规范，并补做性能与一致性测试。

 **怎么读这一章**

结论段的价值往往在「作者承认还没做什么」里。这里明确写了两件待办： **推进标准化**  和  **补评测** 。反过来说明：本文既没有进规范，也没有性能 / 一致性数据 —— 读这篇论文时要相应降低对「效果验证」的期待。

<details>
<summary>查看英文原文</summary>

In this paper we discussed that spreadsheets, despite being widely used, are still not supported by the RDF Mapping Language (RML). We therefore proposed a first solution which extends the already existing RML Mapper tool with necessary components. Additionally, experimental features were introduced too. A publicly available web page¹¹ demonstrates the new capabilities. In the future, we plan to integrate our proposed solution in the RML specification [1] so that other RML tools may support spreadsheets too. Further, we intend to run several performance and compliance tests with our current reference implementation. This could be done in the R2RML implementation report¹². Acknowledgements. This work was funded by the BMBF project SensAI (grant no. 01IW20007).

</details>

 **译文**

本文指出，电子表格虽被广泛应用，却仍未被  **RDF 映射语言（RML）**  所支持。为此我们提出了 **首个** 解决方案，用必要的组件扩展已有的 RML Mapper 工具，此外还引入了若干实验性功能。一个公开可访问的网页¹¹ 演示了这些新能力。

未来，我们计划把所提方案 **整合进 RML 规范** [1]，以便其他 RML 工具也能支持电子表格；还打算对目前的参考实现开展一系列 **性能与一致性（compliance）测试** ，这项工作可以在  **R2RML 实现报告** ¹² 的框架下完成。

 **致谢：** 本研究由德国联邦教育与研究部（BMBF） **SensAI**  项目资助（项目编号 01IW20007）。

 **全文一句话总结**

 作者给 RML 加了一条通往 Excel 的「原生管道」：上游用 Apache POI 读工作表与单元格元数据，中游用 `ss:` 小本体 + `ql:Spreadsheet` 把区域声明为逻辑源，下游用相对 / 绝对坐标和一组元数据变量把值、样式、公式写进 RDF 三元组；再针对「一格多值」「一格多实体」提出两个尚需改规范的扩展。

## 背景知识补给

如果前面某些概念卡住了，看这里就够了。按「自底向上」排列。

 **RDF · 资源描述框架**

 用 **三元组（主语, 谓词, 宾语）** 表示知识，资源用 URI 标识。比如 `<http://ex.org/A2> <http://ex.org/标题> "Knowledge Graphs"`。所有三元组合起来就是一张有向图，也就是「知识图谱」。[11] 是 W3C 的 RDF 1.1 Primer。

 **R2RML · 关系数据库 → RDF**

 W3C 2012 年推荐标准 [10]。核心概念：`TriplesMap`（一条映射规则）、`LogicalTable`（数据从哪来）、`SubjectMap`（主语怎么造，常用 `rr:template` 拼 URI）、`PredicateObjectMap`（谓词 + 宾语怎么来）、`rr:IRI / rr:Literal / rr:BlankNode`（词项类型）。局限：只管关系数据库。

 **RML · R2RML 的超集**

 [2][1] 把 R2RML 推广到异构 / 半结构化数据：CSV、XML、JSON、Web API…… 关键扩展是 `rml:referenceFormulation`（声明用哪种引用语法：`ql:CSV`、`ql:XPath`、`ql:JSONPath`）和 `rml:reference`（在源数据里取值）。 **本文新增的就是一种 reference formulation：`ql:Spreadsheet`。**

 **FnO · 函数本体**

 [7] 用 RDF 声明式地描述「函数、参数、返回值」，使映射规则能在生成三元组前调用外部函数做数据转换 / 抽取。本文 2.1 节的两个实验性功能都依赖 FnO：一个把单元格拆成值列表，一个把单元格抽成一整张子图。 **可以理解为 RML 的「插件接口」。**

 **Apache POI**

 Java 库，读写 `.xls` / `.xlsx`。除了单元格的值和类型，还能取到样式（颜色、字体、边框）、批注、公式、富文本、合并区域等 —— 这正是本文那串元数据变量能实现的原因。 **换句话说：变量清单基本就是 POI 能力的一层薄封装。**

 **一句话理清三者关系**

  **R2RML** （数据库）⊂  **RML** （+ CSV/XML/JSON）⊂  **本文** （+ Excel 及其元数据）。论文做的事是「给已有的标准生态补一种输入格式」，不是发明新范式。

## 术语对照表

| English | 中文 | 在本文中的含义 |
| --- | --- | --- |
| spreadsheet / workbook / sheet | 电子表格 / 工作簿 / 工作表 | Excel 文件的三层结构 |
| mapping language | 映射语言 | 声明「源数据 → RDF 图」规则的语言 |
| declarative rule | 声明式规则 | 描述「要什么」，不描述「怎么一步步算」 |
| logical source | 逻辑源 | Triples Map 的数据输入描述 |
| reference formulation | 引用形式 / 引用语法 | 规定 `rml:reference` 用什么语法解析 |
| Triples Map | 三元组映射 | 一条完整规则：主语 + 若干谓词宾语对 |
| subject / predicate / object map | 主语 / 谓词 / 宾语映射 | 分别生成三元组的三个部分 |
| term type | 词项类型 | 产出 IRI、字面量、空白节点；本文新增 `ss:Graph` |
| meta data | 元数据 | 值之外的信息：地址、颜色、字体、公式、富文本 |
| rich text | 富文本 | 单元格内部分段带格式的文本 |
| Function Ontology (FnO) | 函数本体 | 在映射中调用外部函数的标准描述方式 |
| Cartesian product | 笛卡尔积 | RML 默认在谓词集 × 宾语集上取全组合 |
| zip | 拉链配对 | 改为按位置一一对应，只取「对角线」 |
| DSL | 领域特定语言 | 第 3 章各专用工具自造的映射语言 |
| compliance test | 一致性 / 符合性测试 | 检验实现是否符合规范 |

## 批判性阅读：贡献与边界

以下是阅读分析，不是论文原文或复现实验结论。

1.  **功能实现与效果评测要分开。**  论文介绍了 Excel 输入扩展和演示，将性能与一致性测试列为未来工作；不能据此得出准确率、速度或优于其他方法的结论。
2.  **实现支持与规范支持要分开。**  论文使用独立 fork，尤其把 `ss:zip`、`ss:Graph` 列为实验性功能。不同引擎是否支持，需要查其具体版本；本文不对今天的兼容性作结论。
3.  **能读取 Excel，不等于能理解任意表格。**  工作表、区域、引用方式和目标谓词由映射作者指定。论文没有系统验证复杂表头、合并单元格或版式变化下的自动结构理解。
4.  **坐标映射有维护成本。**  插入列或调整布局可能改变引用的含义；风险取决于规则是否依赖发生变化的坐标，并非每次修改都会使所有规则失效。
5.  **元数据可访问，不等于语义已识别。**  读取红色背景和判断“红色代表作废”是两件事；业务含义需要映射规则或其他组件给出。POI 能读取某项信息，也不自动证明该扩展将它暴露给 RML。
6.  **FnO 是扩展接口，抽取质量仍需评估。**  多值拆分、实体识别可由外部函数承担；论文没有提供通用实体抽取算法或质量评测。JavaScript 过滤器的执行环境和隔离方式也需在工程落地时单独核实。

### 它与知识抽取是什么关系？

规则驱动的方法也可以属于信息抽取；“是否发现新事实”或“是否使用学习模型”都不是区分抽取的充分条件。这里由人定义映射规则，机器执行取值、转换和 RDF 生成，因此不能把机器的工作简单说成“没有抽取”。

更有用的区分是： **规则执行是否自动化，以及规则本身是否自动生成。**  这篇论文主要解决前者，没有证明工具可以自动识别陌生 Excel 的结构、推断列含义或完成本体对齐。

RDF 映射也不只是无损换格式：映射作者会选择实体身份、谓词、类型及要保留的信息。未映射的布局与样式通常不会进入输出。用 `A2` 拼出的 URI 只能作为教学示例；跨文件、跨工作表或重新排序时，需要额外设计稳定且不冲突的实体标识。

### 对 Excel 知识抽取研究的启发

-  **下游输出方式** ：结构识别和语义对齐完成后，可通过映射将结果输出为 RDF。
-  **映射生成问题** ：研究能否推荐或生成工作表、区域、坐标引用和目标属性，减少人工配置；这需要独立的数据和评测设计。
-  **元数据的价值** ：将颜色、字体、富文本等视为可能的业务线索，并通过实验验证其作用。
-  **基线的适用范围** ：在相同输入、任务和评价指标下，人工映射可以作为规则方法的比较对象；不能直接把映射演示当成自动表格理解能力的证据。

<details>
<summary>自测：如何用三句话介绍这篇论文？</summary>

论文针对 2021 年 RML 生态中的 Excel 原生输入缺口，扩展了 RML Mapper。它让规则按单元格迭代、引用邻近位置与样式等元数据，并提出多值配对和子图返回的实验性功能。贡献集中在映射能力与工程集成，没有证明自动语义理解能力，也没有给出系统性能或抽取质量评测。

</details>

## 参考文献与脚注链接

按原文编号保留，便于回查 PDF。

 **[1]**  Dimou, A., Sande, M.V.: RDF Mapping Language (RML). <https://rml.io/specs/rml/> (2020), accessed 2021-02-01

 **[2]**  Dimou, A. et al.: RML: a generic language for integrated RDF mappings of heterogeneous data. LDOW 2014, CEUR Vol.1184

 **[3]**  Fiorelli, M. et al.: Sheet2RDF: a flexible and dynamic spreadsheet import & lifting framework for RDF. IEA/AIE 2015, LNCS 9101, pp.131–140

 **[4]**  Iglesias, E. et al.: SDM-RDFizer: An RML interpreter for the efficient creation of RDF knowledge graphs. CIKM 2020, pp.3039–3046

 **[5]**  Iglesias-Molina, A. et al.: Mapeathor: Simplifying the specification of declarative rules for knowledge graph construction. ISWC 2020 Demos, CEUR Vol.2721, pp.25–30

 **[6]**  Langegger, A., Wöß, W.: XLWrap – Querying and integrating arbitrary spreadsheets with SPARQL. ISWC 2009, LNCS 5823, pp.359–374

 **[7]**  De Meester, B., Dimou, A., Verborgh, R., Mannens, E.: An ontology to semantically declare and describe functions. ESWC 2016 Satellite Events, LNCS 9989, pp.46–49

 **[8]**  O'Connor, M.J., Halaschek-Wiener, C., Musen, M.A.: M2: A language for mapping spreadsheets to OWL. OWLED 2010

 **[9]**  Simsek, U., Kärle, E., Fensel, D.: RocketRML – A NodeJS implementation of a use case specific RML mapper. ESWC 2019 Workshops, CEUR Vol.2489, pp.46–53

 **[10]**  W3C: R2RML: RDB to RDF Mapping Language. <https://www.w3.org/TR/r2rml/> (2012)

 **[11]**  W3C: RDF 1.1 Primer. <https://www.w3.org/TR/rdf11-primer/> (2014)

### 脚注链接

 **3**  <https://github.com/RMLio/rmlmapper-java>  **4**  <https://github.com/carml/carml>

 **5**  <https://github.com/mschroeder-github/rmlmapper-java/tree/mschroeder-features>（本文代码 fork）

 **6 / 11**  <http://www.dfki.uni-kl.de/~mschroeder/demo/excel-rml>（在线演示）

 **7**  <https://poi.apache.org/>  **8**  <http://www.dfki.uni-kl.de/~mschroeder/ld/ss>（`ss:` 本体）

 **9**  <https://github.com/marcelotto/spread2rdf>  **10**  <https://github.com/Data2Semantics/TabLinker>

 **12**  <https://github.com/kg-construct/r2rml-implementation-report>

---

 **Excel → RDF 阅读系列** ：[① RML 从零看懂](/posts/rml-from-zero/) · [② Excel-RML 论文精读](/posts/excel-rml-reading-guide/) · [③ Excel-RML 中文译注](/posts/excel-rml-translation/)
