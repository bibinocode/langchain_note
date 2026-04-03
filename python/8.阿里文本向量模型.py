import os
from langchain_community.embeddings import DashScopeEmbeddings
from dotenv import load_dotenv

load_dotenv()

# 千问embedding-v4
embedding = DashScopeEmbeddings(model="text-embedding-v4",dashscope_api_key=os.getenv("DASGSCOPE_API_KEY"))

text = "This is a test query."

# 嵌入文档
docs_result = embedding.embed_documents([text])

print(docs_result[0][:5])

# 嵌入查询
query_result = embedding.embed_query(text)