import { StateGraph, START, END } from "@langchain/langgraph";
import { z } from "zod/v4";

// 子图的状态
const RiskState = z.object({
  orderId: z.string().describe("订单ID"),
  ip: z.string().describe("下订单的IP"),
  amount: z.number().describe("订单的总金额"),
  ipRisk: z.boolean().optional().describe("IP是否存在风险"),
  amountRisk: z.boolean().optional().describe("金额是否存在风险"),
  riskLevel: z.enum(["low", "mid", "high"]).optional().describe("风险的等级"),
});

export type TRiskState = z.infer<typeof RiskState>;

// 两个子图节点：1. 检查IP  2. 检查金额
async function checkIpRisk(state: TRiskState) {
  const riskyIps = ["10.10.10.10", "123.123.123.123"]; // 这一组是有风险的IP
  const isRisk = riskyIps.includes(state.ip);

  return {
    ipRisk: isRisk,
  };
}

async function checkAmountRisk(state: TRiskState) {
  return {
    amountRisk: state.amount > 5000, // 假设订单总额大于5000就存在风险
  };
}

// 汇总节点
async function summarizeRisk(state: TRiskState) {
  const { ipRisk, amountRisk } = state;
  if (ipRisk || amountRisk) {
    return {
      riskLevel: "high",
    };
  }
  return {
    riskLevel: "low",
  };
}

// 创建子图
export const riskSubgraph = new StateGraph(RiskState)
  .addNode("checkIpRisk", checkIpRisk)
  .addNode("checkAmountRisk", checkAmountRisk)
  .addNode("summarizeRisk", summarizeRisk)
  // 边
  .addEdge(START, "checkIpRisk")
  .addEdge("checkIpRisk", "checkAmountRisk")
  .addEdge("checkAmountRisk", "summarizeRisk")
  .addEdge("summarizeRisk", END)
  .compile();
