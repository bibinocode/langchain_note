// 做身份验证的子图
import { StateGraph, START, END } from "@langchain/langgraph";
import { z } from "zod/v4";

const KycState = z.object({
  // 用户注册的基本信息
  userName: z.string().describe("用户名"),
  idCardImage: z.string().describe("用户身份证图片"),
  selfImage: z.string().describe("用户相关的图片"),

  // 各种验证
  ocrPassed: z.boolean().optional().describe("ocr验证是否通过"),
  faceMatch: z.boolean().optional().describe("人脸匹配是否通过"),
  kycPassed: z.boolean().optional().describe("kyc验证是否通过"),
});

type TKycState = z.infer<typeof KycState>;

// 检查的节点：1. OCR验证   2. 人脸比对
async function ocrCheck() {
  const randomPass = Math.random() > 0.5; // 90% 通过

  console.log("🔍 [子图] OCR 检查：", randomPass);

  return { ocrPassed: randomPass };
}

async function faceMatchCheck() {
  const randomPass = Math.random() > 0.5; // 80% 通过

  console.log("🔍 [子图] 人脸比对：", randomPass);

  return { faceMatch: randomPass };
}

// 汇总节点
async function summary(state: TKycState) {
  // 这两项验证都通过了，那就是通过了
  const passed = state.ocrPassed && state.faceMatch;

  return {
    kycPassed: passed,
  };
}

export const kycSubgraph = new StateGraph(KycState)
  .addNode("ocrCheck", ocrCheck)
  .addNode("faceMatchCheck", faceMatchCheck)
  .addNode("summary", summary)
  // 边
  .addEdge(START, "ocrCheck")
  .addEdge("ocrCheck", "faceMatchCheck")
  .addEdge("faceMatchCheck", "summary")
  .addEdge("summary", END)
  .compile();
