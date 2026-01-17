# Changelog - Strengths Finder

## Домен
**Production:** https://krechet.space

## API Ключи
Файл: `.env.local` (не коммитится в git)
- `OPENROUTER_API_KEY` - ключ OpenRouter (используется)
- `ANTHROPIC_API_KEY` - legacy, не используется
- `VERCEL_OIDC_TOKEN` - токен Vercel

---

## [v2.0] - 2026-01-17 13:16
**Коммит:** `e969f4c`

### Экономия токенов (~30-40%)
- Создан объединённый endpoint `feathersAndActivities` - вместо 2 запросов к AI делается 1
- Убрана кнопка "Пойти ещё дальше" - всё загружается сразу

### Безопасность
- Добавлен rate limiting (10 запросов в минуту на IP)
- Удалена неиспользуемая зависимость `@anthropic-ai/sdk`

### SEO и маркетинг
- Новый title: "Найди свои сильные стороны | Бесплатный AI-анализ личности"
- Добавлены Open Graph теги для шаринга в соцсетях
- Добавлены Twitter Card теги
- Добавлены keywords, author, robots meta tags

### Error handling
- Ошибки при получении рекомендаций теперь показываются пользователю

### Производительность
- Добавлен `useMemo` для `generatedPrompt`
- Добавлен `useCallback` для `handleCopyPrompt`

### UX
- Переработан блок обратной связи - большая кнопка Telegram с иконкой
- Призыв написать отзыв

### Дизайн
- Анимации: `stagger-fade-in`, `slide-up`, `scale-in`
- `hover-lift` эффект на карточки ролей
- Gradient заголовок на странице результатов
- Анимация progress bars в рейтинге качеств
- Glass эффект (доступен для использования)

---

## [v1.0] - 2026-01-17 12:54
**Коммит:** `e0c43ec`

### Стабильная версия
- Полный flow: intro → input → processing → results
- Анализ качеств из ситуаций
- Пёрышки-противовесы (3 категории + уникальные действия)
- Роли где будет легко
- Советы по капитализации качеств
- Знаменитости с похожим типом
- Хобби для души
- Копирование промпта для ChatGPT/Claude
- Donation button (YooMoney)

---

## [Ранние версии] - 2026-01-17

### `26742df` - 12:20
- Редизайн: упрощённые feathers, роли с фокусом на психологию, советы по капитализации

### `2d20a57` - 11:39
- Улучшение качества советов: элегантные feathers, умные бизнес-идеи

### `a044ad3` - 11:23
- UX улучшения: навигация, таблица ролей, иерархия денег

### `1e9fa3e` - 10:44
- Фикс JSON парсинга
- Шутка про ФСБ с паузой 3 секунды

### `e4b2d25` - 10:38
- Major UX improvements

### `ed2bc99` - 01:02
- Добавлена ссылка на видео о пёрышках

### `2b365e9` - 00:54
- Major UI/UX improvements

### `401da5e` - 00:14
- Переход с Anthropic SDK на OpenRouter API

---

## Команды для откатa

```bash
# Посмотреть все версии
git log --oneline

# Откат к конкретной версии (пример)
git checkout e0c43ec .   # v1.0
git checkout e969f4c .   # v2.0 (текущая)

# После отката - закоммитить и запушить
git add -A && git commit -m "Rollback to vX.X" && git push
```

---

## Структура проекта

```
strengths-finder/
├── src/
│   ├── app/
│   │   ├── api/analyze/route.ts    # API endpoint (OpenRouter → Claude)
│   │   ├── globals.css              # Стили + анимации
│   │   ├── layout.tsx               # SEO meta tags
│   │   └── page.tsx                 # Главный контроллер
│   ├── components/
│   │   ├── IntroScreen.tsx          # Экран приветствия
│   │   ├── InputScreen.tsx          # Ввод ситуаций
│   │   ├── ProcessingScreen.tsx     # Анимация обработки
│   │   └── ResultsScreen.tsx        # Результаты (670 строк)
│   └── types/index.ts               # TypeScript типы
├── .env.local                       # API ключи (не в git!)
├── .gitignore
├── package.json
└── CHANGELOG.md                     # Этот файл
```

---

## Контакты
- Telegram: [@krechet_mike](https://t.me/krechet_mike)
- GitHub: [misha1508-dotcom/strengths-finder](https://github.com/misha1508-dotcom/strengths-finder)
