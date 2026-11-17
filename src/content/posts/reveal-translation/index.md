---
title: "REVEAL 论文中英对照：面向精确列标注的表格上下文选择"
published: 2026-11-17
description: "Retrieve-and-Verify（SIGMOD 2026）中英对照译文，涵盖列上下文检索、上下文感知编码、REVEAL+ 校验推断与实验分析，保留 11 张原始配图。"
category: Excel 数据抽取
tags: [表格理解, REVEAL, 列类型标注, 列关系标注, 论文精读]
lang: zh-CN
draft: false
---

本文由个人阅读用的中英对照文档适配，保留原稿的正文、图表、算法和参考文献。译文为非官方学习整理；研究结果与评价均以论文所述实验条件为准，引用请核对原论文。原稿中的 DOI 为占位符，本文按原稿保留，不作为有效链接。

**阅读方式**：使用下方按钮切换中英对照、中文或英文正文；章节可通过本页目录跳转。图表点击可放大，宽表格、公式和算法可横向滚动。参考文献保留原文。

<header class="reveal-title">
  <div class="kicker">SIGMOD ’26 · 中英对照全文 · 逐段翻译</div>
  <p class="paper-title" lang="en">Retrieve-and-Verify: A Table Context Selection Framework for Accurate Column Annotations</p>
  <div class="h1zh">检索—校验：面向精确列标注的表格上下文选择框架</div>
  <div class="meta">
    <b>作者</b>：Zhihao Ding<sup>*</sup>、Yongkang Sun<sup>*</sup>、Jieming Shi（香港理工大学）&nbsp;·&nbsp;<sup>*</sup>共同第一作者<br>
    <b>会议</b>：SIGMOD ’26，2026 年 5 月 31 日–6 月 5 日，印度班加罗尔&nbsp;·&nbsp;<b>篇幅</b>：15 页<br>
    <b>代码</b>：<a href="https://github.com/TommyDzh/REVEAL">https://github.com/TommyDzh/REVEAL</a>
  </div>
  <div class="tools" role="group" aria-label="阅读语言" data-pagefind-ignore>
    <button type="button" data-mode="both" aria-pressed="true" class="on">中英对照</button>
    <button type="button" data-mode="zh-only" aria-pressed="false">仅中文</button>
    <button type="button" data-mode="en-only" aria-pressed="false">仅英文</button>
  </div>
</header>
<span id="abs"></span>

## 摘要

<div class="p">
    <div class="en" lang="en">Tables are a prevalent format for structured data, yet their metadata, such as semantic types and column relationships, is often incomplete or ambiguous. Column annotation tasks, including Column Type Annotation (CTA) and Column Property Annotation (CPA), address this by leveraging table context, which are critical for data management. Existing methods typically serialize all columns in a table into pretrained language models to incorporate context, but this coarse-grained approach often degrades performance in wide tables with many irrelevant or misleading columns. To address this, we propose a novel retrieve-and-verify context selection framework for accurate column annotation, introducing two methods: REVEAL and REVEAL+. In REVEAL, we design an efficient unsupervised retrieval technique to select compact, informative column contexts by balancing semantic relevance and diversity, and develop context-aware encoding techniques with role embeddings and target-context pair training to effectively differentiate target and context columns. To further improve performance, in REVEAL+, we design a verification model that refines the selected context by directly estimating its quality for specific annotation tasks. To achieve this, we formulate a novel column context verification problem as a classification task and then develop the verification model. Moreover, in REVEAL+, we develop a top-down verification inference technique to ensure efficiency by reducing the search space for high-quality context subsets from exponential to quadratic. Extensive experiments on six benchmark datasets demonstrate that our methods consistently outperform state-of-the-art baselines.</div>
    <div class="zh" lang="zh-CN">表格是结构化数据的一种普遍格式，但其元数据——例如语义类型与列之间的关系——往往不完整或存在歧义。列标注任务，包括列类型标注（Column Type Annotation, CTA）与列属性标注（Column Property Annotation, CPA），通过利用表格上下文来应对这一问题，而这些上下文对数据管理至关重要。现有方法通常把表中的所有列序列化后送入预训练语言模型以引入上下文，但这种粗粒度的做法在含大量无关或误导性列的宽表上常常导致性能下降。为此，我们提出一种新的「检索—校验」（retrieve-and-verify）上下文选择框架以实现精确的列标注，并引入两种方法：REVEAL 与 REVEAL+。在 REVEAL 中，我们设计了一种高效的无监督检索技术，通过平衡语义相关性与多样性来选出紧凑、信息量大的列上下文；同时开发了上下文感知编码技术，借助角色嵌入（role embedding）与目标—上下文配对训练（target-context pair training）有效区分目标列与上下文列。为进一步提升性能，在 REVEAL+ 中我们设计了一个校验模型（verification model），通过直接估计所选上下文对特定标注任务的质量来对其加以精化。为此，我们把一个新的「列上下文校验」问题形式化为分类任务，并据此开发该校验模型。此外，在 REVEAL+ 中我们提出一种自顶向下的校验推断技术，把高质量上下文子集的搜索空间从指数级降到平方级，以保证效率。在六个基准数据集上的大量实验表明，我们的方法稳定优于当前最先进的基线方法。</div>
  </div>
  <div class="p">
    <div class="en" lang="en"><b class="ri">ACM Reference Format.</b> Zhihao Ding, Yongkang Sun, and Jieming Shi. 2026. Retrieve-and-Verify: A Table Context Selection Framework for Accurate Column Annotations. In Proceedings of the 2026 ACM SIGMOD International Conference on Management of Data (SIGMOD ’26). ACM, 15 pages. https://doi.org/XXXXXXX.XXXXXXX</div>
    <div class="zh" lang="zh-CN"><b class="ri">ACM 引用格式.</b> Zhihao Ding, Yongkang Sun, and Jieming Shi. 2026. Retrieve-and-Verify: A Table Context Selection Framework for Accurate Column Annotations. In Proceedings of the 2026 ACM SIGMOD International Conference on Management of Data (SIGMOD ’26). ACM, 15 页. https://doi.org/XXXXXXX.XXXXXXX</div>
  </div>
  <div class="note"><b>体例</b>：灰色衬线体为英文原文，正文色为中文译文，逐段对应；公式、算法伪代码、表格数值保持原样，仅译标题与字段名；插图取自原文 PDF，置于对应位置；参考文献保留英文原貌。</div>
<span id="s1"></span>

## 1 引言

<div class="p">
    <div class="en" lang="en">Relational tables are a fundamental format for organizing structured data in diverse applications. As structured data grows in volume and complexity, understanding tables through metadata becomes critical for efficient management and utilization [2, 39].</div>
    <div class="zh" lang="zh-CN">关系表是在各类应用中组织结构化数据的基础格式。随着结构化数据在体量与复杂度上的增长，通过元数据来理解表格，已成为高效管理与利用数据的关键 [2, 39]。</div>
  </div>
  <div class="p">
    <div class="en" lang="en">However, table metadata, particularly the semantic types and relationships of columns, is often missing, incomplete, or ambiguous [22, 30]. Column annotation mitigates this via important tasks, including Column Type Annotation (CTA), which predicts a target column’s semantic type, and Column Property Annotation (CPA), also known as Column Relationship Annotation, which identifies relationships of column pairs. Accurate column annotation is crucial for applications such as schema matching [11, 28], dataset discovery [14, 23], data integration [24, 41], and semantic data versioning [38].</div>
    <div class="zh" lang="zh-CN">然而，表格元数据——尤其是列的语义类型与列间关系——经常缺失、不完整或存在歧义 [22, 30]。列标注通过若干重要任务来缓解这一问题，其中包括列类型标注（CTA）——预测目标列的语义类型，以及列属性标注（CPA，也称列关系标注）——识别列对之间的关系。精确的列标注对模式匹配（schema matching）[11, 28]、数据集发现（dataset discovery）[14, 23]、数据集成 [24, 41] 与语义化数据版本管理 [38] 等应用都至关重要。</div>
  </div>
  <div class="p">
    <div class="en" lang="en">In this work, we investigate CTA and CPA in scenarios where metadata is unavailable. Accurate annotation of a target’s semantic type or relationship requires the context of other columns within the same table. For example, in Table A of Figure 1(a), the target column (in gray) contains float values such as ‘11.11’ and ‘13.13’. Solely relying on the target itself, it is difficult to determine if it represents PRICE or RATING semantic type. However, when considering the other columns, the target is likely to be PRICE since it is followed by a currency column, and the table describes books.</div>
    <div class="zh" lang="zh-CN">本文研究元数据不可用情形下的 CTA 与 CPA。要准确标注目标的语义类型或关系，需要同一张表内其他列所提供的上下文。例如在图 1(a) 的表 A 中，目标列（灰色）含 ‘11.11’、‘13.13’ 等浮点值。仅凭目标列自身，很难判断它表示的是 PRICE 还是 RATING 语义类型。但若考察其他列，由于该列右侧紧邻一个货币列、且整表描述的是图书，目标列很可能是 PRICE。</div>
  </div>
  <div class="p">
    <div class="en" lang="en">Recent studies [6, 32, 39, 40] have leveraged language models (LMs) such as BERT [8] and LLaMA [12] to enhance column annotation by utilizing column representations as context [14, 39, 47], and even inter-table columns [40]. A common approach is to serialize all columns in a table into a single sequence and input it into LMs, such as BERT in Doduo [39], to generate column embeddings that capture patterns and relationships between columns. Then the model predicts the semantic type or relationship of the target as a classification problem based on the generated embeddings.</div>
    <div class="zh" lang="zh-CN">近期研究 [6, 32, 39, 40] 借助 BERT [8]、LLaMA [12] 等语言模型（LM）来增强列标注：以列表示作为上下文 [14, 39, 47]，甚至引入跨表列 [40]。一种常见做法是把表中所有列序列化为一条序列，输入语言模型（如 Doduo [39] 中的 BERT），生成能够刻画列间模式与关系的列嵌入；随后模型基于这些嵌入，把目标语义类型或关系的预测当作分类问题求解。</div>
  </div>
  <div class="p">
    <div class="en" lang="en">While existing methods have made notable progress, their approach to leveraging column context remains coarse-grained. This often leads to sub-optimal performance, particularly in wide tables with many columns, which are common in real-world scenarios [31]. We conduct an empirical analysis of Doduo on two datasets, GitTablesSC and SOTAB-CTA, to examine the impact of the number of columns in a table on model performance (see detailed experiments in Section 6). As shown in Figure 2, performance improves in terms of Macro-F1 and Micro-F1 as the number of columns increases from 1 to 12, demonstrating the benefit of leveraging additional column content. However, performance declines when the number of columns exceeds 12. This indicates that wide tables with many columns pose greater challenges, as not all columns are beneficial for the target. Including all columns may introduce noise and redundancy, degrading performance [37, 46]. We provide Example 1 with two real tables in Figure 1 to illustrate this issue.</div>
    <div class="zh" lang="zh-CN">尽管现有方法已取得明显进展，但它们对列上下文的利用仍是粗粒度的。这常常导致次优性能，在现实中常见的多列宽表上尤为突出 [31]。我们在 GitTablesSC 与 SOTAB-CTA 两个数据集上对 Doduo 做了实证分析，考察表内列数对模型性能的影响（详见第 6 节实验）。如图 2 所示，当列数从 1 增至 12 时，Macro-F1 与 Micro-F1 均随之提升，说明利用更多列内容是有益的；但当列数超过 12 后性能转而下降。这表明多列宽表带来更大挑战：并非所有列都对目标有益，把全部列纳入可能引入噪声与冗余，从而损害性能 [37, 46]。我们用图 1 中两张真实表构成的例 1 来说明这一问题。</div>
  </div>
  <div class="box ex">
    <div class="lbl">例 1 · Example 1</div>
    <div class="p">
      <div class="en" lang="en">Figure 1(a) and (c) show two real tables with target columns in grey and the goal is to predict their semantic types, either PRICE or RATING, which are shown for illustration but not available during annotation. Both targets contain float values, and the tables include columns with similar data types, such as text and numbers. Using all columns as context, a model may fail to distinguish the targets, leading to incorrect predictions. For instance, Doduo generates embeddings for the two targets with a high cosine similarity of 0.966, making them hard to differentiate. However, closer inspection reveals that the target in Table A is likely PRICE, as it is followed by a currency column with GBP and USD values, while the target in Table B is likely RATING, as it is followed by a percentage column. Selecting only relevant columns, such as TITLE and CURRENCY for Table A, and TITLE and SCORE(%) for Table B, as shown in Figure 1(b) and (d), reduces the cosine similarity between the targets to 0.591, making them more distinguishable. This highlights the importance of selecting relevant context columns for accurate annotation.</div>
      <div class="zh" lang="zh-CN">图 1(a) 与 (c) 给出两张真实表，目标列以灰色标出，任务是预测其语义类型（PRICE 或 RATING）——这些标签此处仅为说明之用，标注时并不可见。两个目标都含浮点值，且两表都包含数据类型相似的列（如文本列与数值列）。若把全部列当作上下文，模型可能无法区分两个目标，从而给出错误预测。例如 Doduo 为这两个目标生成的嵌入余弦相似度高达 0.966，几乎无法区分。但仔细查看即可发现：表 A 的目标列右侧紧跟一个含 GBP、USD 值的货币列，故更可能是 PRICE；表 B 的目标列右侧紧跟一个百分比列，故更可能是 RATING。如图 1(b) 与 (d) 所示，只选取相关列——表 A 取 TITLE 与 CURRENCY，表 B 取 TITLE 与 SCORE(%)——两个目标之间的余弦相似度便降至 0.591，区分度明显提高。这凸显了「选取相关上下文列」对精确标注的重要性。</div>
    </div>
  </div>
  <figure class="fig" id="fig1">
    <div class="pic"><img src="/images/reveal-translation/fig1.png" width="676" height="348" alt="图 1 两张真实表格上的示例：(a)(c) 原始表；(b)(d) 选取上下文后的表。" loading="lazy" decoding="async"></div>
    <div class="figcap"><b>图 1</b> 两张真实表格上的示例：(a)(c) 原始表；(b)(d) 选取上下文后的表。
    <span class="ten">Figure 1: Example on two real-world tables: (a)(c) Raw tables; (b)(d) Tables with selected contexts.</span></div>
  </figure>
  <figure class="fig" id="fig2">
    <div class="pic"><img src="/images/reveal-translation/fig2.png" width="559" height="270" alt="图 2 列数对 CTA 性能的影响。" loading="lazy" decoding="async"></div>
    <div class="figcap"><b>图 2</b> 列数对 CTA 性能的影响。
    <span class="ten">Figure 2: The impact of column number on CTA.</span></div>
  </figure>
  <div class="p">
    <div class="en" lang="en">These empirical findings reveal the importance of explicitly selecting relevant column contexts for accurate column annotation. To this end, we propose a novel retrieve-and-verify context selection framework comprising the REVEAL and REVEAL+ methods. REVEAL delivers superior annotation performance with high efficiency, while REVEAL+ further enhances annotation accuracy significantly with moderate additional overhead. In REVEAL, we first design an efficient retrieval method to select a compact, informative subset of columns from the input table <i>T</i> as the column context <i>C</i> for a given target in an unsupervised manner (Section 4.1). This method ensures that <i>C</i> is both semantically relevant and diverse, providing meaningful context without requiring labeled supervision. Next, to generate high-quality embeddings that effectively distinguish target and context columns, we develop context-aware encoding techniques (Section 4.2). This includes a context-aware encoder with role embeddings to explicitly mark column roles, and a target-context pair training strategy that treats each target-context pair as a distinct training unit, enabling effective modeling of target-context interactions.</div>
    <div class="zh" lang="zh-CN">这些实证发现揭示了一点：要实现精确的列标注，必须显式地选取相关的列上下文。为此，我们提出一种新的「检索—校验」上下文选择框架，包含 REVEAL 与 REVEAL+ 两种方法。REVEAL 以高效率取得优越的标注性能；REVEAL+ 以适度的额外开销，进一步显著提升标注精度。在 REVEAL 中，我们首先设计一种高效检索方法，以无监督方式从输入表 <i>T</i> 中为目标选出紧凑而信息量大的列子集作为列上下文 <i>C</i>（第 4.1 节）。该方法保证 <i>C</i> 既语义相关又具多样性，无需标注监督即可提供有意义的上下文。接下来，为生成能有效区分目标列与上下文列的高质量嵌入，我们开发了上下文感知编码技术（第 4.2 节）：一方面设计带有角色嵌入的上下文感知编码器以显式标注列的「角色」，另一方面采用目标—上下文配对训练策略，把每个目标—上下文对当作独立训练单元，从而有效建模目标与上下文之间的交互。</div>
  </div>
  <div class="p">
    <div class="en" lang="en">To further improve performance, we extend REVEAL with REVEAL+, incorporating a verification model to refine <i>C</i> into a verified column context <i>S</i>. The verification directly estimates the quality of the selected column context for the target in a supervised manner, ensuring that the context is not only relevant but also effective for the specific annotation tasks. To this end, we formulate a novel column context verification problem as a classification task, construct a pseudo-labeled dataset, and design and train the verification model (Section 5.1). To avoid the exponential search space of all subsets of <i>C</i> to find the highest quality <i>S</i>, we develop a top-down verification inference method that efficiently obtains <i>S</i> using a greedy strategy, reducing the search space to quadratic (Section 5.2). We conduct extensive experiments on six benchmark datasets, comparing our methods with state-of-the-art baselines. The results show that REVEAL and REVEAL+ consistently outperform existing approaches, demonstrating that our techniques in the proposed context selection framework advance column annotation performance. We summarize our contributions below:</div>
    <div class="zh" lang="zh-CN">为进一步提升性能，我们在 REVEAL 基础上扩展出 REVEAL+，引入校验模型把 <i>C</i> 精化为「经校验的列上下文」<i>S</i>。该校验以有监督方式直接估计所选列上下文对目标的质量，确保上下文不仅相关、而且对特定标注任务真正有效。为此，我们把一个新的列上下文校验问题形式化为分类任务，构造伪标注数据集，并设计与训练校验模型（第 5.1 节）。为避免「穷举 <i>C</i> 的所有子集以寻找质量最高的 <i>S</i>」所带来的指数级搜索空间，我们提出自顶向下的校验推断方法，用贪心策略高效求得 <i>S</i>，把搜索空间降至平方级（第 5.2 节）。我们在六个基准数据集上与最先进基线做了大量对比实验，结果表明 REVEAL 与 REVEAL+ 稳定优于现有方法，说明该上下文选择框架中的各项技术确实推进了列标注性能。我们的贡献归纳如下：</div>
  </div>
  <div class="p">
    <div class="en" lang="en">• We propose a retrieve-and-verify column context selection framework, introducing the REVEAL and REVEAL+ methods to address the challenges of noisy and redundant column contexts in column annotation tasks.</div>
    <div class="zh" lang="zh-CN">• 我们提出「检索—校验」列上下文选择框架，引入 REVEAL 与 REVEAL+ 两种方法，以应对列标注任务中上下文噪声与冗余带来的挑战。</div>
  </div>
  <div class="p">
    <div class="en" lang="en">• We propose a retrieval method to select compact and informative column contexts and introduce context-aware encoding to differentiate target and context columns for better embeddings.</div>
    <div class="zh" lang="zh-CN">• 我们提出一种检索方法以选出紧凑且信息量大的列上下文，并引入上下文感知编码来区分目标列与上下文列，从而获得更好的嵌入。</div>
  </div>
  <div class="p">
    <div class="en" lang="en">• We design a verification model with a novel problem formulation and an efficient top-down inference strategy to refine the selected column context, further boosting annotation performance.</div>
    <div class="zh" lang="zh-CN">• 我们设计了一个校验模型，配合新颖的问题形式化与高效的自顶向下推断策略来精化所选列上下文，进一步提升标注性能。</div>
  </div>
  <div class="p">
    <div class="en" lang="en">• Extensive experiments on six benchmark datasets validate the effectiveness and efficiency of our proposed methods.</div>
    <div class="zh" lang="zh-CN">• 在六个基准数据集上的大量实验验证了所提方法的有效性与高效性。</div>
  </div>
  <div class="note" style="background:#f6f5f0;border-color:var(--line);color:var(--ink3);font-size:12.2px">原文脚注：<sup>*</sup> 共同第一作者（Co-primary authors）。版权声明：允许为个人或课堂使用免费制作本文全部或部分的数字或硬拷贝，前提是这些拷贝不得用于营利或商业目的，且须保留本声明与首页完整引用；他人拥有版权的部分须予以尊重。允许在注明出处的前提下摘录摘要。其余复制、再出版、张贴至服务器或分发至邮件列表，须事先取得专门许可和/或付费。许可申请请联系 permissions@acm.org。</div>
<span id="s2"></span>

## 2 预备知识

<div class="p">
    <div class="en" lang="en">We focus on two column annotation tasks: Column Type Annotation (CTA) and Column Property Annotation (CPA) [6, 32, 39, 47]. As illustrated in Figure 1, CTA assigns semantic types (e.g., PRICE, RATING) to individual columns, providing a clearer understanding of their semantics. CPA aims to determine the semantic relationship between column pairs, such as place_of_birth linking person to city, or has_population linking city to population. Instead of primitive data types (e.g., String, Int, Timestamp), CTA and CPA focus on annotating columns with semantic types and relationships, offering deeper semantic understanding of tabular data.</div>
    <div class="zh" lang="zh-CN">我们聚焦两类列标注任务：列类型标注（CTA）与列属性标注（CPA）[6, 32, 39, 47]。如图 1 所示，CTA 为单列赋予语义类型（如 PRICE、RATING），使人更清楚地理解其语义；CPA 则判定列对之间的语义关系，例如 place_of_birth 把 person 关联到 city，或 has_population 把 city 关联到 population。与原始数据类型（如 String、Int、Timestamp）不同，CTA 与 CPA 关注的是为列标注语义类型与语义关系，从而对表格数据提供更深层的语义理解。</div>
  </div>
  <div class="p">
    <div class="en" lang="en">Formally, a table <i>T</i> with <i>n</i> columns is represented as <i>T</i> = (c₁, c₂, …, c<sub>n</sub>), where c<sub>i</sub> denotes the <i>i</i>-th column in the table. Each column c<sub>i</sub> comprises <i>m</i> cell values, expressed as c<sub>i</sub> = (v<sub>i1</sub>, v<sub>i2</sub>, …, v<sub>im</sub>), where v<sub>ij</sub> represents the value of the <i>j</i>-th cell in column c<sub>i</sub>. The definitions of CTA and CPA [32, 39] are as follows:</div>
    <div class="zh" lang="zh-CN">形式化地，含 <i>n</i> 列的表 <i>T</i> 表示为 <i>T</i> = (c₁, c₂, …, c<sub>n</sub>)，其中 c<sub>i</sub> 表示表中第 <i>i</i> 列。每列 c<sub>i</sub> 含 <i>m</i> 个单元格值，记作 c<sub>i</sub> = (v<sub>i1</sub>, v<sub>i2</sub>, …, v<sub>im</sub>)，v<sub>ij</sub> 表示列 c<sub>i</sub> 中第 <i>j</i> 个单元格的值。CTA 与 CPA 的定义 [32, 39] 如下：</div>
  </div>
  <div class="box def">
    <div class="lbl">定义 2 · Definition 2 · 列类型标注 CTA</div>
    <div class="p">
      <div class="en" lang="en">Given a table <i>T</i> with <i>n</i> columns, and a target column <i>τ</i> = c<sub>i</sub>, where 1 ≤ <i>i</i> ≤ <i>n</i>, and a set of possible semantic types 𝒯, the task of CTA is to develop a model 𝓜 that can predict a type label 𝓜(<i>τ</i>, <i>T</i>) ∈ 𝒯 so that each cell in <i>τ</i> has the same semantic type.</div>
      <div class="zh" lang="zh-CN">给定含 <i>n</i> 列的表 <i>T</i>、目标列 <i>τ</i> = c<sub>i</sub>（1 ≤ <i>i</i> ≤ <i>n</i>）以及可能的语义类型集合 𝒯，CTA 的任务是构建一个模型 𝓜，使其能预测类型标签 𝓜(<i>τ</i>, <i>T</i>) ∈ 𝒯，从而让 <i>τ</i> 中每个单元格具有相同的语义类型。</div>
    </div>
  </div>
  <div class="box def">
    <div class="lbl">定义 3 · Definition 3 · 列属性标注 CPA</div>
    <div class="p">
      <div class="en" lang="en">Given a table <i>T</i> with <i>n</i> columns, and a target column pair <i>τ</i> = (c<sub>i</sub>, c<sub>j</sub>), where 1 ≤ <i>i</i>, <i>j</i> ≤ <i>n</i>, and a set of possible relation types ℛ, the task of CPA is to develop a model 𝓜 that can predict a relation type 𝓜(<i>τ</i>, <i>T</i>) ∈ ℛ to represent the relationship between the two columns.</div>
      <div class="zh" lang="zh-CN">给定含 <i>n</i> 列的表 <i>T</i>、目标列对 <i>τ</i> = (c<sub>i</sub>, c<sub>j</sub>)（1 ≤ <i>i</i>, <i>j</i> ≤ <i>n</i>）以及可能的关系类型集合 ℛ，CPA 的任务是构建一个模型 𝓜，使其能预测关系类型 𝓜(<i>τ</i>, <i>T</i>) ∈ ℛ，以表示这两列之间的关系。</div>
    </div>
  </div>
  <div class="p">
    <div class="en" lang="en">We focus on the setting where no metadata, such as headers or captions, is available, as these are often missing in many datasets [18, 27]. Hereafter, when the context is clear, we use target <i>τ</i> to denote either a target column in CTA or a pair of target columns in CPA. Table 1 summarizes the frequently used notations in this paper.</div>
    <div class="zh" lang="zh-CN">我们聚焦于「无元数据可用」的情形，即表头、标题等均不可得——这在许多数据集中很常见 [18, 27]。下文中若无歧义，我们用「目标 <i>τ</i>」统一指代 CTA 中的目标列或 CPA 中的目标列对。表 1 汇总了本文常用记号。</div>
  </div>
  <div class="tbl">
    <div class="tcap"><b>表 1</b> 常用记号。<span class="ten">Table 1: Frequently used notations.</span></div>
    <div class="scroll" tabindex="0" role="region" aria-label="可横向滚动的数据表格"><table>
      <thead><tr><th style="width:120px">记号 Symbol</th><th class="wrapcell">含义 Description</th></tr></thead>
      <tbody>
        <tr><td><i>T</i></td><td class="wrapcell">含多列的表。A table with multiple columns.</td></tr>
        <tr><td>c<sub>i</sub></td><td class="wrapcell">表中第 <i>i</i> 列。The <i>i</i>-th column in the table.</td></tr>
        <tr><td><i>τ</i></td><td class="wrapcell">待标注的目标列或目标列对。The target column or column pair for annotation.</td></tr>
        <tr><td>gt<sub><i>τ</i></sub></td><td class="wrapcell">目标的真实标签。The ground-truth of the target.</td></tr>
        <tr><td><i>C</i></td><td class="wrapcell">为 <i>τ</i> 检索到的列上下文。The retrieved column context for <i>τ</i>.</td></tr>
        <tr><td><i>S</i></td><td class="wrapcell">为 <i>τ</i> 校验后的列上下文。The verified column context for <i>τ</i>.</td></tr>
        <tr><td><i>S′</i></td><td class="wrapcell"><i>C</i> 的一个列子集。A subset of columns from <i>C</i>.</td></tr>
        <tr><td>Π</td><td class="wrapcell">校验模型。The verification model.</td></tr>
        <tr><td>Π(<i>τ</i>, <i>S</i>)</td><td class="wrapcell">校验模型给出的质量分数。The quality score assigned by the verification model.</td></tr>
        <tr><td><i>f</i></td><td class="wrapcell">预测模块。The prediction module.</td></tr>
        <tr><td>h<sup><i>τ</i></sup><sub><i>S′</i></sub></td><td class="wrapcell">在上下文 <i>S′</i> 下 <i>τ</i> 的嵌入。The embedding of <i>τ</i> with context <i>S′</i>.</td></tr>
        <tr><td>y<sup><i>τ</i></sup><sub><i>S′</i></sub></td><td class="wrapcell">指示列上下文质量的标签。The label indicating the quality of a column context.</td></tr>
        <tr><td><i>K</i></td><td class="wrapcell">检索到的列上下文 C 的期望大小。The desired size of the retrieved column context <i>C</i>.</td></tr>
      </tbody>
    </table></div>
  </div>
<span id="s3"></span>

## 3 方法总览

<div class="p">
    <div class="en" lang="en">We provide an overview of our methods REVEAL and REVEAL+. Our methods are designed to be applicable to both CTA and CPA. We mainly explain our methods in the context of CTA for clarity. Figure 3(a) illustrates the REVEAL method. Given a table <i>T</i> with <i>n</i> columns, there may be different targets, e.g., <i>τ</i> and <i>τ′</i>, to be annotated. As discussed, treating all columns in <i>T</i> as a shared context for different targets can lead to degraded performance. Therefore, in REVEAL, we first design a retrieval method to explicitly select a subset of columns from <i>T</i> as the column context <i>C</i> for a target <i>τ</i>, considering semantic relevance and diversity among columns in <i>T</i> (Section 4.1). The retrieval method operates solely on unsupervised information, ensuring scalability and effectiveness. Then the next step is to encode them into embeddings via language models. Existing studies [32, 39] typically serialize all columns into a sequence, treating the target and context columns uniformly. However, we argue that the embedding of a column should adapt based on its role—whether as the target or as part of the context. To achieve this, we develop context-aware encoding techniques that explicitly differentiate the target from its context columns in embeddings (Section 4.2). Specifically, we introduce a context-aware encoder with role embeddings to mark the roles of columns during the embedding process, and we adopt a target-context pair training strategy, where each target <i>τ</i> is paired with its column context <i>C</i> as distinct training units. The obtained embeddings are then passed to a linear layer for generating the final predictions. REVEAL excels state-of-the-art methods in effectiveness and efficiency, as shown in the experiments. While efficiency is important, annotation quality often takes precedence, especially for offline tasks. To further enhance annotation quality, REVEAL+ improves effectiveness with moderate additional computational cost.</div>
    <div class="zh" lang="zh-CN">这里给出 REVEAL 与 REVEAL+ 的总览。两种方法均设计为可同时适用于 CTA 与 CPA；为清晰起见，我们主要在 CTA 语境下说明。图 3(a) 展示了 REVEAL 方法。给定含 <i>n</i> 列的表 <i>T</i>，可能有多个待标注的目标，例如 <i>τ</i> 与 <i>τ′</i>。如前所述，把 <i>T</i> 中所有列当作不同目标共享的上下文，会导致性能下降。因此，在 REVEAL 中我们首先设计检索方法，在考虑 <i>T</i> 中各列语义相关性与多样性的前提下，为目标 <i>τ</i> 显式地从 <i>T</i> 中选出一个列子集作为列上下文 <i>C</i>（第 4.1 节）。该检索方法仅依赖无监督信息，兼具可扩展性与有效性。接下来需要经由语言模型把这些列编码为嵌入。现有研究 [32, 39] 通常将所有列序列化为一条序列，对目标列与上下文列一视同仁；但我们认为，一列的嵌入应当依据其角色（是目标，还是上下文的一部分）而自适应调整。为此，我们开发了上下文感知编码技术，在嵌入中显式区分目标列与其上下文列（第 4.2 节）。具体来说，我们引入带角色嵌入的上下文感知编码器，在嵌入过程中标注各列的角色；并采用目标—上下文配对训练策略，把每个目标 <i>τ</i> 与其列上下文 <i>C</i> 配对作为独立训练单元。所得嵌入随后送入一个线性层生成最终预测。实验表明，REVEAL 在有效性与效率上均优于当前最先进方法。虽然效率重要，但标注质量往往优先，尤其是离线任务；为进一步提升标注质量，REVEAL+ 以适度的额外计算开销换取更高的有效性。</div>
  </div>
  <div class="p">
    <div class="en" lang="en">REVEAL+ is shown in Figure 3(b). Similar to REVEAL, it starts with the same retrieval method to obtain <i>C</i> for the target <i>τ</i>. While <i>C</i> is selected based on unsupervised information in <i>T</i>, the columns in <i>C</i> are not yet verified whether they are truly helpful in the annotation tasks. To address this, REVEAL+ incorporates a verification model (Section 5) to further refine <i>C</i> to obtain a verified column context <i>S</i> for the target <i>τ</i>, which retains only the most informative columns for the target <i>τ</i> on the annotation tasks. To improve the efficiency of obtaining <i>S</i>, we propose a top-down verification inference method (Section 5.2). As formulated in Section 5.1, the verification model Π evaluates a subset <i>S′</i> of <i>C</i> for a target <i>τ</i> by outputting a quality score Π(<i>τ</i>, <i>S′</i>), which represents the likelihood that <i>S′</i> enables the correct annotation of <i>τ</i>. This verification task is framed as a classification problem: determine whether a subset <i>S′</i> of <i>C</i> is effective for accurately annotating the target <i>τ</i>. The subset of <i>C</i> with the maximum quality score is selected as the verified column context <i>S</i> for the target <i>τ</i>.</div>
    <div class="zh" lang="zh-CN">REVEAL+ 见图 3(b)。与 REVEAL 类似，它同样先用同一检索方法为目标 <i>τ</i> 得到 <i>C</i>。虽然 <i>C</i> 是基于 <i>T</i> 中的无监督信息选出的，但其中各列是否真正有助于标注任务尚未得到验证。为此，REVEAL+ 引入校验模型（第 5 节）对 <i>C</i> 进一步精化，得到目标的「经校验列上下文」<i>S</i>——只保留对目标 <i>τ</i> 的标注任务最有信息量的列。为提升求取 <i>S</i> 的效率，我们提出自顶向下校验推断方法（第 5.2 节）。如第 5.1 节所形式化，校验模型 Π 通过输出质量分数 Π(<i>τ</i>, <i>S′</i>) 来评估 <i>C</i> 的子集 <i>S′</i>，该分数表示 <i>S′</i> 能使 <i>τ</i> 被正确标注的可能性。该校验任务被框定为分类问题：判断 <i>C</i> 的子集 <i>S′</i> 是否能有效、准确地标注目标 <i>τ</i>。质量分数最大的 <i>C</i> 子集即被选为目标 <i>τ</i> 的经校验列上下文 <i>S</i>。</div>
  </div>
  <div class="p">
    <div class="en" lang="en">A key challenge is the lack of labeled data for training the verification model. To address this, we construct a labeled dataset by leveraging the predictions of the trained prediction module <i>f</i> on the training and validation datasets, which are available after <i>f</i> is trained. For each subset <i>S′</i> ⊆ <i>C</i>, we label it as positive if <i>f</i> makes a correct prediction for <i>τ</i> using <i>S′</i> as context, indicating that <i>S′</i> is a good context. Otherwise, it is labeled as negative. The model Π is then trained on this constructed labeled dataset. During inference, the model Π finds the <i>S</i> that maximizes the score Π(<i>τ</i>, <i>S′</i>) for <i>τ</i>. The trained prediction module <i>f</i> then uses <i>S</i> to generate the final prediction for <i>τ</i>. Evaluating all subsets <i>S′</i> ⊆ <i>C</i> is infeasible due to the exponential search space of 2<sup>|<i>C</i>|</sup>. Hence, we propose a top-down verification inference method (Section 5.2) that iteratively refines <i>C</i>, reducing the complexity to <i>O</i>(|<i>C</i>|²), with early stopping to improve efficiency.</div>
    <div class="zh" lang="zh-CN">一个关键难题是缺少用于训练校验模型的标注数据。为此，我们利用训练好的预测模块 <i>f</i> 在训练集与验证集上的预测结果来构造标注数据集——这些预测在 <i>f</i> 训练完成之后即可获得。对每个子集 <i>S′</i> ⊆ <i>C</i>，若 <i>f</i> 以 <i>S′</i> 为上下文对 <i>τ</i> 的预测正确，则标为正例，表示 <i>S′</i> 是一个好的上下文；否则标为负例。模型 Π 随即在该构造出的标注数据集上训练。推断阶段，模型 Π 为目标 <i>τ</i> 找出使分数 Π(<i>τ</i>, <i>S′</i>) 最大的 <i>S</i>；训练好的预测模块 <i>f</i> 再用 <i>S</i> 生成对 <i>τ</i> 的最终预测。由于 <i>C</i> 的全部子集构成 2<sup>|<i>C</i>|</sup> 的指数级搜索空间，逐一评估 <i>S′</i> ⊆ <i>C</i> 并不可行。因此我们提出自顶向下的校验推断方法（第 5.2 节），迭代地精化 <i>C</i>，把复杂度降至 <i>O</i>(|<i>C</i>|²)，并配合早停进一步提升效率。</div>
  </div>
  <figure class="fig" id="fig3">
    <div class="pic"><img src="/images/reveal-translation/fig3.png" width="1276" height="356" alt="图 3 REVEAL 与 REVEAL+ 的框架。" loading="lazy" decoding="async"></div>
    <div class="figcap"><b>图 3</b> REVEAL 与 REVEAL+ 的框架。
    <span class="ten">Figure 3: The Framework of REVEAL and REVEAL+.</span></div>
  </figure>
<span id="s4"></span>

## 4 REVEAL 方法

<span id="s41"></span>

### 4.1 列上下文检索

<div class="p">
    <div class="en" lang="en">As mentioned, in a wide table <i>T</i> = (c₁, …, c<sub>n</sub>), using all columns for annotating a target <i>τ</i> can degrade performance due to irrelevant columns. We aim to retrieve a subset of columns as the column context <i>C</i> for <i>τ</i>. However, the search space of 2<sup><i>n</i></sup> subsets grows exponentially with <i>n</i>, and different targets may require distinct column contexts. In this section, we propose an efficient retrieval method that leverages only the unsupervised information of columns in <i>T</i> to retrieve a compact yet informative column context <i>C</i> for <i>τ</i>.</div>
    <div class="zh" lang="zh-CN">如前所述，在宽表 <i>T</i> = (c₁, …, c<sub>n</sub>) 中，因存在无关列，用全部列为目标 <i>τ</i> 做标注会降低性能。我们的目标是检索出一个列子集，作为 <i>τ</i> 的列上下文 <i>C</i>。然而全部子集构成 2<sup><i>n</i></sup> 的搜索空间，随 <i>n</i> 指数增长；且不同目标可能需要不同的列上下文。本节提出一种高效检索方法，仅利用 <i>T</i> 中各列的无监督信息，为 <i>τ</i> 检索出紧凑而信息量大的列上下文 <i>C</i>。</div>
  </div>
  <div class="p">
    <div class="en" lang="en"><b class="ri">Intuitions.</b> As shown in Figure 1, not all columns in a table equally contribute to understanding the target <i>τ</i> with ground truth PRICE. For example, the Description column, despite containing detailed text, is irrelevant to the target’s semantics, while the CURRENCY column provides essential context. Including irrelevant columns can degrade performance, highlighting the need to filter for semantically relevant columns. One naive approach is to select the top-<i>K</i> most similar columns to <i>τ</i> as <i>C</i>. However, this may not always yield an informative context. For example, consider constructing a column context <i>C</i> of size 3 for the target in Figure 1(a). The target <i>τ</i> contains numerical values, and the cosine similarity between the target and other columns are: ID (0.82), PAGES (0.76), YEAR (0.68), CURRENCY (0.55), TITLE (0.28), and DESCRIPTION (0.21). Selecting the top-3 most similar columns would yield ID, PAGES, and YEAR. However, these columns are all numerically related and fail to provide diverse contextual information. In contrast, CURRENCY (0.55), though less similar, specifies the nature of the values in the target and is crucial for inferring its semantic type. Thus, a more balanced approach that considers both similarity and diversity is needed.</div>
    <div class="zh" lang="zh-CN"><b class="ri">直觉。</b>如图 1 所示，表中的列对「理解真实标签为 PRICE 的目标 <i>τ</i>」所作的贡献并不相同。例如 Description 列虽然含有详细文本，却与目标语义无关；而 CURRENCY 列则提供了关键上下文。纳入无关列会损害性能，因此必须筛选出语义相关的列。一种朴素做法是选取与 <i>τ</i> 最相似的前 <i>K</i> 列作为 <i>C</i>，但这未必能得到有信息量的上下文。以图 1(a) 的目标为例，构造大小为 3 的列上下文 <i>C</i>：目标 <i>τ</i> 含数值，它与各列的余弦相似度为 ID (0.82)、PAGES (0.76)、YEAR (0.68)、CURRENCY (0.55)、TITLE (0.28)、DESCRIPTION (0.21)。取前 3 个最相似列会得到 ID、PAGES、YEAR——它们都与数值相关，无法提供多样化的上下文信息。相反，CURRENCY (0.55) 虽然相似度较低，却限定了目标值的性质，对推断其语义类型至关重要。因此，需要一种同时考虑相似性与多样性的更均衡的做法。</div>
  </div>
  <div class="p">
    <div class="en" lang="en"><b class="ri">Retrieval Method.</b> To select the column context <i>C</i> of a target <i>τ</i> in a table <i>T</i>, we consider both semantic similarity and diversity among columns. First, each column <i>c</i> in <i>T</i> is serialized into a string by concatenating its cell values v₁, …, v<sub>m</sub>. This serialized string is then passed through a text encoder E [36], which generates a dense embedding e<sub>c</sub> for the column. The embeddings of semantically similar columns are closer in the embedding space.</div>
    <div class="zh" lang="zh-CN"><b class="ri">检索方法。</b>为在表 <i>T</i> 中为目标 <i>τ</i> 选出列上下文 <i>C</i>，我们同时考虑列间的语义相似性与多样性。首先，把 <i>T</i> 中每一列 <i>c</i> 的单元格值 v₁, …, v<sub>m</sub> 拼接为一个字符串进行序列化；该字符串随后通过文本编码器 E [36]，生成该列的稠密嵌入 e<sub>c</sub>。语义相近的列，其嵌入在嵌入空间中彼此更接近。</div>
  </div>
  <div class="eq" tabindex="0" role="region" aria-label="公式"><div><i>e</i><sub>c</sub> = E(CONCAT(<i>v</i>₁, …, <i>v</i><sub>m</sub>)),</div><span class="num">(1)</span></div>
  <div class="p">
    <div class="en" lang="en">where CONCAT(·) represents the concatenation operation, E(·) is the text encoder, e<sub>c</sub> ∈ ℝ<sup>d<sub>e</sub></sup> denotes the embedding of column <i>c</i> ∈ <i>T</i>, and d<sub>e</sub> is the embedding dimension. Then we use maximal marginal relevance [5] as a measure to balance relevance and diversity, and develop an iterative process to construct <i>C</i>. Starting with an empty <i>C</i> = ∅, we iteratively select the column <i>c</i> ∈ <i>T</i> \ <i>C</i> that maximizes the marginal relevance score <i>g</i>(<i>c</i>, <i>τ</i>, <i>C</i>), and add it to <i>C</i>.</div>
    <div class="zh" lang="zh-CN">其中 CONCAT(·) 表示拼接操作，E(·) 为文本编码器，e<sub>c</sub> ∈ ℝ<sup>d<sub>e</sub></sup> 表示列 <i>c</i> ∈ <i>T</i> 的嵌入，d<sub>e</sub> 为嵌入维度。接着，我们以最大边际相关性（maximal marginal relevance, MMR）[5] 作为度量来平衡相关性与多样性，并设计一个迭代过程来构造 <i>C</i>。从空的 <i>C</i> = ∅ 出发，每轮从 <i>T</i> \ <i>C</i> 中选出使边际相关性得分 <i>g</i>(<i>c</i>, <i>τ</i>, <i>C</i>) 最大的列 <i>c</i>，加入 <i>C</i>。</div>
  </div>
  <div class="p">
    <div class="en" lang="en">In Equation (2), <i>g</i>(<i>c</i>, <i>τ</i>, <i>C</i>) is defined as the difference between the semantic similarity of <i>c</i> to the target <i>τ</i>, cos(e<sub>c</sub>, e<sub>τ</sub>), and the maximum similarity of <i>c</i> to any column already in <i>C</i>, max<sub>c″∈C</sub> cos(e<sub>c</sub>, e<sub>c″</sub>). The first term ensures that the selected column is relevant to the target, while the second term penalizes redundancy by discouraging columns similar to those already in <i>C</i>.</div>
    <div class="zh" lang="zh-CN">式 (2) 中，<i>g</i>(<i>c</i>, <i>τ</i>, <i>C</i>) 定义为「<i>c</i> 与目标 <i>τ</i> 的语义相似度 cos(e<sub>c</sub>, e<sub>τ</sub>)」与「<i>c</i> 与 <i>C</i> 中已有各列的最大相似度 max<sub>c″∈C</sub> cos(e<sub>c</sub>, e<sub>c″</sub>)」之差。第一项保证所选列与目标相关；第二项则通过抑制与 <i>C</i> 中已有列相似的列来惩罚冗余。</div>
  </div>
  <div class="eq" tabindex="0" role="region" aria-label="公式"><div><i>g</i>(<i>c</i>, <i>τ</i>, <i>C</i>) = cos(<i>e</i><sub>c</sub>, <i>e</i><sub>τ</sub>) − max<sub>c″∈C</sub> cos(<i>e</i><sub>c</sub>, <i>e</i><sub>c″</sub>)</div><span class="num">(2)</span></div>
  <div class="eq" tabindex="0" role="region" aria-label="公式"><div><i>c′</i> = argmax<sub>c∈T\C</sub> <i>g</i>(<i>c</i>, <i>τ</i>, <i>C</i>).</div><span class="num">(2)</span></div>
  <div class="p">
    <div class="en" lang="en">This process continues until <i>C</i> reaches the desired size <i>K</i>.</div>
    <div class="zh" lang="zh-CN">该过程持续进行，直到 <i>C</i> 达到期望的大小 <i>K</i>。</div>
  </div>
  <div class="algo">
    <div class="abar">算法 1 · Algorithm 1 &nbsp;|&nbsp; Column Context Retrieval 列上下文检索</div>
<pre><span class="k">Input</span>: Table <i>T</i>, target <i>τ</i>, encoder E, size <i>K</i>
<span class="k">Output</span>: Column context <i>C</i>
1  <span class="k">foreach</span> <i>c</i> ∈ <i>T</i> <span class="k">do</span>
2      e<sub>c</sub> ← E(<i>c</i>)                    <span class="c">// 编码各列</span>
3  <i>C</i> ← ∅
4  <i>c′</i> ← argmax<sub>c∈T\{τ}</sub> cos(e<sub>c</sub>, e<sub>τ</sub>)      <span class="c">// 选出第一列</span>
5  <i>C</i> ← <i>C</i> ∪ {<i>c′</i>}
6  <span class="k">while</span> |<i>C</i>| &lt; <i>K</i> <span class="k">do</span>                <span class="c">// 迭代选择</span>
7      <i>c′</i> ← argmax<sub>c∈T\C</sub> [ cos(e<sub>c</sub>, e<sub>τ</sub>) − max<sub>c″∈C</sub> cos(e<sub>c</sub>, e<sub>c″</sub>) ]
8      <i>C</i> ← <i>C</i> ∪ {<i>c′</i>}
9  <span class="k">return</span> <i>C</i></pre>
  </div>
  <div class="box ex">
    <div class="lbl">例 4 · Example 4</div>
    <div class="p">
      <div class="en" lang="en">In Figure 1(b), for a target <i>τ</i> containing numerical values, selecting the top-3 most similar columns retrieves other numeric columns (e.g., ID, YEAR, PAGES), which provide limited assistance in clarifying the true semantic meaning of the target, i.e., PRICE. In contrast, our retrieval method selects a more semantically meaningful size-3 column context <i>C</i>. We initialize <i>C</i> as empty and iteratively add columns based on their marginal relevance scores. First, the most similar column to the target, ID (0.82), is added, resulting in <i>C</i> = {ID}. Next, we compute <i>g</i>(<i>c</i>, <i>τ</i>, <i>C</i>) for each column <i>c</i> ∈ <i>T</i> \ <i>C</i>. For instance, PAGES has a high similarity to the target (0.76) but also a high similarity to ID (0.71), yielding <i>g</i>(PAGES, <i>τ</i>, <i>C</i>) = 0.05. On the other hand, CURRENCY has cos(e<sub>c</sub>, e<sub>τ</sub>) = 0.55 and cos(e<sub>c</sub>, e<sub>ID</sub>) = 0.34, resulting in <i>g</i>(CURRENCY, <i>τ</i>, <i>C</i>) = 0.21, making it more favorable than PAGES. Similarly, other columns in <i>T</i> \ <i>C</i> have lower marginal relevance scores than CURRENCY, so we expand <i>C</i> to {ID, CURRENCY}. Finally, we repeat the process to select the third column. TITLE achieves the highest marginal relevance score, surpassing PAGES, YEAR, and DESCRIPTION. Thus, the final <i>C</i> is {ID, CURRENCY, TITLE}, which includes CURRENCY to specify the nature of the target values, ensuring a well-rounded contextual representation.</div>
      <div class="zh" lang="zh-CN">在图 1(b) 中，对于含数值的目标 <i>τ</i>，取前 3 个最相似列会检索到其他数值列（如 ID、YEAR、PAGES），它们对澄清目标的真实语义（即 PRICE）帮助有限。相比之下，我们的检索方法选出的、大小为 3 的列上下文 <i>C</i> 在语义上更有意义。我们把 <i>C</i> 初始化为空，依据边际相关性得分迭代加入列。首先加入与目标最相似的 ID (0.82)，得 <i>C</i> = {ID}。接着对每个 <i>c</i> ∈ <i>T</i> \ <i>C</i> 计算 <i>g</i>(<i>c</i>, <i>τ</i>, <i>C</i>)：例如 PAGES 与目标的相似度很高 (0.76)，但它与 ID 的相似度也高 (0.71)，于是 <i>g</i>(PAGES, <i>τ</i>, <i>C</i>) = 0.05；而 CURRENCY 的 cos(e<sub>c</sub>, e<sub>τ</sub>) = 0.55、cos(e<sub>c</sub>, e<sub>ID</sub>) = 0.34，得 <i>g</i>(CURRENCY, <i>τ</i>, <i>C</i>) = 0.21，因此优于 PAGES。同理，<i>T</i> \ <i>C</i> 中其余列的边际相关性得分都低于 CURRENCY，于是 <i>C</i> 扩展为 {ID, CURRENCY}。最后重复该过程选第三列：TITLE 的边际相关性得分最高，超过 PAGES、YEAR 与 DESCRIPTION。因此最终的 <i>C</i> 为 {ID, CURRENCY, TITLE}——其中 CURRENCY 限定了目标值的性质，从而保证上下文表示较为完整。</div>
    </div>
  </div>
  <div class="p">
    <div class="en" lang="en">Algorithm 1 depicts the retrieval method. Parameter <i>K</i> is the desired size of column context. If a table <i>T</i> has columns less than <i>K</i>, we simply use all available columns (excluding the target) as <i>C</i>. Otherwise, we first compute the column embeddings for all columns in <i>T</i> using the text encoder E (Lines 1-2). We then initialize the column context <i>C</i> as empty and select the first column <i>c′</i> to be added into <i>C</i> as the most similar column to the target (Lines 4-5). Next, we iteratively select the next column <i>c′</i> from <i>T</i> \ <i>C</i> based on its marginal relevance score <i>g</i>(<i>c</i>, <i>τ</i>, <i>C</i>), until the size of <i>C</i> reaches <i>K</i> (Lines 6-8). Specifically, the selected <i>c′</i> maximizes the marginal relevance score (Line 7) and is added to <i>C</i> (Line 8). In experiments, we have varied <i>K</i> to study its impact in Figure 8; the performance increases first and then remains stable after a certain <i>K</i> value, indicating that a moderate number of contextual columns is sufficient to provide a well-rounded context for the annotation tasks.</div>
    <div class="zh" lang="zh-CN">算法 1 描述了该检索方法。参数 <i>K</i> 为列上下文的期望大小。若表 <i>T</i> 的列数少于 <i>K</i>，我们直接以全部可用列（不含目标）作为 <i>C</i>；否则，先用文本编码器 E 计算 <i>T</i> 中所有列的列嵌入（第 1–2 行）。随后把列上下文 <i>C</i> 初始化为空，并选出与目标最相似的列 <i>c′</i> 加入 <i>C</i>（第 4–5 行）。接着依据边际相关性得分 <i>g</i>(<i>c</i>, <i>τ</i>, <i>C</i>)，从 <i>T</i> \ <i>C</i> 中迭代选取下一列 <i>c′</i>，直到 <i>C</i> 的大小达到 <i>K</i>（第 6–8 行）：被选中的 <i>c′</i> 使边际相关性得分最大（第 7 行），并被加入 <i>C</i>（第 8 行）。实验中我们变化 <i>K</i> 以研究其影响（图 8）：性能先上升，在 <i>K</i> 超过某一取值后趋于稳定，说明适度的上下文列数已足以为标注任务提供完整的上下文。</div>
  </div>
<span id="s42"></span>

### 4.2 上下文感知编码

<div class="p">
    <div class="en" lang="en">After retrieving <i>C</i> for a target <i>τ</i> in a table <i>T</i>, we need to effectively leverage it for annotation. For different targets, their context columns may vary, and the model should be trained to prioritize the target while recognizing the supporting role of its context columns. To achieve this, we propose a context-aware encoder that incorporates column role embeddings to explicitly differentiate the target from its context columns during the embedding process. Additionally, we introduce target-context pair training to train the model on individual target-context pairs, ensuring that each target is paired with its specific context rather than entire tables in a single pass.</div>
    <div class="zh" lang="zh-CN">在表 <i>T</i> 中为目标 <i>τ</i> 检索出 <i>C</i> 之后，需要有效地将其用于标注。不同目标的上下文列可能不同，模型应当被训练成「优先关注目标、同时识别上下文列的支撑作用」。为此，我们提出一种上下文感知编码器，引入列角色嵌入，在嵌入过程中显式区分目标列与其上下文列。此外，我们引入目标—上下文配对训练，在单个目标—上下文对上训练模型，确保每个目标与其专属上下文配对，而非在一次前向中与整张表配对。</div>
  </div>
  <div class="p">
    <div class="en" lang="en"><b class="ri">Context-Aware Encoder with Role Embeddings.</b> Given a target <i>τ</i> and its column context <i>C</i> in a table <i>T</i>, we first serialize the columns in <i>C</i> into a token sequence by preserving their original order in the table and concatenating their cell values column by column, separated by a special token ([CLS] in BERT [8]) used in language models. For instance, consider the table in Figure 4: the serialization process produces the sequence “[CLS] NYC LDN [CLS] 3.0T 0.6T [CLS] USD GBP”, where each column is delineated by a [CLS] token. Then for each token w<sub>j</sub> in the sequence, the language model maps it to an embedding by aggregating a pretrained word embedding w<sub>j</sub> and a position embedding p<sub>j</sub>, which encodes the position of the token in the sequence.</div>
    <div class="zh" lang="zh-CN"><b class="ri">带角色嵌入的上下文感知编码器。</b>给定表 <i>T</i> 中的目标 <i>τ</i> 及其列上下文 <i>C</i>，我们首先把 <i>C</i> 中的列序列化为一条 token 序列：保持它们在表中的原始顺序，逐列拼接其单元格值，并以语言模型中的特殊 token（BERT 中的 [CLS] [8]）分隔。以图 4 的表为例，序列化得到序列「[CLS] NYC LDN [CLS] 3.0T 0.6T [CLS] USD GBP」，其中每一列由 [CLS] 分隔。随后，序列中每个 token w<sub>j</sub> 由语言模型映射为嵌入：聚合预训练的词嵌入 w<sub>j</sub> 与位置嵌入 p<sub>j</sub>（后者编码该 token 在序列中的位置）。</div>
  </div>
  <div class="p">
    <div class="en" lang="en">To explicitly distinguish the target from its context columns, we introduce the third embedding component for a token, column role embedding, in the context-aware encoder. For each token w<sub>j</sub> in the serialized sequence, we assign a binary role indicator r<sub>j</sub> ∈ {0, 1}, where r<sub>j</sub> = 1 if the token belongs to the target and r<sub>j</sub> = 0 otherwise. This role indicator is mapped to a role embedding vector r<sub>j</sub> ∈ ℝ<sup>d</sup> using a trainable lookup table E<sub>role</sub> ∈ ℝ<sup>2×d</sup>, where d is the embedding dimension, as follows.</div>
    <div class="zh" lang="zh-CN">为显式区分目标列与其上下文列，我们在上下文感知编码器中为 token 引入第三种嵌入分量——列角色嵌入。对序列化后的每个 token w<sub>j</sub>，赋予一个二元角色指示 r<sub>j</sub> ∈ {0, 1}：若该 token 属于目标则 r<sub>j</sub> = 1，否则 r<sub>j</sub> = 0。该指示经可训练的查表 E<sub>role</sub> ∈ ℝ<sup>2×d</sup>（d 为嵌入维度）映射为角色嵌入向量 r<sub>j</sub> ∈ ℝ<sup>d</sup>，如下：</div>
  </div>
  <div class="eq" tabindex="0" role="region" aria-label="公式"><div><b>r</b><sub>j</sub> = E<sub>role</sub>[r<sub>j</sub>],</div><span class="num">(3)</span></div>
  <div class="p">
    <div class="en" lang="en">where r<sub>j</sub> ∈ ℝ<sup>d</sup> is the role embedding of token w<sub>j</sub>. Note that E<sub>role</sub> contains two embeddings: one for tokens belonging to the target and another for tokens from context columns. These embeddings are jointly optimized with the other model parameters during training, enabling the model to effectively differentiate structural roles and prioritize the target. Then, as shown in Figure 4, a token w<sub>j</sub> is embedded into x<sub>j</sub> that combines three components: the word embedding w<sub>j</sub>, position embedding p<sub>j</sub>, and role embedding r<sub>j</sub> in Equation (4).</div>
    <div class="zh" lang="zh-CN">其中 r<sub>j</sub> ∈ ℝ<sup>d</sup> 是 token w<sub>j</sub> 的角色嵌入。注意 E<sub>role</sub> 含两个嵌入：一个用于属于目标的 token，另一个用于来自上下文列的 token。这些嵌入在训练中与其他模型参数联合优化，使模型能有效区分结构角色并优先关注目标。随后，如图 4 所示，token w<sub>j</sub> 被嵌入为 x<sub>j</sub>，由式 (4) 中的三个分量组合而成：词嵌入 w<sub>j</sub>、位置嵌入 p<sub>j</sub> 与角色嵌入 r<sub>j</sub>。</div>
  </div>
  <div class="eq" tabindex="0" role="region" aria-label="公式"><div><b>x</b><sub>j</sub> = <b>w</b><sub>j</sub> + <b>p</b><sub>j</sub> + <b>r</b><sub>j</sub>.</div><span class="num">(4)</span></div>
  <div class="p">
    <div class="en" lang="en">Then the token embeddings x<sub>j</sub> are fed into a language model, primarily composed of transformer layers with self-attention mechanisms [42], to produce the contextualized target embedding h<sup><i>τ</i></sup><sub><i>C</i></sub> for target <i>τ</i>. Specifically, h<sup><i>τ</i></sup><sub><i>C</i></sub> is extracted from the output corresponding to the [CLS] token of the target in CTA, regarding [CLS] as a representative token for the column, as shown in Figure 4. In CPA, with a pair of two columns as the target, we concatenate the embeddings of the columns to form the target embedding. In our design, h<sup><i>τ</i></sup><sub><i>C</i></sub> captures the semantics of the target, while also incorporating contextual information from the columns in <i>C</i>, considering their distinct roles.</div>
    <div class="zh" lang="zh-CN">随后，token 嵌入 x<sub>j</sub> 被送入语言模型（主要由带自注意力机制的 Transformer 层构成 [42]），为目标 <i>τ</i> 生成上下文化的目标嵌入 h<sup><i>τ</i></sup><sub><i>C</i></sub>。具体地，在 CTA 中 h<sup><i>τ</i></sup><sub><i>C</i></sub> 取自目标列 [CLS] token 对应的输出——我们把 [CLS] 视为该列的代表 token，如图 4 所示。在 CPA 中，以两列构成的列对为目标，我们将两列的嵌入拼接成目标嵌入。在我们的设计中，h<sup><i>τ</i></sup><sub><i>C</i></sub> 既刻画了目标的语义，也在区分角色差异的前提下融入了 <i>C</i> 中各列提供的上下文信息。</div>
  </div>
  <div class="p">
    <div class="en" lang="en">Then a linear layer classifier <i>ψ</i> is applied to h<sup><i>τ</i></sup><sub><i>C</i></sub> to predict the semantic type or relation of the target,</div>
    <div class="zh" lang="zh-CN">接着，对 h<sup><i>τ</i></sup><sub><i>C</i></sub> 施加一个线性层分类器 <i>ψ</i>，以预测目标的语义类型或关系：</div>
  </div>
  <div class="eq" tabindex="0" role="region" aria-label="公式"><div><i>f</i>(<i>τ</i>, <i>C</i>) = <i>ψ</i>(h<sup><i>τ</i></sup><sub><i>C</i></sub>),</div><span class="num">(5)</span></div>
  <div class="p">
    <div class="en" lang="en">where the prediction module <i>f</i>(<i>τ</i>, <i>C</i>) denotes the predictions for the target <i>τ</i> based on the given context <i>C</i>.</div>
    <div class="zh" lang="zh-CN">其中预测模块 <i>f</i>(<i>τ</i>, <i>C</i>) 表示在给定上下文 <i>C</i> 下对目标 <i>τ</i> 的预测。</div>
  </div>
  <figure class="fig" id="fig4">
    <div class="pic"><img src="/images/reveal-translation/fig4.png" width="558" height="475" alt="图 4 上下文感知列嵌入示意（词嵌入 + 位置嵌入 + 角色嵌入三路相加）。" loading="lazy" decoding="async"></div>
    <div class="figcap"><b>图 4</b> 上下文感知列嵌入示意（词嵌入 + 位置嵌入 + 角色嵌入三路相加）。
    <span class="ten">Figure 4: Illustration of Context-Aware Column Embedding.</span></div>
  </figure>
  <div class="p">
    <div class="en" lang="en"><b class="ri">Target-Context Pair Training.</b> Prior works [14, 32, 39] typically use the entire table <i>T</i> as the training instance for different targets, resulting in all targets sharing the same table context. This approach may include columns that are irrelevant or uninformative for specific targets, potentially degrading model performance. In contrast, our design allows different targets in the same table <i>T</i> to have distinct column contexts <i>C</i>, tailored to each target. After obtaining the column context <i>C</i> for a target <i>τ</i> in a table <i>T</i>, we pair the target <i>τ</i> with its unique context columns <i>C</i> and the corresponding ground-truth label gt<sub><i>τ</i></sub>, forming a training instance (<i>τ</i>, <i>C</i>, gt<sub><i>τ</i></sub>). This reformulates the training data into a set of target-context pairs, enabling the model to focus on target-specific contexts. Since the retrieval method in Section 4.1 is unsupervised, this process is efficient and does not require additional supervision.</div>
    <div class="zh" lang="zh-CN"><b class="ri">目标—上下文配对训练。</b>以往工作 [14, 32, 39] 通常把整张表 <i>T</i> 作为不同目标的训练实例，导致所有目标共享同一份表格上下文。这种做法可能纳入对特定目标无关或无信息量的列，从而损害模型性能。相反，我们的设计允许同一张表 <i>T</i> 中不同目标拥有各自专属的列上下文 <i>C</i>。在为表 <i>T</i> 中的目标 <i>τ</i> 得到列上下文 <i>C</i> 后，我们把目标 <i>τ</i> 与其专属上下文列 <i>C</i> 及对应真实标签 gt<sub><i>τ</i></sub> 配对，构成训练实例 (<i>τ</i>, <i>C</i>, gt<sub><i>τ</i></sub>)。这等价于把训练数据重组为一组「目标—上下文对」，使模型能聚焦于目标专属的上下文。由于第 4.1 节的检索方法是无监督的，该过程高效且无需额外监督。</div>
  </div>
  <div class="p">
    <div class="en" lang="en">Formally, for each labeled target in the original training set D<sub>train</sub>, we construct the target-context pair training set D<sup>pair</sup><sub>train</sub> as follows:</div>
    <div class="zh" lang="zh-CN">形式化地，对原始训练集 D<sub>train</sub> 中的每个有标签目标，我们构造目标—上下文配对训练集 D<sup>pair</sup><sub>train</sub> 如下：</div>
  </div>
  <div class="eq" tabindex="0" role="region" aria-label="公式"><div>D<sup>pair</sup><sub>train</sub> = { (<i>τ</i>, <i>C</i>, gt<sub><i>τ</i></sub>) | <i>τ</i> ∈ D<sub>train</sub> },</div><span class="num">(6)</span></div>
  <div class="p">
    <div class="en" lang="en">where gt<sub><i>τ</i></sub> is the ground truth of <i>τ</i>. Our method REVEAL is then trained using this target-context pair training set, optimizing the following objective:</div>
    <div class="zh" lang="zh-CN">其中 gt<sub><i>τ</i></sub> 为 <i>τ</i> 的真实标签。我们的方法 REVEAL 随即在该目标—上下文配对训练集上训练，优化如下目标：</div>
  </div>
  <div class="eq" tabindex="0" role="region" aria-label="公式"><div>ℒ(θ) = (1 / |D<sup>pair</sup><sub>train</sub>|) · Σ<sub>(<i>τ</i>,<i>C</i>,gt<sub><i>τ</i></sub>) ∈ D<sup>pair</sup><sub>train</sub></sub> ℓ( <i>f</i>(<i>τ</i>, <i>C</i>), gt<sub><i>τ</i></sub> )</div><span class="num">(7)</span></div>
  <div class="p">
    <div class="en" lang="en">where <i>f</i>(<i>τ</i>, <i>C</i>) is predication for target <i>τ</i>, and ℓ is the cross-entropy loss, and θ represents the trainable parameters.</div>
    <div class="zh" lang="zh-CN">其中 <i>f</i>(<i>τ</i>, <i>C</i>) 是对目标 <i>τ</i> 的预测，ℓ 为交叉熵损失，θ 表示可训练参数。</div>
  </div>
<span id="s5"></span>

## 5 REVEAL+ 方法

<div class="p">
    <div class="en" lang="en">Given a target <i>τ</i> in a table <i>T</i>, we efficiently obtain its column context <i>C</i> in Section 4.1 using unsupervised information, which is independent of specific CTA/CPA tasks. However, the retrieved context columns in <i>C</i> are not yet verified for their effectiveness in the specific CTA/CPA tasks. In this section, we propose REVEAL+, which incorporates a verification method to refine <i>C</i> by directly evaluating the effectiveness of its columns for the target <i>τ</i> for the annotation tasks. This refinement produces a verified column context <i>S</i>, which improves the annotation performance of REVEAL+ compared to REVEAL. We first formulate the column verification problem as a classification task and present the verification model design (Section 5.1). To further enhance efficiency, we propose a top-down verification inference technique to greedily identify <i>S</i> from <i>C</i> without exhaustively evaluating all subsets (Section 5.2).</div>
    <div class="zh" lang="zh-CN">给定表 <i>T</i> 中的目标 <i>τ</i>，第 4.1 节利用与具体 CTA/CPA 任务无关的无监督信息高效地得到了其列上下文 <i>C</i>。但 <i>C</i> 中检索到的上下文列，其在特定 CTA/CPA 任务上的有效性尚未得到验证。本节提出 REVEAL+，引入校验方法：通过直接评估 <i>C</i> 中各列对该目标 <i>τ</i> 的标注任务的有效性，来精化 <i>C</i>。这一精化产生「经校验的列上下文」<i>S</i>，使 REVEAL+ 的标注性能优于 REVEAL。我们首先把列校验问题形式化为分类任务，并给出校验模型的设计（第 5.1 节）；为进一步提升效率，我们提出自顶向下的校验推断技术，在不穷举所有子集的情况下以贪心方式从 <i>C</i> 中确定 <i>S</i>（第 5.2 节）。</div>
  </div>
<span id="s51"></span>

### 5.1 校验模型的形式化与设计

<div class="p">
    <div class="en" lang="en">During inference, given a table <i>T</i>, we aim to identify a verified column context <i>S</i> ⊆ <i>C</i> that is most effective for the target <i>τ</i>. A naive approach is to exhaustively evaluate all possible subsets of <i>C</i> using the trained prediction module component <i>f</i> (as shown in Figure 3(a)) and select the subset with the highest prediction confidence as <i>S</i>. However, prior research has demonstrated that model confidence is often poorly calibrated and does not reliably indicate prediction correctness [16], result in suboptimal or misleading decisions, as validated by experiments in Section 6.4. Moreover, exhausting all subsets is computationally expensive. On the other hand, we leverage the training and validation datasets with ground truth to train a lightweight verification model Π, which produces a quality score Π(<i>τ</i>, <i>S′</i>) to evaluate the quality of a subset <i>S′</i> ⊆ <i>C</i> as a verified column context for the target <i>τ</i>.</div>
    <div class="zh" lang="zh-CN">推断阶段，给定表 <i>T</i>，我们的目标是确定一个对目标 <i>τ</i> 最有效的经校验列上下文 <i>S</i> ⊆ <i>C</i>。一种朴素做法是用训练好的预测模块 <i>f</i>（见图 3(a)）穷举评估 <i>C</i> 的所有可能子集，取预测置信度最高的子集作为 <i>S</i>。然而既有研究表明，模型置信度往往校准不佳，并不能可靠指示预测是否正确 [16]，会导致次优甚至误导性的决策——这一点已由第 6.4 节的实验验证。此外，穷举所有子集在计算上代价高昂。另一方面，我们利用带真实标签的训练集与验证集，训练一个轻量级校验模型 Π，由它给出质量分数 Π(<i>τ</i>, <i>S′</i>)，以评估子集 <i>S′</i> ⊆ <i>C</i> 作为目标 <i>τ</i> 的经校验列上下文的质量。</div>
  </div>
  <div class="p">
    <div class="en" lang="en">Below, we formulate column context verification as a classification task. The formal column context verification problem is to find <i>S</i> that maximizes the quality score Π(<i>τ</i>, <i>S′</i>), as follows:</div>
    <div class="zh" lang="zh-CN">下面我们把列上下文校验形式化为分类任务。形式化的列上下文校验问题即寻找使质量分数 Π(<i>τ</i>, <i>S′</i>) 最大的 <i>S</i>，如下：</div>
  </div>
  <div class="box def">
    <div class="lbl">定义 5 · Definition 5 · 列上下文校验 Column Context Verification</div>
    <div class="p">
      <div class="en" lang="en">Given a table <i>T</i> with a target <i>τ</i> and its column context <i>C</i>, let 𝒮 = {<i>S′</i> | <i>S′</i> ⊆ <i>C</i>}. Column context verification aims to identify the subset <i>S</i> ∈ 𝒮 that maximizes the quality score, i.e.,</div>
      <div class="zh" lang="zh-CN">给定表 <i>T</i>、目标 <i>τ</i> 及其列上下文 <i>C</i>，令 𝒮 = {<i>S′</i> | <i>S′</i> ⊆ <i>C</i>}。列上下文校验旨在找出使质量分数最大的子集 <i>S</i> ∈ 𝒮，即：</div>
    </div>
    <div class="eq" style="margin-bottom:10px"><div><i>S</i> = argmax<sub>S′∈𝒮</sub> Π(<i>τ</i>, <i>S′</i>),</div><span class="num">(8)</span></div>
    <div class="p">
      <div class="en" lang="en">where Π evaluates the effectiveness of <i>S′</i> for annotating <i>τ</i>.</div>
      <div class="zh" lang="zh-CN">其中 Π 评估 <i>S′</i> 对标注 <i>τ</i> 的有效性。</div>
    </div>
  </div>
  <div class="p">
    <div class="en" lang="en">A key challenge in implementing the verification model Π is the lack of labeled training data. There are no predefined labels indicating whether a subset of columns <i>S′</i> is effective for annotating a target <i>τ</i>. Manually defining rules for labeling may not align with actual annotation performance and fails to account for the target-specific nature of context quality. Different targets within the same table often require distinct context columns, making the labeling process inherently complex and context-dependent. To address this, we propose to construct labeled data for Π using the training and validation datasets, as these datasets already contain ground truth labels. This approach ensures that the verification model Π is aligned with the trained prediction module <i>f</i> in Figure 3(a), as Π is trained using the predictions of <i>f</i> on these datasets.</div>
    <div class="zh" lang="zh-CN">实现校验模型 Π 的一个关键难题是缺少有标注的训练数据：并不存在预定义的标签来指示某个列子集 <i>S′</i> 对标注目标 <i>τ</i> 是否有效。人工定义标注规则可能与实际标注性能不一致，也无法体现「上下文质量依目标而异」这一性质——同一张表内不同目标常常需要不同的上下文列，这使标注过程本身就复杂且依赖于具体上下文。为此，我们提出利用训练集与验证集来为 Π 构造标注数据，因为这些数据集本身已含真实标签。该做法保证了校验模型 Π 与图 3(a) 中训练好的预测模块 <i>f</i> 保持一致——Π 正是用 <i>f</i> 在这些数据集上的预测训练出来的。</div>
  </div>
  <div class="p">
    <div class="en" lang="en"><b class="ri">Labeled Data for Verification Model.</b> Given a training or validation sample with a target <i>τ</i> in a table <i>T</i> and its retrieved column context <i>C</i>, we determine whether a subset <i>S′</i> ⊆ <i>C</i> enables the trained prediction module <i>f</i> to make a correct prediction for <i>τ</i>. Specifically, for each subset <i>S′</i>, we obtain the prediction <i>f</i>(<i>τ</i>, <i>S′</i>) via Equation (5), and compare it with the ground-truth label gt<sub><i>τ</i></sub>. This binary outcome (correct or incorrect prediction) serves as the label y<sup><i>τ</i></sup><sub><i>S′</i></sub> for training our verification model. Formally, as defined in Equation (9), if the prediction <i>f</i>(<i>τ</i>, <i>S′</i>) matches the ground truth gt<sub><i>τ</i></sub>, we label y<sup><i>τ</i></sup><sub><i>S′</i></sub> = 1 (positive, i.e., high quality); otherwise, we label y<sup><i>τ</i></sup><sub><i>S′</i></sub> = 0 (negative, i.e., low quality).</div>
    <div class="zh" lang="zh-CN"><b class="ri">校验模型的标注数据。</b>给定一条训练或验证样本：表 <i>T</i> 中的目标 <i>τ</i> 及其检索到的列上下文 <i>C</i>，我们判定子集 <i>S′</i> ⊆ <i>C</i> 是否能使训练好的预测模块 <i>f</i> 对 <i>τ</i> 给出正确预测。具体地，对每个子集 <i>S′</i>，由式 (5) 得到预测 <i>f</i>(<i>τ</i>, <i>S′</i>)，并与真实标签 gt<sub><i>τ</i></sub> 比较。这一二元结果（预测正确或错误）即作为标签 y<sup><i>τ</i></sup><sub><i>S′</i></sub>，用于训练校验模型。形式化地，如式 (9) 所定义：若 <i>f</i>(<i>τ</i>, <i>S′</i>) 与真实标签 gt<sub><i>τ</i></sub> 一致，则令 y<sup><i>τ</i></sup><sub><i>S′</i></sub> = 1（正例，即高质量）；否则令 y<sup><i>τ</i></sup><sub><i>S′</i></sub> = 0（负例，即低质量）。</div>
  </div>
  <div class="eq" tabindex="0" role="region" aria-label="公式"><div>y<sup><i>τ</i></sup><sub><i>S′</i></sub> = { 1, 若 <i>f</i>(<i>τ</i>, <i>S′</i>) = gt<sub><i>τ</i></sub>;&nbsp;&nbsp; 0, 其他情况。 }</div><span class="num">(9)</span></div>
  <div class="p">
    <div class="en" lang="en">To create the labeled data D<sup>v</sup><sub>train</sub> for the verification model, for each training and validation table <i>T</i> with target <i>τ</i>, ground truth gt<sub><i>τ</i></sub>, and column context <i>C</i>, we evaluate every subset <i>S′</i> ⊆ <i>C</i>. Using <i>f</i>, we compute the prediction <i>f</i>(<i>τ</i>, <i>S′</i>) and assign the label y<sup><i>τ</i></sup><sub><i>S′</i></sub> for <i>S′</i> based on Equation (9), resulting in a labeled sample (<i>τ</i>, <i>S′</i>, y<sup><i>τ</i></sup><sub><i>S′</i></sub>). Both training and validation datasets are used to construct D<sup>v</sup><sub>train</sub> for the following reasons. The prediction module <i>f</i>, trained on the training dataset, tends to produce mostly positive labels (y<sup><i>τ</i></sup><sub><i>S′</i></sub> = 1), which may lead to insufficient negative samples. In contrast, the validation dataset, unseen during <i>f</i> training, provides more negative examples (y<sup><i>τ</i></sup><sub><i>S′</i></sub> = 0), ensuring a balanced dataset for training Π. The construction of D<sup>v</sup><sub>train</sub> occurs after <i>f</i> is trained, ensuring no interference between their training processes. During inference, the trained Π is used to identify the verified column context <i>S</i>, which enhances the predictions of the trained <i>f</i>, as shown in Figure 3(b).</div>
    <div class="zh" lang="zh-CN">为构造校验模型的标注数据 D<sup>v</sup><sub>train</sub>，对每张「目标为 <i>τ</i>、真实标签为 gt<sub><i>τ</i></sub>、列上下文为 <i>C</i>」的训练表与验证表，我们评估 <i>C</i> 的每一个子集 <i>S′</i>：用 <i>f</i> 计算预测 <i>f</i>(<i>τ</i>, <i>S′</i>)，并按式 (9) 为 <i>S′</i> 赋予标签 y<sup><i>τ</i></sup><sub><i>S′</i></sub>，得到一个标注样本 (<i>τ</i>, <i>S′</i>, y<sup><i>τ</i></sup><sub><i>S′</i></sub>)。之所以同时使用训练集与验证集来构造 D<sup>v</sup><sub>train</sub>，原因如下：在训练集上训练出的预测模块 <i>f</i> 倾向于产出大量正标签（y<sup><i>τ</i></sup><sub><i>S′</i></sub> = 1），可能导致负样本不足；而在 <i>f</i> 训练过程中未见过的验证集，则能提供更多负例（y<sup><i>τ</i></sup><sub><i>S′</i></sub> = 0），从而保证用于训练 Π 的数据集类别均衡。D<sup>v</sup><sub>train</sub> 的构造发生在 <i>f</i> 训练完成之后，确保二者训练过程互不干扰。推断阶段，训练好的 Π 用于确定经校验列上下文 <i>S</i>，从而提升训练好的 <i>f</i> 的预测效果，如图 3(b) 所示。</div>
  </div>
  <div class="p">
    <div class="en" lang="en"><b class="ri">Verification Model Design.</b> The architecture of the verification model Π is designed to predict the label y<sup><i>τ</i></sup><sub><i>S′</i></sub> (0 or 1) for a given target <i>τ</i> in table <i>T</i> and a subset of columns <i>S′</i>. A simple implementation could treat Π as a binary classifier, outputting a single logit transformed by a sigmoid function to estimate Π(<i>τ</i>, <i>S′</i>), the probability that <i>f</i> correctly predicts <i>τ</i>’s label given context <i>S′</i>. However, as noted in [17], such an approach may lead to overconfident positive predictions, as it does not explicitly model the likelihood of negative outcomes. To address this, we implement Π as a lightweight multilayer perceptron (MLP) with an output layer producing two logits: one for the positive class and one for the negative class. The softmax probability of the positive class is used as the quality score. This design ensures that when the verification model is uncertain about a context, the logits for both classes are close, resulting in a softmax score near 0.5. Conversely, when the model is confident, the logits are skewed, yielding a score closer to 0 or 1.</div>
    <div class="zh" lang="zh-CN"><b class="ri">校验模型设计。</b>校验模型 Π 的架构用于对给定表 <i>T</i> 中的目标 <i>τ</i> 与列子集 <i>S′</i> 预测标签 y<sup><i>τ</i></sup><sub><i>S′</i></sub>（0 或 1）。一种简单实现是把 Π 视为二分类器，输出单个 logit 并经 sigmoid 变换来估计 Π(<i>τ</i>, <i>S′</i>)，即在给定上下文 <i>S′</i> 时 <i>f</i> 能正确预测 <i>τ</i> 标签的概率。但如 [17] 所指出的，这种做法可能产生过度自信的正例预测，因为它未显式建模负结果的可能性。为此，我们把 Π 实现为一个轻量级多层感知机（MLP），其输出层产生两个 logit：一个对应正类，一个对应负类；以正类的 softmax 概率作为质量分数。该设计保证：当校验模型对某上下文不确定时，两类 logit 接近，softmax 分数接近 0.5；反之当模型自信时，logit 偏斜，分数更接近 0 或 1。</div>
  </div>
  <div class="p">
    <div class="en" lang="en">We use the context-aware encoding technique from Section 4.2 to compute the embedding h<sup><i>τ</i></sup><sub><i>S′</i></sub> for the target <i>τ</i> given the subset <i>S′</i>. The MLP in the verification model then processes h<sup><i>τ</i></sup><sub><i>S′</i></sub> and outputs a two-dimensional logit vector z<sup><i>τ</i></sup><sub><i>S′</i></sub> ∈ ℝ², corresponding to the logits for the negative and positive classes:</div>
    <div class="zh" lang="zh-CN">我们用第 4.2 节的上下文感知编码技术，在给定子集 <i>S′</i> 时计算目标 <i>τ</i> 的嵌入 h<sup><i>τ</i></sup><sub><i>S′</i></sub>。校验模型中的 MLP 随后处理 h<sup><i>τ</i></sup><sub><i>S′</i></sub>，输出二维 logit 向量 z<sup><i>τ</i></sup><sub><i>S′</i></sub> ∈ ℝ²，分别对应负类与正类的 logit：</div>
  </div>
  <div class="eq" tabindex="0" role="region" aria-label="公式"><div><b>z</b><sup><i>τ</i></sup><sub><i>S′</i></sub> = MLP(h<sup><i>τ</i></sup><sub><i>S′</i></sub>).</div><span class="num">(10)</span></div>
  <div class="p">
    <div class="en" lang="en">The predicted quality score is then computed as the softmax probability of the positive class:</div>
    <div class="zh" lang="zh-CN">预测的质量分数随即取为正类的 softmax 概率：</div>
  </div>
  <div class="eq" tabindex="0" role="region" aria-label="公式"><div>Π(<i>τ</i>, <i>S′</i>) = e<sup>z<sub><i>τ</i>,<i>S′</i>,1</sub></sup> / Σ<sub>j=0..1</sub> e<sup>z<sub><i>τ</i>,<i>S′</i>,j</sub></sup>.</div><span class="num">(11)</span></div>
  <div class="p">
    <div class="en" lang="en">The loss function ℒ<sub>v</sub> for training the verification model is</div>
    <div class="zh" lang="zh-CN">训练校验模型的损失函数 ℒ<sub>v</sub> 为：</div>
  </div>
  <div class="eq" tabindex="0" role="region" aria-label="公式"><div>ℒ<sub>v</sub>(θ<sub>Π</sub>) = − Σ<sub>(<i>τ</i>,<i>S′</i>,y) ∈ D<sup>v</sup><sub>train</sub></sub> [ (1 − y) log(1 − Π(<i>τ</i>, <i>S′</i>)) + y log Π(<i>τ</i>, <i>S′</i>) ]</div><span class="num">(12)</span></div>
  <div class="p">
    <div class="en" lang="en">where θ<sub>Π</sub> represents the trainable parameters.</div>
    <div class="zh" lang="zh-CN">其中 θ<sub>Π</sub> 表示可训练参数。</div>
  </div>
<span id="s52"></span>

### 5.2 自顶向下校验推断

<div class="p">
    <div class="en" lang="en">After training the verification model Π in Section 5.1, we use it during inference to identify the verified column context <i>S</i> from <i>C</i> for the target <i>τ</i>. However, evaluating all 2<sup>|<i>C</i>|</sup> possible subsets of <i>C</i> is computationally prohibitive. Instead, we propose a top-down inference method to efficiently search for <i>S</i> in a greedy manner. The method starts with the full <i>C</i> and iteratively removes columns that are less informative to the target <i>τ</i>. This approach leverages the fact that the retrieved context columns in <i>C</i> from Section 4.1 are already high-quality, with only a few potentially noisy or irrelevant ones. Larger contexts generally provide richer semantic information, offering a more comprehensive understanding of the target. However, excessively small subsets may amplify the influence of individual misleading columns, degrading predictions. The top-down verification process makes greedy decisions and incorporates early stopping to balance efficiency and effectiveness.</div>
    <div class="zh" lang="zh-CN">在第 5.1 节训练好校验模型 Π 之后，我们在推断阶段用它为目标 <i>τ</i> 从 <i>C</i> 中确定经校验列上下文 <i>S</i>。然而评估 <i>C</i> 的全部 2<sup>|<i>C</i>|</sup> 个可能子集在计算上难以承受。为此，我们提出一种自顶向下推断方法，以贪心方式高效搜索 <i>S</i>：从完整的 <i>C</i> 出发，迭代地剔除以对目标 <i>τ</i> 信息量较少的列。该做法利用了这样一个事实——第 4.1 节检索出的 <i>C</i> 中上下文列本身已具高质量，其中只有少量可能带有噪声或无关。通常较大的上下文能提供更丰富的语义信息，对目标形成更全面的理解；但过小的子集可能放大个别误导性列的影响，损害预测。自顶向下的校验过程做出贪心决策并配合早停，以平衡效率与有效性。</div>
  </div>
  <div class="p">
    <div class="en" lang="en">Specifically, let <i>S</i><sup>(t)</sup> denote the verified column context obtained in the <i>t</i>-th iteration. The top-down inference starts from <i>S</i><sup>(t=0)</sup> = <i>C</i> of size |<i>C</i>| for the target <i>τ</i> in a table <i>T</i>. In the next (<i>t</i> + 1) iteration, we generate all subsets of <i>S</i><sup>(t)</sup> by removing a single column from it, i.e., <i>S′</i> ⊂ <i>S</i><sup>(t)</sup> with |<i>S′</i>| = |<i>S</i><sup>(t)</sup>| − 1. For all these subsets, we compute their quality scores Π(<i>τ</i>, <i>S′</i>) by Equations (10) and (11). We then select the subset <i>S′</i> with the highest quality score as the new verified column context <i>S</i><sup>(t+1)</sup>, to be used in the next iteration. The computation is formally described as:</div>
    <div class="zh" lang="zh-CN">具体地，令 <i>S</i><sup>(t)</sup> 表示第 <i>t</i> 轮得到的经校验列上下文。对于表 <i>T</i> 中的目标 <i>τ</i>，自顶向下推断从大小为 |<i>C</i>| 的 <i>S</i><sup>(t=0)</sup> = <i>C</i> 开始。在下一轮（第 <i>t</i> + 1 轮）中，我们通过从 <i>S</i><sup>(t)</sup> 中删去单列来生成其全部子集，即 <i>S′</i> ⊂ <i>S</i><sup>(t)</sup> 且 |<i>S′</i>| = |<i>S</i><sup>(t)</sup>| − 1。对所有这些子集，由式 (10)、(11) 计算质量分数 Π(<i>τ</i>, <i>S′</i>)，然后取质量分数最高的子集 <i>S′</i> 作为新的经校验列上下文 <i>S</i><sup>(t+1)</sup>，供下一轮使用。该计算形式化如下：</div>
  </div>
  <div class="eq" tabindex="0" role="region" aria-label="公式"><div><i>S</i><sup>(t+1)</sup> = argmax<sub>S′⊂S<sup>(t)</sup>, |S′| = |S<sup>(t)</sup>| − 1</sub> Π(<i>τ</i>, <i>S′</i>),</div><span class="num">(13)</span></div>
  <div class="p">
    <div class="en" lang="en">This greedy refinement process continues until the size of <i>S</i><sup>(t)</sup> reaches 1 or the following early stop condition is met: If the new verified column context <i>S</i><sup>(t+1)</sup> has a lower quality score than the previous one <i>S</i><sup>(t)</sup>, meaning that unlikely the new <i>S</i><sup>(t+1)</sup> can help to make better predictions for <i>τ</i>, and the subsequent iterations may not yield better results. In this case, we stop the refinement process and keep the current <i>S</i><sup>(t)</sup> as the final verified column context <i>S</i> for the input target <i>τ</i>. Formally, we check the following early-stop condition:</div>
    <div class="zh" lang="zh-CN">该贪心精化过程持续进行，直到 <i>S</i><sup>(t)</sup> 的大小降为 1，或满足如下早停条件：若新的经校验列上下文 <i>S</i><sup>(t+1)</sup> 的质量分数低于前一轮的 <i>S</i><sup>(t)</sup>——这意味着新的 <i>S</i><sup>(t+1)</sup> 不太可能帮助对 <i>τ</i> 做出更好预测，且后续轮次也未必能得到更好结果——此时我们终止精化，保留当前的 <i>S</i><sup>(t)</sup> 作为输入目标 <i>τ</i> 最终的经校验列上下文 <i>S</i>。形式化地，我们检查如下早停条件：</div>
  </div>
  <div class="eq" tabindex="0" role="region" aria-label="公式"><div>Π(<i>τ</i>, <i>S</i><sup>(t+1)</sup>) &lt; Π(<i>τ</i>, <i>S</i><sup>(t)</sup>).</div><span class="num">(14)</span></div>
  <div class="p">
    <div class="en" lang="en">This top-down inference technique reduces the search space from 2<sup>|<i>C</i>|</sup> to at most |<i>C</i>|² (in the worst case). In practice, it is much smaller due to early stopping.</div>
    <div class="zh" lang="zh-CN">该自顶向下推断技术把搜索空间从 2<sup>|<i>C</i>|</sup> 降至最坏情形下的 |<i>C</i>|²；实践中由于早停，实际规模要小得多。</div>
  </div>
  <div class="algo">
    <div class="abar">算法 2 · Algorithm 2 &nbsp;|&nbsp; Top-Down Inference for Verified Column Context 经校验列上下文的自顶向下推断</div>
<pre><span class="k">Input</span>: target <i>τ</i>, column context <i>C</i>, trained verification model Π
<span class="k">Output</span>: Verified column context <i>S</i>
1  <i>t</i> ← 0;
2  <i>S</i><sup>(t)</sup> ← <i>C</i>;
3  Get Π(<i>τ</i>, <i>S</i><sup>(t)</sup>) by Equations (10) and (11);
4  <span class="k">while</span> |<i>S</i><sup>(t)</sup>| &gt; 1 <span class="k">do</span>
5      𝒮 ← {<i>S′</i> ⊂ <i>S</i><sup>(t)</sup> | |<i>S′</i>| = |<i>S</i><sup>(t)</sup>| − 1};
6      <i>S</i><sup>(t+1)</sup> ← ∅;
7      Π(<i>τ</i>, <i>S</i><sup>(t+1)</sup>) ← −∞;
8      <span class="k">foreach</span> <i>S′</i> ∈ 𝒮 <span class="k">do</span>
9          Get Π(<i>τ</i>, <i>S′</i>) by Equations (10) and (11);
10         <span class="k">if</span> Π(<i>τ</i>, <i>S′</i>) &gt; Π(<i>τ</i>, <i>S</i><sup>(t+1)</sup>) <span class="k">then</span>
11             <i>S</i><sup>(t+1)</sup> ← <i>S′</i>;                    <span class="c">// 更新最优子集</span>
12             Π(<i>τ</i>, <i>S</i><sup>(t+1)</sup>) ← Π(<i>τ</i>, <i>S′</i>);       <span class="c">// 更新最优分数</span>
13     <span class="k">if</span> Π(<i>τ</i>, <i>S</i><sup>(t+1)</sup>) &lt; Π(<i>τ</i>, <i>S</i><sup>(t)</sup>) <span class="k">then</span>
14         <span class="k">break</span>;                            <span class="c">// 早停</span>
15     <i>t</i> ← <i>t</i> + 1;
16 <i>S</i> ← <i>S</i><sup>(t)</sup>;
17 <span class="k">return</span> <i>S</i>;</pre>
  </div>
  <div class="p">
    <div class="en" lang="en"><b class="ri">Algorithm.</b> Algorithm 2 summarizes the top-down inference process. In Lines 1-3, we initialize the verified column context <i>S</i><sup>(0)</sup> as <i>C</i> and compute its quality score using the verification model Π with Equations (10) and (11). In Lines 4-15, we iteratively refine the verified column context <i>S</i><sup>(t)</sup> by generating all subsets of size |<i>S</i><sup>(t)</sup>| − 1 and selecting the one with the highest quality score. The while loop terminates when the size of <i>S</i><sup>(t)</sup> reaches 1 or the early stop condition is met at Lines 13-14. In the <i>t</i>-th iteration, we generate all subsets of size |<i>S</i><sup>(t)</sup>| − 1 (Line 5), and initialize the best subset <i>S</i><sup>(t+1)</sup> as empty and its quality score as −∞ (Line 6-7). Then we iterate over all subsets <i>S′</i> in 𝒮 (Line 8) and compute their quality scores using the verification model Π (Line 9). If the current subset <i>S′</i> has higher Π(<i>τ</i>, <i>S′</i>) than the best subset <i>S</i><sup>(t+1)</sup> so far, we update the best subset <i>S</i><sup>(t+1)</sup> and its quality score to be the current subset <i>S′</i> and its quality score Π(<i>τ</i>, <i>S′</i>) (Line 10-12). Lines 13-14 check the early stop condition. If the new verified column context <i>S</i><sup>(t+1)</sup> has a lower quality score than the previous one <i>S</i><sup>(t)</sup>, we stop the process. Otherwise, we update the iteration index <i>t</i> and continue to the next iteration (Line 15). Finally, we return the verified column context <i>S</i> as the final output (Lines 16-17).</div>
    <div class="zh" lang="zh-CN"><b class="ri">算法说明。</b>算法 2 概述了自顶向下推断过程。第 1–3 行把经校验列上下文 <i>S</i><sup>(0)</sup> 初始化为 <i>C</i>，并用式 (10)、(11) 经校验模型 Π 计算其质量分数。第 4–15 行迭代精化 <i>S</i><sup>(t)</sup>：生成所有大小为 |<i>S</i><sup>(t)</sup>| − 1 的子集，并选取质量分数最高者。当 <i>S</i><sup>(t)</sup> 的大小降为 1，或在第 13–14 行满足早停条件时，while 循环终止。在第 <i>t</i> 轮中，先生成所有大小为 |<i>S</i><sup>(t)</sup>| − 1 的子集（第 5 行），并把最优子集 <i>S</i><sup>(t+1)</sup> 初始化为空、其质量分数初始化为 −∞（第 6–7 行）；然后遍历 𝒮 中所有子集 <i>S′</i>（第 8 行），用校验模型 Π 计算其质量分数（第 9 行）；若当前子集 <i>S′</i> 的 Π(<i>τ</i>, <i>S′</i>) 高于目前最优子集 <i>S</i><sup>(t+1)</sup>，则把最优子集更新为 <i>S′</i>、最优分数更新为 Π(<i>τ</i>, <i>S′</i>)（第 10–12 行）。第 13–14 行检查早停条件：若新的经校验列上下文 <i>S</i><sup>(t+1)</sup> 质量分数低于前一轮的 <i>S</i><sup>(t)</sup>，则终止过程；否则更新迭代序号 <i>t</i> 并继续下一轮（第 15 行）。最后返回经校验列上下文 <i>S</i> 作为最终输出（第 16–17 行）。</div>
  </div>
<span id="s53"></span>

### 5.3 训练流程

<div class="p">
    <div class="en" lang="en">We summarize the training process of REVEAL+ in Algorithm 3. Given a training set D<sub>train</sub>, we obtain the column contexts <i>C</i> for the targets using the retrieval algorithm in Section 4.1 (Line 1). Then we obtain the target-context pair training set D<sup>pair</sup><sub>train</sub> using Equation (6) (Line 2). As introduced in Section 4.2, this dataset includes pairs of target columns (or column pairs for CPA) and their retrieved context columns. Then, we train the prediction module <i>f</i> using D<sup>pair</sup><sub>train</sub> and the loss function ℒ(θ) defined in Equation (7) (Line 3). Once the prediction module <i>f</i> is trained, we construct the verification training set D<sup>v</sup><sub>train</sub> from D<sup>pair</sup><sub>train</sub> as described in Equation (9) (Line 4). This set consists of labeled context subsets based on whether they enable correct predictions by the trained prediction module. Finally, in Line 5, we train the verification model Π using D<sup>v</sup><sub>train</sub> with the binary cross-entropy loss ℒ<sub>v</sub>(θ<sub>Π</sub>) defined in Equation (12). The procedure concludes by returning the trained <i>f</i> and Π (Line 6). When Lines 4 and 5 are skipped, it is the training process of REVEAL, which only involves context retrieval and training the prediction module <i>f</i>. The inference processes of REVEAL and REVEAL+ have already been illustrated in Figure 3.</div>
    <div class="zh" lang="zh-CN">算法 3 汇总了 REVEAL+ 的训练流程。给定训练集 D<sub>train</sub>，先用第 4.1 节的检索算法为各目标得到列上下文 <i>C</i>（第 1 行）；再由式 (6) 得到目标—上下文配对训练集 D<sup>pair</sup><sub>train</sub>（第 2 行）。如第 4.2 节所述，该数据集由「目标列（CPA 中为列对）与其检索到的上下文列」构成。接着，用 D<sup>pair</sup><sub>train</sub> 与式 (7) 定义的损失 ℒ(θ) 训练预测模块 <i>f</i>（第 3 行）。预测模块 <i>f</i> 训练完成后，按式 (9) 从 D<sup>pair</sup><sub>train</sub> 构造校验训练集 D<sup>v</sup><sub>train</sub>（第 4 行）——该集合由带标签的上下文子集组成，标签取决于这些子集能否使训练好的预测模块做出正确预测。最后在第 5 行，用 D<sup>v</sup><sub>train</sub> 与式 (12) 定义的二元交叉熵损失 ℒ<sub>v</sub>(θ<sub>Π</sub>) 训练校验模型 Π。整个流程以返回训练好的 <i>f</i> 与 Π 结束（第 6 行）。若跳过第 4、5 行，即为 REVEAL 的训练过程，只涉及上下文检索与训练预测模块 <i>f</i>。REVEAL 与 REVEAL+ 的推断过程已在图 3 中示出。</div>
  </div>
  <div class="algo">
    <div class="abar">算法 3 · Algorithm 3 &nbsp;|&nbsp; REVEAL+ Training Procedure &nbsp;REVEAL+ 训练流程</div>
<pre><span class="k">Input</span>: training set D<sub>train</sub>, initialized prediction module <i>f</i> and verification model Π
<span class="k">Output</span>: trained prediction model <i>f</i>, verification model Π
1  Obtain column contexts <i>C</i> for training targets in D<sub>train</sub> by Algorithm 1;
2  Construct D<sup>pair</sup><sub>train</sub> from D<sub>train</sub> by Equation (6);
3  Train <i>f</i> on D<sup>pair</sup><sub>train</sub> using ℒ(θ) in Equation (7);
4  Construct D<sup>v</sup><sub>train</sub> from D<sup>pair</sup><sub>train</sub> by Equation (9);
5  Train Π on D<sup>v</sup><sub>train</sub> using ℒ<sub>v</sub>(θ<sub>Π</sub>) in Equation (12);
6  <span class="k">return</span> trained <i>f</i>, Π;</pre>
  </div>
<span id="s6"></span>

## 6 实验

<div class="p">
    <div class="en" lang="en">We conduct extensive experiments to evaluate our proposed methods, REVEAL and REVEAL+, on real-world datasets for both CTA and CPA tasks. The implementation is publicly available at: <a href="https://github.com/TommyDzh/REVEAL">https://github.com/TommyDzh/REVEAL</a>.</div>
    <div class="zh" lang="zh-CN">我们做了大量实验，在真实数据集上针对 CTA 与 CPA 两类任务评估所提出的 REVEAL 与 REVEAL+ 方法。实现代码已公开：<a href="https://github.com/TommyDzh/REVEAL">https://github.com/TommyDzh/REVEAL</a>。</div>
  </div>
<span id="s61"></span>

### 6.1 实验设置

<div class="p">
    <div class="en" lang="en"><b class="ri">Datasets.</b> We use six benchmark datasets with real-world tables, four for CTA (GitTablesDB, GitTablesSC, SOTAB-CTA, WikiTables-CTA) and two for CPA (SOTAB-CPA, WikiTables-CPA). Table 2 summarizes the dataset statistics. GitTablesDB and GitTablesSC are part of the SemTab 2022 benchmark [1], sourced form GitTables [18], and are both used for the CTA task. GitTablesDB columns are annotated with DBpedia properties, while GitTablesSC uses Schema.org properties. The tables in the two datasets are wide. For example, the average of columns per table in GitTablesDB is 12.1, with some tables having up to 193 columns.</div>
    <div class="zh" lang="zh-CN"><b class="ri">数据集。</b>我们使用六个含真实表格的基准数据集：四个用于 CTA（GitTablesDB、GitTablesSC、SOTAB-CTA、WikiTables-CTA），两个用于 CPA（SOTAB-CPA、WikiTables-CPA）。表 2 汇总了数据集统计信息。GitTablesDB 与 GitTablesSC 属 SemTab 2022 基准 [1]，源自 GitTables [18]，均用于 CTA 任务：GitTablesDB 的列以 DBpedia 属性标注，GitTablesSC 则使用 Schema.org 属性。这两个数据集的表都比较宽——例如 GitTablesDB 平均每表 12.1 列，部分表多达 193 列。</div>
  </div>
  <div class="p">
    <div class="en" lang="en">The SOTAB-CTA and SOTAB-CPA datasets are part of the WDC Schema.org Table Annotation Benchmark (SOTAB) [27], which targets the CTA and CPA tasks using 91 Schema.org types and 176 Schema.org relations, respectively. The number of columns in the tables in these datasets can be up to 31. The WikiTables-CTA and WikiTables-CPA datasets are based on the WikiTables corpus from Wikipedia and introduced by TURL [6]. They are used for CTA and CPA, respectively, with 255 DBpedia types and 121 DBpedia relations. Note that in these datasets, we uses all columns from the original tables. The average number of columns per table in WikiTables-CTA and WikiTables-CPA is not large, but the tables can still be wide with the average number of columns being 5.9 and 5.5, respectively.</div>
    <div class="zh" lang="zh-CN">SOTAB-CTA 与 SOTAB-CPA 属 WDC Schema.org 表格标注基准（SOTAB）[27]，分别以 91 个 Schema.org 类型与 176 个 Schema.org 关系面向 CTA 与 CPA 任务；这些数据集中的表最多可达 31 列。WikiTables-CTA 与 WikiTables-CPA 基于 Wikipedia 的 WikiTables 语料，由 TURL [6] 提出，分别用于 CTA 与 CPA，含 255 个 DBpedia 类型与 121 个 DBpedia 关系。需注意，这些数据集我们使用了原始表中的全部列。WikiTables-CTA 与 WikiTables-CPA 的平均每表列数并不大，但表仍然可能很宽，平均列数分别为 5.9 与 5.5。</div>
  </div>
  <div class="tbl">
    <div class="tcap"><b>表 2</b> 数据集统计信息。<span class="ten">Table 2: Dataset statistics.</span></div>
    <div class="scroll" tabindex="0" role="region" aria-label="可横向滚动的数据表格"><table>
      <thead><tr><th>Benchmark 基准</th><th># Tables 表数</th><th># Types 类型数</th><th>Total # Cols 总列数</th><th># Labeled Cols 标注列数</th><th>Min/Max/Avg Cols per Table 每表列数（最小/最大/平均）</th></tr></thead>
      <tbody>
        <tr><td>GitTablesDB</td><td class="num">3,737</td><td class="num">101</td><td class="num">45,304</td><td class="num">5,433</td><td class="num">1 / 193 / 12.1</td></tr>
        <tr><td>GitTablesSC</td><td class="num">2,853</td><td class="num">53</td><td class="num">34,148</td><td class="num">3,863</td><td class="num">1 / 150 / 12.0</td></tr>
        <tr><td>SOTAB-CTA</td><td class="num">24,275</td><td class="num">91</td><td class="num">195,543</td><td class="num">64,884</td><td class="num">3 / 30 / 8.1</td></tr>
        <tr><td>SOTAB-CPA</td><td class="num">20,686</td><td class="num">176</td><td class="num">196,831</td><td class="num">74,216</td><td class="num">3 / 31 / 9.5</td></tr>
        <tr><td>WikiTables-CTA</td><td class="num">406,706</td><td class="num">255</td><td class="num">2,393,027</td><td class="num">654,670</td><td class="num">1 / 99 / 5.9</td></tr>
        <tr><td>WikiTables-CPA</td><td class="num">55,970</td><td class="num">121</td><td class="num">306,265</td><td class="num">62,954</td><td class="num">2 / 38 / 5.5</td></tr>
      </tbody>
    </table></div>
  </div>
  <div class="p">
    <div class="en" lang="en"><b class="ri">Baselines.</b> We compare REVEAL and REVEAL+ against strong baselines, including six state-of-the-art models specifically designed for annotation tasks and two large language models (LLMs).</div>
    <div class="zh" lang="zh-CN"><b class="ri">基线方法。</b>我们把 REVEAL 与 REVEAL+ 与强基线对比，包括六个专为标注任务设计的最先进模型与两个大语言模型（LLM）。</div>
  </div>
  <div class="p">
    <div class="en" lang="en">• <b>TURL</b> [6] adapts the transformer architecture to better capture table structure. It is pretrained on a large-scale table corpus.</div>
    <div class="zh" lang="zh-CN">• <b>TURL</b> [6] 改造 Transformer 架构以更好地刻画表结构，并在大规模表格语料上预训练。</div>
  </div>
  <div class="p">
    <div class="en" lang="en">• <b>Sato</b> [47] uses table-level features and models pairwise dependencies between neighboring columns for column type predictions.</div>
    <div class="zh" lang="zh-CN">• <b>Sato</b> [47] 使用表级特征，并对相邻列之间的成对依赖关系建模以预测列类型。</div>
  </div>
  <div class="p">
    <div class="en" lang="en">• <b>Doduo</b> [39] introduces a serialization strategy for tables, enabling language models to effectively encode columns for annotation tasks. It is fine-tuned via multi-task training.</div>
    <div class="zh" lang="zh-CN">• <b>Doduo</b> [39] 提出表格序列化策略，使语言模型能为标注任务有效编码列，并通过多任务训练微调。</div>
  </div>
  <div class="p">
    <div class="en" lang="en">• <b>RECA</b> [40] utilizes named entity-based schema alignment to consider inter-table information.</div>
    <div class="zh" lang="zh-CN">• <b>RECA</b> [40] 利用基于命名实体的模式对齐来引入跨表信息。</div>
  </div>
  <div class="p">
    <div class="en" lang="en">• <b>Starmie</b> [14] develops a contrastive multi-column pretraining to enhance embeddings by incorporating semantics within tables.</div>
    <div class="zh" lang="zh-CN">• <b>Starmie</b> [14] 提出对比式多列预训练，通过引入表内语义来增强嵌入。</div>
  </div>
  <div class="p">
    <div class="en" lang="en">• <b>Watchog</b> [32] leverages contrastive learning on unlabeled table corpora to learn representations for table understanding tasks.</div>
    <div class="zh" lang="zh-CN">• <b>Watchog</b> [32] 在无标注表格语料上利用对比学习，为表格理解任务学习表示。</div>
  </div>
  <div class="p">
    <div class="en" lang="en">• <b>TableLlama</b> [48] is an open-source generalist model for a various table-based tasks. It fine-tunes LLMs on an extensive corpus of tables and associated tasks.</div>
    <div class="zh" lang="zh-CN">• <b>TableLlama</b> [48] 是面向各类表格任务的开源通用模型，在大规模表格语料及相关任务上对大模型做微调。</div>
  </div>
  <div class="p">
    <div class="en" lang="en">• <b>Qwen-Plus (0-shot / 5-shot)</b> [44] is an LLM with strong capabilities on NLP and table-based tasks. We evaluate both 0-shot and 5-shot in-context learning variants, following the setup in [25, 26].</div>
    <div class="zh" lang="zh-CN">• <b>Qwen-Plus（0-shot / 5-shot）</b> [44] 是在 NLP 与表格任务上能力较强的大模型。遵循 [25, 26] 的设置，我们评估 0-shot 与 5-shot 两种上下文学习变体。</div>
  </div>
  <div class="p">
    <div class="en" lang="en"><b class="ri">Evaluation Metrics.</b> For effectiveness, we adopt the standard evaluation metrics used in prior work [6, 18, 27] for CTA and CPA tasks, including Micro-F1 and Macro-F1, since the tasks are multi-class classification problems. Following prior work, we evaluate performance using ground-truth labels, without considering semantic hierarchies or specificity. A prediction is correct if it matches the ground truth. Micro-F1 is the weighted average of F1 scores of classes, where each class contributes proportionally to its number of samples. It reflects overall performance but is biased toward frequent classes. Macro-F1 is the unweighted average of F1 scores across all classes, treating each class equally. It is more sensitive to performance on rare or underrepresented classes. We perform 5-fold cross-validation on GitTablesDB and GitTablesSC following [32]. For the remaining datasets, we train and evaluate each model five times with different random seeds, except the LLM baselines that directly use task-specific prompts for predictions [48] as explained below. We report the mean and standard deviation of results over five runs.</div>
    <div class="zh" lang="zh-CN"><b class="ri">评价指标。</b>在有效性方面，我们采用以往工作 [6, 18, 27] 在 CTA 与 CPA 任务上使用的标准指标，包括 Micro-F1 与 Macro-F1——这两类任务属多分类问题。遵循以往工作，我们以真实标签评估性能，不考虑语义层级或具体程度：预测与真实标签一致即视为正确。Micro-F1 是各类 F1 分数的加权平均，每个类的权重与其样本数成正比，反映整体性能但对高频类有偏；Macro-F1 是各类 F1 分数的未加权平均，对每个类一视同仁，因而对稀有或欠代表类别的表现更敏感。遵循 [32]，我们在 GitTablesDB 与 GitTablesSC 上做 5 折交叉验证；对其余数据集，除下述直接使用任务提示进行预测的 LLM 基线外 [48]，我们对每个模型用不同随机种子训练并评估五次。我们报告五次运行的均值与标准差。</div>
  </div>
  <div class="p">
    <div class="en" lang="en"><b class="ri">Implementations.</b> For baselines, we obtain their publicly available codebases and adopt them for the CTA and CPA tasks. We adopt BERT as the base language model for Doduo, Starmie, RECA, TURL and Watchog to ensure a fair comparison. For LLM-based methods TableLlama and Qwen-Plus, we utilize task-specific prompts for CTA and CPA, following the prompt templates provided in [48], to generate predictions for column types and relations. We run the officially released TableLlama and access Qwen-Plus API for 0-shot and 5-shot in-context predictions. For 5-shot, demonstrations are randomly sampled from the training set for each test instance, following [25, 26].</div>
    <div class="zh" lang="zh-CN"><b class="ri">实现细节。</b>基线方面，我们获取其公开代码库并将其用于 CTA 与 CPA 任务。为保证公平比较，Doduo、Starmie、RECA、TURL 与 Watchog 统一采用 BERT 作为基础语言模型。对基于 LLM 的 TableLlama 与 Qwen-Plus，我们按 [48] 提供的提示模板，为 CTA 与 CPA 设计任务专属提示，用以生成列类型与关系的预测。我们运行官方发布的 TableLlama，并调用 Qwen-Plus API 完成 0-shot 与 5-shot 上下文预测；5-shot 时，遵循 [25, 26]，为每个测试实例从训练集中随机采样示例。</div>
  </div>
  <div class="p">
    <div class="en" lang="en">We implement our methods REVEAL and REVEAL+ in Python using PyTorch and the Transformer library [43]. The context-aware encoder is built on BERT as well. We use the Adam optimizer to train. The learning rate is set to 5e-5, the desired size of column context <i>K</i> is fixed at 8 across all datasets, and the maximum input sequence length is set to 256 tokens. For long columns, we follow prior work [32, 39] by allocating tokens equally across columns and truncating row-wise, using the earliest rows that fit within the token limit. We select the best model checkpoint based on the highest Micro-F1 or Macro-F1 score on validation data. For the verification model in REVEAL+, it is a three-layer MLP trained after the annotation model. We use a batch size of 64 for GitTablesDB and GitTablesSC, and 512 for the other datasets. The learning rate is tuned from {5e−5, 1e−4, 5e−4}. All experiments are conducted on a Linux server with an Intel Xeon Gold 6226R CPU with 2.90GHz and an NVIDIA RTX 3090 GPU.</div>
    <div class="zh" lang="zh-CN">我们用 Python、PyTorch 与 Transformer 库 [43] 实现 REVEAL 与 REVEAL+。上下文感知编码器同样构建在 BERT 之上，训练使用 Adam 优化器：学习率设为 5e-5，列上下文期望大小 <i>K</i> 在所有数据集上固定为 8，最大输入序列长度设为 256 个 token。对长列，遵循以往工作 [32, 39]，在各列之间均分 token，并按行截断——取能容纳于 token 上限的最早若干行。我们依据验证集上最高的 Micro-F1 或 Macro-F1 选择最佳模型检查点。REVEAL+ 中的校验模型是一个三层 MLP，在标注模型之后训练；GitTablesDB 与 GitTablesSC 的 batch size 为 64，其余数据集为 512，学习率在 {5e−5, 1e−4, 5e−4} 中调优。所有实验在配备 Intel Xeon Gold 6226R（2.90GHz）CPU 与一块 NVIDIA RTX 3090 GPU 的 Linux 服务器上完成。</div>
  </div>
<span id="s62"></span>

### 6.2 总体结果

<div class="tbl">
    <div class="tcap"><b>表 3</b> Micro-F1 (%) 与 Macro-F1 (%) 总体性能（均值 ± 标准差）。<span class="ten">Table 3: Overall performance by Micro-F1 (%) and Macro-F1 (%) (mean ± std).</span></div>
    <div class="scroll" tabindex="0" role="region" aria-label="可横向滚动的数据表格"><table style="font-size:11.8px">
      <thead>
        <tr><th rowspan="2">Method 方法</th><th colspan="2">GitTablesDB</th><th colspan="2">GitTablesSC</th><th colspan="2">SOTAB-CTA</th><th colspan="2">SOTAB-CPA</th><th colspan="2">WikiTables-CTA</th><th colspan="2">WikiTables-CPA</th><th rowspan="2">Avg. Rank 平均排名</th></tr>
        <tr><th>Mi-F1</th><th>Ma-F1</th><th>Mi-F1</th><th>Ma-F1</th><th>Mi-F1</th><th>Ma-F1</th><th>Mi-F1</th><th>Ma-F1</th><th>Mi-F1</th><th>Ma-F1</th><th>Mi-F1</th><th>Ma-F1</th></tr>
      </thead>
      <tbody>
        <tr><td>TURL</td><td class="num">48.20±0.98</td><td class="num">19.56±2.45</td><td class="num">58.15±0.98</td><td class="num">26.26±4.70</td><td class="num">80.13±0.25</td><td class="num">77.34±0.98</td><td class="num">66.11±0.31</td><td class="num">60.52±0.27</td><td class="num">90.53±0.07</td><td class="num">66.40±0.23</td><td class="num">89.60±0.03</td><td class="num">80.49±0.36</td><td class="num">7.42</td></tr>
        <tr><td>Sato</td><td class="num">46.05±0.87</td><td class="num">23.50±1.01</td><td class="num">55.83±0.34</td><td class="num">30.07±0.94</td><td class="num">71.74±0.25</td><td class="num">70.01±0.27</td><td class="num">54.06±0.15</td><td class="num">46.59±0.24</td><td class="num">61.56±0.84</td><td class="num">32.05±0.72</td><td class="num">77.09±0.15</td><td class="num">49.70±0.26</td><td class="num">8.33</td></tr>
        <tr><td>Doduo</td><td class="num">44.77±4.36</td><td class="num">21.63±3.26</td><td class="num">52.36±2.94</td><td class="num">25.09±5.01</td><td class="num">81.32±0.00</td><td class="num">78.51±0.00</td><td class="num">78.85±0.49</td><td class="num">74.95±0.49</td><td class="num">92.19±1.01</td><td class="num">74.10±0.86</td><td class="num">91.60±0.23</td><td class="num">83.81±0.15</td><td class="num">6.58</td></tr>
        <tr><td>Starmie</td><td class="num">54.43±0.93</td><td class="num">30.71±3.58</td><td class="num">64.87±2.47</td><td class="num">37.04±4.33</td><td class="num">87.95±0.27</td><td class="num">86.84±0.08</td><td class="num">78.92±0.13</td><td class="num">75.69±0.31</td><td class="num">92.91±0.08</td><td class="num">76.45±0.44</td><td class="num">92.51±0.36</td><td class="num">85.69±0.47</td><td class="num">3.50</td></tr>
        <tr><td>RECA</td><td class="num">53.83±1.67</td><td class="num">25.70±5.49</td><td class="num">64.52±1.69</td><td class="num">35.10±3.81</td><td class="num">68.52±0.35</td><td class="num">68.21±0.71</td><td class="num">54.31±0.99</td><td class="num">47.56±0.95</td><td class="num">91.27±0.03</td><td class="num">73.36±0.82</td><td class="num">88.90±0.94</td><td class="num">78.39±1.09</td><td class="num">7.17</td></tr>
        <tr><td>Watchog</td><td class="num">53.96±0.78</td><td class="num">28.89±3.34</td><td class="num">65.24±1.90</td><td class="num">36.06±3.39</td><td class="num">86.23±0.22</td><td class="num">84.19±0.06</td><td class="num">76.52±0.11</td><td class="num">72.60±0.25</td><td class="num">92.25±0.06</td><td class="num">73.77±0.35</td><td class="num">92.28±0.00</td><td class="num">85.27±0.25</td><td class="num">4.75</td></tr>
        <tr><td>Qwen-Plus (0-shot)</td><td class="num">53.51±0.60</td><td class="num">27.75±1.81</td><td class="num">66.80±1.82</td><td class="num">40.35±2.43</td><td class="num">48.26</td><td class="num">44.36</td><td class="num">52.68</td><td class="num">44.01</td><td class="num">31.70</td><td class="num">12.28</td><td class="num">27.63</td><td class="num">18.13</td><td class="num">8.67</td></tr>
        <tr><td>Qwen-Plus (5-shot)</td><td class="num">57.48±1.20</td><td class="num">33.66±1.57</td><td class="num">63.21±1.24</td><td class="num">44.81±2.60</td><td class="num">52.61</td><td class="num">48.82</td><td class="num">53.48</td><td class="num">45.41</td><td class="num">32.21</td><td class="num">13.01</td><td class="num">28.18</td><td class="num">18.35</td><td class="num">7.58</td></tr>
        <tr><td>TableLlama</td><td class="num">11.03±0.74</td><td class="num">9.70±1.53</td><td class="num">12.85±0.91</td><td class="num">11.71±1.62</td><td class="num">23.35</td><td class="num">20.59</td><td class="num">16.96</td><td class="num">13.81</td><td class="num">91.85</td><td class="num">76.04</td><td class="num">92.12</td><td class="num">85.67</td><td class="num">8.92</td></tr>
        <tr class="ours"><td>REVEAL</td><td class="num">59.79±0.98</td><td class="num">36.40±3.17</td><td class="num">69.26±0.93</td><td class="num">41.98±1.96</td><td class="num">88.35</td><td class="num">87.60</td><td class="num">80.45±0.25</td><td class="num">77.81±0.24</td><td class="num">93.14±0.51</td><td class="num">77.81±0.43</td><td class="num">92.76±0.11</td><td class="num">86.40±0.07</td><td class="num">2.00</td></tr>
        <tr class="ours"><td>REVEAL+</td><td class="num">61.53±2.27</td><td class="num">38.30±1.16</td><td class="num">70.90±2.18</td><td class="num">45.82±1.16</td><td class="num">88.74±0.22</td><td class="num">88.10±0.06</td><td class="num">80.81±0.07</td><td class="num">78.15±0.15</td><td class="num">93.00±0.04</td><td class="num">78.07±0.22</td><td class="num">92.80±0.18</td><td class="num">86.81±0.23</td><td class="num">1.08</td></tr>
      </tbody>
    </table></div>
    <div class="tcap" style="margin-top:8px;font-size:11.8px;color:var(--ink3)">说明：原文以加粗、下划线、双下划线标出前三名；本译本以浅蓝底突出本文方法（数值保持原样）。Mi-F1 = Micro-F1，Ma-F1 = Macro-F1。</div>
  </div>
  <div class="p">
    <div class="en" lang="en">Table 3 reports the overall performance of REVEAL and REVEAL+ compared to all baselines across all benchmark datasets. The best, second, and third performing methods are highlighted in bold, underlined, and double-underlined, respectively. The overall observation is that REVEAL and REVEAL+ consistently outperform all baselines across all datasets under both metrics, demonstrating the effectiveness of our proposed techniques for CTA and CPA tasks. REVEAL+ and REVEAL achieve the average rank of 1.08 and 2.0, respectively, indicating their superior performance compared to the other methods. Especially on the datasets with wide tables with large average columns per table (GitTablesDB, GitTablesSC, SOTAB-CTA, and SOTAB-CPA), REVEAL and REVEAL+ achieve significant improvements over the best baselines in Micro-F1 and Macro-F1 metrics. For example, on GitTablesDB, REVEAL+ achieves 4.05% and 4.64% improvement in Micro-F1 and Macro-F1 over the best baseline Qwen-Plus (5-shot), and REVEAL also achieves significant improvements of 2.31% and 2.74% in Micro-F1 and Macro-F1. On SOTAB-CPA, REVEAL+ and REVEAL achieve significant improvements as well. REVEAL+ improves Macro-F1 by 2.46% and REVEAL by 2.12% over the best baseline Starmie. On WikiTables-CTA and WikiTables-CPA, where the average number of columns per table is not large, baselines perform well, but REVEAL and REVEAL+ still outperform all baselines. The overall results demonstrate the effectiveness of our proposed retrieval, context-aware encoding, and verification techniques in Sections 4.1, 4.2 and 5, to select high-quality context columns for accurate CTA and CPA tasks, especially in handling wide tables.</div>
    <div class="zh" lang="zh-CN">表 3 给出了 REVEAL 与 REVEAL+ 在所有基准数据集上相对全部基线的总体性能；原文中性能最好、次好、第三的方法分别以加粗、下划线、双下划线标出。总体观察是：在两个指标下，REVEAL 与 REVEAL+ 在所有数据集上均稳定优于全部基线，说明我们所提技术对 CTA 与 CPA 任务确实有效。REVEAL+ 与 REVEAL 的平均排名分别为 1.08 与 2.0，表明二者相对其他方法性能更优。特别是在平均每表列数较大的宽表数据集（GitTablesDB、GitTablesSC、SOTAB-CTA、SOTAB-CPA）上，REVEAL 与 REVEAL+ 在 Micro-F1 与 Macro-F1 上相对最佳基线均有显著提升。例如在 GitTablesDB 上，REVEAL+ 相对最佳基线 Qwen-Plus (5-shot) 在 Micro-F1 与 Macro-F1 上分别提升 4.05% 与 4.64%，REVEAL 也分别取得 2.31% 与 2.74% 的显著提升。在 SOTAB-CPA 上，REVEAL+ 与 REVEAL 同样取得显著提升：相对最佳基线 Starmie，REVEAL+ 的 Macro-F1 提升 2.46%，REVEAL 提升 2.12%。在平均每表列数不大的 WikiTables-CTA 与 WikiTables-CPA 上，基线本身表现就不错，但 REVEAL 与 REVEAL+ 仍优于全部基线。总体结果验证了第 4.1、4.2 与 5 节所提出的检索、上下文感知编码与校验技术在「为精确的 CTA 与 CPA 任务选取高质量上下文列」上的有效性，尤其是在处理宽表时。</div>
  </div>
  <div class="p">
    <div class="en" lang="en">Moreover, observe that REVEAL+ consistently outperforms REVEAL across almost all datasets under Micro-F1 and Macro-F1, except WikiTables-CTA where REVEAL performs slightly better in Micro-F1. The average rank of REVEAL+ is 1.08. The improvement of REVEAL+ over REVEAL is particularly significant in Macro-F1, which treats majority and minority classes equally. For example, on GitTablesDB and GitTablesSC, REVEAL+ improves Macro-F1 by 1.90% and 3.84%, respectively. This indicates the verification model in Section 5 is effective in refining the retrieved context columns and improving the performance. Besides, among the baselines, Starmie performs the best, with average rank of 3.5, and it adopts contrastive pretraining to capture column semantics. The baselines designed for annotation tasks, e.g., Watchog and Doduo, typically achieve better performance than the LLM-based methods. This indicates that specific techniques need to be designed for table annotation tasks. The LLMs yield unstable performance across datasets. Qwen-Plus (0-shot) and (5-shot) perform well on GitTablesDB and GitTablesSC, but they are significantly worse on the other four datasets, with average ranks of 8.67 and 7.58, respectively; TableLlama achieves strong results in WikiTables-CTA and WikiTables-CPA but fails in the other four datasets, resulting in rank of 8.92. This inconsistency may depend on if similar table corpus were seen during its pretraining or not. These results suggest that table annotation tasks remain challenging and cannot be totally solved by LLMs alone.</div>
    <div class="zh" lang="zh-CN">此外还可观察到：在 Micro-F1 与 Macro-F1 两个指标下，REVEAL+ 在几乎所有数据集上都稳定优于 REVEAL，唯一例外是 WikiTables-CTA——在那里 REVEAL 的 Micro-F1 略高。REVEAL+ 的平均排名为 1.08。REVEAL+ 相对 REVEAL 的提升在 Macro-F1 上尤为显著，而 Macro-F1 对多数类与少数类一视同仁。例如在 GitTablesDB 与 GitTablesSC 上，REVEAL+ 的 Macro-F1 分别提升 1.90% 与 3.84%。这说明第 5 节的校验模型能有效精化检索到的上下文列并提升性能。另外，基线中 Starmie 表现最好（平均排名 3.5），它采用对比预训练来刻画列语义；为标注任务专门设计的基线（如 Watchog、Doduo）通常优于基于 LLM 的方法，这说明表格标注任务需要专门设计的技术。LLM 在不同数据集上表现不稳定：Qwen-Plus（0-shot）与（5-shot）在 GitTablesDB 与 GitTablesSC 上表现良好，但在其余四个数据集上明显更差，平均排名分别为 8.67 与 7.58；TableLlama 在 WikiTables-CTA 与 WikiTables-CPA 上结果很强，却在其余四个数据集上失败，排名 8.92。这种不一致可能取决于其预训练时是否见过相似的表格语料。这些结果表明，表格标注任务仍具挑战性，无法仅靠 LLM 单独解决。</div>
  </div>
  <div class="p">
    <div class="en" lang="en">Moreover, we report that REVEAL+ obtains a subset of columns for 88.91% of tables in GitTablesDB, 84.25% in GitTablesSC, 93.44% in SOTAB-CTA, 76.99% in SOTAB-CPA, 25.00% in WikiTables-CTA, and 35.81% in WikiTables-CPA. This demonstrates that our retrieval and verification techniques (Sections 4 and 5) effectively identify relevant context columns for most targets. Although WikiTables-CTA and WikiTables-CPA have narrower tables (Table 2), our approach still refines context for a significant portion of tables.</div>
    <div class="zh" lang="zh-CN">此外我们统计到，REVEAL+ 在 GitTablesDB 中 88.91% 的表、GitTablesSC 中 84.25%、SOTAB-CTA 中 93.44%、SOTAB-CPA 中 76.99%、WikiTables-CTA 中 25.00%、WikiTables-CPA 中 35.81% 的表上最终得到了列子集（即 <i>S</i> 严格小于 <i>C</i>）。这表明我们的检索与校验技术（第 4、5 节）能为大多数目标有效识别出相关上下文列。尽管 WikiTables-CTA 与 WikiTables-CPA 的表更窄（表 2），我们的方法仍对相当一部分表完成了上下文精化。</div>
  </div>
  <div class="p">
    <div class="en" lang="en"><b class="ri">Performance on Tables with Different Column Numbers.</b> We further analyze the performance of REVEAL and REVEAL+ on tables with different column numbers, in groups of 1-4, 5-8, 9-12, 13-16, and 17+ columns, as shown in Figure 5. Observe that the baselines tend to have significant performance drop on tables with many columns, especially on wide tables with more than 16 columns, e.g., Starmie on GitTablesDB and GitTablesSC, and Watchog on WikiTables-CTA and WikiTables-CPA. This is likely due to the increased complexity and noise introduced by irrelevant or redundant columns, which can hinder the model’s ability to focus on the most informative features for annotation tasks. In contrast, REVEAL and REVEAL+ maintain relatively stable performance when the number of columns increases, especially when the number of columns exceeds 16 on GitTablesDB, GitTablesSC, WikiTables-CTA and WikiTables-CPA.</div>
    <div class="zh" lang="zh-CN"><b class="ri">不同列数表上的性能。</b>我们进一步按列数分组（1–4、5–8、9–12、13–16、17+ 列）分析 REVEAL 与 REVEAL+ 的性能，见图 5。可以看到，基线在多列表上往往出现明显性能下降，尤其是在列数超过 16 的宽表上，例如 Starmie 在 GitTablesDB 与 GitTablesSC 上、Watchog 在 WikiTables-CTA 与 WikiTables-CPA 上。这很可能是因为无关列或冗余列带来了更高的复杂度与噪声，妨碍模型聚焦于对标注任务最有信息量的特征。相反，随着列数增加，REVEAL 与 REVEAL+ 的性能保持相对稳定，在 GitTablesDB、GitTablesSC、WikiTables-CTA 与 WikiTables-CPA 上列数超过 16 时尤其如此。</div>
  </div>
  <figure class="fig" id="fig5">
    <div class="pic"><img src="/images/reveal-translation/fig5.png" width="1411" height="279" alt="图 5 从少量列到大量列的表上的性能表现。" loading="lazy" decoding="async"></div>
    <div class="figcap"><b>图 5</b> 从少量列到大量列的表上的性能表现。
    <span class="ten">Figure 5: Performance on tables with a small to large number of columns.</span></div>
  </figure>
  <div class="p">
    <div class="en" lang="en">Furthermore, in GitTablesDB and GitTablesSC, there are 21 and 8 targets in tables with 100+ columns, respectively. In Table 4, we report the performance on these extremely wide tables. Note that a small sample size may make performance sensitive to incorrect predictions. Nevertheless, REVEAL+ consistently performs the best, followed by REVEAL. The observations validate the proposed techniques in Sections 4.1 and 5, to explicitly select the most informative context columns for CTA and CPA tasks, which helps mitigate the noise introduced by irrelevant columns. This leads to more robust performance of REVEAL+ and REVEAL across different table sizes.</div>
    <div class="zh" lang="zh-CN">此外，GitTablesDB 与 GitTablesSC 中分别有 21 个与 8 个位于「100+ 列」表中的目标。表 4 报告了在这些极端宽表上的性能。需注意样本量较小会使性能对个别错误预测较为敏感。尽管如此，REVEAL+ 仍然稳定表现最好，REVEAL 紧随其后。这些观察验证了第 4.1 与 5 节所提技术——显式选取对 CTA 与 CPA 任务最有信息量的上下文列——有助于减轻无关列带来的噪声，从而使 REVEAL+ 与 REVEAL 在不同表规模下表现更稳健。</div>
  </div>
  <div class="tbl">
    <div class="tcap"><b>表 4</b> 列数超过 100 的表上的准确率（%）。<span class="ten">Table 4: Accuracy (%) on tables with more than 100 columns.</span></div>
    <div class="scroll" tabindex="0" role="region" aria-label="可横向滚动的数据表格"><table>
      <thead><tr><th>Dataset 数据集</th><th>Starmie</th><th>RECA</th><th>Watchog</th><th>REVEAL</th><th>REVEAL+</th></tr></thead>
      <tbody>
        <tr><td>GitTablesDB</td><td class="num">28.6</td><td class="num">47.6</td><td class="num">42.7</td><td class="num">52.4</td><td class="num">66.7</td></tr>
        <tr><td>GitTablesSC</td><td class="num">25.0</td><td class="num">62.5</td><td class="num">37.5</td><td class="num">62.5</td><td class="num">62.5</td></tr>
      </tbody>
    </table></div>
  </div>
<span id="s63"></span>

### 6.3 效率分析

<div class="p">
    <div class="en" lang="en">Figure 6 reports the inference time of REVEAL and REVEAL+ compared to other baselines. First, observe that REVEAL ranks top among the methods across all datasets, with the fastest inference time on SOTAB-CTA and SOTAB-CPA and similar efficiency as Doduo on the other datasets. The efficiency of REVEAL is attributed to its retrieval-based approach, which avoids the need for full-table input. More importantly, as shown in Table 3, REVEAL achieves better quality than existing methods for the annotation tasks. This indicates that REVEAL can achieve high-quality annotation with a more efficient inference process. Second, REVEAL+ incurs additional inference time due to running the verification model to further refine the column context, in order to further boost effectiveness over REVEAL. But still, the efficiency of REVEAL+ is moderate among all methods, substantially faster than RECA, Sato and TableLlama. As shown in Table 3, REVEAL+ achieves the top-1 performance on almost all settings, significantly improving the performance of REVEAL. As mentioned, in the CTA and CPA tasks, result quality is relatively more important since the inference can be done offline and time is not a critical factor. Therefore, REVEAL+ serves as a good trade-off for effectiveness over efficiency.</div>
    <div class="zh" lang="zh-CN">图 6 报告了 REVEAL 与 REVEAL+ 相对其他基线的推断时间。首先可以看到，REVEAL 在所有数据集上都名列前茅：在 SOTAB-CTA 与 SOTAB-CPA 上推断最快，在其他数据集上与 Doduo 效率相当。REVEAL 的高效得益于其基于检索的做法——它无需输入整张表。更重要的是，如表 3 所示，REVEAL 在标注任务上的质量优于现有方法，这说明 REVEAL 能以更高效的推断过程取得高质量标注。其次，REVEAL+ 因需运行校验模型进一步精化列上下文而增加了推断时间，以在有效性上进一步超越 REVEAL；不过 REVEAL+ 的效率在所有方法中仍属中上，远快于 RECA、Sato 与 TableLlama。如表 3 所示，REVEAL+ 在几乎所有设置上都取得第一名的性能，显著提升了 REVEAL 的表现。如前所述，在 CTA 与 CPA 任务中结果质量相对更重要，因为推断可以离线完成、时间并非关键因素。因此 REVEAL+ 是在有效性上换取效率的一个良好折中。</div>
  </div>
  <figure class="fig" id="fig6">
    <div class="pic"><img src="/images/reveal-translation/fig6.png" width="709" height="471" alt="图 6 推断时间对比（对数坐标）。" loading="lazy" decoding="async"></div>
    <div class="figcap"><b>图 6</b> 推断时间对比（对数坐标）。
    <span class="ten">Figure 6: Inference time comparison.</span></div>
  </figure>
  <div class="p">
    <div class="en" lang="en"><b class="ri">Top-Down Verification Inference vs. Exhaustive Verification.</b> We evaluate the greedy top-down verification inference designed in Section 5.2 against exhaustive verification, which evaluates all possible context subsets <i>S′</i> to get <i>S</i>, in terms of both accuracy and efficiency, in Figure 7. The left figure shows that the top-down strategy achieves nearly the same Macro-F1 as exhaustive search, indicating that it effectively finds the high-quality verified column context. The right figure shows that the top-down verification inference is significantly more efficient than exhaustive search. For example, on SOTAB-CPA, the top-down strategy reduces inference time from 5263s to 778s, achieving over 6x speedup while maintaining accuracy. Figure 7 demonstrates the effectiveness and efficiency of the proposed top-down verification inference technique.</div>
    <div class="zh" lang="zh-CN"><b class="ri">自顶向下校验推断 vs. 穷举校验。</b>我们在准确性与效率两方面，把第 5.2 节设计的贪心自顶向下校验推断与「穷举校验」（评估全部可能的上下文子集 <i>S′</i> 以得到 <i>S</i>）做对比，结果见图 7。左图显示自顶向下策略的 Macro-F1 与穷举搜索几乎相同，说明它能有效找到高质量的经校验列上下文；右图显示自顶向下校验推断显著比穷举搜索更高效。例如在 SOTAB-CPA 上，自顶向下策略把推断时间从 5263 秒降到 778 秒，在保持准确率的同时取得 6 倍以上加速。图 7 验证了所提自顶向下校验推断技术的有效性与高效性。</div>
  </div>
  <figure class="fig" id="fig7">
    <div class="pic"><img src="/images/reveal-translation/fig7.png" width="659" height="335" alt="图 7 自顶向下推断策略与穷举搜索在准确率（Macro-F1）与推断效率上的对比。" loading="lazy" decoding="async"></div>
    <div class="figcap"><b>图 7</b> 自顶向下推断策略与穷举搜索在准确率（Macro-F1）与推断效率上的对比。
    <span class="ten">Figure 7: Comparison between the Top-Down inference strategy and Exhaustive search in terms of accuracy (Macro-F1) and inference efficiency.</span></div>
  </figure>
<span id="s64"></span>

### 6.4 实验分析

<div class="p">
    <div class="en" lang="en"><b class="ri">Varying K of Column Context Size.</b> In the retrieval method, we retrieve a column context of <i>K</i> columns for a target in a table. We evaluate the impact of varying <i>K</i> in {0, 2, 4, 8, 16} on the performance of REVEAL and REVEAL+, as reported in Figure 8. Observe that the performance of both REVEAL and REVEAL+ improves as <i>K</i> increases to 8 on all datasets, except GitTablesSC with a little fluctuation. Then the performance becomes stable with further increase of <i>K</i> to 16. Observe that at the same <i>K</i> value, REVEAL+ outperforms REVEAL, demonstrating the effectiveness of the verification techniques in Section 5. Figure 8 shows that using few columns with a small <i>K</i> may omit critical context, while increasing <i>K</i> beyond a moderate value yields diminishing returns. Therefore, we set <i>K</i> = 8 by default.</div>
    <div class="zh" lang="zh-CN"><b class="ri">变化列上下文大小 <i>K</i>。</b>在检索方法中，我们为表中的目标检索 <i>K</i> 列的列上下文。我们评估 <i>K</i> 在 {0, 2, 4, 8, 16} 中变化时对 REVEAL 与 REVEAL+ 性能的影响，结果见图 8。可以看到，在所有数据集上，<i>K</i> 增至 8 时 REVEAL 与 REVEAL+ 的性能均在提升（GitTablesSC 略有波动）；<i>K</i> 继续增至 16 时性能趋于稳定。同时可见在相同 <i>K</i> 下 REVEAL+ 优于 REVEAL，说明第 5 节校验技术有效。图 8 还表明：<i>K</i> 太小（列太少）会遗漏关键上下文，而 <i>K</i> 超过适度值后收益递减。因此我们默认取 <i>K</i> = 8。</div>
  </div>
  <figure class="fig" id="fig8">
    <div class="pic"><img src="/images/reveal-translation/fig8.png" width="515" height="342" alt="REVEAL 论文图 8" loading="lazy" decoding="async"></div>
    <div class="figcap" style="border-left-color:var(--warm)"><b style="color:var(--warm)">图 8</b>变化 <i>K</i> 的影响。
    <span class="ten">Figure 8: Vary K.</span></div>
  </figure>
  <div class="tbl">
    <div class="tcap"><b>表 5</b> Macro-F1 (%) 上的消融研究。<span class="ten">Table 5: Ablation study in Macro-F1 (%).</span></div>
    <div class="scroll" tabindex="0" role="region" aria-label="可横向滚动的数据表格"><table>
      <thead><tr><th>Variant 变体</th><th>GitTablesDB</th><th>GitTablesSC</th><th>SOTAB-CTA</th><th>SOTAB-CPA</th></tr></thead>
      <tbody>
        <tr><td>w/o encoding 无额外编码</td><td class="num">30.69</td><td class="num">39.22</td><td class="num">87.05</td><td class="num">77.48</td></tr>
        <tr><td>TURL encoding 采用 TURL 编码</td><td class="num">27.22</td><td class="num">37.98</td><td class="num">86.89</td><td class="num">76.98</td></tr>
        <tr class="ours"><td>context-aware encoding 上下文感知编码</td><td class="num">36.40</td><td class="num">41.98</td><td class="num">87.60</td><td class="num">77.81</td></tr>
      </tbody>
    </table></div>
  </div>
  <div class="p">
    <div class="en" lang="en"><b class="ri">Ablation on Context-aware Encoding.</b> We conduct an ablation study on the context-aware encoding in Section 4.2 by comparing REVEAL with and without the encoding, as well as with TURL encoding [6]. In Table 5, our proposed context-aware encoding achieves the best performance across all datasets. For example, on GitTablesDB, REVEAL with context-aware encoding improves Macro-F1 from 30.69% (without encoding) to 36.40% and also outperforms TURL encoding by a large margin. These results demonstrate the effectiveness of distinguishing context columns from target columns during encoding, as designed in Section 4.2.</div>
    <div class="zh" lang="zh-CN"><b class="ri">上下文感知编码的消融。</b>我们对第 4.2 节的上下文感知编码做消融研究：比较 REVEAL 有/无该编码，以及采用 TURL 编码 [6] 的情形。表 5 中，我们所提的上下文感知编码在所有数据集上表现最好。例如在 GitTablesDB 上，带上下文感知编码的 REVEAL 把 Macro-F1 从 30.69%（无编码）提升到 36.40%，并大幅优于 TURL 编码。这些结果说明，如第 4.2 节所设计，在编码阶段区分上下文列与目标列是有效的。</div>
  </div>
  <div class="tbl">
    <div class="tcap"><b>表 6</b> 检索方法与其他策略对比（Micro-F1）。<span class="ten">Table 6: Retrieval method vs. other strategies. Micro-F1</span></div>
    <div class="scroll" tabindex="0" role="region" aria-label="可横向滚动的数据表格"><table>
      <thead><tr><th>Strategy 策略</th><th>GitTablesDB</th><th>GitTablesSC</th><th>SOTAB-CTA</th><th>SOTAB-CPA</th><th>Avg. Rank 平均排名</th></tr></thead>
      <tbody>
        <tr><td>Random 随机</td><td class="num">58.57</td><td class="num">67.52</td><td class="num">88.02</td><td class="num">79.56</td><td class="num">4.75</td></tr>
        <tr><td>First 取最前 K 列</td><td class="num">60.13</td><td class="num">68.25</td><td class="num">87.55</td><td class="num">79.68</td><td class="num">4.25</td></tr>
        <tr><td>Nearby 邻近列</td><td class="num">60.18</td><td class="num">68.85</td><td class="num">88.28</td><td class="num">80.78</td><td class="num">2.75</td></tr>
        <tr><td>Similar 最相似列</td><td class="num">58.47</td><td class="num">67.86</td><td class="num">87.87</td><td class="num">81.19</td><td class="num">4.0</td></tr>
        <tr><td>Position 位置启发式</td><td class="num">60.40</td><td class="num">69.24</td><td class="num">87.51</td><td class="num">78.07</td><td class="num">4.0</td></tr>
        <tr class="ours"><td>Ours 本文方法</td><td class="num">61.53</td><td class="num">70.9</td><td class="num">88.74</td><td class="num">80.81</td><td class="num">1.25</td></tr>
      </tbody>
    </table></div>
  </div>
  <div class="p">
    <div class="en" lang="en"><b class="ri">Study on the Retrieval Technique in Section 4.1.</b> In Section 4.1, we propose a column retrieval method that selects a compact and informative subset of <i>K</i> columns as the column context <i>C</i>. Our design emphasizes both semantic relevance and diversity, and employs MMR for context selection. We compare it with several alternative strategies. In particular, we compare the following strategies: Random selects <i>K</i> context columns at random; First takes the first <i>K</i> columns from the table; Nearby selects the columns adjacent to the target; Similar retrieves the top-<i>K</i> columns with the highest embedding similarity to the target column; Position selects the two leftmost columns and the left and right columns of the target. Note that all these methods are implemented within the same REVEAL+ framework and only differ in how to get <i>C</i> in Section 4.1. The results are reported in Table 6, and the improvement of ours in the last row over the others is solely achieved by Section 4.1. Observe that our method with the retrieval technique in Section 4.1 performs better than the other strategies, except Similar on SOTAB-CPA. This confirms the effectiveness of combining semantic relevance and diversity in column retrieval, as emphasized in our design.</div>
    <div class="zh" lang="zh-CN"><b class="ri">第 4.1 节检索技术的研究。</b>在第 4.1 节，我们提出一种列检索方法，选出 <i>K</i> 列的紧凑且信息量大的子集作为列上下文 <i>C</i>。我们的设计同时强调语义相关性与多样性，并采用 MMR 做上下文选择。我们将其与若干替代策略对比，具体包括：Random 随机选取 <i>K</i> 个上下文列；First 取表中最前面的 <i>K</i> 列；Nearby 选取与目标相邻的列；Similar 检索与目标列嵌入相似度最高的前 <i>K</i> 列；Position 选取最左两列以及目标左右两侧的列。需注意，这些方法都在同一 REVEAL+ 框架内实现，仅在第 4.1 节「如何得到 <i>C</i>」这一点上不同。结果见表 6：最后一行（本文方法）相对其他策略的增益完全来自第 4.1 节。可以看到，采用第 4.1 节检索技术的方法优于其他策略——唯一例外是 SOTAB-CPA 上的 Similar。这印证了我们在设计中强调的「在列检索中结合语义相关性与多样性」的有效性。</div>
  </div>
  <div class="p">
    <div class="en" lang="en"><b class="ri">Study on Equation (2).</b> We study Equation (2) by introducing a weight <i>λ</i> to control the trade-off between relevance and diversity: <i>g</i>(<i>c</i>, <i>τ</i>, <i>C</i>) = <i>λ</i>·cos(e<sub>c</sub>, e<sub>τ</sub>) − (1 − <i>λ</i>)·max<sub>c″∈C</sub> cos(e<sub>c</sub>, e<sub>c″</sub>). A smaller <i>λ</i> emphasizes diversity, while a larger <i>λ</i> emphasizes relevance. By default, we consider same weight for both terms, i.e., <i>λ</i> = 0.5. Figure 9 reports the performance of REVEAL and REVEAL+ for <i>λ</i> in {0.1, 0.3, 0.5, 0.7, 0.9}. As <i>λ</i> increases, the performance of both methods generally improves and then plateaus or decreases. REVEAL+ consistently outperforms REVEAL across all datasets. Notably, REVEAL+ achieves its best performance at <i>λ</i> = 0.5 on most datasets, except for SOTAB-CPA, where REVEAL+ with <i>λ</i> = 0.7 yields even higher quality. These results indicate that it is not possible to simply tune Equation (2) to let REVEAL to achieve the same performance as REVEAL+, validating the necessity of the verification techniques in Section 5 for REVEAL+ to further enhance performance.</div>
    <div class="zh" lang="zh-CN"><b class="ri">对式 (2) 的研究。</b>我们通过引入权重 <i>λ</i> 来调控相关性与多样性的权衡，从而研究式 (2)：<i>g</i>(<i>c</i>, <i>τ</i>, <i>C</i>) = <i>λ</i>·cos(e<sub>c</sub>, e<sub>τ</sub>) − (1 − <i>λ</i>)·max<sub>c″∈C</sub> cos(e<sub>c</sub>, e<sub>c″</sub>)。<i>λ</i> 越小越强调多样性，越大越强调相关性；默认两项取相同权重，即 <i>λ</i> = 0.5。图 9 报告了 <i>λ</i> ∈ {0.1, 0.3, 0.5, 0.7, 0.9} 时 REVEAL 与 REVEAL+ 的性能。随着 <i>λ</i> 增大，两种方法的性能总体先上升、随后持平或下降；REVEAL+ 在所有数据集上均稳定优于 REVEAL。值得注意的是，REVEAL+ 在多数数据集上于 <i>λ</i> = 0.5 取得最佳性能，唯 SOTAB-CPA 上 <i>λ</i> = 0.7 时质量更高。这些结果表明，仅靠调节式 (2) 无法让 REVEAL 达到 REVEAL+ 的水平，从而证明第 5 节的校验技术对 REVEAL+ 进一步提性能是必要的。</div>
  </div>
  <figure class="fig" id="fig9">
    <div class="pic"><img src="/images/reveal-translation/fig9.png" width="466" height="341" alt="图 9 变化权重 λ 的影响。" loading="lazy" decoding="async"></div>
    <div class="figcap"><b>图 9</b> 变化权重 <i>λ</i> 的影响。
    <span class="ten">Figure 9: Vary λ.</span></div>
  </figure>
  <div class="tbl">
    <div class="tcap"><b>表 7</b> REVEAL+ 采用不同校验方法的结果（Macro-F1）。<span class="ten">Table 7: REVEAL+ with different verification methods. Macro-F1</span></div>
    <div class="scroll" tabindex="0" role="region" aria-label="可横向滚动的数据表格"><table>
      <thead><tr><th>Verification method 校验方法</th><th>GitTablesDB</th><th>GitTablesSC</th><th>SOTAB-CTA</th><th>SOTAB-CPA</th></tr></thead>
      <tbody>
        <tr><td>Random 随机</td><td class="num">34.96</td><td class="num">38.31</td><td class="num">76.31</td><td class="num">67.90</td></tr>
        <tr><td>Max Confidence 最大置信度</td><td class="num">34.83</td><td class="num">34.32</td><td class="num">76.35</td><td class="num">69.77</td></tr>
        <tr><td>Majority Voting 多数投票</td><td class="num">36.71</td><td class="num">40.02</td><td class="num">83.69</td><td class="num">73.08</td></tr>
        <tr><td>Weighted Voting 加权投票</td><td class="num">36.73</td><td class="num">39.27</td><td class="num">84.07</td><td class="num">73.77</td></tr>
        <tr class="ours"><td>REVEAL+（本文校验模型）</td><td class="num">38.30</td><td class="num">45.82</td><td class="num">88.1</td><td class="num">78.15</td></tr>
      </tbody>
    </table></div>
  </div>
  <div class="p">
    <div class="en" lang="en"><b class="ri">Learning Efficiency of the Verification Model.</b> In Section 5, we construct a labeled dataset to train the verification model. To evaluate its learning efficiency, we vary the size of its training set from 20% to 100% and report the results of REVEAL+ in Figure 10. When the training set ratio increases, the performance of REVEAL+ generally improves in a mild way, indicating that the verification model benefits from more training data, but is not sensitive to that and can achieve good performance with limited training data. Note that on GitTablesDB and GitTablesSC, the performance of improves more significantly than on the other datasets. The reason is that GitTablesDB and GitTablesSC contain more complex tables with wider structures. Therefore, we need to have a sufficiently trained verification model to verify if a subset of columns is helpful for the target annotation tasks. Figure 10 illustrates that the verification model with the top-down inference technique in Section 5 is effective and robust to learn from training data.</div>
    <div class="zh" lang="zh-CN"><b class="ri">校验模型的学习效率。</b>第 5 节中我们构造标注数据集来训练校验模型。为评估其学习效率，我们把训练集规模从 20% 变化到 100%，并在图 10 中报告 REVEAL+ 的结果。随着训练集比例上升，REVEAL+ 的性能总体温和提升，说明校验模型能从更多训练数据中获益，但并不敏感，在有限数据下也能取得不错表现。需注意在 GitTablesDB 与 GitTablesSC 上性能提升比其他数据集更明显，原因是这两个数据集的表更复杂、结构更宽，因此需要一个训练充分的校验模型来判断某个列子集是否有助于目标标注任务。图 10 说明，配合第 5 节自顶向下推断技术的校验模型既有效、又能稳健地从训练数据中学习。</div>
  </div>
  <figure class="fig" id="fig10">
    <div class="pic"><img src="/images/reveal-translation/fig10.png" width="585" height="335" alt="图 10 通过变化训练数据比例考察 REVEAL+ 中校验模型的学习效率。" loading="lazy" decoding="async"></div>
    <div class="figcap"><b>图 10</b> 通过变化训练数据比例考察 REVEAL+ 中校验模型的学习效率。
    <span class="ten">Figure 10: Learning efficiency of the verification model in REVEAL+ by varying the ratio of training data.</span></div>
  </figure>
  <div class="tbl">
    <div class="tcap"><b>表 8</b> 基线方法在上下文 <i>C</i> 上的性能。<span class="ten">Table 8: Performance of baselines with C.</span></div>
    <div class="scroll" tabindex="0" role="region" aria-label="可横向滚动的数据表格"><table>
      <thead>
        <tr><th rowspan="2">Method 方法</th><th colspan="2">GitTablesDB</th><th colspan="2">GitTablesSC</th><th colspan="2">SOTAB-CTA</th><th colspan="2">SOTAB-CPA</th></tr>
        <tr><th>Mi-F1</th><th>Ma-F1</th><th>Mi-F1</th><th>Ma-F1</th><th>Mi-F1</th><th>Ma-F1</th><th>Mi-F1</th><th>Ma-F1</th></tr>
      </thead>
      <tbody>
        <tr><td>Watchog</td><td class="num">53.96</td><td class="num">28.89</td><td class="num">65.24</td><td class="num">36.06</td><td class="num">86.23</td><td class="num">84.19</td><td class="num">76.52</td><td class="num">72.60</td></tr>
        <tr><td>Watchog + <i>C</i></td><td class="num">54.27</td><td class="num">29.32</td><td class="num">65.35</td><td class="num">37.06</td><td class="num">87.90</td><td class="num">86.47</td><td class="num">79.66</td><td class="num">75.91</td></tr>
        <tr><td>Starmie</td><td class="num">54.43</td><td class="num">30.71</td><td class="num">64.87</td><td class="num">37.04</td><td class="num">87.95</td><td class="num">86.84</td><td class="num">78.92</td><td class="num">75.69</td></tr>
        <tr><td>Starmie + <i>C</i></td><td class="num">56.98</td><td class="num">32.11</td><td class="num">66.88</td><td class="num">37.47</td><td class="num">88.29</td><td class="num">87.49</td><td class="num">80.40</td><td class="num">76.78</td></tr>
        <tr class="ours"><td>REVEAL+</td><td class="num">61.53</td><td class="num">38.3</td><td class="num">70.9</td><td class="num">45.82</td><td class="num">88.74</td><td class="num">88.1</td><td class="num">80.81</td><td class="num">78.15</td></tr>
      </tbody>
    </table></div>
  </div>
  <div class="p">
    <div class="en" lang="en"><b class="ri">Study on the Verification Model.</b> In REVEAL+, we employ a learned verification model with a top-down inference strategy to identify <i>S</i> from <i>C</i>. We compare it against several alternative methods: Random, which selects <i>S</i> from <i>C</i> randomly, with results averaged over 10 runs; Max Confidence, which selects the subset with the highest softmax probability from the prediction module <i>f</i>; Majority Voting, which determines the final label based on the most frequent label predicted across all subsets of <i>C</i>; and Weighted Voting, which averages the softmax probabilities across all subsets and selects the label with the highest mean probability. Table 7 reports the Macro-F1 results. Observe that REVEAL+ with the proposed verification model consistently outperforms all other methods across all datasets, with a significant margin. This demonstrates the effectiveness of our verification model in selecting informative column contexts for the target column, leading to improved performance in the annotation tasks.</div>
    <div class="zh" lang="zh-CN"><b class="ri">校验模型的研究。</b>在 REVEAL+ 中，我们用带自顶向下推断策略的学习式校验模型从 <i>C</i> 中确定 <i>S</i>。我们将其与若干替代方法对比：Random 从 <i>C</i> 中随机选 <i>S</i>（结果取 10 次运行平均）；Max Confidence 取预测模块 <i>f</i> softmax 概率最高的子集；Majority Voting 依据 <i>C</i> 所有子集预测中出现最频繁的标签决定最终标签；Weighted Voting 对所有子集的 softmax 概率取平均，选均值概率最高的标签。表 7 报告 Macro-F1 结果：采用所提校验模型的 REVEAL+ 在所有数据集上都稳定优于其他方法，且优势明显。这证明我们的校验模型能有效地为目标列选出有信息量的列上下文，从而提升标注任务的性能。</div>
  </div>
  <div class="p">
    <div class="en" lang="en"><b class="ri">Applying Baselines over C.</b> We apply strong baselines, Watchog and Starmie, on the column context <i>C</i> retrieved in Section 4.1. As shown in Table 8, both baselines exhibit improved performance when using <i>C</i>, compared to using original tables. This demonstrates the effectiveness and generalizability of our idea of retrieving a compact and informative column context for the target. Nevertheless, REVEAL+ still significantly outperforms both baselines, when they use the same <i>C</i>, validating the effectiveness and necessity of our techniques in Section 4.2 and Section 5.</div>
    <div class="zh" lang="zh-CN"><b class="ri">在 <i>C</i> 上应用基线方法。</b>我们把强基线 Watchog 与 Starmie 应用于第 4.1 节检索出的列上下文 <i>C</i> 上。如表 8 所示，与使用原始表相比，两个基线在使用 <i>C</i> 时性能均有提升，这验证了「为目标检索紧凑且信息量大的列上下文」这一想法的有效性与可推广性。不过，在同样使用 <i>C</i> 的情况下，REVEAL+ 仍显著优于这两个基线，从而验证了第 4.2 节与第 5 节技术（上下文感知编码与校验）的有效性与必要性。</div>
  </div>
  <div class="tbl">
    <div class="tcap"><b>表 9</b> 自顶向下 vs. 自底向上的校验推断。<span class="ten">Table 9: Top-down vs. bottom-up verification inference.</span></div>
    <div class="scroll" tabindex="0" role="region" aria-label="可横向滚动的数据表格"><table>
      <thead>
        <tr><th rowspan="2">Strategy 策略</th><th colspan="2">GitTablesDB</th><th colspan="2">GitTablesSC</th><th colspan="2">SOTAB-CTA</th><th colspan="2">SOTAB-CPA</th></tr>
        <tr><th>Mi-F1</th><th>Ma-F1</th><th>Mi-F1</th><th>Ma-F1</th><th>Mi-F1</th><th>Ma-F1</th><th>Mi-F1</th><th>Ma-F1</th></tr>
      </thead>
      <tbody>
        <tr><td>bottom-up 自底向上</td><td class="num">55.86</td><td class="num">31.09</td><td class="num">63.49</td><td class="num">28.48</td><td class="num">65.29</td><td class="num">62.30</td><td class="num">68.43</td><td class="num">64.85</td></tr>
        <tr class="ours"><td>top-down 自顶向下</td><td class="num">61.53</td><td class="num">38.30</td><td class="num">70.90</td><td class="num">45.82</td><td class="num">88.74</td><td class="num">88.10</td><td class="num">80.81</td><td class="num">78.15</td></tr>
      </tbody>
    </table></div>
  </div>
  <div class="p">
    <div class="en" lang="en"><b class="ri">Top-down vs. Bottom-up Verification.</b> We compare the top-down verification inference in Section 5.2 with a bottom-up approach. The bottom-up approach starts with the top-ranked column in Algorithm 1 and iteratively adds columns until either all columns in <i>C</i> are included or the quality score from the verification model no longer improves, i.e., early stopping. Table 9 shows that bottom-up search is outperformed by our top-down approach. This supports our intuition in Section 5.2 that top-down verification, which starts from a larger high-quality context and prunes only a few noisy columns, can get better <i>S</i>. In contrast, bottom-up verification may be more sensitive to the initial column choices.</div>
    <div class="zh" lang="zh-CN"><b class="ri">自顶向下 vs. 自底向上校验。</b>我们把第 5.2 节的自顶向下校验推断与一种自底向上做法对比。自底向上从算法 1 中排名最高的列开始，迭代地加入列，直到 <i>C</i> 中所有列都被纳入，或校验模型给出的质量分数不再提升（即早停）。表 9 显示自底向上搜索不如我们的自顶向下方法。这支持了第 5.2 节的直觉：自顶向下校验从较大的高质量上下文出发、只剪除少量噪声列，能得到更好的 <i>S</i>；相比之下，自底向上校验可能对初始列的选择更敏感。</div>
  </div>
  <div class="tbl">
    <div class="tcap"><b>表 10</b> REVEAL+ 使用 <i>C</i> 与使用全列集合的对比。<span class="ten">Table 10: REVEAL+ using C vs. full column set.</span></div>
    <div class="scroll" tabindex="0" role="region" aria-label="可横向滚动的数据表格"><table>
      <thead>
        <tr><th rowspan="2">Setting 设置</th><th colspan="2">GitTablesDB</th><th colspan="2">GitTablesSC</th><th colspan="2">SOTAB-CTA</th><th colspan="2">SOTAB-CPA</th></tr>
        <tr><th>Mi-F1</th><th>Ma-F1</th><th>Mi-F1</th><th>Ma-F1</th><th>Mi-F1</th><th>Ma-F1</th><th>Mi-F1</th><th>Ma-F1</th></tr>
      </thead>
      <tbody>
        <tr><td>full set 全列集合</td><td class="num">60.27</td><td class="num">36.75</td><td class="num">69.58</td><td class="num">42.45</td><td class="num">88.37</td><td class="num">87.61</td><td class="num">79.60</td><td class="num">77.11</td></tr>
        <tr class="ours"><td><i>C</i>（检索所得上下文）</td><td class="num">61.80</td><td class="num">39.12</td><td class="num">71.03</td><td class="num">46.04</td><td class="num">88.78</td><td class="num">88.17</td><td class="num">80.90</td><td class="num">78.30</td></tr>
      </tbody>
    </table></div>
  </div>
  <div class="p">
    <div class="en" lang="en"><b class="ri">Performance of REVEAL+ on Full Column Set.</b> We compare REVEAL+ when verifying over the retrieved context <i>C</i> versus verifying over the full set of columns in a table. As shown in Table 10, REVEAL+ achieves consistently better results using <i>C</i> than using the full column set. This validates that the retrieval stage in REVEAL effectively eliminates irrelevant columns, enabling more focused and informative context for effective verification in REVEAL+.</div>
    <div class="zh" lang="zh-CN"><b class="ri">REVEAL+ 在全列集合上的表现。</b>我们比较 REVEAL+ 在「对检索到的上下文 <i>C</i> 做校验」与「对表中全列集合做校验」两种情形。如表 10 所示，使用 <i>C</i> 的结果一致优于使用全列集合，这验证了 REVEAL 中的检索阶段能有效剔除无关列，为 REVEAL+ 的有效校验提供更聚焦、更有信息量的上下文。</div>
  </div>
  <div class="tbl">
    <div class="tcap"><b>表 11</b> 在不同类型列上的性能。<span class="ten">Table 11: Performance on different types of columns.</span></div>
    <div class="scroll" tabindex="0" role="region" aria-label="可横向滚动的数据表格"><table>
      <thead>
        <tr><th rowspan="2">Method 方法</th><th colspan="3">GitTablesDB</th><th colspan="3">GitTablesSC</th></tr>
        <tr><th>text 文本</th><th>numeric 数值</th><th>date-time 日期时间</th><th>text 文本</th><th>numeric 数值</th><th>date-time 日期时间</th></tr>
      </thead>
      <tbody>
        <tr><td>Starmie</td><td class="num">49.85</td><td class="num">70.51</td><td class="num">53.01</td><td class="num">56.62</td><td class="num">80.54</td><td class="num">58.00</td></tr>
        <tr class="ours"><td>REVEAL+</td><td class="num">56.88</td><td class="num">70.78</td><td class="num">59.04</td><td class="num">61.76</td><td class="num">84.90</td><td class="num">62.00</td></tr>
      </tbody>
    </table></div>
  </div>
  <div class="p">
    <div class="en" lang="en"><b class="ri">Performance on Different Column Types.</b> We analyze performance by column type: text (e.g., name, description, title), numeric (e.g., value, age, price), and datetime (e.g., date, year, time). Table 11 reports the results of REVEAL+ and the baseline Starmie for each column type. Both methods achieve higher accuracy on numeric columns, likely because numeric types are more distinct and easier to classify than text or datetime columns. Importantly, REVEAL+ consistently outperforms Starmie across all types.</div>
    <div class="zh" lang="zh-CN"><b class="ri">不同列类型上的性能。</b>我们按列类型分析性能：文本（如 name、description、title）、数值（如 value、age、price）与日期时间（如 date、year、time）。表 11 报告 REVEAL+ 与基线 Starmie 在各类列上的结果。两种方法在数值列上的准确率都更高，这可能是因为数值类型比文本或日期时间列更独特、更易分类。重要的是，REVEAL+ 在所有类型上都稳定优于 Starmie。</div>
  </div>
  <div class="tbl">
    <div class="tcap"><b>表 12</b> 512 tokens 下的结果。<span class="ten">Table 12: Results with 512 tokens.</span></div>
    <div class="scroll" tabindex="0" role="region" aria-label="可横向滚动的数据表格"><table>
      <thead>
        <tr><th rowspan="2">Method 方法</th><th colspan="2">GitTablesDB</th><th colspan="2">GitTablesSC</th><th colspan="2">SOTAB-CTA</th><th colspan="2">SOTAB-CPA</th></tr>
        <tr><th>Mi-F1</th><th>Ma-F1</th><th>Mi-F1</th><th>Ma-F1</th><th>Mi-F1</th><th>Ma-F1</th><th>Mi-F1</th><th>Ma-F1</th></tr>
      </thead>
      <tbody>
        <tr><td>Watchog</td><td class="num">54.27</td><td class="num">29.37</td><td class="num">64.44</td><td class="num">34.75</td><td class="num">86.56</td><td class="num">84.57</td><td class="num">78.06</td><td class="num">71.90</td></tr>
        <tr><td>Starmie</td><td class="num">54.16</td><td class="num">31.44</td><td class="num">64.85</td><td class="num">38.31</td><td class="num">87.92</td><td class="num">86.91</td><td class="num">78.77</td><td class="num">75.77</td></tr>
        <tr class="ours"><td>REVEAL</td><td class="num">59.88</td><td class="num">36.69</td><td class="num">70.33</td><td class="num">42.41</td><td class="num">89.40</td><td class="num">88.66</td><td class="num">80.68</td><td class="num">78.05</td></tr>
        <tr class="ours"><td>REVEAL+</td><td class="num">62.07</td><td class="num">39.56</td><td class="num">71.36</td><td class="num">46.35</td><td class="num">89.79</td><td class="num">89.18</td><td class="num">80.99</td><td class="num">78.16</td></tr>
      </tbody>
    </table></div>
  </div>
  <div class="p">
    <div class="en" lang="en"><b class="ri">Performance with 512 Tokens.</b> We set the maximum input length of BERT to 256 tokens, following [14, 32]. In [40], it shows that varying between 256 and 512 tokens does not affect performance much. In Table 12, we report the results with 512 tokens, comparing with strong baselines. Observe that using 512 tokens yields minor improvements over 256 tokens, and our REVEAL+ and REVEAL consistently outperform the baselines. These results further demonstrate the effectiveness and robustness of our methods.</div>
    <div class="zh" lang="zh-CN"><b class="ri">512 tokens 下的性能。</b>遵循 [14, 32]，我们把 BERT 的最大输入长度设为 256 tokens。[40] 指出，输入长度在 256 与 512 tokens 之间变化对性能影响不大。表 12 报告 512 tokens 下的结果并与强基线对比：可以看到，使用 512 tokens 相对 256 tokens 仅有小幅提升，而我们的 REVEAL+ 与 REVEAL 仍稳定优于基线。这些结果进一步说明我们方法的有效性与稳健性。</div>
  </div>
<span id="s65"></span>

### 6.5 示例

<div class="p">
    <div class="en" lang="en">Figure 11 presents an example on a table GitTables_4421 with 136 columns from GitTablesDB, describing citizen science projects. Figure 11(a) shows a sample view of the table, where the semantic types of columns are provided for reference but are not used in the CTA task. The target column Col_9 in gray contains year-like values, such as 2015 and 2017. Its ground truth type is StartDate, indicating the start date of a project, paired with the EndDate column Col_11. The strong baseline, Starmie, predicts the target column as Year when using the entire table as input. While reasonable, this prediction is incorrect. The table contains many irrelevant columns, such as Col_34 and Col_35, which do not contribute to predicting the target column type. These irrelevant columns overwhelm the baseline model, leading to suboptimal predictions.</div>
    <div class="zh" lang="zh-CN">图 11 给出 GitTablesDB 中一张 136 列的表 GitTables_4421（内容为公民科学项目）上的示例。图 11(a) 是表的样例视图，其中列的语义类型仅供参照，在 CTA 任务中并不使用。灰色的目标列 Col_9 含类年份值，如 2015 与 2017；其真实类型为 StartDate（表示项目的开始日期），与 EndDate 列 Col_11 成对。强基线 Starmie 在输入整张表时把目标列预测为 Year——虽有几分道理，但预测错误。该表含有许多无关列（如 Col_34、Col_35），对预测目标列类型毫无贡献；这些无关列淹没了基线模型，导致预测次优。</div>
  </div>
  <div class="p">
    <div class="en" lang="en">Figure 11(b) shows the column context <i>C</i> with 8 columns retrieved using our retrieval method in Section 4.1. These columns, such as EndDate, Status, and Description, are closely related to the project information and help clarify the target column’s meaning. This demonstrates the retrieval method’s ability to filter out irrelevant columns effectively. Figure 11(c) shows the verified column context <i>S</i> selected from <i>C</i> by the verification model in REVEAL+ (Section 5). Compared to <i>C</i>, the verification model further refines the context by removing less relevant columns, such as Size, ensuring only the most informative columns remain. With the verified column context, REVEAL+ correctly predicts the target column type as StartDate, matching the ground truth and together with the EndDate column, indicating a complete project timeline.</div>
    <div class="zh" lang="zh-CN">图 11(b) 显示用第 4.1 节检索方法得到的 8 列列上下文 <i>C</i>。这些列——如 EndDate、Status、Description——与项目信息密切相关，有助于澄清目标列的含义，体现了检索方法有效过滤无关列的能力。图 11(c) 显示 REVEAL+ 中校验模型（第 5 节）从 <i>C</i> 中选出的经校验列上下文 <i>S</i>。与 <i>C</i> 相比，校验模型通过剔除相关性较弱的列（如 Size）进一步精化了上下文，只保留最有信息量的列。借助该经校验列上下文，REVEAL+ 正确地把目标列类型预测为 StartDate，与真实标签一致；它与 EndDate 列一起构成完整的项目时间线。</div>
  </div>
  <figure class="fig" id="fig11">
    <div class="pic"><img src="/images/reveal-translation/fig11.png" width="709" height="552" alt="图 11 示例：(a) 原始表（GitTables_4421）；(b) 检索得到的列上下文 C；(c) 使用经校验列上下文 S 的标注结果。" loading="lazy" decoding="async"></div>
    <div class="figcap"><b>图 11</b> 示例：(a) 原始表（GitTables_4421）；(b) 检索得到的列上下文 <i>C</i>；(c) 使用经校验列上下文 <i>S</i> 的标注结果。
    <span class="ten">Figure 11: Illustrative Example.</span></div>
  </figure>
<span id="s7"></span>

## 7 相关工作

<div class="p">
    <div class="en" lang="en">Early methods for column annotation rely on hand-crafted and statistical data features. SemanticTyper [35] utilized TF-IDF for textual data and Kolmogorov-Smirnov tests [29] for numeric data to distinguish data types. Pham et al. [34] extended this approach by incorporating additional features, such as the Mann-Whitney test for numerical data and Jaccard similarity for textual data, to train logistic regression and random forest models for annotation. Building on advancements in machine learning, recent studies have incorporated semantic features, framing CTA and CPA as multi-class classification problems. Sherlock [19] extracts multi-granularity tabular features, such as character-level, word-level, segment-level, and global-level, and trains deep learning classifiers for semantic type prediction. Sato [47] extends Sherlock by modeling table-level topics and correlations between neighbor columns.</div>
    <div class="zh" lang="zh-CN">早期的列标注方法依赖人工构造的与统计式的数据特征。SemanticTyper [35] 用 TF-IDF 处理文本数据、用 Kolmogorov-Smirnov 检验 [29] 处理数值数据，以区分数据类型。Pham 等 [34] 扩展了这一思路，引入更多特征（如对数值数据用 Mann-Whitney 检验、对文本数据用 Jaccard 相似度），用于训练逻辑回归与随机森林模型做标注。随着机器学习的发展，近期研究引入语义特征，把 CTA 与 CPA 视为多分类问题。Sherlock [19] 提取多粒度表格特征（字符级、词级、片段级、全局级），训练深度学习分类器预测语义类型；Sato [47] 则在 Sherlock 基础上进一步建模表级主题与相邻列之间的相关性。</div>
  </div>
  <div class="p">
    <div class="en" lang="en">Subsequently, language models like BERT [8] have been employed to learn representations of tabular data for table understanding [21, 45]. Column annotation methods based on language models [6, 32, 39] have gained significant attraction. For instance, TURL [6] introduces a pre-training and fine-tuning framework that uses a visibility matrix to mask irrelevant table components and generate column embeddings for downstream tasks. Doduo [39] developes a multi-task learning framework based on BERT, which takes the entire table as input and predicts column types and relations using a single model. It achieves high annotation quality by modeling token-level interactions across columns through self-attention. RECA [40] aligns schema-similar and topic-related tables with a novel named entity schema to address the complexities of wide tables and inter-table contexts. Watchog [32] employs contrastive learning techniques to tackle challenges associated with data sparsity and class imbalance in column annotation tasks, reducing reliance on high-quality annotated instances. Starmie [14], originally designed for dataset discovery in data lakes, proposes a self-supervised contrastive learning framework to train a high-quality column encoder. We adapt it to column annotation and compare its performance with our methods.</div>
    <div class="zh" lang="zh-CN">此后，BERT [8] 等语言模型被用于学习表格数据的表示以支持表格理解 [21, 45]，基于语言模型的列标注方法 [6, 32, 39] 受到广泛关注。例如 TURL [6] 提出预训练加微调的框架，用可见性矩阵屏蔽无关的表格成分，并为下游任务生成列嵌入。Doduo [39] 构建基于 BERT 的多任务学习框架，以整张表为输入、用单一模型预测列类型与列关系；它通过自注意力建模跨列的 token 级交互，从而取得较高的标注质量。RECA [40] 用新颖的命名实体模式对齐「模式相似、主题相关」的表，以应对宽表与跨表上下文的复杂性。Watchog [32] 采用对比学习技术应对列标注任务中的数据稀疏与类别不均衡问题，减少对高质量标注实例的依赖。Starmie [14] 原本为数据湖中的数据集发现而设计，提出自监督对比学习框架来训练高质量列编码器；我们将其适配到列标注上，并与本文方法比较性能。</div>
  </div>
  <div class="p">
    <div class="en" lang="en">These studies underscore the importance of effective representational learning for accurate annotations. However, existing models typically process all columns in a table as input for a target, relying on transformers and attention mechanisms to infer useful semantics and column interactions. This approach often fails to filter out irrelevant columns, introducing noise that can degrade performance. In contrast, our method explicitly identifies and validates contextually relevant columns for the target column, enabling a more precise understanding of column semantics.</div>
    <div class="zh" lang="zh-CN">这些研究凸显了有效表示学习对精确标注的重要性。然而，现有模型通常把表中所有列都作为某个目标的输入，依赖 Transformer 与注意力机制来推断有用的语义与列间交互。这种做法往往无法滤除无关列，引入的噪声会损害性能。相反，我们的方法显式地识别并校验与目标列上下文相关的列，从而更精确地理解列语义。</div>
  </div>
  <div class="p">
    <div class="en" lang="en">Shraga and Miller [38] propose a different problem, semantic data versioning, focusing on explaining changes between dataset versions by identifying transformations from an origin relation to a goal relation. Their Explain-Da-V method uses functional dependency (FD) discovery to select column subsets for efficient search. In contrast, we work on column annotation for tables with missing metadata—a distinct task that could benefit data versioning. Our retrieval and verification techniques in Sections 4 and 5 are technically different from the FD-based approach in [38].</div>
    <div class="zh" lang="zh-CN">Shraga 与 Miller [38] 提出了另一个问题——语义化数据版本管理，关注通过识别「从源关系到目标关系」的变换来解释数据集各版本之间的变化。其 Explain-Da-V 方法利用函数依赖（FD）发现来选取列子集以实现高效搜索。我们的工作则是针对元数据缺失表格的列标注——这是一个不同但可能受益于数据版本管理的任务；第 4、5 节的检索与校验技术，在技术路径上也与 [38] 基于 FD 的做法不同。</div>
  </div>
  <div class="p">
    <div class="en" lang="en">Recent studies have explored the use of LLMs [12, 44, 49] for column annotation tasks [15, 31, 48]. For instance, TableLlama [48] fine-tunes LLMs on various table-related tasks, including column annotation. In our experiments, we compared our method with TableLlama and a general-purpose LLM, Qwen-Plus [44], and observed that they perform suboptimally on column annotation tasks. This suggests that the effectiveness of LLMs in such tasks depends heavily on whether they have been trained or fine-tuned on relevant table-specific corpora. Consequently, column annotation remains a challenging problem that cannot be effectively addressed by LLMs alone and requires dedicated designs and methods.</div>
    <div class="zh" lang="zh-CN">近期研究探索了用 LLM [12, 44, 49] 处理列标注任务 [15, 31, 48]。例如 TableLlama [48] 在包括列标注在内的多种表格相关任务上微调 LLM。在我们的实验中，将本文方法与 TableLlama 以及通用 LLM Qwen-Plus [44] 对比后可观察到，它们在列标注任务上表现并不理想。这说明 LLM 在此类任务上的有效性在很大程度上取决于它是否在相关的表格专用语料上训练或微调过。因此，列标注仍是一个具挑战性的问题，无法仅靠 LLM 有效解决，需要专门的设计与方法。</div>
  </div>
  <div class="p">
    <div class="en" lang="en">In addition, several other tasks are related to tabular data, including table discovery [7, 13, 20], such as table join search [9, 10, 50] and table union search [14, 23, 33], as well as schema matching [28, 41] and tabular data synthesis for dataset augmentation [3, 4]. These tasks rely heavily on effective table understanding and column representation learning. In future work, we plan to extend our techniques to support these broader table-related applications.</div>
    <div class="zh" lang="zh-CN">此外，还有其他若干与表格数据相关的任务，包括表格发现 [7, 13, 20]（如表格连接搜索 [9, 10, 50] 与表格并集搜索 [14, 23, 33]），以及模式匹配 [28, 41] 与用于数据集增强的表格数据合成 [3, 4]。这些任务高度依赖有效的表格理解与列表示学习。未来工作中，我们计划把本文技术扩展到支持这些更广泛的表格相关应用。</div>
  </div>
<span id="s8"></span>

## 8 结论

<div class="p">
    <div class="en" lang="en">We propose a novel retrieve-and-verify framework comprising the REVEAL and REVEAL+, which selectively incorporate relevant column context to enhance annotation accuracy. REVEAL employs an unsupervised retrieval strategy to construct compact and informative column subsets, combined with context-aware encoding techniques that differentiate between target and context columns to learn effective embeddings. Building on this, REVEAL+ refines the retrieved column context using a lightweight verification model, formulating context verification as a supervised classification problem and introducing a top-down inference method to efficiently identify high-quality contexts. Extensive experiments on six benchmark datasets validate the effectiveness of our framework, with both REVEAL and REVEAL+ significantly surpassing existing state-of-the-art methods. These findings underscore the importance of selective context in table understanding and present a scalable, generalizable solution for real-world applications. As future work, a direction is to leverage the context quality scores learned by the verification model in REVEAL+ to guide the retrieval in REVEAL in a supervised manner, potentially improving performance. We also plan to extend our framework to other tabular data tasks, e.g., table generation, and explore integration with advanced large models.</div>
    <div class="zh" lang="zh-CN">我们提出一种新的「检索—校验」框架，包含 REVEAL 与 REVEAL+，通过有选择地引入相关列上下文来提升标注准确性。REVEAL 采用无监督检索策略构造紧凑且信息量大的列子集，并结合上下文感知编码技术区分目标列与上下文列，以学习有效的嵌入。在此基础上，REVEAL+ 用轻量级校验模型精化检索到的列上下文，把上下文校验形式化为有监督分类问题，并引入自顶向下推断方法以高效识别高质量上下文。在六个基准数据集上的大量实验验证了该框架的有效性：REVEAL 与 REVEAL+ 均显著超过现有最先进方法。这些发现凸显了「选择性上下文」在表格理解中的重要性，并为真实应用提供了一个可扩展、可推广的解决方案。未来工作方向之一，是以有监督方式利用 REVEAL+ 中校验模型学到的上下文质量分数来指导 REVEAL 的检索，从而可能进一步提升性能；我们还计划把该框架扩展到其他表格数据任务（例如表格生成），并探索与先进大模型的结合。</div>
  </div>
<span id="ref"></span>

## 参考文献

<div class="refs">
    <p><b>[1]</b> Nora Abdelmageed, Jiaoyan Chen, Vincenzo Cutrona, Vasilis Efthymiou, Oktie Hassanzadeh, Madelon Hulsebos, Ernesto Jiménez-Ruiz, Juan Sequeda, and Kavitha Srinivas. 2022. Results of SemTab 2022. In SemTab@ISWC (CEUR Workshop Proceedings, Vol. 3320). CEUR-WS.org, 1–13.</p>
    <p><b>[2]</b> Dan Brickley, Matthew Burgess, and Natasha F. Noy. 2019. Google Dataset Search: Building a search engine for datasets in an open Web ecosystem. In WWW. ACM, 1365–1375.</p>
    <p><b>[3]</b> Jean-Flavien Bussotti, Enzo Veltri, Donatello Santoro, and Paolo Papotti. 2023. Generation of Training Examples for Tabular Natural Language Inference. Proc. ACM Manag. Data 1, 4 (2023), 243:1–243:27.</p>
    <p><b>[4]</b> Kuntai Cai, Xiaokui Xiao, and Graham Cormode. 2023. PrivLava: Synthesizing Relational Data with Foreign Keys under Differential Privacy. Proc. ACM Manag. Data 1, 2 (2023), 142:1–142:25.</p>
    <p><b>[5]</b> Jaime G. Carbonell and Jade Goldstein. 1998. The Use of MMR, Diversity-Based Reranking for Reordering Documents and Producing Summaries. In SIGIR. ACM, 335–336.</p>
    <p><b>[6]</b> Xiang Deng, Huan Sun, Alyssa Lees, You Wu, and Cong Yu. 2022. TURL: Table Understanding through Representation Learning. SIGMOD Rec. 51, 1 (2022), 33–40.</p>
    <p><b>[7]</b> Yuhao Deng, Chengliang Chai, Lei Cao, Qin Yuan, Siyuan Chen, Yanrui Yu, Zhaoze Sun, Junyi Wang, Jiajun Li, Ziqi Cao, Kaisen Jin, Chi Zhang, Yuqing Jiang, Yuanfang Zhang, Yuping Wang, Ye Yuan, Guoren Wang, and Nan Tang. 2024. LakeBench: A Benchmark for Discovering Joinable and Unionable Tables in Data Lakes. Proc. VLDB Endow. 17, 8 (2024), 1925–1938.</p>
    <p><b>[8]</b> Jacob Devlin, Ming-Wei Chang, Kenton Lee, and Kristina Toutanova. 2019. BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding. In NAACL-HLT (1). Association for Computational Linguistics, 4171–4186.</p>
    <p><b>[9]</b> Yuyang Dong, Kunihiro Takeoka, Chuan Xiao, and Masafumi Oyamada. 2021. Efficient Joinable Table Discovery in Data Lakes: A High-Dimensional Similarity Based Approach. In ICDE. IEEE, 456–467.</p>
    <p><b>[10]</b> Yuyang Dong, Chuan Xiao, Takuma Nozawa, Masafumi Enomoto, and Masafumi Oyamada. 2023. DeepJoin: Joinable Table Discovery with Pre-trained Language Models. Proc. VLDB Endow. 16, 10 (2023), 2458–2470.</p>
    <p><b>[11]</b> Xingyu Du, Gongsheng Yuan, Sai Wu, Gang Chen, and Peng Lu. 2024. In Situ Neural Relational Schema Matcher. In ICDE. IEEE, 138–150.</p>
    <p><b>[12]</b> Abhimanyu Dubey, Abhinav Jauhri, Abhinav Pandey, Abhishek Kadian, Ahmad Al-Dahle, Aiesha Letman, … , Kevin Stone, and et al. 2024. The Llama 3 Herd of Models. CoRR abs/2407.21783 (2024). <span style="color:var(--ink3)">（作者列表过长，此处省略，原文共 300+ 位作者）</span></p>
    <p><b>[13]</b> Grace Fan, Jin Wang, Yuliang Li, and Renée J. Miller. 2023. Table Discovery in Data Lakes: State-of-the-art and Future Directions. In SIGMOD Conference Companion. ACM, 69–75.</p>
    <p><b>[14]</b> Grace Fan, Jin Wang, Yuliang Li, Dan Zhang, and Renée J. Miller. 2023. Semantics-aware Dataset Discovery from Data Lakes with Contextualized Column-based Representation Learning. Proc. VLDB Endow. 16, 7 (2023), 1726–1739.</p>
    <p><b>[15]</b> Benjamin Feuer, Yurong Liu, Chinmay Hegde, and Juliana Freire. 2024. ArcheType: A Novel Framework for Open-Source Column Type Annotation using Large Language Models. Proc. VLDB Endow. 17, 9 (2024), 2279–2292.</p>
    <p><b>[16]</b> Chuan Guo, Geoff Pleiss, Yu Sun, and Kilian Q. Weinberger. 2017. On Calibration of Modern Neural Networks. In ICML (Proceedings of Machine Learning Research, Vol. 70). PMLR, 1321–1330.</p>
    <p><b>[17]</b> Dan Hendrycks and Kevin Gimpel. 2017. A Baseline for Detecting Misclassified and Out-of-Distribution Examples in Neural Networks. In ICLR (Poster). OpenReview.net.</p>
    <p><b>[18]</b> Madelon Hulsebos, Çagatay Demiralp, and Paul Groth. 2023. GitTables: A Large-Scale Corpus of Relational Tables. Proc. ACM Manag. Data 1, 1 (2023), 30:1–30:17.</p>
    <p><b>[19]</b> Madelon Hulsebos, Kevin Zeng Hu, Michiel A. Bakker, Emanuel Zgraggen, Arvind Satyanarayan, Tim Kraska, Çagatay Demiralp, and César A. Hidalgo. 2019. Sherlock: A Deep Learning Approach to Semantic Data Type Detection. In KDD. 1500–1508.</p>
    <p><b>[20]</b> Madelon Hulsebos, Wenjing Lin, Shreya Shankar, and Aditya G. Parameswaran. 2024. It Took Longer than I was Expecting: Why is Dataset Search Still so Hard? In HILDA@SIGMOD. ACM, 1–4.</p>
    <p><b>[21]</b> Hiroshi Iida, Dung Thai, Varun Manjunatha, and Mohit Iyyer. 2021. TABBIE: Pretrained Representations of Tabular Data. In NAACL-HLT. Association for Computational Linguistics, 3446–3456.</p>
    <p><b>[22]</b> Ernesto Jiménez-Ruiz, Oktie Hassanzadeh, Vasilis Efthymiou, Jiaoyan Chen, and Kavitha Srinivas. 2020. SemTab 2019: Resources to Benchmark Tabular Data to Knowledge Graph Matching Systems. In ESWC (Lecture Notes in Computer Science, Vol. 12123). Springer, 514–530.</p>
    <p><b>[23]</b> Aamod Khatiwada, Grace Fan, Roee Shraga, Zixuan Chen, Wolfgang Gatterbauer, Renée J. Miller, and Mirek Riedewald. 2023. SANTOS: Relationship-based Semantic Table Union Search. Proc. ACM Manag. Data 1, 1 (2023), 9:1–9:25.</p>
    <p><b>[24]</b> Aamod Khatiwada, Roee Shraga, Wolfgang Gatterbauer, and Renée J. Miller. 2022. Integrating Data Lake Tables. Proc. VLDB Endow. 16, 4 (2022), 932–945.</p>
    <p><b>[25]</b> Keti Korini and Christian Bizer. 2023. Column type annotation using chatgpt. arXiv preprint arXiv:2306.00745 (2023).</p>
    <p><b>[26]</b> Keti Korini and Christian Bizer. 2024. Column property annotation using large language models. In European Semantic Web Conference. Springer, 61–70.</p>
    <p><b>[27]</b> Keti Korini, Ralph Peeters, and Christian Bizer. 2022. SOTAB: The WDC Schema.org Table Annotation Benchmark. In SemTab@ISWC (CEUR Workshop Proceedings, Vol. 3320). CEUR-WS.org, 14–19.</p>
    <p><b>[28]</b> Christos Koutras, George Siachamis, Andra Ionescu, Kyriakos Psarakis, Jerry Brons, Marios Fragkoulis, Christoph Lofi, Angela Bonifati, and Asterios Katsifodimos. 2021. Valentine: Evaluating Matching Techniques for Dataset Discovery. In ICDE. IEEE, 468–479.</p>
    <p><b>[29]</b> Erich Leo Lehmann and Joseph P. Romano. 2008. Testing Statistical Hypotheses, Third Edition. (2008).</p>
    <p><b>[30]</b> Aristotelis Leventidis, Laura Di Rocco, Wolfgang Gatterbauer, Renée J. Miller, and Mirek Riedewald. 2023. DomainNet: Homograph Detection and Understanding in Data Lake Disambiguation. ACM Trans. Database Syst. 48, 3 (2023), 9:1–9:40.</p>
    <p><b>[31]</b> Peng Li, Yeye He, Dror Yashar, Weiwei Cui, Song Ge, Haidong Zhang, Danielle Rifinski Fainman, Dongmei Zhang, and Surajit Chaudhuri. 2024. Table GPT: Table Fine-tuned GPT for Diverse Table Tasks. Proc. ACM Manag. Data 2, 3 (2024), 176.</p>
    <p><b>[32]</b> Zhengjie Miao and Jin Wang. 2023. Watchog: A Light-weight Contrastive Learning based Framework for Column Annotation. SIGMOD 1, 4 (2023), 272:1–272:24.</p>
    <p><b>[33]</b> Fatemeh Nargesian, Erkang Zhu, Ken Q. Pu, and Renée J. Miller. 2018. Table Union Search on Open Data. Proc. VLDB Endow. 11, 7 (2018), 813–825.</p>
    <p><b>[34]</b> Minh Pham, Suresh Alse, Craig A. Knoblock, and Pedro A. Szekely. 2016. Semantic Labeling: A Domain-Independent Approach. In ISWC (1) (Lecture Notes in Computer Science, Vol. 9981). 446–462.</p>
    <p><b>[35]</b> S. K. Ramnandan, Amol Mittal, Craig A. Knoblock, and Pedro A. Szekely. 2015. Assigning Semantic Labels to Data Sources. In ESWC (Lecture Notes in Computer Science, Vol. 9088). Springer, 403–417.</p>
    <p><b>[36]</b> Nils Reimers and Iryna Gurevych. 2019. Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks. In EMNLP/IJCNLP (1). Association for Computational Linguistics, 3980–3990.</p>
    <p><b>[37]</b> Freda Shi, Xinyun Chen, Kanishka Misra, Nathan Scales, David Dohan, Ed H. Chi, Nathanael Schärli, and Denny Zhou. 2023. Large Language Models Can Be Easily Distracted by Irrelevant Context. In ICML (Proceedings of Machine Learning Research, Vol. 202). PMLR, 31210–31227.</p>
    <p><b>[38]</b> Roee Shraga and Renée J. Miller. 2023. Explaining Dataset Changes for Semantic Data Versioning with Explain-Da-V. Proc. VLDB Endow. 16, 6 (2023), 1587–1600.</p>
    <p><b>[39]</b> Yoshihiko Suhara, Jinfeng Li, Yuliang Li, Dan Zhang, Çagatay Demiralp, Chen Chen, and Wang-Chiew Tan. 2022. Annotating Columns with Pre-trained Language Models. In SIGMOD Conference. ACM, 1493–1503.</p>
    <p><b>[40]</b> Yushi Sun, Hao Xin, and Lei Chen. 2023. RECA: Related Tables Enhanced Column Semantic Type Annotation Framework. Proc. VLDB Endow. 16, 6 (2023), 1319–1331.</p>
    <p><b>[41]</b> Jianhong Tu, Ju Fan, Nan Tang, Peng Wang, Guoliang Li, Xiaoyong Du, Xiaofeng Jia, and Song Gao. 2023. Unicorn: A Unified Multi-tasking Model for Supporting Matching Tasks in Data Integration. Proc. ACM Manag. Data 1, 1 (2023), 84:1–84:26.</p>
    <p><b>[42]</b> Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Lukasz Kaiser, and Illia Polosukhin. 2017. Attention is All you Need. In NIPS. 5998–6008.</p>
    <p><b>[43]</b> Thomas Wolf, Lysandre Debut, Victor Sanh, Julien Chaumond, Clement Delangue, Anthony Moi, Pierric Cistac, Tim Rault, Rémi Louf, Morgan Funtowicz, Joe Davison, Sam Shleifer, Patrick von Platen, Clara Ma, Yacine Jernite, Julien Plu, Canwen Xu, Teven Le Scao, Sylvain Gugger, Mariama Drame, Quentin Lhoest, and Alexander M. Rush. 2020. Transformers: State-of-the-Art Natural Language Processing. In EMNLP (Demos). Association for Computational Linguistics, 38–45.</p>
    <p><b>[44]</b> An Yang, Baosong Yang, Binyuan Hui, Bo Zheng, Bowen Yu, Chang Zhou, … , Zhifang Guo, and Zhihao Fan. 2024. Qwen2 Technical Report. CoRR abs/2407.10671 (2024). <span style="color:var(--ink3)">（作者列表过长，此处省略）</span></p>
    <p><b>[45]</b> Pengcheng Yin, Graham Neubig, Wen-tau Yih, and Sebastian Riedel. 2020. TaBERT: Pretraining for Joint Understanding of Textual and Tabular Data. In ACL. Association for Computational Linguistics, 8413–8426.</p>
    <p><b>[46]</b> Ori Yoran, Tomer Wolfson, Ori Ram, and Jonathan Berant. 2024. Making Retrieval-Augmented Language Models Robust to Irrelevant Context. In ICLR. OpenReview.net.</p>
    <p><b>[47]</b> Dan Zhang, Yoshihiko Suhara, Jinfeng Li, Madelon Hulsebos, Çagatay Demiralp, and Wang-Chiew Tan. 2020. Sato: Contextual Semantic Type Detection in Tables. Proc. VLDB Endow. 13, 11 (2020), 1835–1848.</p>
    <p><b>[48]</b> Tianshu Zhang, Xiang Yue, Yifei Li, and Huan Sun. 2024. TableLlama: Towards Open Large Generalist Models for Tables. In NAACL-HLT. Association for Computational Linguistics, 6024–6044.</p>
    <p><b>[49]</b> Justin Zhao, Timothy Wang, Wael Abid, Geoffrey Angus, Arnav Garg, Jeffery Kinnison, Alex Sherstinsky, Piero Molino, Travis Addair, and Devvret Rishi. 2024. LoRA Land: 310 Fine-tuned LLMs that Rival GPT-4, A Technical Report. CoRR abs/2405.00732 (2024).</p>
    <p><b>[50]</b> Erkang Zhu, Dong Deng, Fatemeh Nargesian, and Renée J. Miller. 2019. JOSIE: Overlap Set Similarity Search for Finding Joinable Tables in Data Lakes. In SIGMOD Conference. ACM, 847–864.</p>
  </div>
  <div class="foot">本文档为 REVEAL（SIGMOD ’26）全文的中英逐段对照译本，作为非官方学习译稿整理。原文版权归作者与 ACM 所有；引用请以原文为准。原译稿注明由机器辅助生成并人工校对，如与原文有出入，以英文原文为准。</div>
