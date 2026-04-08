import "dotenv/config";
import readlineSync from "readline-sync";
import { buildGraph, dumpMarkdown, writeArticle } from "./tools/modules/agent";

// 入口文件
async function main() {
  // 1. 构造agent
  const agent = buildGraph();

  // 2. 写文章：agent、主题
  const finalState = await writeArticle(agent, "React19的更新日志");

  // 3. 将文章导出为markdown格式
  dumpMarkdown(finalState);
}

main();