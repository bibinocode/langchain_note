import * as z from "zod";
import { pathToFileURL } from "node:url";

import type { BaseMessage } from "@langchain/core/messages";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { ChatOllama } from "@langchain/ollama";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import { StateGraph, START, END } from "@langchain/langgraph";
import readlineSync from "readline-sync";

type StreamChunk = {
  content: unknown;
};

// 辅助函数：把消息内容统一转成字符串，避免后面打印时看不清
export function contentToText(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        if (
          item &&
          typeof item === "object" &&
          "text" in item &&
          typeof item.text === "string"
        ) {
          return item.text;
        }

        return JSON.stringify(item);
      })
      .join("");
  }

  if (content === null || content === undefined) {
    return "";
  }

  return String(content);
}

// 辅助函数：流式模式下，把分片内容一边输出一边拼接成完整文本
export async function collectStreamText(
  stream: AsyncIterable<StreamChunk>,
  write: (text: string) => void = (text) => process.stdout.write(text)
): Promise<string> {
  let fullText = "";

  for await (const chunk of stream) {
    const text = contentToText(chunk.content);
    if (!text) {
      continue;
    }

    write(text);
    fullText += text;
  }

  return fullText;
}

// 1. 定义一个状态的 Schema
// { messages: [{}, {}, {}], llmCalls: 2 }
const Schema = z.object({
  messages: z.array(z.custom<BaseMessage>()), // 存储消息对象的数组
  llmCalls: z.number().optional(),
});

// 根据这个 Schema 产生一个 ts 类型
type TState = z.infer<typeof Schema>;

// 2. 创建模型
const model = new ChatOllama({
  model: "minimax-m2.7:cloud",
  temperature: 0.9,
});

// 3. 创建提示词
const pt = ChatPromptTemplate.fromMessages([
  SystemMessagePromptTemplate.fromTemplate(
    "你是一个健谈的中文 AI 助手，请结合上下文尽可能详细地使用中文回答用户问题。"
  ),
  new MessagesPlaceholder("messages"),
]);

// 4. 形成链条
const chain = pt.pipe(model);

// 5. 创建节点（函数）
// 当前启用：非流式输出
async function llmNode(state: TState): Promise<TState> {
  const result = await chain.invoke({
    messages: state.messages,
  });

  // 更新状态
  return {
    messages: [...state.messages, result],
    llmCalls: (state.llmCalls ?? 0) + 1,
  };
}

/*
// 5. 创建节点（函数）
// 切换到流式输出时：
// 1. 先把上面的 llmNode 整段注释掉
// 2. 再放开下面这个 llmNode
async function llmNode(state: TState): Promise<TState> {
  const stream = await chain.stream({
    messages: state.messages,
  });

  let fullText = ""; // 用于拼接完整的信息
  process.stdout.write("智能体：");

  // 从流里面一点一点提取消息
  fullText = await collectStreamText(stream);
  process.stdout.write("\n\n");

  // 更新状态
  return {
    messages: [...state.messages, new AIMessage(fullText)],
    llmCalls: (state.llmCalls ?? 0) + 1,
  };
}
*/

// 6. 构建图
const graph = new StateGraph(Schema)
  .addNode("llm", llmNode)
  .addEdge(START, "llm")
  .addEdge("llm", END);

// 有了图实例对象之后，需要对这个图进行编译
const app = graph.compile();

// 7. 运行对话
export async function main() {
  let messages: BaseMessage[] = []; // 本次的消息数组
  let llmCalls = 0; // 记录模型交互次数

  console.log("聊天机器人已启动，输入 exit 退出。\n");

  while (true) {
    const input = readlineSync.question("你："); // 接受用户的输入
    if (input === "exit") {
      break;
    }

    // 先将用户的输入推入到 messages 数组里面
    messages = [...messages, new HumanMessage(input)];
    const result = await app.invoke({
      messages,
      llmCalls,
    });

    // 本地数据更新
    messages = result.messages;
    llmCalls = result.llmCalls ?? 0;

    // 非流式模式：最后统一打印完整回答
    const last = result.messages[result.messages.length - 1];
    console.log("智能体：", contentToText(last.content), "\n");

    /*
    流式模式启用 llmNode 后，把上面的两行输出代码注释掉。
    因为流式模式已经在 llmNode 里面边生成边输出了。
    const last = result.messages[result.messages.length - 1];
    console.log("智能体：", contentToText(last.content), "\n");
    */
  }

  // 代码来到这里，说明对话结束
  console.log(`结束对话，总共调用 LLM 次数：${llmCalls}`);
}

const isEntryFile =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isEntryFile) {
  main().catch((error) => {
    console.error("程序运行失败：", error);
    process.exitCode = 1;
  });
}
