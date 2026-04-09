/*
 * @Author: 阿逼
 * @Date: 2026-04-09 15:35:54
 * @FilePath: \langchainv1\typescript\multi-agent\utils\model.ts
 * @LastEditTime: 2026-04-09 15:37:13
 * Copyright (c) 2026 by 2553400824@qq.com, All Rights Reserved. 
 */
import {ChatOllama} from '@langchain/ollama'


// 返回模型
export const model =  new ChatOllama({
    model:"minimax-m2.7:cloud",
    temperature:0.
})