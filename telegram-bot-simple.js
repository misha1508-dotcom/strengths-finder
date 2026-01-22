/**
 * Упрощённый Telegram-бот для аналитики
 * Читает данные НАПРЯМУЮ из файла analytics-data.json
 * Не требует запущенного Next.js сервера!
 */

require('dotenv').config({ path: '.env.local' });
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs').promises;
const path = require('path');

const token = process.env.TELEGRAM_BOT_TOKEN;
const ANALYTICS_FILE = path.join(__dirname, 'analytics-data.json');

if (!token) {
  console.error('❌ TELEGRAM_BOT_TOKEN не найден в .env.local');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

console.log('✅ Бот запущен!');
console.log('📊 Читает данные напрямую из analytics-data.json');
console.log('💡 Next.js сервер НЕ требуется для просмотра статистики\n');

// Загрузка данных
async function loadAnalytics() {
  try {
    const data = await fs.readFile(ANALYTICS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { sessions: {}, lastUpdated: Date.now() };
    }
    throw error;
  }
}

// Медиана
function calculateMedian(numbers) {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

// Вычисление статистики
function calculateStats(data) {
  const sessions = Object.values(data.sessions);
  const uniqueVisitors = new Set(sessions.map(s => s.sessionId)).size;

  const funnel = {
    pageViews: 0,
    startedSituation: 0,
    savedSituation: 0,
    completedAnalysis: 0,
    clickedFeathers: 0,
    clickedActivities: 0,
    clickedCopy: 0,
    clickedTelegram: 0,
  };

  const situationCounts = [];
  const situationLengths = [];

  sessions.forEach(session => {
    session.events.forEach(event => {
      switch (event.eventType) {
        case 'page_view': funnel.pageViews++; break;
        case 'situation_started': funnel.startedSituation++; break;
        case 'situation_saved':
          funnel.savedSituation++;
          if (event.data?.situationLength) {
            situationLengths.push(event.data.situationLength);
          }
          break;
        case 'analysis_completed': funnel.completedAnalysis++; break;
        case 'feathers_clicked': funnel.clickedFeathers++; break;
        case 'activities_clicked': funnel.clickedActivities++; break;
        case 'copy_clicked': funnel.clickedCopy++; break;
        case 'telegram_clicked': funnel.clickedTelegram++; break;
      }
    });

    if (session.situations.count > 0) {
      situationCounts.push(session.situations.count);
    }
  });

  return {
    totalSessions: sessions.length,
    uniqueVisitors,
    funnel,
    medianSituations: calculateMedian(situationCounts),
    medianLength: calculateMedian(situationLengths),
    sessions,
  };
}

// Форматирование
const formatNumber = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const formatPercent = (decimal) => (decimal * 100).toFixed(1) + '%';

// /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id,
    '👋 Привет! Я бот аналитики проекта Inversion.\n\n' +
    '📊 Команды:\n' +
    '/stats - общая статистика\n' +
    '/week - статистика за неделю\n' +
    '/funnel - воронка конверсии\n' +
    '/sessions - последние сессии\n' +
    '/refresh - обновить данные\n\n' +
    '💡 Данные читаются напрямую из файла,\n' +
    'Next.js сервер не требуется!'
  );
});

// /stats
bot.onText(/\/stats/, async (msg) => {
  try {
    const data = await loadAnalytics();
    const stats = calculateStats(data);

    if (stats.totalSessions === 0) {
      await bot.sendMessage(msg.chat.id,
        '📭 Данных пока нет.\n\n' +
        '1. Запустите: npm run dev\n' +
        '2. Откройте: http://localhost:3000\n' +
        '3. Пройдите весь путь пользователя'
      );
      return;
    }

    const conversionRate = stats.funnel.pageViews > 0
      ? (stats.funnel.completedAnalysis / stats.funnel.pageViews)
      : 0;

    const message =
      '📊 *Общая статистика*\n\n' +
      `👥 Уникальных посетителей: ${formatNumber(stats.uniqueVisitors)}\n` +
      `📱 Всего сессий: ${formatNumber(stats.totalSessions)}\n` +
      `✅ Завершили анализ: ${formatNumber(stats.funnel.completedAnalysis)}\n` +
      `📈 Конверсия: ${formatPercent(conversionRate)}\n\n` +
      `📝 Медиана ситуаций: ${stats.medianSituations.toFixed(1)}\n` +
      `📏 Медиана длины: ${formatNumber(Math.round(stats.medianLength))} символов`;

    await bot.sendMessage(msg.chat.id, message, { parse_mode: 'Markdown' });
  } catch (error) {
    await bot.sendMessage(msg.chat.id, `❌ Ошибка: ${error.message}`);
  }
});

// /week - статистика за неделю
bot.onText(/\/week/, async (msg) => {
  try {
    const data = await loadAnalytics();
    const allSessions = Object.values(data.sessions);

    // Фильтруем сессии за последние 7 дней
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const weekSessions = allSessions.filter(s => s.startTime >= weekAgo);

    if (weekSessions.length === 0) {
      await bot.sendMessage(msg.chat.id,
        '📭 За последнюю неделю данных нет.\n\n' +
        'Запустите сайт и пройдите анализ.'
      );
      return;
    }

    // Создаём объект с сессиями за неделю
    const weekData = {
      sessions: weekSessions.reduce((acc, s) => {
        acc[s.sessionId] = s;
        return acc;
      }, {}),
      lastUpdated: data.lastUpdated,
    };

    const stats = calculateStats(weekData);

    // Группировка по дням
    const dailyStats = {};
    weekSessions.forEach(session => {
      const date = new Date(session.startTime);
      const dayKey = `${date.getDate()}.${date.getMonth() + 1}`;

      if (!dailyStats[dayKey]) {
        dailyStats[dayKey] = {
          sessions: 0,
          completed: 0,
          situations: [],
        };
      }

      dailyStats[dayKey].sessions++;
      if (session.completedAnalysis) {
        dailyStats[dayKey].completed++;
      }
      if (session.situations.count > 0) {
        dailyStats[dayKey].situations.push(session.situations.count);
      }
    });

    const conversionRate = stats.funnel.pageViews > 0
      ? (stats.funnel.completedAnalysis / stats.funnel.pageViews)
      : 0;

    let message = '📅 *Статистика за неделю*\n';
    message += `(${new Date(weekAgo).toLocaleDateString('ru-RU')} - ${new Date().toLocaleDateString('ru-RU')})\n\n`;

    message += '📊 *Общие показатели:*\n';
    message += `👥 Уникальных посетителей: ${formatNumber(stats.uniqueVisitors)}\n`;
    message += `📱 Всего сессий: ${formatNumber(stats.totalSessions)}\n`;
    message += `✅ Завершили анализ: ${formatNumber(stats.funnel.completedAnalysis)}\n`;
    message += `📈 Конверсия: ${formatPercent(conversionRate)}\n\n`;

    message += '📝 *Ситуации:*\n';
    message += `Всего выписано: ${formatNumber(stats.funnel.savedSituation)}\n`;
    message += `Медиана на пользователя: ${stats.medianSituations.toFixed(1)}\n`;
    message += `Медиана длины: ${formatNumber(Math.round(stats.medianLength))} символов\n\n`;

    message += '🔄 *Воронка за неделю:*\n';
    message += `Зашли: ${stats.funnel.pageViews} → `;
    message += `Начали: ${stats.funnel.startedSituation} → `;
    message += `Анализ: ${stats.funnel.completedAnalysis}\n\n`;

    // Статистика по дням
    const sortedDays = Object.keys(dailyStats).sort((a, b) => {
      const [dayA, monthA] = a.split('.').map(Number);
      const [dayB, monthB] = b.split('.').map(Number);
      return (monthA * 100 + dayA) - (monthB * 100 + dayB);
    });

    if (sortedDays.length > 0) {
      message += '📆 *По дням:*\n';
      sortedDays.forEach(day => {
        const stat = dailyStats[day];
        const avgSituations = stat.situations.length > 0
          ? (stat.situations.reduce((a, b) => a + b, 0) / stat.situations.length).toFixed(1)
          : '0';
        message += `${day}: ${stat.sessions} сессий, ${stat.completed} завершили`;
        if (stat.situations.length > 0) {
          message += `, ~${avgSituations} ситуаций`;
        }
        message += '\n';
      });
    }

    await bot.sendMessage(msg.chat.id, message, { parse_mode: 'Markdown' });
  } catch (error) {
    await bot.sendMessage(msg.chat.id, `❌ Ошибка: ${error.message}`);
  }
});

// /funnel
bot.onText(/\/funnel/, async (msg) => {
  try {
    const data = await loadAnalytics();
    const stats = calculateStats(data);

    if (stats.totalSessions === 0) {
      await bot.sendMessage(msg.chat.id, '📭 Данных пока нет.');
      return;
    }

    const f = stats.funnel;
    const conv1 = f.pageViews > 0 ? (f.startedSituation / f.pageViews) : 0;
    const conv2 = f.startedSituation > 0 ? (f.savedSituation / f.startedSituation) : 0;
    const conv3 = f.savedSituation > 0 ? (f.completedAnalysis / f.savedSituation) : 0;
    const conv4 = f.completedAnalysis > 0 ? (f.clickedFeathers / f.completedAnalysis) : 0;
    const conv5 = f.clickedFeathers > 0 ? (f.clickedCopy / f.clickedFeathers) : 0;
    const conv6 = f.completedAnalysis > 0 ? (f.clickedTelegram / f.completedAnalysis) : 0;

    const message =
      '🔄 *Воронка конверсии*\n\n' +
      `1️⃣ Зашли на сайт: ${formatNumber(f.pageViews)}\n` +
      `   ↓ ${formatPercent(conv1)}\n` +
      `2️⃣ Начали писать: ${formatNumber(f.startedSituation)}\n` +
      `   ↓ ${formatPercent(conv2)}\n` +
      `3️⃣ Сохранили ситуацию: ${formatNumber(f.savedSituation)}\n` +
      `   ↓ ${formatPercent(conv3)}\n` +
      `4️⃣ Завершили анализ: ${formatNumber(f.completedAnalysis)}\n` +
      `   ↓ ${formatPercent(conv4)}\n` +
      `5️⃣ Нажали на пёрышки: ${formatNumber(f.clickedFeathers)}\n` +
      `   ↓ ${formatPercent(conv5)}\n` +
      `6️⃣ Скопировали данные: ${formatNumber(f.clickedCopy)}\n\n` +
      `💬 Перешли в Telegram: ${formatNumber(f.clickedTelegram)} (${formatPercent(conv6)})`;

    await bot.sendMessage(msg.chat.id, message, { parse_mode: 'Markdown' });
  } catch (error) {
    await bot.sendMessage(msg.chat.id, `❌ Ошибка: ${error.message}`);
  }
});

// /sessions
bot.onText(/\/sessions/, async (msg) => {
  try {
    const data = await loadAnalytics();
    const stats = calculateStats(data);

    if (stats.sessions.length === 0) {
      await bot.sendMessage(msg.chat.id, '📭 Сессий пока нет.');
      return;
    }

    const sessions = stats.sessions
      .sort((a, b) => b.startTime - a.startTime)
      .slice(0, 10);

    let message = '📋 *Последние 10 сессий*\n\n';

    sessions.forEach((session, index) => {
      const date = new Date(session.startTime).toLocaleString('ru-RU');
      const completed = session.completedAnalysis ? '✅' : '❌';
      message += `${index + 1}. ${completed} ${date}\n`;
      message += `   Ситуаций: ${session.situations.count}\n`;
      if (session.situations.lengths.length > 0) {
        const median = calculateMedian(session.situations.lengths);
        message += `   Медиана длины: ${Math.round(median)} симв.\n`;
      }
      message += '\n';
    });

    await bot.sendMessage(msg.chat.id, message, { parse_mode: 'Markdown' });
  } catch (error) {
    await bot.sendMessage(msg.chat.id, `❌ Ошибка: ${error.message}`);
  }
});

// /refresh
bot.onText(/\/refresh/, async (msg) => {
  await bot.sendMessage(msg.chat.id, '🔄 Данные обновлены! Используйте /stats');
});

bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

console.log('📝 Отправьте боту /start для начала работы');
