import type { T_weatherSchema } from "../../states/index.ts";
import { weather_tool } from "../../tools/index.ts";

// 节点函数
// 查询对应城市的天气
export async function weather_query(
  state: T_weatherSchema
): Promise<Partial<T_weatherSchema>> {
  const city = state.city; // 先把城市数据取出来
  if (!city) return { weather_result: "缺少目标城市" };

  // 调用工具
  const result = await weather_tool.invoke({ city });
  return {
    weather_result: result,
  };
}
