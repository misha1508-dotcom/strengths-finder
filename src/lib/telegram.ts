export interface TelegramNotification {
  type: 'new_analysis' | 'stats_update';
  data: {
    situationsCount?: number;
    sessionId?: string;
    timestamp?: number;
    stats?: {
      totalSessions: number;
      conversionRate: number;
      medianSituations: number;
      medianLength: number;
    };
  };
}

export async function sendTelegramNotification(
  notification: TelegramNotification
): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.warn('Telegram credentials not configured');
    return;
  }

  try {
    let message = '';

    if (notification.type === 'new_analysis') {
      message = `🎯 Новый анализ!\n\n` +
        `📝 Количество ситуаций: ${notification.data.situationsCount}\n` +
        `🔑 Session ID: ${notification.data.sessionId}\n` +
        `⏰ Время: ${new Date(notification.data.timestamp || Date.now()).toLocaleString('ru-RU')}`;
    } else if (notification.type === 'stats_update' && notification.data.stats) {
      const { stats } = notification.data;
      const conversionPercent = (stats.conversionRate * 100).toFixed(1);

      message = `📊 Статистика обновлена\n\n` +
        `👥 Всего сессий: ${stats.totalSessions}\n` +
        `✅ Конверсия в анализ: ${conversionPercent}%\n` +
        `📈 Медиана ситуаций: ${stats.medianSituations}\n` +
        `📏 Медиана длины: ${stats.medianLength} символов`;
    }

    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
  }
}
