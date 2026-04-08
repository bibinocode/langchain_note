import fs from "node:fs";

import { END, START, StateGraph } from "@langchain/langgraph";

import { contentNode, summaryNode, titleNode } from "./node/index.ts";
import Schema, { type State } from "./state.ts";

// 清理标题里的换行和文件名非法字符，避免写 markdown 文件时报错
export function sanitizeTitleForFilename(title: string): string {
  const trimmed = title.trim();

  if (!trimmed) {
    return "article";
  }

  return trimmed.replace(/[<>:"/\\|?*\r\n]+/g, "").trim() || "article";
}

export function buildGraph() {
  // 构建文章生成流程图：标题 -> 正文 -> 摘要
  return new StateGraph(Schema)
    .addNode("title_node", titleNode)
    .addNode("content_node", contentNode)
    .addNode("summary_node", summaryNode)
    .addEdge(START, "title_node")
    .addEdge("title_node", "content_node")
    .addEdge("content_node", "summary_node")
    .addEdge("summary_node", END)
    .compile();
}

export async function writeArticle(agent: { invoke: (state: State) => Promise<State> }, topic: string) {
  // 初始化状态
  const initState: State = {
    messages: [],
    llmCalls: 0,
    article: {
      topic,
      title: "",
      content: "",
      summary: "",
    },
  };

  console.log(`智能编辑已经开始撰写文章，文章的主题为：${topic}`);
  return await agent.invoke(initState);
}

export function dumpMarkdown(state: State) {
  // 文章标题用于展示时保留原意，写文件时使用清洗后的文件名
  const title = state.article?.title?.trim() || "未命名文章";
  const content = state.article?.content ?? "";
  const filename = `./${sanitizeTitleForFilename(title)}.md`;
  const mdContent = `# ${title}\n\n${content}\n`;

  fs.writeFileSync(filename, mdContent);
  console.log(`文章已经生成完毕，保存至：${filename}`);
}
