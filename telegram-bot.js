/**
 * Telegram-бот для просмотра аналитики проекта Inversion
 *
 * Установка зависимостей:
 * npm install node-telegram-bot-api dotenv
 *
 * Запуск:
 * node telegram-bot.js
 */

require('dotenv').config({ path: '.env.local' });
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_BOT_TOKEN;
const analyticsUrl = process.env.ANALYTICS_URL || 'http://localhost:3000/api/analytics';
const analyticsKey = process.env.ANALYTICS_SECRET_KEY;

if (!token) {
  console.error('TELEGRAM_BOT_TOKEN не найден в .env.local');
  process.exit(1);
}

if (!analyticsKey) {
  console.error('ANALYTICS_SECRET_KEY не найден в .env.local');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

console.log('Бот запущен и ожидает команды...');

// Функция для получения статистики
async function getAnalytics() {
  try {
    const response = await fetch(`${analyticsUrl}?key=${encodeURIComponent(analyticsKey)}`);
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    if (error.cause?.code === 'ECONNREFUSED') {
      throw new Error('Next.js сервер не запущен. Запустите: npm run dev');
    }
    console.error('Ошибка получения аналитики:', error);
    throw error;
  }
}

// Форматирование числа с разделителями
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// Форматирование процента
function formatPercent(decimal) {
  return (decimal * 100).toFixed(1) + '%';
}

// Команда /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId,
    '👋 Привет! Я бот для мониторинга аналитики проекта Inversion.\n\n' +
    'Доступные команды:\n' +
    '/stats - показать общую статистику\n' +
    '/funnel - показать воронку конверсии\n' +
    '/sessions - последние сессии\n' +
    '/help - показать эту справку'
  );
});

// Команда /help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId,
    '📊 Команды бота:\n\n' +
    '/stats - Общая статистика (уники, сессии, медианы)\n' +
    '/funnel - Воронка конверсии по этапам\n' +
    '/sessions - Последние 10 сессий\n' +
    '/refresh - Обновить данные\n\n' +
    'Бот автоматически отправляет уведомления о новых анализах.'
  );
});

// Команда /stats - общая статистика
bot.onText(/\/stats/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    await bot.sendMessage(chatId, '⏳ Загружаю статистику...');

    const data = await getAnalytics();
    const { aggregated } = data;

    const conversionRate = aggregated.conversionFunnel.completedAnalysis > 0
      ? (aggregated.conversionFunnel.completedAnalysis / aggregated.conversionFunnel.pageViews)
      : 0;

    const message =
      '📊 **Общая статистика**\n\n' +
      `👥 Уникальных посетителей: ${formatNumber(aggregated.uniqueVisitors)}\n` +
      `📱 Всего сессий: ${formatNumber(aggregated.totalSessions)}\n` +
      `✅ Завершили анализ: ${formatNumber(aggregated.conversionFunnel.completedAnalysis)}\n` +
      `📈 Конверсия: ${formatPercent(conversionRate)}\n\n` +
      `📝 Медиана ситуаций на пользователя: ${aggregated.medianSituationsPerUser.toFixed(1)}\n` +
      `📏 Медиана длины ситуации: ${formatNumber(Math.round(aggregated.medianSituationLength))} символов`;

    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    const errorMsg = error.message.includes('Next.js сервер не запущен')
      ? '❌ Next.js сервер не запущен.\n\nЗапустите в отдельном терминале:\n`npm run dev`'
      : `❌ Ошибка: ${error.message}`;
    await bot.sendMessage(chatId, errorMsg);
  }
});

// Команда /funnel - воронка конверсии
bot.onText(/\/funnel/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    await bot.sendMessage(chatId, '⏳ Загружаю воронку...');

    const data = await getAnalytics();
    const { funnel } = data.aggregated.conversionFunnel;
    const f = data.aggregated.conversionFunnel;

    // Расчет конверсий между этапами
    const conv1 = f.pageViews > 0 ? (f.startedSituation / f.pageViews) : 0;
    const conv2 = f.startedSituation > 0 ? (f.savedSituation / f.startedSituation) : 0;
    const conv3 = f.savedSituation > 0 ? (f.completedAnalysis / f.savedSituation) : 0;
    const conv4 = f.completedAnalysis > 0 ? (f.clickedFeathers / f.completedAnalysis) : 0;
    const conv5 = f.clickedFeathers > 0 ? (f.clickedCopy / f.clickedFeathers) : 0;
    const conv6 = f.completedAnalysis > 0 ? (f.clickedTelegram / f.completedAnalysis) : 0;

    const message =
      '🔄 **Воронка конверсии**\n\n' +
      `1️⃣ Зашли на сайт: ${formatNumber(f.pageViews)}\n` +
      `   ↓ ${formatPercent(conv1)}\n` +
      `2️⃣ Начали писать: ${formatNumber(f.startedSituation)}\n` +
      `   ↓ ${formatPercent(conv2)}\n` +
      `3️⃣ Сохранили ситуацию: ${formatNumber(f.savedSituation)}\n` +
      `   ↓ ${formatPercent(conv3)}\n` +
      `4️⃣ Отправили на анализ: ${formatNumber(f.completedAnalysis)}\n` +
      `   ↓ ${formatPercent(conv4)}\n` +
      `5️⃣ Нажали на пёрышки: ${formatNumber(f.clickedFeathers)}\n` +
      `   ↓ ${formatPercent(conv5)}\n` +
      `6️⃣ Скопировали данные: ${formatNumber(f.clickedCopy)}\n\n` +
      `💬 Перешли в Telegram: ${formatNumber(f.clickedTelegram)} (${formatPercent(conv6)})`;

    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    const errorMsg = error.message.includes('Next.js сервер не запущен')
      ? '❌ Next.js сервер не запущен.\n\nЗапустите в отдельном терминале:\n`npm run dev`'
      : `❌ Ошибка: ${error.message}`;
    await bot.sendMessage(chatId, errorMsg);
  }
});

// Команда /sessions - последние сессии
bot.onText(/\/sessions/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    await bot.sendMessage(chatId, '⏳ Загружаю сессии...');

    const data = await getAnalytics();
    const sessions = data.sessions
      .sort((a, b) => b.startTime - a.startTime)
      .slice(0, 10);

    if (sessions.length === 0) {
      await bot.sendMessage(chatId, '📭 Пока нет сессий.');
      return;
    }

    let message = '📋 **Последние 10 сессий**\n\n';

    sessions.forEach((session, index) => {
      const date = new Date(session.startTime).toLocaleString('ru-RU');
      const completed = session.completedAnalysis ? '✅' : '❌';
      message += `${index + 1}. ${completed} ${date}\n`;
      message += `   Ситуаций: ${session.situations.count}\n`;
      if (session.situations.medianLength) {
        message += `   Медиана длины: ${Math.round(session.situations.medianLength)} симв.\n`;
      }
      message += '\n';
    });

    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    const errorMsg = error.message.includes('Next.js сервер не запущен')
      ? '❌ Next.js сервер не запущен.\n\nЗапустите в отдельном терминале:\n`npm run dev`'
      : `❌ Ошибка: ${error.message}`;
    await bot.sendMessage(chatId, errorMsg);
  }
});

// Обработка ошибок
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

console.log('✅ Бот успешно запущен!');
console.log('📝 Отправьте боту команду /start для начала работы');
