/*
 * @Author: 阿逼
 * @Date: 2026-04-07 17:37:13
 * @FilePath: \langchainv1\typescript\reducer.ts
 * @LastEditTime: 2026-04-07 17:37:19
 * Copyright (c) 2026 by 2553400824@qq.com, All Rights Reserved. 
 */
// 每个 key 可以有各自的合并方式，例如指定 number 怎么合？array 怎么合？
import { StateGraph, START, END } from "@langchain/langgraph";
import * as z from "zod";
import { registry } from "@langchain/langgraph/zod";
// registry就是一个全局的 reducer 注册表

const Schema = z.object({
  count: z.number().register(registry, {
    reducer: {
      // 这里因为指定了reducer，因此在进行状态合并的时候
      // 不再是新的状态去覆盖旧的状态，而是新旧状态相加
      fn: (oldVal, newVal) => oldVal + newVal,
    },
    default: () => 0,
  }),
  logs: z.array(z.string()).register(registry, {
    reducer: {
      // 新旧状态拼接到一起，而非覆盖
      fn: (oldVal, incoming) => oldVal.concat(incoming), // 拼接数组
    },
    default: () => [] as string[], // 没有旧值时，用空数组作为初始值
  }),
  status: z.string().optional(),
});

// 基于这个Schema生成一个ts类型
type TState = z.infer<typeof Schema>;

// 节点1
async function node1() {
  return {
    count: 1,
  };
}

// 节点2
async function node2(state: TState) {
  return {
    logs: [`第一条log，count=${state.count}`],
  };
}

// 节点3
async function node3() {
  return {
    status: "完成",
  };
}

// 节点4
async function node4() {
  return {
    count: 200,
  };
}

// 节点5
async function node5(state: TState) {
  return {
    logs: [`第二条log，count=${state.count}`],
  };
}

// 构建图
const app = new StateGraph(Schema)
  .addNode("node1", node1)
  .addNode("node2", node2)
  .addNode("node3", node3)
  .addNode("node4", node4)
  .addNode("node5", node5)
  .addEdge(START, "node1")
  .addEdge("node1", "node2")
  .addEdge("node2", "node3")
  .addEdge("node3", "node4")
  .addEdge("node4", "node5")
  .addEdge("node5", END)
  .compile();

const result = await app.invoke({
  count: 0,
  logs: [],
});

console.log(result);
// { count: 1, logs: [ '第一条log，count=1' ], status: '完成' }
