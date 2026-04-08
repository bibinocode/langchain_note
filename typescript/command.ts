// 使用Command
import { StateGraph, START, END, Command } from "@langchain/langgraph";
import * as z from "zod";

// 1. 状态Schema
const Schema = z.object({
  orderType: z.enum(["digital", "physical"]).optional().describe("订单的类型"),

  basicInfo: z.string().optional().describe("基础校验"),
  digitalInfo: z.string().optional().describe("数码产品校验"),
  physicalInfo: z.string().optional().describe("非数码产品校验"),

  logs: z.array(z.string()).default([]),
});

// 根据Schema生成ts类型
type TState = z.infer<typeof Schema>;

// 2. 构建图
const app = new StateGraph(Schema)
  .addNode(
    "A",
    (state: TState) => {
      console.log("运行A节点的基础校验");

      // 判断下一个跳转节点
      const next = state.orderType === "digital" ? "B" : "C";

      // 关键点：对外返回一个Command
      return new Command({
        // 更新状态
        update: {
          basicInfo: "A节点基础校验已完成",
          logs: [
            ...state.logs,
            `A节点校验已完成，订单类型为${state.orderType}，前往${next}`,
          ],
        },
        // 指定跳转节点
        goto: next,
      });
    },
    {
      ends: ["B", "C"],
    }
  )
  .addNode(
    "B",
    (state: TState) => {
      console.log("运行B节点的校验");
      return new Command({
        update: {
          digitalInfo: `B节点已经对数码产品进行了校验`,
          logs: [...state.logs, "数码产品订单校验完毕"],
        },
        goto: "D",
      });
    },
    {
      ends: ["D"],
    }
  )
  .addNode(
    "C",
    (state: TState) => {
      console.log("运行C节点的校验");
      return new Command({
        update: {
          digitalInfo: `C节点已经对非数码产品进行了校验`,
          logs: [...state.logs, "非数码产品订单校验完毕"],
        },
        goto: "D",
      });
    },
    { ends: ["D"] }
  )
  .addNode("D", (state: TState) => {
    console.log("运行D节点");

    const summary =
      state.orderType === "digital"
        ? `D：数码商品流程完成：${state.digitalInfo}`
        : `D：非数码商品流程完成：${state.physicalInfo}`;

    return {
      logs: [...state.logs, summary, "处理完成"],
    };
  })
  .addEdge(START, "A")
  .addEdge("D", END)
  .compile();

// 3. 测试用例
const result = await app.invoke({
  logs: [],
  orderType: "digital",
});

console.log("\n最终输出：");
console.log(JSON.stringify(result, null, 2));
