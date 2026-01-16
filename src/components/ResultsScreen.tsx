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

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      emotional: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
      behavioral: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      cognitive: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      willpower: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

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
                  {showFeathers && (
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      Пёрышки
                    </th>
                  )}
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
                          {expandedSituation === situation.id ? 'Скрыть' : 'Показать полностью'}
                        </button>
                        {expandedSituation === situation.id && (
                          <p className="text-xs text-[var(--muted)] mt-2 p-3 bg-background rounded-lg">
                            {situation.text}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Qualities Column */}
                    <td className="px-6 py-4 align-top">
                      <div className="flex flex-wrap gap-2">
                        {situation.analysis?.qualities.map((quality, qIndex) => (
                          <span
                            key={qIndex}
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(quality.category)}`}
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
                              <span className="text-[var(--muted)] line-through">{dual.quality}</span>
                              <span className="text-[var(--accent)]">→</span>
                              <span className="text-foreground font-medium">{dual.positive}</span>
                            </div>
                            <p className="text-xs text-[var(--muted)] mt-1">{dual.explanation}</p>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Feathers Column */}
                    {showFeathers && (
                      <td className="px-6 py-4 align-top">
                        <div className="text-sm text-[var(--muted)]">
                          {featherInsight.feathers[index] || '—'}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quality Ratings */}
        <div className="bg-[var(--card-bg)] rounded-2xl p-6 shadow-lg border border-[var(--mint)]/30">
          <h2 className="text-xl font-semibold mb-4">Рейтинг качеств по повторяемости</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {qualityRatings.slice(0, 9).map((rating, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-[var(--mint)]/10 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-[var(--accent)]">#{index + 1}</span>
                  <div>
                    <p className="font-medium text-foreground">{rating.quality}</p>
                    <p className="text-xs text-[var(--muted)]">{getCategoryLabel(rating.category)}</p>
                  </div>
                </div>
                <span className="text-lg font-semibold text-[var(--accent)]">×{rating.count}</span>
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
            <p className="text-[var(--muted)] mb-4">
              Маленькие действия, которые помогут сбалансировать негативные проявления качеств:
            </p>
            <ul className="space-y-3">
              {featherInsight.feathers.map((feather, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-[var(--accent)] mt-1">•</span>
                  <span className="text-foreground">{feather}</span>
                </li>
              ))}
            </ul>

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

        {/* Activities */}
        {showActivities && featherInsight.activities.length > 0 && (
          <div className="bg-gradient-to-br from-[var(--mint)]/20 to-[var(--accent)]/10 rounded-2xl p-6 shadow-lg border border-[var(--accent)]/30">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">✨</span>
              <h2 className="text-xl font-semibold">Чем тебе понравится заниматься</h2>
            </div>
            <p className="text-[var(--muted)] mb-4">
              Учитывая твои качества, сильные и слабые стороны:
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {featherInsight.activities.map((activity, index) => (
                <div
                  key={index}
                  className="bg-[var(--card-bg)] p-4 rounded-xl border border-[var(--mint)]/30"
                >
                  <span className="text-foreground">{activity}</span>
                </div>
              ))}
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
