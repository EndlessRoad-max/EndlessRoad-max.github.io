---
title: "Doduo 论文中英对照：用预训练语言模型标注表格列"
published: 2026-11-08
description: "Annotating Columns with Pre-trained Language Models（SIGMOD 2022）中英对照译文，保留列类型与列关系预测、多任务学习、实验图表和附录。"
category: Excel 数据抽取
tags: [表格理解, Doduo, 预训练语言模型, 多任务学习, 论文精读]
lang: zh-CN
draft: false
---

本文整理自个人阅读用的中英对照译稿，原论文为 **Annotating Columns with Pre-trained Language Models**（SIGMOD 2022），[论文 DOI](https://doi.org/10.1145/3514221.3517906)。译文为非官方学习整理；文中“最新”“最优”等表述均对应论文发表时的研究背景。

**阅读方式**：英文原段在前，中文译文紧随其后并以左侧竖线区分。可通过本页目录跳转章节；较宽的实验表格可横向滚动，插图可点击查看原图。

<header class="doduo-title">
  <p>Annotating Columns with Pre-trained Language Models</p>
  <p class="doduo-zh-title">用预训练语言模型标注表格列</p>
  <div class="doduo-authors">
    Yoshihiko Suhara, Jinfeng Li, Yuliang Li, Dan Zhang<br>
    <span class="doduo-aff">Megagon Labs　{yoshi, jinfeng, yuliang, dan_z}@megagon.ai</span><br><br>
    Çağatay Demiralp<sup>*</sup><br>
    <span class="doduo-aff">Sigma Computing　cagatay@sigmacomputing.com</span><br><br>
    Chen Chen<sup>†</sup><br>
    <span class="doduo-aff">Megagon Labs　chen@megagon.ai</span><br><br>
    Wang-Chiew Tan<sup>*</sup><br>
    <span class="doduo-aff">Meta AI　wangchiew@fb.com</span>
  </div>
</header>


## 摘要

<p class="doduo-section-en" lang="en">ABSTRACT</p>


<p class="doduo-en" lang="en">Inferring meta information about tables, such as column headers or relationships between columns, is an active research topic in data management as we find many tables are missing some of this information. In this paper, we study the problem of annotating table columns (i.e., predicting column types and the relationships between columns) using only information from the table itself. We develop a multi-task learning framework (called Doduo) based on pre-trained language models, which takes the entire table as input and predicts column types/relations using a single model. Experimental results show that Doduo establishes new state-of-the-art performance on two benchmarks for the column type prediction and column relation prediction tasks with up to 4.0% and 11.9% improvements, respectively. We report that Doduo can already outperform the previous state-of-the-art performance with a minimal number of tokens, only 8 tokens per column. We release a toolbox<sup>1</sup> and confirm the effectiveness of Doduo on a real-world data science problem through a case study.</p>
<p class="doduo-zh" lang="zh-CN">推理表格的元信息——例如列标题或列与列之间的关系——是数据管理领域一个活跃的研究课题，因为我们发现许多表格都缺失了其中部分信息。本文研究仅利用表格自身的信息来标注表格列的问题（即预测列类型以及列与列之间的关系）。我们提出一个基于预训练语言模型的多任务学习框架（称为 Doduo），它以整张表格为输入，用单一模型预测列类型与列关系。实验结果表明，Doduo 在列类型预测与列关系预测这两个任务的基准数据集上建立了新的最优性能，分别提升最多 4.0% 和 11.9%。我们还报告，Doduo 仅用极少的 token——每列仅 8 个 token——就已能超越此前的最优性能。我们发布了一个工具箱<sup>1</sup>，并通过一个案例研究在真实世界的数据科学问题上验证了 Doduo 的有效性。</p>

<p class="doduo-en" lang="en">ACM Reference Format: Yoshihiko Suhara, Jinfeng Li, Yuliang Li, Dan Zhang, Çağatay Demiralp, Chen Chen, and Wang-Chiew Tan. 2022. Annotating Columns with Pre-trained Language Models. In Proceedings of the 2022 International Conference on Management of Data (SIGMOD ’22), June 12–17, 2022, Philadelphia, PA, USA. ACM, New York, NY, USA, 15 pages. https://doi.org/10.1145/3514221.3517906</p>
<p class="doduo-zh" lang="zh-CN">ACM 引用格式：Yoshihiko Suhara, Jinfeng Li, Yuliang Li, Dan Zhang, Çağatay Demiralp, Chen Chen, and Wang-Chiew Tan. 2022. Annotating Columns with Pre-trained Language Models（用预训练语言模型标注表格列）. 载于 Proceedings of the 2022 International Conference on Management of Data（SIGMOD ’22，2022 年国际数据管理会议论文集），2022 年 6 月 12–17 日，美国宾夕法尼亚州费城。ACM，美国纽约，15 页。https://doi.org/10.1145/3514221.3517906</p>

<div class="doduo-note">
  <div class="doduo-en" lang="en">Permission to make digital or hard copies of all or part of this work for personal or classroom use is granted without fee provided that copies are not made or distributed for profit or commercial advantage and that copies bear this notice and the full citation on the first page. Copyrights for components of this work owned by others than ACM must be honored. Abstracting with credit is permitted. Request permissions from permissions@acm.org. SIGMOD ’22, June 12–17, 2022, Philadelphia, PA, USA © 2022 Association for Computing Machinery. ACM ISBN 978-1-4503-9249-5/22/06. . . $15.00</div>
  <div class="doduo-zh" lang="zh-CN">允许为个人或课堂教学目的制作本作品全部或部分的数字或纸质副本，无需付费，前提是副本不得用于盈利或商业目的，且副本须保留本声明以及首页的完整引用。ACM 以外他人拥有的本作品组成部分的版权必须被尊重。允许带署名的摘要式引用。除此之外的复制、重新发布、上传至服务器或分发至列表，需事先获得具体许可和/或支付费用。请向 permissions@acm.org 申请许可。SIGMOD ’22，2022 年 6 月 12–17 日，美国宾夕法尼亚州费城　© 2022 美国计算机协会。ACM ISBN 978-1-4503-9249-5/22/06 . . . $15.00</div>
</div>


## 1 引言

<p class="doduo-section-en" lang="en">1　INTRODUCTION</p>


<p class="doduo-en" lang="en">Meta information about tables, such as column types and relationships between columns (or column relations), is crucial to a variety of data management tasks, including data quality control [45], schema matching [41], and data discovery [8]. Recently, there is an increasing interest in identifying semantic column types and relations [21, 22, 66]. Semantic column types such as “population”, “city”, and “birth_date” provide contain finer-grained, richer information than standard DB types such as integer or string. Similarly, semantic column relations such as a binary relation “is_birthplace_of” connecting a “name” and a “city” column can provide valuable information for understanding semantics of the table. For example, commercial systems (e.g., Google Data Studio [18], Tableau [46]) leverage such meta information for better table understanding. However, semantic column types and relations are typically missing in tables while annotating such meta information manually can be quite expensive. Thus, it is essential to build models that can automatically assign meta information to tables.</p>
<p class="doduo-zh" lang="zh-CN">关于表格的元信息，例如列类型和列与列之间的关系（即列关系），对多种数据管理任务都至关重要，包括数据质量控制 [45]、模式匹配（schema matching）[41] 和数据发现 [8]。近来，识别语义列类型及其关系引起了越来越多的关注 [21, 22, 66]。诸如“population”“city”“birth_date”这样的语义列类型，比 integer 或 string 等标准数据库类型提供了更细粒度、更丰富的信息。同样，诸如连接“name”列与“city”列的二元关系“is_birthplace_of”这样的语义列关系，也能为理解表格的语义提供有价值的信息。例如，商业系统（如 Google Data Studio [18]、Tableau [46]）就利用这类元信息来更好地理解表格。然而，语义列类型和列关系在表格中通常是缺失的，而人工标注这类元信息又可能相当昂贵。因此，构建能够自动为表格赋予元信息的模型十分必要。</p>

<p class="doduo-en" lang="en">Figure 2 shows two tables with missing column types and column relations. The table in Figure 2(a) is about animation films and the corresponding directors/producers/release countries of the films. In the second and third columns, person names will require context, both in the same column and the other columns, to determine the correct column types. For example, George Miller<sup>2</sup> appears in both columns as a director and a producer, and it is also a common name. Observing other names in the column helps better understand the semantics of the column. Furthermore, a column type is sometimes dependent on other columns of the table. Hence, by taking contextual information into account, the model can learn that the topic of the table is about (animation) films and understand that the second and third columns are less likely to be politician or athlete. To sum up, this example shows that the table context and both intra-column and inter-column context can be very useful for column type prediction.</p>
<p class="doduo-zh" lang="zh-CN">图 2 展示了两张缺失列类型和列关系的表格。图 2(a) 中的表格与动画电影以及这些电影对应的导演/制片人/发行国家有关。在第二列和第三列中，人名需要结合上下文——既包括同一列的上下文，也包括其他列的上下文——才能确定正确的列类型。例如，George Miller<sup>2</sup> 同时以导演和制片人的身份出现在这两列中，而且它本身也是一个常见姓名。观察该列中的其他名字有助于更好地理解这一列的语义。此外，列类型有时还依赖于表格的其他列。因此，通过考虑上下文信息，模型可以学到该表格的主题是关于（动画）电影的，并理解第二列和第三列不太可能是政治家或运动员。总而言之，这个例子表明，表格上下文以及列内上下文和列间上下文对于列类型预测都非常有用。</p>

<p class="doduo-en" lang="en">Figure 2(b) depicts a table with predicted column types and column relations. The column types person and location are helpful for predicting the relation place_of_birth. However, it will still need further information to distinguish whether the location is place_of_birth or place_of_death. The example above shows that column type and column relation prediction tasks are intrinsically related. Thus it will be synergistic to solve the two tasks simultaneously using a single framework.</p>
<p class="doduo-zh" lang="zh-CN">图 2(b) 描绘了一张带有预测列类型和列关系的表格。列类型 person 和 location 有助于预测关系 place_of_birth。但是，要区分该地点是 place_of_birth（出生地）还是 place_of_death（死亡地），仍需要进一步的信息。上面的例子说明，列类型预测与列关系预测这两个任务本质上是相互关联的。因此，使用单一框架同时求解这两个任务会产生协同效应。</p>

<p class="doduo-en" lang="en">To combine the synergies of column type prediction and column relation prediction tasks, we develop Doduo that: (1) learns column representations, (2) incorporates table context, and (3) uniformly handles both column annotation tasks. Most importantly, our solution (4) shares knowledge between the two tasks. Doduo leverages a pre-trained Transformer-based language models (LMs) and adopts multi-task learning into the model to appropriately “transfer” shared knowledge from/to the column type/relation prediction task. The use of the pre-trained Transformer-based LM makes Doduo a data-driven representation learning system<sup>3</sup> (i.e., feature engineering and/or external knowledge bases are not needed) (Challenge 1.) Pre-trained LM’s contextualized representations and our table-wise serialization enable Doduo to naturally incorporate table context into the prediction (Challenge 2) and to handle different tasks using a single model (Challenge 3.) Lastly, training such a table-wise model via multi-task learning helps “transfer” shared knowledge from/to different tasks (Challenge 4.)</p>
<p class="doduo-zh" lang="zh-CN">为了结合列类型预测与列关系预测这两个任务的协同效应，我们开发了 Doduo，它能够：（1）学习列表示；（2）融合表格上下文；（3）统一处理两种列标注任务。最重要的是，我们的方案（4）在两个任务之间共享知识。Doduo 利用预训练的、基于 Transformer 的语言模型（LM），并在模型中引入多任务学习，以便恰当地在列类型/列关系预测任务之间“迁移”共享知识。使用预训练的 Transformer LM 使 Doduo 成为一个数据驱动的表示学习系统<sup>3</sup>（即不需要特征工程和/或外部知识库）（挑战 1）。预训练 LM 的上下文化表示加上我们的表格级序列化，使 Doduo 能够自然地把表格上下文融入预测（挑战 2），并用单一模型处理不同任务（挑战 3）。最后，通过多任务学习训练这样一个表格级模型，有助于在不同任务之间“迁移”共享知识（挑战 4）。</p>

<p class="doduo-en" lang="en">Figure 1 depicts the model architecture of Doduo. Doduo takes as input values from multiple columns of a table after serialization and predicts column types and column relations as output. Doduo considers the table context by taking the serialized column values of all columns in the same table. This way, both intra-column (i.e., co-occurrence of tokens within the same column) and inter-column (i.e., co-occurrence of tokens in different columns) information is accounted for. Doduo appends a dummy symbol [CLS] at the beginning of each column and uses the corresponding embeddings as learned column representations for the column. The output layer on top of a column embedding (i.e., [CLS]) is used for column type prediction, whereas the output layer for the column relation prediction takes the column embeddings of each column pair.</p>
<p class="doduo-zh" lang="zh-CN">图 1 描绘了 Doduo 的模型架构。Doduo 以经过序列化的表格多列取值为输入，输出列类型和列关系的预测。Doduo 通过把同一表格中所有列的列值序列化后一并输入来考虑表格上下文。这样一来，列内信息（即同一列内 token 的共现）和列间信息（即不同列中 token 的共现）都被纳入考虑。Doduo 在每一列的开头附加一个哑符号 [CLS]，并把该符号对应的嵌入作为该列学习到的列表示。位于列嵌入（即 [CLS]）之上的输出层用于列类型预测，而列关系预测的输出层则接收每一对列的列嵌入。</p>

<figure class="doduo-figure">
  <a href="/images/posts/doduo-translation/figure-1.webp" target="_blank" rel="noopener" aria-label="在新标签页查看原图"><img src="/images/posts/doduo-translation/figure-1.webp" alt="图 1 / Figure 1" width="547" height="542" loading="lazy" decoding="async"></a>
  <figcaption>
    <div class="doduo-en" lang="en"><b>Figure 1:</b> Overview of Doduo’s model architecture. Doduo serializes the entire table into a sequence of tokens to make it compatible with the Transformer-based architecture. To handle the column type prediction and column relation extraction tasks, Doduo implements two different output layers on top of column representations and a pair of column representations, respectively.</div>
    <div class="doduo-zh" lang="zh-CN"><b>图 1：</b>Doduo 模型架构总览。Doduo 将整张表格序列化为一个 token 序列，使其与基于 Transformer 的架构相兼容。为处理列类型预测和列关系抽取这两个任务，Doduo 分别在列表示之上和一对列的表示之上实现了两种不同的输出层。</div>
  </figcaption>
</figure>


#### 贡献

<p class="doduo-section-en" lang="en">Contributions</p>

<p class="doduo-en" lang="en">Our contributions are:</p>
<p class="doduo-zh" lang="zh-CN">我们的贡献如下：</p>

<ul>
  <li>
    <div class="doduo-en" lang="en">We develop Doduo, a unified framework for both column type prediction and column relation prediction. Doduo incorporates table context through the Transformer architecture and is trained via multi-task learning.</div>
    <div class="doduo-zh" lang="zh-CN">我们开发了 Doduo，这是一个同时用于列类型预测和列关系预测的统一框架。Doduo 通过 Transformer 架构融合表格上下文，并通过多任务学习进行训练。</div>
  </li>
  <li>
    <div class="doduo-en" lang="en">Our experimental results show that Doduo establishes new state-of-the-art performance on two benchmarks, namely the WikiTable and VizNet datasets, with up to 4.0% and 11.9% improvements compared to TURL and Sato.</div>
    <div class="doduo-zh" lang="zh-CN">实验结果表明，Doduo 在两个基准数据集（即 WikiTable 和 VizNet）上建立了新的最优性能，相比 TURL 和 Sato 分别提升最多 4.0% 和 11.9%。</div>
  </li>
  <li>
    <div class="doduo-en" lang="en">We show that Doduo is data-efficient as it requires less training data or less input data. Doduo achieves competitive performance against previous state-of-the-art methods using less than half of the training data or only using 8 tokens per column as input.</div>
    <div class="doduo-zh" lang="zh-CN">我们证明 Doduo 具有数据高效性，即它需要更少的训练数据或更少的输入数据。Doduo 仅使用不到一半的训练数据，或仅使用每列 8 个 token 作为输入，就能达到与先前最优方法相竞争的性能。</div>
  </li>
  <li>
    <div class="doduo-en" lang="en">We release the codebase and models as a toolbox, which can be used with just a few lines of Python code. We test the performance of the toolbox on a real-world data science problem and verify the effectiveness of Doduo even on out-domain data.</div>
    <div class="doduo-zh" lang="zh-CN">我们以工具箱的形式发布了代码库和模型，只需几行 Python 代码即可使用。我们在一个真实世界的数据科学问题上测试了该工具箱的性能，并验证了 Doduo 即使在域外数据上仍然有效。</div>
  </li>
</ul>

<div class="doduo-note">
  <div class="doduo-en" lang="en"><sup>*</sup>Work done while the author was at Megagon Labs.　<sup>†</sup>Deceased.　<sup>1</sup>https://github.com/megagonlabs/doduo　<sup>2</sup>In this context, George Miller refers to an Australian filmmaker, but there exist more than 30 different Wikipedia articles that refer to different George Miller.　<sup>3</sup>In other words, Doduo relies on the general knowledge obtained from text corpora (e.g., Wikipedia) and a training set of tables annotated with column types and relations.</div>
  <div class="doduo-en" lang="en">　<sup>*</sup>该工作完成于作者任职于 Megagon Labs 期间。　<sup>†</sup>已故。　<sup>1</sup>https://github.com/megagonlabs/doduo　<sup>2</sup>在此语境中，George Miller 指的是澳大利亚的一位电影制作者，但维基百科上存在 30 多篇指向不同 George Miller 的词条。　<sup>3</sup>换言之，Doduo 依赖从文本语料（如维基百科）中获得的通用知识，以及一个带有列类型和关系标注的表格训练集。</div>
</div>


## 2 相关工作

<p class="doduo-section-en" lang="en">2　RELATED WORK</p>


<p class="doduo-en" lang="en">Existing column type prediction models enjoyed the recent advances in machine learning by formulating column type prediction as a multi-class classification task. Hulsebos et al. [22] developed a deep learning model called Sherlock, which applies neural networks on multiple feature sets such as word embeddings, character embeddings, and global statistics extracted from individual column values. Zhang et al. [66] developed Sato, which extends Sherlock by incorporating table context and structured output prediction to better model the nature of the correlation between columns in the same table. Other models such as ColNet [9], HNN [10], Meimei [48], <i>C</i><sup>2</sup> [24] use external Knowledge Bases (KBs) on top of machine learning models to improve column type prediction. Those techniques have shown success on column type prediction tasks, outperforming classical machine learning models. While those techniques identify the semantic types of individual columns, another line of work focuses on column relations between pairs of columns in the same table for better understanding tables [4, 13, 28, 29, 34, 54].</p>
<p class="doduo-zh" lang="zh-CN">已有的列类型预测模型受益于近年来机器学习的进展，它们把列类型预测表述为一个多类分类任务。Hulsebos 等人 [22] 开发了一个名为 Sherlock 的深度学习模型，在多种特征集上应用神经网络，例如词嵌入、字符嵌入以及从单列取值中提取的全局统计量。Zhang 等人 [66] 开发了 Sato，它在 Sherlock 的基础上加入表格上下文和结构化输出预测，以更好地刻画同一表格中各列之间相关性的本质。其他模型如 ColNet [9]、HNN [10]、Meimei [48]、<i>C</i><sup>2</sup> [24] 则在机器学习模型之上使用外部知识库（KB）来改进列类型预测。这些技术已在列类型预测任务上取得成功，性能优于经典机器学习模型。上述技术关注单列的语义类型，而另一条研究路线则关注同一表格中列与列之间的关系，以更好地理解表格 [4, 13, 28, 29, 34, 54]。</p>

<figure class="doduo-figure">
  <a href="/images/posts/doduo-translation/figure-2.webp" target="_blank" rel="noopener" aria-label="在新标签页查看原图"><img src="/images/posts/doduo-translation/figure-2.webp" alt="图 2 / Figure 2" width="1138" height="348" loading="lazy" decoding="async"></a>
  <figcaption>
    <div class="doduo-en" lang="en"><b>Figure 2:</b> Two example tables from the WikiTable dataset. (a) The task is to predict the column type of each column based on the table values. (b) The task is to predict both column types and relationships between columns. The column types (the column relations) are depicted at the top (at the bottom) of the table. This example also shows that column types and column relations are inter-dependent and hence, our motivation to develop a unified model for predicting both tasks.</div>
    <div class="doduo-zh" lang="zh-CN"><b>图 2：</b>来自 WikiTable 数据集的两张示例表格。(a) 任务是基于表格取值为每一列预测列类型。(b) 任务同时预测列类型与列间关系。列类型（列关系）标注在表格顶部（底部）。该示例还表明，列类型与列关系相互依赖，这也是我们开发统一模型同时预测两个任务的动机。</div>
  </figcaption>
</figure>

<p class="doduo-en" lang="en">A column relation is a semantic label between a pair of columns in a table, which offers more fine-grained information about the table. For example, a relation place_of_birth can be assigned to a pair of columns person and location to describe the relationship between them. Venetis et al. [54] use an Open IE tool [62] to extract triples to find relations between entities in the target columns. Muñoz et al. [34] use machine learning models to filter triple candidates created from DBPedia. Cannaviccio et al. [4] use a language model-based ranking method [65], which is trained on a large-scale web corpus, to re-rank relations extracted by an open relation extraction tool [35]. Cappuzzo et al. [5] represent table structure as a graph and then learn the embeddings from the descriptive summaries generated from the graph.</p>
<p class="doduo-zh" lang="zh-CN">列关系是表格中一对列之间的语义标签，它提供了关于表格更细粒度的信息。例如，可以为 person 和 location 这一对列赋予关系 place_of_birth，用来描述二者之间的关系。Venetis 等人 [54] 使用开放信息抽取（Open IE）工具 [62] 抽取三元组，以发现目标列中实体之间的关系。Muñoz 等人 [34] 使用机器学习模型过滤由 DBPedia 生成的三元组候选。Cannaviccio 等人 [4] 使用基于语言模型的排序方法 [65]（该方法在大规模网页语料上训练），对开放关系抽取工具 [35] 抽出的关系重新排序。Cappuzzo 等人 [5] 将表格结构表示为图，然后从由图生成的描述性摘要中学习嵌入。</p>

<p class="doduo-en" lang="en">Recently, pre-trained Transformer-based Language Models (LMs) such as BERT, which were originally designed for NLP tasks, have shown success in data management tasks. Li et al. [26] show that pre-trained LMs is a powerful base model for entity matching. Macdonald et al. [29] proposed applications for entity relation detection. Tang et al. [49] propose RPTs as a general framework for automating human-easy data preparation tasks like data cleaning, entity resolution and information extraction using pre-trained masked language models.</p>
<p class="doduo-zh" lang="zh-CN">近来，原本为自然语言处理任务设计的、基于 Transformer 的预训练语言模型（LM）如 BERT，已在数据管理任务中取得成功。Li 等人 [26] 表明，预训练 LM 是实体匹配的强大基础模型。Macdonald 等人 [29] 提出了用于实体关系检测的应用。Tang 等人 [49] 提出 RPT，作为一个通用框架，利用预训练掩码语言模型来自动化那些对人类而言容易的数据准备任务，如数据清洗、实体消解和信息抽取。</p>

<p class="doduo-en" lang="en">The power of Transformer-based pre-trained LMs can be summarized into two folds. First, using a stack of Transformer blocks (i.e., self-attention layers), the model is able to generate contextualized embeddings for structured data components like table cells, columns, or rows. Second, models pre-trained on large-scale textual corpora can store “semantic knowledge” from the training text in the form of model parameters. For example, BERT might know that George Miller is a director/producer since the name frequently appears together with “directed/produced by” in the text corpus used for pre-training. In fact, recent studies have shown that pre-trained LMs store a significant amount of factual knowledge, which can be retrieved by template-based queries [23, 40, 42].</p>
<p class="doduo-zh" lang="zh-CN">基于 Transformer 的预训练 LM 的能力可以概括为两方面。第一，借助堆叠的 Transformer 模块（即自注意力层），模型能够为表格单元、列或行等结构化数据成分生成上下文化嵌入。第二，在大规模文本语料上预训练的模型，能够以模型参数的形式存储来自训练文本的“语义知识”。例如，BERT 可能知道 George Miller 是一位导演/制片人，因为在用于预训练的文本语料中，这个名字经常与“directed/produced by”一同出现。事实上，近期研究表明，预训练 LM 存储了大量事实性知识，可以通过模板化查询将其检索出来 [23, 40, 42]。</p>

<p class="doduo-en" lang="en">Those pre-trained models have also shown success in data management tasks on tables. TURL [13] is a Transformer-based pre-training framework for table understanding tasks. Contextualized representations for tables are learned in an unsupervised way during pre-training and later applied to 6 different tasks in the fine-tuning phase. SeLaB [52] leverages pre-trained LMs for column annotation while incorporating table context. Their approach uses fine-tuned BERT models in a two-stage manner. TaPaS [20] conducts weakly supervised parsing via pre-training, and TaBERT [63] pre-trains for a joint understanding of textual and tabular data for the text-to-SQL task. TUTA [58] makes use of different pre-training objectives to obtain representations at token, cell, and table levels and propose a tree-based structure to describe spatial and hierarchical information in tables. TCN [57] makes use of both information within the table and across external tables from similar domains to predict column type and pairwise column relations.</p>
<p class="doduo-zh" lang="zh-CN">这些预训练模型在面向表格的数据管理任务中也已显示出成效。TURL [13] 是一个面向表格理解任务的、基于 Transformer 的预训练框架。表格的上下文化表示在预训练阶段以无监督方式学习，随后在微调阶段应用于 6 个不同任务。SeLaB [52] 在融合表格上下文的同时，利用预训练 LM 进行列标注，其方法以两阶段方式使用微调后的 BERT 模型。TaPaS [20] 通过预训练进行弱监督解析，TaBERT [63] 则为 text-to-SQL 任务预训练，以联合理解文本数据与表格数据。TUTA [58] 利用不同的预训练目标，获得 token 级、单元级和表格级的表示，并提出一种基于树的结构来描述表格中的空间与层次信息。TCN [57] 同时利用表格内部的信息以及来自相似领域的其他外部表格的信息，来预测列类型和列对之间的关系。</p>

<p class="doduo-en" lang="en">In this paper, we empirically compare Doduo with Sherlock [22], Sato [66], and TURL [13] as baseline methods. Sherlock is a single column model while Doduo is multi-column by leveraging table context to predict column types and relations more accurately. Sato leverages topic model (LDA) features as table context while Doduo can additionally take into account fine-grained, token-level interactions among columns via its built-in self-attention mechanism.</p>
<p class="doduo-zh" lang="zh-CN">在本文中，我们以 Sherlock [22]、Sato [66] 和 TURL [13] 作为基线方法，对 Doduo 进行实证比较。Sherlock 是单列模型，而 Doduo 是多列模型，利用表格上下文更准确地预测列类型与列关系。Sato 利用主题模型（LDA）特征作为表格上下文，而 Doduo 还能通过其内置的自注意力机制考虑列之间细粒度的、token 级的交互。</p>

<div class="doduo-tbl-cap">
  <div class="doduo-en" lang="en"><b>Table 1:</b> Notations.</div>
  <div class="doduo-zh" lang="zh-CN"><b>表 1：</b>符号说明。</div>
</div>
<table class="doduo-table" tabindex="0" aria-label="论文数据表，可横向滚动">
  <tr><th>Symbol 符号</th><th>Description 描述</th></tr>
  <tr><td><i>T</i> = (<i>c</i><sub>1</sub>, <i>c</i><sub>2</sub>, . . . , <i>c</i><sub>n</sub>)</td><td>Columns in a table.　表中的列。</td></tr>
  <tr><td><i>c</i><sub>i</sub> = (<i>v</i><sup>i</sup><sub>1</sub>, <i>v</i><sup>i</sup><sub>2</sub>, . . . , <i>v</i><sup>i</sup><sub>m</sub>)</td><td>Column values.　列值。</td></tr>
  <tr><td><i>v</i><sup>i</sup><sub>j</sub> = (<i>w</i><sup>i</sup><sub>j,1</sub>, <i>w</i><sup>i</sup><sub>j,2</sub>, . . . , <i>w</i><sup>i</sup><sub>j,K</sub>)</td><td>A single column value.　单个列值。</td></tr>
  <tr><td><i>D</i><sub>train</sub> = {(<i>T</i><sup>(n)</sup>, <i>L</i><sup>(n)</sup><sub>type</sub>, <i>L</i><sup>(n)</sup><sub>rel</sub>)}<sup>N</sup><sub>n=1</sub></td><td>Training data　训练数据</td></tr>
  <tr><td><i>L</i><sub>type</sub> = (<i>l</i><sub>1</sub>, <i>l</i><sub>2</sub>, . . . , <i>l</i><sub>n</sub>), <i>l</i><sub>*</sub> ∈ <i>C</i><sub>type</sub></td><td>Column type labels.　列类型标签。</td></tr>
  <tr><td><i>L</i><sub>rel</sub> = (<i>l</i><sub>1,2</sub>, <i>l</i><sub>1,3</sub>, . . . , <i>l</i><sub>1,n</sub>), <i>l</i><sub>*,*</sub> ∈ <i>C</i><sub>rel</sub></td><td>Column relation labels.　列关系标签。</td></tr>
</table>

<p class="doduo-en" lang="en">TURL is also a Transformer-based model like Doduo but it requires additional meta table information such as table headers for pre-training. Doduo is more generic as it predicts column types and relations only relying on cell values in the table. See Section 5 for a more detailed comparison.</p>
<p class="doduo-zh" lang="zh-CN">TURL 与 Doduo 一样也是基于 Transformer 的模型，但它在预训练时需要额外的表元信息，例如表头。Doduo 更为通用，因为它在预测列类型和列关系时仅依赖表格中的单元值。更详细的比较见第 5 节。</p>


## 3 背景

<p class="doduo-section-en" lang="en">3　BACKGROUND</p>


<p class="doduo-en" lang="en">In this section, we formally define the two column annotation tasks: column type prediction and column relation annotation. We also provide a brief background on pre-trained language models (LMs) and how to fine-tune them for performing column annotations.</p>
<p class="doduo-zh" lang="zh-CN">本节正式定义两个列标注任务：列类型预测和列关系标注。我们还会简要介绍预训练语言模型（LM）的背景知识，以及如何微调它们以完成列标注。</p>


### 3.1 问题形式化

<p class="doduo-section-en" lang="en">3.1　Problem Formulation</p>


<p class="doduo-en" lang="en">The goal of the column type prediction task is to classify each column to its semantic type, such as “country name”, “population”, and “birthday” instead of the standard column types such as string, int, or Datetime. See also Figure 2 for more examples. For column relation annotation, our goal is to classify the relation of each pair of columns. In Figure 2, the relation between the “person” column and the “location” column can be “place_of_birth”.</p>
<p class="doduo-zh" lang="zh-CN">列类型预测任务的目标是把每一列分类到其语义类型，例如“country name”“population”“birthday”，而不是 string、int 或 Datetime 等标准列类型。更多示例参见图 2。对于列关系标注，我们的目标是对每一对列的关系进行分类。在图 2 中，“person”列与“location”列之间的关系可以是“place_of_birth”。</p>

<p class="doduo-en" lang="en">As summarized in Table 1, more formally, we consider a standard relational data model where a relation <i>T</i> (i.e., table) consists of a set of attributes <i>T</i> = (<i>c</i><sub>1</sub>, . . . <i>c</i><sub>n</sub>) (i.e., columns.) We denote by val(<i>T</i>.<i>c</i><sub>i</sub>) the sequence of data values stored at the column <i>c</i><sub>i</sub>. For each value <i>v</i> ∈ val(<i>T</i>.<i>c</i><sub>i</sub>), we assume <i>v</i> to be of the string type and can be split into a sequence of input tokens <i>v</i> = [<i>w</i><sub>1</sub>, . . . , <i>w</i><sub>k</sub>] to pre-trained LMs. This approach of casting cell values into text might seem restricted since tables columns can be of numeric types such as float or date. There has been extensions of the Transformer models to support numeric data [60] and providing such direct support of numeric data is important future work. We also provide a brief analysis on Doduo’s performance on numeric column types in Section 5.4.</p>
<p class="doduo-zh" lang="zh-CN">如表 1 所总结，更形式化地说，我们考虑标准的关系数据模型，其中一个关系 <i>T</i>（即表格）由一组属性 <i>T</i> = (<i>c</i><sub>1</sub>, . . . <i>c</i><sub>n</sub>)（即列）组成。我们用 val(<i>T</i>.<i>c</i><sub>i</sub>) 表示存储在列 <i>c</i><sub>i</sub> 上的数据值序列。对于每个值 <i>v</i> ∈ val(<i>T</i>.<i>c</i><sub>i</sub>)，我们假定 <i>v</i> 为字符串类型，并可切分为预训练 LM 的输入 token 序列 <i>v</i> = [<i>w</i><sub>1</sub>, . . . , <i>w</i><sub>k</sub>]。由于表格列也可能是 float 或 date 等数值类型，这种把单元值转换为文本的做法看似有一定局限。已有研究对 Transformer 模型做了扩展以支持数值数据 [60]，而直接支持数值数据是重要的未来工作。我们也在第 5.4 节对 Doduo 在数值列类型上的表现做了简要分析。</p>

<p class="doduo-en" lang="en"><b>Problem 1 (Column type prediction).</b> Given a table <i>T</i> and a column <i>c</i><sub>i</sub> in <i>T</i>, a column type prediction model M with type vocabulary <i>C</i><sub>type</sub> predicts a column type M(<i>T</i>, <i>c</i><sub>i</sub>) ∈ <i>C</i><sub>type</sub> that best describes the semantics of <i>c</i><sub>i</sub>.</p>
<p class="doduo-zh" lang="zh-CN"><b>问题 1（列类型预测）。</b>给定表格 <i>T</i> 及 <i>T</i> 中的列 <i>c</i><sub>i</sub>，一个具有类型词表 <i>C</i><sub>type</sub> 的列类型预测模型 M 预测出一个列类型 M(<i>T</i>, <i>c</i><sub>i</sub>) ∈ <i>C</i><sub>type</sub>，以最好地描述 <i>c</i><sub>i</sub> 的语义。</p>

<p class="doduo-en" lang="en"><b>Problem 2 (Column relation prediction).</b> Given a table <i>T</i> and a pair of columns (<i>c</i><sub>i</sub>, <i>c</i><sub>j</sub>) in <i>T</i>, a column relation prediction model M with relation vocabulary <i>C</i><sub>rel</sub> predicts a relation M(<i>T</i>, <i>c</i><sub>i</sub>, <i>c</i><sub>j</sub>) ∈ <i>C</i><sub>rel</sub> that best describes the semantics of the relation between <i>c</i><sub>i</sub> and <i>c</i><sub>j</sub>.</p>
<p class="doduo-zh" lang="zh-CN"><b>问题 2（列关系预测）。</b>给定表格 <i>T</i> 及 <i>T</i> 中的一对列 (<i>c</i><sub>i</sub>, <i>c</i><sub>j</sub>)，一个具有关系词表 <i>C</i><sub>rel</sub> 的列关系预测模型 M 预测出一个关系 M(<i>T</i>, <i>c</i><sub>i</sub>, <i>c</i><sub>j</sub>) ∈ <i>C</i><sub>rel</sub>，以最好地描述 <i>c</i><sub>i</sub> 与 <i>c</i><sub>j</sub> 之间关系的语义。</p>

<p class="doduo-en" lang="en">In Doduo, we consider the supervised setting of multi-class classification. This means that we assume a training data set <i>D</i><sub>train</sub> of tables annotated with columns types and relations from two fixed vocabularies (<i>C</i><sub>type</sub>, <i>C</i><sub>rel</sub>). Note that Doduo does not restrict itself to specific choices of vocabularies (<i>C</i><sub>type</sub>, <i>C</i><sub>rel</sub>) which are customizable by switching the training set <i>D</i><sub>train</sub>. In practice, the choice of (<i>C</i><sub>type</sub>, <i>C</i><sub>rel</sub>) is ideally application-dependent. For example, if the downstream task requires integration with a Knowledge Base (KB), it is ideal to have (<i>C</i><sub>type</sub>, <i>C</i><sub>rel</sub>) aligned with the KB’s type/relation vocabulary. In our experiment, we evaluated Doduo on datasets annotated with (1) KB types [2] and (2) DBPedia types [36].</p>
<p class="doduo-zh" lang="zh-CN">在 Doduo 中，我们考虑多类分类的监督设定。这意味着我们假设有一个训练数据集 <i>D</i><sub>train</sub>，其中的表格带有来自两个固定词表（<i>C</i><sub>type</sub>、<i>C</i><sub>rel</sub>）的列类型和关系标注。请注意，Doduo 并不局限于特定的词表（<i>C</i><sub>type</sub>、<i>C</i><sub>rel</sub>）选择，这些词表可以通过更换训练集 <i>D</i><sub>train</sub> 来自定义。在实践中，（<i>C</i><sub>type</sub>、<i>C</i><sub>rel</sub>）的选择最好依赖于具体应用。例如，如果下游任务需要与某个知识库（KB）集成，那么最好使（<i>C</i><sub>type</sub>、<i>C</i><sub>rel</sub>）与该知识库的类型/关系词表保持一致。在我们的实验中，我们在分别带有 (1) KB 类型 [2] 和 (2) DBPedia 类型 [36] 标注的数据集上评估了 Doduo。</p>

<p class="doduo-en" lang="en">The size and quality of the training set are also important for training high-quality column annotation models. While manually creating such datasets can be quite expensive, the datasets used in our experiments rely on heuristics that map table meta-data (e.g., header names, entity links) to type names to create training sets of large scale. See Section 5.1 for more details. While KB can work as a training example provider, Doduo does not require the training examples to be from a single source but can combine labels from any resources such as human annotations, labeling rules, and meta-data that can be transformed into the column type/relation label format. We also note that the learning goal of Doduo is to train column annotation models with high accuracy while being generalizable to unannotated tables (e.g., as measured by an unseen test set <i>D</i><sub>test</sub>).</p>
<p class="doduo-zh" lang="zh-CN">训练集的规模和质量对于训练高质量的列标注模型同样重要。虽然人工构建这类数据集可能相当昂贵，但我们实验中使用的数据集依赖启发式规则，将表元数据（如表头名称、实体链接）映射为类型名称，从而构建大规模训练集。更多细节见第 5.1 节。虽然知识库可以作为训练样本的提供者，但 Doduo 并不要求训练样本来自单一来源，而是可以组合任何资源产生的标签，例如人工标注、标注规则，以及能够转换为列类型/关系标签格式的元数据。我们还要指出，Doduo 的学习目标是在对未标注表格（例如以未见过的测试集 <i>D</i><sub>test</sub> 衡量）保持泛化能力的同时，训练出高准确率的列标注模型。</p>

<p class="doduo-en" lang="en">The column type/relation prediction models of Doduo only considers the table content (i.e., cell values) as input. This setting allows Doduo to be more flexible to practical applications without replying on auxiliary information such as column names, table titles/captions, or adjacent tables typically required by existing works (See Section 2 for a comprehensive overview).</p>
<p class="doduo-zh" lang="zh-CN">Doduo 的列类型/关系预测模型只把表格内容（即单元值）作为输入。这一设定使 Doduo 在实际应用中更为灵活，无需依赖现有工作通常所需的辅助信息，例如列名、表标题/表注，或相邻表格（全面的综述见第 2 节）。</p>


### 3.2 预训练语言模型

<p class="doduo-section-en" lang="en">3.2　Pre-trained Language Models</p>


<p class="doduo-en" lang="en">Pre-trained Language Models (LMs) emerge as general-purpose solutions to tackle various natural language processing (NLP) tasks. Representative LMs such as BERT [14] and ERNIE [47] have shown leading performance among all solutions in NLP benchmarks such as GLUE [17, 56]. These models are pre-trained on large text corpora such as Wikipedia pages and typically employ multi-layer Transformer blocks [53] to assign more weights to informative words and less weight to stop words for processing raw texts. During pre-training, a model is trained on self-supervised language prediction tasks such as missing token prediction and next-sentence prediction. The purpose is to learn the semantic correlation of word tokens (e.g., synonyms), such that correlated tokens can be projected to similar vector representations. After pre-training, the model is able to learn the lexical meaning of the input sequence in the shallow layers and the syntactic and semantic meanings in the deeper layers [11, 50].</p>
<p class="doduo-zh" lang="zh-CN">预训练语言模型（LM）已成为处理各类自然语言处理（NLP）任务的通用方案。BERT [14] 和 ERNIE [47] 等代表性 LM 在 GLUE [17, 56] 等 NLP 基准上表现出领先于其他所有方案的性能。这些模型在维基百科页面等大规模文本语料上预训练，通常采用多层 Transformer 模块 [53]，在处理原始文本时对信息量大的词赋予更高权重，对停用词赋予更低权重。在预训练期间，模型在自监督的语言预测任务上训练，例如缺失 token 预测和下一句预测。其目的是学习词 token 之间的语义相关性（如同义词），使得相关的 token 可以被投影到相似的向量表示上。预训练之后，模型能够在浅层学到输入序列的词法意义，在深层学到句法和语义意义 [11, 50]。</p>

<p class="doduo-en" lang="en">A special component of pre-trained LMs is the attention mechanism, which embeds a word into a vector based on its context (i.e., surrounding words). The same word has different vectors if it appears in different sentences, and this is very different from other embedding mechanisms such as word2vec [32], GloVe [39], and fastText [1], which always generate the same vector for the same word in any context. Pre-trained LMs’ embeddings are context dependent and thus offer two strengths. First, it can discern polysemy. For example, the person name George Miller referring to a producer is different from the same name that refers to a director. Pre-trained LMs discern the difference and generate different vectors. Second, the embedding deals with synonyms well. For example, the words Derrick Henry and Derrick Lamar Henry Jr (respectively, (USA, US), (Oregon, OR)) are likely the same given their respective contexts. Pre-trained LMs will generate similar word vectors accordingly. Due to the two favorable strengths, pre-trained models should enable the best performance to column annotation tasks, where each cell value is succinct, and its meaning highly depends on its surrounding cells.</p>
<p class="doduo-zh" lang="zh-CN">预训练 LM 的一个特殊组件是注意力机制，它根据词的上下文（即周围的词）把词嵌入为向量。同一个词若出现在不同句子中，就会有不同的向量，这与 word2vec [32]、GloVe [39]、fastText [1] 等其他嵌入机制非常不同，后者在任何上下文中对同一个词总是生成相同的向量。预训练 LM 的嵌入依赖于上下文，因而具备两个优势。第一，它能辨别一词多义。例如，作为制片人的 George Miller 与作为导演的同名者并不相同，预训练 LM 能辨别这种差异并生成不同的向量。第二，这种嵌入能很好地处理同义表达。例如，Derrick Henry 与 Derrick Lamar Henry Jr（以及 (USA, US)、(Oregon, OR)）在各自上下文中很可能是同一个对象，预训练 LM 会相应地生成相似的词向量。由于这两项优势，预训练模型应当能在列标注任务上取得最佳性能——在列标注中，每个单元值都很简短，其含义高度依赖周围的单元。</p>

<p class="doduo-en" lang="en">The pre-trained model does not know what to predict for specific tasks unless the task is exactly the same the pre-training task. Thus, a pre-trained LM needs to be fine-tuned with task-specific training data, so the model can be tailored for the task. A task-specific output layer is attached to the final layer of the pre-trained LM, and the loss value (e.g., cross-entropy loss) is back-propagated from the output layer to the pre-trained LM for a minor adjustment. In this paper, we fine-tune the popular 12-layer BERT Base model [14]. However, Doduo is independent of the choice of pre-trained LMs, and Doduo can potentially perform even better with larger pre-trained LMs.</p>
<p class="doduo-zh" lang="zh-CN">除非任务与预训练任务完全一致，预训练模型并不知道针对具体任务该预测什么。因此，需要用任务相关的训练数据对预训练 LM 进行微调，使模型适配该任务。任务相关的输出层被接在预训练 LM 的最后一层之上，损失值（如交叉熵损失）从输出层反向传播到预训练 LM，从而做小幅调整。在本文中，我们微调了常用的 12 层 BERT Base 模型 [14]。不过，Doduo 与预训练 LM 的选择无关，若使用更大的预训练 LM，Doduo 的表现有可能更好。</p>


### 3.3 多任务学习

<p class="doduo-section-en" lang="en">3.3　Multi-task learning</p>


<p class="doduo-en" lang="en">Multi-task learning [7] is a type of supervised machine learning framework, where the objective function is calculated based on more than one task. Generally, different types of labels are used, and the labels may be or may not be annotated on the same example. The intuition and an assumption behind multi-task learning is that the tasks intrinsically share knowledge, and thus, training with the same base model benefits each other. The major benefit of multi-task learning is that it can help improve the generalization performance of the model, especially when the training data is not sufficient.</p>
<p class="doduo-zh" lang="zh-CN">多任务学习 [7] 是一类监督机器学习框架，其目标函数基于不止一个任务来计算。通常使用不同类型的标签，而这些标签可能标注在同一个样本上，也可能不是。多任务学习背后的直觉与假设是：这些任务本质上是共享知识的，因此用同一个基础模型训练它们会彼此受益。多任务学习的主要好处是能帮助提升模型的泛化性能，尤其是在训练数据不充分时。</p>

<p class="doduo-en" lang="en">Multi-task learning can be easily applied to Deep Learning models [44] by attaching different output layers to the main model, which is considered a “learned” representation encoder that converts input data to dense representations. There are a variety of approaches for multi-task learning [44], depending on how to model and optimize shared parameters. Multi-task learning models can be split into two categories based on how parameters are shared. With hard parameter sharing [6], models for multiple tasks share the same parameters, whereas soft parameter sharing [61] adds constraints on distinct models for different tasks. In this paper, we consider hard parameter sharing as it is a more cost-effective approach. Among hard parameter sharing models, we choose a joint multi-task learning framework [19] that uses the same base model with different output layers for different tasks.</p>
<p class="doduo-zh" lang="zh-CN">多任务学习可以很容易地应用于深度学习模型 [44]：在主模型上挂接不同的输出层，而主模型被视为一个“学习得到的”表示编码器，将输入数据转换为稠密表示。多任务学习有多种方法 [44]，取决于如何建模和优化共享参数。按参数共享方式，多任务学习模型可分为两类。硬参数共享 [6] 中，多个任务的模型共享同一组参数；而软参数共享 [61] 则对不同任务的不同模型施加约束。本文考虑硬参数共享，因为它更具成本效益。在硬参数共享模型中，我们选择联合多任务学习框架 [19]，即对不同任务使用相同的基础模型和不同的输出层。</p>


## 4 模型

<p class="doduo-section-en" lang="en">4　MODEL</p>


<p class="doduo-en" lang="en">In this section, we first introduce a baseline single-column model that fine-tunes a pre-trained LM on individual columns. Then, we describe Doduo’s model architecture and training procedure.</p>
<p class="doduo-zh" lang="zh-CN">本节首先介绍一个基线单列模型，它在单个列上微调预训练 LM。然后，我们描述 Doduo 的模型架构与训练过程。</p>


### 4.1 单列模型

<p class="doduo-section-en" lang="en">4.1　Single-column Model</p>


<p class="doduo-en" lang="en">Since LMs take token sequences (i.e., text) as input, one first has to convert a table into token sequences so that they can be meaningfully processed by LMs. A straightforward serialization strategy is to simply concatenate column values to make a sequence of tokens and feed that sequence as input to the model. That is, suppose a column <i>C</i> has column values <i>v</i><sub>1</sub>, . . . <i>v</i><sub>m</sub>, the serialized sequence is serialize<sub>single</sub>(<i>C</i>) ::= [CLS] <i>v</i><sub>1</sub> . . . <i>v</i><sub>m</sub> [SEP], where [CLS] and [SEP] are special tokens used to mark the beginning and end of a sequence<sup>4</sup>. For example, the first column of the first table in Figure 2 is serialized as: [CLS] Happy Feet Cars Flushed Away [SEP]. This serialization converts the problem into a sequence classification task. Thus, it is straightforward to fine-tune a BERT model using training data.</p>
<p class="doduo-zh" lang="zh-CN">由于 LM 以 token 序列（即文本）为输入，首先必须把表格转换为 token 序列，才能被 LM 有意义地处理。一种直接的序列化策略是简单地把列值拼接成一个 token 序列，并将该序列作为模型输入。也就是说，假设列 <i>C</i> 的列值为 <i>v</i><sub>1</sub>, . . . <i>v</i><sub>m</sub>，则序列化为 serialize<sub>single</sub>(<i>C</i>) ::= [CLS] <i>v</i><sub>1</sub> . . . <i>v</i><sub>m</sub> [SEP]，其中 [CLS] 和 [SEP] 是用于标记序列开始与结束的特殊 token<sup>4</sup>。例如，图 2 中第一张表的第一列被序列化为：[CLS] Happy Feet Cars Flushed Away [SEP]。这种序列化把问题转化为一个序列分类任务，因此用训练数据微调 BERT 模型是直接可行的。</p>

<p class="doduo-en" lang="en">The column relation prediction task can be also formulated as a sequence classification task by converting a pair of columns (instead of a single column) into a token sequence in a similar manner. For this case, we also insert additional [SEP] between values of two columns to help the pre-trained LM distinguish the two columns. Namely, given two columns <i>C</i> = <i>v</i><sub>1</sub>, . . . , <i>v</i><sub>m</sub> and <i>C</i>′ = <i>v</i>′<sub>1</sub>, . . . , <i>v</i>′<sub>m</sub>, the single-column model serializes the pair as: serialize<sub>single</sub>(<i>C</i>, <i>C</i>′) ::= [CLS] <i>v</i><sub>1</sub> . . . <i>v</i><sub>m</sub> [SEP] <i>v</i>′<sub>1</sub> . . . <i>v</i>′<sub>m</sub> [SEP].</p>
<p class="doduo-zh" lang="zh-CN">列关系预测任务同样可以表述为序列分类任务：以类似方式把一对列（而非单列）转换为一个 token 序列。在这种情况下，我们还会在两列的取值之间插入额外的 [SEP]，以帮助预训练 LM 区分这两列。也就是说，给定两列 <i>C</i> = <i>v</i><sub>1</sub>, . . . , <i>v</i><sub>m</sub> 和 <i>C</i>′ = <i>v</i>′<sub>1</sub>, . . . , <i>v</i>′<sub>m</sub>，单列模型把这一对列序列化为：serialize<sub>single</sub>(<i>C</i>, <i>C</i>′) ::= [CLS] <i>v</i><sub>1</sub> . . . <i>v</i><sub>m</sub> [SEP] <i>v</i>′<sub>1</sub> . . . <i>v</i>′<sub>m</sub> [SEP]。</p>

<p class="doduo-en" lang="en">Using the above serialization scheme, we can cast the column type and relation prediction tasks as sequence classification and sequence-pair classification tasks, which can be solved by LM fine-tuning. However, such sequence classifications predict column types independently, even if they are in the same table. We refer to this method as the single-column model. Although the single-column model can leverage the language understanding capability and knowledge learned by the LM via pre-training, it has an obvious drawback of treating columns in the same table as independent sequences. As a result, the single-column model fails to capture the table context, which is known to be important for the column annotation tasks [10, 24, 66].</p>
<p class="doduo-zh" lang="zh-CN">使用上述序列化方案，我们可以把列类型预测和列关系预测任务转化为序列分类与序列对分类任务，通过微调 LM 即可求解。然而，这类序列分类是独立地预测列类型，即便这些列位于同一张表格中。我们把这种方法称为单列模型。虽然单列模型可以利用 LM 通过预训练获得的语言理解能力和知识，但它有一个明显缺陷：把同一表格中的列当作彼此独立的序列。因此，单列模型无法捕捉表格上下文，而已有研究表明表格上下文对列标注任务十分重要 [10, 24, 66]。</p>


### 4.2 表格序列化

<p class="doduo-section-en" lang="en">4.2　Table Serialization</p>


<p class="doduo-en" lang="en">In contrast to the single-column model described above, Doduo is a multi-column (or table-wise) model that takes an entire table as input. Doduo serializes data entries as follows: for each table that has <i>n</i> columns <i>T</i> = (<i>c</i><sub>i</sub>)<sup>n</sup><sub>i=1</sub>, where each column has <i>N</i><sub>m</sub> column values <i>c</i><sub>i</sub> = (<i>v</i><sup>i</sup><sub>j</sub>)<sup>m</sup><sub>j=1</sub>. We let serialize(<i>T</i>) ::= [CLS] <i>v</i><sup>1</sup><sub>1</sub> . . . [CLS] <i>v</i><sup>n</sup><sub>1</sub> . . . <i>v</i><sup>n</sup><sub>m</sub> [SEP]. For example, the first table in Figure 2 is serialized as:</p>
<p class="doduo-zh" lang="zh-CN">与上述单列模型不同，Doduo 是一个多列（或表格级）模型，以整张表格为输入。Doduo 对数据条目做如下序列化：对于有 <i>n</i> 列的表格 <i>T</i> = (<i>c</i><sub>i</sub>)<sup>n</sup><sub>i=1</sub>，其中每列有 <i>N</i><sub>m</sub> 个列值 <i>c</i><sub>i</sub> = (<i>v</i><sup>i</sup><sub>j</sub>)<sup>m</sup><sub>j=1</sub>。令 serialize(<i>T</i>) ::= [CLS] <i>v</i><sup>1</sup><sub>1</sub> . . . [CLS] <i>v</i><sup>n</sup><sub>1</sub> . . . <i>v</i><sup>n</sup><sub>m</sub> [SEP]。例如，图 2 中的第一张表被序列化为：</p>

<p class="doduo-en" lang="en">[CLS] Happy Feet, . . . [CLS] George Miller, . . . [CLS] USA, . . . , France [SEP].</p>
<p class="doduo-zh" lang="zh-CN">（即：[CLS] Happy Feet，…… [CLS] George Miller，…… [CLS] USA，……，France [SEP]。）</p>

<p class="doduo-en" lang="en">Different from the single-column model, which always has a single [CLS] token in the input, Doduo’s serialization method inserts as many [CLS] tokens as the number of columns in the input table. This difference makes a change in the classification formulation. While the single-column model classifies a single sequence (i.e., a single column) by predicting a single label, Doduo predicts as many labels as the number of [CLS] tokens in the input sequence. The learning procedure of Doduo starts by serializing and tokenizing all tables in the datasets (Line 3-4 of Algorithm 1.)</p>
<p class="doduo-zh" lang="zh-CN">单列模型的输入中始终只有一个 [CLS] token，而 Doduo 的序列化方法插入了与输入表格列数相同数量的 [CLS] token。这一差异改变了分类的表述方式：单列模型对单个序列（即单列）作分类，预测单个标签；而 Doduo 预测的标签数量等于输入序列中 [CLS] token 的数量。Doduo 的学习过程首先对数据集中所有表格进行序列化和分词（算法 1 第 3–4 行）。</p>

<div class="doduo-note">
  <div class="doduo-en" lang="en"><sup>4</sup>Note that [CLS] and [SEP] are the special tokens for BERT and other LMs may have other special tokens, which are usually implemented as part of their tokenizers.</div>
  <div class="doduo-en" lang="en">　<sup>4</sup>注意 [CLS] 和 [SEP] 是 BERT 的特殊 token，其他 LM 可能有不同的特殊 token，通常作为其分词器的一部分实现。</div>
</div>

<p class="doduo-en" lang="en"><b>Algorithm 1:</b> Training procedure of Doduo</p>
<pre class="doduo-algo"><code>Input: Number of training epochs N_Epoch; For each task i ∈ [1,T], training set D_i,&#10;       loss function L_i, and optimizer O_i&#10;Output: Annotation model M = (LM, {g_1, . . . , g_T}) with a language model LM and&#10;        T heads g_1 to g_T&#10;&#10;// Initialize model weights&#10;1  Initialize LM using its pre-trained weights;&#10;2  Initialize {g_1, . . . , g_T} randomly;&#10;&#10;// Serialize all tables in each training set&#10;3  for i = 1 to T do&#10;4      D_i ← {serialize(T) for T ∈ D_i};&#10;&#10;5  for ep = 1 to N_Epoch do&#10;6      for i = 1 to T do&#10;7          Randomly split D_i into mini-batches {B_1, . . . B_k};&#10;8          for B in {B_1, . . . B_k} do&#10;               // Evaluate the L_i loss func on the g_i head&#10;9              L ← L_i(B, LM ⊕ g_i);&#10;               // Back-propagate to update model weights&#10;10             M ← back-propagate(M, O_i, ∂L/∂(LM ⊕ g_i));&#10;&#10;11 return M;</code></pre>
<p class="doduo-zh" lang="zh-CN">算法 1：Doduo 的训练过程。输入：训练轮数 N_Epoch；对每个任务 i ∈ [1,T]，训练集 D_i、损失函数 L_i 和优化器 O_i。输出：标注模型 M = (LM, {g_1, . . . , g_T})，包含语言模型 LM 与 T 个输出头 g_1 至 g_T。步骤：用预训练权重初始化 LM；随机初始化各输出头；对每个任务的训练集内所有表格做序列化；随后在每一轮中依次对每个任务随机划分小批量，在该任务的输出头上计算损失，并反向传播更新模型参数；最后返回 M。</p>


### 4.3 上下文化的列表示

<p class="doduo-section-en" lang="en">4.3　Contextualized Column Representations</p>


<p class="doduo-en" lang="en">We describe how Doduo obtains table context through contextualized column embeddings using the Transformer architecture. Figure 3 depicts how each Transformer block of the Doduo aggregates contextual information from all columns values (including dummy [CLS] symbols and themselves) in the same table. Specifically, this example illustrates the first Transformer layer calculates the attention vector by aggregating embeddings of other tokens based on the similarity against the second column’s [CLS] token. Thus, an attention vector for the same symbol (e.g., George) can be different when it appears in a different context. This resolves the ambiguity issue of conventional word embedding techniques such as word2vec or GloVe.</p>
<p class="doduo-zh" lang="zh-CN">我们描述 Doduo 如何借助 Transformer 架构，通过上下文化的列嵌入获得表格上下文。图 3 描绘了 Doduo 的每个 Transformer 模块如何从同一表格的所有列值（包括哑符号 [CLS] 及其自身）聚合上下文信息。具体而言，该示例展示了第一层 Transformer 如何以第二列的 [CLS] token 为参照，根据与其他 token 的相似度聚合它们的嵌入来计算注意力向量。因此，同一个符号（如 George）出现在不同上下文中时，其注意力向量可以不同。这解决了 word2vec 或 GloVe 等传统词嵌入技术的歧义问题。</p>

<figure class="doduo-figure">
  <a href="/images/posts/doduo-translation/figure-3.webp" target="_blank" rel="noopener" aria-label="在新标签页查看原图"><img src="/images/posts/doduo-translation/figure-3.webp" alt="图 3 / Figure 3" width="600" height="281" loading="lazy" decoding="async"></a>
  <figcaption>
    <div class="doduo-en" lang="en"><b>Figure 3:</b> How Doduo computes contextualized column embeddings using the Transformer layers. Each Transformer block calculates an embedding vector for every token based on surrounding tokens.</div>
    <div class="doduo-zh" lang="zh-CN"><b>图 3：</b>Doduo 如何利用 Transformer 层计算上下文化的列嵌入。每个 Transformer 模块基于周围的 token 为每个 token 计算一个嵌入向量。</div>
  </figcaption>
</figure>

<p class="doduo-en" lang="en">After encoding tokens into token embeddings, a Transformer layer converts a token embedding into key (K), query (Q), and value (V) embeddings. A contextualized embedding for a token is calculated by the weighted average of value embeddings of all token embeddings, where the weights are calculated by the similarity between the query embedding and key embeddings. By having key embeddings and query embeddings separately, the model is able to calculate contextualized embeddings in an asymmetric manner. That is, the importance of Happy Feet for George Miller, which should be a key signal to disambiguate the person name, may not be necessarily equal to that of George Miller for Happy Feet.</p>
<p class="doduo-zh" lang="zh-CN">在把 token 编码为 token 嵌入之后，一个 Transformer 层会把 token 嵌入转换为键（K）、查询（Q）和值（V）嵌入。某个 token 的上下文化嵌入由所有 token 嵌入的值嵌入加权平均得到，其中权重由查询嵌入与键嵌入之间的相似度计算。由于键嵌入与查询嵌入是分开的，模型能够以非对称的方式计算上下文化嵌入。也就是说，“Happy Feet”对“George Miller”的重要性（这本应是消解该人名歧义的关键信号），未必等于“George Miller”对“Happy Feet”的重要性。</p>

<p class="doduo-en" lang="en">Furthermore, a Transformer-based model usually has multiple attention heads (e.g., 12 attention heads for the BERT base model.) Different attention heads have different parameters for K, Q, V calculation so that they can capture different characteristics of input data holistically. Finally, the output of a Transformer block is converted into the same dimension size as that of the input (e.g, 768 for BERT) so that the output of the previous Transformer block can be directly used as the input to the next Transformer block. The same procedure is carried out as many as the number of Transformer blocks (i.e., 12 blocks for the BERT Base model.)</p>
<p class="doduo-zh" lang="zh-CN">此外，基于 Transformer 的模型通常有多个注意力头（例如 BERT base 模型有 12 个注意力头）。不同注意力头在计算 K、Q、V 时具有不同的参数，从而能够整体地捕捉输入数据的不同特征。最后，一个 Transformer 模块的输出会被转换为与输入相同的维度（例如 BERT 为 768 维），使得前一个 Transformer 模块的输出可以直接作为下一个 Transformer 模块的输入。该过程重复的次数等于 Transformer 模块的数量（即 BERT Base 模型为 12 个模块）。</p>

<p class="doduo-en" lang="en"><b>Column representations.</b> Since Doduo inserts dummy [CLS] symbols for each column, we can consider the output embeddings of the pre-trained LM for those symbols as contextualized column representations. Note that Doduo is a table-wise model, which takes the entire table as input and thus contextualized column representations take into account table context in a holistic manner. For column type prediction, Doduo attaches an additional dense layer followed by output layer with the size of |<i>C</i><sub>type</sub>|.</p>
<p class="doduo-zh" lang="zh-CN"><b>列表示。</b>由于 Doduo 为每一列插入了哑符号 [CLS]，我们可以把预训练 LM 对这些符号的输出嵌入视为上下文化的列表示。需要注意的是，Doduo 是表格级模型，以整张表格为输入，因此上下文化的列表示以整体方式考虑了表格上下文。对于列类型预测，Doduo 附加一个额外的稠密层，其后再接一个规模为 |<i>C</i><sub>type</sub>| 的输出层。</p>

<p class="doduo-en" lang="en"><b>Column-pair representations.</b> For column relation prediction, Doduo concatenates a corresponding pair of contextualized column representations as a contextualized column-pair representation. The additional dense layer should capture combinatorial information between two column-level representations. Same as the column representations, column-pair representations are also table-wise representations. In the experiment, we also tested a variant of Doduo that only takes a single column (a single column pair) as input for the column type (column relation) prediction task.</p>
<p class="doduo-zh" lang="zh-CN"><b>列对表示。</b>对于列关系预测，Doduo 把对应的一对上下文化列表示拼接为上下文化的列对表示。额外的稠密层应能捕捉两个列级表示之间的组合信息。与列表示相同，列对表示同样是表格级的表示。在实验中，我们还测试了 Doduo 的一个变体，它在列类型（列关系）预测任务中只以单列（单个列对）为输入。</p>

<p class="doduo-en" lang="en">More formally, given a table <i>T</i>, the language model LM takes the serialized sequence serialize(<i>T</i>) = {<i>t</i><sub>1</sub>, . . . , <i>t</i><sub>p</sub>} of <i>p</i> tokens as input and outputs a sequence LM(<i>T</i>) where each element LM(<i>T</i>)<sub>i</sub> is a <i>d</i>-dimensional context-aware embedding of the token <i>t</i><sub>i</sub>. Let {<i>i</i><sub>1</sub>, . . . , <i>i</i><sub>n</sub>} be the indices of the inserted special [CLS] tokens. Let <i>g</i><sub>type</sub> be the column type prediction dense layer of dimension <i>d</i> × |<i>C</i><sub>type</sub>|. The column type model computes:</p>
<p class="doduo-zh" lang="zh-CN">更形式化地，给定表格 <i>T</i>，语言模型 LM 以 <i>p</i> 个 token 的序列化序列 serialize(<i>T</i>) = {<i>t</i><sub>1</sub>, . . . , <i>t</i><sub>p</sub>} 为输入，输出一个序列 LM(<i>T</i>)，其中每个元素 LM(<i>T</i>)<sub>i</sub> 是 token <i>t</i><sub>i</sub> 的 <i>d</i> 维上下文感知嵌入。令 {<i>i</i><sub>1</sub>, . . . , <i>i</i><sub>n</sub>} 为所插入特殊 [CLS] token 的下标。令 <i>g</i><sub>type</sub> 为维度是 <i>d</i> × |<i>C</i><sub>type</sub>| 的列类型预测稠密层。列类型模型计算：</p>

<div class="doduo-eq">softmax(<i>g</i><sub>type</sub>(LM(<i>T</i>)<sub><i>i<sub>j</sub></i></sub>))　　(1)</div>
<p class="doduo-en" lang="en">as the predicted column type of the <i>j</i>-th column.</p>
<p class="doduo-zh" lang="zh-CN">作为第 <i>j</i> 列的预测列类型。</p>

<p class="doduo-en" lang="en">Similarly, for column relation prediction with dense layer <i>g</i><sub>rel</sub> of dimension 2<i>d</i> × |<i>C</i><sub>rel</sub>|, the column relation model computes:</p>
<p class="doduo-zh" lang="zh-CN">类似地，对于使用维度为 2<i>d</i> × |<i>C</i><sub>rel</sub>| 的稠密层 <i>g</i><sub>rel</sub> 的列关系预测，列关系模型计算：</p>

<div class="doduo-eq">softmax(<i>g</i><sub>rel</sub>(LM(<i>T</i>)<sub><i>i<sub>j</sub></i></sub> ⊕ LM(<i>T</i>)<sub><i>i<sub>k</sub></i></sub>))　　(2)</div>
<p class="doduo-en" lang="en">as the predicted relation between the <i>j</i>-th and the <i>k</i>-th column of table <i>T</i>. The ⊕ symbol denotes concatenation of two vectors. Doduo then feeds the predictions and the groundtruth labels into a cross entropy loss function to update the model parameters (Line 9-10, Algorithm 1).</p>
<p class="doduo-zh" lang="zh-CN">作为表格 <i>T</i> 中第 <i>j</i> 列与第 <i>k</i> 列之间关系的预测值。符号 ⊕ 表示两个向量的拼接。随后，Doduo 把预测值与真实标签送入交叉熵损失函数，以更新模型参数（算法 1 第 9–10 行）。</p>


### 4.4 多任务学习

<p class="doduo-section-en" lang="en">4.4　Learning from Multiple Tasks</p>


<p class="doduo-en" lang="en">In the training phase, Doduo fine-tunes a pre-trained LM using two different training data and two different objectives. As shown in Algorithm 1, Doduo switches the task every epoch and updates the parameters for different objectives using different optimization schedulers. This design choice enables Doduo to naturally handle imbalanced training data for different tasks. Furthermore, with a single objective function and a single optimizer, we need to carefully choose hyper-parameter(s) that balance different objective terms to create a single objective function (e.g., ℓ = <i>λ</i>ℓ<sub>1</sub> + (1 − <i>λ</i>)ℓ<sub>2</sub> like TCN [57].) With our strategy, we can avoid adjusting the hyper-parameter. Also, in Section 6, we will show that Doduo can be robustly trained with imbalanced training data.</p>
<p class="doduo-zh" lang="zh-CN">在训练阶段，Doduo 使用两份不同的训练数据和两个不同的目标函数来微调预训练 LM。如算法 1 所示，Doduo 每隔一个 epoch 切换一次任务，并使用不同的优化调度器为不同目标更新参数。这一设计选择使 Doduo 能够自然地处理不同任务训练数据不均衡的问题。此外，若采用单一目标函数和单一优化器，就需要仔细选择超参数来平衡不同的目标项，以构造单一目标函数（例如像 TCN [57] 那样令 ℓ = <i>λ</i>ℓ<sub>1</sub> + (1 − <i>λ</i>)ℓ<sub>2</sub>）。采用我们的策略，就可以避免调整该超参数。同时，第 6 节将表明，Doduo 在训练数据不均衡时仍能被稳健地训练。</p>

<p class="doduo-en" lang="en">Note that Doduo is not limited to training with just two tasks. By adding more output layers and corresponding loss functions, Doduo can be used for more than two tasks. We also note that finding relevant tasks is challenging as adding new tasks might not necessarily improve the model’s performance. This can be due to the tasks not sharing enough common knowledge to improve each other, or noisy labels in training sets which can propagate among tasks. Finding more relevant tasks and testing Doduo on them are part of our future work.</p>
<p class="doduo-zh" lang="zh-CN">请注意，Doduo 并不局限于只训练两个任务。通过增加更多输出层及相应的损失函数，Doduo 可用于两个以上的任务。我们也要指出，找到相关任务是具有挑战性的，因为增加新任务未必能提升模型性能。原因可能是这些任务没有共享足够的共通知识以彼此促进，也可能是训练集中的噪声标签会在任务之间传播。寻找更多相关任务并在其上测试 Doduo，是我们未来工作的一部分。</p>

<div class="doduo-tbl-cap">
  <div class="doduo-en" lang="en"><b>Table 2:</b> Dataset description.</div>
  <div class="doduo-zh" lang="zh-CN"><b>表 2：</b>数据集描述。</div>
</div>
<table class="doduo-table" tabindex="0" aria-label="论文数据表，可横向滚动">
  <tr><th>Name 名称</th><th># tables 表数</th><th># col 列数</th><th># col types 列类型数</th><th># col rels 列关系数</th></tr>
  <tr><td>WikiTable</td><td>580,171</td><td>3,230,757</td><td>255</td><td>121</td></tr>
  <tr><td>VizNet</td><td>78,733</td><td>119,360</td><td>78</td><td>–</td></tr>
</table>


## 5 实验评估

<p class="doduo-section-en" lang="en">5　EVALUATION</p>



### 5.1 数据集

<p class="doduo-section-en" lang="en">5.1　Dataset</p>


<p class="doduo-en" lang="en">We used two benchmark datasets for evaluation. The WikiTable dataset [13] is a collection of tables collected from Wikipedia, which consists of 580,171 tables in total. The dataset provides both annotated column types and relations for training and evaluation. For column type prediction, the dataset provides 628,254 columns from 397,098 tables annotated by 255 column types. For column relations, the dataset provides 62,954 column pairs annotated with 121 relation types from 52,943 tables for training. According to [13], the type and relation labels are from FreeBase [2] and are obtained by aggregating entity links attached to the original tables. For both tasks, we used the same train/valid/test splits as TURL [13]. Each column/column-pair allows to have more than one annotation, and thus, the task is a multi-label classification task.</p>
<p class="doduo-zh" lang="zh-CN">我们在评估中使用了两个基准数据集。WikiTable 数据集 [13] 是从维基百科收集的表格集合，共包含 580,171 张表格。该数据集同时提供用于训练和评估的列类型与列关系标注。对于列类型预测，该数据集提供了来自 397,098 张表格的 628,254 个列，由 255 种列类型标注。对于列关系，该数据集提供了来自 52,943 张表格的 62,954 个列对，用 121 种关系类型标注，用于训练。根据 [13]，类型和关系标签来自 FreeBase [2]，是通过聚合附加在原表格上的实体链接获得的。对两个任务，我们使用了与 TURL [13] 相同的训练/验证/测试划分。每个列/列对允许有多个标注，因此该任务是一个多标签分类任务。</p>

<p class="doduo-en" lang="en">The VizNet dataset [66] is a collection of WebTables, which is a subset of the original VizNet corpus [21]. The dataset is for the column type prediction task. The dataset has 78,733 tables, and 119,360 columns are annotated with 78 column types. The dataset constructed the columns types by mapping column headers to DBpedia types [36] by a set of mapping rules. We used the same splits for the cross-validation to make the evaluation results directly comparable to [66]. Each column has only one label, and thus, the task is a multi-class classification task.</p>
<p class="doduo-zh" lang="zh-CN">VizNet 数据集 [66] 是 Web 表格的集合，是原始 VizNet 语料 [21] 的一个子集，用于列类型预测任务。该数据集包含 78,733 张表格，119,360 个列被标注为 78 种列类型。该数据集通过一组映射规则，把列头映射到 DBpedia 类型 [36] 来构建列类型。我们采用相同的交叉验证划分，以使评估结果与 [66] 直接可比。每个列只有一个标签，因此该任务是一个多类分类任务。</p>


### 5.2 基线方法

<p class="doduo-section-en" lang="en">5.2　Baselines</p>


<p class="doduo-en" lang="en">TURL [13] is a recently developed pre-trained Transformer-based LM for tables. TURL further pre-trains a pre-trained LM using table data, so the model becomes more suitable for tabular data. Since TURL relies on entity-linking and meta information such as table headers and table captions, which are not available in our scenario, we used a variant of TURL pre-trained on table values for a fair comparison. Note that to perform column type/relation annotation, we fine-tuned the pre-trained TURL model on the same training sets as for Doduo and other baselines.</p>
<p class="doduo-zh" lang="zh-CN">TURL [13] 是近期提出的、面向表格的预训练 Transformer LM。TURL 使用表格数据对预训练 LM 做进一步预训练，使模型更适合表格数据。由于 TURL 依赖实体链接以及表头、表标题等元信息，而这些在我们的场景中不可用，因此为公平比较，我们使用了一个仅在表格取值上预训练的 TURL 变体。需要说明的是，为执行列类型/关系标注，我们在与 Doduo 及其他基线相同的训练集上微调了预训练的 TURL 模型。</p>

<p class="doduo-en" lang="en">Sherlock [22] is a single-column prediction model that uses multiple feature sets, including character embeddings, word embeddings, paragraph embeddings, and column statistics (e.g., mean, std of numerical values.) A multi-layer “sub” neural network is applied to each column-wise feature set to calculate compact dense vectors except for the column statistics feature set, which are already continuous values. The output of the subnetworks and the column statistics features are fed into the “primary” neural network that consists of two fully connected layers.</p>
<p class="doduo-zh" lang="zh-CN">Sherlock [22] 是一个单列预测模型，使用多种特征集，包括字符嵌入、词嵌入、段落嵌入和列统计量（如数值的均值、标准差）。除列统计量特征集（本身已是连续值）之外，每个按列组织的特征集都通过一个多层“子”神经网络计算紧凑的稠密向量。各子网络的输出与列统计量特征一起送入由两个全连接层组成的“主”神经网络。</p>

<p class="doduo-en" lang="en">Sato [66] is a multi-column prediction model, which extends Sherlock by adding LDA features to capture table context and a CRF layer to incorporate column type dependency into prediction. Sato is the state-of-the-art column type prediction on the VizNet dataset.</p>
<p class="doduo-zh" lang="zh-CN">Sato [66] 是一个多列预测模型，它在 Sherlock 的基础上加入 LDA 特征以捕捉表格上下文，并加入 CRF 层以把列类型之间的依赖关系纳入预测。Sato 是在 VizNet 数据集上最优的列类型预测方法。</p>

<div class="doduo-tbl-cap">
  <div class="doduo-en" lang="en"><b>Table 3:</b> Performance on the WikiTable dataset.</div>
  <div class="doduo-zh" lang="zh-CN"><b>表 3：</b>在 WikiTable 数据集上的性能。</div>
</div>
<table class="doduo-table" tabindex="0" aria-label="论文数据表，可横向滚动">
  <tr><th rowspan="2">Method 方法</th><th colspan="3">Col type 列类型</th><th colspan="3">Col rel 列关系</th></tr>
  <tr><th>P</th><th>R</th><th>F1</th><th>P</th><th>R</th><th>F1</th></tr>
  <tr><td>Sherlock</td><td>88.40</td><td>70.55</td><td>78.47</td><td>–</td><td>–</td><td>–</td></tr>
  <tr><td>TURL</td><td>90.54</td><td>87.23</td><td>88.86</td><td>91.18</td><td>90.69</td><td>90.94</td></tr>
  <tr><td>Doduo</td><td>92.69</td><td>92.21</td><td>92.45</td><td>91.97</td><td>91.47</td><td>91.72</td></tr>
  <tr><td>TURL+metadata</td><td>92.75</td><td>92.63</td><td>92.69</td><td>92.90</td><td>93.80</td><td>93.35</td></tr>
  <tr><td>Doduo+metadata</td><td>93.25</td><td>92.34</td><td>92.79</td><td>91.20</td><td>94.50</td><td>92.82</td></tr>
</table>


### 5.3 实验设置

<p class="doduo-section-en" lang="en">5.3　Experimental Settings</p>


<p class="doduo-en" lang="en">We used Adam optimizer with an <i>ϵ</i> of 10<sup>−8</sup>. The initial learning rate was set to be 5 × 10<sup>−5</sup> with a linear decay scheduler with no warm up. We trained Doduo for 30 epochs and chose the checkpoint with the highest F1 score on the validation set. Since the WikiTable dataset can have multiple labels on each column/column pair, we used Binary Cross Entropy loss to formulate as a multi-label prediction task. For the VizNet dataset, which only has a single annotation on each column, we used Cross Entropy loss to formulate as a multi-class prediction task. Models and experiments were implemented with PyTorch [38] and the Transformers library [59]. All experiments were conducted on an AWS p3.8xlarge instance (V100 (16GB)). Following the previous studies [13, 66], we use micro F1 for the WikiTable dataset, and micro F1 and macro F1 for the VizNet dataset, as evaluation metrics. The micro F1 score is the weighted average of F1 values based on the sample size of each class, while the macro F1 score is the simple average of F1 values for all classes. Additional results and analysis can be found in Appendix.</p>
<p class="doduo-zh" lang="zh-CN">我们使用 Adam 优化器，<i>ϵ</i> 取 10<sup>−8</sup>。初始学习率设为 5 × 10<sup>−5</sup>，采用线性衰减调度且不做预热。我们训练 Doduo 30 个 epoch，并选择验证集上 F1 分数最高的检查点。由于 WikiTable 数据集的每个列/列对可能有多个标签，我们使用二元交叉熵损失，将其表述为多标签预测任务。对于每个列只有一个标注的 VizNet 数据集，我们使用交叉熵损失，将其表述为多类预测任务。模型与实验使用 PyTorch [38] 和 Transformers 库 [59] 实现。所有实验均在 AWS p3.8xlarge 实例（V100 (16GB)）上进行。遵循已有研究 [13, 66]，我们对 WikiTable 数据集使用 micro F1，对 VizNet 数据集使用 micro F1 与 macro F1 作为评价指标。micro F1 分数是基于各类样本量的 F1 加权平均，而 macro F1 分数是所有类别 F1 值的简单平均。更多结果与分析见附录。</p>


### 5.4 主要结果

<p class="doduo-section-en" lang="en">5.4　Main Results</p>


<p class="doduo-en" lang="en"><b>WikiTable</b>　Table 3 shows the micro F1 performance for the column type prediction and column relation prediction tasks on the WikiTable dataset. Doduo significantly outperforms the state-of-the-art method TURL on both of the tasks with improvements of 4.0% and 0.9%, respectively. A significant difference in the model architecture between Doduo and TURL is whether the model uses full self-attention. In TURL, the model uses the self-attention mechanism with the “cross-column” edges removed, which they referred to as visibility matrix [13].</p>
<p class="doduo-zh" lang="zh-CN"><b>WikiTable</b>　表 3 展示了 WikiTable 数据集上列类型预测与列关系预测任务的 micro F1 性能。Doduo 在这两个任务上均显著优于当时的最优方法 TURL，分别提升 4.0% 和 0.9%。Doduo 与 TURL 在模型架构上的一个显著差异在于模型是否使用完全的自注意力。在 TURL 中，模型使用的自注意力机制移除了“跨列”边，他们将其称为可见性矩阵（visibility matrix）[13]。</p>

<p class="doduo-en" lang="en">Let us use the example in Figure 3, which depicts how the contextualized embedding for the second column is calculated. TURL’s visibility matrix removes the connections to [CLS]<sub>2</sub> from the cells “Happy Feet”, “Cars”, “USA”, and “UK”, whereas our Doduo uses the full set of connections. Since TURL is designed for tables with meta information (e.g., table captions or column headers), we consider the major benefit of this design (i.e., the visibility matrix) to effectively incorporate descriptions in the meta information into table values. From the results, Doduo with the full self-attention performs better than TURL, which indicates that some direct intersections between tokens in different columns and different rows are useful for the column annotation problem.</p>
<p class="doduo-zh" lang="zh-CN">让我们以图 3 中的示例来说明第二列的上下文化嵌入是如何计算的。TURL 的可见性矩阵移除了从“Happy Feet”“Cars”“USA”“UK”等单元指向 [CLS]<sub>2</sub> 的连接，而我们的 Doduo 使用完整的连接集合。由于 TURL 是为带元信息（如表标题或列头）的表格设计的，我们认为该设计（即可见性矩阵）的主要好处在于把元信息中的描述有效地融入表格取值。从结果看，采用完全自注意力的 Doduo 性能优于 TURL，这说明不同列、不同行的 token 之间的一些直接交叉连接对列标注问题是有用的。</p>

<p class="doduo-en" lang="en">We also tested Doduo with metadata, which appends the column name to column values for each column before serialization. As shown in Table 3, by using column names, Doduo slightly improves the performance and performs competitively against TURL with metadata. This indicates that TURL relies on metadata and Doduo performs better and more robustly than TURL when metadata is not available.</p>
<p class="doduo-zh" lang="zh-CN">我们还测试了带元数据的 Doduo，即在序列化之前为每一列把列名追加到列值之后。如表 3 所示，使用列名后 Doduo 的性能略有提升，并与带元数据的 TURL 具有竞争力。这表明 TURL 依赖元数据，而在元数据不可用时，Doduo 的表现优于 TURL 且更为稳健。</p>

<div class="doduo-tbl-cap">
  <div class="doduo-en" lang="en"><b>Table 4:</b> Performance on the VizNet dataset.</div>
  <div class="doduo-zh" lang="zh-CN"><b>表 4：</b>在 VizNet 数据集上的性能。</div>
</div>
<table class="doduo-table" tabindex="0" aria-label="论文数据表，可横向滚动">
  <tr><th rowspan="2">Method 方法</th><th colspan="2">Full 完整集</th><th colspan="2">Multi-column only 仅多列</th></tr>
  <tr><th>Macro F1</th><th>Micro F1</th><th>Macro F1</th><th>Micro F1</th></tr>
  <tr><td>Sherlock</td><td>69.2</td><td>86.7</td><td>64.2</td><td>87.9</td></tr>
  <tr><td>Sato</td><td>75.6</td><td>88.4</td><td>73.5</td><td>92.5</td></tr>
  <tr><td>Doduo</td><td>84.6</td><td>94.3</td><td>83.8</td><td>96.4</td></tr>
</table>

<p class="doduo-en" lang="en"><b>VizNet</b>　Table 4 shows the results on the VizNet dataset. Note that Doduo is trained only using the column prediction task for the VizNet dataset, as column relation labels are not available for the dataset. The results show that Doduo outperforms Sherlock and Sato, the SoTA method for the dataset, by a large margin and establishes new state-of-the-art performance with micro F1 (macro F1) improvements of 11.9% (6.7%.)</p>
<p class="doduo-zh" lang="zh-CN"><b>VizNet</b>　表 4 展示了在 VizNet 数据集上的结果。需要注意的是，由于该数据集没有列关系标签，Doduo 在 VizNet 上只使用列类型预测任务进行训练。结果表明，Doduo 大幅优于 Sherlock 以及该数据集上的最优方法 Sato，建立了新的最优性能，micro F1（macro F1）提升 11.9%（6.7%）。</p>

<p class="doduo-en" lang="en">As described in Section 2, Sato is a multi-column model that incorporates table context by using LDA features. Different from the LDA features that provide multi-dimensional vector representations for the entire table, the Transformer-based architecture enables Doduo to capture more fine-grained inter-token relationships through the self-attention mechanism. Furthermore, Doduo’s table-wise design naturally helps incorporate inter-column information into the model.</p>
<p class="doduo-zh" lang="zh-CN">如第 2 节所述，Sato 是一个多列模型，通过使用 LDA 特征来融合表格上下文。与为整张表格提供多维向量表示的 LDA 特征不同，基于 Transformer 的架构使 Doduo 能够通过自注意力机制捕捉更细粒度的 token 间关系。此外，Doduo 的表格级设计天然有助于把列间信息融入模型。</p>

<p class="doduo-en" lang="en"><b>Performance on numeric columns.</b> As mentioned in Section 3, Doduo casts all cell values as strings thus it may be weak in handling numeric columns. Table 5 shows Doduo performance on the top-15 most numeric column types from the VizNet dataset. Doduo did have low performance on some numeric types such as ranking (33.21%) and capacity (62.55%). However, on these 15 types, Doduo achieves an average F1 score of 86.9% which is comparable to the overall macro F1 (84.6%) and even slightly better. This can be due to the Transformer model being able to recognize digit patterns in the numeric values to predict the correct types. This results aligns with the findings from the NLP literature [16, 55] that Transformer models can partially handle numeric data.</p>
<p class="doduo-zh" lang="zh-CN"><b>在数值列上的表现。</b>如第 3 节所述，Doduo 把所有权值都当作字符串处理，因此在处理数值列时可能较弱。表 5 展示了 Doduo 在 VizNet 数据集中数值化程度最高的 15 种列类型上的表现。Doduo 确实在 ranking（33.21%）和 capacity（62.55%）等部分数值类型上表现较差。然而，在这 15 种类型上，Doduo 的平均 F1 达到 86.9%，与整体 macro F1（84.6%）相当，甚至略好。这可能是因为 Transformer 模型能够识别数值中的数字模式，从而预测出正确类型。该结果与 NLP 文献 [16, 55] 的发现一致，即 Transformer 模型能够部分地处理数值数据。</p>

<div class="doduo-tbl-cap">
  <div class="doduo-en" lang="en"><b>Table 5:</b> Doduo’s column type prediction performance on the 15 most numeric types of the VizNet dataset. We use %num to measure how many cell values of a type can be cast as a numeric type (e.g., int, float, date).</div>
  <div class="doduo-zh" lang="zh-CN"><b>表 5：</b>Doduo 在 VizNet 数据集数值化程度最高的 15 种列类型上的列类型预测性能。我们用 %num 衡量某一类型的单元值中有多少可以被转换为数值类型（如 int、float、date）。</div>
</div>
<table class="doduo-table" tabindex="0" aria-label="论文数据表，可横向滚动">
  <tr><th>type 类型</th><th>%num</th><th>F1</th><th>type 类型</th><th>%num</th><th>F1</th><th>type 类型</th><th>%num</th><th>F1</th></tr>
  <tr><td>plays</td><td>100.00</td><td>88.55</td><td>fileSize</td><td>87.84</td><td>88.23</td><td>grades</td><td>67.18</td><td>97.68</td></tr>
  <tr><td>rank</td><td>93.01</td><td>94.52</td><td>elevation</td><td>87.39</td><td>92.14</td><td>weight</td><td>60.41</td><td>97.59</td></tr>
  <tr><td>depth</td><td>92.86</td><td>88.45</td><td>ranking</td><td>86.88</td><td>33.21</td><td>isbn</td><td>43.77</td><td>96.51</td></tr>
  <tr><td>sales</td><td>92.05</td><td>75.13</td><td>age</td><td>81.04</td><td>98.53</td><td>capacity</td><td>42.06</td><td>62.55</td></tr>
  <tr><td>year</td><td>91.47</td><td>98.94</td><td>birthDate</td><td>67.85</td><td>95.64</td><td>code</td><td>35.93</td><td>95.43</td></tr>
</table>


## 6 分析

<p class="doduo-section-en" lang="en">6　ANALYSIS</p>



### 6.1 消融分析

<p class="doduo-section-en" lang="en">6.1　Ablation Analysis</p>


<p class="doduo-en" lang="en">To verify the effectiveness of multi-task learning and multi-column architecture, we tested variants of Doduo. Dosolo is a Doduo model without multi-task learning. Thus, we trained Doduo models only using training data for the target task (i.e., column type prediction or column relation prediction.) Dosolo<sub>SCol</sub> is a single-column model that only uses column values of the target column (or target column pair for column relation prediction.) Dosolo<sub>SCol</sub> is also trained without multi-task learning.</p>
<p class="doduo-zh" lang="zh-CN">为验证多任务学习和多列架构的有效性，我们测试了 Doduo 的若干变体。Dosolo 是不带多任务学习的 Doduo 模型，因此我们只用目标任务（即列类型预测或列关系预测）的训练数据来训练 Doduo 模型。Dosolo<sub>SCol</sub> 是单列模型，只使用目标列的列值（对列关系预测则是目标列对）。Dosolo<sub>SCol</sub> 同样不使用多任务学习训练。</p>

<div class="doduo-tbl-cap">
  <div class="doduo-en" lang="en"><b>Table 6:</b> Ablation study on the WikiTable dataset.</div>
  <div class="doduo-zh" lang="zh-CN"><b>表 6：</b>在 WikiTable 数据集上的消融研究。</div>
</div>
<table class="doduo-table" tabindex="0" aria-label="论文数据表，可横向滚动">
  <tr><th>Method 方法</th><th>Type prediction 类型预测</th><th>Relation prediction 关系预测</th></tr>
  <tr><td>Doduo</td><td>92.50</td><td>91.90</td></tr>
  <tr><td>w/ shuffled rows（行打乱）</td><td>91.94</td><td>91.61</td></tr>
  <tr><td>w/ shuffled cols（列打乱）</td><td>92.68</td><td>91.98</td></tr>
  <tr><td>Dosolo</td><td>91.37 (1.23% ↓)</td><td>91.24 (0.7% ↓)</td></tr>
  <tr><td>Dosolo<sub>SCol</sub></td><td>82.45 (21.9% ↓)</td><td>83.08 (9.6% ↓)</td></tr>
</table>

<div class="doduo-tbl-cap">
  <div class="doduo-en" lang="en"><b>Table 7:</b> Ablation study on the VizNet dataset (Full.)</div>
  <div class="doduo-zh" lang="zh-CN"><b>表 7：</b>在 VizNet 数据集（完整集）上的消融研究。</div>
</div>
<table class="doduo-table" tabindex="0" aria-label="论文数据表，可横向滚动">
  <tr><th>Method 方法</th><th>Macro F1</th><th>Micro F1</th></tr>
  <tr><td>Doduo</td><td>84.6</td><td>94.3</td></tr>
  <tr><td>Dosolo<sub>SCol</sub></td><td>77.4 (8.5% ↓)</td><td>90.2 (4.3% ↓)</td></tr>
</table>

<p class="doduo-en" lang="en">Table 6 shows the results of the ablation study. For both of the tasks, Dosolo degraded the performance compared to the multi-task learning of Doduo. As Dosolo<sub>SCol</sub> shows significantly lower performance than the others, the results also confirm that the multi-column architecture of Doduo successfully captures table context to improve the performance on the column type prediction and column relation prediction tasks.</p>
<p class="doduo-zh" lang="zh-CN">表 6 展示了消融研究的结果。在两个任务上，Dosolo 相比 Doduo 的多任务学习都出现了性能下降。由于 Dosolo<sub>SCol</sub> 的性能显著低于其他变体，结果也确认了 Doduo 的多列架构成功捕捉了表格上下文，从而提升了列类型预测与列关系预测任务的性能。</p>

<p class="doduo-en" lang="en">The same analysis with Dosolo<sub>SCol</sub> on the VizNet dataset is shown in Table 7. As expected, the multi-column model (Doduo) performs significantly better than the single-column model (Dosolo<sub>SCol</sub>.) The results further confirm the strengths of the multi-column model. We would like to emphasize that Dosolo<sub>SCol</sub> outperforms Sato, which incorporates table context as LDA features.</p>
<p class="doduo-zh" lang="zh-CN">在 VizNet 数据集上对 Dosolo<sub>SCol</sub> 的同类分析见表 7。正如预期，多列模型（Doduo）的性能显著优于单列模型（Dosolo<sub>SCol</sub>）。这些结果进一步确认了多列模型的优势。我们想强调的是，Dosolo<sub>SCol</sub> 的性能已经优于以 LDA 特征融合表格上下文的 Sato。</p>

<p class="doduo-en" lang="en">The pre-trained LM (e.g., BERT) is sensitive to the input sequence order, which may not reflect the property of tables that rows/columns are order-invariant. To verify if Doduo has this limitation, we trained and evaluated Doduo on two versions of the WikiTable dataset, where the input table’s rows (columns) were randomly shuffled. As shown in Table 6, somewhat surprisingly, Doduo shows only subtle degradation for shuffled rows and no substantial difference for shuffled columns. We conjecture that Doduo successfully tailors the original position embeddings to be aligned with the table structure during the fine-tuning step.</p>
<p class="doduo-zh" lang="zh-CN">预训练 LM（如 BERT）对输入序列的顺序敏感，而表格具有行/列顺序无关的特性，这一点可能无法被反映。为验证 Doduo 是否存在这一局限，我们在 WikiTable 数据集的两个版本上训练并评估 Doduo，其中输入表格的行（列）被随机打乱。如表 6 所示，有些出乎意料的是，Doduo 在行打乱时仅有轻微性能下降，在列打乱时则没有明显差异。我们推测，Doduo 在微调阶段成功地把原有的位置嵌入调整为与表格结构对齐。</p>


### 6.2 数据效率

<p class="doduo-section-en" lang="en">6.2　Data Efficiency</p>


<p class="doduo-en" lang="en"><b>Learning Efficiency</b>　Pre-trained LMs are known for its capability of training high-quality models using a relatively small number of labeled examples. Furthermore, multi-task learning (i.e., training with multiple tasks simultaneously) should further stabilize the performance with fewer training data for each task. To verify the effectiveness of Doduo and Dosolo with respect to label efficiency, we compared the Doduo models trained with different training data sizes (10%, 25%, 50%, and 100%) and evaluated the performance on the column type prediction and column relation prediction tasks. As shown in Figure 4, Doduo consistently outperforms Dosolo and achieves higher than 0.9 F1 scores on both tasks even when trained with half of the training data. In particular, with only 50% or fewer labeled examples, Doduo outperforms the SoTA method TURL on column-type prediction and achieves comparable performance on column relation prediction.</p>
<p class="doduo-zh" lang="zh-CN"><b>学习效率</b>　预训练 LM 以能用相对少量的标注样本训练出高质量模型而著称。此外，多任务学习（即同时训练多个任务）应在每个任务训练数据更少时进一步稳定性能。为验证 Doduo 与 Dosolo 在标签效率方面的表现，我们比较了用不同训练数据规模（10%、25%、50%、100%）训练的 Doduo 模型，并在列类型预测和列关系预测任务上评估性能。如图 4 所示，Doduo 始终优于 Dosolo，即使只用一半训练数据，在两个任务上也都达到高于 0.9 的 F1 分数。特别地，仅使用 50% 或更少的标注样本，Doduo 在列类型预测上就优于最优方法 TURL，在列关系预测上也达到可与之相比的性能。</p>

<figure class="doduo-figure">
  <a href="/images/posts/doduo-translation/figure-4.webp" target="_blank" rel="noopener" aria-label="在新标签页查看原图"><img src="/images/posts/doduo-translation/figure-4.webp" alt="图 4 / Figure 4" width="547" height="374" loading="lazy" decoding="async"></a>
  <figcaption>
    <div class="doduo-en" lang="en"><b>Figure 4:</b> Performance improvements over increasing the training data size on the WikiTable dataset. The dashed lines in the plots denote the state-of-the-art methods (TURL.)</div>
    <div class="doduo-zh" lang="zh-CN"><b>图 4：</b>在 WikiTable 数据集上，性能随训练数据规模增加而提升的情况。图中的虚线表示当时的最优方法（TURL）。</div>
  </figcaption>
</figure>

<p class="doduo-en" lang="en"><b>Input Data Efficiency</b>　A major challenge of applying pre-trained LMs to data management tasks is their limits of the maximum input sequence length. For example, LMs like BERT can only take at most 512 tokens so ingesting a full wide table may not be feasible for the LMs. Doduo (or the multi-column model in general) has the advantage that it is input data efficient, meaning that it can make table-wise predictions accurately by only taking a small number of samples of each column. This makes Doduo more attractive in practice as it can handle large tables with many columns.</p>
<p class="doduo-zh" lang="zh-CN"><b>输入数据效率</b>　把预训练 LM 应用于数据管理任务的一大挑战是其最大输入序列长度的限制。例如，BERT 这类 LM 最多只能接收 512 个 token，因此对 LM 而言摄取一张完整的宽表可能并不可行。Doduo（或者说多列模型总体上）的优势在于输入数据高效，即它只需取每一列的少量样本就能准确地进行表格级预测。这使 Doduo 在实践中更具吸引力，因为它可以处理列数众多的大表。</p>

<p class="doduo-en" lang="en">Thus, we evaluated different variants of Doduo with shorter input token length to discuss the input data efficiency of Doduo. We would like to emphasize that any of the recent studies applying pre-trained Transformer-based LMs to data management tasks (e.g., [13, 26, 52, 57]) did not conduct this kind of analysis. Thus, it is still not clear how many tokens should we feed to the model to obtain reasonable task performance.</p>
<p class="doduo-zh" lang="zh-CN">因此，我们评估了输入 token 长度更短的不同 Doduo 变体，以讨论 Doduo 的输入数据效率。我们想强调，近期把预训练 Transformer LM 应用于数据管理任务的研究（如 [13, 26, 52, 57]）都没有进行这类分析。因此，究竟应向模型输入多少 token 才能获得合理的任务性能，目前仍不清楚。</p>

<p class="doduo-en" lang="en">Table 8 shows the results of Doduo with different max token sizes on the WikiTable dataset. We simply truncated column values if the number of tokens exceeded the threshold. As shown in the table, the more tokens used, the better performance Doduo can achieve, as expected. However, somewhat surprisingly, Doduo already outperforms TURL using just 8 tokens per column for column type prediction (TURL has micro F1 of 88.86 on WikiTable). For the column relation prediction task, Doduo needs to use more tokens to outperform TURL (i.e., 32 tokens to beat TURL’s score of 90.94.) This is understandable, as column relation prediction is more contextual than column type prediction, and thus it requires more signals to further narrow down to the correct prediction.</p>
<p class="doduo-zh" lang="zh-CN">表 8 展示了 Doduo 在 WikiTable 数据集上使用不同最大 token 数的结果。当 token 数超过阈值时，我们直接截断列值。如表所示，正如预期，使用的 token 越多，Doduo 能达到的性能越好。然而有些出乎意料的是，在列类型预测上，Doduo 每列仅用 8 个 token 就已优于 TURL（TURL 在 WikiTable 上的 micro F1 为 88.86）。在列关系预测任务上，Doduo 需要更多 token 才能超过 TURL（即需要 32 个 token 才能超过 TURL 的 90.94 分）。这是可以理解的，因为列关系预测比列类型预测更依赖上下文，因此需要更多信号才能进一步收敛到正确预测。</p>

<div class="doduo-tbl-cap">
  <div class="doduo-en" lang="en"><b>Table 8:</b> Comparisons of Doduo with different input token size on the WikiTable dataset.</div>
  <div class="doduo-zh" lang="zh-CN"><b>表 8：</b>在 WikiTable 数据集上 Doduo 在不同输入 token 规模下的比较。</div>
</div>
<table class="doduo-table" tabindex="0" aria-label="论文数据表，可横向滚动">
  <tr><th>MaxToken/col 每列最大 token</th><th>Col type (F1)</th><th>Col rel (F1)</th><th>Max. # of cols 最大列数</th></tr>
  <tr><td>8</td><td>89.8</td><td>88.9</td><td>56</td></tr>
  <tr><td>16</td><td>91.4</td><td>90.7</td><td>30</td></tr>
  <tr><td>32</td><td>92.4</td><td>91.7</td><td>15</td></tr>
</table>

<p class="doduo-en" lang="en">For the VizNet dataset, we confirm that Doduo with 8 max tokens per column with Doduo (92.5 F1) outperforms the state-of-the-art method (i.e., Sato) (88.4 F1) on the task. Table 8 reports how many columns each variant can support under the maximum token configuration. The average numbers of columns in Web Tables, Enterprise Data, and Open Data are reported to be 4, 12, and 16, respectively [12, 33]. Thus, we confirm that Doduo still has the advantage of leveraging partial context of the input table to improve prediction quality.</p>
<p class="doduo-zh" lang="zh-CN">对于 VizNet 数据集，我们确认每列最多 8 个 token 的 Doduo（92.5 F1）在该任务上优于当时的最优方法（即 Sato）（88.4 F1）。表 8 报告了在最大 token 配置下每个变体可以支持多少列。据报道，Web 表格、企业数据和开放数据中的平均列数分别为 4、12 和 16 [12, 33]。因此，我们确认 Doduo 仍具有利用输入表格部分上下文来提升预测质量的优势。</p>

<p class="doduo-en" lang="en">We note that 16 columns may not be sufficient for tables outside of WebTables. For such cases, a reasonable option is to first split the wide table into clusters of relevant columns (maybe by some user-defined rules), then apply Doduo on each cluster. In this case, Doduo still has the advantage of leveraging partial context of the input table to improve prediction quality.</p>
<p class="doduo-zh" lang="zh-CN">我们注意到，对于 Web 表格之外的表，16 列可能并不够用。对此，一种合理的做法是先把宽表切分为若干相关列的簇（也许依据某些用户自定义规则），然后对每个簇分别应用 Doduo。在这种情况下，Doduo 仍具有利用输入表格部分上下文来提升预测质量的优势。</p>


## 7 案例研究：列聚类

<p class="doduo-section-en" lang="en">7　CASE STUDY: CLUSTERING COLUMNS</p>


<p class="doduo-en" lang="en">We apply Doduo to a real data science application scenario of clustering relevant columns. On a daily basis, data scientists collect information from multiple sources and incorporate data from various tables. Therefore, as a first step of data exploration and data integration [37], it is essential to know which columns are semantically similar. However, this is not always straightforward as different column names can be assigned to semantically similar columns. In this section, we demonstrate the usefulness of Doduo’s contextualized column embeddings with a case study of clustering semantically similar columns on an enterprise database.</p>
<p class="doduo-zh" lang="zh-CN">我们把 Doduo 应用到一个真实的数据科学应用场景：对相关列进行聚类。数据科学家日常会从多个来源收集信息，并整合来自各种表格的数据。因此，作为数据探索与数据集成 [37] 的第一步，弄清哪些列在语义上相似至关重要。然而，这并不总是显而易见，因为语义相似的列可能被赋予不同的列名。本节通过一个在企业数据库上对语义相似列进行聚类的案例研究，展示 Doduo 上下文化列嵌入的实用性。</p>

<p class="doduo-en" lang="en">For this case study, we use an in-production enterprise database from the HR domain. Different teams create and update tables about job seekers and companies that are hiring, etc. Despite some company-wide naming conventions, we observe that semantically similar columns are sometimes given different column names across tables. Some tables have additional meta information describing the meaning of each column, which helps to understand the similarity of columns. However, the meta information is missing for many columns and is not always reliable as they are worded differently by different teams.</p>
<p class="doduo-zh" lang="zh-CN">在该案例研究中，我们使用一个来自人力资源（HR）领域的生产环境企业数据库。不同团队创建并更新关于求职者和招聘公司等信息的表格。尽管存在一些公司范围的命名规范，我们观察到语义相似的列有时在不同表格中被赋予不同的列名。部分表格带有描述每一列含义的额外元信息，这有助于理解列的相似性。然而，许多列缺失这类元信息，而且由于不同团队的措辞不同，元信息也并非总是可靠。</p>

<p class="doduo-en" lang="en"><b>Scenario:</b> Our data scientist Sofia starts by filtering tables with keywords “jobsearch” and “review” and gets 10 tables with 50 columns in total (29 columns of type “string” and 21 columns of type “integer”.) To group similar columns together, she can simply create contextualized column embedding using the Doduo toolbox for all the columns and then apply her favorite clustering algorithm to form the final groups. To evaluate Sofia’s column groups, we generate an initial cluster using both the column names and descriptions and manually refine the results to form the ground-truth<sup>5</sup> as shown below:</p>
<p class="doduo-zh" lang="zh-CN"><b>场景：</b>我们的数据科学家 Sofia 先用关键词“jobsearch”和“review”筛选表格，得到 10 张表格、共 50 列（其中 29 列为“string”类型，21 列为“integer”类型）。为把相似的列归为一组，她只需用 Doduo 工具箱为所有列生成上下文化的列嵌入，再应用她惯用的聚类算法形成最终分组。为评估 Sofia 的列分组，我们利用列名和列描述生成初始聚类，并人工修正结果，形成如下所示的真值<sup>5</sup>：</p>

<p class="doduo-en" lang="en">date, IP address, job title, timestamp (unixtime), timestamp (hhmm), counts, status, file path, browser, location, search term, rating, company ID, review ID, user ID</p>
<p class="doduo-zh" lang="zh-CN">日期、IP 地址、职位名称、时间戳（Unix 时间）、时间戳（hhmm）、计数、状态、文件路径、浏览器、地点、搜索词、评分、公司 ID、评论 ID、用户 ID</p>

<p class="doduo-en" lang="en">Sofia use the Doduo model trained on the WikiTable dataset to obtain contextualized column embeddings for each column (Doduo+column value emb.) We compared the method with three baselines and two traditional schema matching approaches. We directly used Doduo’s column type predictions as the clustering criteria where columns with the same predicted types got assigned into the same cluster (Doduo+predicted type). We tested fastText [1] to verify how non-contextualized column embeddings perform for the task. We use column value embeddings (fastText+column value emb) and column name embeddings (fastText+column name emb) with fastText. We choose fastText as a baseline as it offers a widely used off-the-shelf toolbox, which is a “go-to” option for data scientists. To achieve a fair evaluation of the embedding quality, we use the same k-means clustering algorithm for all models.</p>
<p class="doduo-zh" lang="zh-CN">Sofia 使用在 WikiTable 数据集上训练的 Doduo 模型为每一列获得上下文化的列嵌入（Doduo+column value emb）。我们把该方法与三个基线和两种传统模式匹配方法进行比较。我们直接把 Doduo 的列类型预测结果作为聚类依据，预测类型相同的列被分到同一个簇（Doduo+predicted type）。我们测试了 fastText [1]，以检验非上下文化的列嵌入在该任务上的表现：使用 fastText 的列值嵌入（fastText+column value emb）和列名嵌入（fastText+column name emb）。我们选择 fastText 作为基线，是因为它提供了一个被广泛使用的现成工具箱，是数据科学家的“首选”方案。为公平评估嵌入质量，我们对所有模型使用相同的 k-means 聚类算法。</p>

<p class="doduo-en" lang="en">In addition, we compared with more traditional schema matching approaches tested in the experiment suite Valentine [25]. We picked the two most effective approaches from Valentine’s empirical study: COMA [15] and DistributionBased [67]. To generate the clustering label for comparison, we went over all possible pairs of tables and connected matched columns to assign the same cluster labels. Since those schema matching methods take two tables as input and return pairs of matched columns, we regard returned pairs as connected nodes in a graph and merge them into connected components to obtain column clusters. We use Homogeneity (Precision), Completeness (Recall), V-Measure (F1) to evaluate the quality of clusters using the ground-truth cluster assignment.</p>
<p class="doduo-zh" lang="zh-CN">此外，我们还与在实验套件 Valentine [25] 中测试过的更传统的模式匹配方法做了比较。我们从 Valentine 的实证研究中挑出两种最有效的方法：COMA [15] 和 DistributionBased [67]。为生成用于比较的聚类标签，我们遍历所有可能的表格对，并把匹配的列连接起来，赋予相同的簇标签。由于这些模式匹配方法以两张表为输入并返回匹配的列对，我们把返回的列对视为图中的连通节点，将其合并为连通分量，从而得到列簇。我们使用同质性（Homogeneity，对应 Precision）、完整性（Completeness，对应 Recall）和 V-Measure（对应 F1），基于真值簇分配来评估聚类质量。</p>

<div class="doduo-tbl-cap">
  <div class="doduo-en" lang="en"><b>Table 9:</b> Case study results.</div>
  <div class="doduo-zh" lang="zh-CN"><b>表 9：</b>案例研究结果。</div>
</div>
<table class="doduo-table" tabindex="0" aria-label="论文数据表，可横向滚动">
  <tr><th>Method 方法</th><th>Prec. 精确率</th><th>Recall 召回率</th><th>F1</th></tr>
  <tr><td>Doduo+column value emb</td><td>68.19</td><td>70.40</td><td>69.28</td></tr>
  <tr><td>Doduo+predicted type</td><td>44.87</td><td>61.32</td><td>51.82</td></tr>
  <tr><td>fastText+column value emb</td><td>35.90</td><td>76.61</td><td>48.89</td></tr>
  <tr><td>fastText+column name emb</td><td>56.62</td><td>74.68</td><td>64.40</td></tr>
  <tr><td>COMA (with column name)</td><td>58.47</td><td>66.06</td><td>62.03</td></tr>
  <tr><td>DistributionBased (with column name)</td><td>23.87</td><td>69.51</td><td>35.53</td></tr>
</table>

<div class="doduo-note">
  <div class="doduo-en" lang="en"><sup>5</sup>We used column name and description for ground-truth creation purpose only as it is not available for all tables in practice. The initial clustering uses a combination of TF-IDF vectors and fastText embeddings.</div>
  <div class="doduo-en" lang="en">　<sup>5</sup>我们仅在构建真值时使用列名和列描述，因为实践中并非所有表格都具备这些信息。初始聚类使用了 TF-IDF 向量与 fastText 嵌入的组合。</div>
</div>

<p class="doduo-en" lang="en">As shown in Table 9, Doduo’s column embeddings show the best clustering performance with respect to Precision and F1. The results confirm that contextualized column embeddings are more useful than predicted column types and can be more accurate representations than column name/value embeddings created by fastText. Compared to Doduo, fastText tends to generate similar embeddings even for semantically different columns, which leads to creating unnecessarily large clusters that contain many irrelevant columns. This significantly increases (decreases) fastText methods’ Recall (Precision) values in Table 9. COMA shows reasonably good performance and DistributionBased falls short on precision, given both column name and content. Doduo outperforms both matching based approaches using the contextualized embedding.</p>
<p class="doduo-zh" lang="zh-CN">如表 9 所示，Doduo 的列嵌入在精确率和 F1 上取得了最佳的聚类性能。结果确认，上下文化的列嵌入比预测的列类型更有用，并且可能比 fastText 生成的列名/列值嵌入是更准确的表示。与 Doduo 相比，fastText 即便对语义不同的列也倾向于生成相似的嵌入，从而产生包含大量无关列的不必要的大簇。这显著提高了（降低了）表 9 中 fastText 方法的召回率（精确率）。COMA 表现尚可，而 DistributionBased 在同时使用列名和内容的条件下精度偏低。Doduo 使用上下文化嵌入，优于两种基于匹配的方法。</p>

<p class="doduo-en" lang="en">Note that both the column names and column descriptions are not given to the Doduo model as input, and the model was trained on the WikiTable dataset (i.e., different domain.) Thus, this case study also indicates the transferability of a Doduo model trained on one domain (i.e., Wikipedia tables) to another domain (i.e., enterprise database.) so that data scientists can apply the Doduo model in the toolbox for their own needs.</p>
<p class="doduo-zh" lang="zh-CN">需要注意的是，列名和列描述都没有作为输入提供给 Doduo 模型，而且该模型是在 WikiTable 数据集（即不同领域）上训练的。因此，该案例研究也表明，在一个领域（即维基百科表格）上训练的 Doduo 模型可以迁移到另一个领域（即企业数据库），从而让数据科学家能够按自身需要应用工具箱中的 Doduo 模型。</p>


## 8 结论

<p class="doduo-section-en" lang="en">8　CONCLUSION</p>


<p class="doduo-en" lang="en">In this paper, we present Doduo, a unified column annotation framework based on pre-trained Transformer language models and Multi-task learning. Experiments on two benchmark datasets show that Doduo achieves new state-of-the-performance. With a series of analyses, we confirm that the improvements are benefited from the multi-task learning framework. Through the analysis, we also confirm that Doduo is data-efficient, as it can achieve competitive performance as the previous state-of-the-art methods only using 8 tokens per column or about 50% of training data. We conduct a case study and verify the effectiveness of Doduo on a real-world data science problem. We believe our toolbox will further help researcher/data scientists easily apply the state-of-the-art column annotation model to a wide variety of data science and data management problems.</p>
<p class="doduo-zh" lang="zh-CN">本文提出了 Doduo，一个基于预训练 Transformer 语言模型与多任务学习的统一列标注框架。在两个基准数据集上的实验表明，Doduo 达到了新的最优性能。通过一系列分析，我们确认这些提升得益于多任务学习框架。分析还确认 Doduo 具有数据高效性：仅使用每列 8 个 token 或约 50% 的训练数据，它就能达到与先前最优方法相竞争的性能。我们进行了案例研究，验证了 Doduo 在真实世界数据科学问题上的有效性。我们相信，我们的工具箱将进一步帮助研究人员/数据科学家轻松地把最优的列标注模型应用于各种数据科学与数据管理问题。</p>


## 致谢

<p class="doduo-section-en" lang="en">ACKNOWLEDGMENTS</p>


<p class="doduo-en" lang="en">We thank Jin Wang and Estevam Hruschka for their valuable feedback on the draft.</p>
<p class="doduo-zh" lang="zh-CN">我们感谢 Jin Wang 和 Estevam Hruschka 对本文草稿提出的宝贵意见。</p>


## 参考文献

<p class="doduo-section-en" lang="en">REFERENCES</p>


<div class="doduo-refs">
<p>[1] Piotr Bojanowski, Edouard Grave, Armand Joulin, and Tomas Mikolov. 2017. Enriching Word Vectors with Subword Information. Transactions of the Association for Computational Linguistics 5 (2017), 135–146. https://doi.org/10.1162/tacl_a_00051</p>
<p>[2] Kurt Bollacker, Colin Evans, Praveen Paritosh, Tim Sturge, and Jamie Taylor. 2008. Freebase: a collaboratively created graph database for structuring human knowledge. In SIGMOD. 1247–1250.</p>
<p>[3] Ursin Brunner and Kurt Stockinger. 2020. Entity Matching with Transformer Architectures - A Step Forward in Data Integration. In Proceedings of the 23rd International Conference on Extending Database Technology, EDBT 2020, Copenhagen, Denmark, March 30 - April 02, 2020. OpenProceedings.org, 463–473. https://doi.org/10.5441/002/edbt.2020.58</p>
<p>[4] Matteo Cannaviccio, Denilson Barbosa, and Paolo Merialdo. 2018. Towards Annotating Relational Data on the Web with Language Models. In Proceedings of the 2018 World Wide Web Conference (Lyon, France) (WWW ’18). International World Wide Web Conferences Steering Committee, Republic and Canton of Geneva, CHE, 1307–1316. https://doi.org/10.1145/3178876.3186029</p>
<p>[5] Riccardo Cappuzzo, Paolo Papotti, and Saravanan Thirumuruganathan. 2020. Creating Embeddings of Heterogeneous Relational Datasets for Data Integration Tasks. In Proceedings of the 2020 ACM SIGMOD International Conference on Management of Data (Portland, OR, USA) (SIGMOD ’20). Association for Computing Machinery, New York, NY, USA, 1335–1349. https://doi.org/10.1145/3318464.3389742</p>
<p>[6] Rich Caruana. 1993. Multitask Learning: A Knowledge-Based Source of Inductive Bias. In Proceedings of the Tenth International Conference on International Conference on Machine Learning (Amherst, MA, USA) (ICML’93). Morgan Kaufmann Publishers Inc., San Francisco, CA, USA, 41–48.</p>
<p>[7] R. Caruana. 2004. Multitask Learning. Machine Learning 28 (2004), 41–75.</p>
<p>[8] Adriane Chapman, Elena Simperl, Laura Koesten, George Konstantinidis, Luis Daniel Ibáñez, Emilia Kacprzak, and Paul Groth. 2020. Dataset search: a survey. VLDB J. 29, 1 (2020), 251–272.</p>
<p>[9] Jiaoyan Chen, Ernesto Jiménez-Ruiz, Ian Horrocks, and Charles Sutton. 2019. ColNet: Embedding the Semantics of Web Tables for Column Type Prediction. In The Thirty-Third AAAI Conference on Artificial Intelligence, AAAI 2019. AAAI Press, 29–36. https://doi.org/10.1609/aaai.v33i01.330129</p>
<p>[10] Jiaoyan Chen, Ernesto Jiménez-Ruiz, Ian Horrocks, and Charles Sutton. 2019. Learning Semantic Annotations for Tabular Data. In Proceedings of the Twenty Eighth International Joint Conference on Artificial Intelligence, IJCAI 2019, Macao, China, August 10-16, 2019. ijcai.org, 2088–2094. https://doi.org/10.24963/ijcai.2019/289</p>
<p>[11] Kevin Clark, Urvashi Khandelwal, Omer Levy, and Christopher D. Manning. 2019. What Does BERT Look at? An Analysis of BERT’s Attention. In Proc. BlackBoxNLP ’19. 276–286.</p>
<p>[12] Dong Deng, Raul Castro Fernandez, Ziawasch Abedjan, Sibo Wang, Michael Stonebraker, Ahmed K. Elmagarmid, Ihab F. Ilyas, Samuel Madden, Mourad Ouzzani, and Nan Tang. 2017. The Data Civilizer System. In 8th Biennial Conference on Innovative Data Systems Research, CIDR 2017, Chaminade, CA, USA, January 8-11, 2017, Online Proceedings. www.cidrdb.org.</p>
<p>[13] Xiang Deng, Huan Sun, Alyssa Lees, You Wu, and Cong Yu. 2020. TURL: Table Understanding through Representation Learning. Proc. VLDB Endow. 14, 3 (nov 2020), 307–319. https://doi.org/10.14778/3430915.3430921</p>
<p>[14] Jacob Devlin, Ming-Wei Chang, Kenton Lee, and Kristina Toutanova. 2019. BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding. In Proceedings of the 2019 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies, Volume 1 (Long and Short Papers). Association for Computational Linguistics, Minneapolis, Minnesota, 4171–4186. https://doi.org/10.18653/v1/N19-1423</p>
<p>[15] Hong-Hai Do and Erhard Rahm. 2002. COMA—a system for flexible combination of schema matching approaches. In VLDB’02: Proceedings of the 28th International Conference on Very Large Databases. Elsevier, 610–621.</p>
<p>[16] Mor Geva, Ankit Gupta, and Jonathan Berant. 2020. Injecting Numerical Reasoning Skills into Language Models. In Proceedings of the 58th Annual Meeting of the Association for Computational Linguistics. Association for Computational Linguistics, Online, 946–958. https://doi.org/10.18653/v1/2020.acl-main.89</p>
<p>[17] GLUE. 2021. GLUE Leaderboard. https://gluebenchmark.com/leaderboard (2021).</p>
<p>[18] Google. [n.d.]. Google Data Studio. https://datastudio.google.com/</p>
<p>[19] Kazuma Hashimoto, Caiming Xiong, Yoshimasa Tsuruoka, and Richard Socher. 2017. A Joint Many-Task Model: Growing a Neural Network for Multiple NLP Tasks. In Proceedings of the 2017 Conference on Empirical Methods in Natural Language Processing. Association for Computational Linguistics, Copenhagen, Denmark, 1923–1933. https://doi.org/10.18653/v1/D17-1206</p>
<p>[20] Jonathan Herzig, Pawel Krzysztof Nowak, Thomas Müller, Francesco Piccinno, and Julian Eisenschlos. 2020. TaPas: Weakly Supervised Table Parsing via Pre-training. In Proceedings of the 58th Annual Meeting of the Association for Computational Linguistics. Association for Computational Linguistics, Online, 4320–4333. https://doi.org/10.18653/v1/2020.acl-main.398</p>
<p>[21] Kevin Hu, Snehalkumar ’Neil’ S. Gaikwad, Madelon Hulsebos, Michiel A. Bakker, Emanuel Zgraggen, César Hidalgo, Tim Kraska, Guoliang Li, Arvind Satyanarayan, and Çağatay Demiralp. 2019. VizNet: Towards A Large-Scale Visualization Learning and Benchmarking Repository. In Proceedings of the 2019 CHI Conference on Human Factors in Computing Systems (Glasgow, Scotland Uk) (CHI ’19). Association for Computing Machinery, New York, NY, USA, 1–12. https://doi.org/10.1145/3290605.3300892</p>
<p>[22] Madelon Hulsebos, Kevin Hu, Michiel Bakker, Emanuel Zgraggen, Arvind Satyanarayan, Tim Kraska, Çagatay Demiralp, and César Hidalgo. 2019. Sherlock: A Deep Learning Approach to Semantic Data Type Detection. In Proceedings of the 25th ACM SIGKDD International Conference on Knowledge Discovery &amp; Data Mining (Anchorage, AK, USA) (KDD ’19). Association for Computing Machinery, New York, NY, USA, 1500–1508. https://doi.org/10.1145/3292500.3330993</p>
<p>[23] Zhengbao Jiang, Frank F. Xu, Jun Araki, and Graham Neubig. 2020. How Can We Know What Language Models Know? Transactions of the Association for Computational Linguistics 8 (2020), 423–438. https://doi.org/10.1162/tacl_a_00324</p>
<p>[24] Udayan Khurana and Sainyam Galhotra. 2021. Semantic Concept Annotation for Tabular Data. In Proceedings of the 30th ACM International Conference on Information &amp; Knowledge Management. Association for Computing Machinery, New York, NY, USA, 844–853. https://doi.org/10.1145/3459637.3482295</p>
<p>[25] Christos Koutras, George Siachamis, Andra Ionescu, Kyriakos Psarakis, Jerry Brons, Marios Fragkoulis, Christoph Lofi, Angela Bonifati, and Asterios Katsifodimos. 2021. Valentine: Evaluating Matching Techniques for Dataset Discovery. In 2021 IEEE 37th International Conference on Data Engineering (ICDE). IEEE, 468–479.</p>
<p>[26] Yuliang Li, Jinfeng Li, Yoshihiko Suhara, AnHai Doan, and Wang-Chiew Tan. 2020. Deep entity matching with pre-trained language models. Proceedings of the VLDB Endowment 14, 1 (Sep 2020), 50–60. https://doi.org/10.14778/3421424.3421431</p>
<p>[27] Yuliang Li, Jinfeng Li, Yoshihiko Suhara, Jin Wang, Wataru Hirota, and Wang-Chiew Tan. 2021. Deep Entity Matching: Challenges and Opportunities. J. Data and Information Quality 13, 1, Article 1 (Jan. 2021), 17 pages. https://doi.org/10.1145/3431816</p>
<p>[28] Girija Limaye, Sunita Sarawagi, and Soumen Chakrabarti. 2010. Annotating and Searching Web Tables Using Entities, Types and Relationships. Proc. VLDB Endow. 3, 1–2 (Sept. 2010), 1338–1347. https://doi.org/10.14778/1920841.1921005</p>
<p>[29] Erin Macdonald and Denilson Barbosa. 2020. Neural Relation Extraction on Wikipedia Tables for Augmenting Knowledge Graphs. Association for Computing Machinery, New York, NY, USA, 2133–2136. https://doi.org/10.1145/3340531.3412164</p>
<p>[30] Mohammad Mahdavi and Ziawasch Abedjan. 2020. Baran: Effective error correction via a unified context representation and transfer learning. Proceedings of the VLDB Endowment (PVLDB) 13, 11 (2020), 1948–1961.</p>
<p>[31] Mohammad Mahdavi, Ziawasch Abedjan, Raul Castro Fernandez, Samuel Madden, Mourad Ouzzani, Michael Stonebraker, and Nan Tang. 2019. Raha: A configuration-free error detection system. In Proceedings of the International Conference on Management of Data (SIGMOD). ACM, 865–882.</p>
<p>[32] Tomás Mikolov, Kai Chen, Greg Corrado, and Jeffrey Dean. 2013. Efficient Estimation of Word Representations in Vector Space. In 1st International Conference on Learning Representations, ICLR 2013, Scottsdale, Arizona, USA, May 2-4, 2013, Workshop Track Proceedings. http://arxiv.org/abs/1301.3781</p>
<p>[33] Renée J. Miller. 2018. Open Data Integration. Proc. VLDB Endow. 11, 12 (Aug. 2018), 2130–2139. https://doi.org/10.14778/3229863.3240491</p>
<p>[34] Emir Muñoz, Aidan Hogan, and Alessandra Mileo. 2014. Using Linked Data to Mine RDF from Wikipedia’s Tables. In Proceedings of the 7th ACM International Conference on Web Search and Data Mining (New York, New York, USA) (WSDM ’14). Association for Computing Machinery, New York, NY, USA, 533–542. https://doi.org/10.1145/2556195.2556266</p>
<p>[35] Ndapandula Nakashole, Gerhard Weikum, and Fabian Suchanek. 2012. PATTY: A Taxonomy of Relational Patterns with Semantic Types. In Proceedings of the 2012 Joint Conference on Empirical Methods in Natural Language Processing and Computational Natural Language Learning. Association for Computational Linguistics, Jeju Island, Korea, 1135–1145. https://www.aclweb.org/anthology/D12-1104</p>
<p>[36] Phuc Nguyen, Natthawut Kertkeidkachorn, Ryutaro Ichise, and Hideaki Takeda. [n.d.]. MTab4DBpedia: Semantic Annotation for Tabular Data with DBpedia.</p>
<p>[37] Masayo Ota, Heiko Müller, Juliana Freire, and Divesh Srivastava. 2020. Data Driven Domain Discovery for Structured Datasets. Proc. VLDB Endow. 13, 7 (March 2020), 953–967. https://doi.org/10.14778/3384345.3384346</p>
<p>[38] Adam Paszke, Sam Gross, Francisco Massa, Adam Lerer, James Bradbury, Gregory Chanan, Trevor Killeen, Zeming Lin, Natalia Gimelshein, Luca Antiga, Alban Desmaison, Andreas Kopf, Edward Yang, Zachary DeVito, Martin Raison, Alykhan Tejani, Sasank Chilamkurthy, Benoit Steiner, Lu Fang, Junjie Bai, and Soumith Chintala. 2019. PyTorch: An Imperative Style, High-Performance Deep Learning Library. In Advances in Neural Information Processing Systems 32. Curran Associates, Inc., 8024–8035.</p>
<p>[39] Jeffrey Pennington, Richard Socher, and Christopher Manning. 2014. GloVe: Global Vectors for Word Representation. In Proceedings of the 2014 Conference on Empirical Methods in Natural Language Processing (EMNLP). Association for Computational Linguistics, Doha, Qatar, 1532–1543. https://doi.org/10.3115/v1/D14-1162</p>
<p>[40] Fabio Petroni, Tim Rocktäschel, Sebastian Riedel, Patrick Lewis, Anton Bakhtin, Yuxiang Wu, and Alexander Miller. 2019. Language Models as Knowledge Bases? In Proceedings of the 2019 Conference on Empirical Methods in Natural Language Processing and the 9th International Joint Conference on Natural Language Processing (EMNLP-IJCNLP). Association for Computational Linguistics, Hong Kong, China, 2463–2473. https://doi.org/10.18653/v1/D19-1250</p>
<p>[41] Erhard Rahm and Philip A. Bernstein. 2001. A survey of approaches to automatic schema matching. VLDB J. 10, 4 (2001), 334–350.</p>
<p>[42] Adam Roberts, Colin Raffel, and Noam Shazeer. 2020. How Much Knowledge Can You Pack Into the Parameters of a Language Model? In Proceedings of the 2020 Conference on Empirical Methods in Natural Language Processing (EMNLP). Association for Computational Linguistics, Online, 5418–5426. https://doi.org/10.18653/v1/2020.emnlp-main.437</p>
<p>[43] Anna Rogers, Olga Kovaleva, and Anna Rumshisky. 2020. A Primer in BERTology: What We Know About How BERT Works. Transactions of the Association for Computational Linguistics 8 (2020), 842–866. https://doi.org/10.1162/tacl_a_00349</p>
<p>[44] Sebastian Ruder. 2017. An Overview of Multi-Task Learning in Deep Neural Networks. arXiv:1706.05098 [cs.LG]</p>
<p>[45] Sebastian Schelter, Dustin Lange, Philipp Schmidt, Meltem Celikel, Felix Bießmann, and Andreas Grafberger. 2018. Automating Large-Scale Data Quality Verification. Proc. VLDB Endow. 11, 12 (2018), 1781–1794.</p>
<p>[46] Tableau Software. [n.d.]. Tableau. https://www.tableau.com/</p>
<p>[47] Yu Sun, Shuohuan Wang, Yu-Kun Li, Shikun Feng, Hao Tian, Hua Wu, and Haifeng Wang. 2020. ERNIE 2.0: A Continual Pre-Training Framework for Language Understanding. In AAAI. 8968–8975.</p>
<p>[48] Kunihiro Takeoka, Masafumi Oyamada, Shinji Nakadai, and Takeshi Okadome. 2019. Meimei: An Efficient Probabilistic Approach for Semantically Annotating Tables. Proceedings of the AAAI Conference on Artificial Intelligence 33, 01 (Jul. 2019), 281–288. https://doi.org/10.1609/aaai.v33i01.3301281</p>
<p>[49] Nan Tang, Ju Fan, Fangyi Li, Jianhong Tu, Xiaoyong Du, Guoliang Li, Sam Madden, and Mourad Ouzzani. 2021. RPT: Relational Pre-Trained Transformer is Almost All You Need towards Democratizing Data Preparation. Proc. VLDB Endow. 14, 8 (apr 2021), 1254–1261. https://doi.org/10.14778/3457390.3457391</p>
<p>[50] Ian Tenney, Dipanjan Das, and Ellie Pavlick. 2019. BERT Rediscovers the Classical NLP Pipeline. In ACL. 4593–4601.</p>
<p>[51] Ian Tenney, Dipanjan Das, and Ellie Pavlick. 2019. BERT Rediscovers the Classical NLP Pipeline. In Proceedings of the 57th Annual Meeting of the Association for Computational Linguistics. Association for Computational Linguistics, Florence, Italy, 4593–4601. https://doi.org/10.18653/v1/P19-1452</p>
<p>[52] Mohamed Trabelsi, Jin Cao, and Jeff Heflin. 2020. Semantic Labeling Using a Deep Contextualized Language Model. arXiv:2010.16037 [cs.LG]</p>
<p>[53] Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N Gomez, Łukasz Kaiser, and Illia Polosukhin. 2017. Attention is all you need. In Proc. NIPS ’17. 5998–6008.</p>
<p>[54] Petros Venetis, Alon Halevy, Jayant Madhavan, Marius Paşca, Warren Shen, Fei Wu, Gengxin Miao, and Chung Wu. 2011. Recovering Semantics of Tables on the Web. Proc. VLDB Endow. 4, 9 (June 2011), 528–538. https://doi.org/10.14778/2002938.2002939</p>
<p>[55] Eric Wallace, Yizhong Wang, Sujian Li, Sameer Singh, and Matt Gardner. 2019. Do NLP Models Know Numbers? Probing Numeracy in Embeddings. In Proceedings of the 2019 Conference on Empirical Methods in Natural Language Processing and the 9th International Joint Conference on Natural Language Processing (EMNLP-IJCNLP). Association for Computational Linguistics, Hong Kong, China, 5307–5315. https://doi.org/10.18653/v1/D19-1534</p>
<p>[56] Alex Wang, Amanpreet Singh, Julian Michael, Felix Hill, Omer Levy, and Samuel R. Bowman. 2019. GLUE: A Multi-Task Benchmark and Analysis Platform for Natural Language Understanding. In ICLR.</p>
<p>[57] Daheng Wang, Prashant Shiralkar, Colin Lockard, Binxuan Huang, Xin Luna Dong, and Meng Jiang. 2021. TCN: Table Convolutional Network for Web Table Interpretation. In Proceedings of the Web Conference 2021 (Ljubljana, Slovenia) (WWW ’21). Association for Computing Machinery, New York, NY, USA, 4020–4032. https://doi.org/10.1145/3442381.3450090</p>
<p>[58] Zhiruo Wang, Haoyu Dong, Ran Jia, Jia Li, Zhiyi Fu, Shi Han, and Dongmei Zhang. 2021. TUTA: Tree-Based Transformers for Generally Structured Table Pre-Training. In Proceedings of the 27th ACM SIGKDD Conference on Knowledge Discovery &amp; Data Mining (Virtual Event, Singapore) (KDD ’21). Association for Computing Machinery, New York, NY, USA, 1780–1790. https://doi.org/10.1145/3447548.3467434</p>
<p>[59] Thomas Wolf, Lysandre Debut, Victor Sanh, Julien Chaumond, Clement Delangue, Anthony Moi, Pierric Cistac, Tim Rault, Rémi Louf, Morgan Funtowicz, Joe Davison, Sam Shleifer, Patrick von Platen, Clara Ma, Yacine Jernite, Julien Plu, Canwen Xu, Teven Le Scao, Sylvain Gugger, Mariama Drame, Quentin Lhoest, and Alexander M. Rush. 2020. Transformers: State-of-the-Art Natural Language Processing. In Proceedings of the 2020 Conference on Empirical Methods in Natural Language Processing: System Demonstrations. Association for Computational Linguistics, Online, 38–45.</p>
<p>[60] Neo Wu, Bradley Green, Xue Ben, and Shawn O’Banion. 2020. Deep transformer models for time series forecasting: The influenza prevalence case. arXiv preprint arXiv:2001.08317 (2020).</p>
<p>[61] Yongxin Yang and Timothy M. Hospedales. 2017. Trace Norm Regularised Deep Multi-Task Learning. In ICLR ’17 Workshop Track.</p>
<p>[62] Alexander Yates, Michele Banko, Matthew Broadhead, Michael Cafarella, Oren Etzioni, and Stephen Soderland. 2007. TextRunner: Open Information Extraction on the Web. In Proceedings of Human Language Technologies: The Annual Conference of the North American Chapter of the Association for Computational Linguistics (NAACL-HLT). Association for Computational Linguistics, Rochester, New York, USA, 25–26.</p>
<p>[63] Pengcheng Yin, Graham Neubig, Wen-tau Yih, and Sebastian Riedel. 2020. TaBERT: Pretraining for Joint Understanding of Textual and Tabular Data. In Proceedings of the 58th Annual Meeting of the Association for Computational Linguistics. Association for Computational Linguistics, Online, 8413–8426. https://doi.org/10.18653/v1/2020.acl-main.745</p>
<p>[64] Amir R. Zamir, Alexander Sax, William B. Shen, Leonidas J. Guibas, Jitendra Malik, and Silvio Savarese. 2018. Taskonomy: Disentangling Task Transfer Learning. In IEEE Conference on Computer Vision and Pattern Recognition (CVPR). IEEE.</p>
<p>[65] ChengXiang Zhai. 2008. Statistical Language Models for Information Retrieval: A Critical Review. Found. Trends Inf. Retr. 2, 3 (2008), 137–213. https://doi.org/10.1561/1500000008</p>
<p>[66] Dan Zhang, Yoshihiko Suhara, Jinfeng Li, Madelon Hulsebos, Çağatay Demiralp, and Wang-Chiew Tan. 2020. Sato: Contextual Semantic Type Detection in Tables. Proc. VLDB Endow. 13, 12 (July 2020), 1835–1848. https://doi.org/10.14778/3407790.3407793</p>
<p>[67] Meihui Zhang, Marios Hadjieleftheriou, Beng Chin Ooi, Cecilia M Procopiuc, and Divesh Srivastava. 2011. Automatic discovery of attributes in relational databases. In Proceedings of the 2011 ACM SIGMOD International Conference on Management of data. 109–120.</p>
</div>


## A 补充分析

<p class="doduo-section-en" lang="en">A　ADDITIONAL ANALYSIS</p>



### A.1 详细结果

<p class="doduo-section-en" lang="en">A.1　Detailed Results</p>


<p class="doduo-en" lang="en">Figure 5 shows the F1 score of Doduo and Sato for each class on the VizNet (Full) and VizNet (Multi-column only) datasets. The improvements against Sato on the two variants of the VizNet datasets indicate that Doduo robustly and consistently performs better than Sato, especially for single-column tables, where Sato cannot benefit from the table features and CRF. We found that Sato shows zero or very poor F1 values for religion, education, organisation. The labeled columns in the training data in the 1st fold of the VizNet (Full) are only 24, 22, and 14, respectively. Sato should suffer from the lack of training examples for those column types, and probably the skewed column type distribution as well. We show that Doduo robustly performs well on such column types.</p>
<p class="doduo-zh" lang="zh-CN">图 5 展示了 Doduo 与 Sato 在 VizNet（完整集）和 VizNet（仅多列）数据集上每个类别的 F1 分数。在 VizNet 的两个变体上相对 Sato 的提升表明，Doduo 稳健且一致地优于 Sato，尤其是在单列表格上——在单列表格中 Sato 无法受益于表格特征和 CRF。我们发现，Sato 在 religion、education、organisation 这几类上的 F1 为零或非常差。VizNet（完整集）第 1 折的训练数据中，这三类的标注列分别只有 24、22 和 14 个。Sato 应当是由于这些列类型的训练样本不足（很可能还有列类型分布偏斜）而表现不佳。我们表明，Doduo 在这类列类型上表现稳健。</p>

<figure class="doduo-figure">
  <a href="/images/posts/doduo-translation/figure-5.webp" target="_blank" rel="noopener" aria-label="在新标签页查看原图"><img src="/images/posts/doduo-translation/figure-5.webp" alt="图 5 / Figure 5" width="1127" height="605" loading="lazy" decoding="async"></a>
  <figcaption>
    <div class="doduo-en" lang="en"><b>Figure 5:</b> Class F1 values by Doduo and Sato on the VizNet dataset (Above: Full set; Below: Multi-column only.)</div>
    <div class="doduo-zh" lang="zh-CN"><b>图 5：</b>Doduo 与 Sato 在 VizNet 数据集上各分类的 F1 值（上：完整集；下：仅多列）。</div>
  </figcaption>
</figure>

<p class="doduo-en" lang="en">Table 10 shows the performance of Doduo and Dosolo on the WikiTable dataset for 6 column types/column relations. We confirm that Doduo tends to perform better for the column types/relations that are less clearly distinguishable (e.g., artist vs. writer, place-of-birth vs. place-lived.)</p>
<p class="doduo-zh" lang="zh-CN">表 10 展示了 Doduo 与 Dosolo 在 WikiTable 数据集上 6 种列类型/列关系上的性能。我们确认，Doduo 在那些较难区分的列类型/列关系上（例如 artist 与 writer、place-of-birth 与 place-lived）往往表现更好。</p>

<div class="doduo-tbl-cap">
  <div class="doduo-en" lang="en"><b>Table 10:</b> Further analysis on column type prediction (left) and on column relation prediction (right.)</div>
  <div class="doduo-zh" lang="zh-CN"><b>表 10：</b>对列类型预测（左）与列关系预测（右）的进一步分析。</div>
</div>
<div class="doduo-two-col">
  <div>
    <table class="doduo-table" tabindex="0" aria-label="论文数据表，可横向滚动">
      <tr><th>Column type 列类型</th><th>Doduo (F1)</th><th>Dosolo (F1)</th></tr>
      <tr><td>music.artist</td><td>84.03</td><td>81.87</td></tr>
      <tr><td>music.genre</td><td>93.33</td><td>87.50</td></tr>
      <tr><td>music.writer</td><td>75.00</td><td>40.00</td></tr>
      <tr><td>american_football.football_coach</td><td>70.59</td><td>66.67</td></tr>
      <tr><td>american_football.football_conference</td><td>44.44</td><td>36.36</td></tr>
      <tr><td>american_football.football_team</td><td>86.67</td><td>86.36</td></tr>
    </table>
  </div>
  <div>
    <table class="doduo-table" tabindex="0" aria-label="论文数据表，可横向滚动">
      <tr><th>Column relation 列关系</th><th>Doduo (F1)</th><th>Dosolo (F1)</th></tr>
      <tr><td>film.film.production_companies</td><td>80.95</td><td>74.29</td></tr>
      <tr><td>film.film.produced_by</td><td>43.90</td><td>38.89</td></tr>
      <tr><td>film.film.story_by</td><td>100.00</td><td>90.91</td></tr>
      <tr><td>people.person.place_of_birth</td><td>92.00</td><td>90.79</td></tr>
      <tr><td>people.person.place_lived</td><td>85.98</td><td>77.67</td></tr>
      <tr><td>people.person.nationality</td><td>100.00</td><td>98.80</td></tr>
    </table>
  </div>
</div>


### A.2 输入 token 长度

<p class="doduo-section-en" lang="en">A.2　Input Token Length</p>


<p class="doduo-en" lang="en">For the VizNet dataset, we tested Doduo and Dosolo<sub>SCol</sub> with different maximum token numbers per column. Table 11 shows the similar trends as the results on the WikiTable dataset. Doduo with 8 max tokens per column with Doduo outperforms the state-of-the-art method (i.e., Sato) on the task. As we observe significant differences between the multi-column model (Doduo) and the single-column model (Dosolo<sub>SCol</sub>), we consider it is mainly because the Transformer blocks (i.e., self-attention mechanisms) capture the inter-column table context successfully.</p>
<p class="doduo-zh" lang="zh-CN">对于 VizNet 数据集，我们测试了每列最大 token 数不同的 Doduo 与 Dosolo<sub>SCol</sub>。表 11 显示出与 WikiTable 数据集结果相似的趋势。每列最多 8 个 token 的 Doduo 在该任务上优于当时的最优方法（即 Sato）。由于我们观察到多列模型（Doduo）与单列模型（Dosolo<sub>SCol</sub>）之间存在显著差异，我们认为这主要是因为 Transformer 模块（即自注意力机制）成功捕捉了列间的表格上下文。</p>

<div class="doduo-tbl-cap">
  <div class="doduo-en" lang="en"><b>Table 11:</b> Comparisons with different input token size on the VizNet (Full) dataset.</div>
  <div class="doduo-zh" lang="zh-CN"><b>表 11：</b>在 VizNet（完整集）数据集上不同输入 token 规模的比较。</div>
</div>
<table class="doduo-table" tabindex="0" aria-label="论文数据表，可横向滚动">
  <tr><th>Method 方法</th><th>MaxToken/col 每列最大 token</th><th>Macro F1</th><th>Micro F1</th></tr>
  <tr><td rowspan="3">Doduo</td><td>8</td><td>81.0</td><td>92.5</td></tr>
  <tr><td>16</td><td>83.6</td><td>93.6</td></tr>
  <tr><td>32</td><td>83.4</td><td>94.2</td></tr>
  <tr><td rowspan="3">Dosolo<sub>SCol</sub></td><td>8</td><td>72.7</td><td>87.2</td></tr>
  <tr><td>16</td><td>76.1</td><td>89.1</td></tr>
  <tr><td>32</td><td>77.4</td><td>90.2</td></tr>
</table>


### A.3 学习效率

<p class="doduo-section-en" lang="en">A.3　Learning Efficiency</p>


<p class="doduo-en" lang="en">（原文本节仅有标题，正文内容见 6.2 节与图 4。）</p>
<p class="doduo-zh" lang="zh-CN">（原文此处为一个只有标题、没有正文的小节，相关内容见 6.2 节与图 4。）</p>


### A.4 列间依赖

<p class="doduo-section-en" lang="en">A.4　Inter-column Dependency</p>


<p class="doduo-en" lang="en">A strength of the Transformer architecture is stacked Transformer blocks that calculate highly contextual information through the self-attention mechanism. As described in Section 4, Doduo uses the [CLS] dummy symbols to explicitly obtain contextualized column representations. The representations not only take into account table context but also explicitly incorporate the inter-column dependency. That is, as we showed in Figure 2, predictions for some columns should be relevant and useful for other columns in the table. To the best of our knowledge, none of the existing work that applies pre-trained LMs to tables has conducted this type of analysis for better understanding how the Transformer-based model captures the semantics of tables.</p>
<p class="doduo-zh" lang="zh-CN">Transformer 架构的一个优势在于堆叠的 Transformer 模块能够通过自注意力机制计算出高度上下文相关的信息。如第 4 节所述，Doduo 使用 [CLS] 哑符号来显式地获得上下文化的列表示。这些表示不仅考虑表格上下文，还显式地纳入列间依赖关系。也就是说，正如我们在图 2 中展示的那样，对某些列的预测应当与表格中的其他列相关并且对其他列有用。据我们所知，现有将预训练 LM 应用于表格的工作中，还没有哪一项进行过这类分析，以更好地理解基于 Transformer 的模型如何捕捉表格语义。</p>

<p class="doduo-en" lang="en">Thus, we conduct attention analysis to further understand how the attention mechanisms of Doduo (i.e., the pre-trained LM) captures the inter-column dependency and the semantic similarity between them. Following the literature of attention analysis in NLP [11, 43, 51], we look into attention weights for the analysis. It is known that in pre-trained Transformer-based LMs, the deep layer focuses on semantic similarity between tokens [11, 51]. Therefore, to investigate the high-level (semantic) similarity between columns, we looked into the attention weights of the last Transformer block. We used the VizNet dataset (Multi-column only) for the analysis.</p>
<p class="doduo-zh" lang="zh-CN">因此，我们进行注意力分析，以进一步理解 Doduo（即预训练 LM）的注意力机制如何捕捉列间依赖以及列之间的语义相似性。遵循 NLP 中注意力分析的文献 [11, 43, 51]，我们考察注意力权重来进行分析。已有研究表明，在预训练 Transformer LM 中，深层关注 token 之间的语义相似性 [11, 51]。因此，为考察列之间的高层（语义）相似性，我们观察最后一层 Transformer 模块的注意力权重。分析使用 VizNet 数据集（仅多列）。</p>

<p class="doduo-en" lang="en">Specifically, we focus on attention weights between [CLS] tokens (i.e., column representations.) Since Transformer-based LMs usually have multiple attention heads (e.g., 12 heads in the BERT Base model,) we aggregate attention weights of all attention heads. As a result, we obtain an <i>S</i> × <i>S</i> matrix, where <i>S</i> denotes the input sequence length. We disregard aggregated attention weights other than those for [CLS] tokens. After masking out any attention weights other than [CLS] tokens, we averaged the matrices obtained from all tables in the dataset so that we can create a single |<i>C</i><sub>type</sub>| × |<i>C</i><sub>type</sub>| matrix that represents the dependency between column types. This gives us aggregated information about the dependency between column types.</p>
<p class="doduo-zh" lang="zh-CN">具体而言，我们关注 [CLS] token（即列表示）之间的注意力权重。由于基于 Transformer 的 LM 通常有多个注意力头（例如 BERT Base 模型有 12 个），我们把所有注意力头的注意力权重聚合起来。结果得到一个 <i>S</i> × <i>S</i> 矩阵，其中 <i>S</i> 表示输入序列长度。我们忽略 [CLS] token 之外的聚合注意力权重。在把 [CLS] token 之外的注意力权重屏蔽掉之后，我们对数据集中所有表格得到的矩阵取平均，从而构造一个 |<i>C</i><sub>type</sub>| × |<i>C</i><sub>type</sub>| 的矩阵，用于表示列类型之间的依赖关系。这为我们提供了关于列类型之间依赖关系的聚合信息。</p>

<p class="doduo-en" lang="en">Each element (<i>i</i>, <i>j</i>) in the final matrix represents how much the column type <i>i</i> relies on the other column type <i>j</i> for its contextualized representation. Note that the dependency of column type <i>i</i> (or <i>j</i>) for column type <i>j</i> (or <i>i</i>) can be different, and thus the matrix is not symmetric. For example, age highly relies on the type origin, whereas the opposite direction has negative attention weight showing a low degree of dependency. To eliminate the influence of the co-occurrence of column types, we counted the co-occurrence of column types in the same table and normalized the matrix to make the reference point to be zero for more straightforward interpretation. As a result, the final matrix consists of relative importance scores, and higher/lower values mean more/less influence from the column type.</p>
<p class="doduo-zh" lang="zh-CN">最终矩阵中的每个元素 (<i>i</i>, <i>j</i>) 表示列类型 <i>i</i> 在构造其上下文化表示时对另一个列类型 <i>j</i> 的依赖程度。需要注意，列类型 <i>i</i> 对 <i>j</i>（或 <i>j</i> 对 <i>i</i>）的依赖可以不同，因此该矩阵并不对称。例如，age 高度依赖类型 origin，而反方向的注意力权重为负，显示出较低的依赖程度。为消除列类型共现带来的影响，我们统计了同一表格中列类型的共现情况，并对矩阵做归一化，使参照点为零，以便更直观地解释。最终矩阵由相对重要性分数构成，数值越高/越低表示来自该列类型的影响越强/越弱。</p>

<figure class="doduo-figure">
  <a href="/images/posts/doduo-translation/figure-6.webp" target="_blank" rel="noopener" aria-label="在新标签页查看原图"><img src="/images/posts/doduo-translation/figure-6.webp" alt="图 6 / Figure 6" width="556" height="663" loading="lazy" decoding="async"></a>
  <figcaption>
    <div class="doduo-en" lang="en"><b>Figure 6:</b> Inter-column dependency based on attention analysis on the VizNet dataset. A higher value (red) indicates that the column type (<i>y</i>-axis) “relies on” the other column type (<i>x</i>-axis) for prediction. Each row denotes the degree of “dependence” against each column. For example, age in <i>y</i>-axis has a high attention weight against origin in <i>x</i>-axis, indicating that predicting age relies on signals from the origin column.</div>
    <div class="doduo-zh" lang="zh-CN"><b>图 6：</b>基于 VizNet 数据集上注意力分析的列间依赖。数值越高（红色）表示该列类型（<i>y</i> 轴）在预测时“依赖”另一个列类型（<i>x</i> 轴）。每一行表示相对于各列的“依赖”程度。例如，<i>y</i> 轴上的 age 相对于 <i>x</i> 轴上的 origin 具有较高的注意力权重，表明预测 age 依赖来自 origin 列的信号。</div>
  </figcaption>
</figure>


### A.5 语言模型探测

<p class="doduo-section-en" lang="en">A.5　Language Model Probing</p>


<p class="doduo-en" lang="en">Recent applications of pre-trained LMs to data management tasks including entity matching [3, 26] and column annotation tasks [13, 57] have shown great success by improving previous SoTA performance by a large margin. However, little is known about how well pre-trained LMs inherently know about the problem in the first place. Pre-trained LMs are trained on large-scale textual corpora, and the pre-training process helps the pre-trained LM to memorize and generalize the knowledge stored in the pre-training corpus. There is a line of recent work that aims to investigate how well pre-trained LMs know about factual knowledge [23, 40, 42]. The studies have shown that pre-trained LMs store a significant amount of factual knowledge through pre-training on large-scale corpora. Therefore, we hypothesized that Doduo’s performance was partly boosted by the knowledge obtained from the pre-training corpus that might store knowledge relevant to the task. To verify the hypothesis, we evaluated if the BERT model, which we used as the base model for the experiments, stored relevant knowledge for the column annotation problem.</p>
<p class="doduo-zh" lang="zh-CN">近期把预训练 LM 应用于数据管理任务（包括实体匹配 [3, 26] 和列标注任务 [13, 57]）的工作取得了很大成功，把此前的最优性能大幅提升。然而，关于预训练 LM 本身在多大程度上“天生”了解该问题，人们知之甚少。预训练 LM 在大规模文本语料上训练，预训练过程帮助它记忆并泛化预训练语料中存储的知识。近期有一系列工作旨在考察预训练 LM 对事实性知识的掌握程度 [23, 40, 42]。这些研究表明，预训练 LM 通过在大规模语料上预训练，存储了大量事实性知识。因此，我们假设 Doduo 的性能部分得益于预训练语料中获得的知识——该语料可能存储了与任务相关的知识。为验证这一假设，我们评估了实验中作为基础模型的 BERT 是否存储了与列标注问题相关的知识。</p>

<p class="doduo-en" lang="en">In the analysis, following the line of work [23, 40, 42], we use the template-based approach to test if a pre-trained LM knows the factual knowledge. Specifically, we use a template that has a blank field for the column type like below:</p>
<p class="doduo-zh" lang="zh-CN">在分析中，遵循 [23, 40, 42] 的研究路线，我们使用基于模板的方法来检验预训练 LM 是否掌握事实性知识。具体而言，我们使用一个为列类型留有空白字段的模板，如下所示：</p>

<div class="doduo-eq">Judy Morris is ______.</div>
<p class="doduo-zh" lang="zh-CN">（朱迪·莫里斯是 ______。）</p>

<p class="doduo-en" lang="en">In this example, “director” should be a better fit than other column types (e.g., “actor”, “player”, etc.) In this way, we conclude that the model knows the fact if the model judges the template with the true column type (e.g., “director”) more likely than other sentences that use different column types (e.g., “actor”, “player”, etc.). To evaluate the likelihood of a sequence after filling the blank in the template, we use the perplexity score of a sequence using the pre-trained LM. Perplexity is used to measure how well the LM can predict each token from the context (i.e., the other tokens in the sequence<sup>6</sup>) and is calculated by the average likelihood of a sequence. It is a common metric to evaluate how “natural” the text is from the LM perspective. The perplexity of a sequence of tokens <i>X</i> = (<i>x</i><sub>1</sub>, <i>x</i><sub>2</sub>, . . . , <i>x</i><sub>t</sub>) is defined by:</p>
<p class="doduo-zh" lang="zh-CN">在这个例子中，“director”（导演）应当比其他列类型（如“actor”“player”等）更合适。按这种方式，如果模型认为填入真实列类型（如“director”）的模板比其他使用不同列类型（如“actor”“player”等）的句子更可能成立，我们就断定模型掌握该事实。为评估模板填空后序列的似然，我们使用预训练 LM 计算序列的困惑度（perplexity）分数。困惑度用于衡量 LM 能从上下文中（即序列中的其他 token<sup>6</sup>）多好地预测每个 token，由序列的平均似然计算得到。它是从 LM 视角评估文本“自然程度”的常用指标。token 序列 <i>X</i> = (<i>x</i><sub>1</sub>, <i>x</i><sub>2</sub>, . . . , <i>x</i><sub>t</sub>) 的困惑度定义为：</p>

<div class="doduo-eq">PPL(<i>X</i>) = exp( − (1/<i>t</i>) Σ<sup><i>t</i></sup><sub><i>i</i></sub> log <i>p</i><sub><i>θ</i></sub>(<i>x</i><sub><i>i</i></sub> | <i>x</i><sub>\<i>i</i></sub>) )　　(3)</div>

<p class="doduo-en" lang="en">where <i>p</i><sub><i>θ</i></sub>(<i>x</i><sub><i>i</i></sub> | <i>x</i><sub>\<i>i</i></sub>) denotes the probability of an LM <i>θ</i> (e.g., BERT) predicting a target token <i>x</i><sub><i>i</i></sub> given the context in <i>X</i> with <i>x</i><sub><i>i</i></sub> masked out. With the same LM, the lower perplexity score for a sentence indicates it is easier for the LM to generate the sentence. We use the perplexity to score column types for each column value (e.g., Judy Morris) by filling each column type name in the template. Then, we can evaluate if the ground truth label (i.e., “director” in this case) has the best (i.e., lowest) perplexity among all candidates.</p>
<p class="doduo-zh" lang="zh-CN">其中 <i>p</i><sub><i>θ</i></sub>(<i>x</i><sub><i>i</i></sub> | <i>x</i><sub>\<i>i</i></sub>) 表示语言模型 <i>θ</i>（如 BERT）在给定 <i>X</i> 中其余上下文（<i>x</i><sub><i>i</i></sub> 被掩码）的条件下预测目标 token <i>x</i><sub><i>i</i></sub> 的概率。对同一个 LM 而言，句子的困惑度越低，说明 LM 越容易生成该句子。我们利用困惑度为每个列值（如 Judy Morris）给各列类型打分，做法是把每个列类型名称填入模板。然后，我们就可以评估真实标签（此例中为“director”）是否在所有候选中具有最好（即最低）的困惑度。</p>

<p class="doduo-en" lang="en">For the analysis, we use the vanilla BERT (bert-base-uncased) model, which is the same base model used for Doduo in the experiments. We use the average rank and the normalized PPL (= PPL / Avg. PPL, where Avg. PPL denotes the average perplexity of all column types for evaluation.) Since perplexity values for sequences with different lengths are not directly comparable, we selected column types that are tokenized into a single token by the BERT tokenizer<sup>7</sup>. As a result, 80 (out of 255) and 75 (out of 78) column types were selected for the WikiTable and VizNet datasets for the analysis, respectively.</p>
<p class="doduo-zh" lang="zh-CN">分析中我们使用原始 BERT（bert-base-uncased）模型，它与实验中 Doduo 所使用的基础模型相同。我们使用平均排名和归一化 PPL（= PPL / Avg. PPL，其中 Avg. PPL 表示用于评估的所有列类型的平均困惑度）。由于不同长度序列的困惑度数值不能直接比较，我们挑选了被 BERT 分词器切分为单个 token 的列类型<sup>7</sup>。最终，WikiTable 和 VizNet 数据集分别选出 80 个（共 255 个）和 75 个（共 78 个）列类型用于分析。</p>

<p class="doduo-en" lang="en">We can use the same framework for the column relation prediction task as well. In this case, we consider a different template that has a blank field for the column relation. For example, <i>Derrick Henry ______ Yulee, Florida.</i> In this example, the likelihood of a sentence with “was born in” (place_of_birth) should be judged higher than that with “was died in” (place_of_death), which requires factual knowledge about the person. Since the column relation types are not written in plain language, we manually converted column relation type names so that they better fit in the template (entity 1, relation, entity 2). Examples of converted column relation names are (place_of_birth, “was born in”), (directed_by, “is directed by”). We filtered 34 (out of 121) column relation types to make sure the converted relation type names have the exact same number of tokens.</p>
<p class="doduo-zh" lang="zh-CN">同一框架也可用于列关系预测任务。此时，我们考虑一个为列关系留有空白字段的不同模板。例如：<i>Derrick Henry ______ Yulee, Florida.</i> 在这个例子中，填入“was born in”（place_of_birth）的句子似然应当被判定为高于填入“was died in”（place_of_death）的句子，而这需要关于该人物的事实性知识。由于列关系类型并非以自然语言书写，我们人工转换了列关系类型名称，使其更适合填入模板（实体 1，关系，实体 2）。转换后的列关系名称示例如 (place_of_birth, “was born in”)、(directed_by, “is directed by”)。我们筛选出 34 个（共 121 个）列关系类型，以确保转换后的关系类型名称具有完全相同的 token 数。</p>

<p class="doduo-en" lang="en">As a more direct way to test the hypothesis, we also evaluated a variant of Doduo that randomly initialized model parameters instead of using the pre-trained parameters of BERT. In this way, we can test the performance when the model with the identical architecture is trained from scratch only using training data of the target task. The model did not show meaningful performance (i.e., approximately zero F1 value.) We consider this is mainly because the model is too large to be trained on only the training data (i.e., without pre-training.) Thus, we decided to use the “language model probing” method to test the hypothesis.</p>
<p class="doduo-zh" lang="zh-CN">作为检验该假设更直接的方式，我们还评估了 Doduo 的一个变体，它随机初始化模型参数，而不使用 BERT 的预训练参数。这样一来，我们就可以测试在完全相同架构下、仅用目标任务的训练数据从零训练时的性能。该模型没有表现出有意义的性能（即 F1 值近似为零）。我们认为这主要是因为模型规模太大，无法仅用训练数据（即没有预训练）训练出来。因此，我们决定采用“语言模型探测”方法来检验该假设。</p>

<p class="doduo-en" lang="en"><b>Results.</b> Table 12 shows the results on the WikiTable dataset. We observe that some column types (e.g., goverment.election, geography.river) show lower average rank and PPL / Avg. PPL (i.e., the BERT model knows about the facts), whereas some column types (e.g., biology.organism, royalty.kingdom) show poor performance on the language probing analysis. For example, the “government.election” column type is ranked at 6.74 on average and shows a smaller PPL than the average PPL. That means values in the columns that have the “government.election” ground-truth labels are considered “more natural” to appear with the term “election”<sup>8</sup> than other column type names by the pre-trained LM (i.e., BERT.) As we used 80 column types for the analysis, the “royalty.kingdom” column type is almost always ranked at the bottom by the LM. The poor performance could be attributed to the lower frequency of the term “kingdom” than other terms in the pre-training corpus.</p>
<p class="doduo-zh" lang="zh-CN"><b>结果。</b>表 12 展示了在 WikiTable 数据集上的结果。我们观察到，某些列类型（如 goverment.election、geography.river）具有较低的平均排名和 PPL / Avg. PPL（即 BERT 模型了解相关事实），而某些列类型（如 biology.organism、royalty.kingdom）在语言探测分析中表现较差。例如，“government.election”列类型的平均排名为 6.74，且 PPL 小于平均 PPL。这意味着，对于真实标签为“government.election”的列，其取值被预训练 LM（即 BERT）认为与“election”一词<sup>8</sup>共同出现比其他列类型名称“更自然”。由于分析中使用了 80 个列类型，“royalty.kingdom”几乎总是被 LM 排在末尾。表现差可能归因于“kingdom”一词在预训练语料中的出现频率低于其他词。</p>

<div class="doduo-tbl-cap">
  <div class="doduo-en" lang="en"><b>Table 12:</b> Language model probing results on the WikiTable dataset (Left: column type prediction. Right: Column relation prediction.) The average rank becomes 1 if the language model always judges the column type (column relation) as the most “natural” choice among 80 (34) candidates for the target column value (the target column value pair.) We consider the language model has more prior knowledge about the column types (column relations) in Top-5 than those in Bottom-5.</div>
  <div class="doduo-zh" lang="zh-CN"><b>表 12：</b>在 WikiTable 数据集上的语言模型探测结果（左：列类型预测；右：列关系预测）。若语言模型总能把该列类型（列关系）判为目标列值（目标列值对）在 80（34）个候选中最“自然”的选择，平均排名即为 1。我们认为语言模型对 Top-5 中列类型（列关系）的先验知识多于 Bottom-5。</div>
</div>
<div class="doduo-two-col">
  <div>
    <table class="doduo-table" tabindex="0" aria-label="论文数据表，可横向滚动">
      <tr><th>Column type 列类型</th><th>Avg. rank (↓)</th><th>PPL / Avg.PPL (↓)</th></tr>
      <tr><td>government.election</td><td>6.74</td><td>0.787</td></tr>
      <tr><td>geography.river</td><td>9.25</td><td>0.788</td></tr>
      <tr><td>religion.religion</td><td>10.10</td><td>0.799</td></tr>
      <tr><td>book.author</td><td>12.72</td><td>0.810</td></tr>
      <tr><td>education.university</td><td>15.62</td><td>0.829</td></tr>
      <tr><td>royalty.monarch</td><td>58.24</td><td>1.147</td></tr>
      <tr><td>astronomy.constellation</td><td>67.47</td><td>1.170</td></tr>
      <tr><td>law.invention</td><td>61.60</td><td>1.181</td></tr>
      <tr><td>biology.organism</td><td>71.56</td><td>1.205</td></tr>
      <tr><td>royalty.kingdom</td><td>73.37</td><td>1.368</td></tr>
    </table>
  </div>
  <div>
    <table class="doduo-table" tabindex="0" aria-label="论文数据表，可横向滚动">
      <tr><th>Column relation 列关系</th><th>Avg. rank (↓)</th><th>PPL / Avg.PPL (↓)</th></tr>
      <tr><td>person.place_of_birth</td><td>3.69</td><td>0.946</td></tr>
      <tr><td>baseball_player.position_s</td><td>5.04</td><td>0.961</td></tr>
      <tr><td>location.nearby_airports</td><td>8.66</td><td>0.979</td></tr>
      <tr><td>mailing_address.citytown</td><td>7.24</td><td>0.980</td></tr>
      <tr><td>film.directed_by</td><td>8.08</td><td>0.984</td></tr>
      <tr><td>award.award_nominee</td><td>16.53</td><td>1.019</td></tr>
      <tr><td>tv_program.country_of_origin</td><td>16.83</td><td>1.030</td></tr>
      <tr><td>country.languages_spoken</td><td>14.79</td><td>1.042</td></tr>
      <tr><td>award_honor.award_winner</td><td>21.40</td><td>1.047</td></tr>
      <tr><td>event.entity_involved</td><td>19.82</td><td>1.072</td></tr>
    </table>
  </div>
</div>

<p class="doduo-en" lang="en">For the column relations on the WikiTable dataset, the results in Table 12 (Right) indicate that the LM knows about factual knowledge of persons as the probing performance for relations such as place_of_birth and position is higher. Compared to the probing results for the column types, the results show less significant differences between top-5 and bottom column relations. This is mainly because the template has three blank fields for two entities and one relation, which has a higher chance to create an unnatural sentence for the LM than that for column types.</p>
<p class="doduo-zh" lang="zh-CN">对于 WikiTable 数据集上的列关系，表 12（右）的结果表明，LM 掌握关于人物的事实性知识，因为对 place_of_birth 和 position 等关系而言探测性能更高。与列类型的探测结果相比，前 5 名与末位列关系之间的差异不那么显著。这主要是因为该模板为两个实体和一个关系留有三个空白字段，相比列类型的模板更容易为 LM 生成不自然的句子。</p>

<div class="doduo-tbl-cap">
  <div class="doduo-en" lang="en"><b>Table 13:</b> Language model probing results on the VizNet dataset. We observe that the language model stores a certain amount of factual knowledge about column types listed in Top-5, compared to Bottom-5. The general trend is consistent with Table 12.</div>
  <div class="doduo-zh" lang="zh-CN"><b>表 13：</b>在 VizNet 数据集上的语言模型探测结果。我们观察到，与 Bottom-5 相比，语言模型对 Top-5 中列类型存储了相当数量的事实性知识。总体趋势与表 12 一致。</div>
</div>
<table class="doduo-table" tabindex="0" aria-label="论文数据表，可横向滚动">
  <tr><th>Column type 列类型</th><th>Avg. rank (↓)</th><th>PPL / Avg.PPL (↓)</th></tr>
  <tr><td>year</td><td>6.60</td><td>0.799</td></tr>
  <tr><td>manufacturer</td><td>20.19</td><td>0.810</td></tr>
  <tr><td>day</td><td>14.21</td><td>0.819</td></tr>
  <tr><td>state</td><td>16.88</td><td>0.825</td></tr>
  <tr><td>language</td><td>17.23</td><td>0.840</td></tr>
  <tr><td>organisation</td><td>61.83</td><td>1.146</td></tr>
  <tr><td>nationality</td><td>65.81</td><td>1.218</td></tr>
  <tr><td>creator</td><td>57.39</td><td>1.232</td></tr>
  <tr><td>affiliation</td><td>63.85</td><td>1.239</td></tr>
  <tr><td>birthPlace</td><td>72.30</td><td>1.334</td></tr>
</table>

<p class="doduo-en" lang="en">The probing analysis on the VizNet dataset shows the same trend as in the WikiTable dataset. In Figure 5, we confirm that Doduo has better performance than Sato for all the top-5 column types. Meanwhile, birthPlace and nationality, which are in the bottom-5 column types for the language model probing analysis, are among the few column types where Doduo underperforms Sato. The results support that Doduo may not benefit from relevant factual knowledge stored in the pre-trained LM for the column type. Note that the BERT model used for the analysis is not fine-tuned on the WikiTable/VizNet dataset, but the vanilla BERT model. Thus, the language model probing analysis shows the inherent ability of the BERT model, and we confirm that the pre-trained LM does store factual knowledge that is useful for the column annotation problem. This especially explains the significant improvements over the previous SoTA method that does not use pre-trained LM (i.e., Sato), as shown in Figure 5.</p>
<p class="doduo-zh" lang="zh-CN">在 VizNet 数据集上的探测分析呈现出与 WikiTable 数据集相同的趋势。在图 5 中，我们确认 Doduo 在全部 top-5 列类型上都优于 Sato。与此同时，在语言模型探测分析中处于 bottom-5 的 birthPlace 和 nationality，正是 Doduo 表现不如 Sato 的少数列类型之一。这些结果支持如下判断：对这类列类型，Doduo 可能无法受益于预训练 LM 中存储的相关事实性知识。需要注意，分析中使用的 BERT 模型并未在 WikiTable/VizNet 数据集上微调，而是原始 BERT。因此，语言模型探测分析展现的是 BERT 模型的内在能力，我们由此确认预训练 LM 确实存储了对列标注问题有用的事实性知识。这尤其解释了如图 5 所示、相对不使用预训练 LM 的先前最优方法（即 Sato）所取得的显著提升。</p>

<div class="doduo-note">
  <div class="doduo-en" lang="en"><sup>6</sup>It would be the next token from the previous tokens if the model were an autoregressive model that only considers backward dependency in each step (e.g., GPT-2.) Since BERT has bi-directional connections between any tokens in the input sequence, the perplexity should take into account any other tokens in the input sequence to evaluate the likelihood of the target token.　<sup>7</sup>Technically, column type names in the WikiTable contain hierarchical information, which is represented by URI. We used the leaf node as the column type name.　<sup>8</sup>Again, we used the leaf node of each column type as the term for the template.</div>
  <div class="doduo-en" lang="en">　<sup>6</sup>如果模型是每一步只考虑前向依赖的自回归模型（如 GPT-2），那就会是依据前面 token 预测下一个 token。由于 BERT 在输入序列中任意 token 之间都有双向连接，困惑度评估目标 token 的似然时应考虑输入序列中的任意其他 token。　<sup>7</sup>严格来说，WikiTable 中的列类型名称包含层次信息，以 URI 表示。我们使用叶节点作为列类型名称。　<sup>8</sup>同样，我们使用每个列类型的叶节点作为模板中的词项。</div>
</div>


## B 局限与未来工作

<p class="doduo-section-en" lang="en">B　LIMITATIONS AND FUTURE WORK</p>


<p class="doduo-en" lang="en">We have discussed why Doduo performs well for the column annotation problem through the series of analysis. In this section, we summarize the limitations of Doduo and our findings in the paper to discuss open questions for future work.</p>
<p class="doduo-zh" lang="zh-CN">我们已通过一系列分析讨论了 Doduo 为何在列标注问题上表现良好。本节总结 Doduo 的局限以及本文的发现，以讨论未来工作的开放问题。</p>

<p class="doduo-en" lang="en"><b>Table values only vs. with meta information.</b> First, Doduo takes table value only. In most cases, we believe this assumption makes the framework more flexible to be practical. For example, spreadsheets and data frames, which are common data format choices for data analysis, do not have table captions and often lack meaningful table headers. Nevertheless, we acknowledge that, in some cases, meta information plays an important role to complementing table values to compose the table semantics. As recent work [13, 57] has shown the effectiveness of meta information for the table tasks, understanding when meta information becomes essential for the task is still an open question.</p>
<p class="doduo-zh" lang="zh-CN"><b>仅表格取值 vs. 带元信息。</b>第一，Doduo 仅使用表格取值。在大多数情况下，我们认为这一假设使框架更灵活、更实用。例如，电子表格和数据框（data frame）是数据分析中常见的数据格式选择，它们没有表标题，而且常常缺少有意义的表头。尽管如此，我们承认在某些情况下，元信息在补充表格取值以构成表格语义方面起着重要作用。近期工作 [13, 57] 已展示了元信息对表格任务的有效性，因此，理解元信息何时对任务变得不可或缺，仍是一个开放问题。</p>

<p class="doduo-en" lang="en"><b>Single-table model vs. multi-table model.</b> Second, Doduo assumes the input table to be self-contained. That means columns that are necessary to compose table context should be stored in the same table. Web Tables generally follow the assumption, and Doduo shows the strong performance on the WikiTable and VizNet datasets. However, Doduo was not tested on relational tables, where chunks of information can be split into multiple tables after database normalization. In such a scenario, we need to consider inter-table relations and information to incorporate key signals outside the target table. In fact, contemporaneous work [57] has developed a framework that incorporates signals from external tables for better column annotation performance. Thus, we consider joint modeling of multiple tables should be a future direction.</p>
<p class="doduo-zh" lang="zh-CN"><b>单表模型 vs. 多表模型。</b>第二，Doduo 假设输入表格是自包含的，即构成表格上下文所必需的列应当存储在同一张表格中。Web 表格通常符合这一假设，Doduo 在 WikiTable 和 VizNet 数据集上表现强劲。然而，Doduo 尚未在关系表上测试——在关系表中，经过数据库规范化后，信息块可能被拆分到多张表里。在这种情形下，我们需要考虑表间关系和信息，以引入目标表之外的关键信号。事实上，同期工作 [57] 已开发了一个融合外部表格信号的框架，以获得更好的列标注性能。因此，我们认为多表联合建模应当是一个未来方向。</p>

<p class="doduo-en" lang="en"><b>Clean data vs. dirty data.</b> Third, our framework assumes that table values are “correct and clean”, which may not always be true in real-world settings. The input table value should be of the high-quality, especially when we limit the max input token size for better efficiency. Recent studies that applied pre-trained LMs to tables [26, 27] have shown that the pre-trained LM-based approach achieves robust improvements even on “dirty” datasets, where some table values are missing or misplaced. Following the error detection/correction research [30, 31], which has been studied independently, implementing functionality that alleviates the influence from the incorrect table values is part of the future work.</p>
<p class="doduo-zh" lang="zh-CN"><b>干净数据 vs. 脏数据。</b>第三，我们的框架假设表格取值是“正确且干净”的，而在真实世界环境中这未必总成立。输入表格取值应当是高质量的，尤其是当我们为了更好的效率而限制最大输入 token 数时。近期把预训练 LM 应用于表格的研究 [26, 27] 表明，基于预训练 LM 的方法即使在“脏”数据集（部分表格取值缺失或错位）上也能取得稳健提升。错误检测/纠正研究 [30, 31] 已独立开展，遵循这些工作，实现缓解错误表格取值影响的功能是未来工作的一部分。</p>

<p class="doduo-en" lang="en"><b>Multi-task learning with more tasks.</b> Lastly and most importantly, there are many open questions in applying multi-task learning to data management tasks. Although we have shown that multi-task learning is useful for the column annotation task, it is not yet very clear what types of relevant tasks are useful for the target task. A line of work in Machine Learning has studies on the task similarity and the transferability of the model [64]. Therefore, it is also important for us to understand the relationship between task similarity and benefits of the multi-task learning framework. We acknowledge that our study is still preliminary with respect to this point. However, we believe that our study established the first step in this research topic toward a wider scope of multi-task learning applicability to other data management tasks.</p>
<p class="doduo-zh" lang="zh-CN"><b>更多任务的多任务学习。</b>最后，也是最重要的一点，把多任务学习应用于数据管理任务还有许多开放问题。尽管我们已经表明多任务学习对列标注任务有用，但对于目标任务而言究竟哪些相关任务有用，目前还不太清楚。机器学习领域有一系列工作研究任务相似性与模型可迁移性 [64]。因此，理解任务相似性与多任务学习框架收益之间的关系对我们同样重要。我们承认，在这一点上我们的研究仍属初步。不过我们相信，我们的研究为该研究方向迈出了第一步，有望把多任务学习的适用性推广到更广泛的其他数据管理任务。</p>
