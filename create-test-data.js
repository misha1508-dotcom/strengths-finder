/**
 * Создание тестовых данных для проверки аналитики
 */

const fs = require('fs').promises;
const path = require('path');

const ANALYTICS_FILE = path.join(__dirname, 'analytics-data.json');

async function createTestData() {
  const testData = {
    sessions: {
      'session_test_1': {
        sessionId: 'session_test_1',
        startTime: Date.now() - 3600000,
        events: [
          { eventType: 'page_view', timestamp: Date.now() - 3600000, sessionId: 'session_test_1' },
          { eventType: 'situation_started', timestamp: Date.now() - 3500000, sessionId: 'session_test_1' },
          {
            eventType: 'situation_saved',
            timestamp: Date.now() - 3400000,
            sessionId: 'session_test_1',
            data: { situationIndex: 0, situationLength: 150, situationsCount: 1 }
          },
          {
            eventType: 'situation_saved',
            timestamp: Date.now() - 3300000,
            sessionId: 'session_test_1',
            data: { situationIndex: 1, situationLength: 200, situationsCount: 2 }
          },
          {
            eventType: 'situation_saved',
            timestamp: Date.now() - 3200000,
            sessionId: 'session_test_1',
            data: { situationIndex: 2, situationLength: 180, situationsCount: 3 }
          },
          {
            eventType: 'analysis_started',
            timestamp: Date.now() - 3100000,
            sessionId: 'session_test_1',
            data: { situationsCount: 3 }
          },
          {
            eventType: 'analysis_completed',
            timestamp: Date.now() - 3000000,
            sessionId: 'session_test_1',
            data: { situationsCount: 3 }
          },
          { eventType: 'feathers_clicked', timestamp: Date.now() - 2900000, sessionId: 'session_test_1' },
          { eventType: 'activities_clicked', timestamp: Date.now() - 2800000, sessionId: 'session_test_1' },
          { eventType: 'copy_clicked', timestamp: Date.now() - 2700000, sessionId: 'session_test_1' },
        ],
        situations: {
          count: 3,
          lengths: [150, 200, 180],
        },
        completedAnalysis: true,
      },
      'session_test_2': {
        sessionId: 'session_test_2',
        startTime: Date.now() - 1800000,
        events: [
          { eventType: 'page_view', timestamp: Date.now() - 1800000, sessionId: 'session_test_2' },
          { eventType: 'situation_started', timestamp: Date.now() - 1700000, sessionId: 'session_test_2' },
          {
            eventType: 'situation_saved',
            timestamp: Date.now() - 1600000,
            sessionId: 'session_test_2',
            data: { situationIndex: 0, situationLength: 120, situationsCount: 1 }
          },
          {
            eventType: 'situation_saved',
            timestamp: Date.now() - 1500000,
            sessionId: 'session_test_2',
            data: { situationIndex: 1, situationLength: 160, situationsCount: 2 }
          },
          {
            eventType: 'analysis_started',
            timestamp: Date.now() - 1400000,
            sessionId: 'session_test_2',
            data: { situationsCount: 2 }
          },
          {
            eventType: 'analysis_completed',
            timestamp: Date.now() - 1300000,
            sessionId: 'session_test_2',
            data: { situationsCount: 2 }
          },
          { eventType: 'feathers_clicked', timestamp: Date.now() - 1200000, sessionId: 'session_test_2' },
          { eventType: 'telegram_clicked', timestamp: Date.now() - 1100000, sessionId: 'session_test_2' },
        ],
        situations: {
          count: 2,
          lengths: [120, 160],
        },
        completedAnalysis: true,
      },
      'session_test_3': {
        sessionId: 'session_test_3',
        startTime: Date.now() - 900000,
        events: [
          { eventType: 'page_view', timestamp: Date.now() - 900000, sessionId: 'session_test_3' },
          { eventType: 'situation_started', timestamp: Date.now() - 800000, sessionId: 'session_test_3' },
        ],
        situations: {
          count: 0,
          lengths: [],
        },
        completedAnalysis: false,
      },
    },
    lastUpdated: Date.now(),
  };

  await fs.writeFile(ANALYTICS_FILE, JSON.stringify(testData, null, 2));
  console.log('✅ Тестовые данные созданы в analytics-data.json');
  console.log('\n📊 Статистика:');
  console.log('   3 сессии');
  console.log('   2 завершили анализ');
  console.log('   Медиана ситуаций: 2.5');
  console.log('   Медиана длины: 160 символов');
  console.log('\n💡 Теперь попробуйте команды бота:');
  console.log('   /stats');
  console.log('   /funnel');
  console.log('   /sessions');
}

createTestData();
