from langchain.agents import create_agent
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_deepseek import ChatDeepSeek
from langchain.chat_models import init_chat_model
import os


load_dotenv()


# 通过LangChain 调用Openai对话

deep_key = os.getenv("DEEPSEEK_API_KEY")
# deepllm  = ChatOpenAI(api_key=deep_key,base_url="https://api.deepseek.com",model="deepseek-chat")

# 直接提供问题，调用提问
# response = deepllm.invoke("什么是大模型？")


# 1.0 推荐方式 使用 init_chat_model 进行统一实例化
# 厂商:模型 如 deepseek:deepseek-chat temperature 温度 最大token支持
model = init_chat_model("deepseek:deepseek-chat")


# response = model.invoke("大模型是什么?")
# model.stream 流式输出
# model.batch 并行请求模型处理

# 流式输出
for chunk in model.stream("写一段诗歌"):
    print(chunk.content,end="",flush=True)

