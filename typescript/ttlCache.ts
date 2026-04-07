// ttl缓存示例
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
        ttl: 10, // 缓存10秒
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
  console.log(await app.invoke({ query: "今天天气" }));
  console.log(await app.invoke({ query: "今天天气" }));
  console.log(await app.invoke({ query: "今天的股票" }));
}
test();
