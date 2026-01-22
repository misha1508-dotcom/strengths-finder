/**
 * Тест отправки уведомления в Telegram
 */

require('dotenv').config({ path: '.env.local' });

async function testNotification() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error('❌ Не найдены TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID в .env.local');
    return;
  }

  console.log('📤 Отправка тестового уведомления...');
  console.log(`Bot Token: ${botToken.substring(0, 15)}...`);
  console.log(`Chat ID: ${chatId}`);

  const message = `🎯 Новый анализ!\n\n` +
    `📝 Количество ситуаций: 3\n` +
    `🔑 Session ID: test_session_${Date.now()}\n` +
    `⏰ Время: ${new Date().toLocaleString('ru-RU')}`;

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
        }),
      }
    );

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Уведомление отправлено успешно!');
      console.log('📱 Проверьте Telegram - должно прийти сообщение');
    } else {
      console.error('❌ Ошибка отправки:', result);
    }
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

testNotification();
