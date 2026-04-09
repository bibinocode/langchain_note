/*
 * @Author: 阿逼
 * @Date: 2026-04-09 15:46:41
 * @FilePath: \langchainv1\typescript\multi-agent\agents\travel\nodes\chat.ts
 * @LastEditTime: 2026-04-09 15:46:46
 * Copyright (c) 2026 by 2553400824@qq.com, All Rights Reserved. 
 */
import type { T_travelSchema } from "../../../states/index.ts";
import { model } from "../../../utils/model.ts";
import { CHAT_PROMPT } from "./prompts.ts";
import {
  HumanMessage,
  SystemMessage,
  AIMessage,
} from "@langchain/core/messages";

export async function chat(
  state: T_travelSchema
): Promise<Partial<T_travelSchema>> {
  // 获取消息数组的最后一条消息
  const messages = state.messages;
  const lastContent = messages[messages.length - 1]?.content;

  process.stdout.write("💬 [闲聊回复] ");
  const stream = await model.stream([
    new SystemMessage(CHAT_PROMPT),
    new HumanMessage(lastContent),
  ]);

  // 流式输出
  let ai_response = ""; // 拼接最终的回复结果
  for await (const chunk of stream) {
    const content = String(chunk.content);
    process.stdout.write(content);
    ai_response += content;
  }

  console.log("\n");

  return {
    messages: [new AIMessage(ai_response)],
    sub_result: null,
  };
}
