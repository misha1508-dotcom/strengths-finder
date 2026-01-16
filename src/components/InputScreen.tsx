'use client';

import { useState, useEffect, useRef } from 'react';

interface InputScreenProps {
  currentSituation: number;
  totalSituations: number;
  onSituationAdd: (text: string) => void;
  onComplete: () => void;
  canComplete: boolean;
}

export default function InputScreen({
  currentSituation,
  totalSituations,
  onSituationAdd,
  onComplete,
  canComplete,
}: InputScreenProps) {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [speechSupported, setSpeechSupported] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Check if Web Speech API is supported
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'ru-RU';

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognitionRef.current.onresult = (event: any) => {
          let transcript = '';
          for (let i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setText(transcript);
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          stopRecording();
        };

        recognitionRef.current.onend = () => {
          if (isRecording) {
            // Restart if still recording
            try {
              recognitionRef.current?.start();
            } catch {
              // Ignore errors on restart
            }
          }
        };
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore errors on cleanup
        }
      }
    };
  }, [isRecording]);

  const startRecording = () => {
    if (!recognitionRef.current) return;

    setText('');
    setIsRecording(true);
    setTimeLeft(60);

    try {
      recognitionRef.current.start();
    } catch {
      // Recognition might already be started
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stopRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore errors on stop
      }
    }
  };

  const handleSubmit = () => {
    if (text.trim().length < 10) return;
    onSituationAdd(text.trim());
    setText('');
    setTimeLeft(60);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      handleSubmit();
    }
  };

  const situationsDone = currentSituation - 1;
  const progressPercent = (situationsDone / totalSituations) * 100;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 fade-in">
      <div className="w-full max-w-2xl space-y-8">
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
          <div className="h-2 bg-[var(--muted)]/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--accent)] rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Main Input Area */}
        <div className="bg-[var(--card-bg)] rounded-2xl p-8 shadow-lg border border-[var(--muted)]/20">
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
              placeholder="Начните писать или нажмите на микрофон..."
              className="w-full h-40 p-4 bg-background border border-[var(--muted)]/30 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 text-foreground placeholder-[var(--muted)]"
              disabled={isRecording}
            />

            {/* Voice Recording */}
            <div className="flex items-center justify-center gap-4">
              {speechSupported && (
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`flex items-center gap-3 px-6 py-3 rounded-full font-medium transition-all ${
                    isRecording
                      ? 'bg-red-500 text-white recording-pulse'
                      : 'bg-[var(--muted)]/20 hover:bg-[var(--muted)]/30 text-foreground'
                  }`}
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5z" />
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                  </svg>
                  {isRecording ? `Запись... ${timeLeft}с` : 'Записать голосом'}
                </button>
              )}
            </div>

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
            className="px-8 py-3 bg-[var(--accent)] hover:bg-[var(--accent-light)] disabled:bg-[var(--muted)]/30 disabled:cursor-not-allowed text-white font-semibold rounded-full transition-all hover:scale-105 active:scale-95 disabled:hover:scale-100"
          >
            {currentSituation > totalSituations
              ? 'Максимум ситуаций'
              : `Сохранить ситуацию ${currentSituation}`}
          </button>

          {canComplete && (
            <button
              onClick={onComplete}
              className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-full transition-all hover:scale-105 active:scale-95"
            >
              Вскрыть покровы
            </button>
          )}
        </div>

        {!canComplete && (
          <p className="text-center text-sm text-[var(--muted)]">
            Добавьте минимум 5 ситуаций, чтобы получить результат
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

