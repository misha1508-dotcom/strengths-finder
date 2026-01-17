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
        </div>

        {/* Pareto Principle Explanation */}
        <div className="bg-[var(--card-bg)] rounded-2xl p-8 shadow-lg border border-[var(--mint)]/30">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-center text-[var(--accent-dark)]">
              Принцип Парето в действии
            </h2>

            <p className="text-[var(--muted)] leading-relaxed text-left">
              Известно, что <strong className="text-foreground">20% усилий дают 80% результата</strong>.
            </p>

            <p className="text-[var(--muted)] leading-relaxed text-left">
              Но если применить этот принцип ещё раз — к этим же 20%?
            </p>

            <div className="space-y-3 text-left">
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
            </div>

            <div className="bg-[var(--mint)]/30 rounded-xl p-5 border border-[var(--accent)]/30">
              <p className="text-foreground font-semibold text-center text-lg">
                Это упражнение — и есть те самые 4% действий, которые дадут тебе 64% понимания себя.
              </p>
            </div>

            <div className="flex items-center justify-center gap-6 pt-2">
              <div className="text-6xl font-bold text-[var(--accent)]">4%</div>
              <div className="text-4xl text-[var(--mint-dark)]">→</div>
              <div className="text-6xl font-bold text-[var(--accent-light)]">64%</div>
            </div>
          </div>
        </div>

        {/* Important Instructions */}
        <div className="bg-[var(--mint)]/20 rounded-2xl p-6 border border-[var(--accent)]/20 text-left">
          <h3 className="text-lg font-semibold text-foreground mb-4 text-center">
            Важно для точного анализа
          </h3>
          <p className="text-[var(--muted)] leading-relaxed">
            Пиши про ситуации, где чувствуешь провал: потерял деньги, испортил отношения,
            упустил возможность, кто-то обманул, что-то не получилось. На странице ввода будут примеры.
            Пиши так, как будто жалуешься близкому другу — можно ныть, злиться, сожалеть.
            Чем честнее опишешь — тем точнее анализ.
          </p>
          <p className="text-[var(--muted)] leading-relaxed mt-3">
            <strong className="text-foreground">Конфиденциальность:</strong> Твои данные обрабатываются
            только ИИ Anthropic. Никакой человек не имеет к ним доступа. Это полностью безопасно.
          </p>
        </div>

        {/* How it works */}
        <div className="space-y-4 text-left">
          <h3 className="text-lg font-semibold text-center">Как это работает</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-[var(--card-bg)] rounded-xl p-5 border border-[var(--mint)]/30">
              <div className="text-2xl font-bold text-[var(--accent)] mb-2">1</div>
              <p className="text-sm text-[var(--muted)]">
                Вспомни и запиши несколько провальных ситуаций из жизни. Минимум 2, оптимально 5-10
              </p>
            </div>
            <div className="bg-[var(--card-bg)] rounded-xl p-5 border border-[var(--mint)]/30">
              <div className="text-2xl font-bold text-[var(--accent)] mb-2">2</div>
              <p className="text-sm text-[var(--muted)]">
                ИИ найдёт скрытые качества в каждой ситуации
              </p>
            </div>
            <div className="bg-[var(--card-bg)] rounded-xl p-5 border border-[var(--mint)]/30">
              <div className="text-2xl font-bold text-[var(--accent)] mb-2">3</div>
              <p className="text-sm text-[var(--muted)]">
                Увидишь реальные сильные стороны
              </p>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={onStart}
          className="w-full md:w-auto px-12 py-4 bg-[var(--accent)] hover:bg-[var(--accent-light)] text-white font-semibold rounded-full text-lg transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[var(--accent)]/30"
        >
          Начать упражнение
        </button>
      </div>
    </div>
  );
}
