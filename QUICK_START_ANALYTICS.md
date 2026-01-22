# Быстрый старт - Аналитика Inversion

## Шаг 1: Получите Chat ID

1. Откройте Telegram и найдите своего бота
2. Отправьте боту любое сообщение (например, "привет")
3. В терминале выполните:
   ```bash
   cd "/Users/mihailmirosnicenko/Desktop/vibe projects/inversion"
   node get-chat-id.js
   ```
4. Скопируйте Chat ID из вывода

## Шаг 2: Настройте .env.local

Создайте или обновите файл `.env.local` в папке `inversion`:

```env
# Существующие ключи (возьмите из корневого .env файла)
ANTHROPIC_API_KEY=your-anthropic-api-key
OPENROUTER_API_KEY=your-openrouter-api-key

# Telegram Bot (добавьте эти строки)
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_CHAT_ID=ВАШ_CHAT_ID_ИЗ_ШАГА_1

# Analytics Secret Key
ANALYTICS_SECRET_KEY=your-analytics-secret-key
```

## Шаг 3: Установите зависимости для бота

```bash
cd "/Users/mihailmirosnicenko/Desktop/vibe projects/inversion"
npm install node-telegram-bot-api
```

## Шаг 4: Запустите проект

В одном терминале запустите Next.js приложение:
```bash
cd "/Users/mihailmirosnicenko/Desktop/vibe projects/inversion"
npm run dev
```

В другом терминале запустите Telegram-бота:
```bash
cd "/Users/mihailmirosnicenko/Desktop/vibe projects/inversion"
node telegram-bot.js
```

## Шаг 5: Проверьте работу

1. Откройте http://localhost:3000 в браузере
2. Пройдите весь процесс (выпишите ситуации, отправьте на анализ)
3. В Telegram вам придёт уведомление о новом анализе
4. Отправьте боту команду `/stats` для просмотра статистики

## Команды Telegram-бота

- `/start` - запустить бота
- `/stats` - общая статистика
- `/funnel` - воронка конверсии
- `/sessions` - последние сессии

## Что отслеживается

### События:
1. Зашёл на сайт (page_view)
2. Начал писать ситуации (situation_started)
3. Сохранил ситуацию (situation_saved)
4. Отправил на анализ (analysis_started)
5. Анализ завершён (analysis_completed) → **отправляется уведомление в Telegram**
6. Нажал на пёрышки (feathers_clicked)
7. Загрузились активности (activities_clicked)
8. Скопировал данные (copy_clicked)
9. Перешёл в Telegram (telegram_clicked)

### Метрики:
- Уникальные посетители
- Конверсия по каждому этапу
- Медианное количество ситуаций на пользователя
- Медианная длина ситуации в символах

## Troubleshooting

### "Обновлений нет" при запуске get-chat-id.js
→ Отправьте боту сообщение в Telegram и попробуйте снова

### Бот не отвечает на команды
→ Проверьте правильность TELEGRAM_BOT_TOKEN в .env.local
→ Убедитесь что бот запущен (node telegram-bot.js)

### Не приходят уведомления
→ Проверьте TELEGRAM_CHAT_ID в .env.local
→ Убедитесь что оба сервера запущены (npm run dev и node telegram-bot.js)

### Ошибка "Unauthorized" при /stats
→ Проверьте ANALYTICS_SECRET_KEY в .env.local бота

## Для production на Vercel

1. Добавьте переменные окружения в Vercel:
   - TELEGRAM_BOT_TOKEN
   - TELEGRAM_CHAT_ID
   - ANALYTICS_SECRET_KEY

2. Запустите Telegram-бота на отдельном сервере с переменной:
   ```env
   ANALYTICS_URL=https://ваш-проект.vercel.app/api/analytics
   ```
