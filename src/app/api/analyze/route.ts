import { NextResponse } from 'next/server';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

async function callOpenRouter(prompt: string, maxTokens: number = 4096) {
  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      'X-Title': 'Strengths Finder',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3.5-sonnet',
      max_tokens: maxTokens,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('OpenRouter error:', errorData);
    throw new Error(errorData.error?.message || `OpenRouter API error: ${response.status}`);
  }

  const data = await response.json();
  const textContent = data.choices?.[0]?.message?.content;

  if (!textContent) {
    throw new Error('No text content in response');
  }

  return textContent;
}

// Helper function to safely parse JSON with cleanup
function safeParseJSON(text: string): unknown {
  // Extract JSON from the response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found in response');
  }

  let jsonStr = jsonMatch[0];

  // Clean up common issues
  // Remove trailing commas before ] or }
  jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');

  // Fix unescaped quotes inside strings (basic attempt)
  // Replace problematic patterns

  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error('JSON parse error, attempting cleanup:', e);
    console.error('Original JSON:', jsonStr.substring(0, 500));

    // More aggressive cleanup
    // Try to fix common issues with explanations containing quotes
    jsonStr = jsonStr.replace(/"explanation":\s*"([^"]*)"([^,}\]]*)"([^,}\]]*)/g, '"explanation": "$1$2$3"');

    try {
      return JSON.parse(jsonStr);
    } catch (e2) {
      console.error('JSON parse still failed:', e2);
      throw new Error('Failed to parse AI response as JSON');
    }
  }
}

const QUALITIES_LIST = `
Эмоциональные качества (emotional):
Впечатлительность, Ранимость, Обидчивость, Вспыльчивость, Спокойствие, Завистливость, Злопамятность, Щедрость, Жадность, Мстительность, Доброжелательность, Циничность

Поведенческие качества (behavioral):
Ответственность, Безответственность, Пунктуальность, Безалаберность, Аккуратность, Неряшливость, Лень, Трудолюбие, Болтливость, Сдержанность, Стеснительность, Дерзость, Харизматичность, Скучность, Манипулятивность, Услужливость

Когнитивные качества (cognitive):
Внимательность, Невнимательность, Любопытство, Безразличие, Подозрительность, Доверчивость, Проницательность, Наивность, Простодушие, Креативность, Консервативность, Забывчивость

Волевые качества (willpower):
Решительность, Упрямство, Трусость, Смелость, Самоуверенность, Осторожность, Прямолинейность, Лицемерие, Терпимость, Нетерпимость, Амбициозность, Инфантильность, Авторитарность
`;

export async function POST(request: Request) {
  try {
    const { situations, action } = await request.json();

    if (action === 'feathers') {
      return handleFeathers(situations);
    }

    if (action === 'activities') {
      return handleActivities(situations);
    }

    if (!situations || !Array.isArray(situations) || situations.length === 0) {
      return NextResponse.json(
        { error: 'No situations provided' },
        { status: 400 }
      );
    }

    const prompt = `Ты — психолог-эксперт по самопознанию. Твоя задача — проанализировать ситуации, где человек чувствовал, что что-то пошло не так, и найти в них проявленные качества.

Вот список качеств по категориям:
${QUALITIES_LIST}

Вот ситуации, которые описал человек:

${situations.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n\n')}

Для каждой ситуации определи:
1. Краткое описание ситуации (5-10 слов)
2. Топ-3 качества из списка выше, которые проявились в этой ситуации (укажи категорию каждого)
3. Для каждого качества — его позитивный "дуал" (позитивное проявление в жизни) и краткое объяснение

Примеры дуалов:
- "Наивность" → "Открытость новому и способность доверять"
- "Упрямство" → "Настойчивость и верность своим принципам"
- "Вспыльчивость" → "Страстность и эмоциональная честность"

Ответь СТРОГО в формате JSON:
{
  "analyses": [
    {
      "shortDescription": "краткое описание ситуации",
      "qualities": [
        {"name": "название качества", "category": "emotional|behavioral|cognitive|willpower", "isNegative": true|false}
      ],
      "duals": [
        {"quality": "негативное качество", "positive": "позитивный дуал", "explanation": "краткое объяснение связи"}
      ]
    }
  ],
  "qualityRatings": [
    {"quality": "название", "count": число_повторений, "category": "категория"}
  ]
}

Отвечай только JSON, без дополнительного текста.`;

    const textContent = await callOpenRouter(prompt, 4096);

    const analysisResult = safeParseJSON(textContent);

    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error('Error analyzing situations:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze situations' },
      { status: 500 }
    );
  }
}

async function handleFeathers(situations: { text: string; analysis: { qualities: { name: string }[]; duals: { quality: string; positive: string }[] } }[]) {
  const qualitiesSummary = situations
    .flatMap(s => s.analysis?.qualities.map(q => q.name) || [])
    .join(', ');

  const dualsSummary = situations
    .flatMap(s => s.analysis?.duals.map(d => `${d.quality} → ${d.positive}`) || [])
    .join('\n');

  const prompt = `У человека следующие качества: ${qualitiesSummary}

Его дуалы (негативное → позитивное):
${dualsSummary}

Ты — гениальный психотерапевт и стратег поведения. Твоя задача — найти ЭЛЕГАНТНЫЕ микро-решения, которые вызовут реакцию "Вау! Как же просто! Почему я сам не додумался?"

КРИТЕРИИ КАЧЕСТВА СОВЕТА:
1. НЕОЧЕВИДНОСТЬ — совет должен удивить, показать новый угол зрения
2. ЭЛЕГАНТНОСТЬ — минимум усилий, максимум эффекта (как пёрышко балансирует систему)
3. КОНКРЕТНОСТЬ — не "будь внимательнее", а точное действие в конкретный момент
4. ЛЁГКОСТЬ — можно начать делать прямо сейчас, без подготовки
5. ПЕРСОНАЛИЗАЦИЯ — совет должен работать именно для ЭТОЙ комбинации качеств

АНТИПАТТЕРНЫ (НЕ ДАВАЙ ТАКИЕ СОВЕТЫ):
❌ "Сделай глубокий вдох" — слишком банально
❌ "Посчитай до 10" — все это знают
❌ "Веди дневник" — требует систематичности
❌ "Медитируй" — слишком общее
❌ "Поговори с психологом" — не решение
❌ Любые советы, которые человек уже 100 раз слышал

ХОРОШИЕ ПРИМЕРЫ элегантных решений:
✅ "Когда хочется ответить резко — напиши сообщение, но отправь через 4 часа (90% удалишь)"
✅ "Перед критикой спроси: 'Можно я скажу неприятное?' — это даёт 3 секунды на остывание"
✅ "Носи на запястье резинку — щёлкни когда ловишь себя на [качестве]"
✅ "Правило 'один чай': прежде чем реагировать на провокацию — завари и выпей чай"
✅ "Фраза-якорь вслух: 'Интересно, это правда так или мне кажется?'"

Предложи 10 МИКРО-ДЕЙСТВИЙ в 3 категориях:
1. В МОМЕНТ (3-4): что делать прямо в секунду когда "накрывает"
2. MINDSET (3-4): какую мысль/фразу держать в голове
3. РЕГУЛЯРНО (3-4): что делать раз в неделю/месяц для профилактики

ПРОВЕРКА ПЕРЕД ОТВЕТОМ:
- Каждый совет должен вызвать "ага-эффект"
- Никаких очевидных решений
- Всё должно быть легко воплотить СЕГОДНЯ

Ответь СТРОГО в формате JSON:
{
  "feathers": {
    "moment": ["действие в момент 1", "действие в момент 2", ...],
    "mindset": ["новый образ мышления 1", "новый образ мышления 2", ...],
    "regular": ["регулярное действие 1", "регулярное действие 2", ...]
  },
  "uniqueActions": ["уникальное действие 1", "уникальное действие 2", "уникальное действие 3"]
}

Только JSON, без дополнительного текста.`;

  const textContent = await callOpenRouter(prompt, 2048);

  const result = safeParseJSON(textContent) as { feathers: { moment: string[]; mindset: string[]; regular: string[] }; uniqueActions: string[] };

  // Flatten feathers for backward compatibility, but also include structured
  const flatFeathers = [
    ...(result.feathers?.moment || []),
    ...(result.feathers?.mindset || []),
    ...(result.feathers?.regular || []),
  ];

  return NextResponse.json({
    feathers: flatFeathers,
    feathersStructured: result.feathers,
    uniqueActions: result.uniqueActions,
  });
}

async function handleActivities(situations: { text: string; analysis: { qualities: { name: string }[]; duals: { quality: string; positive: string }[] } }[]) {
  const qualitiesSummary = situations
    .flatMap(s => s.analysis?.qualities.map(q => q.name) || [])
    .join(', ');

  const dualsSummary = situations
    .flatMap(s => s.analysis?.duals.map(d => d.positive) || [])
    .join(', ');

  // Count qualities frequency
  const qualityCounts: Record<string, number> = {};
  situations.forEach(s => {
    s.analysis?.qualities.forEach(q => {
      qualityCounts[q.name] = (qualityCounts[q.name] || 0) + 1;
    });
  });
  const sortedQualities = Object.entries(qualityCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => `${name} (×${count})`)
    .join(', ');

  const dualCounts: Record<string, number> = {};
  situations.forEach(s => {
    s.analysis?.duals.forEach(d => {
      dualCounts[d.positive] = (dualCounts[d.positive] || 0) + 1;
    });
  });
  const sortedDuals = Object.entries(dualCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => `${name} (×${count})`)
    .join(', ');

  const prompt = `У человека следующие качества (отсортированы по частоте проявления): ${sortedQualities}

Его сильные стороны (позитивные дуалы, отсортированы по частоте): ${sortedDuals}

Ты — опытный бизнес-стратег, который видит рыночные возможности. Год 2025. Россия. Твои советы конкретные и актуальные.

Ответь на вопросы:

1. СЛАБЫЕ КАЧЕСТВА (топ-3)
Верни топ-3 качества человека отсортированные по частоте (только названия)

2. СИЛЬНЫЕ СТОРОНЫ (топ-3)
Верни топ-3 позитивных дуала отсортированные по частоте (только названия)

3. РОЛИ (10 конкретных вариантов)
На каком месте человеку будет МАКСИМАЛЬНО комфортно с такой комбинацией качеств?
Для каждой роли укажи:
- role: конкретная должность/роль (НЕ общие типа "менеджер", а конкретные: "Руководитель отдела закупок в ритейле")
- type: "бизнес" | "работа" | "фриланс"
- income: примерный среднерыночный доход в месяц в рублях (например "150 000 ₽")
Отсортируй по доходу от большего к меньшему.

4. ДЕНЬГИ — БИЗНЕС-ИДЕИ (5 способов)

КРИТЕРИИ ОТБОРА ИДЕЙ:
✅ СПРОС: есть реальный спрос прямо сейчас (2025 год)
✅ ДЕФИЦИТ: мало кто это делает или делают плохо
✅ ЛЁГКИЙ СТАРТ: можно начать за 1-2 недели без больших вложений
✅ ПОД ЧЕЛОВЕКА: идеально ложится на ЕГО сильные стороны
✅ КОНКРЕТИКА: не "консалтинг", а "помощь малому бизнесу с настройкой CRM за 50к"

ФИЛЬТР ТУПЫХ ИДЕЙ (НЕ ПРЕДЛАГАЙ):
❌ "Создать курс" — рынок перенасыщен
❌ "Вести блог/канал" — долгий путь до денег
❌ "Консалтинг" (без конкретики) — размыто
❌ "Коучинг" — требует сертификации и репутации
❌ "Написать книгу" — не бизнес
❌ "Инвестиции" — не активный доход
❌ Всё что требует больших вложений или долгой раскачки

ХОРОШИЕ ПРИМЕРЫ:
✅ "Услуга 'упаковка резюме + LinkedIn для IT' — 15к за клиента, спрос огромный"
✅ "Сервис подбора подарков для корпоратов — B2B, чеки от 100к"
✅ "Агентство по организации мероприятий для малого бизнеса — 50-150к за ивент"

Для каждого способа укажи:
- opportunity: конкретный способ заработка с примером чека
- probability: вероятность успеха от 1 до 100 (для ЭТОГО человека)
- whyEasy: почему именно этому человеку будет легко (1 предложение)
Отсортируй по вероятности от большей к меньшей.

5. ЗНАМЕНИТОСТИ (3-5 человек)
Мировые и российские знаменитости с ПОХОЖИМ типом личности.
Для каждого укажи:
- name: полное имя (на русском для русских, на английском для иностранцев)
- description: почему похож (1 предложение)
- wikiId: ID статьи в Wikipedia на английском (например для "Elon Musk" это "Elon_Musk")

6. ХОББИ (5 занятий)
Чем этому человеку понравится заниматься для души?
Просто список занятий с коротким объяснением.

Ответь СТРОГО в формате JSON:
{
  "sortedWeakQualities": ["качество1", "качество2", "качество3"],
  "sortedStrongQualities": ["сила1", "сила2", "сила3"],
  "roles": [
    {"role": "Руководитель отдела закупок в ритейле", "type": "работа", "income": "250 000 ₽"}
  ],
  "money": [
    {"opportunity": "Услуга упаковки резюме для IT — 15к за клиента", "probability": 85, "whyEasy": "Харизма и креативность помогут продавать и делать wow-результат"}
  ],
  "celebrities": [
    {"name": "Elon Musk", "description": "Такая же комбинация упрямства и креативности", "wikiId": "Elon_Musk"}
  ],
  "hobbies": ["Подкастинг — способ реализовать харизму и любопытство"]
}

Только JSON, без дополнительного текста.`;

  const textContent = await callOpenRouter(prompt, 4096);

  const result = safeParseJSON(textContent);

  return NextResponse.json(result);
}
