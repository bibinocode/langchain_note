/*
 * @Author: 阿逼
 * @Date: 2026-04-09 15:38:50
 * @FilePath: \langchainv1\typescript\multi-agent\states\ticket.ts
 * @LastEditTime: 2026-04-09 15:39:57
 * Copyright (c) 2026 by 2553400824@qq.com, All Rights Reserved. 
 */
import {z} from 'zod/v4'
import {registry} from '@langchain/langgraph/zod'


export const ticketSchema = z.object({
  // 出发城市
  from_city: z
    .string()
    .nullable()
    .register(registry, {
      reducer: {
        fn: (x: string | null, y: string | null) => y ?? x,
      },
      default: () => "",
    })
    .describe("出发城市"),
  // 目标城市
  to_city: z
    .string()
    .nullable()
    .register(registry, {
      reducer: {
        fn: (x: string | null, y: string | null) => y ?? x,
      },
      default: () => "",
    })
    .describe("目标城市"),
  // 票务信息
  ticket_result: z
    .string()
    .nullable()
    .register(registry, {
      reducer: {
        fn: (x: string | null, y: string | null) => y ?? x,
      },
      default: () => null,
    })
    .describe("票务信息"),
});

export type T_ticketSchema = z.infer<typeof ticketSchema>;