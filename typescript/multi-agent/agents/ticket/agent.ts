import { ticket_query } from "./nodes.ts";
import { StateGraph, START, END } from "@langchain/langgraph";
import { ticketSchema } from "../../states/index.ts";

const graph = new StateGraph(ticketSchema)
  .addNode("ticket_query", ticket_query)
  .addEdge(START, "ticket_query")
  .addEdge("ticket_query", END)
  .compile();

export default graph;
