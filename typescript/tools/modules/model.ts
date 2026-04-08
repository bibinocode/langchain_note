/*
 * @Author: 阿逼
 * @Date: 2026-04-08 16:29:36
 * @FilePath: \langchainv1\typescript\tools\modules\model.ts
 * @LastEditTime: 2026-04-08 16:30:12
 * Copyright (c) 2026 by 2553400824@qq.com, All Rights Reserved. 
 */
import { ChatOllama } from "@langchain/ollama";

export function getModel(){
    return new ChatOllama({
        model:"minimax-m2.7:cloud",
        temperature:0.
    })

}