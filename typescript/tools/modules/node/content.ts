import type { State } from "../state.ts";
import {
  BaseMessage,
  HumanMessage,
  SystemMessage,
  ToolMessage,
} from "@langchain/core/messages";

import { CONTENT_PROMPT, SYSTEM_PROMPT } from "../prompt.ts";
import { getModel } from "../model.ts";
import tools from "../../tool/index.ts";

// 保证传给 ToolMessage 的一定是字符串，避免 Ollama 在下一轮转换消息时抛错
export function normalizeToolResult(result: unknown): string {
  if (typeof result === "string") {
    return result;
  }

  if (result === undefined || result === null) {
    return "工具没有返回内容";
  }

  return JSON.stringify(result);
}

export async function contentNode(state: State): Promise<Partial<State>> {
  if (!state.article?.topic) {
    throw new Error("缺少文章主题");
  }

  if (!state.article?.title) {
    throw new Error("缺少文章标题");
  }

  const { topic, title } = state.article;
  const systemContent = SYSTEM_PROMPT.replace("{topic}", topic);
  const userContent = CONTENT_PROMPT.replace("{title}", title);

  const messages: BaseMessage[] = [
    new SystemMessage(systemContent),
    new HumanMessage(userContent),
  ];

  const modelWithTools = getModel().bindTools(tools);

  while (true) {
    const reply = await modelWithTools.invoke(messages);
    messages.push(reply);

    console.log(reply);

    if (!reply.tool_calls || reply.tool_calls.length === 0) {
      const content = typeof reply.content === "string" ? reply.content : "";
      console.log(`文章正文已生成完成，共 ${content.length} 字符`);

      return {
        messages: [...state.messages, ...messages],
        llmCalls: (state.llmCalls ?? 0) + 1,
        article: {
          ...state.article,
          content,
        },
      };
    }

    for (const toolCall of reply.tool_calls) {
      const selectedTool = tools.find(
        (candidate: (typeof tools)[number]) => candidate.name === toolCall.name
      );

      if (!selectedTool) {
        console.warn(`没有找到名为 ${toolCall.name} 的工具`);
        continue;
      }

      const rawToolResult = await (selectedTool as any).invoke(toolCall.args);
      const toolResult = normalizeToolResult(rawToolResult);

      console.log(`[${toolCall.name}] 工具调用已经完成，工具调用结果为：${toolResult}`);

      messages.push(
        new ToolMessage({
          content: toolResult,
          tool_call_id: toolCall.id!,
          name: toolCall.name,
        })
      );
    }
  }
}
