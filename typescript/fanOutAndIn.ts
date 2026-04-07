import { StateGraph, START, END } from "@langchain/langgraph";
import { z } from "zod";
import { registry } from "@langchain/langgraph/zod";




/**

 * 1. 
 */

/**
 * 

可以把这张图想成：
START -> A -> (B 和 C 并行) -> D -> END


一次典型执行过程大概是这样：
1、先进入 A
2、A 立即返回 a、t0、logs
3、从 A 分叉出两条路，B 和 C 同时开始
4、C 只睡 1000ms，所以通常先结束
5、B 睡 2500ms，所以通常后结束
6、D 必须等 B 和 C 都完成，才会开始
7、D 汇总 b、c，然后流程结束

时间轴:

A: |----很快----|
B:      |----------- 2500ms -----------|
C:      |---- 1000ms ----|
D:                                |--汇总--|


输出:

运行A节点
运行B节点
运行C节点
运行D节点
{
  a: 'A节点执行后的结果',
  b: 'b节点执行后的结果',
  c: 'c节点执行后的结果',
  t0: 1775557528727,
  logs: [
    '【A节点】开始(+0ms)',
    '【A节点】结束(+0ms)',
    '【B节点】开始(+4msms)',
    '【B节点】结束(+2518ms)',
    '【C节点】开始(+5msms)',
    '【C节点】结束(+1016ms)',
    'D节点已运行，b=b节点执行后的结果，c=c节点执行后的结果',
    '【D节点】结束(+2520ms)',
    '整个流程结束'
  ]
}
 */

// 1. 定义Schema
const Schema = z.object({
  a: z.string().optional(),
  b: z.string().optional(),
  c: z.string().optional(),
  t0: z.number().optional(), // 记录时间
  // 日志的记录
  logs: z.array(z.string()).register(registry, {
    reducer: {
      fn: (oldVal, newVal) => oldVal.concat(newVal),
    },
    default: () => [] as string[],
  }),
});

// 简单 sleep，模拟不同耗时
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// 统一格式化时间戳（相对 A 节点开始）
const fmt = (t0?: number) => `${t0 !== undefined ? Date.now() - t0 : 0}ms`;

const graph = new StateGraph(Schema)
  .addNode("A", () => {
    console.log("运行A节点");
    return {
      a: "A节点执行后的结果",
      t0: Date.now(),
      logs: ["【A节点】开始(+0ms)", "【A节点】结束(+0ms)"],
    };
  })
  .addNode("B", async (state) => {
    console.log("运行B节点");
    const start = fmt(state.t0); // 得到一个相对于A节点的时间
    await sleep(2500);
    return {
      b: "b节点执行后的结果",
      logs: [
        `【B节点】开始(+${start}ms)`,
        `【B节点】结束(+${fmt(state.t0)})`,
      ],
    };
  })
  .addNode("C", async (state) => {
    console.log("运行C节点");
    const start = fmt(state.t0); // 得到一个相对于A节点的时间
    await sleep(1000);
    return {
      c: "c节点执行后的结果",
      logs: [
        `【C节点】开始(+${start}ms)`,
        `【C节点】结束(+${fmt(state.t0)})`,
      ],
    };
  })
  .addNode("D", async (state) => {
    console.log("运行D节点");
    const summary = `D节点已运行，b=${state.b ?? "none"}，c=${
      state.c ?? "none"
    }`;
    return {
      logs: [
        `${summary}`,
        `【D节点】结束(+${fmt(state.t0)})`,
        `整个流程结束`,
      ],
    };
  })
  .addEdge(START, "A")
  .addEdge("A", "B")
  .addEdge("A", "C")
  .addEdge("B", "D")
  .addEdge("C", "D")
  .addEdge("D", END)
  .compile();

const result = await graph.invoke({});
console.log(result);


