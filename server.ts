// server.ts
import { serve } from "https://deno.land/std/http/server.ts";

const GROQ_API_URL = "https://api.groq.com/openai/v1"; // Groq API 的基础 URL
const API_KEY = Deno.env.get("GROQ_API_KEY"); // 从环境变量获取 API Key

serve(async (req) => {
  const url = new URL(req.url);
  const path = url.pathname; // 获取请求路径

  // 只处理以 /groq 开头的请求
  if (!path.startsWith("/groq")) {
    return new Response("Not Found", { status: 404 });
  }

  // 构建目标 URL，去掉 /groq 前缀
  const targetPath = path.replace("/groq", "");
  const targetUrl = `${GROQ_API_URL}${targetPath}${url.search}`;

  try {
    // 复制请求头并添加 Groq API Key
    const headers = new Headers(req.headers);
    headers.set("Authorization", `Bearer ${API_KEY}`);
    headers.set("Content-Type", "application/json");

    // 转发请求到 Groq API
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: req.body,
    });

    // 返回 Groq API 的响应
    return new Response(response.body, {
      status: response.status,
      headers: response.headers,
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
});
