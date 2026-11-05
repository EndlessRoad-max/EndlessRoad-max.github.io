---
title: pi-agent-core V0.83.0 源码学习笔记
published: 2026-11-05
description: 基于 V0.83.0 的个人源码学习记录，从使用场景理解 Agent 循环、状态、事件流与 AgentHarness 的设计关系；新版内容及版本差异待后续补充。
category: AI Agent
tags: [AI Agent, pi-agent-core, TypeScript, 源码阅读, 学习笔记, V0.83.0]
lang: zh-CN
draft: false
---

> **版本说明**：本文是我学习 pi-agent-core V0.83.0 时整理的笔记，文中记录的源码基线为 `0df5a69e`。代码路径、行号以及“当前已实现 / 尚未实现”的判断均对应当时的源码，不代表新版本状态。
>
> **更新计划**：后续继续补充新版本内容，并整理 V0.83.0 与 V1.5.0 的差异。目前尚未完成版本迁移或差异对照。
>
> **新版参考**：[pi-agent-core V1.5.0 官方 README 中文译文](/posts/pi-agent-core-readme-v1-5-0/)。
>
> **笔记范围**：本篇保留目前的学习记录。正文提及的其他章节尚未收录，后续学习时再补充。

## 从一个场景开始

你在写一个应用，想在里面嵌入一个能"自己干活"的 AI agent：你给它一句话，它调模型，模型说要调工具，它执行工具，把结果喂回模型，如此往复，直到模型说"完了"。中间每一步你都想实时看到，文字是一个字一个字流出来的，工具是一个一个执行的，因为你要把这些渲染到 UI 上。

这就是 `pi-agent-core` 要解决的全部问题。它的 README 用一句话概括：

```text
# packages/agent/README.md:2
Stateful agent with tool execution and event streaming. Built on `@earendil-works/pi-ai`.
一个有状态的 agent，具备工具执行能力和事件流。构建在 pi-ai 之上。
```

拆开看，它给你三样东西：

1. **一个 agent 循环**（`src/agent-loop.ts`）：prompt 进来，事件流出去，中间是"调模型 → 执行工具 → 再调模型"的往复。
2. **一层状态**（`src/agent.ts`）：`Agent` 类替你持有对话历史、当前正在流的消息、正在执行的工具，让你在任意时刻都能回答"它现在到哪一步了"。
3. **一套装备**（`src/harness/`）：持久化会话、上下文压缩、内置的文件/shell 工具、skill 加载——把"能跑的循环"变成"能上线 coding agent 的循环"。

三层各管一段，而串起它们的那根线，就是全书那句话：**循环只有一份，状态和装备都是组合上去的。**

## 它拒绝做什么

理解一个库，不能只看它能做什么，还要看它拒绝做什么。`pi-agent-core` 有四条明确的拒绝，每一条都能从代码里核实。

**拒绝一：不认识任何模型厂商。** 全仓库搜不到一个 provider 的名字。循环拿到的模型接口是一个函数类型：

```typescript
// src/types.ts:28
export type StreamFn = (
	model: Model<Api>,
	context: Context,
	options?: SimpleStreamOptions,
) => AssistantMessageEventStream | Promise<AssistantMessageEventStream>;
```

它只约定形状：给我 `Model` 和 `Context`，还我一个事件流。谁来提供这个函数？隔壁的 `@earendil-works/pi-ai`——那是另一个包，有自己的 provider 目录和模型元数据。本包对它的唯一依赖就是这几个类型。注意 `StreamFn` 上方的契约注释（`src/types.ts:22`），它把"失败怎么处理"也写死了：

```typescript
// src/types.ts:22译文
 * 契约（Contract）：
 * - 遇到请求 / 模型 / 运行时故障时，不得抛异常，也不得返回一个 rejected 的 Promise。
 * - 必须返回一个 AssistantMessageEventStream。
 * - 故障必须被编码进返回的流里：通过协议事件，以及最后一条 AssistantMessage——
 *   其 stopReason 为 "error" 或 "aborted"，并带有 errorMessage。
```

失败不抛异常、不 reject，而是编码进流里、用一条带 `stopReason: "error"` 的消息收尾。这条契约是第 1 章里"循环永远收到闭合事件流"的根——它把"出错"从一个跨边界的异常，变成了一个边界内的值。

**拒绝二：不碰 UI。** 包里没有一行渲染代码。**它对外沟通的方式只有一种：发事件。**全部事件就是一个可辨识联合，十种：

```typescript
// src/types.ts:422
/**（译文）
 * Agent 为界面更新而发射的事件。
 *
 * `agent_end` 是一次运行中发射的最后一个事件，但针对该事件被 await 的
 * `Agent.subscribe()` 监听器，仍然算作本次运行「结算」（settlement）的一部分。
 * 只有等这些监听器执行完毕，agent 才进入空闲（idle）状态。
 */
export type AgentEvent =
	// Agent 生命周期
	| { type: "agent_start" }
	| { type: "agent_end"; messages: AgentMessage[] }
	// 轮次（turn）生命周期 —— 一个 turn = 一次助手回应 + 它引发的所有工具调用与结果
	| { type: "turn_start" }
	| { type: "turn_end"; message: AgentMessage; toolResults: ToolResultMessage[] }
	// 消息生命周期 —— 对 user、assistant、toolResult 三类消息都会发射
	| { type: "message_start"; message: AgentMessage }
	// 仅在助手消息流式输出期间发射
	| { type: "message_update"; message: AgentMessage; assistantMessageEvent: AssistantMessageEvent }
	| { type: "message_end"; message: AgentMessage }
	// 工具执行生命周期
	| { type: "tool_execution_start"; toolCallId: string; toolName: string; args: any }
	| { type: "tool_execution_update"; toolCallId: string; toolName: string; args: any; partialResult: any }
	| { type: "tool_execution_end"; toolCallId: string; toolName: string; result: any; isError: boolean };
```

文字流、工具进度、生命周期，全在这十种里。你想画成终端、网页还是日志文件，是你的事。注意这十种事件分属四个层级（run / turn / message / tool），第 1 章会跟着一次真实调用把它们逐个点亮。

**拒绝三：核心不做持久化。** `Agent` 类的对话历史就是一个内存数组：

```typescript
// src/agent.ts:71（createMutableAgentState 内）
let tools = initialState?.tools?.slice() ?? [];
let messages = initialState?.messages?.slice() ?? [];
```

进程退出，一切归零。持久化存在，但它在 harness 层（第 4 章），而且是"追加条目到树"的模型——核心循环对此一无所知。这是"循环只有一份"的另一面：循环不背持久化的复杂度，持久化是挂在循环外的组合层。

**拒绝四：核心不碰运行时 API。** `src/` 根目录里没有任何 `node:fs`、`node:child_process`。全部文件和 shell 访问都被逼到一个接口后面（`ExecutionEnv`，第 5 章细讲），唯一的 Node 实现被隔离在 `harness/env/nodejs.ts`，通过单独的入口导出：

```json
// packages/agent/package.json - exports
{
  ".":              { "types": "./dist/index.d.ts", "import": "./dist/index.js" },
  "./node":         { "types": "./dist/node.d.ts", "import": "./dist/node.js" },
  "./session/testing": { "types": "./dist/harness/session/testing/index.d.ts", "import": "./dist/harness/session/testing/index.js" }
}
```

主入口 `.` 不带任何 Node 依赖；要用文件和 shell 工具，得显式从 `./node` 进。所以这个包的核心可以跑在浏览器里——`src/proxy.ts` 就是为此准备的。组合层（Node 实现）和循环层（纯接口）被入口分开了。

## 两层而不是一层：循环只有一份

这个包最容易产生的误解是：`Agent` 类和 `AgentHarness` 类是什么关系？继承？包装？

都不是。看依赖方向：

```
agent-loop.ts  (runAgentLoop — 无状态循环，793 行)
    ▲
    │
agent.ts  (Agent 类, 589 行)        ← 路线 A，现在能跑
```

`Agent` 直接调用 `runAgentLoop`，证据在它的 `runPromptMessages` 里：

```typescript
// src/agent.ts:405（Agent.runPromptMessages）
private async runPromptMessages(
	messages: AgentMessage[],
	options: { skipInitialSteeringPoll?: boolean } = {},
): Promise<void> {
	await this.runWithLifecycle(async (signal) => {
		await runAgentLoop(
			messages,
			this.createContextSnapshot(),
			this.createLoopConfig(options),
			(event) => this.processEvents(event),
			signal,
			this.streamFunction,
		);
	});
}
```

那 `AgentHarness` 呢？在 `0df5a69e` 这个基线上，**它还不调用 `runAgentLoop`**——它的全部执行方法都是桩：

```typescript
// src/harness/agent-harness.ts:360
private unavailable<T>(operation: string): Promise<T> {
	return Promise.reject(this.closed ? new HarnessClosed() : new HarnessNotImplemented(operation));
}
```

`prompt`、`steer`、`resume`、`abort`……每一个都走 `unavailable()`，reject 一个 `HarnessNotImplemented`（`agent-harness.ts:371` 起逐个可见）。设计文档把这件事写得很坦白：

```text
// docs/harness-v2.md:2887（节选：F0 工单一句见第 8 章）
- `AgentHarness` 在类型层面是完整的，但在行为层面并不完整。
  凡是承载执行（真正干活）的方法，都会以 `HarnessNotImplemented` 拒绝；
  而一部分读取 / 配置 / 监听（watch）/ 手动驱动类的方法，
  仍然暴露的是「本地脚手架」层面的行为。[…]
```

所以此时此刻，`Agent` 是 `runAgentLoop` 唯一的消费者。但 `AgentHarness` 不是 `Agent` 的子类，也不是它的包装：按设计（`harness-v2.md:1755`，§14），它将来是**同一循环原语之上的另一层组合**，只是组合进去的东西多得多——持久化、压缩、hook、phase 状态机。而 `runAgentLoop` 本体，届时会被拆成 building blocks，harness 复用同一批块、在块之间插入持久化写，签名和行为不变。

为什么要并存两层？因为它们的"重"不一样。嵌入一个聊天面板，用 `Agent` 就够；造一个 coding agent，用 `AgentHarness`。循环本体只有一份——这是整个包结构立得住的根：**新能力都是组合出来的，循环从不为此变大。**

> 这是全书那句话第一次落地：`Agent` 和 `AgentHarness` 不是继承链，而是同一循环原语上的两个组合层。
