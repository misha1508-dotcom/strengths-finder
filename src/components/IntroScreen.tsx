'use client';

interface IntroScreenProps {
  onStart: () => void;
}

// Инверсия Logo Component
function InversionLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background circle with gradient */}
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--accent)" />
          <stop offset="100%" stopColor="var(--accent-light)" />
        </linearGradient>
        <linearGradient id="arrowGradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="var(--accent)" />
        </linearGradient>
      </defs>

      {/* Outer ring */}
      <circle cx="60" cy="60" r="56" stroke="url(#logoGradient)" strokeWidth="3" fill="none" opacity="0.3"/>

      {/* Inner background */}
      <circle cx="60" cy="60" r="50" fill="var(--card-bg)" />

      {/* Rotating arrows showing transformation */}
      {/* Down arrow (red/negative) */}
      <path
        d="M60 25 L60 55 M50 45 L60 55 L70 45"
        stroke="#ef4444"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />

      {/* Up arrow (green/positive) */}
      <path
        d="M60 95 L60 65 M50 75 L60 65 L70 75"
        stroke="var(--accent)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Circular arrows showing inversion/rotation */}
      <path
        d="M30 60 A30 30 0 0 1 60 30"
        stroke="url(#arrowGradient)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M90 60 A30 30 0 0 1 60 90"
        stroke="url(#arrowGradient)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />

      {/* Arrow tips for circular motion */}
      <polygon points="58,30 60,24 66,32" fill="var(--accent)" />
      <polygon points="62,90 60,96 54,88" fill="#ef4444" />
    </svg>
  );
}

export default function IntroScreen({ onStart }: IntroScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 fade-in">
      <div className="max-w-2xl text-center space-y-8">
        {/* Logo and Header */}
        <div className="space-y-4">
          <div className="flex justify-center mb-4">
            <InversionLogo className="w-24 h-24 md:w-28 md:h-28" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold gradient-text">
            Инверсия
          </h1>
          <p className="text-lg text-[var(--muted)]">
            Преврати провалы в сильные стороны
          </p>
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
          Начать инверсию
        </button>
      </div>
    </div>
  );
}
