/// 电商风控系统 - 控制并发数量
import {StateGraph,START,END,Send} from '@langchain/langgraph'
import {z} from 'zod/v4'
import {registry} from '@langchain/langgraph/zod'
import pLimit from "p-limit";


// 单个订单结构
const OrderSchema = z.object({
  id: z.string(),
  userId: z.string(),
  amount: z.number(), // 订单金额
  ip: z.string(), // 下单 IP
  device: z.string().optional(), // 设备信息
});

// 单个订单的风险评估结果
const RiskResultSchema = z.object({
  orderId: z.string(),
  riskScore: z.number(), // 0～100
  level: z.enum(["low", "mid", "high"]),
});



const State = z.object({
  // 输入：一批待审核订单
  orders: z.array(OrderSchema),

  // Map阶段输出：每个订单的风险结果
  riskResults: z.array(RiskResultSchema).register(registry, {
    reducer: {
      fn: (prev: string[], next: string[]) => prev.concat(next), // 合并数组
    },
    default: () => [],
  }),

  // Reduce阶段生成的汇总数据
  summary: z
    .object({
      total: z.number(),
      highRiskCount: z.number(),
      highRiskRate: z.number(),
    })
    .optional(),
});



// 创建一个限流器，最多同时执行 5 个任务
const limit = pLimit(5);

// Map阶段：根据订单列表，扇出多个评分任务
const fanoutOrders = (state: z.infer<typeof State>) => {
  return state.orders.map(
    (order) => new Send("scoreOrder", { order }) // 每个订单成为一个独立子任务
  );
};




// 模拟外部风控服务：根据金额简单打分
async function callRiskService(order: z.infer<typeof OrderSchema>) {
  const startTime = new Date().toISOString().split("T")[1];
  console.log(`[${startTime}]开始处理订单: ${order.id}`);

  // 模拟API调用延迟（1-3秒随机延迟）
  const delay = 1000 + Math.random() * 2000;
  await new Promise((resolve) => setTimeout(resolve, delay));

  const base = order.amount / 100; //  金额越大，风险越高，先根据金额算一个基础分，分数越高，风险越大
  const random = Math.random() * 10; // 随机分，假设有一些其它的因素也会影响最终的打分
  const score = Math.min(100, base * 10 + random); // 计算出最终的分数，分数的范围是 0～100

  let level: "low" | "mid" | "high" = "low";
  if (score >= 70) level = "high";
  else if (score >= 40) level = "mid";

  const endTime = new Date().toISOString().split("T")[1];
  console.log(
    `[${endTime}]完成处理订单: ${order.id} (耗时: ${Math.round(
      delay
    )}ms, 风险等级: ${level})`
  );

  return {
    orderId: order.id,
    riskScore: score,
    level,
  } as z.infer<typeof RiskResultSchema>;
}

// Worker 阶段：对单个订单做风险评估（使用限流器控制并发）
const scoreOrder = async (state: { order: z.infer<typeof OrderSchema> }) => {
  const queueTime = new Date().toISOString().split("T")[1];
  console.log(`[${queueTime}] 订单 ${state.order.id} 进入队列等待...`);

  // 通过限流器执行，确保同时最多只有 5 个任务在执行
  const risk = await limit(() => callRiskService(state.order));

  return {
    riskResults: [risk],
  };
};

// Reduce 阶段：汇总风控结果，生成 summary
const aggregateRisk = (state: z.infer<typeof State>) => {
  const total = state.orders.length;
  const highRisk = state.riskResults.filter((r) => r.level === "high");

  const highRiskCount = highRisk.length;
  const highRiskRate = total === 0 ? 0 : highRiskCount / total;

  return {
    summary: {
      total,
      highRiskCount,
      highRiskRate,
    },
  };
};

// 构建工作流图
const graph = new StateGraph(State)
  .addNode("scoreOrder", scoreOrder)
  .addNode("aggregateRisk", aggregateRisk)
  // START → Map：动态扇出
  .addConditionalEdges(START, fanoutOrders)
  // 所有 scoreOrder 完成后 → Reduce
  .addEdge("scoreOrder", "aggregateRisk")
  .addEdge("aggregateRisk", END)
  .compile();

const input = {
  orders: [
    { id: "o1", userId: "u1", amount: 99, ip: "1.1.1.1" },
    { id: "o2", userId: "u2", amount: 560, ip: "2.2.2.2" },
    { id: "o3", userId: "u3", amount: 3000, ip: "3.3.3.3" },
    { id: "o4", userId: "u4", amount: 1500, ip: "4.4.4.4" },
    { id: "o5", userId: "u5", amount: 800, ip: "5.5.5.5" },
    { id: "o6", userId: "u6", amount: 200, ip: "6.6.6.6" },
    { id: "o7", userId: "u7", amount: 4500, ip: "7.7.7.7" },
    { id: "o8", userId: "u8", amount: 120, ip: "8.8.8.8" },
    { id: "o9", userId: "u9", amount: 2800, ip: "9.9.9.9" },
    { id: "o10", userId: "u10", amount: 670, ip: "10.10.10.10" },
    { id: "o11", userId: "u11", amount: 1900, ip: "11.11.11.11" },
    { id: "o12", userId: "u12", amount: 350, ip: "12.12.12.12" },
  ],
  riskResults: [],
};

console.log("=".repeat(60));
console.log(`开始处理 ${input.orders.length} 个订单，最大并发数: 5`);
console.log("=".repeat(60));

const startTime = Date.now();
const result = await graph.invoke(input);
const endTime = Date.now();

console.log("=".repeat(60));
console.log(
  `✨ 所有订单处理完成！总耗时: ${((endTime - startTime) / 1000).toFixed(2)}秒`
);
console.log("=".repeat(60));
console.log("\n汇总结果:");
console.log(JSON.stringify(result.summary, null, 2));
console.log("\n详细风险评估:");
console.log(JSON.stringify(result.riskResults, null, 2));