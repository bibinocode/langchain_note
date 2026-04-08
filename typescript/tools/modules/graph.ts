/*
 * @Author: 阿逼
 * @Date: 2026-04-08 16:00:47
 * @FilePath: \langchainv1\typescript\tools\modules\graph.ts
 * @LastEditTime: 2026-04-08 16:05:43
 * Copyright (c) 2026 by 2553400824@qq.com, All Rights Reserved. 
 */
import agent from "./agent";
import Schema, { State } from './state'
import {StateGraph,START,END} from '@langchain/langgraph'
import type { BaseMessageLike } from "@langchain/core/messages";


// 创建一个节点
const llmNode = async(state:State):Promise<State> => {
    const messages = state.messages as BaseMessageLike[]

    // 拿到和模型交互的结果
    const result = await agent.invoke({
        messages
    })

    const newMessages = [...messages,result] as BaseMessageLike[]

    // 返回新状态
    return {
        messages:newMessages,
        llmCalls:(state.llmCalls ?? 0) + 1
    }
}



// 构建图
const graph = new StateGraph(Schema)
  .addNode("llmNode", llmNode)
  .addEdge(START, "llmNode")
  .addEdge("llmNode", END)
  .compile();

export default graph;