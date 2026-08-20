import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  try {
    const { message } = await req.json();

    if (!message || !message.text) {
      return new Response("No message", { status: 200 });
    }

    const chatId = message.chat.id;
    const text = message.text;

    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");

    if (!botToken) {
      console.error("Missing TELEGRAM_BOT_TOKEN in Supabase secrets");
      return new Response("Server config error", { status: 500 });
    }

    // Reply Logic
    let replyText = "I am online and working! Ready for booking notifications.";
    if (text === "/start") {
      replyText = "✅ Control X Bot is connected and running 24/7!";
    }

    // Send reply back to user
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: replyText,
      }),
    });

    const data = await res.json();
    if (!data.ok) {
      console.error("Telegram API Error:", data);
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Function Error:", error);
    return new Response("Error", { status: 500 });
  }
});
