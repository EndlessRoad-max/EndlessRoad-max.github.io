---
title: pi-agent-core V1.5.0 官方 README 中文译文
published: 2026-11-05
description: pi-agent-core V1.5.0 官方 README 的中文译文，涵盖安装、Agent 配置、事件流、工具调用、消息管理与底层 API。
category: AI Agent
tags: [AI Agent, pi-agent-core, TypeScript, 官方文档译文, V1.5.0]
lang: zh-CN
draft: false
---

> **阅读说明**：本文是 V1.5.0 官方 README 的中文译文；“官方”指英文原文来源。译文按该版本保留，后续版本可能发生变化。
>
> **配套笔记**：[pi-agent-core V0.83.0 源码学习笔记](/posts/pi-agent-core-notes-v0-83-0/) 基于旧版本，尚未补充 V1.5.0 的新内容及版本差异，请结合版本分别阅读。

> **原文**：官方仓库中的 `packages/agent/README.md`（[上游文档入口](https://github.com/earendil-works/pi/blob/main/packages/agent/README.md)，该链接随主分支更新）。
> **对应版本**：`@earendil-works/pi-agent-core` 1.5.0
> **翻译约定**：目录、文件名、包名、函数名、事件名、代码一律保持原样；代码块内的说明性注释已译成中文，代码本身未改动。术语首次出现时附英文原文。

---

有状态的 agent，具备工具执行与事件流能力。构建于 `@earendil-works/pi-ai` 之上。

## 安装

```bash
npm install @earendil-works/pi-agent-core
```

## 快速开始

```typescript
import { Agent } from "@earendil-works/pi-agent-core";
import { createModels } from "@earendil-works/pi-ai";
import { anthropicProvider } from "@earendil-works/pi-ai/providers/anthropic";

const models = createModels();
models.setProvider(anthropicProvider());
const model = models.getModel("anthropic", "claude-sonnet-4-6");
if (!model) throw new Error("Model not found");

const agent = new Agent({
  initialState: {
    systemPrompt: "You are a helpful assistant.",
    model,
  },
  streamFn: models.streamSimple.bind(models),
});

agent.subscribe((event) => {
  if (event.type === "message_update" && event.assistantMessageEvent.type === "text_delta") {
    // 只把新增的文本片段流式写出
    process.stdout.write(event.assistantMessageEvent.delta);
  }
});

await agent.prompt("Hello!");
```

## 核心概念

### AgentMessage 与 LLM Message 的区别

Agent 内部使用 `AgentMessage`，这是一个灵活的类型，可以包含：

- 标准的 LLM 消息（`user`、`assistant`、`toolResult`）
- 通过**声明合并**（declaration merging）自定义的应用专属消息类型

而 LLM 只认识 `user`、`assistant`、`toolResult` 三种。`convertToLlm` 函数负责填补这道鸿沟：在每次调用 LLM 之前，把消息过滤并转换成模型能理解的形式。

### 消息流转

```
AgentMessage[] → transformContext() → AgentMessage[] → convertToLlm() → Message[] → LLM
                    (可选)                              (必需)
```

1. **transformContext**：裁剪旧消息、注入外部上下文
2. **convertToLlm**：过滤掉仅供界面使用的消息，把自定义类型转换成 LLM 格式

## 事件流

Agent 通过发射事件来驱动界面更新。理解事件顺序，是构建响应式界面的前提。

### `prompt()` 的事件序列

当你调用 `prompt("Hello")` 时：

```
prompt("Hello")
├─ agent_start
├─ turn_start
├─ message_start   { message: userMessage }      // 你输入的 prompt
├─ message_end     { message: userMessage }
├─ message_start   { message: assistantMessage } // LLM 开始回应
├─ message_update  { message: partial... }       // 流式分片
├─ message_update  { message: partial... }
├─ message_end     { message: assistantMessage } // 回应完成
├─ turn_end        { message, toolResults: [] }
└─ agent_end       { messages: [...] }
```

### 带工具调用的情形

如果助手请求调用工具，循环会继续下去：

```
prompt("Read config.json")
├─ agent_start
├─ turn_start
├─ message_start/end  { userMessage }
├─ message_start      { assistantMessage with toolCall }
├─ message_update...
├─ message_end        { assistantMessage }
├─ tool_execution_start  { toolCallId, toolName, args }
├─ tool_execution_update { partialResult }           // 若工具支持流式进度
├─ tool_execution_end    { toolCallId, result }
├─ message_start/end  { toolResultMessage }
├─ turn_end           { message, toolResults: [toolResult] }
│
├─ turn_start                                        // 下一轮
├─ message_start      { assistantMessage }           // LLM 针对工具结果作出回应
├─ message_update...
├─ message_end
├─ turn_end
└─ agent_end
```

工具的执行模式是可配置的：

- `parallel`（默认）：先**串行预检**每个工具调用，再**并发执行**被放行的工具；某个工具一完成就立刻发射它的 `tool_execution_end`，但最终写回的 toolResult 消息以及 `turn_end.toolResults`，仍严格按助手消息中的原始顺序排列。
- `sequential`：逐个执行工具调用，与历史行为一致。

在并行模式下，工具的**完成事件**遵循实际完成顺序，但**持久化的** toolResult 消息仍遵循助手消息的原始顺序。

执行模式可以全局设置（agent 配置里的 `toolExecution`），也可以按工具设置（`AgentTool` 上的 `executionMode`）。**只要一批调用中有一个工具声明了 `executionMode: "sequential"`，整批都会改为串行执行**，不受全局设置影响。

`beforeToolCall` 钩子在 `tool_execution_start` 之后、参数校验完成之后运行。它可以阻止执行，并在被阻止的结果上附带 `terminate: true`。`afterToolCall` 钩子在工具执行结束之后、`tool_execution_end` 与最终的工具结果消息事件发射之前运行。

工具本身、被阻止的 `beforeToolCall` 结果，以及 `afterToolCall` 的覆盖返回值，都可以返回 `terminate: true`，用以暗示"跳过随后的自动 LLM 调用"。**只有当这一批中每一个定稿的工具结果都设置了 `terminate: true` 时，循环才会提前停止**；混合批次照常继续。

使用 `Agent` 类时，助手消息的 `message_end` 处理被视为一道**屏障**，工具预检必须等它完成才开始。这意味着 `beforeToolCall` 看到的 agent 状态里，已经包含了那条发起工具调用的助手消息。

### 请求准备与轮次收尾

`prepareRequest` 在**每一次**面向 provider 的对话请求之前运行，第一次请求也不例外。它的用途是：在待处理输入已经发射出去之后，装配最终定稿的持久化上下文：

```typescript
agent.prepareRequest = async ({ context }) => ({
  context: { ...context, messages: await session.loadModelContext() },
});
```

`prepareRequest` **不会**轮询队列。在它运行期间排入的 steering 消息，要等到下一次常规的 steering 轮询才会被取出。

`finishTurn` 在助手消息和所有工具结果都定稿之后、`turn_end` 之前运行。它对正常、出错、被中止三类响应都会运行：

```typescript
agent.finishTurn = async ({ message }) => {
  if (message.stopReason === "error" || message.stopReason === "aborted") return;
  if (shouldEndRun(message)) return { action: "end" };
  return needsAnotherResponse(message) ? { action: "continue" } : undefined;
};
```

返回 `undefined` 表示保留默认调度。返回 `{ action: "end" }` 会在 `turn_end` 之后立即结束，不再轮询 steering 或 follow-up 队列，也不再准备新请求。对于正常响应，返回 `{ action: "continue" }` 确保还会再发一次 provider 请求：如果工具结果、steering 或 follow-up 已经会引发这次请求，它们就算满足了该决定，不会再额外发一次；否则循环会发起一次"只带上下文"的请求。

**出错和被中止的响应是硬退出**，它们的决定会被忽略。`finishTurn` 在下一次请求之后还会再次运行，所以无条件返回 `{ action: "continue" }` 会造成死循环。

若要从已被移除的 `shouldStopAfterTurn` 迁移过来，请改为返回 `{ action: "end" }`。同时要挡掉出错和中止的响应，以保留旧钩子"只对正常响应触发"的语义——当判定函数有副作用、或假定响应必然成功时，这一点尤其重要：

```typescript
finishTurn: async (turn, signal) => {
  if (turn.message.stopReason === "error" || turn.message.stopReason === "aborted") return;
  return (await shouldStop(turn, signal)) ? { action: "end" } : undefined;
},
```

每一次 provider 轮次都遵循这样的生命周期：

```text
选定的输入事件
→ prepareRequest
→ provider 响应
→ 工具结果
→ finishTurn
→ turn_end
→ 既有的续跑调度，或 agent_end
```

### `continue()` 与排队输入

`continue()` 保留了原有的队列行为。对话记录为空、或只含 system 消息时，它会直接拒绝，且不消费队列。若尾部不是助手消息，则从现有上下文继续：steering 会在启动时被轮询，而 follow-up 输入要等响应自然停止后才处理。

```typescript
agent.followUp({ role: "user", content: "After the retry", timestamp: Date.now() });
await agent.continue(); // 第一次请求会重试既有的 user/toolResult 尾部。
```

助手消息不能直接作为请求发送，因此 `continue()` 会退化为：先取一批排队的 steering，再取一批排队的 follow-up。队列模式仍然决定这一批是只含一条消息还是包含全部消息：

```typescript
agent.steer({ role: "user", content: "Continue from here", timestamp: Date.now() });
await agent.continue(); // 因为尾部是助手消息，这里才会使用排队的消息。
```

### 事件类型

| 事件 | 说明 |
|-------|-------------|
| `agent_start` | Agent 开始处理 |
| `agent_end` | 本次运行的最后一个事件。针对该事件的、被 await 的订阅者，仍计入结算（settlement） |
| `turn_start` | 新一轮开始（一次 LLM 调用 + 其间的工具执行） |
| `turn_end` | 一轮结束，携带助手消息与工具结果 |
| `message_start` | 任意消息开始（user、assistant、toolResult） |
| `message_update` | **仅用于助手消息。** 内含带增量的 `assistantMessageEvent` |
| `message_end` | 消息结束 |
| `tool_execution_start` | 工具开始执行 |
| `tool_execution_update` | 工具上报进度 |
| `tool_execution_end` | 工具执行结束 |

`Agent.subscribe()` 的监听器按注册顺序依次 await。`agent_end` 表示不会再有任何循环事件，但 `await agent.waitForIdle()` 和 `await agent.prompt(...)` 要等到所有被 await 的 `agent_end` 监听器都完成后才会结算。

## Agent 配置项

```typescript
const agent = new Agent({
  // 初始状态。systemPrompt 和 tools 会变成开头那条 system 消息，
  // 除非 messages 本身已经以 system 消息开头。
  initialState: {
    systemPrompt: string,
    model: Model<any>,
    thinkingLevel: "off" | "minimal" | "low" | "medium" | "high" | "xhigh" | "max",
    tools: AgentTool<any>[],
    messages: AgentMessage[],
  },

  // 把 AgentMessage[] 转成 LLM 的 Message[]（自定义消息类型时必需）
  convertToLlm: (messages) => messages.filter(...),

  // 在 convertToLlm 之前转换上下文（用于裁剪、压缩）
  transformContext: async (messages, signal) => pruneOldMessages(messages),

  // Steering 模式："one-at-a-time"（默认）或 "all"
  steeringMode: "one-at-a-time",

  // Follow-up 模式："one-at-a-time"（默认）或 "all"
  followUpMode: "one-at-a-time",

  // 必需的流函数。接收一个 TranscriptContext：prompt 和 tools 位于对话记录的
  // system 消息中，而不在 context 上。
  streamFn: models.streamSimple.bind(models),

  // 会话 ID，用于 provider 侧的缓存
  sessionId: "session-123",

  // 请求如何向 provider 标识本应用（pi-ai 的 ClientIdentity），会合并覆盖
  // DEFAULT_AGENT_IDENTITY（{ attribution: PI_ATTRIBUTION }：provider 归属头会标明 pi）。
  // 传入你自己应用的归属信息；传 null 则不带任何归属。
  identity: { attribution: { name: "my-app", url: "https://my-app.example" } },

  // 动态解析 API Key（用于会过期的 OAuth token）
  getApiKey: async (provider) => refreshToken(),

  // 工具执行模式："parallel"（默认）或 "sequential"
  toolExecution: "parallel",

  // 在参数校验之后对每个工具调用做预检。可以阻止执行。
  beforeToolCall: async ({ toolCall, args, context }) => {
    if (toolCall.name === "bash") {
      return { block: true, reason: "bash is disabled", terminate: true };
    }
  },

  // 在最终的工具事件发射之前，对每个工具结果做后处理。
  afterToolCall: async ({ toolCall, result, isError, context }) => {
    if (toolCall.name === "notify_done" && !isError) {
      return { terminate: true };
    }
    if (!isError) {
      return { details: { ...result.details, audited: true } };
    }
  },

  // 在每次 provider 请求之前，立刻重建定稿后的上下文。
  prepareRequest: async ({ context }, signal) => {
    return { context: { ...context, messages: await loadCanonicalMessages(signal) } };
  },

  // 在发射 turn_end 之前，为一个已完成的轮次收尾。
  // `continue` 确保再发一次请求；既有的工具/队列调度可以满足它。
  // `end` 会在 turn_end 之后结束本次运行，且不轮询队列。
  finishTurn: async ({ message, toolResults }, signal) => {
    return shouldContinue(message, toolResults) ? { action: "continue" } : undefined;
  },

  // 面向按 token 计费 provider 的自定义思考预算
  thinkingBudgets: {
    minimal: 128,
    low: 512,
    medium: 1024,
    high: 2048,
  },
});
```

## Agent 状态

```typescript
interface AgentState {
  model: Model<any>;
  thinkingLevel: ThinkingLevel;
  tools: AgentTool<any>[];
  messages: AgentMessage[];
  readonly isStreaming: boolean;
  readonly streamingMessage?: AgentMessage;
  readonly pendingToolCalls: ReadonlySet<string>;
  readonly errorMessage?: string;
}
```

通过 `agent.state` 访问状态。

给 `agent.state.tools = [...]` 或 `agent.state.messages = [...]` 赋值时，会先**复制**顶层数组再存储。而直接修改返回的数组，则会改动 agent 的当前状态。

**对话记录（transcript）拥有系统提示词与工具声明的所有权**：开头那条 system 消息就是提示词，后续的 system 消息对它打补丁（参见 pi-ai 中的 `SystemMessage`）。`agent.state.systemPrompt` 是只读的，它会重放对话记录得出结果。`agent.state.tools` 是可执行的**装备清单**；每次请求之前，循环会把它与对话记录中声明的工具做差集比较，若不一致，就用一条 system 消息宣告这次变化（若已存在待处理的 system 消息，则合并进去）。pi-ai 的 `getCurrentSystemMessage(messages)` 可以为任意消息数组（包括带自定义消息角色的 agent 对话记录）返回重放后的头部，其中包含已声明的工具。

要在对话中途修改提示词，追加一条 system 消息即可，用 `content`（追加的指令）或 `sections`（具名替换）：

```typescript
await agent.prompt([
  { role: "system", content: "", sections: { skills: "<skills>...</skills>" }, timestamp: Date.now() },
  { role: "user", content: "Continue", timestamp: Date.now() },
]);
```

流式进行期间，`agent.state.streamingMessage` 持有当前尚未完成的助手消息。

`agent.state.isStreaming` 会一直保持 `true`，直到本次运行完全结算——包括那些被 await 的 `agent_end` 订阅者。

## 方法

### 发起对话

```typescript
// 文本 prompt
await agent.prompt("Hello");

// 带图片
await agent.prompt("What's in this image?", [
  { type: "image", data: base64Data, mimeType: "image/jpeg" }
]);

// 直接传 AgentMessage
await agent.prompt({ role: "user", content: "Hello", timestamp: Date.now() });

// 从既有的非助手输入继续；若尾部是助手消息，则可能退化为使用排队输入
await agent.continue();
```

### 状态管理

```typescript
agent.state.model = getModel("openai", "gpt-4o");
agent.state.thinkingLevel = "medium";
agent.state.tools = [myTool];
agent.toolExecution = "sequential";
agent.beforeToolCall = async ({ toolCall }) => undefined;
agent.afterToolCall = async ({ toolCall, result }) => undefined;
agent.prepareRequest = async ({ context }) => ({
  context: { ...context, messages: await loadCanonicalMessages() },
});
agent.finishTurn = async () => undefined;
agent.state.messages = newMessages; // 顶层数组会被复制
agent.state.messages.push(message);
const nextQueuedMessages = agent.peekQueuedMessages(); // 遵循队列模式；不消费
agent.reset();
```

### 会话与思考预算

```typescript
agent.sessionId = "session-123";

agent.thinkingBudgets = {
  minimal: 128,
  low: 512,
  medium: 1024,
  high: 2048,
};
```

### 控制

```typescript
agent.abort();           // 取消当前操作
await agent.waitForIdle(); // 等待完成
```

### 事件

```typescript
const unsubscribe = agent.subscribe(async (event, signal) => {
  if (event.type === "agent_end") {
    // 本次运行的最后一个屏障工作
    await flushSessionState(signal);
  }
});
unsubscribe();
```

## Steering（引导）与 Follow-up（追加）

**Steering 消息**让你能在工具运行期间打断 agent、改变方向。**Follow-up 消息**让你在 agent 本应停止之后再排入新的工作。

```typescript
agent.steeringMode = "one-at-a-time";
agent.followUpMode = "one-at-a-time";

// 趁 agent 正在跑工具的时候
agent.steer({
  role: "user",
  content: "Stop! Do this instead.",
  timestamp: Date.now(),
});

// 等 agent 做完当前这摊活之后
agent.followUp({
  role: "user",
  content: "Also summarize the result.",
  timestamp: Date.now(),
});

const steeringMode = agent.steeringMode;
const followUpMode = agent.followUpMode;

agent.clearSteeringQueue();
agent.clearFollowUpQueue();
agent.clearAllQueues();
```

要丢弃排队的消息，用 `clearSteeringQueue`、`clearFollowUpQueue` 或 `clearAllQueues`。

当一轮结束之后检测到 steering 消息时，会发生：

1. 当前助手消息里的所有工具调用**都已经执行完毕**
2. Steering 消息被注入
3. LLM 在下一轮针对它作出回应

而 follow-up 消息**只在没有任何工具调用、也没有 steering 消息时**才被检查。若有排队，就注入它们并再跑一轮。

## 自定义消息类型

通过声明合并扩展 `AgentMessage`：

```typescript
declare module "@earendil-works/pi-agent-core" {
  interface CustomAgentMessages {
    notification: { role: "notification"; text: string; timestamp: number };
  }
}

// 现在这样写是合法的
const msg: AgentMessage = { role: "notification", text: "Info", timestamp: Date.now() };
```

在 `convertToLlm` 中处理自定义类型：

```typescript
const agent = new Agent({
  streamFn: models.streamSimple.bind(models),
  convertToLlm: (messages) => messages.flatMap(m => {
    if (m.role === "notification") return []; // 过滤掉
    return [m];
  }),
});
```

## 工具

用 `AgentTool` 定义工具。`parameters` 可以是任意 JSON Schema 对象；如果使用 `@earendil-works/pi-schema` 的构建器来写，它还能顺带把 `params` 推导出类型（用其它 schema 会得到 `unknown`，用 `AgentTool<any>` 会得到 `any`）：

```typescript
import { obj, str } from "@earendil-works/pi-schema";

const readFileParameters = obj({
  path: str({ description: "File path" }),
});

const readFileTool: AgentTool<typeof readFileParameters> = {
  name: "read_file",
  label: "Read File",  // 供界面显示
  description: "Read a file's contents",
  parameters: readFileParameters,
  // 为本工具覆盖执行模式（可选）。
  // "sequential" 会强制整批调用逐个执行。
  // "parallel" 允许与其它工具调用并发执行。
  // 若省略，则应用全局的 toolExecution 配置。
  executionMode: "sequential",
  execute: async (toolCallId, params, signal, onUpdate) => {
    const content = await fs.readFile(params.path, "utf-8");

    // 可选：上报流式进度
    onUpdate?.({ content: [{ type: "text", text: "Reading..." }], details: {} });

    // 可选：在此处加上 `terminate: true`，当本批所有定稿结果都如此时，
    // 就会跳过随后的自动 LLM 调用。
    return {
      content: [{ type: "text", text: content }],
      details: { path: params.path, size: content.length },
    };
  },
};

agent.state.tools = [readFileTool];
```

### 错误处理

**工具失败时要抛异常**，不要把错误信息当作内容返回。

```typescript
execute: async (toolCallId, params, signal, onUpdate) => {
  if (!fs.existsSync(params.path)) {
    throw new Error(`File not found: ${params.path}`);
  }
  // 只在成功时返回内容
  return { content: [{ type: "text", text: "..." }] };
}
```

抛出异常会被 agent 捕获，并以 `isError: true` 的工具错误形式报告给 LLM。

从 `execute()`、被阻止的 `beforeToolCall`，或 `afterToolCall` 返回 `terminate: true`，可暗示 agent 应在当前工具批次后停止。**只有当这一批里每一个定稿的工具结果都表示终止时才会生效。** 这个提示仅存在于运行期；写进对话记录的 `toolResult` 消息仍是标准的 LLM 工具结果。

### MCP 与 Codemode

`@earendil-works/pi-mcp` 用于连接 MCP 服务器，`@earendil-works/pi-codemode` 用于运行模型编写的、调用工具的 JavaScript。示例 [examples/mcp-codemode](https://github.com/earendil-works/pi/tree/main/packages/agent/examples/mcp-codemode) 把两者都包装成了 `AgentTool`：每个 MCP 工具对应一个工具，外加一个 `codemode` 工具，其脚本通过 `runToolCall()` 调用 agent 的工具——因此 `beforeToolCall` 和 `afterToolCall` 对这些调用同样生效。

## 代理（Proxy）用法

适用于通过后端代理的浏览器应用：

```typescript
import { Agent, streamProxy } from "@earendil-works/pi-agent-core";

const agent = new Agent({
  streamFn: (model, context, options) =>
    streamProxy(model, context, {
      ...options,
      authToken: "...",
      proxyUrl: "https://your-server.com",
    }),
});
```

## 底层 API

需要绕开 `Agent` 类、直接控制时：

```typescript
import { agentLoop, agentLoopContinue } from "@earendil-works/pi-agent-core";

const context: AgentContext = {
  messages: [{ role: "system", content: "You are helpful.", timestamp: Date.now() }],
  tools: [],
};

const config: AgentLoopConfig = {
  model: getModel("openai", "gpt-4o"),
  convertToLlm: (msgs) => msgs.filter(m => ["user", "assistant", "toolResult"].includes(m.role)),
  toolExecution: "parallel",  // 若工具自身设置了 executionMode，则被其覆盖
  beforeToolCall: async ({ toolCall, args, context }) => undefined,
  afterToolCall: async ({ toolCall, result, isError, context }) => undefined,
};

const userMessage = { role: "user", content: "Hello", timestamp: Date.now() };

const streamFn = models.streamSimple.bind(models);
for await (const event of agentLoop([userMessage], context, config, undefined, streamFn)) {
  console.log(event.type);
}

// 从既有上下文继续
for await (const event of agentLoopContinue(context, config, undefined, streamFn)) {
  console.log(event.type);
}
```

这些底层流是**观察性**的：它们保证事件顺序，但**不会**等你的异步事件处理结算完，才让后续的生产阶段继续。如果你需要"消息处理构成屏障、挡在工具预检之前"，请改用 `Agent` 类，而不要直接用 `agentLoop()` 或 `agentLoopContinue()`。
