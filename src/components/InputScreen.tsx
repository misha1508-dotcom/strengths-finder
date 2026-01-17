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

  const situationsDone = currentSituation - 1;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 fade-in">
      <div className="w-full max-w-2xl space-y-6">
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

        {/* Guidance text */}
        <div className="bg-[var(--mint)]/20 rounded-xl p-4 border border-[var(--accent)]/20">
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            <strong className="text-foreground">Какие выписывать ситуации:</strong> когда чувствуешь что это был провал:
            проект провалил, отношения испортил, кто-то обманул, что-то не получилось, травма —
            в общем везде где было больно.
          </p>
        </div>

        {/* Counter */}
        <div className="text-center">
          <span className="text-lg font-semibold text-[var(--accent)]">
            {situationsDone} {situationsDone === 1 ? 'ситуация записана' : situationsDone < 5 ? 'ситуации записано' : 'ситуаций записано'}
          </span>
        </div>

        {/* Main Input Area */}
        <div className="bg-[var(--card-bg)] rounded-2xl p-8 shadow-lg border border-[var(--mint)]/30">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold">
                Опишите ситуацию #{currentSituation}
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
        <div className="flex flex-col gap-4">
          {/* Save button - primary action */}
          <button
            onClick={handleSubmit}
            disabled={text.trim().length < 10}
            className="w-full px-8 py-4 bg-[var(--card-bg)] border-2 border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)]/10 disabled:border-[var(--muted)]/30 disabled:text-[var(--muted)]/50 disabled:cursor-not-allowed font-semibold rounded-xl transition-all"
          >
            + Сохранить и добавить ещё ситуацию
          </button>

          {/* Go to analysis - clearly different, prominent when available */}
          {canComplete ? (
            <button
              onClick={onComplete}
              className="w-full px-8 py-5 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] hover:from-[var(--accent-light)] hover:to-[var(--accent)] text-white font-bold rounded-2xl text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-[var(--accent)]/30"
            >
              🚀 Перейти к анализу →
            </button>
          ) : (
            <div className="text-center py-4 px-6 bg-[var(--mint)]/10 rounded-xl border border-dashed border-[var(--muted)]/30">
              <p className="text-sm text-[var(--muted)]">
                Добавьте минимум 2 ситуации, чтобы перейти к анализу
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
