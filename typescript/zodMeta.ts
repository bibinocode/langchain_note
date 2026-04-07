/*
 * @Author: 阿逼
 * @Date: 2026-04-07 17:30:16
 * @FilePath: \langchainv1\typescript\zodMeta.ts
 * @LastEditTime: 2026-04-07 17:31:11
 * Copyright (c) 2026 by 2553400824@qq.com, All Rights Reserved. 
 */
import {StateGraph,START,END,MessagesZodMeta} from '@langchain/langgraph'
import {registry} from '@langchain/langgraph/zod'

import {
  BaseMessage,
  HumanMessage,
  AIMessage,
} from "@langchain/core/messages";
// import * as z from "zod";
import { z } from "zod/v4";


// 定义Schema
const Schema = z.object({
  messages: z
    .array(z.custom<BaseMessage>())
    .register(registry, MessagesZodMeta),
});


// type TState = z.infer<typeof Schema>;

async function node1() {
  const msg = new HumanMessage({
    content: "你好，langgraph",
  });

  return {
    messages: [msg], // 追加
  };
}

async function node2() {
  const msg = new AIMessage({
    content: "你好，langgraph22222",
  });

  return {
    messages: [msg], // 追加
  };
}

async function node3() {
  const msg = new HumanMessage({
    id: "m-123",
    content: "修正用户消息",
  });

  return {
    messages: [msg], // 更新 id 为 m-123 的消息内容
  };
}

async function node4() {
  const msg = new AIMessage({
    id: "m-456",
    content: "修正AI回复的消息",
  });

  return {
    messages: [msg], // 更新 id 为 m-456 的消息内容
  };
}

const app = new StateGraph(Schema)
  .addNode("node1", node1)
  .addNode("node2", node2)
  .addNode("node3", node3)
  .addNode("node4", node4)
  .addEdge(START, "node1")
  .addEdge("node1", "node2")
  .addEdge("node2", "node3")
  .addEdge("node3", "node4")
  .addEdge("node4", END)
  .compile();

const result = await app.invoke({
  // 一开始有两条信息
  messages: [
    new HumanMessage({ id: "m-123", content: "这是原始的用户消息" }),
    new AIMessage({ id: "m-456", content: "这是原始的AI回复消息" }),
  ],
});
console.log(result);