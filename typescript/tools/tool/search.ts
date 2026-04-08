import { tool } from "@langchain/core/tools";
import { z } from "zod/v4";

// 搜索工具的入参
const schema = z.object({
  query: z.string().describe("搜索关键词"),
});

export type SearchInput = z.infer<typeof schema>;

type SerpOrganicResult = {
  title?: string;
  snippet?: string;
  link?: string;
  result?: string;
};

type SerpResponse = {
  organic_results?: SerpOrganicResult[];
};

export function formatSearchResult(result: SerpOrganicResult | undefined): string {
  if (!result) {
    return "没有可用的搜索结果";
  }

  if (typeof result.result === "string" && result.result.trim()) {
    return result.result;
  }

  // SerpAPI 的 organic_results 通常是 title/snippet/link 结构，不一定有 result 字段
  const lines = [
    result.title ? `标题：${result.title}` : "",
    result.snippet ? `摘要：${result.snippet}` : "",
    result.link ? `链接：${result.link}` : "",
  ].filter(Boolean);

  return lines.length > 0 ? lines.join("\n") : "没有可用的搜索结果";
}

const func = async ({ query }: SearchInput): Promise<string> => {
  console.log(`正在调用工具 [search] 进行搜索，搜索的关键词为：${query}`);

  // 这里接的是 SerpAPI
  const baseUrl = "https://serpapi.com/search.json";
  const apiKey = process.env.SERPAPI_API_KEY ?? process.env.SERPER_API_KEY;

  if (!apiKey) {
    throw new Error("缺少 SERPAPI_API_KEY 或 SERPER_API_KEY");
  }

  const params = new URLSearchParams({
    engine: "google",
    q: query,
    api_key: apiKey,
    gl: "cn",
    hl: "zh-cn",
  });

  try {
    const response = await fetch(`${baseUrl}?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`搜索失败，状态码：${response.status}`);
    }

    const json = (await response.json()) as SerpResponse;
    const firstResult = json.organic_results?.[0];

    if (!firstResult) {
      return "没有搜索到相关结果";
    }

    return formatSearchResult(firstResult);
  } catch (error) {
    console.error("Search 工具执行失败：", error);
    return "搜索失败";
  }
};

const search = tool(func, {
  name: "search",
  description: "根据关键词搜索互联网信息，并返回首条结果的摘要内容。",
  schema,
});

export default search;
