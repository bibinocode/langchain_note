import type { T_travelSchema } from "../../../states/index.ts";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { model } from "../../../utils/model.ts";
import { WEATHER_EXTRACT_PROMPT } from "./prompts.ts";
import weatherGraph from "../../weather/agent.ts";

// 查询天气
export async function weather(
  state: T_travelSchema
): Promise<Partial<T_travelSchema>> {
  // 获取消息数组的最后一条消息
  const messages = state.messages;
  const lastContent = messages[messages.length - 1]?.content;

  // 使用大模型提取信息
  // lastContent: "成都明天的天气怎么样"
  // 提取：成都
  const result = await model.invoke([
    new SystemMessage(WEATHER_EXTRACT_PROMPT),
    new HumanMessage(lastContent),
  ]);

  // 做一个日志输出
  const city = String(result.content).trim();
  console.log(`🌤️ [天气查询] 提取城市: ${city}`);

  // 接下来‼️
  // 调用子图
  const subGraphResult = await weatherGraph.invoke({ city });
  const weather_result = subGraphResult.weather_result ?? "查询失败";
  console.log(`🌤️ [子图 - 天气查询] 查询结果: ${weather_result}`);

  // 更新状态
  return {
    sub_result: weather_result,
  };
}
