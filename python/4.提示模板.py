from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langchain_core.prompts import ChatPromptTemplate,SystemMessagePromptTemplate,HumanMessagePromptTemplate,ChatMessagePromptTemplate
from langchain_core.output_parsers import StrOutputParser,JsonOutputParser
load_dotenv()


model = init_chat_model("deepseek:deepseek-chat")


message = [
    ("system", "你是世界级的技术文档编写者"),
    ("user", "{input}"),  # {input} 为变量
]

# 系统提示词
sysPrompt = SystemMessagePromptTemplate.from_template(
    "你是一个翻译助理 ,请将用户输入的内容由{input_language}直接翻译为{output_language}."
)

# 用户提示词
userPrompt = HumanMessagePromptTemplate.from_template("{text}")

# 合成提示词
chatPrompt = ChatPromptTemplate.from_messages([sysPrompt,userPrompt])

prompt = ChatPromptTemplate.from_messages(message)
# prompt_messages = prompt.format_messages(input="大模型中的LangChain是什么？")


# 查看插入变化
# print(prompt_messages)

# [SystemMessage(content='你是世界级的技术文档编写者', additional_kwargs={}, response_metadata={}), HumanMessage(content='大模型中的LangChain是什么？', additional_kwargs={}, response_metadata={})]

# res = model.invoke(prompt_messages)
# print(res.content)


# 管道操作 将前者输出，作为输入材料

chain = chatPrompt | model

# res = chain.invoke({
#     "input":"大模型中的LangChain是什么？"
# })

# print(res.content)

for chunk in chain.stream(input={"input_language": "中文","output_language": "英语","text": "今天天气真好，我们去游泳吧",}):
    print(chunk.content,end="",flush=True)

