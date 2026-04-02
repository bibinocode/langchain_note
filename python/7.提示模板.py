# 基础PromptTemplate模板
from langchain_core.prompts import PromptTemplate


# 创建提示词模板 原始方式

template  = "你是一个专业的前端程序员。\n对于信息{text}进行简短描述回答" 

prompt = PromptTemplate.from_template(template)

print(prompt)
print("="*50)
print(prompt.format(text="React")) # 模版里定义什么变量这里就输入什么变量


## 直接构造的方式生成

prompt2 = PromptTemplate(input_variables=["text"],template="你是一个专业的前端程序员。\n对于信息{text}进行简短描述回答")

print(prompt2.format(text="vue"))




# ChatPromptTemplate
# ChatPrompt相关
from langchain_core.prompts import ChatPromptTemplate
from langchain.chat_models import init_chat_model

system_message = "你是一个翻译专家，擅长将{input_language} 语言翻译成 {output_language}语言。"
user_message = "{text}"


chat_prompt = ChatPromptTemplate.from_messages([
    ("system",system_message),
    ("human",user_message)
])

model = init_chat_model("deepseek:deepseek-chat")

# 输入提示
message = chat_prompt.format_messages(input_language="英文",output_language="中文",text="I Love Large Language Model.")

output = model.invoke(message)


# 消息结构对象
from langchain_core.prompts import (ChatMessagePromptTemplate,SystemMessagePromptTemplate,AIMessagePromptTemplate,HumanMessagePromptTemplate)
system_message = "你是一个翻译专家，擅长将{input_language} 语言翻译成 {output_language}语言。"
user_message = "{text}"


system_message_prompt = SystemMessagePromptTemplate.from_template(system_message)
human_message_prompt = HumanMessagePromptTemplate.from_template(user_message)

prompt_template = ChatPromptTemplate.from_messages([system_message_prompt,human_message_prompt])

# 格式化消息提示
prompt = prompt_template.format_messages(input_language="英文",output_language="中文",text="I Love Large Language Model.")

output = model.invoke(prompt)


## 少量样本提示
# Fewo-shot提示模板
from langchain_core.prompts import FewShotPromptTemplate,FewShotChatMessagePromptTemplate


# 创建一些示例样本，使用字典构建
examples = [
    {"input":"2+2","output":"4","description":"加法运算"},
    {"input":"5-2","output":"3","description":"减法运算"}
]

prompt_template  = "你是一个数学专家，算式：{input} 值: {output} 使用 {description}"

# 提示词模板
prompt_sample = PromptTemplate.from_template(prompt_template)

# 两种赋值的操作 解包
print(prompt_sample.format_prompt(**examples[1]))
print(prompt_sample.format_prompt(input="2+2",output="4",description="加法运算"))

# 构建FewShotPromptTemplate 对象

prompt = FewShotPromptTemplate(
    example=examples, # 示例数组
    example_prompt=prompt_sample, # 提示词模板
    suffix="你是一个数学专家，算式：{input},值：{output}",
    input_variables = ["input","output"]
)

print(prompt.format(input="2*5",output="10")) # 输出 你是一个数学专家,算式: 2*5 值: 10

# 模型调用

model = init_chat_model(model="deepseek:deepseek-chat")
result = model.invoke(prompt.format(input="2*5",output="10"))
print(result.content)


