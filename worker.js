export default {
  async fetch(request, env) {

    // Cho phép trình duyệt CHEP gọi Worker
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }

    if (request.method !== "POST") {
      return new Response("CHEP AI Server đang hoạt động 🤖", {
        headers: {
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    try {
      const body = await request.json();
      const message = body.message;

      if (!message) {
        return new Response(
          JSON.stringify({ error: "Không có tin nhắn." }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          }
        );
      }

      const response = await fetch(
        "https://api.openai.com/v1/responses",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: "gpt-5",
            instructions:
              "Bạn là CHEP AI, một trợ lý thân thiện. Hãy trả lời bằng tiếng Việt, rõ ràng, tự nhiên và hữu ích.",
            input: message
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return new Response(
          JSON.stringify({
            error: data.error?.message || "OpenAI API gặp lỗi."
          }),
          {
            status: response.status,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          }
        );
      }

      return new Response(
        JSON.stringify({
          reply: data.output_text || "CHEP chưa nhận được câu trả lời."
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );

    } catch (error) {

      return new Response(
        JSON.stringify({
          error: "Lỗi máy chủ CHEP: " + error.message
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
    }
  }
};
