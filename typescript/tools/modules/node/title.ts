import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";

import { getModel } from "../model.ts";
import { SYSTEM_PROMPT, TITLE_PROMPT } from "../prompt.ts";
import type { State } from "../state.ts";

export async function titleNode(state: State): Promise<Partial<State>> {
  if (!state.article?.topic) {
    throw new Error("缺少文章主题");
  }

  // 先根据主题生成标题，并把首尾空白清理掉，避免后续拼接 prompt 和写文件时出现异常
  const chain = ChatPromptTemplate.fromMessages([
    ["system", SYSTEM_PROMPT],
    ["human", TITLE_PROMPT],
  ])
    .pipe(getModel())
    .pipe(new StringOutputParser());

  const title = (await chain.invoke({
    topic: state.article.topic,
  })).trim();

  return {
    messages: [...state.messages, title],
    llmCalls: (state.llmCalls ?? 0) + 1,
    article: {
      ...state.article,
      title,
    },
  };
}
