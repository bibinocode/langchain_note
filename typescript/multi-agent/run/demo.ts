// demo模式【演示模式】
import readline from "readline-sync";
import { HumanMessage } from "@langchain/core/messages";
import { processStream } from "../utils/tool.ts";
import travelGraph from "../agents/travel/agent.ts";

export async function runDemoMode() {
  console.log("=".repeat(70));
  console.log("🎬 演示模式 - 旅游规划多智能体系统");
  console.log("=".repeat(70));
  console.log();

  // 演示的课题
  // 准备了5个课题
  const demoQueries = [
    "你好，请问你能帮我做什么？",
    "我想去北京旅游，帮我查一下北京的天气",
    "我现在在上海，想去杭州，帮我查一下火车票价格",
    "广州天气怎么样？",
    "从北京到上海的火车票多少钱？",
  ];

  try {
    // 遍历所有的课题
    for (let i = 0; i < demoQueries.length; i++) {
      // 取出当前的课题
      const query = demoQueries[i];

      console.log(`\n${"=".repeat(70)}`);
      console.log(`📌 演示场景 ${i + 1}/${demoQueries.length}`);
      console.log(`${"=".repeat(70)}`);

      console.log(`\n👤 用户: ${query}`);
      console.log();
      console.log("📊 执行流程:");
      console.log("-".repeat(50));

      const result = await processStream(travelGraph, {
        messages: [new HumanMessage(query)],
      });

      console.log("-".repeat(50));

      if (result) {
        console.log(`\n🤖 助手: ${result}\n`);
      }

      // 看还有没有下一个
      if (i < demoQueries.length - 1) {
        readline.question("按 Enter 继续下一个演示...");
      }
    }
  } catch (err) {
    console.error("演示过程中出现了错误：", err);
  }

  console.log("\n" + "=".repeat(70));
  console.log("🎬 演示完成！");
  console.log("=".repeat(70));
}
