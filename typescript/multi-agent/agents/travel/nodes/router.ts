/*
 * @Author: 阿逼
 * @Date: 2026-04-09 15:51:13
 * @FilePath: \langchainv1\typescript\multi-agent\agents\travel\nodes\router.ts
 * @LastEditTime: 2026-04-09 15:51:19
 * Copyright (c) 2026 by 2553400824@qq.com, All Rights Reserved. 
 */
// 路由节点
// 根据intent上游节点更新的intent的状态值
// 导航到不同的下一个节点
import type { T_travelSchema } from "../../../states/index.ts";

export function router(state: T_travelSchema): string {
  const intent = state.intent;
  if (intent === "weather") return "weather";
  else if (intent === "ticket") return "ticket";
  return "chat";
}
