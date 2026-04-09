import type { T_ticketSchema } from "../../states/ticket.ts";
import { ticket_tool } from "../../tools/index.ts";

export async function ticket_query(
  state: T_ticketSchema
): Promise<Partial<T_ticketSchema>> {
  // 从状态中提取出发城市和目标城市
  const { from_city, to_city } = state;
  if (!from_city || !to_city) {
    return { ticket_result: "缺少出发城市或目的城市" };
  }

  const result = await ticket_tool.invoke({
    from_city,
    to_city,
  });

  return {
    ticket_result: result,
  };
}
