/*
 * @Author: 阿逼
 * @Date: 2026-04-07 18:00:26
 * @FilePath: \langchainv1\typescript\keyFuncCache.ts
 * @LastEditTime: 2026-04-07 18:00:32
 * Copyright (c) 2026 by 2553400824@qq.com, All Rights Reserved. 
 */
// keyFunc缓存示例
import { StateGraph, START, END } from "@langchain/langgraph";
import { z } from "zod/v4";
import { InMemoryCache } from "@langchain/langgraph-checkpoint";

// 创建Schema
const Schema = z.object({
  userId: z.string(),
  query: z.string(),
  result: z.string().optional(),
});

type TState = z.infer<typeof Schema>;

const app = new StateGraph(Schema)
  .addNode(
    "node1",
    async (state: TState) => {
      // 演示一个耗时的操作
      console.log("这是一个耗时的操作...");
      await new Promise((r) => setTimeout(r, 5000));
      return {
        result: `${state.query}对应的答案`,
      };
    },
    {
      cachePolicy: {
        keyFunc: (state: any) => {
          const s = Array.isArray(state) ? state[state.length - 1] : state;
          return s?.userId; // 以 userId 来判断是否走缓存，如果 userId 相同，就直接走缓存
        },
      },
    }
  )
  .addEdge(START, "node1")
  .addEdge("node1", END)
  .compile({
    cache: new InMemoryCache(),
  });

// 测试用例
async function test() {
  console.log(await app.invoke({ userId: "u1", query: "今天天气" }));
  console.log(await app.invoke({ userId: "u2", query: "今天天气" }));
  console.log(await app.invoke({ userId: "u1", query: "今天的股票" }));
}
test();
