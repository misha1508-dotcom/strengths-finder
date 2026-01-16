'use client';

import { useState } from 'react';
import { Situation, FeatherInsight } from '@/types';

interface ResultsScreenProps {
  situations: Situation[];
  featherInsight: FeatherInsight;
  onRestart: () => void;
}

export default function ResultsScreen({
  situations,
  featherInsight,
  onRestart,
}: ResultsScreenProps) {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  return (
    <div className="min-h-screen px-6 py-12 fade-in">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Ваши скрытые силы</h1>
          <p className="text-[var(--muted)] text-lg">
            Каждая &ldquo;слабость&rdquo; — это замаскированная сила
          </p>
        </div>

        {/* Situation Cards */}
        <div className="space-y-4">
          {situations.map((situation, index) => (
            <div
              key={situation.id}
              className="bg-[var(--card-bg)] rounded-2xl border border-[var(--muted)]/20 overflow-hidden card-reveal"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <button
                onClick={() => setExpandedCard(expandedCard === index ? null : index)}
                className="w-full p-6 text-left hover:bg-[var(--muted)]/5 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)] font-semibold">
                      {situation.id}
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-medium">
                        {situation.analysis?.shortDescription || 'Ситуация'}
                      </h3>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-red-500/80">
                          {situation.analysis?.negativeQuality}
                        </span>
                        <span className="text-[var(--muted)]">→</span>
                        <span className="text-green-500">
                          {situation.analysis?.positiveQuality}
                        </span>
                      </div>
                    </div>
                  </div>
                  <svg
                    className={`w-5 h-5 text-[var(--muted)] transition-transform ${
                      expandedCard === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>

              {expandedCard === index && situation.analysis && (
                <div className="px-6 pb-6 space-y-4 border-t border-[var(--muted)]/10 pt-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-[var(--muted)]">
                      Ваше описание
                    </h4>
                    <p className="text-sm bg-[var(--muted)]/10 rounded-lg p-3">
                      {situation.text}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-red-500/80">
                        Как это выглядит
                      </h4>
                      <p className="text-sm p-3 bg-red-500/10 rounded-lg">
                        {situation.analysis.negativeQuality}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-green-500">
                        Позитивный дуал
                      </h4>
                      <p className="text-sm p-3 bg-green-500/10 rounded-lg">
                        {situation.analysis.positiveQuality}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-[var(--accent)]">
                      Объяснение
                    </h4>
                    <p className="text-sm text-[var(--muted)]">
                      {situation.analysis.explanation}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Feather Section */}
        <div className="bg-gradient-to-br from-[var(--accent)]/10 to-[var(--accent-light)]/10 rounded-3xl p-8 border border-[var(--accent)]/20">
          <div className="text-center space-y-6">
            {/* Feather Icon */}
            <div className="text-6xl">
              🪶
            </div>

            <h2 className="text-2xl font-bold">Ваше пёрышко</h2>

            <p className="text-[var(--muted)] max-w-2xl mx-auto leading-relaxed">
              Как маленькое перо может удержать тяжёлую конструкцию при правильном расположении,
              так и небольшие ежедневные действия могут изменить всё.
            </p>

            <div className="space-y-6 text-left max-w-2xl mx-auto">
              {/* Summary */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Общий вывод</h3>
                <p className="text-[var(--muted)]">{featherInsight.summary}</p>
              </div>

              {/* Micro-habits */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Микро-привычки для вас</h3>
                <ul className="space-y-2">
                  {featherInsight.microHabits.map((habit, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-[var(--muted)]"
                    >
                      <span className="text-[var(--accent)] mt-1">•</span>
                      <span>{habit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Suitable Roles */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Подходящие роли и профессии</h3>
                <div className="flex flex-wrap gap-2">
                  {featherInsight.suitableRoles.map((role, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-[var(--accent)]/20 rounded-full text-sm"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              {/* Final Message */}
              <div className="pt-4 border-t border-[var(--muted)]/20">
                <p className="text-center italic text-lg">
                  &ldquo;{featherInsight.finalMessage}&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Restart Button */}
        <div className="text-center space-y-4">
          <button
            onClick={onRestart}
            className="px-8 py-3 bg-[var(--muted)]/20 hover:bg-[var(--muted)]/30 font-medium rounded-full transition-all"
          >
            Начать заново
          </button>
          <p className="text-sm text-[var(--muted)]">
            Ваши данные не сохраняются — всё остаётся только у вас
          </p>
        </div>
      </div>
    </div>
  );
}
