/*
 * @Author: 阿逼
 * @Date: 2026-04-09 15:46:20
 * @FilePath: \langchainv1\typescript\multi-agent\agents\travel\nodes\agent.ts
 * @LastEditTime: 2026-04-09 15:46:30
 * Copyright (c) 2026 by 2553400824@qq.com, All Rights Reserved. 
 */
import { StateGraph, START, END } from "@langchain/langgraph";
import { travelSchema } from "../../states/index.ts";
import {
  chat,
  intent,
  response,
  router,
  ticket,
  weather,
} from "./nodes/index.ts";

const graph = new StateGraph(travelSchema)
  .addNode("chat", chat)
  .addNode("intent_node", intent)
  .addNode("response", response)
  .addNode("ticket", ticket)
  .addNode("weather", weather)
  // 边
  .addEdge(START, "intent_node")
  .addConditionalEdges("intent_node", router)
  .addEdge("weather", "response")
  .addEdge("ticket", "response")
  .addEdge("response", END)
  .addEdge("chat", END)
  .compile();

export default graph;
