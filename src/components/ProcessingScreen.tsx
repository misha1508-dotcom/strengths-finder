'use client';

interface ProcessingScreenProps {
  situationsCount: number;
}

export default function ProcessingScreen({ situationsCount }: ProcessingScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 fade-in">
      <div className="text-center space-y-8">
        {/* Animated loader */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-[var(--muted)]/20" />
          <div className="absolute top-0 left-0 w-24 h-24 rounded-full border-4 border-transparent border-t-[var(--accent)] animate-spin" />
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Анализируем ваши ситуации</h2>
          <p className="text-[var(--muted)]">
            Обрабатываем {situationsCount} {situationsCount === 1 ? 'ситуацию' : situationsCount < 5 ? 'ситуации' : 'ситуаций'}...
          </p>
        </div>

        {/* Fun facts while loading */}
        <div className="max-w-md mx-auto bg-[var(--card-bg)] rounded-xl p-6 border border-[var(--muted)]/20">
          <p className="text-sm text-[var(--muted)] italic">
            &ldquo;Каждое качество — это монета с двумя сторонами. То, что кажется слабостью,
            часто является замаскированной силой.&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
