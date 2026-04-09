/*
 * @Author: 阿逼
 * @Date: 2026-04-09 15:44:50
 * @FilePath: \langchainv1\typescript\multi-agent\tools\weather.ts
 * @LastEditTime: 2026-04-09 15:45:02
 * Copyright (c) 2026 by 2553400824@qq.com, All Rights Reserved. 
 */
import { tool } from "@langchain/core/tools";
import { z } from "zod/v4";
import { WEATHER_DB } from "../db/weather.ts";

const schema = z.object({
  // 查询天气需要知道城市
  city: z.string(),
});

export type T_weather_tool = z.infer<typeof schema>;

const func = async ({ city }: T_weather_tool): Promise<string> => {
  if (WEATHER_DB[city]) {
    // 在模拟的数据库中有对应的城市
    return `${city}天气：${WEATHER_DB[city]}`;
  }

  // 稍微做一下处理，成都市 -> 成都
  const cityWithoutSuffix = city.replace(/市$/, "");
  // 再次尝试
  if (WEATHER_DB[cityWithoutSuffix]) {
    // 在模拟的数据库中有对应的城市
    return `${cityWithoutSuffix}天气：${WEATHER_DB[cityWithoutSuffix]}`;
  }

  // 代码来到这里，说明在模拟的数据库里面没有找到匹配的城市
  // 北京、成都、上海等主要城市...
  const available =
    Object.keys(WEATHER_DB).slice(0, 10).join("、") + "等主要城市...";
  return `抱歉，未找到「${city}」的天气信息。目前支持查询的城市有：${available}`;
};

export const weather_tool = tool(func, {
  name: "weather_tool",
  description:
    "查询指定城市的天气情况。输入参数：{ city: 城市名称，如“北京”、“上海”、“广州”等 }。",
  schema,
});
