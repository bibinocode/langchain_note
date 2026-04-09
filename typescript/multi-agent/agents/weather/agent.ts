/*
 * @Author: 阿逼
 * @Date: 2026-04-09 15:52:57
 * @FilePath: \langchainv1\typescript\multi-agent\agents\weather\agent.ts
 * @LastEditTime: 2026-04-09 15:53:03
 * Copyright (c) 2026 by 2553400824@qq.com, All Rights Reserved. 
 */
import { StateGraph, START, END } from "@langchain/langgraph";
import { weatherSchema } from "../../states/index.ts";
import { weather_query } from "./nodes.ts";

const graph = new StateGraph(weatherSchema)
  .addNode("weather_query", weather_query)
  .addEdge(START, "weather_query")
  .addEdge("weather_query", END)
  .compile();

export default graph;
