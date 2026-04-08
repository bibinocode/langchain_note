/*
 * @Author: 阿逼
 * @Date: 2026-04-08 15:42:54
 * @FilePath: \langchainv1\typescript\tools\tool\weather.ts
 * @LastEditTime: 2026-04-08 15:43:00
 * Copyright (c) 2026 by 2553400824@qq.com, All Rights Reserved. 
 */
import { z } from "zod/v4";
import { tool } from "@langchain/core/tools";

// 工具方法参数的Schema
const schema = z.object({
  location: z.string().min(1).describe("城市名称，例如北京、上海、广州"),
  unit: z
    .enum(["celsius", "fahrenheit"])
    .default("celsius")
    .describe("温度单位"),
});

// 根据上面的Schema生成的ts类型（工具方法参数的类型）
export type WeatherInput = z.infer<typeof schema>;

const func = ({ location, unit = "celsius" }: WeatherInput): string => {
  // 应该对接第三方天气服务接口
  // 这里做一个简化，直接返回一个固定的天气
  const weather_info = {
    location,
    temperature: "22",
    unit,
    forecast: ["晴朗 ☀️", "微风 🌬️"],
  };
  return JSON.stringify(weather_info);
};

// 1. 工具方法具体做什么
// 2. 工具的一些信息
const weather = tool(func, {
  name: "weather", // 工具的名称
  description:
    "查询指定城市当前天气。返回 JSON 字符串，包含温度、单位与简短描述。", // 工具的描述
  schema,
});

export default weather;
