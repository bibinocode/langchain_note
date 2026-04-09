// 父图
import { StateGraph, START, END } from "@langchain/langgraph";
import { z } from "zod/v4";
import { kycSubgraph } from "./kycSubgraph.ts";

// 父图的状态
const MainState = z.object({
  // 用户注册的基本信息
  userName: z.string().describe("用户名"),
  idCardImage: z.string().describe("用户身份证图片"),
  selfImage: z.string().describe("用户相关的图片"),

  // 各种验证
  ocrPassed: z.boolean().optional().describe("ocr验证是否通过"),
  faceMatch: z.boolean().optional().describe("人脸匹配是否通过"),
  kycPassed: z.boolean().optional().describe("kyc验证是否通过"),

  // 最终注册的结果
  registerResult: z.string().optional().describe("最终注册的结果"),
});

type TMainState = z.infer<typeof MainState>;

function finish(state: TMainState) {
  if (state.kycPassed) {
    return {
      registerResult: "注册成功",
    };
  }
  return {
    registerResult: "注册失败，KYC验证没有通过",
  };
}

const mainGraph = new StateGraph(MainState)
  .addNode("kycFlow", kycSubgraph)
  .addNode("finish", finish)
  // 边
  .addEdge(START, "kycFlow")
  .addEdge("kycFlow", "finish")
  .addEdge("finish", END)
  .compile();


async function main() {
  // 模拟数据
  const input = {
    userName: "张三",
    idCardImage: "path/idcard.jpg",
    selfImage: "path/selfie.jpg",
  };

  const result = await mainGraph.invoke(input);

  console.log("\n=== 最终结果 ===");
  console.log(result);
}
main();