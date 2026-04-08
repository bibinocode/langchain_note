import {z} from 'zod/v4'


const contentSchema =  z.object({
  topic: z.string().describe("文章主题"),
  title: z.string().describe("文章标题"),
  content: z.string().describe("文章内容"),
  summary: z.string().describe("文章摘要"),
});

type TArticle  = z.infer<typeof contentSchema> 

const Schema = z.object({
    messages:z.array(z.custom()).describe("会话记录"),
    llmCalls:z.number().optional().describe("大模型交互的次数"),
    article:z.custom<TArticle>().optional().describe("文章摘要")
})

export type State = z.infer<typeof Schema>

export default Schema