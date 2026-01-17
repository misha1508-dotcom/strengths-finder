'use client';

import { useEffect, useState, useCallback } from 'react';

interface ProcessingScreenProps {
  situationsCount: number;
  onComplete?: () => void;
}

const STAGES = [
  { id: 1, text: 'Подключаюсь к серверу...', duration: 0.05 },
  { id: 2, text: 'Отправка данных в ФСБ... шутка 😄', duration: 0.1 },
  { id: 3, text: 'Передаю ситуации на анализ...', duration: 0.15 },
  { id: 4, text: 'ИИ читает твои истории...', duration: 0.25 },
  { id: 5, text: 'Определяю проявленные качества...', duration: 0.45 },
  { id: 6, text: 'Нахожу позитивные дуалы...', duration: 0.65 },
  { id: 7, text: 'Считаю частоту качеств...', duration: 0.8 },
  { id: 8, text: 'Формирую результаты...', duration: 0.9 },
  { id: 9, text: 'Анализ готов! ✨', duration: 1.0 },
];

export default function ProcessingScreen({ situationsCount }: ProcessingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(STAGES[0]);
  const [startTime] = useState(Date.now());

  // Estimate based on situations count (more situations = longer analysis)
  const estimatedDuration = Math.max(8000, situationsCount * 2000); // min 8s, +2s per situation

  const updateProgress = useCallback(() => {
    const elapsed = Date.now() - startTime;
    const rawProgress = Math.min(elapsed / estimatedDuration, 0.95); // Cap at 95% until real completion

    // Find current stage
    const stage = STAGES.find(s => rawProgress <= s.duration) || STAGES[STAGES.length - 1];
    setCurrentStage(stage);
    setProgress(rawProgress * 100);
  }, [startTime, estimatedDuration]);

  useEffect(() => {
    const interval = setInterval(updateProgress, 100);
    return () => clearInterval(interval);
  }, [updateProgress]);

  // Calculate remaining time estimate
  const elapsed = Date.now() - startTime;
  const remaining = Math.max(0, Math.ceil((estimatedDuration - elapsed) / 1000));

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 fade-in">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Animated Icon */}
        <div className="relative">
          <div className="w-24 h-24 mx-auto rounded-full bg-[var(--mint)]/30 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-[var(--accent)] animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">
            Анализирую ситуации
          </h2>
          <p className="text-[var(--muted)]">
            {situationsCount} {situationsCount === 1 ? 'ситуация' : situationsCount < 5 ? 'ситуации' : 'ситуаций'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full space-y-3">
          <div className="h-3 bg-[var(--mint)]/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--muted)]">{Math.round(progress)}%</span>
            <span className="text-[var(--muted)]">~{remaining} сек</span>
          </div>
        </div>

        {/* Current Stage */}
        <div className="bg-[var(--card-bg)] rounded-xl p-4 border border-[var(--mint)]/30">
          <p className="text-foreground font-medium">{currentStage.text}</p>
        </div>

        {/* Stages List */}
        <div className="space-y-2 text-left">
          {STAGES.map((stage) => {
            const isComplete = progress / 100 > stage.duration;
            const isCurrent = currentStage.id === stage.id;

            return (
              <div
                key={stage.id}
                className={`flex items-center gap-3 text-sm transition-all duration-300 ${
                  isComplete
                    ? 'text-[var(--accent)]'
                    : isCurrent
                      ? 'text-foreground font-medium'
                      : 'text-[var(--muted)]/50'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                  isComplete
                    ? 'bg-[var(--accent)] text-white'
                    : isCurrent
                      ? 'bg-[var(--accent)]/20 text-[var(--accent)] animate-pulse'
                      : 'bg-[var(--muted)]/20'
                }`}>
                  {isComplete ? '✓' : stage.id}
                </div>
                <span>{stage.text.replace(' 😄', '').replace(' ✨', '')}</span>
              </div>
            );
          })}
        </div>

        {/* Info */}
        <p className="text-xs text-[var(--muted)] italic">
          Чем больше ситуаций, тем точнее анализ. Подожди немного...
        </p>
      </div>
    </div>
  );
}
