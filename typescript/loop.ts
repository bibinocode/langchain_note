// 订单状态轮询
import { StateGraph, START, END } from "@langchain/langgraph";
import { z } from "zod/v4";

// 订单状态枚举
export const OrderStatus = {
  PENDING: 0,
  PROCESSING: 1,
  SUCCESS: 2,
  FAIL: 3,
  NETWORK_ERR: 4,
  INTERNAL_ERR: 5,
} as const;

// 订单状态类型
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

// 订单状态描述映射
const StatusMap: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "待处理",
  [OrderStatus.PROCESSING]: "处理中",
  [OrderStatus.SUCCESS]: "处理成功",
  [OrderStatus.FAIL]: "处理失败",
  [OrderStatus.NETWORK_ERR]: "网络错误",
  [OrderStatus.INTERNAL_ERR]: "内部错误",
};

// 图的Schema
const Schema = z.object({
  orderId: z.string().describe("订单的id"),
  status: z.enum(OrderStatus).describe("订单状态"),
  attempt: z.number().describe("轮询的次数"),
});

// 根据Schema生成 ts 类型
type TState = z.infer<typeof Schema>;

// 工具 sleep
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// 模拟外部查询
async function mockFetchOrder(
  orderId: string,
  attempt: number
): Promise<OrderStatus> {
  // 日志：这是第几次轮询
  console.log(`当前是第${attempt}次查询`);

  await sleep(2000); // 模拟异步请求等待一段时间

  // 更新状态
  if (Math.random() < 0.1) return OrderStatus.NETWORK_ERR; // 一定的几率，网络出错
  if (Math.random() < 0.1) return OrderStatus.FAIL; // 一定的几率，其它错误

  if (attempt < 3) return OrderStatus.PENDING;
  if (attempt === 3) return OrderStatus.PROCESSING;
  if (attempt === 4) return OrderStatus.SUCCESS;

  return OrderStatus.INTERNAL_ERR;
}

function buildGraph(maxRetries: number) {
  // 定义节点

  // 1. fetchStatus：模拟从外部服务器获取最新订单状态
  async function fetchStatus(state: TState) {
    const newStatus = await mockFetchOrder(state.orderId, state.attempt);

    console.log(`当前订单最新的状态为：${StatusMap[newStatus]}`);

    // 判断当前订单是否是最终状态
    const isFinalStatus =
      newStatus === OrderStatus.SUCCESS ||
      newStatus === OrderStatus.FAIL ||
      newStatus === OrderStatus.NETWORK_ERR ||
      newStatus === OrderStatus.INTERNAL_ERR;

    return {
      status: newStatus,
      attempt: isFinalStatus ? state.attempt : state.attempt + 1,
    };
  }

  // 2. waitNext：简单的等待一段时间，模拟处理其他的工作
  async function waitNext() {
    console.log("\n等待2秒后重试\n");
    await sleep(2000);
    return {};
  }

  // 3. 条件函数
  function routeFunc(state: TState) {
    if (state.status === OrderStatus.SUCCESS) return "done";
    if (state.status === OrderStatus.FAIL) return "done";
    if (state.status === OrderStatus.NETWORK_ERR) return "done";
    if (state.status === OrderStatus.INTERNAL_ERR) return "done";

    if (state.attempt > maxRetries) return "timeout";

    return "retry";
  }

  // 4. 构建图
  return new StateGraph(Schema)
    .addNode("fetchStatus", fetchStatus)
    .addNode("waitNext", waitNext)
    .addEdge(START, "fetchStatus")
    .addConditionalEdges("fetchStatus", routeFunc, {
      done: END,
      timeout: END,
      retry: "waitNext",
    })
    .addEdge("waitNext", "fetchStatus")
    .compile();
}

// 测试用例
async function main() {
  const orderId = "ORDER-10001"; // 订单的编号
  const maxRetries = 6; // 尝试的最大次数

  const graph = buildGraph(maxRetries);

  const stream = await graph.stream({
    orderId,
    status: OrderStatus.PENDING,
    attempt: 1,
  });

  for await (const update of stream) {
    console.log(`每一次的更新：`);
    console.log(update);
    console.log("\n");
  }

  console.log("订单查询结束");
}

main();
