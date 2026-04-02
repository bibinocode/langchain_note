from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langchain.messages import SystemMessage,HumanMessage,AIMessage
load_dotenv()


model = init_chat_model("deepseek:deepseek-chat")


# 消息对象
# message = [
#     SystemMessage(content="你是张老师的助理，你叫小"),
#     HumanMessage("我叫同学小张"),
#     AIMessage(content="好的老板，你有什么吩咐？"),
#     HumanMessage(content="你是谁?")
# ]


# 字典方式
message_dict = [
    {"role":"system","content":"你是一个专业的数学老师"},
    {"role":"user","content":"微积分是什么？"}
]


for chunk in model.stream(message_dict):
    print(chunk.content,end="",flush=True)