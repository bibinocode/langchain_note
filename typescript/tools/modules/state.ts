import {z} from 'zod/v4'


const Schema = z.object({
    messages:z.array(z.custom()).describe("会话记录"),
    llmCalls:z.number().optional().describe("大模型交互的次数")
})

export type State = z.infer<typeof Schema>

export default Schema