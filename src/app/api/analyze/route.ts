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

Иногда большие и успешные системы существуют благодаря невероятно малому элементу — противовесу. Пёрышко, чтобы человек не "разъехался" негативными сторонами качеств. Сохранить огромное количество позитивных качеств, если положить небольшое пёрышко как противовес.

Тебе нужно предложить 10 МИКРО-ДЕЙСТВИЙ (пёрышек-противовесов) — маленькие регулярные действия, чтобы не проявлялись негативные стороны качеств.

Раздели их на 3 категории:
1. В МОМЕНТ когда кажется что проявляешь негативное качество (3-4 действия)
2. Новый MINDSET — как надо мыслить чтобы это больше не проявлялось (3-4 действия)
3. РЕГУЛЯРНЫЕ действия для профилактики (3-4 действия)

Примеры формата:
- "Когда чувствуешь что вспыхиваешь — выйди на 2 минуты и сделай 10 глубоких вдохов"
- "Раз в 2 недели получать неприятный для себя фидбек у рационального человека"
- "Перед важным решением задать себе вопрос: а что бы сказал мой самый критичный друг?"

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

Ты — опытный профориентолог и коуч-скептик. Твои советы переворачивают жизнь. Ты не даёшь банальных общих рекомендаций.

Ответь на вопросы:

1. СЛАБЫЕ КАЧЕСТВА (топ-3)
Верни топ-3 качества человека отсортированные по частоте (только названия)

2. СИЛЬНЫЕ СТОРОНЫ (топ-3)
Верни топ-3 позитивных дуала отсортированные по частоте (только названия)

3. РОЛИ (10 конкретных вариантов)
На каком месте человеку будет МАКСИМАЛЬНО комфортно с такой комбинацией качеств?
Для каждой роли укажи:
- role: конкретная должность/роль
- type: "бизнес" | "работа" | "фриланс"
- income: примерный среднерыночный доход в месяц в рублях (например "150 000 ₽")
Отсортируй по доходу от большего к меньшему.
Учитывай реальность России. Никаких общих советов типа "менеджер" или "предприниматель" — только конкретика.

4. ДЕНЬГИ (5 способов с вероятностью успеха)
Что из этого даст МНОГО денег и ЛЕГКО именно для этого человека?
Учитывай слабые и сильные качества.
Для каждого способа укажи:
- opportunity: конкретный способ заработка
- probability: вероятность успеха от 1 до 100 (именно для этого человека, а не для большинства)
Отсортируй по вероятности от большей к меньшей.

5. ЗНАМЕНИТОСТИ (3-5 человек)
Мировые и российские знаменитости с похожим типом личности и комбинацией качеств.
Формат: "Имя — краткое описание почему похож"

6. ХОББИ (5 занятий)
Чем этому человеку понравится заниматься для души, где он сможет реализовать свои сильные стороны?
Просто список занятий с коротким объяснением.

Ответь СТРОГО в формате JSON:
{
  "sortedWeakQualities": ["качество1", "качество2", "качество3"],
  "sortedStrongQualities": ["сила1", "сила2", "сила3"],
  "roles": [
    {"role": "Продакт-менеджер в EdTech стартапе", "type": "работа", "income": "250 000 ₽"},
    ...
  ],
  "money": [
    {"opportunity": "Консалтинг для стартапов — легко благодаря креативности и харизме", "probability": 85},
    ...
  ],
  "celebrities": ["Илон Маск — такая же комбинация упрямства и креативности", ...],
  "hobbies": ["Подкастинг — способ реализовать харизму и любопытство", ...]
}

Только JSON, без дополнительного текста.`;

  const textContent = await callOpenRouter(prompt, 4096);

  const result = safeParseJSON(textContent);

  return NextResponse.json(result);
}
