import { serve } from "https://deno.land/std@0.218.2/http/server.ts";

// 从环境变量中获取你的 Groq API 密钥
const groqApiKey = Deno.env.get("GROQ_API_KEY");
if (!groqApiKey) {
    console.error("Error: GROQ_API_KEY environment variable is not set.");
    Deno.exit(1); // 退出程序并报错
}

const groqApiEndpoint = "https://api.groq.com/v1"; // Groq API 的基础 endpoint

console.log("Deno Groq API Proxy Server started on Deno Deploy");

serve(async (req) => {
    const url = new URL(req.url);
    const pathname = url.pathname;
    const searchParams = url.searchParams;

    // 构建目标 Groq API 的 URL
    const targetUrl = `${groqApiEndpoint}${pathname}${searchParams ? `?${searchParams.toString()}` : ""}`;

    const headers = new Headers(req.headers);
    headers.set("Authorization", `Bearer ${groqApiKey}`); // 添加 Groq API 密钥
    headers.delete("Host"); // 删除 Host 头，防止影响转发

    // 转发请求到 Groq API
    try {
        const groqResponse = await fetch(targetUrl, {
            method: req.method,
            headers: headers,
            body: req.body, // 转发请求体
            redirect: 'manual', //  防止自动重定向，保持原样
        });

        // 构造返回给客户端的 Response
        const responseHeaders = new Headers(groqResponse.headers);
        // 移除一些可能不希望转发的头部，例如 'connection' 等
        responseHeaders.delete('connection');
        responseHeaders.delete('keep-alive');

        return new Response(groqResponse.body, {
            status: groqResponse.status,
            statusText: groqResponse.statusText,
            headers: responseHeaders,
        });

    } catch (error) {
        console.error("Error forwarding request to Groq API:", error);
        return new Response("Error forwarding request to Groq API", { status: 500 });
    }
});
