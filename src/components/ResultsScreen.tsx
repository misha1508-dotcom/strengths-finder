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

  // Generate the summary prompt for copying - now with original situation texts
  const generatePrompt = () => {
    const allQualities = situations.flatMap(s => s.analysis?.qualities.map(q => q.name) || []);
    const uniqueQualities = [...new Set(allQualities)];
    const allDuals = situations.flatMap(s => s.analysis?.duals.map(d => d.positive) || []);
    const uniqueDuals = [...new Set(allDuals)];

    let prompt = `Привет! Вот информация обо мне, которую я получил из анализа своих жизненных ситуаций:\n\n`;

    // Add original situation texts
    prompt += `**Мои ситуации (оригинальный текст):**\n`;
    situations.forEach((s, i) => {
      prompt += `${i + 1}. ${s.text}\n\n`;
    });

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

    if (featherInsight.uniqueActions && featherInsight.uniqueActions.length > 0) {
      prompt += `**Уникальные регулярные действия:**\n`;
      featherInsight.uniqueActions.forEach((a, i) => {
        prompt += `${i + 1}. ${a}\n`;
      });
      prompt += '\n';
    }

    if (featherInsight.roles && featherInsight.roles.length > 0) {
      prompt += `**Подходящие роли:**\n`;
      featherInsight.roles.forEach((r, i) => {
        prompt += `${i + 1}. ${r.role} (${r.type}) - ${r.income}\n`;
      });
      prompt += '\n';
    }

    if (featherInsight.money && featherInsight.money.length > 0) {
      prompt += `**Как заработать много и легко:**\n`;
      featherInsight.money.forEach((m, i) => {
        prompt += `${i + 1}. ${m.opportunity} (вероятность: ${m.probability}%)\n`;
      });
      prompt += '\n';
    }

    if (featherInsight.hobbies && featherInsight.hobbies.length > 0) {
      prompt += `**Рекомендованные хобби:**\n`;
      featherInsight.hobbies.forEach((h, i) => {
        prompt += `${i + 1}. ${h}\n`;
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

        {/* Quality Ratings */}
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
        {showFeathers && (featherInsight.feathers.length > 0 || featherInsight.feathersStructured) && (
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

            {/* Main recommendations intro */}
            <div className="bg-gradient-to-r from-[var(--accent)]/10 to-[var(--mint)]/20 rounded-xl p-5 mb-6 border border-[var(--accent)]/20">
              <p className="text-foreground leading-relaxed font-medium">
                Рекомендуемые микро-действия конкретно для тебя, чтобы не проявлялись негативные стороны твоих качеств.
                Не надо с собой бороться и их искоренять, надо не давать им проявиться! Это высший пилотаж управления своей жизнью.
              </p>
            </div>

            {/* Structured Feathers */}
            {featherInsight.feathersStructured ? (
              <div className="space-y-6">
                {/* In the moment */}
                {featherInsight.feathersStructured.moment && featherInsight.feathersStructured.moment.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--accent)] mb-3 uppercase tracking-wide">
                      🎯 В момент когда проявляется негативное качество
                    </h3>
                    <ul className="space-y-2">
                      {featherInsight.feathersStructured.moment.map((feather, index) => (
                        <li key={index} className="flex items-start gap-3 p-3 bg-[var(--mint)]/10 rounded-lg">
                          <span className="text-[var(--accent)] mt-0.5">🪶</span>
                          <span className="text-foreground">{feather}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Mindset */}
                {featherInsight.feathersStructured.mindset && featherInsight.feathersStructured.mindset.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--accent)] mb-3 uppercase tracking-wide">
                      🧠 Новый Mindset — как мыслить
                    </h3>
                    <ul className="space-y-2">
                      {featherInsight.feathersStructured.mindset.map((feather, index) => (
                        <li key={index} className="flex items-start gap-3 p-3 bg-[var(--mint)]/10 rounded-lg">
                          <span className="text-[var(--accent)] mt-0.5">💡</span>
                          <span className="text-foreground">{feather}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Regular */}
                {featherInsight.feathersStructured.regular && featherInsight.feathersStructured.regular.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--accent)] mb-3 uppercase tracking-wide">
                      📅 Регулярные действия для профилактики
                    </h3>
                    <ul className="space-y-2">
                      {featherInsight.feathersStructured.regular.map((feather, index) => (
                        <li key={index} className="flex items-start gap-3 p-3 bg-[var(--mint)]/10 rounded-lg">
                          <span className="text-[var(--accent)] mt-0.5">🔄</span>
                          <span className="text-foreground">{feather}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              // Fallback for flat feathers
              <ul className="space-y-2">
                {featherInsight.feathers.map((feather, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 bg-[var(--mint)]/10 rounded-lg">
                    <span className="text-[var(--accent)] mt-0.5">🪶</span>
                    <span className="text-foreground">{feather}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Unique Actions */}
            {featherInsight.uniqueActions && featherInsight.uniqueActions.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">✨</span>
                  <h3 className="text-lg font-semibold">Уникальные действия именно для тебя</h3>
                </div>
                <p className="text-sm text-[var(--muted)] mb-4">
                  Эти действия подобраны специально под твою комбинацию качеств. Они изящные, неочевидные и легко встраиваются в жизнь.
                </p>
                <ul className="space-y-3">
                  {featherInsight.uniqueActions.map((action, index) => (
                    <li key={index} className="flex items-start gap-3 p-4 bg-gradient-to-r from-[var(--accent)]/10 to-[var(--mint)]/20 rounded-xl border border-[var(--accent)]/20">
                      <span className="text-xl">💎</span>
                      <span className="text-foreground font-medium">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

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

        {/* Activities - restructured with new data */}
        {showActivities && (
          <div className="bg-gradient-to-br from-[var(--mint)]/20 to-[var(--accent)]/10 rounded-2xl p-6 shadow-lg border border-[var(--accent)]/30">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">✨</span>
              <h2 className="text-xl font-semibold">Чем тебе понравится заниматься</h2>
            </div>

            {/* Qualities Summary - TOP 3 in columns */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-[var(--card-bg)] p-4 rounded-xl border border-red-200 dark:border-red-800">
                <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-3">Слабые стороны (топ-3)</h3>
                <div className="flex flex-col gap-2">
                  {(featherInsight.sortedWeakQualities || []).slice(0, 3).map((q, i) => (
                    <span key={i} className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm rounded-lg">
                      {i + 1}. {q}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-[var(--card-bg)] p-4 rounded-xl border border-[var(--accent)]/30">
                <h3 className="text-sm font-semibold text-[var(--accent)] mb-3">Сильные стороны (топ-3)</h3>
                <div className="flex flex-col gap-2">
                  {(featherInsight.sortedStrongQualities || []).slice(0, 3).map((d, i) => (
                    <span key={i} className="px-3 py-2 bg-[var(--mint)]/30 text-[var(--accent-dark)] dark:text-[var(--accent-light)] text-sm rounded-lg">
                      {i + 1}. {d}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Motivational text about accepting weaknesses - NO ITALICS */}
            <div className="bg-[var(--card-bg)] p-5 rounded-xl border border-[var(--accent)]/20 mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">О принятии себя</h3>
              <p className="text-foreground leading-relaxed mb-3">
                Сила начинается с принятия своей слабости. Не бойся смотреть на свои слабости — и они перестанут тобой управлять.
                Полюби их. Знай их. И принимай. Это и есть любовь к себе. Так ты обретёшь силу, которая берётся из знания себя!
              </p>
              <p className="text-[var(--accent)] font-semibold">
                Не надо себя менять — ты уже совершенство, просто реализуй себя!
              </p>
            </div>

            {/* Roles - TABLE sorted by income */}
            {featherInsight.roles && featherInsight.roles.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  🎭 В каких ролях тебе будет комфортно
                </h3>
                <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--mint)]/30 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[var(--mint)]/20 border-b border-[var(--mint)]/30">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Роль</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Тип</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">Доход/мес</th>
                      </tr>
                    </thead>
                    <tbody>
                      {featherInsight.roles.map((role, index) => (
                        <tr key={index} className="border-b border-[var(--mint)]/20 hover:bg-[var(--mint)]/10 transition-colors">
                          <td className="px-4 py-3 text-foreground">{role.role}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              role.type === 'бизнес'
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                : role.type === 'фриланс'
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                  : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            }`}>
                              {role.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-[var(--accent)]">{role.income}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Money opportunities - with visual hierarchy */}
            {featherInsight.money && featherInsight.money.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  💰 Что из этого принесёт МНОГО денег и ЛЕГКО
                </h3>
                <p className="text-sm text-[var(--muted)] mb-4">
                  Бизнес-идеи подобраны под твои сильные стороны. Где есть спрос, дефицит предложения, и тебе будет легко начать.
                </p>
                <div className="space-y-3">
                  {featherInsight.money.map((item, index) => {
                    // Visual hierarchy based on position
                    const scale = index === 0 ? 'text-xl' : index === 1 ? 'text-lg' : index === 2 ? 'text-base' : 'text-sm';
                    const opacity = index === 0 ? 'opacity-100' : index === 1 ? 'opacity-95' : index === 2 ? 'opacity-90' : 'opacity-85';
                    const padding = index === 0 ? 'p-6' : index === 1 ? 'p-5' : 'p-4';
                    const borderStyle = index === 0 ? 'border-2 border-[var(--accent)]' : 'border border-[var(--mint)]/30';

                    return (
                      <div
                        key={index}
                        className={`bg-[var(--card-bg)] ${padding} rounded-xl ${borderStyle} ${opacity}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`${scale} font-bold ${index === 0 ? 'text-[var(--accent)]' : 'text-foreground'}`}>
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[var(--muted)]">Вероятность успеха:</span>
                            <div className="w-20 h-2 bg-[var(--mint)]/20 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] rounded-full"
                                style={{ width: `${item.probability}%` }}
                              />
                            </div>
                            <span className="text-sm font-bold text-[var(--accent)]">{item.probability}%</span>
                          </div>
                        </div>
                        <p className={`${scale} text-foreground font-medium`}>{item.opportunity}</p>
                        {item.whyEasy && (
                          <p className="text-sm text-[var(--accent)] mt-2 flex items-start gap-2">
                            <span>✨</span>
                            <span>{item.whyEasy}</span>
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Celebrities with similar personality - with photos */}
            {featherInsight.celebrities && featherInsight.celebrities.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  ⭐ Знаменитости с похожим типом личности
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {featherInsight.celebrities.map((celebrity, index) => {
                    // Handle both old string format and new object format
                    const isObject = typeof celebrity === 'object' && celebrity !== null;
                    const name = isObject ? celebrity.name : (celebrity as string).split('—')[0]?.trim();
                    const description = isObject ? celebrity.description : (celebrity as string).split('—')[1]?.trim();
                    const wikiId = isObject ? celebrity.wikiId : null;

                    return (
                      <div
                        key={index}
                        className="bg-[var(--card-bg)] rounded-xl border border-[var(--mint)]/30 overflow-hidden"
                      >
                        {/* Celebrity photo from Wikipedia */}
                        {wikiId && (
                          <div className="aspect-square bg-[var(--mint)]/20 relative overflow-hidden">
                            <img
                              src={`https://en.wikipedia.org/wiki/Special:Redirect/file/${wikiId}.jpg`}
                              alt={name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Fallback: try without .jpg extension or use placeholder
                                const target = e.target as HTMLImageElement;
                                if (!target.src.includes('placeholder')) {
                                  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Celebrity')}&background=10b981&color=fff&size=200`;
                                }
                              }}
                            />
                          </div>
                        )}
                        <div className="p-4">
                          <h4 className="font-semibold text-foreground mb-1">{name}</h4>
                          {description && (
                            <p className="text-sm text-[var(--muted)]">{description}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Hobbies - renamed section */}
            {featherInsight.hobbies && featherInsight.hobbies.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  🎮 Бонус: развлечения (хобби) для души
                </h3>
                <p className="text-sm text-[var(--muted)] mb-4">
                  Занятия, которые скорее всего тебе понравятся
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  {featherInsight.hobbies.map((hobby, index) => (
                    <div
                      key={index}
                      className="bg-[var(--card-bg)] p-4 rounded-xl border border-[var(--mint)]/30"
                    >
                      <span className="text-foreground">{hobby}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Data Export Section - redesigned button */}
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

              {/* Redesigned prominent copy button */}
              <button
                onClick={handleCopyPrompt}
                className={`w-full max-w-md mx-auto flex items-center justify-center gap-3 px-8 py-5 rounded-2xl text-lg font-bold transition-all ${
                  copied
                    ? 'bg-green-500 text-white'
                    : 'bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] hover:from-[var(--accent-light)] hover:to-[var(--accent)] text-white shadow-xl shadow-[var(--accent)]/30 hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {copied ? (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    Скопировано!
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    Скопировать весь промпт для нейронки
                  </>
                )}
              </button>

              {/* Prompt Preview */}
              <div className="mt-6 text-left">
                <p className="text-sm text-[var(--muted)] mb-2">Что будет скопировано:</p>
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
          <div className="text-center space-y-6 py-6">
            <p className="text-[var(--muted)]">
              Надеюсь, было полезно!
            </p>
            <p className="text-[var(--muted)]">
              Мой контакт в телеграм: <a href="https://t.me/krechet_mike" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:text-[var(--accent-light)] font-medium">@krechet_mike</a>
            </p>

            {/* Donation button */}
            <div className="pt-4 border-t border-[var(--mint)]/30">
              <p className="text-[var(--muted)] mb-4">
                Если есть желание отблагодарить и было реально полезно:
              </p>
              <div className="flex justify-center">
                <iframe
                  src="https://yoomoney.ru/quickpay/fundraise/button?billNumber=1FB7C5Q525D.260117&"
                  width="330"
                  height="50"
                  frameBorder="0"
                  allowTransparency={true}
                  scrolling="no"
                  title="Donate"
                />
              </div>
            </div>
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
