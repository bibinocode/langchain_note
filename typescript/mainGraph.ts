import { StateGraph, START, END } from "@langchain/langgraph";
import { z } from "zod/v4";
import { riskSubgraph } from "./riskSubgraph.ts";

// 父图的状态
const OrderState = z.object({
  orderId: z.string().describe("订单的ID"),
  ip: z.string().describe("下订单的IP"),
  amount: z.number().describe("订单的金额"),
  riskLevel: z.enum(["low", "mid", "high"]).optional().describe("风险等级"),
  finalMessage: z.string().optional().describe("最终生成的消息"),
});

type TOrderState = z.infer<typeof OrderState>;

// 该节点用于检验订单是否存在风险
async function checkRisk(state: TOrderState) {
  console.log("父图开始检验订单是否存在风险");

  // 直接调用子图
  const result = await riskSubgraph.invoke({
    orderId: state.orderId,
    ip: state.ip,
    amount: state.amount,
  });

  console.log(`子图返回的结果为：`, result);

  return {
    riskLevel: result.riskLevel,
  };
}

// 根据风险的结果生成最终的信息
async function finish(state: TOrderState) {
  if (state.riskLevel === "high") {
    return {
      finalMessage: "订单被拒绝：风控风险过高。",
    };
  }

  return {
    finalMessage: "订单审核通过，允许下单。",
  };
}

export const mainGraph = new StateGraph(OrderState)
  .addNode("checkRisk", checkRisk)
  .addNode("finish", finish)
  // 边
  .addEdge(START, "checkRisk")
  .addEdge("checkRisk", "finish")
  .addEdge("finish", END)
  .compile();




async function main() {
  const input = {
    orderId: "A10101",
    ip: "10.1.10.10",
    amount: 6000,
  };

  const result = await mainGraph.invoke(input);

  console.log("\n=====最终结果=======");
  console.log(result);
}
main();