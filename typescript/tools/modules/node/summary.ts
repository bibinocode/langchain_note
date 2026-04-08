import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";

import { getModel } from "../model.ts";
import { SUMMARY_PROMPT, SYSTEM_PROMPT } from "../prompt.ts";
import type { State } from "../state.ts";

export async function summaryNode(state: State): Promise<Partial<State>> {
  if (!state.article?.topic) {
    throw new Error("缺少文章主题");
  }

  if (!state.article?.title) {
    throw new Error("缺少文章标题");
  }

  if (!state.article?.content) {
    throw new Error("缺少文章正文");
  }

  // 根据主题、标题和正文生成摘要
  const chain = ChatPromptTemplate.fromMessages([
    ["system", SYSTEM_PROMPT],
    ["human", SUMMARY_PROMPT],
  ])
    .pipe(getModel())
    .pipe(new StringOutputParser());

  const summary = await chain.invoke({
    title: state.article.title,
    content: state.article.content,
    topic: state.article.topic,
  });

  return {
    messages: [...state.messages, summary],
    llmCalls: (state.llmCalls ?? 0) + 1,
    article: {
      ...state.article,
      summary,
    },
  };
}
