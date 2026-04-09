/*
 * @Author: 阿逼
 * @Date: 2026-04-09 15:51:22
 * @FilePath: \langchainv1\typescript\multi-agent\agents\travel\nodes\ticket.ts
 * Copyright (c) 2026 by 2553400824@qq.com, All Rights Reserved.
 */
import type { T_travelSchema } from "../../../states/index.ts";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { model } from "../../../utils/model.ts";
import { TICKET_EXTRACT_PROMPT } from "./prompts.ts";
import ticketGraph from "../../ticket/agent.ts";
import {
  extractTicketCitiesFromModelOutput,
  extractTicketCitiesFromText,
  fallbackTicketCities,
} from "./ticket-extractor.ts";

export async function ticket(
  state: T_travelSchema
): Promise<Partial<T_travelSchema>> {
  const messages = state.messages;
  const lastContent = String(messages[messages.length - 1]?.content ?? "");

  // 优先从用户原话中做确定性提取。
  // 这样在本地 DB 已支持该线路时，不会因为模型没按固定格式输出而退化成“未知 -> 未知”。
  let cities = extractTicketCitiesFromText(lastContent);

  if (!cities) {
    const result = await model.invoke([
      new SystemMessage(TICKET_EXTRACT_PROMPT),
      new HumanMessage(lastContent),
    ]);

    cities =
      extractTicketCitiesFromModelOutput(String(result.content).trim()) ??
      fallbackTicketCities();
  }

  const { from_city, to_city } = cities;

  console.log(`🚄 [车票查询] 出发地: ${from_city}, 目的地: ${to_city}`);

  const subGraphResult = await ticketGraph.invoke({ from_city, to_city });
  const ticket_result = subGraphResult.ticket_result ?? "查询失败";
  console.log(`🚄 [子图 - 车票查询] 查询结果: ${ticket_result}`);

  return { sub_result: ticket_result };
}
