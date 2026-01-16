'use client';

import { useState } from 'react';
import { Situation, FeatherInsight, QualityRating } from '@/types';

interface ResultsScreenProps {
  situations: Situation[];
  featherInsight: FeatherInsight;
  qualityRatings: QualityRating[];
  onRestart: () => void;
  onGetFeathers: () => Promise<void>;
  onGetActivities: () => Promise<void>;
}

export default function ResultsScreen({
  situations,
  featherInsight,
  qualityRatings,
  onRestart,
  onGetFeathers,
  onGetActivities,
}: ResultsScreenProps) {
  const [expandedSituation, setExpandedSituation] = useState<number | null>(null);
  const [showFeathers, setShowFeathers] = useState(false);
  const [showActivities, setShowActivities] = useState(false);
  const [loadingFeathers, setLoadingFeathers] = useState(false);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGetFeathers = async () => {
    setLoadingFeathers(true);
    await onGetFeathers();
    setLoadingFeathers(false);
    setShowFeathers(true);
  };

  const handleGetActivities = async () => {
    setLoadingActivities(true);
    await onGetActivities();
    setLoadingActivities(false);
    setShowActivities(true);
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      emotional: 'Эмоциональное',
      behavioral: 'Поведенческое',
      cognitive: 'Когнитивное',
      willpower: 'Волевое',
    };
    return labels[category] || category;
  };

  // Generate the summary prompt for copying
  const generatePrompt = () => {
    const allQualities = situations.flatMap(s => s.analysis?.qualities.map(q => q.name) || []);
    const uniqueQualities = [...new Set(allQualities)];
    const allDuals = situations.flatMap(s => s.analysis?.duals.map(d => d.positive) || []);
    const uniqueDuals = [...new Set(allDuals)];

    let prompt = `Привет! Вот информация обо мне, которую я получил из анализа своих жизненных ситуаций:\n\n`;
    prompt += `**Мои качества:** ${uniqueQualities.join(', ')}\n\n`;
    prompt += `**Мои сильные стороны (позитивные дуалы):** ${uniqueDuals.join(', ')}\n\n`;

    if (qualityRatings.length > 0) {
      prompt += `**Топ качеств по частоте проявления:**\n`;
      qualityRatings.slice(0, 5).forEach((r, i) => {
        prompt += `${i + 1}. ${r.quality} (${getCategoryLabel(r.category)}) - ${r.count} раз\n`;
      });
      prompt += '\n';
    }

    if (featherInsight.feathers.length > 0) {
      prompt += `**Рекомендованные "пёрышки-противовесы":**\n`;
      featherInsight.feathers.forEach((f, i) => {
        prompt += `${i + 1}. ${f}\n`;
      });
      prompt += '\n';
    }

    if (featherInsight.activities.length > 0) {
      prompt += `**Рекомендованные занятия:**\n`;
      featherInsight.activities.forEach((a, i) => {
        prompt += `${i + 1}. ${a}\n`;
      });
      prompt += '\n';
    }

    prompt += `\nПомоги мне разобраться с этой информацией и дай рекомендации на основе моего профиля.`;

    return prompt;
  };

  const handleCopyPrompt = async () => {
    const prompt = generatePrompt();
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Categorize feathers
  const categorizeFeathers = (feathers: string[]) => {
    const categories = {
      moment: [] as string[],
      regular: [] as string[],
      social: [] as string[],
    };

    feathers.forEach(f => {
      const lower = f.toLowerCase();
      if (lower.includes('когда') || lower.includes('перед') || lower.includes('в момент') || lower.includes('после')) {
        categories.moment.push(f);
      } else if (lower.includes('раз в') || lower.includes('каждый') || lower.includes('регулярно') || lower.includes('ежедневно') || lower.includes('еженедельно')) {
        categories.regular.push(f);
      } else if (lower.includes('друг') || lower.includes('человек') || lower.includes('спрашивай') || lower.includes('общайся') || lower.includes('прислушивайся')) {
        categories.social.push(f);
      } else {
        // Default to regular if no match
        categories.regular.push(f);
      }
    });

    return categories;
  };

  // Get max count for progress bar calculation
  const maxCount = qualityRatings.length > 0 ? Math.max(...qualityRatings.map(r => r.count)) : 1;

  return (
    <div className="min-h-screen px-6 py-12 fade-in">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Анализ сильных и слабых сторон
          </h1>
          <p className="text-[var(--muted)]">
            На основе {situations.length} ситуаций
          </p>
        </div>

        {/* Results Table */}
        <div className="bg-[var(--card-bg)] rounded-2xl shadow-lg border border-[var(--mint)]/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--mint)]/20 border-b border-[var(--mint)]/30">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Ситуация
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Качества
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Позитивные дуалы
                  </th>
                </tr>
              </thead>
              <tbody>
                {situations.map((situation, index) => (
                  <tr
                    key={situation.id}
                    className="border-b border-[var(--mint)]/20 hover:bg-[var(--mint)]/10 transition-colors"
                  >
                    {/* Situation Column */}
                    <td className="px-6 py-4 align-top">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground">
                          {situation.analysis?.shortDescription || `Ситуация ${index + 1}`}
                        </p>
                        <button
                          onClick={() =>
                            setExpandedSituation(
                              expandedSituation === situation.id ? null : situation.id
                            )
                          }
                          className="text-xs text-[var(--accent)] hover:text-[var(--accent-light)] transition-colors"
                        >
                          {expandedSituation === situation.id ? 'Скрыть' : 'Показать полный текст'}
                        </button>
                        {expandedSituation === situation.id && (
                          <p className="text-xs text-[var(--muted)] mt-2 p-3 bg-background rounded-lg">
                            {situation.text}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Qualities Column - displayed in column with negative styling */}
                    <td className="px-6 py-4 align-top">
                      <div className="flex flex-col gap-2">
                        {situation.analysis?.qualities.map((quality, qIndex) => (
                          <span
                            key={qIndex}
                            className="inline-block px-3 py-1.5 rounded-lg text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-800"
                          >
                            {quality.name}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Duals Column */}
                    <td className="px-6 py-4 align-top">
                      <div className="space-y-2">
                        {situation.analysis?.duals.map((dual, dIndex) => (
                          <div key={dIndex} className="text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-red-500 dark:text-red-400 line-through text-xs">{dual.quality}</span>
                              <span className="text-[var(--accent)]">→</span>
                              <span className="text-[var(--accent)] font-medium">{dual.positive}</span>
                            </div>
                            <p className="text-xs text-[var(--muted)] mt-1">{dual.explanation}</p>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quality Ratings - vertical list with progress bars */}
        <div className="bg-[var(--card-bg)] rounded-2xl p-6 shadow-lg border border-[var(--mint)]/30">
          <h2 className="text-xl font-semibold mb-6">Рейтинг качеств по повторяемости</h2>
          <div className="space-y-4">
            {qualityRatings.slice(0, 10).map((rating, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-[var(--accent)] w-8">#{index + 1}</span>
                    <div>
                      <p className="font-medium text-foreground">{rating.quality}</p>
                      <p className="text-xs text-[var(--muted)]">{getCategoryLabel(rating.category)}</p>
                    </div>
                  </div>
                  <span className="text-lg font-semibold text-[var(--accent)]">×{rating.count}</span>
                </div>
                {/* Progress bar for visual frequency */}
                <div className="h-2 bg-[var(--mint)]/20 rounded-full overflow-hidden ml-11">
                  <div
                    className="h-full bg-gradient-to-r from-red-400 to-red-600 dark:from-red-500 dark:to-red-700 rounded-full transition-all duration-500"
                    style={{ width: `${(rating.count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What to do section */}
        {!showFeathers && (
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              Что с этим всем делать?
            </h2>
            <button
              onClick={handleGetFeathers}
              disabled={loadingFeathers}
              className="px-10 py-4 bg-[var(--accent)] hover:bg-[var(--accent-light)] disabled:bg-[var(--muted)]/30 text-white font-semibold rounded-full text-lg transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[var(--accent)]/30"
            >
              {loadingFeathers ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Генерирую пёрышки...
                </span>
              ) : (
                'Узнать пёрышки-противовесы'
              )}
            </button>
          </div>
        )}

        {/* Feathers Summary */}
        {showFeathers && featherInsight.feathers.length > 0 && (
          <div className="bg-[var(--card-bg)] rounded-2xl p-6 shadow-lg border border-[var(--accent)]/30">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🪶</span>
              <h2 className="text-xl font-semibold">Пёрышки-противовесы</h2>
            </div>

            {/* Explanation */}
            <div className="bg-[var(--mint)]/20 rounded-xl p-5 mb-6 border border-[var(--accent)]/20">
              <p className="text-[var(--muted)] leading-relaxed mb-4">
                <strong className="text-foreground">Что такое пёрышки?</strong> Иногда большие и успешные системы
                существуют благодаря невероятно малому элементу — противовесу. Это как пёрышко, которое не даёт
                человеку "разъехаться" негативными сторонами своих качеств. Маленькое регулярное действие может
                сохранить огромное количество позитивных проявлений твоих качеств.
              </p>

              <div className="bg-[var(--card-bg)] rounded-lg p-4 border border-[var(--accent)]/30">
                <p className="text-foreground font-medium mb-2">
                  Чтобы по-настоящему понять эту идею — посмотри видео:
                </p>
                <a
                  href="https://youtu.be/kOmJwW1Is6k?si=TMymeJvsW42aDKHq"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[var(--accent)] hover:text-[var(--accent-light)] font-semibold text-lg mb-3"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                  </svg>
                  Смотреть видео о методе пёрышек
                </a>
                <div className="text-sm text-[var(--muted)] space-y-1">
                  <p>• Не перематывай и не ускоряй — важно прочувствовать идею целиком</p>
                  <p>• Постарайся проникнуться вайбом и понять суть метода</p>
                  <p>• После видео вернись сюда — не уходи в рилсы и шортсы</p>
                </div>
              </div>
            </div>

            {/* Categorized Feathers */}
            {(() => {
              const categorized = categorizeFeathers(featherInsight.feathers);
              return (
                <div className="space-y-6">
                  {categorized.moment.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--accent)] mb-3 uppercase tracking-wide">
                        В момент проявления качества
                      </h3>
                      <ul className="space-y-2">
                        {categorized.moment.map((feather, index) => (
                          <li key={index} className="flex items-start gap-3 p-3 bg-[var(--mint)]/10 rounded-lg">
                            <span className="text-[var(--accent)] mt-0.5">🪶</span>
                            <span className="text-foreground">{feather}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {categorized.regular.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--accent)] mb-3 uppercase tracking-wide">
                        Регулярные действия
                      </h3>
                      <ul className="space-y-2">
                        {categorized.regular.map((feather, index) => (
                          <li key={index} className="flex items-start gap-3 p-3 bg-[var(--mint)]/10 rounded-lg">
                            <span className="text-[var(--accent)] mt-0.5">📅</span>
                            <span className="text-foreground">{feather}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {categorized.social.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--accent)] mb-3 uppercase tracking-wide">
                        Социальные связи и друзья
                      </h3>
                      <ul className="space-y-2">
                        {categorized.social.map((feather, index) => (
                          <li key={index} className="flex items-start gap-3 p-3 bg-[var(--mint)]/10 rounded-lg">
                            <span className="text-[var(--accent)] mt-0.5">👥</span>
                            <span className="text-foreground">{feather}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })()}

            {!showActivities && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleGetActivities}
                  disabled={loadingActivities}
                  className="px-10 py-4 bg-[var(--accent)] hover:bg-[var(--accent-light)] disabled:bg-[var(--muted)]/30 text-white font-semibold rounded-full text-lg transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[var(--accent)]/30"
                >
                  {loadingActivities ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Подбираю занятия...
                    </span>
                  ) : (
                    'Пойти ещё дальше →'
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Activities - restructured with subsections */}
        {showActivities && featherInsight.activities.length > 0 && (
          <div className="bg-gradient-to-br from-[var(--mint)]/20 to-[var(--accent)]/10 rounded-2xl p-6 shadow-lg border border-[var(--accent)]/30">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">✨</span>
              <h2 className="text-xl font-semibold">Чем тебе понравится заниматься</h2>
            </div>

            {/* Qualities Summary */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-[var(--card-bg)] p-4 rounded-xl border border-red-200 dark:border-red-800">
                <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">Твои качества (слабые стороны)</h3>
                <p className="text-sm text-[var(--muted)]">
                  {[...new Set(situations.flatMap(s => s.analysis?.qualities.map(q => q.name) || []))].join(', ')}
                </p>
              </div>
              <div className="bg-[var(--card-bg)] p-4 rounded-xl border border-[var(--accent)]/30">
                <h3 className="text-sm font-semibold text-[var(--accent)] mb-2">Твои дуалы (сильные стороны)</h3>
                <p className="text-sm text-[var(--muted)]">
                  {[...new Set(situations.flatMap(s => s.analysis?.duals.map(d => d.positive) || []))].join(', ')}
                </p>
              </div>
            </div>

            {/* Roles */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                🎭 В каких ролях тебе будет комфортно
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                {featherInsight.activities.slice(0, 4).map((activity, index) => (
                  <div
                    key={index}
                    className="bg-[var(--card-bg)] p-4 rounded-xl border border-[var(--mint)]/30"
                  >
                    <span className="text-foreground">{activity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Money opportunities */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                💰 На чём можно легко заработать
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                {featherInsight.activities.slice(4).map((activity, index) => (
                  <div
                    key={index}
                    className="bg-[var(--card-bg)] p-4 rounded-xl border border-[var(--mint)]/30"
                  >
                    <span className="text-foreground">{activity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Data Export Section */}
        {showActivities && (
          <div className="bg-[var(--card-bg)] rounded-2xl p-6 shadow-lg border border-[var(--mint)]/30">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-semibold text-foreground">
                Забрать свои данные с собой
              </h2>
              <p className="text-[var(--muted)] max-w-lg mx-auto">
                Это всё, что ты сегодня узнал(-а) о себе. Можешь скопировать свои данные и вставить
                их в любую нейронку (ChatGPT, Claude, и др.) и общаться дальше. Успехов!
              </p>

              <button
                onClick={handleCopyPrompt}
                className="px-8 py-3 bg-[var(--accent)] hover:bg-[var(--accent-light)] text-white font-semibold rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[var(--accent)]/30"
              >
                {copied ? '✓ Скопировано!' : 'Скопировать данные'}
              </button>

              {/* Prompt Preview */}
              <div className="mt-6 text-left">
                <p className="text-sm text-[var(--muted)] mb-2">Промпт для копирования:</p>
                <div className="bg-background p-4 rounded-xl border border-[var(--mint)]/30 max-h-48 overflow-y-auto">
                  <pre className="text-xs text-[var(--muted)] whitespace-pre-wrap font-mono">
                    {generatePrompt()}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contact and Final Message */}
        {showActivities && (
          <div className="text-center space-y-4 py-6">
            <p className="text-[var(--muted)]">
              Надеюсь, было полезно!
            </p>
            <p className="text-[var(--muted)]">
              Мой контакт в телеграм: <a href="https://t.me/krechet_mike" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:text-[var(--accent-light)] font-medium">@krechet_mike</a>
            </p>
          </div>
        )}

        {/* Restart Button */}
        <div className="text-center pt-8">
          <button
            onClick={onRestart}
            className="px-8 py-3 bg-[var(--card-bg)] border-2 border-[var(--muted)]/30 text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] font-semibold rounded-full transition-all"
          >
            Начать заново
          </button>
        </div>
      </div>
    </div>
  );
}
