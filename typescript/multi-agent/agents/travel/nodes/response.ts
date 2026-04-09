/*
 * @Author: 阿逼
 * @Date: 2026-04-09 15:51:05
 * @FilePath: \langchainv1\typescript\multi-agent\agents\travel\nodes\response.ts
 * @LastEditTime: 2026-04-09 15:51:11
 * Copyright (c) 2026 by 2553400824@qq.com, All Rights Reserved. 
 */
// 根据子图的结果来进行回复
// 属于weather和ticket节点的下游节点
import type { T_travelSchema } from "../../../states/index.ts";
import {
  HumanMessage,
  SystemMessage,
  AIMessage,
} from "@langchain/core/messages";
import { model } from "../../../utils/model.ts";
import { RESPONSE_SYSTEM_PROMPT } from "./prompts.ts";

export async function response(
  state: T_travelSchema
): Promise<Partial<T_travelSchema>> {
  // 提取最后一条消息和sub_result
  const messages = state.messages;
  const lastContent = messages[messages.length - 1]?.content;
  const sub_result = state.sub_result;

  // 组成一个上下文
  const context = `用户问题：${lastContent}
  查询结果：${sub_result}
  
  请根据以上信息，用友好自然的语言回复用户。`;

  process.stdout.write("💬 [回复生成] ");
  const stream = await model.stream([
    new SystemMessage(RESPONSE_SYSTEM_PROMPT),
    new HumanMessage(context),
  ]);

  // 流式输出
  let ai_response = "";
  for await (const chunk of stream) {
    const content = String(chunk.content);
    process.stdout.write(content);
    ai_response += content;
  }

  console.log("\n");

  return {
    messages: [new AIMessage(ai_response)],
  };
}
