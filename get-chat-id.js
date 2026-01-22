/**
 * Скрипт для получения Chat ID
 *
 * Инструкция:
 * 1. Отправьте вашему боту любое сообщение в Telegram
 * 2. Запустите: node get-chat-id.js
 * 3. Скопируйте Chat ID из вывода
 */

// Загружаем переменные из .env.local
require('dotenv').config({ path: '.env.local' });

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'your-telegram-bot-token';

async function getChatId() {
  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`);
    const data = await response.json();

    if (!data.ok) {
      console.error('❌ Ошибка:', data.description);
      return;
    }

    if (data.result.length === 0) {
      console.log('⚠️  Обновлений нет. Отправьте боту любое сообщение и попробуйте снова.');
      return;
    }

    console.log('✅ Найдены сообщения!\n');

    data.result.forEach((update, index) => {
      if (update.message) {
        const chatId = update.message.chat.id;
        const username = update.message.chat.username || 'не указан';
        const firstName = update.message.chat.first_name || '';
        const text = update.message.text || '';

        console.log(`Сообщение ${index + 1}:`);
        console.log(`  Chat ID: ${chatId}`);
        console.log(`  Username: @${username}`);
        console.log(`  Имя: ${firstName}`);
        console.log(`  Текст: "${text}"`);
        console.log('');
      }
    });

    const lastChatId = data.result[data.result.length - 1].message?.chat?.id;
    if (lastChatId) {
      console.log(`\n📋 Ваш Chat ID: ${lastChatId}`);
      console.log('\nДобавьте эту строку в ваш .env.local файл:');
      console.log(`TELEGRAM_CHAT_ID=${lastChatId}`);
    }
  } catch (error) {
    console.error('❌ Ошибка при получении Chat ID:', error.message);
  }
}

getChatId();
