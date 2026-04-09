/*
 * @Author: 阿逼
 * @Date: 2026-04-09 15:53:46
 * @FilePath: \langchainv1\typescript\multi-agent\run\interactive.ts
 * @LastEditTime: 2026-04-09 15:53:52
 * Copyright (c) 2026 by 2553400824@qq.com, All Rights Reserved. 
 */
// interactive：交互
// 自由模式
import travelGraph from "../agents/travel/agent.ts";
import readline from "readline-sync";
import { processStream } from "../utils/tool.ts";
import { HumanMessage } from "@langchain/core/messages";

export async function runInteractiveMode() {
  console.log("=".repeat(70));
  console.log("🌏 旅游规划多智能体系统 (Multi-Agent Travel Planning System)");
  console.log("=".repeat(70));
  console.log();
  console.log("本系统包含以下 Agent：");
  console.log("  • 主Agent (Customer Service Agent) - 意图识别与路由调度");
  console.log("  • 天气 - 子Agent (Weather Agent) - 查询城市天气");
  console.log("  • 车票 - 子Agent (Ticket Agent) - 查询火车票价格");
  console.log();
  console.log("技术特点：");
  console.log("  • 使用 Subgraph 实现多智能体架构");
  console.log("  • 使用 Stream 实现流式输出");
  console.log("退出系统：");
  console.log("  • quit");
  console.log("  • exit");
  console.log("  • q");
  console.log("=".repeat(70));
  console.log();

  try {
    while (true) {
      // 1. 接收用户的输入
      const userInput = readline.question("👤 用户: ");
      if (!userInput) continue;

      // 2. 判断用户的输入是否是要退出系统
      if (["quit", "exit", "q"].includes(userInput.toLowerCase())) {
        console.log("\n👋 再见！祝您旅途愉快！");
        break;
      }

      console.log();
      console.log("📊 执行流程 (Stream Output with Subgraphs):");
      console.log("-".repeat(50));

      const result = await processStream(travelGraph, {
        messages: [new HumanMessage(userInput)],
      });
      console.log("-".repeat(50));
      if (result) {
        console.log(`\n🤖 助手: ${result}\n`);
      }
      console.log();
      console.log("-".repeat(70));
      console.log();
    }
  } catch (err) {
    console.error("和agent交互出现问题：", err);
  }
}
