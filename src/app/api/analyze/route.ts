import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface SituationAnalysis {
  shortDescription: string;
  negativeQuality: string;
  positiveQuality: string;
  explanation: string;
}

interface AnalysisResponse {
  analyses: SituationAnalysis[];
  featherInsight: {
    summary: string;
    microHabits: string[];
    suitableRoles: string[];
    finalMessage: string;
  };
}

export async function POST(request: Request) {
  try {
    const { situations } = await request.json();

    if (!situations || !Array.isArray(situations) || situations.length === 0) {
      return NextResponse.json(
        { error: 'No situations provided' },
        { status: 400 }
      );
    }

    const prompt = `Ты — психолог-эксперт по самопознанию. Твоя задача — проанализировать ситуации, где человек чувствовал, что что-то пошло не так, и найти в них скрытые сильные стороны.

Вот ситуации, которые описал человек:

${situations.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n\n')}

Для каждой ситуации определи:
1. Краткое описание ситуации (5-10 слов)
2. Негативное качество, которое проявилось (как это выглядит со стороны)
3. Позитивный "дуал" — то же самое качество, но с позитивной стороны

Примеры дуалов:
- "Наивность" → "Открытость новому и доверие к людям"
- "Прокрастинация" → "Умение ждать правильного момента"
- "Упрямство" → "Настойчивость и верность своим принципам"
- "Излишняя эмоциональность" → "Глубина чувств и эмпатия"
- "Перфекционизм" → "Стремление к качеству и внимание к деталям"

После анализа всех ситуаций:
1. Сделай общий вывод о паттернах качеств человека
2. Предложи 3-5 микро-привычек (маленькие ежедневные действия), которые помогут использовать позитивные стороны этих качеств
3. Предложи 3-5 ролей или профессий, которые подходят человеку с такими качествами
4. Напиши вдохновляющее финальное сообщение

Ответь СТРОГО в формате JSON:
{
  "analyses": [
    {
      "shortDescription": "краткое описание ситуации",
      "negativeQuality": "негативное проявление качества",
      "positiveQuality": "позитивный дуал этого качества",
      "explanation": "объяснение связи между негативным и позитивным проявлением"
    }
  ],
  "featherInsight": {
    "summary": "общий вывод о качествах человека",
    "microHabits": ["привычка 1", "привычка 2", "..."],
    "suitableRoles": ["роль 1", "роль 2", "..."],
    "finalMessage": "вдохновляющее сообщение"
  }
}

Отвечай только JSON, без дополнительного текста.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract text content from the response
    const textContent = message.content.find((block) => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in response');
    }

    // Parse JSON from the response
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const analysisResult: AnalysisResponse = JSON.parse(jsonMatch[0]);

    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error('Error analyzing situations:', error);
    return NextResponse.json(
      { error: 'Failed to analyze situations' },
      { status: 500 }
    );
  }
}
