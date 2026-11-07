---
title: "Excel-RML 中文译注：将电子表格映射为 RDF"
published: 2026-11-07
description: "Mapping Spreadsheets to RDF: Supporting Excel in RML 的中文学习译注，保留章节、代码清单、术语表与参考文献。"
category: Excel 数据抽取
tags: [Excel, RML, RDF, 知识图谱, 论文精读]
lang: zh-CN
draft: false
---

 **Excel → RDF 阅读系列** ：[① RML 从零看懂](/posts/rml-from-zero/) · [② Excel-RML 论文精读](/posts/excel-rml-reading-guide/) · [③ Excel-RML 中文译注](/posts/excel-rml-translation/)

本系列整理自个人阅读资料，原论文为 Markus Schröder、Christian Jilek、Andreas Dengel 的 [Mapping Spreadsheets to RDF: Supporting Excel in RML](https://arxiv.org/abs/2104.13600)（2021，KGC Workshop，CEUR Vol.2873）。译文为学习整理，非官方译本；导读、示例和批注属于阅读笔记。文中“目前”“尚不支持”等措辞以论文发表时为准，不代表当前工具或规范的状态。

>  **Mapping Spreadsheets to RDF: Supporting Excel in RML**
> Markus Schröder、Christian Jilek、Andreas Dengel
> ¹ 德国人工智能研究中心（DFKI GmbH）智能数据与知识服务部，凯泽斯劳滕
> ² 凯泽斯劳滕工业大学计算机科学系
> {markus.schroeder, christian.jilek, andreas.dengel}@dfki.de
>
> 出处：arXiv:2104.13600；第 2 届知识图谱构建国际研讨会（KGC @ ESWC 2021），CEUR Workshop Proceedings Vol.2873。共 6 页。

---

## 阅读路线图

>  **如果 RML 还看不懂，先别往下读** ：阅读 [RML 从零看懂](/posts/rml-from-zero/)，用一个 4 行 Excel 小表 + 一份完整映射文件，把「格子 → 三元组」逐步跑通（含逐行注释、执行过程表、前缀速查、四个常见困惑）。一句话预告： **RML 是声明式映射语言，映射文件可类比为一份取值与生成规则** ，工具照模板把格子内容填进三元组，其中语义对应关系由映射作者定义。看懂那份再回来，第 2 章会完全不同。

| 站点 | 内容 | 目标 |
|---|---|---|
| 0 | 标题 / 摘要 / 关键词 | 抓「缺口 → 做法 → 贡献」 |
| 1 | 第 1 章 引言 | 理解「Excel 为什么难映射」与原生支持的四点好处 |
| 2 | 第 2 章 核心方案（★重点） | 逻辑源定义、两段代码清单、单元格元数据变量 |
| 3 | 2.1 实验性功能 | 分清「提案」与「规范」的边界 |
| 4 | 第 3 章 相关工作 | 看作者如何定位：不造新 DSL |
| 5 | 第 4 章 结论 + 批判性阅读 | 从「作者没做什么」里找自己的研究方向 |

>  **读之前先定准位置：这是人工规则驱动的 RDF 提升** 。本文做的是  **RDF 提升（lifting / materialization）** ——把 Excel 里 **已经写明** 的数据（含颜色、字体、批注等元数据），按 **人工编写的 RML 规则** 重新编码成图结构。它 **不负责自动推断表格结构与业务语义** ：「什么是什么」全部来自映射文档，业务含义由规则作者依据表格及业务知识确定。
>
规则方法也可以用于信息抽取。这里要区分的是 **机器执行人工规则** 与 **机器自动生成规则** ：本文主要解决前者，没有证明后者。具体讨论见文末“它与知识抽取是什么关系？”。

---

## 摘要

RDF 映射语言（RML）能够在它所支持的多种格式中，把 CSV（逗号分隔值）这类表格数据映射为 RDF 图。遗憾的是，使用极为广泛的电子表格格式，目前却被 RML 规范以及知名的实现工具所忽略。为此，我们对其中的一款工具——RML Mapper——做了扩展，使其支持 Microsoft Excel 电子表格文件，并用一个交互式在线演示来展示其能力。我们的方法允许在常规的 RML 映射中访问电子表格单元格的各类元数据。此外还提供了若干面向更特定场景的实验性功能。实现代码已在一个 GitHub fork 中公开。

 **关键词** ：电子表格 · Excel · RML · RDF · 知识图谱

>  **导读** ：摘要可归纳为几个信息位——现状（RML 支持 CSV）→ 缺口（规范与实现忽略电子表格）→ 做法（扩展 RML Mapper + 在线演示）→ 贡献一（可访问元数据）→ 贡献二（实验性特性）+ 开源。措辞 `one of the tools` / `experimental` / `fork` 都在提示：这是一份工程实现型短文，不是标准化成果，也没有量化评估。

---

## 1 引言

### 第 1 段 · 问题背景与难点

只要需要从给定数据构建知识图谱，使用映射语言就是一种常见做法。这类语言让用户以 **声明式规则** ，把各种输入数据格式映射为复杂的互联图结构。在语义网社区中，这类图通常用 **资源描述框架（RDF）** [11] 来建模，而（半）结构化数据则通过  **RDF 映射语言（RML）** [2] 来映射——RML 是 W3C 推荐标准  **R2RML**  [10] 的超集。RML 规范 [1] 描述了如何正确映射半结构化数据（如 XML、JSON）以及 CSV 形式的表格。

然而，表格数据也存在于其他文件类型中，最突出的就是 **电子表格** 。由于电子表格提供了一套易于理解、简单快速的数据录入方式，它被知识工作者广泛使用，在工业界尤其如此。与结构简单的 CSV 文件相比，电子表格能够表达 **复杂的工作簿** ：包含多个工作表，单元格还带有丰富的元数据。除了内容本身之外，一个单元格还可能存储外观信息（颜色、样式、边框）或单元格批注。

一般来说，电子表格软件 **并不预先规定** 用户应当如何填写单元格、如何设置样式。其结果是，在实践中单元格里可能包含不一致、非结构化的内容，并且可以在工作表中任意排布。正因如此，把这类数据映射到 RDF 会变成一项颇具挑战的任务。

>  **批注** ：「难」有三层递进——① 结构层：多 sheet、合并单元格、任意排布；② 信息层：值之外还有颜色、字体、批注、公式、富文本，这些 **可能承载业务语义** （例如「红底 = 已废弃」）；③ 规范层：没有 schema 约束，人怎么填都行。第 ② 层正是下文 `backgroundColor`、`valueRichText` 等变量存在的理由；第 ③ 层说明规则编写需要理解数据约定。

### 第 2 段 · 现有工具的缺口与原生支持的价值

尽管电子表格在工业界被频繁使用，但知名的 RML 支持工具——如  **RML Mapper³、CARML⁴、RocketRML [9]、SDM-RDFizer [4]、Mapeathor [5]** ——目前都还没有原生支持它。为弥补这一缺口，我们扩展了 RML Mapper，使其支持 Microsoft Excel 电子表格文件。选择 RML Mapper，是因为它的代码结构便于我们嵌入新代码。

在 RML 中 **原生** 支持电子表格有若干好处：不再需要把电子表格预处理、转换成映射工具能处理的格式（例如 CSV）。这省去了映射专家额外的工夫，让他们能专注于定义恰当的规则。RML 规则直接引用电子表格数据，使规则定义的解读变得直观；因而也更容易向数据提供方说明「他们的表格将如何被映射成知识图谱」。此外，已经掌握 RML 的从业者几乎不需要额外学习，就能映射电子表格。下一节我们将详细描述如何在 RML 中实现 Excel 支持。

>  **划重点 · 四点理由** ：① 免预处理（不丢样式与公式）；② 专家聚焦规则本身；③ 规则可被业务方读懂、可沟通；④ RML 用户较低迁移成本（第 3 章的伏笔）。

---

## 2 在 RML 中支持 Excel

> 本章是全文重心。四个技术动作： **① 读** （Apache POI）→  **② 描述** （`ss:` 本体 + `ql:Spreadsheet`）→  **③ 迭代** （在区域上逐单元格）→  **④ 取值** （相对 / 绝对坐标 + 元数据变量）。注意迭代粒度是 **单元格** 而非「行」，这与 CSV 映射的心智模型不同。

### 2.0.1 总体实现与逻辑源定义（清单 1.1）

我们的方法以扩展的形式实现在 RML Mapper 工具中，代码放在一个独立的  **GitHub fork** ⁵ 里。为便于演示，我们还提供了一个 **交互式演示页面** ⁶，访问者可以试用各种映射示例。该组件的核心使用  **Apache POI** ⁷ 库来读取 Microsoft Excel 电子表格。

为了把电子表格内容当作 **逻辑源（logical source）** 来引用，我们设计了一个小型的 **电子表格本体** ⁸（前缀通常为 `ss`）。如代码清单 1.1 所示：使用 **电子表格引用形式** （第 2 行）时，一个工作簿源需要给出电子表格文件名（第 5 行）、按名称指定的目标工作表（第 6 行），以及该工作表中的 **单元格区域** （第 7 行）。使用这个逻辑源的  **Triples Map**  会在给定区域内 **逐单元格** 迭代。

 **代码清单 1.1：把电子表格文件定义为逻辑源的 RML 示例** （按 PDF 排版还原）

```turtle
[ a rml:LogicalSource ;
  rml:referenceFormulation ql:Spreadsheet ;
  rml:source [
    a ss:Workbook ;
    ss:url "workbook.xlsx" ;
    ss:sheetName "Papers" ;
    ss:range "A2:A5" ;
    ss:javaScriptFilter "/Know\\w*/.test(valueString)"   # 可选
  ]
]
```

| 行 | 说明 |
|---|---|
| 2 | `ql:Spreadsheet` 是本文新增的引用形式；RML 原本有 `ql:CSV`、`ql:JSONPath`、`ql:XPath` |
| 3–4 | 用匿名节点描述数据源，类型为自定义本体的 `ss:Workbook` |
| 5 | `ss:url` 工作簿文件路径 |
| 6 | `ss:sheetName` 按名称选工作表（多 sheet 是 CSV 没有的维度） |
| 7 | `ss:range "A2:A5"` 迭代区域，本例共 4 个单元格 |
| 8 | `ss:javaScriptFilter` 可选的 JS 过滤器 |

>  **代码说明** ：清单是映射片段，不是可单独运行的完整文件。Turtle 字符串中的 `\\w` 在解析后得到 JavaScript 正则中的 `\w`；本次整理修正了这一转义写法，未运行论文引擎。

（可选）还可以添加一个 **过滤器** ，用一段 JavaScript 程序挑出特定单元格（第 8 行）。在我们的例子里，用正则表达式 `/Know\w*/` 让迭代只覆盖包含 "Know" 这一词组的单元格。借助这门表达能力强的脚本语言，以及代表单元格元数据的变量，可以实现各种恰当的过滤逻辑。

>  **批注** ：面对无 schema 的表格，作者没有发明「表格结构描述语言」，而是直接塞进一段  **JavaScript 过滤器** ——灵活性拉满，代价是规则不再纯粹声明式，可移植性与安全性（执行任意脚本）成问题。另外注意 `valueString` 在过滤器里可直接当变量用，与下一段的元数据变量是同一套机制。

### 2.0.2 单元格元数据的引用方式（清单 1.2）

 **代码清单 1.2：演示如何在 RML 映射中访问单元格元数据**

```turtle
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

在各种 RML 映射中，都可以取到 **当前迭代单元格** 的元数据，如代码清单 1.2 所示。例如第 2 行，模板表达式把单元格地址（如 "A2"）插入进去，为主语资源生成一个唯一 URI。

不过，为了构造恰当的三元组，常常还需要引用 **邻近** 的单元格。为此我们引入了一种圆括号记法 `(column, row)`，用于相对当前单元格引用其他单元格：列偏移（工作表的 x 轴）与行偏移（y 轴）组合起来，可以到达相对于「代表主语资源的那个单元格」的任意单元格。例子中第 9 行取的是 **右侧相隔两列** 的数值，作为所映射三元组的宾语。类似地，用 **方括号** （第 6 行）可以 **绝对** 引用单元格。

如前所述，电子表格单元格有多种元数据值，需要在映射中通过变量获取。单元格在工作表中的位置，既可以按常见的电子表格地址（如 A2）取得，也可以按列、行索引取得。由于一个非空单元格存储的要么是字符串值、要么是数值，因此提供了多种访问其内容的方式：`valueNumeric` 取浮点值（`valueInt` 取整数值），`valueBoolean` 取布尔值，`valueFormula` 用于单元格含公式的情况（`valueError` 取可能出现的错误码），`valueString` 取其文本内容。

除内容之外，使用者也可能关心单元格在表中的 **外观** ：因为单元格可以着色，所以可以用 `backgroundColor`、`foregroundColor` 查询十六进制 RGB 值；关于所用字体，则有 `fontColor`、`fontName`、`fontSize` 可用。在更细的粒度上，单元格还可以存储 **富文本** 格式，由 `valueRichText` 返回。富文本以类 HTML 的语法表示，例如 `<b><i><font face='Arial' color='#ff0000'>red, italic and bold</font></i></b>`。

如果表格填写得不规范，常会出现单元格被无意填成不同数据类型的情况；对此可以用 `value` 变量， **无论单元格类型如何** 都始终取得其内容的字符串表示。若这还不够、需要更多细节，则可以使用 `json` 变量获取该单元格的  **JSON**  表示。这个 JSON 对象除单元格类型外，还包含上面提到的各种数据类型。

>  **整理补充** ：上文为论文译述。实际 Excel 单元格还区分布尔、错误等类型；不能把“非空单元格只有字符串或数值”当作完整的 Excel 类型定义。

 **单元格元数据变量速查**

| 类别 | 变量 | 含义 |
|---|---|---|
| 位置 | `address`；列 / 行索引 | 电子表格地址（如 A2）、数字坐标 |
| 内容 | `valueString` | 文本内容 |
| 内容 | `valueNumeric` / `valueInt` | 浮点 / 整数 |
| 内容 | `valueBoolean` | 布尔值 |
| 内容 | `valueFormula` / `valueError` | 公式 / 错误码 |
| 内容 | `value` / `json` | 统一字符串 / 完整 JSON 对象 |
| 外观 | `backgroundColor` / `foregroundColor` | 十六进制 RGB |
| 外观 | `fontColor` / `fontName` / `fontSize` | 字体颜色、名称、字号 |
| 外观 | `valueRichText` | 富文本，类 HTML 语法 |

>  **划重点** ：① 迭代粒度是「单元格」不是「行」，靠偏移量「够」旁边的格子，插一列就可能全错，规则脆弱；② 元数据被当成一等公民，业务里「红色 = 有问题」「加粗 = 已审核」这类视觉约定终于能被显式映射成三元组，而不必人工清洗。
>
>  **自测** ：`(2,0)` 是相对引用，从当前单元格右移 2 列、下移 0 行，随迭代变化；`[2,0]` 是绝对引用，固定指向坐标 (2,0)，不随迭代变化。清单 1.2 用绝对引用取谓词名（表头）、相对引用取宾语值（数据），是很典型的搭配。

---

## 2.1 实验性功能

我们还想提出一些在我们的用例中觉得有用的 **实验性功能** 。不过，要把这些扩展正式纳入，需要在若干地方修改 RML 规范。

### 功能一 · 一个单元格里的多个不同属性

在我们的用例中，经常遇到用户把 **多条信息记在同一个单元格** 里。每一条信息 iⱼ ∈ I 各自对应一个不同的属性 pⱼ ∈ P。按照现行 RML 规范，必须为每个 pⱼ ∈ P  **单独定义一个谓词-宾语映射** 。我们则提议一种简写，只需要一个谓词-宾语映射即可：允许在 **谓词映射** 中传入一个由属性 pⱼ ∈ P 组成的  **RDF 列表** 。

通过实现一个合适的 **函数本体（FnO）** [7] 过程，我们从单元格内容中抽取各条信息 iⱼ ∈ I，并以 **对象列表**  oⱼ ∈ O 返回。RML 通常会在谓词与宾语之间做 **笛卡尔积** ，即 P × O；但在我们的场景中，需要把谓词列表与宾语列表「 **拉链** 」式配对，得到集合 {(pⱼ, oⱼ)}。也就是说，不是取 P × O 矩阵中所有可能的组合，而 **只取对角线上的那些** 。给谓词-宾语映射加上 `ss:zip true` 语句即可启用这一新行为。

>  **举例** ：单元格写着 `张三; 2019; 北京`，希望得到「姓名→张三、年份→2019、地点→北京」。FnO 拆出宾语列表，谓词列表是一一对应的三个属性。默认笛卡尔积会生成 9 条三元组（含「年份→张三」这样的错误配对）；`ss:zip true` 只保留对角线的 3 条。

### 功能二 · 一个单元格里的多个复杂实体

与上一观察类似，我们还常发现用户在单个单元格里提及 **若干实体** 。典型的例子是由名和姓组成的人员列表，比如一本书的作者。若用 RDF 图表示，这类复杂实体可能需要 **多条三元组** 才能完整表达。一个能做实体抽取的 FnO 函数，就需要返回某种序列化格式（如 Turtle）下 **任意大小的 RDF 图** ，而不是单个值。

为了把这样的返回值接入 object map，我们定义了一个新的 **词项类型（term type）**  `ss:Graph`。一旦选用该词项类型，返回的 RDF 图会被解析并 **并入** 正在生成的知识图谱。配合特殊的 `ss:SelectedObjects` 资源和 `rr:object` 语句，可以在 object map 中只映射 **被选中的对象** 。

>  **划重点** ：两个功能分别打破 RML 的两条默认假设——① 谓词 × 宾语做笛卡尔积 → 改成按位置拉链；② 常规 object map 生成 RDF 词项 → 改成能吞下一整张子图。它们共同指向一个现实： **Excel 单元格常常不是原子值，而是一段需要再解析的文本** 。作者用 FnO 把解析 **外挂** 给外部函数，本文没有提供通用抽取算法或评估其质量。

---

## 3 相关工作

过去已有若干类似工作，用某种语言把电子表格映射为 RDF。它们提供的是  **RML 之外的领域特定语言（DSL）** ，让知识工程师表达输入数据应如何映射成图结构。 **Spread2RDF** ⁹ 使用 Ruby 内部 DSL，而  **M2（Mapping Master）** [8] 建立在面向 OWL 本体的紧凑语法（ **Manchester 语法** ）之上。

 **Sheet2RDF**  [3] 使用一种专门的  **PEARL** （ProjEction of Annotations Rule Language，标注规则投影语言）； **XLWrap**  [6] 则使用 **模板图** 配合专门的表达式语言来引用工作表内容。 **TabLinker** ¹⁰ 走了另一条路：它要求 **事先** 用特定样式对输入电子表格做标注。

通过我们的实现，我们把「映射电子表格」这一能力与 **规范完备的 RML 方案** 的优势结合了起来：已经在使用这门语言、又需要处理电子表格的人，不必再去另找替代方案。

| 工具 | 映射表达方式 | 与本文的关键差别 |
|---|---|---|
| Spread2RDF | Ruby 内部 DSL | 绑定 Ruby，非标准映射语言 |
| M2 / Mapping Master | OWL Manchester 语法 | 面向本体建模，非 RML 生态 |
| Sheet2RDF | PEARL 规则语言 | 自定义语言，需另学 |
| XLWrap | 模板图 + 专用表达式语言 | 思路接近，但语言不通用 |
| TabLinker | 预先用特定样式标注表格 | 要求改造源数据；本文反过来「读取」样式 |
|  **本文**  |  **标准 RML + `ss:` 扩展**  |  **复用 RML 并学习扩展，复用既有工具链与技能**  |

>  **批注** ：TabLinker 要求人先用样式 **标注** 表格，本文则直接把现实中已经存在的颜色 / 字体 **当作可读元数据** 。两者都承认「视觉样式承载语义」，但一个要求改造数据，一个要求迁就数据——后者更贴合工业界存量表格的现实。作者把贡献定位成 **生态整合** 而非语言创新，这也解释了为什么全文没有算法实验。

---

## 4 结论与展望

本文指出，电子表格虽被广泛应用，却仍未被  **RDF 映射语言（RML）**  所支持。为此我们提出了 **首个** 解决方案，用必要的组件扩展已有的 RML Mapper 工具，此外还引入了若干实验性功能。一个公开可访问的网页¹¹ 演示了这些新能力。

未来，我们计划把所提方案 **整合进 RML 规范** [1]，以便其他 RML 工具也能支持电子表格；还打算对目前的参考实现开展一系列 **性能与一致性（compliance）测试** ，这项工作可以在  **R2RML 实现报告** ¹² 的框架下完成。

 **致谢** ：本研究由德国联邦教育与研究部（BMBF） **SensAI**  项目资助（项目编号 01IW20007）。

>  **导读** ：结论的价值在「作者承认还没做什么」——推进标准化、补评测。反过来说明：本文既没进规范，也没有性能 / 一致性数据，读的时候要相应降低对「效果验证」的期待。

---

## 背景知识补给

-  **RDF** ：用三元组（主语, 谓词, 宾语）表示知识，资源用 URI 标识；所有三元组合起来就是知识图谱。[11] 是 W3C 的 RDF 1.1 Primer。
-  **R2RML** ：W3C 2012 推荐标准 [10]，把关系数据库映射为 RDF。核心概念 `TriplesMap`、`LogicalTable`、`SubjectMap`（常用 `rr:template` 拼 URI）、`PredicateObjectMap`、词项类型 `rr:IRI / rr:Literal / rr:BlankNode`。
-  **RML** ：R2RML 的超集 [2][1]，推广到 CSV、XML、JSON、Web API 等异构数据。关键扩展是 `rml:referenceFormulation`（声明引用语法）与 `rml:reference`（在源数据里取值）。 **本文新增的就是一种引用形式 `ql:Spreadsheet`。**
-  **FnO（函数本体）** [7]：用 RDF 声明式描述函数、参数与返回值，让映射规则能调用外部函数做转换 / 抽取。2.1 节两个实验功能都依赖它，可理解为 RML 的「插件接口」。
-  **Apache POI** ：Java 库，读写 `.xls` / `.xlsx`，能取到值、类型、样式、批注、公式、富文本、合并区域——本文那串元数据变量基本就是 POI 能力的一层薄封装。
-  **关系一句话** ：R2RML（数据库）⊂ RML（+ CSV/XML/JSON）⊂ 本文（+ Excel 及其元数据）。论文做的是「给标准生态补一种输入格式」，不是发明新范式。

## 术语对照表

| English | 中文 |
|---|---|
| spreadsheet / workbook / sheet | 电子表格 / 工作簿 / 工作表 |
| mapping language / declarative rule | 映射语言 / 声明式规则 |
| logical source | 逻辑源 |
| reference formulation | 引用形式 / 引用语法 |
| Triples Map | 三元组映射 |
| subject / predicate / object map | 主语 / 谓词 / 宾语映射 |
| term type | 词项类型 |
| meta data / rich text | 元数据 / 富文本 |
| Function Ontology (FnO) | 函数本体 |
| Cartesian product / zip | 笛卡尔积 / 拉链配对 |
| DSL | 领域特定语言 |
| compliance test | 一致性 / 符合性测试 |

---

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

## 脚注链接与参考文献

 **脚注**

- 3 <https://github.com/RMLio/rmlmapper-java>
- 4 <https://github.com/carml/carml>
- 5 <https://github.com/mschroeder-github/rmlmapper-java/tree/mschroeder-features>（本文代码 fork）
- 6 / 11 <http://www.dfki.uni-kl.de/~mschroeder/demo/excel-rml>（在线演示）
- 7 <https://poi.apache.org/>
- 8 <http://www.dfki.uni-kl.de/~mschroeder/ld/ss>（`ss:` 本体）
- 9 <https://github.com/marcelotto/spread2rdf>
- 10 <https://github.com/Data2Semantics/TabLinker>
- 12 <https://github.com/kg-construct/r2rml-implementation-report>

 **参考文献** （按原文编号）

1. Dimou, A., Sande, M.V.: RDF Mapping Language (RML). <https://rml.io/specs/rml/> (2020)
2. Dimou, A. et al.: RML: a generic language for integrated RDF mappings of heterogeneous data. LDOW 2014, CEUR Vol.1184
3. Fiorelli, M. et al.: Sheet2RDF: a flexible and dynamic spreadsheet import & lifting framework for RDF. IEA/AIE 2015, LNCS 9101, pp.131–140
4. Iglesias, E. et al.: SDM-RDFizer: An RML interpreter for the efficient creation of RDF knowledge graphs. CIKM 2020, pp.3039–3046
5. Iglesias-Molina, A. et al.: Mapeathor: Simplifying the specification of declarative rules for knowledge graph construction. ISWC 2020 Demos, CEUR Vol.2721, pp.25–30
6. Langegger, A., Wöß, W.: XLWrap – Querying and integrating arbitrary spreadsheets with SPARQL. ISWC 2009, LNCS 5823, pp.359–374
7. De Meester, B. et al.: An ontology to semantically declare and describe functions. ESWC 2016 Satellite Events, LNCS 9989, pp.46–49
8. O'Connor, M.J. et al.: M2: A language for mapping spreadsheets to OWL. OWLED 2010
9. Simsek, U., Kärle, E., Fensel, D.: RocketRML – A NodeJS implementation of a use case specific RML mapper. ESWC 2019 Workshops, CEUR Vol.2489, pp.46–53
10. W3C: R2RML: RDB to RDF Mapping Language (2012)
11. W3C: RDF 1.1 Primer (2014)

---

*整理说明：根据提供的中文阅读资料整理，保留论文的章节、代码清单和参考文献编号；导读与批注为学习补充。原文请以链接中的论文版本为准。*

---

 **Excel → RDF 阅读系列** ：[① RML 从零看懂](/posts/rml-from-zero/) · [② Excel-RML 论文精读](/posts/excel-rml-reading-guide/) · [③ Excel-RML 中文译注](/posts/excel-rml-translation/)
