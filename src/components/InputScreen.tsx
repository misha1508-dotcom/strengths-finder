'use client';

import { useState, useRef } from 'react';

interface InputScreenProps {
  currentSituation: number;
  totalSituations: number;
  onSituationAdd: (text: string) => void;
  onComplete: () => void;
  canComplete: boolean;
  onBack: () => void;
}

export default function InputScreen({
  currentSituation,
  totalSituations,
  onSituationAdd,
  onComplete,
  canComplete,
  onBack,
}: InputScreenProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (text.trim().length < 10) return;
    onSituationAdd(text.trim());
    setText('');
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      handleSubmit();
    }
  };

  const situationsDone = currentSituation - 1;
  const progressPercent = (situationsDone / totalSituations) * 100;
  const canSkipToEnd = situationsDone >= 2;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 fade-in">
      <div className="w-full max-w-2xl space-y-8">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[var(--muted)] hover:text-foreground transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Назад
        </button>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-[var(--muted)]">
              Ситуация {currentSituation > totalSituations ? totalSituations : currentSituation} из {totalSituations}
            </span>
            <span className="text-sm text-[var(--muted)]">
              {situationsDone} записано
            </span>
          </div>
          <div className="h-2 bg-[var(--mint)]/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--accent)] rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Main Input Area */}
        <div className="bg-[var(--card-bg)] rounded-2xl p-8 shadow-lg border border-[var(--mint)]/30">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold">
                Опишите ситуацию
              </h2>
              <p className="text-[var(--muted)]">
                Вспомните момент, когда что-то пошло не так. Что произошло? Кто участвовал? Что вы чувствовали?
              </p>
            </div>

            {/* Text Input */}
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Начните писать..."
              className="w-full h-40 p-4 bg-background border border-[var(--mint)]/30 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 text-foreground placeholder-[var(--muted)]"
            />

            {/* Hint */}
            <p className="text-sm text-center text-[var(--muted)] italic">
              Рассказывай, как будто жалуешься маме, папе, подруге или другу. Можно ныть.
            </p>

            {/* Character count */}
            <div className="text-right text-sm text-[var(--muted)]">
              {text.length} символов {text.length < 10 && text.length > 0 && '(минимум 10)'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleSubmit}
            disabled={text.trim().length < 10 || currentSituation > totalSituations}
            className="px-8 py-3 bg-[var(--accent)] hover:bg-[var(--accent-light)] disabled:bg-[var(--muted)]/30 disabled:cursor-not-allowed text-white font-semibold rounded-full transition-all hover:scale-105 active:scale-95 disabled:hover:scale-100 shadow-lg shadow-[var(--accent)]/20"
          >
            {currentSituation > totalSituations
              ? 'Максимум ситуаций'
              : `Сохранить ситуацию ${currentSituation}`}
          </button>

          {canSkipToEnd && (
            <button
              onClick={onComplete}
              className="px-8 py-3 bg-[var(--card-bg)] border-2 border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white font-semibold rounded-full transition-all hover:scale-105 active:scale-95"
            >
              Перейти к анализу →
            </button>
          )}
        </div>

        {!canSkipToEnd && (
          <p className="text-center text-sm text-[var(--muted)]">
            Добавьте минимум 2 ситуации, чтобы перейти к анализу
          </p>
        )}

        {/* Hint */}
        <div className="text-center text-sm text-[var(--muted)] space-y-1">
          <p>Cmd/Ctrl + Enter — быстрое сохранение</p>
        </div>
      </div>
    </div>
  );
}
