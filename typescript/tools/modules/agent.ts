import {createAgent} from 'langchain'
import { ChatOllama } from "@langchain/ollama";
import tools from '../tool'

const model = new ChatOllama({
    model:"minimax-m2.7:cloud",
    temperature:0.
})

const agent = createAgent({
    model,
    tools,
    systemPrompt:"你是一个聪明的AI智能机器人"
})

export default agent