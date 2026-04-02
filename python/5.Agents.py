
from urllib import response

from langchain.chat_models import init_chat_model
from dotenv import load_dotenv
from langchain.agents import create_agent
from langchain.tools import tool

load_dotenv()

model = init_chat_model("deepseek:deepseek-chat")

# V1.0使用 @too装饰器定义装工具 

@tool
def get_weather(city:str) -> str:
    """
    获取指定城市的天气信息

    参数：
        city: 城市名称，如“北京”、“上海”
    
    放回:
        天玺信息字符串
    """

    # 模拟天气数据
    weather_data = {
        "北京":"晴天、温度15℃，空气质量良好",
        "上海":"多云、温度13℃,有轻微雾霾"
    }

    return weather_data.get(city,f"抱歉，暂时没有{city}的天气数据")


# 构建一个agent并应用工具

agent = create_agent(
    model=model,
    tools=[get_weather],
    system_prompt="你是一个生活小助手，可以查询天气信息"
)

res = agent.invoke({
    "messages":[
        {
            "role":"user",
            "content":"上海今天天气怎么样？"
        }
    ]
})


for message in res['messages']:
    message.pretty_print()