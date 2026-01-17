'use client';

import { useState, useRef, useEffect } from 'react';

interface InputScreenProps {
  situations: { id: number; text: string }[];
  currentIndex: number;
  onSituationSave: (text: string, index: number) => void;
  onNavigate: (index: number) => void;
  onComplete: () => void;
  canComplete: boolean;
  onBack: () => void;
}

export default function InputScreen({
  situations,
  currentIndex,
  onSituationSave,
  onNavigate,
  onComplete,
  canComplete,
  onBack,
}: InputScreenProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load existing text when navigating to a situation
  useEffect(() => {
    const existingSituation = situations[currentIndex];
    if (existingSituation) {
      setText(existingSituation.text);
    } else {
      setText('');
    }
  }, [currentIndex, situations]);

  const handleSave = () => {
    if (text.trim().length < 10) return;
    onSituationSave(text.trim(), currentIndex);
    // Move to next situation
    onNavigate(currentIndex + 1);
    textareaRef.current?.focus();
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      // Save current if has content
      if (text.trim().length >= 10) {
        onSituationSave(text.trim(), currentIndex);
      }
      onNavigate(currentIndex - 1);
    }
  };

  const handleNext = () => {
    // Save current if has content
    if (text.trim().length >= 10) {
      onSituationSave(text.trim(), currentIndex);
    }
    onNavigate(currentIndex + 1);
  };

  const situationsDone = situations.filter(s => s.text.length >= 10).length;
  const isEditing = currentIndex < situations.length && situations[currentIndex]?.text.length >= 10;

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
          На главную
        </button>

        {/* Guidance text */}
        <div className="bg-[var(--mint)]/20 rounded-xl p-4 border border-[var(--accent)]/20">
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            <strong className="text-foreground">Какие выписывать ситуации:</strong> когда чувствуешь что это был провал:
            проект провалил, отношения испортил, кто-то обманул, что-то не получилось, травма —
            в общем везде где было больно.
          </p>
        </div>

        {/* Examples of situations */}
        <details className="bg-[var(--card-bg)] rounded-xl border border-[var(--mint)]/30 overflow-hidden">
          <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-[var(--accent)] hover:bg-[var(--mint)]/10 transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Примеры ситуаций (нажми, чтобы раскрыть)
          </summary>
          <div className="px-4 pb-4 space-y-3 text-sm text-[var(--muted)]">
            <div>
              <span className="font-medium text-foreground">💸 Деньги:</span>
              <ul className="mt-1 space-y-1 pl-4">
                <li>• Взял кредит на товар, который не продался. Платил год, пришлось продать машину</li>
                <li>• Получил крупную сумму в подарок, мог вложить — но спустил всё за пару месяцев</li>
                <li>• Одолжил другу деньги, он не вернул. Отношения испортились, денег нет</li>
              </ul>
            </div>
            <div>
              <span className="font-medium text-foreground">💼 Работа/бизнес:</span>
              <ul className="mt-1 space-y-1 pl-4">
                <li>• Запустил проект, не сделал бэкапы — потерял все данные клиентов</li>
                <li>• Не подготовился к важной презентации, провалился перед руководством</li>
                <li>• Уволился на эмоциях, потом полгода не мог найти работу</li>
              </ul>
            </div>
            <div>
              <span className="font-medium text-foreground">💔 Отношения:</span>
              <ul className="mt-1 space-y-1 pl-4">
                <li>• Поссорился с близким человеком из-за мелочи, не извинился — потерял друга</li>
                <li>• Игнорировал проблемы в отношениях, пока партнёр не ушёл</li>
                <li>• Пообещал помочь родителям и забыл — до сих пор стыдно</li>
              </ul>
            </div>
            <div>
              <span className="font-medium text-foreground">🎯 Другое:</span>
              <ul className="mt-1 space-y-1 pl-4">
                <li>• Откладывал поход к врачу, пока небольшая проблема не стала серьёзной</li>
                <li>• Не пошёл на собеседование мечты, потому что испугался</li>
                <li>• Доверился мошенникам, хотя интуиция говорила не делать этого</li>
              </ul>
            </div>
            <p className="text-xs italic pt-2 border-t border-[var(--mint)]/20">
              Пиши своими словами, как чувствуешь. Чем честнее — тем точнее анализ.
            </p>
          </div>
        </details>

        {/* Counter and Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-4 py-2 text-[var(--accent)] hover:bg-[var(--accent)]/10 disabled:text-[var(--muted)]/50 disabled:hover:bg-transparent rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Назад
          </button>

          <span className="text-lg font-semibold text-[var(--accent)]">
            {situationsDone} {situationsDone === 1 ? 'ситуация записана' : situationsDone < 5 ? 'ситуации записано' : 'ситуаций записано'}
          </span>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-4 py-2 text-[var(--accent)] hover:bg-[var(--accent)]/10 rounded-lg transition-colors"
          >
            Вперёд
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Main Input Area */}
        <div className="bg-[var(--card-bg)] rounded-2xl p-8 shadow-lg border border-[var(--mint)]/30">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold">
                {isEditing ? `Редактирование ситуации #${currentIndex + 1}` : `Ситуация #${currentIndex + 1}`}
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
            onClick={handleSave}
            disabled={text.trim().length < 10}
            className="w-full px-8 py-4 bg-[var(--card-bg)] border-2 border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)]/10 disabled:border-[var(--muted)]/30 disabled:text-[var(--muted)]/50 disabled:cursor-not-allowed font-semibold rounded-xl transition-all"
          >
            {isEditing ? 'Сохранить изменения →' : '+ Сохранить ситуацию →'}
          </button>

          {/* Go to analysis - clearly different, prominent when available */}
          {canComplete ? (
            <button
              onClick={onComplete}
              className="w-full px-8 py-5 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] hover:from-[var(--accent-light)] hover:to-[var(--accent)] text-white font-bold rounded-2xl text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-[var(--accent)]/30"
            >
              Перейти к анализу
            </button>
          ) : (
            <div className="text-center py-4 px-6 bg-[var(--mint)]/10 rounded-xl border border-dashed border-[var(--muted)]/30">
              <p className="text-sm text-[var(--muted)]">
                Добавьте минимум 2 ситуации, чтобы перейти к анализу
              </p>
            </div>
          )}
        </div>

        {/* Situations List */}
        {situations.length > 0 && (
          <div className="bg-[var(--card-bg)] rounded-xl p-4 border border-[var(--mint)]/30">
            <h3 className="text-sm font-semibold text-[var(--muted)] mb-3">Записанные ситуации:</h3>
            <div className="flex flex-wrap gap-2">
              {situations.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => onNavigate(i)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                    i === currentIndex
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-[var(--mint)]/20 text-[var(--accent)] hover:bg-[var(--mint)]/40'
                  }`}
                >
                  #{i + 1}
                </button>
              ))}
              {currentIndex >= situations.length && (
                <span className="px-3 py-1.5 rounded-lg text-sm bg-[var(--accent)]/20 text-[var(--accent)] border-2 border-dashed border-[var(--accent)]">
                  #{currentIndex + 1} (новая)
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
