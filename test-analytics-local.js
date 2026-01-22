/**
 * Тестовый скрипт для проверки API аналитики локально (без Next.js)
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs').promises;
const path = require('path');

const ANALYTICS_FILE = path.join(__dirname, 'analytics-data.json');

async function loadAnalyticsData() {
  try {
    const data = await fs.readFile(ANALYTICS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { sessions: {}, lastUpdated: Date.now() };
  }
}

function calculateMedian(numbers) {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

function calculateAggregatedStats(data) {
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
        case 'page_view':
          funnel.pageViews++;
          break;
        case 'situation_started':
          funnel.startedSituation++;
          break;
        case 'situation_saved':
          funnel.savedSituation++;
          if (event.data?.situationLength) {
            situationLengths.push(event.data.situationLength);
          }
          break;
        case 'analysis_completed':
          funnel.completedAnalysis++;
          break;
        case 'feathers_clicked':
          funnel.clickedFeathers++;
          break;
        case 'activities_clicked':
          funnel.clickedActivities++;
          break;
        case 'copy_clicked':
          funnel.clickedCopy++;
          break;
        case 'telegram_clicked':
          funnel.clickedTelegram++;
          break;
      }
    });

    if (session.situations.count > 0) {
      situationCounts.push(session.situations.count);
    }
  });

  return {
    totalSessions: sessions.length,
    uniqueVisitors,
    conversionFunnel: funnel,
    medianSituationsPerUser: calculateMedian(situationCounts),
    medianSituationLength: calculateMedian(situationLengths),
  };
}

async function main() {
  console.log('🔍 Проверка аналитики...\n');

  try {
    // Проверка файла
    const data = await loadAnalyticsData();
    console.log('✅ Файл analytics-data.json загружен');
    console.log(`📊 Всего сессий: ${Object.keys(data.sessions).length}\n`);

    if (Object.keys(data.sessions).length === 0) {
      console.log('⚠️  Нет данных. Пройдите весь путь на сайте чтобы создать данные.');
      return;
    }

    // Вычисление статистики
    const stats = calculateAggregatedStats(data);

    console.log('📈 Статистика:');
    console.log(`   Уникальных посетителей: ${stats.uniqueVisitors}`);
    console.log(`   Всего сессий: ${stats.totalSessions}`);
    console.log(`   Завершили анализ: ${stats.conversionFunnel.completedAnalysis}`);
    console.log(`   Медиана ситуаций: ${stats.medianSituationsPerUser.toFixed(1)}`);
    console.log(`   Медиана длины: ${Math.round(stats.medianSituationLength)} символов`);

    console.log('\n🔄 Воронка:');
    console.log(`   1. Зашли на сайт: ${stats.conversionFunnel.pageViews}`);
    console.log(`   2. Начали писать: ${stats.conversionFunnel.startedSituation}`);
    console.log(`   3. Сохранили ситуацию: ${stats.conversionFunnel.savedSituation}`);
    console.log(`   4. Завершили анализ: ${stats.conversionFunnel.completedAnalysis}`);
    console.log(`   5. Нажали на пёрышки: ${stats.conversionFunnel.clickedFeathers}`);
    console.log(`   6. Скопировали данные: ${stats.conversionFunnel.clickedCopy}`);
    console.log(`   7. Перешли в Telegram: ${stats.conversionFunnel.clickedTelegram}`);

    console.log('\n✅ Всё работает!');
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

main();
