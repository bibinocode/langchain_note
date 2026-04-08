import {StateGraph,START,END} from '@langchain/langgraph'
import {z} from 'zod/v4'
import { registry } from "@langchain/langgraph/zod";

const Schema = z.object({
    path:z.enum(["B","C"]).optional(),
    a:z.string().optional(),
    b:z.string().optional(),
    c:z.string().optional(),
    logs:z.array(z.string()).register(registry,{
        reducer:{
            fn:(oldVal,incoming) => oldVal.concat(incoming)
        },
        default:()=>[] as string[]
    })
})


type TState = z.infer<typeof Schema>;




// 路由函数
function routeFunc(state: TState) {
  return state.path === "B" ? "B" : "C";
}



const graph = new StateGraph(Schema)
  .addNode("A", () => {
    console.log("运行A节点");
    return {
      a: "A节点的计算结果",
      logs: ["A节点计算完成"],
    };
  })
  .addNode("B", () => {
    console.log("运行B节点");
    return {
      a: "B节点的计算结果",
      logs: ["B节点计算完成"],
    };
  })
  .addNode("C", () => {
    console.log("运行C节点");
    return {
      a: "C节点的计算结果",
      logs: ["C节点计算完成"],
    };
  })
  .addNode("D", () => {
    console.log("运行D节点");
    return {
      a: "D节点的计算结果",
      logs: ["D节点计算完成"],
    };
  })
  .addEdge(START, "A")
  .addConditionalEdges("A", routeFunc, {
    B: "B",
    C: "C",
  })
  .addEdge("B", "D")
  .addEdge("C", "D")
  .addEdge("D", END)
  .compile();

const result = await graph.invoke({
  logs: [],
  path: "C",
});
console.log(result);

/**
运行A节点
运行C节点
运行D节点
{ path: 'C', a: 'D节点的计算结果', logs: [ 'A节点计算完成', 'C节点计算完成', 'D节点计算完成' ] }
 */