require('dotenv').config({ path: '.env.local' });

const token = process.env.TELEGRAM_BOT_TOKEN;
const rawChatId = process.env.TELEGRAM_CHAT_ID;

async function testBot() {
  console.log("Testing Telegram Bot...");
  console.log("Token loaded:", !!token);
  console.log("Raw Chat IDs:", rawChatId);

  if (!token || !rawChatId) {
    console.error("❌ Missing token or chat ID in .env.local");
    return;
  }

  if (token.includes('your_') || token.trim() === '') {
    console.error("❌ TELEGRAM_BOT_TOKEN is still set to placeholder value in .env.local!");
    return;
  }

  const chatIds = rawChatId.split(',').map((id) => id.trim()).filter(Boolean);

  const istTime = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const message = `✅ *Control X Test: Telegram Bot Connected*\n\n*Time:* ${istTime}\n*Status:* Online & Operational`;

  for (const id of chatIds) {
    console.log(`Sending test notification to Chat ID: ${id}...`);
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: id,
          text: message,
          parse_mode: 'Markdown',
        }),
      });

      const data = await res.json();
      if (data.ok) {
        console.log(`✅ SUCCESS for Chat ID ${id}! Message ID: ${data.result.message_id}`);
      } else {
        console.error(`❌ FAILED for Chat ID ${id}! Telegram error:`, data);
      }
    } catch (error) {
      console.error(`❌ NETWORK ERROR for Chat ID ${id}:`, error);
    }
  }
}

testBot();
