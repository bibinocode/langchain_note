import readlineSync from "readline-sync";
import {
  AIMessage,
  HumanMessage,
  type BaseMessageLike,
} from "@langchain/core/messages";
import graph from "./tools/modules/graph";



const chat_history: BaseMessageLike[] = []; // 存储会话记录

// 程序入口
async function main() {
  console.log("开始对话，输入内容后回车；clear 清空历史；exit 退出。");

  while (true) {
    // 接收用户的输入
    const input = readlineSync.question("用户：");

    if (!input) continue;

    if (input === "exit") break;

    if (input === "clear") {
      chat_history.length = 0;
      console.log("已经清空历史");
      continue;
    }

    // 代码来到这里，就是正常的对话
    try {
      // 先将用户这一次的输入加入到会话数组里面
      const messages = [...chat_history, new HumanMessage(input)];

      // 和模型进行交互，拿到一个事件流
      const eventStream = await graph.streamEvents(
        { messages },
        { version: "v2" }
      );

      globalThis.process.stdout.write("助理：");
      let finalText = ""; // 存储最终模型输出内容

      // 根据事件流里面的每一个事件类型，做不同的事情
      for await (const ev of eventStream) {
        // console.log(ev);
        // 根据每一个事件不同的类型，做不一样的处理
        if (ev.event === "on_chat_model_stream") {
          // 说明就是一个token
          // 1. 输出    2. 拼接
          const text = ev.data.chunk.text; // 拿到这一次token的文本值
          finalText += text;
          globalThis.process.stdout.write(text);
        }
        if (ev.event === "on_tool_start") {
          // 说明是要调用工具w
          globalThis.process.stdout.write(`\n【正在调用工具 ${ev.name}】\n`);
        }
        if (ev.event === "on_tool_end") {
          // 说明工具调用结束
          globalThis.process.stdout.write(`\n【调用工具 ${ev.name} 完成】\n`);
        }
      }

      console.log("\n");

      // 代码来到这里，模型所有的token输出都已经完毕了
      // 将模型的回复写入到会话历史里面
      chat_history.push(new HumanMessage(input), new AIMessage(finalText));
    } catch (err) {
      console.error("和模型会话失败", err);
    }
  }

  console.log("感谢使用，下次见！");
}
main();