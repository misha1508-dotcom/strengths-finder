'use client';

interface IntroScreenProps {
  onStart: () => void;
}

export default function IntroScreen({ onStart }: IntroScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 fade-in">
      <div className="max-w-2xl text-center space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Найди свои сильные стороны
          </h1>
          <p className="text-xl text-[var(--muted)]">
            Психологическое упражнение для глубокого самопознания
          </p>
        </div>

        {/* Pareto Principle Explanation */}
        <div className="bg-[var(--card-bg)] rounded-2xl p-8 shadow-lg border border-[var(--muted)]/20">
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-4">
              <div className="text-5xl font-bold text-[var(--accent)]">4%</div>
              <div className="text-3xl text-[var(--muted)]">→</div>
              <div className="text-5xl font-bold text-[var(--accent-light)]">64%</div>
            </div>

            <div className="space-y-4 text-left">
              <h2 className="text-xl font-semibold text-center">Принцип Парето в действии</h2>
              <p className="text-[var(--muted)] leading-relaxed">
                20% усилий дают 80% результата. Но если применить этот принцип дважды:
              </p>
              <ul className="space-y-2 text-[var(--muted)]">
                <li className="flex items-start gap-2">
                  <span className="text-[var(--accent)] font-medium">•</span>
                  <span>20% от 20% = <strong className="text-foreground">4% действий</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--accent)] font-medium">•</span>
                  <span>80% от 80% = <strong className="text-foreground">64% результата</strong></span>
                </li>
              </ul>
              <p className="text-[var(--muted)] leading-relaxed">
                Это упражнение — те самые 4%, которые могут изменить 64% вашего понимания себя.
              </p>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="space-y-4 text-left">
          <h3 className="text-lg font-semibold text-center">Как это работает</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-[var(--card-bg)] rounded-xl p-5 border border-[var(--muted)]/20">
              <div className="text-2xl font-bold text-[var(--accent)] mb-2">1</div>
              <p className="text-sm text-[var(--muted)]">
                Расскажите о 5-10 ситуациях, где что-то пошло не так
              </p>
            </div>
            <div className="bg-[var(--card-bg)] rounded-xl p-5 border border-[var(--muted)]/20">
              <div className="text-2xl font-bold text-[var(--accent)] mb-2">2</div>
              <p className="text-sm text-[var(--muted)]">
                ИИ найдёт скрытые качества в каждой ситуации
              </p>
            </div>
            <div className="bg-[var(--card-bg)] rounded-xl p-5 border border-[var(--muted)]/20">
              <div className="text-2xl font-bold text-[var(--accent)] mb-2">3</div>
              <p className="text-sm text-[var(--muted)]">
                Увидите позитивную сторону каждого качества
              </p>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={onStart}
          className="w-full md:w-auto px-12 py-4 bg-[var(--accent)] hover:bg-[var(--accent-light)] text-white font-semibold rounded-full text-lg transition-all hover:scale-105 active:scale-95"
        >
          Начать упражнение
        </button>

        <p className="text-sm text-[var(--muted)]">
          Можно писать или диктовать голосом
        </p>
      </div>
    </div>
  );
}
