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

    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const analysisResult = JSON.parse(jsonMatch[0]);

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

Предложи 5-7 конкретных "пёрышек" — маленьких регулярных действий-противовесов.

Примеры формата:
- "Раз в 2 недели получать неприятный для себя фидбек у рационального человека"
- "Перед важным решением спрашивать совета у 2 разных людей"
- "Вести дневник эмоций 5 минут перед сном"

Ответь СТРОГО в формате JSON:
{
  "feathers": ["пёрышко 1", "пёрышко 2", ...]
}

Только JSON, без дополнительного текста.`;

  const textContent = await callOpenRouter(prompt, 2048);

  const jsonMatch = textContent.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found in response');
  }

  return NextResponse.json(JSON.parse(jsonMatch[0]));
}

async function handleActivities(situations: { text: string; analysis: { qualities: { name: string }[]; duals: { quality: string; positive: string }[] } }[]) {
  const qualitiesSummary = situations
    .flatMap(s => s.analysis?.qualities.map(q => q.name) || [])
    .join(', ');

  const dualsSummary = situations
    .flatMap(s => s.analysis?.duals.map(d => d.positive) || [])
    .join(', ');

  const prompt = `У человека следующие качества: ${qualitiesSummary}

Его сильные стороны (позитивные дуалы): ${dualsSummary}

Учитывая эти качества, сильные и слабые стороны — чем этому человеку понравится заниматься? Что будет приносить ему удовольствие и где он сможет реализовать свои сильные стороны?

Предложи 6-8 конкретных занятий, хобби или направлений деятельности.

Ответь СТРОГО в формате JSON:
{
  "activities": ["занятие 1 с кратким объяснением почему", "занятие 2...", ...]
}

Только JSON, без дополнительного текста.`;

  const textContent = await callOpenRouter(prompt, 2048);

  const jsonMatch = textContent.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found in response');
  }

  return NextResponse.json(JSON.parse(jsonMatch[0]));
}
