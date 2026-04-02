# 导入和还用 WebBaseLoader
from langchain_community.document_loaders import WebBaseLoader
# 0.3版本
# from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_ollama import OllamaEmbeddings
from langchain_core.documents import Document
from dotenv import load_dotenv
import bs4
import os


load_dotenv()


# 如果自己构建文档就是要保持下面这种格式
docs_custom = [
    Document(page_content="北京是中国的首都，也是政治文化中心"),
    Document(page_content="上海市中国的经济中心，金融业发达"),
    Document(page_content="深圳是中国的科技创新城市"),
    Document(page_content="杭州以汉语联网产业著称，是阿里巴巴总部所在地")
]


# 使用bs4.SoupStrainer定向抓取特定区域内容，避免获取无关信息
loader = WebBaseLoader(
    web_path="https://www.gov.cn/zhengce/content/202511/content_7049204.htm",
    # 抓取id = UCAP-CONTENT 的内容
    bs_kwargs=dict(parse_only=bs4.SoupStrainer(id="UCAP-CONTENT"))
)


docs = loader.load()

# print(docs)

# 嵌入模型的选择

embeddings = OllamaEmbeddings(model="nomic-embed-text")

# 使用分割器分割文档 根据文档长度灵活设置chunk_size
text_splitter = RecursiveCharacterTextSplitter(chunk_size=500,chunk_overlap=50)
documents = text_splitter.split_documents(docs)

print(len(documents))

# 向量存储 embedding 会将 documents 中的每个文本片段转换为向量，并将这些向量存储在 FAISS向量数据库中

vector = FAISS.from_documents(docs_custom,embeddings)


# 定义Rag检索工具
from langchain.tools import tool

@tool
def rag_search(query:str) -> str:
    """利用向量库检索并返回向量相关的文档内容"""

    # similarity_search 实现相似度检索 参数k控制返回结果数量 
    res = vector.similarity_search(query,k=1)
    # 循环 把每个文档内容组合成一个字符串
    return "\n\n".join([doc.page_content for doc in res])

# 初始化 LLM
from langchain.chat_models import init_chat_model

model = init_chat_model("deepseek:deepseek-chat")

# 创建Rag
from langchain.agents import create_agent


# 提供背景
system_prompt = """你是一个检索增强问答助手（RAG）。针对用户的问题，如果需要背景知识，请调用 rag_search 工具获取相关文档片段并基于此回答。"""


agent = create_agent(
    model=model,
    tools=[rag_search],
    system_prompt=system_prompt
)

# 使用Rag agent回答问题

user_query = "微信支付火起来的原因？背后的营销手段?"
# user_query = "灾后如何处置？"

ai_res = agent.invoke({
    "messages":[
        {"role":"user","content":user_query}
    ]
})

for message in ai_res['messages']:
    message.pretty_print()